package com.meladen.service;

import com.meladen.entity.Customer;
import com.meladen.repository.CustomerRepository;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomerAuthService {

  private static final long OTP_TTL_SECONDS = 5 * 60;

  private static class OtpEntry {
    private final String code;
    private final Instant expiresAt;

    private OtpEntry(String code, Instant expiresAt) {
      this.code = code;
      this.expiresAt = expiresAt;
    }
  }

  private final SecureRandom secureRandom = new SecureRandom();
  private final Map<String, OtpEntry> otpByEmail = new ConcurrentHashMap<>();
  private final Map<String, Long> tokenToCustomerId = new ConcurrentHashMap<>();

  private final CustomerRepository customerRepository;

  public String createAndStoreOtp(String email) {
    String normalized = normalizeEmail(email);
    String code = String.format("%06d", secureRandom.nextInt(1_000_000));
    otpByEmail.put(normalized, new OtpEntry(code, Instant.now().plusSeconds(OTP_TTL_SECONDS)));
    return code;
  }

  public String verifyOtpAndCreateToken(String email, String otp) {
    String normalized = normalizeEmail(email);
    OtpEntry entry = otpByEmail.get(normalized);
    if (entry == null || Instant.now().isAfter(entry.expiresAt)) {
      otpByEmail.remove(normalized);
      return null;
    }
    if (otp == null || !entry.code.equals(otp.trim())) {
      return null;
    }
    otpByEmail.remove(normalized);

    Customer customer =
        customerRepository
            .findByEmailIgnoreCase(normalized)
            .orElseGet(
                () -> {
                  Customer c = new Customer();
                  c.setEmail(normalized);
                  return customerRepository.save(c);
                });

    String token = UUID.randomUUID().toString();
    tokenToCustomerId.put(token, customer.getId());
    return token;
  }

  public boolean isValidToken(String token) {
    return token != null && tokenToCustomerId.containsKey(token);
  }

  public Long getCustomerIdForToken(String token) {
    return tokenToCustomerId.get(token);
  }

  public void logout(String token) {
    if (token != null) {
      tokenToCustomerId.remove(token);
    }
  }

  private String normalizeEmail(String email) {
    return email == null ? "" : email.trim().toLowerCase();
  }
}
