package com.meladen.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ShippingQuoteRequest(
    @NotBlank String postcode,
    @NotNull @Min(0) BigDecimal orderValue,
    @Min(1) int itemCount,
    boolean cod) {}
