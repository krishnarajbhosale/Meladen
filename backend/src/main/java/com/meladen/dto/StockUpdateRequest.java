package com.meladen.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record StockUpdateRequest(@NotNull @DecimalMin("0.00") BigDecimal alcoholStockGm) {}
