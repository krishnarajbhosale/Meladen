package com.meladen.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;

public record ShippingQuoteRequest(
    @NotBlank @Pattern(regexp = "^\\d{6}$", message = "Pincode must be 6 digits") String postcode,
    @NotNull @Min(0) BigDecimal orderValue,
    @Min(1) int itemCount,
    boolean cod) {}
