package com.meladen.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "customer_orders")
@Getter
@Setter
@NoArgsConstructor
public class CustomerOrder {

  @Id
  @Column(length = 36)
  private String id;

  @Column(name = "order_number", nullable = false, unique = true, length = 64)
  private String orderNumber;

  @Column(name = "customer_name", nullable = false, length = 300)
  private String customerName;

  @Column(name = "customer_email", nullable = false, length = 320)
  private String customerEmail;

  @Column(name = "customer_phone", length = 100)
  private String customerPhone;

  @Column(name = "apartment_house_number", length = 120)
  private String apartmentHouseNumber;

  @Column(nullable = false, length = 600)
  private String address;

  @Column(name = "nearest_landmark", length = 300)
  private String nearestLandmark;

  @Column(nullable = false, length = 200)
  private String city;

  @Column(length = 120)
  private String state;

  @Column(nullable = false, length = 100)
  private String postcode;

  @Column(nullable = false, length = 200)
  private String country;

  @Column(nullable = false, precision = 14, scale = 2)
  private BigDecimal subtotal;

  @Column(name = "discount_amount", nullable = false, precision = 14, scale = 2)
  private BigDecimal discountAmount = BigDecimal.ZERO;

  @Column(name = "promo_code", length = 60)
  private String promoCode;

  @Column(name = "customer_id")
  private Long customerId;

  @Column(nullable = false, precision = 14, scale = 2)
  private BigDecimal shipping;

  @Column(name = "cod_charges", nullable = false, precision = 14, scale = 2)
  private BigDecimal codCharges = BigDecimal.ZERO;

  @Column(name = "wallet_discount", nullable = false, precision = 14, scale = 2)
  private BigDecimal walletDiscount = BigDecimal.ZERO;

  @Column(nullable = false, precision = 14, scale = 2)
  private BigDecimal total;

  @Column(name = "alcohol_used_gm", nullable = false, precision = 14, scale = 2)
  private BigDecimal alcoholUsedGm;

  @Column(nullable = false, length = 64)
  private String status;

  @Column(name = "razorpay_order_id", length = 128)
  private String razorpayOrderId;

  @Column(name = "razorpay_payment_id", length = 128)
  private String razorpayPaymentId;

  @Column(name = "shiprocket_order_id", length = 128)
  private String shiprocketOrderId;

  @Column(name = "tracking_awb", length = 128)
  private String trackingAwb;

  @Column(name = "tracking_url", length = 512)
  private String trackingUrl;

  /** RAZORPAY, COD, or WALLET */
  @Column(name = "payment_method", length = 32)
  private String paymentMethod;

  /** Admin marks when cash is collected for COD orders. */
  @Column(name = "cod_payment_received", nullable = false)
  private boolean codPaymentReceived = false;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  private List<CustomerOrderItem> items = new ArrayList<>();
}
