package com.meladen.repository;

import com.meladen.entity.Product;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, String> {

  @Query("SELECT p FROM Product p JOIN FETCH p.category WHERE p.id = :id")
  Optional<Product> findDetailById(@Param("id") String id);

  List<Product> findByCategoryIdOrderByMeladenFragranceAsc(Long categoryId);

  @Query(
      "SELECT DISTINCT p FROM Product p JOIN FETCH p.category c ORDER BY c.sortOrder ASC, c.name ASC,"
          + " p.meladenFragrance ASC")
  List<Product> findAllWithCategory();

  @Query("SELECT DISTINCT p FROM Product p JOIN FETCH p.category")
  List<Product> findAllForAdmin();
}
