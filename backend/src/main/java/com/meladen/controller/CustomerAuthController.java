package com.meladen.controller;

import com.meladen.service.CustomerAuthService;
import com.meladen.service.OrderMailService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class CustomerAuthController {

  private static final Logger log = LoggerFactory.getLogger(CustomerAuthController.class);

  private final CustomerAuthService customerAuthService;
  private final OrderMailService orderMailService;

  @Value("${meladen.auth.expose-dev-otp:true}")
  private boolean exposeDevOtp;

  public static class RequestOtpDto {
    @NotBlank @Email private String email;

    public String getEmail() {
      return email;
    }

    public void setEmail(String email) {
      this.email = email;
    }
  }

  public static class VerifyOtpDto {
    @NotBlank @Email private String email;
    @NotBlank private String otp;

    public String getEmail() {
      return email;
    }

    public void setEmail(String email) {
      this.email = email;
    }

    public String getOtp() {
      return otp;
    }

    public void setOtp(String otp) {
      this.otp = otp;
    }
  }

  @PostMapping("/request-otp")
  public ResponseEntity<Map<String, Object>> requestOtp(
      @jakarta.validation.Valid @RequestBody(required = false) RequestOtpDto request) {
    if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
      return ResponseEntity.badRequest()
          .body(Map.of("success", false, "message", "Email is required"));
    }
    String email = request.getEmail().trim();
    String otp = customerAuthService.createAndStoreOtp(email);
    boolean emailed = orderMailService.sendLoginOtpEmail(email, otp);

    if (emailed) {
      Map<String, Object> body = new LinkedHashMap<>();
      body.put("success", true);
      body.put("message", "We sent a sign-in code to your email. It expires in 5 minutes.");
      if (exposeDevOtp) {
        body.put("devOtp", otp);
      }
      return ResponseEntity.ok(body);
    }

    log.warn("Meladen customer OTP for {}: {} (email not sent; expires in 5 min)", email, otp);
    if (exposeDevOtp) {
      return ResponseEntity.ok(
          Map.of(
              "success",
              true,
              "message",
              "Email could not be sent. Use the dev OTP below (check MELADEN_MAIL_PASSWORD).",
              "devOtp",
              otp));
    }
    return ResponseEntity.status(503)
        .body(
            Map.of(
                "success",
                false,
                "message",
                "Could not send sign-in code. Please try again in a moment."));
  }

  @PostMapping("/verify-otp")
  public ResponseEntity<Map<String, Object>> verifyOtp(
      @jakarta.validation.Valid @RequestBody(required = false) VerifyOtpDto request) {
    if (request == null
        || request.getEmail() == null
        || request.getEmail().isBlank()
        || request.getOtp() == null
        || request.getOtp().isBlank()) {
      return ResponseEntity.badRequest()
          .body(Map.of("success", false, "message", "Email and OTP are required"));
    }
    String token = customerAuthService.verifyOtpAndCreateToken(request.getEmail(), request.getOtp());
    if (token == null) {
      return ResponseEntity.status(401)
          .body(Map.of("success", false, "message", "Invalid or expired OTP"));
    }
    return ResponseEntity.ok(Map.of("success", true, "token", token));
  }

  @PostMapping("/logout")
  public ResponseEntity<Void> logout(
      @RequestHeader(value = "Authorization", required = false) String auth) {
    if (auth != null && auth.startsWith("Bearer ")) {
      customerAuthService.logout(auth.substring(7).trim());
    }
    return ResponseEntity.ok().build();
  }
}
