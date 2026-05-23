package com.meladen.dto;

import jakarta.validation.constraints.NotBlank;

public record PaymentVerifyRequest(
    @NotBlank String razorpayOrderId,
    @NotBlank String razorpayPaymentId,
    @NotBlank String razorpaySignature) {}
