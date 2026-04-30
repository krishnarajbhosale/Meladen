package com.meladen.service;

import com.meladen.config.JwtProperties;
import com.meladen.dto.JwtResponse;
import com.meladen.dto.LoginRequest;
import com.meladen.repository.AdminUserRepository;
import com.meladen.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final AdminUserRepository adminUserRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final JwtProperties jwtProperties;

  public JwtResponse login(LoginRequest request) {
    var user =
        adminUserRepository
            .findByEmailIgnoreCase(request.email())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    String token = jwtService.generateToken(user.getEmail());
    long expSeconds = Math.max(1L, jwtProperties.getExpirationMs() / 1000L);
    return new JwtResponse(token, user.getEmail(), expSeconds);
  }
}
