package com.meladen.controller;

import com.meladen.dto.OrderResponse;
import com.meladen.dto.PlaceOrderRequest;
import com.meladen.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/public/orders")
@RequiredArgsConstructor
public class PublicOrderController {

  private final OrderService orderService;

  @PostMapping
  public OrderResponse place(@Valid @RequestBody PlaceOrderRequest request, HttpServletRequest httpRequest) {
    Long customerId = (Long) httpRequest.getAttribute("customerId");
    if (customerId == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in required to place an order");
    }
    return orderService.placeOrder(request, customerId);
  }

  @GetMapping("/me")
  public List<OrderResponse> myOrders(HttpServletRequest request) {
    Long customerId = (Long) request.getAttribute("customerId");
    return orderService.listOrdersForCustomer(customerId);
  }
}
