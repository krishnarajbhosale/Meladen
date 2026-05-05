package com.meladen.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * When nginx (or similar) uses {@code proxy_pass .../} and strips the {@code /api} prefix, Spring
 * sees {@code /public/...} and {@code /admin/...} while controllers are mapped under {@code /api/...}.
 * This filter rewrites the servlet path so routing, security, and JWT checks all align.
 */
public class ApiPathNormalizationFilter extends OncePerRequestFilter {

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

    String ctx = request.getContextPath() == null ? "" : request.getContextPath();
    String uri = request.getRequestURI();
    if (!uri.startsWith(ctx)) {
      filterChain.doFilter(request, response);
      return;
    }
    String pathInContext = uri.substring(ctx.length());
    if (pathInContext.isEmpty()) {
      pathInContext = "/";
    }

    boolean stripNeedsApiPrefix =
        "/public".equals(pathInContext)
            || pathInContext.startsWith("/public/")
            || "/admin".equals(pathInContext)
            || pathInContext.startsWith("/admin/")
            || "/auth".equals(pathInContext)
            || pathInContext.startsWith("/auth/");

    if (pathInContext.startsWith("/api/") || !stripNeedsApiPrefix) {
      filterChain.doFilter(request, response);
      return;
    }

    String fixedPathInContext = "/api" + pathInContext;
    String fixedUri = ctx + fixedPathInContext;

    filterChain.doFilter(new FixedPathRequest(request, fixedUri, fixedPathInContext), response);
  }

  private static final class FixedPathRequest extends HttpServletRequestWrapper {
    private final String requestUri;
    private final String servletPath;

    FixedPathRequest(HttpServletRequest delegate, String requestUri, String servletPath) {
      super(delegate);
      this.requestUri = requestUri;
      this.servletPath = servletPath;
    }

    @Override
    public String getRequestURI() {
      return requestUri;
    }

    @Override
    public String getServletPath() {
      return servletPath;
    }

    @Override
    public String getPathInfo() {
      return null;
    }
  }
}
