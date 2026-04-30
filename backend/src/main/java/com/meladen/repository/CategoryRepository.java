package com.meladen.repository;

import com.meladen.entity.Category;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CategoryRepository extends JpaRepository<Category, Long> {

  Optional<Category> findBySlug(String slug);

  List<Category> findAllByOrderBySortOrderAscNameAsc();

  @Query("SELECT DISTINCT c FROM Category c LEFT JOIN FETCH c.products")
  List<Category> findAllWithProducts();
}
