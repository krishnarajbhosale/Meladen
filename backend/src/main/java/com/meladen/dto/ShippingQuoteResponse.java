package com.meladen.dto;

import java.math.BigDecimal;

public record ShippingQuoteResponse(
    BigDecimal shippingFee,
    BigDecimal codFee,
    boolean shiprocketAvailable,
    String source) {}
