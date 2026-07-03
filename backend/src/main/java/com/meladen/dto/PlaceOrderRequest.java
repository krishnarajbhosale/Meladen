package com.meladen.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;
import java.util.List;

public record PlaceOrderRequest(
    @NotBlank @Pattern(regexp = "^[\\x20-\\x7E]*$", message = "First name must be in English") String firstName,
    @NotBlank @Pattern(regexp = "^[\\x20-\\x7E]*$", message = "Last name must be in English") String lastName,
    @NotBlank @Email String email,
    String phone,
    @Pattern(regexp = "^[\\x20-\\x7E]*$", message = "Apartment / house number must be in English") String apartmentHouseNumber,
    @NotBlank @Pattern(regexp = "^[\\x20-\\x7E]*$", message = "Street address must be in English") String address,
    @Pattern(regexp = "^[\\x20-\\x7E]*$", message = "Nearest landmark must be in English") String nearestLandmark,
    @NotBlank @Pattern(regexp = "^[\\x20-\\x7E]*$", message = "City must be in English") String city,
    @Pattern(regexp = "^[\\x20-\\x7E]*$", message = "State must be in English") String state,
    @NotBlank @Pattern(regexp = "^\\d{6}$", message = "Pincode must be 6 digits") String postcode,
    @NotBlank @Pattern(regexp = "^[\\x20-\\x7E]*$", message = "Country must be in English") String country,
    @NotEmpty List<@Valid OrderItemRequest> items,
    String promoCode,
    BigDecimal walletDiscount,
    BigDecimal clientTotal,
    String paymentMethod) {

  public record OrderItemRequest(
      @NotBlank String productId,
      @NotBlank String size,
      @NotNull @Min(1) Integer quantity,
      @NotNull BigDecimal unitPrice) {}
}
