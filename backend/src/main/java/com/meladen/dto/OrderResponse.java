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
    String apartmentHouseNumber,
    String address,
    String nearestLandmark,
    String city,
    String postcode,
    String country,
    BigDecimal subtotal,
    BigDecimal discountAmount,
    String promoCode,
    BigDecimal shipping,
    BigDecimal codCharges,
    BigDecimal walletDiscount,
    BigDecimal total,
    BigDecimal alcoholUsedGm,
    String status,
    String paymentMethod,
    String trackingAwb,
    String trackingUrl,
    Instant createdAt,
    List<OrderItemResponse> items) {

  public record OrderItemResponse(
      String productId,
      String productName,
      String productImageUrl,
      String size,
      Integer quantity,
      BigDecimal unitPrice,
      BigDecimal lineTotal,
      BigDecimal oilUsedGm,
      BigDecimal alcoholUsedGm) {}
}
