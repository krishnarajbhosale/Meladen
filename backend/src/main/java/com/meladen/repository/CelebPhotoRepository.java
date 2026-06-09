package com.meladen.repository;

import com.meladen.entity.CelebPhoto;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CelebPhotoRepository extends JpaRepository<CelebPhoto, Long> {

  @Query(
      """
      SELECT c.id AS id, c.sectionName AS sectionName, c.sortOrder AS sortOrder
      FROM CelebPhoto c
      ORDER BY c.sectionName ASC, c.sortOrder ASC, c.id ASC
      """)
  List<CelebPhotoSummary> findAllSummaries();
}
