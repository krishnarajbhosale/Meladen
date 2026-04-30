package com.meladen.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record StockSummaryResponse(
    BigDecimal alcoholStockGm,
    boolean lowAlcohol,
    List<LowOilProduct> lowOilProducts,
    Instant updatedAt) {

  public record LowOilProduct(String productId, String productName, BigDecimal remainingOilGm, boolean lowOil) {}
}
