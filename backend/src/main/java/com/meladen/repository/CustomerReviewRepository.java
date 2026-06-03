package com.meladen.repository;

import com.meladen.entity.CustomerReview;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerReviewRepository extends JpaRepository<CustomerReview, Long> {

  List<CustomerReview> findAllByApprovedTrueOrderBySortOrderAscIdAsc();

  List<CustomerReview> findAllByOrderByCreatedAtDescIdDesc();
}
