package com.meladen.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
    String id,
    String orderNumber,
    String customerName,
    String customerEmail,
    String customerPhone,
    String address,
    String city,
    String postcode,
    String country,
    BigDecimal subtotal,
    BigDecimal discountAmount,
    String promoCode,
    BigDecimal shipping,
    BigDecimal walletDiscount,
    BigDecimal total,
    BigDecimal alcoholUsedGm,
    String status,
    Instant createdAt,
    List<OrderItemResponse> items) {

  public record OrderItemResponse(
      String productId,
      String productName,
      String size,
      Integer quantity,
      BigDecimal unitPrice,
      BigDecimal lineTotal,
      BigDecimal oilUsedGm,
      BigDecimal alcoholUsedGm) {}
}
