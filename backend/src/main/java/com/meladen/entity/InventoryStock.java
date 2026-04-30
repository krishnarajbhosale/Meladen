package com.meladen.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "inventory_stock")
@Getter
@Setter
@NoArgsConstructor
public class InventoryStock {

  @Id private Long id;

  @Column(name = "alcohol_stock_gm", nullable = false, precision = 14, scale = 2)
  private BigDecimal alcoholStockGm;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;
}
