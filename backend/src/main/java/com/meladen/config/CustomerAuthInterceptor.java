package com.meladen.config;

import com.meladen.repository.CustomerRepository;
import com.meladen.service.CustomerAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class CustomerAuthInterceptor implements HandlerInterceptor {

  private final CustomerAuthService customerAuthService;
  private final CustomerRepository customerRepository;

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
      throws Exception {

    if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
      return true;
    }

    String path = pathWithinContext(request);
    String method = request.getMethod();

    if (!requiresCustomerBearer(method, path)) {
      return true;
    }

    String auth = request.getHeader("Authorization");
    if (auth == null || !auth.startsWith("Bearer ")) {
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      return false;
    }

    String token = auth.substring(7).trim();
    if (!customerAuthService.isValidToken(token)) {
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      return false;
    }

    Long customerId = customerAuthService.getCustomerIdForToken(token);
    request.setAttribute("customerId", customerId);
    customerRepository
        .findById(customerId)
        .ifPresent(c -> request.setAttribute("customerEmail", c.getEmail()));

    return true;
  }

  private static String pathWithinContext(HttpServletRequest request) {
    String uri = request.getRequestURI();
    String ctx = request.getContextPath() == null ? "" : request.getContextPath();
    if (!ctx.isEmpty() && uri.startsWith(ctx)) {
      uri = uri.substring(ctx.length());
    }
    if (uri.isEmpty()) {
      return "/";
    }
    return uri;
  }

  /**
   * Customer JWT is required only for these routes — never for {@code /api/admin} (admin uses a
   * different JWT via {@link com.meladen.security.JwtAuthFilter}).
   *
   * <p>Also matches proxy-stripped paths ({@code /public/orders/me}, etc.) when normalization is
   * not applied.
   */
  private static boolean requiresCustomerBearer(String method, String path) {
    if ("GET".equals(method)) {
      if (path.equals("/api/public/orders/me")
          || path.equals("/api/public/orders/me/")
          || path.equals("/public/orders/me")
          || path.equals("/public/orders/me/")) {
        return true;
      }
      if (isCustomerOrderDetailPath(path)) {
        return true;
      }
      if (path.equals("/api/wallet/me")
          || path.equals("/api/wallet/me/")
          || path.equals("/wallet/me")
          || path.equals("/wallet/me/")) {
        return true;
      }
    }
    if ("POST".equals(method)) {
      if (path.equals("/api/public/orders")
          || path.equals("/api/public/orders/")
          || path.equals("/public/orders")
          || path.equals("/public/orders/")) {
        return true;
      }
      if (isCustomerOrderPaymentPath(path)) {
        return true;
      }
    }
    return false;
  }

  /** GET /api/public/orders/{uuid} — not /me */
  private static boolean isCustomerOrderDetailPath(String path) {
    if (path.startsWith("/api/public/orders/")) {
      String rest = path.substring("/api/public/orders/".length()).replaceAll("/$", "");
      return !rest.isEmpty() && !rest.equals("me") && !rest.contains("/");
    }
    if (path.startsWith("/public/orders/")) {
      String rest = path.substring("/public/orders/".length()).replaceAll("/$", "");
      return !rest.isEmpty() && !rest.equals("me") && !rest.contains("/");
    }
    return false;
  }

  private static boolean isCustomerOrderPaymentPath(String path) {
    return path.matches("/api/public/orders/[^/]+/razorpay-checkout/?")
      || path.matches("/api/public/orders/[^/]+/verify-payment/?")
      || path.matches("/api/public/orders/[^/]+/complete-wallet/?")
      || path.matches("/public/orders/[^/]+/razorpay-checkout/?")
      || path.matches("/public/orders/[^/]+/verify-payment/?")
      || path.matches("/public/orders/[^/]+/complete-wallet/?");
  }
}