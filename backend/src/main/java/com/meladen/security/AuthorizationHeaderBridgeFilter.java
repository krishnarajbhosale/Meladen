package com.meladen.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Some reverse proxies drop the standard {@code Authorization} header on the upstream request. Browsers
 * still send it to nginx; forward it with:
 *
 * <pre>
 * proxy_set_header X-Meladen-Authorization $http_authorization;
 * </pre>
 *
 * This filter exposes that value as {@code Authorization} for Spring Security / JWT.
 */
public class AuthorizationHeaderBridgeFilter extends OncePerRequestFilter {

  private static final String ALT_HEADER = "X-Meladen-Authorization";

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

    String existing = request.getHeader("Authorization");
    if (existing != null && !existing.isBlank()) {
      filterChain.doFilter(request, response);
      return;
    }

    String alt = request.getHeader(ALT_HEADER);
    if (alt == null || alt.isBlank()) {
      filterChain.doFilter(request, response);
      return;
    }

    String bearer = alt.regionMatches(true, 0, "Bearer ", 0, 7) ? alt.trim() : "Bearer " + alt.trim();
    filterChain.doFilter(new WithAuthorizationHeader(request, bearer), response);
  }

  private static final class WithAuthorizationHeader extends HttpServletRequestWrapper {
    private final String authorization;

    WithAuthorizationHeader(HttpServletRequest delegate, String authorization) {
      super(delegate);
      this.authorization = authorization;
    }

    @Override
    public String getHeader(String name) {
      if ("Authorization".equalsIgnoreCase(name)) {
        return authorization;
      }
      return super.getHeader(name);
    }
  }
}
