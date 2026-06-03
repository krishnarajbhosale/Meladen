package com.meladen.controller;

import com.meladen.config.MeladenProperties;
import com.meladen.dto.CheckoutPricingResponse;
import com.meladen.dto.DeliveryQuote;
import com.meladen.dto.ShippingQuoteRequest;
import com.meladen.dto.ShippingQuoteResponse;
import com.meladen.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/checkout")
@RequiredArgsConstructor
public class PublicCheckoutController {

  private final MeladenProperties properties;
  private final OrderService orderService;

  @GetMapping("/pricing")
  public CheckoutPricingResponse pricing() {
    MeladenProperties.OrderPricing p = properties.getOrderPricing();
    return new CheckoutPricingResponse(p.getShippingFee(), p.getFreeShippingThreshold(), p.getCodFee());
  }

  @PostMapping("/shipping-quote")
  public ShippingQuoteResponse shippingQuote(@Valid @RequestBody ShippingQuoteRequest request) {
    DeliveryQuote quote =
        orderService.quoteShippingForCheckout(
            request.postcode(),
            request.orderValue(),
            request.itemCount(),
            request.cod());
    return new ShippingQuoteResponse(
        quote.shippingFee(),
        quote.codCharges(),
        quote.shiprocketAvailable(),
        quote.source());
  }
}
