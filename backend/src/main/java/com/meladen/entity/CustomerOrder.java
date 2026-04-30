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

  @Column(nullable = false, length = 600)
  private String address;

  @Column(nullable = false, length = 200)
  private String city;

  @Column(nullable = false, length = 100)
  private String postcode;

  @Column(nullable = false, length = 200)
  private String country;

  @Column(nullable = false, precision = 14, scale = 2)
  private BigDecimal subtotal;

  @Column(nullable = false, precision = 14, scale = 2)
  private BigDecimal shipping;

  @Column(nullable = false, precision = 14, scale = 2)
  private BigDecimal total;

  @Column(name = "alcohol_used_gm", nullable = false, precision = 14, scale = 2)
  private BigDecimal alcoholUsedGm;

  @Column(nullable = false, length = 64)
  private String status;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  private List<CustomerOrderItem> items = new ArrayList<>();
}
