package com.meladen.controller;

import com.meladen.dto.OrderResponse;
import com.meladen.dto.PlaceOrderRequest;
import com.meladen.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/orders")
@RequiredArgsConstructor
public class PublicOrderController {

  private final OrderService orderService;

  @PostMapping
  public OrderResponse place(@Valid @RequestBody PlaceOrderRequest request) {
    return orderService.placeOrder(request);
  }
}
