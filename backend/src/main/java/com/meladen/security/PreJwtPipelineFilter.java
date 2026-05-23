package com.meladen.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Runs:
 * 1. ApiPathNormalizationFilter
 * 2. AuthorizationHeaderBridgeFilter
 *
 * BEFORE JwtAuthFilter
 */
public class PreJwtPipelineFilter extends OncePerRequestFilter {

  private final ApiPathNormalizationFilter pathNormalization = new ApiPathNormalizationFilter();
  private final AuthorizationHeaderBridgeFilter authorizationBridge = new AuthorizationHeaderBridgeFilter();

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain)
      throws ServletException, IOException {

    pathNormalization.doFilter(
        request,
        response,
        (req, res) -> authorizationBridge.doFilter(req, res, filterChain));
  }
}