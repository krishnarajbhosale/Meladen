package com.meladen.dto;

import java.math.BigDecimal;

public record RazorpayCheckoutResponse(
    String keyId,
    String razorpayOrderId,
    BigDecimal amount,
    String currency,
    String orderId,
    String orderNumber,
    String customerName,
    String customerEmail,
    String customerPhone) {}
