package com.meladen.config;

import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "meladen")
@Getter
@Setter
public class MeladenProperties {

  private Mail mail = new Mail();
  private Razorpay razorpay = new Razorpay();
  private Shiprocket shiprocket = new Shiprocket();
  private OrderPricing orderPricing = new OrderPricing();

  @Getter
  @Setter
  public static class Mail {
    private String from = "team.meladenperfumes@gmail.com";
    /** Receives an email when a new order is confirmed (paid, COD, or wallet). */
    private String adminNotifyTo = "meladenperfumes@gmail.com";
  }

  @Getter
  @Setter
  public static class Razorpay {
    private String keyId = "";
    private String keySecret = "";
  }

  @Getter
  @Setter
  public static class Shiprocket {
    private String email = "";
    private String password = "";
    private boolean enabled = true;
    private String pickupLocation = "Primary";
    /** Warehouse / pickup pincode for rate checks (6 digits). */
    private String pickupPostcode = "";
    private BigDecimal defaultWeightKg = new BigDecimal("0.5");
    private BigDecimal weightPerItemKg = new BigDecimal("0.15");
  }

  @Getter
  @Setter
  public static class OrderPricing {
    /**
     * Flat shipping fee when order subtotal (after promo) is below free-shipping
     * threshold.
     */
    private BigDecimal shippingFee = new BigDecimal("12");
    /** Subtotal after promo at or above this value ships free. */
    private BigDecimal freeShippingThreshold = new BigDecimal("150");
    /** Extra fee added when customer confirms Cash on Delivery. */
    private BigDecimal codFee = new BigDecimal("30");
  }
}
