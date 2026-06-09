package com.meladen.service;

import com.meladen.entity.CustomerOrder;
import com.meladen.repository.CustomerOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Shiprocket + email after an order is confirmed (runs outside the main confirm transaction). */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderPostConfirmService {

  private final CustomerOrderRepository orderRepository;
  private final ShiprocketService shiprocketService;
  private final OrderMailService orderMailService;

  @Transactional
  public void dispatch(String orderId) {
    CustomerOrder order =
        orderRepository.findByIdWithItems(orderId).orElse(null);
    if (order == null) {
      log.warn("Post-confirm dispatch skipped — order {} not found", orderId);
      return;
    }
    try {
      shiprocketService.createShipmentForOrder(order);
      orderRepository.save(order);
    } catch (Exception e) {
      log.warn("Shiprocket dispatch failed for {}: {}", order.getOrderNumber(), e.getMessage());
    }
    try {
      orderMailService.sendOrderConfirmedEmail(order);
      orderMailService.sendAdminNewOrderNotification(order);
    } catch (Exception e) {
      log.warn("Order email dispatch failed for {}: {}", order.getOrderNumber(), e.getMessage());
    }
  }
}
