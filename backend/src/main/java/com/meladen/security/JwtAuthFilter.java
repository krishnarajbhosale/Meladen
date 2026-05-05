package com.meladen.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

  private final JwtService jwtService;

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain)
      throws ServletException, IOException {

    if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
      filterChain.doFilter(request, response);
      return;
    }

    String path = servletRelativePath(request);

    // Admin APIs (support nginx/proxy that strips /api so backend sees /admin/... instead of /api/admin/...)
    if (!isAdminApiPath(path)) {
      filterChain.doFilter(request, response);
      return;
    }

    String header = request.getHeader(HttpHeaders.AUTHORIZATION);

    if (header == null || !header.regionMatches(true, 0, "Bearer ", 0, 7)) {
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      return;
    }

    String token = header.substring(7).trim();
    if (token.isEmpty()) {
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      return;
    }

    try {
      if (!jwtService.isTokenValid(token)) {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        return;
      }

      String email = jwtService.extractSubject(token);

      var auth = new UsernamePasswordAuthenticationToken(
          email,
          null,
          List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));

      auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
      SecurityContextHolder.getContext().setAuthentication(auth);

    } catch (Exception e) {
      SecurityContextHolder.clearContext();
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      return;
    }

    filterChain.doFilter(request, response);
  }

  /** Path inside the servlet context (no context-path prefix). */
  private static String servletRelativePath(HttpServletRequest request) {
    String uri = request.getRequestURI();
    String ctx = request.getContextPath();
    if (ctx != null && !ctx.isEmpty() && uri.startsWith(ctx)) {
      uri = uri.substring(ctx.length());
    }
    if (uri.isEmpty()) {
      return "/";
    }
    return uri;
  }

  private static boolean isAdminApiPath(String path) {
    return path.startsWith("/api/admin/")
        || "/api/admin".equals(path)
        || path.startsWith("/admin/")
        || "/admin".equals(path);
  }
}