package com.meladen.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "promo_codes",
    indexes = {@Index(name = "idx_promo_codes_code", columnList = "code", unique = true)})
@Getter
@Setter
@NoArgsConstructor
public class PromoCode {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "code", length = 60, nullable = false, unique = true)
  private String code;

  @Column(name = "percent_off", nullable = false)
  private int percentOff;

  @Column(name = "min_order_value", precision = 12, scale = 2, nullable = false)
  private BigDecimal minOrderValue;

  @Column(name = "max_discount", precision = 12, scale = 2, nullable = false)
  private BigDecimal maxDiscount;

  @Column(name = "active", nullable = false)
  private boolean active = true;

  @Column(name = "created_at")
  private Instant createdAt = Instant.now();
}
