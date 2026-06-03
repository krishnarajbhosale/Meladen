package com.meladen.dto;

import java.math.BigDecimal;

public record CheckoutPricingResponse(
    BigDecimal shippingFee,
    BigDecimal freeShippingThreshold,
    BigDecimal codFee) {}
