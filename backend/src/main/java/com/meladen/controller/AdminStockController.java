package com.meladen.controller;

import com.meladen.dto.StockSummaryResponse;
import com.meladen.dto.StockUpdateRequest;
import com.meladen.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/stock")
@RequiredArgsConstructor
public class AdminStockController {

  private final OrderService orderService;

  @GetMapping
  public StockSummaryResponse stock() {
    return orderService.getStockSummary();
  }

  @PutMapping
  public StockSummaryResponse updateStock(@Valid @RequestBody StockUpdateRequest request) {
    return orderService.updateStock(request);
  }
}
