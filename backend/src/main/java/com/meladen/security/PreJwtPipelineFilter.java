package com.meladen.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Runs {@link ApiPathNormalizationFilter} then {@link AuthorizationHeaderBridgeFilter} in a fixed
 * order before {@link JwtAuthFilter}. Avoids {@link org.springframework.web.filter.CompositeFilter}
 * constructor differences across Spring versions.
 */
public class PreJwtPipelineFilter extends OncePerRequestFilter {

  private final ApiPathNormalizationFilter pathNormalization = new ApiPathNormalizationFilter();
  private final AuthorizationHeaderBridgeFilter authorizationBridge =
      new AuthorizationHeaderBridgeFilter();

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    pathNormalization.doFilter(
        request, response, (req, res) -> authorizationBridge.doFilter(req, res, filterChain));
  }
}
