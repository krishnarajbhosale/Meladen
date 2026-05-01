package com.meladen.controller;

import com.meladen.service.WalletService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

  private final WalletService walletService;

  @GetMapping("/me")
  public ResponseEntity<?> me(HttpServletRequest request) {
    Long customerId = (Long) request.getAttribute("customerId");
    return ResponseEntity.ok(walletService.getWalletForCustomerId(customerId));
  }
}
