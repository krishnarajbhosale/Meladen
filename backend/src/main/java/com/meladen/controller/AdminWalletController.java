package com.meladen.controller;

import com.meladen.entity.WalletTransaction;
import com.meladen.repository.CustomerOrderRepository;
import com.meladen.repository.CustomerRepository;
import com.meladen.service.WalletService;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/wallet")
@RequiredArgsConstructor
public class AdminWalletController {

  private final WalletService walletService;
  private final CustomerOrderRepository orderRepository;
  private final CustomerRepository customerRepository;

  @GetMapping("/customers")
  public ResponseEntity<List<String>> customers() {
    List<String> emails =
        customerRepository.findAll().stream()
            .map(c -> c.getEmail() == null ? "" : c.getEmail().trim().toLowerCase())
            .filter(s -> !s.isBlank())
            .distinct()
            .sorted()
            .collect(Collectors.toList());
    return ResponseEntity.ok(emails);
  }

  @GetMapping("/orders")
  public ResponseEntity<List<Map<String, Object>>> ordersByCustomer(@RequestParam("email") String email) {
    String normalized = email == null ? "" : email.trim().toLowerCase();
    List<Map<String, Object>> rows =
        orderRepository.findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(normalized).stream()
            .map(
                o -> {
                  Map<String, Object> m = new HashMap<>();
                  m.put("id", o.getId());
                  m.put("orderNumber", o.getOrderNumber() != null ? o.getOrderNumber() : "");
                  m.put("totalAmount", o.getTotal() != null ? o.getTotal() : BigDecimal.ZERO);
                  return m;
                })
            .collect(Collectors.toList());
    return ResponseEntity.ok(rows);
  }

  @PostMapping("/credit")
  public ResponseEntity<?> credit(@RequestBody Map<String, Object> body) {
    try {
      String orderId = body.get("orderId") != null ? body.get("orderId").toString().trim() : null;
      BigDecimal amount =
          body.get("amount") != null ? new BigDecimal(body.get("amount").toString()) : null;
      WalletTransaction tx = walletService.credit(orderId, amount);
      return ResponseEntity.ok(Map.of("success", true, "transactionId", tx.getId()));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
    }
  }
}
