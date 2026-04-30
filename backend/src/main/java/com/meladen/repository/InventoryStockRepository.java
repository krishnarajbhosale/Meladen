package com.meladen.repository;

import com.meladen.entity.InventoryStock;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryStockRepository extends JpaRepository<InventoryStock, Long> {}
