package com.meladen.controller;

import com.meladen.dto.JwtResponse;
import com.meladen.dto.LoginRequest;
import com.meladen.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  @PostMapping("/ladmin/login")
  public JwtResponse login(@Valid @RequestBody LoginRequest request) {
    return authService.login(request);
  }
}
