package com.meladen.controller;

import com.meladen.dto.OrderResponse;
import com.meladen.service.OrderService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

  private final OrderService orderService;

  @GetMapping
  public List<OrderResponse> orders() {
    return orderService.listAdminOrders();
  }

  @PutMapping("/{orderId}/cod-payment-received")
  public OrderResponse markCodPaymentReceived(@PathVariable String orderId) {
    return orderService.markCodPaymentReceived(orderId);
  }

  @PutMapping("/{orderId}/complete")
  public OrderResponse markCompleted(@PathVariable String orderId) {
    return orderService.markOrderCompleted(orderId);
  }
}
