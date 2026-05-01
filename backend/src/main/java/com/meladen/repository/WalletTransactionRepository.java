package com.meladen.repository;

import com.meladen.entity.WalletTransaction;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

  List<WalletTransaction> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
