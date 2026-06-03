package com.meladen.dto;

import java.math.BigDecimal;

public record DeliveryQuote(
    BigDecimal shippingFee,
    BigDecimal codCharges,
    boolean shiprocketAvailable,
    String source) {}
