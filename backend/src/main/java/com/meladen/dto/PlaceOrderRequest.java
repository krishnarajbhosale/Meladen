package com.meladen.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public record PlaceOrderRequest(
    @NotBlank String firstName,
    @NotBlank String lastName,
    @NotBlank @Email String email,
    String phone,
    @NotBlank String address,
    @NotBlank String city,
    @NotBlank String postcode,
    @NotBlank String country,
    @NotEmpty List<@Valid OrderItemRequest> items,
    String promoCode,
    BigDecimal walletDiscount,
    BigDecimal clientTotal) {

  public record OrderItemRequest(
      @NotBlank String productId,
      @NotBlank String size,
      @NotNull @Min(1) Integer quantity,
      @NotNull BigDecimal unitPrice) {}
}
