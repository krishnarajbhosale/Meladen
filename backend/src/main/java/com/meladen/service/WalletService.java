package com.meladen.service;

import com.meladen.entity.Customer;
import com.meladen.entity.CustomerOrder;
import com.meladen.entity.WalletTransaction;
import com.meladen.repository.CustomerOrderRepository;
import com.meladen.repository.CustomerRepository;
import com.meladen.repository.WalletTransactionRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WalletService {

  private final WalletTransactionRepository walletTransactionRepository;
  private final CustomerOrderRepository orderRepository;
  private final CustomerRepository customerRepository;

  @Transactional
  public WalletTransaction credit(String orderId, BigDecimal amount) {
    if (orderId == null || orderId.isBlank()) {
      throw new IllegalArgumentException("Order is required");
    }
    if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
      throw new IllegalArgumentException("Amount must be greater than zero");
    }
    CustomerOrder order =
        orderRepository
            .findById(orderId.trim())
            .orElseThrow(() -> new IllegalArgumentException("Order not found"));
    Long customerId = order.getCustomerId();
    if (customerId == null) {
      String email =
          order.getCustomerEmail() == null ? "" : order.getCustomerEmail().trim().toLowerCase();
      customerId =
          customerRepository.findByEmailIgnoreCase(email).map(Customer::getId).orElse(null);
    }
    if (customerId == null) {
      throw new IllegalArgumentException("Customer not found for this order");
    }
    WalletTransaction tx = new WalletTransaction();
    tx.setOrderId(order.getId());
    tx.setCustomerId(customerId);
    tx.setAmount(amount.setScale(2, RoundingMode.HALF_UP));
    return walletTransactionRepository.save(tx);
  }

  public BigDecimal getBalance(Long customerId) {
    if (customerId == null) {
      return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }
    return walletTransactionRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
        .map(WalletTransaction::getAmount)
        .filter(Objects::nonNull)
        .reduce(BigDecimal.ZERO, BigDecimal::add)
        .setScale(2, RoundingMode.HALF_UP);
  }

  @Transactional
  public void debitForOrder(Long customerId, String orderId, BigDecimal amount) {
    if (customerId == null || orderId == null || orderId.isBlank()) {
      return;
    }
    if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
      return;
    }
    BigDecimal bal = getBalance(customerId);
    if (amount.compareTo(bal) > 0) {
      throw new IllegalArgumentException("Insufficient wallet balance");
    }
    WalletTransaction tx = new WalletTransaction();
    tx.setCustomerId(customerId);
    tx.setOrderId(orderId);
    tx.setAmount(amount.negate().setScale(2, RoundingMode.HALF_UP));
    walletTransactionRepository.save(tx);
  }

  public Map<String, Object> getWalletForCustomerId(Long customerId) {
    List<WalletTransaction> txns =
        customerId == null
            ? List.of()
            : walletTransactionRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    BigDecimal balance = getBalance(customerId);
    List<Map<String, Object>> rows =
        txns.stream()
            .map(
                tx -> {
                  Map<String, Object> m = new HashMap<>();
                  m.put("id", tx.getId());
                  m.put("orderId", tx.getOrderId());
                  m.put("amount", tx.getAmount());
                  m.put("createdAt", tx.getCreatedAt());
                  return m;
                })
            .collect(Collectors.toList());
    Map<String, Object> result = new HashMap<>();
    result.put("customerId", customerId);
    result.put("balance", balance);
    result.put("transactions", rows);
    return result;
  }
}
