package com.meladen.controller;

import com.meladen.dto.OrderResponse;
import com.meladen.service.OrderService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
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
}
