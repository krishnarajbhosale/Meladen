package com.meladen.repository;

import com.meladen.entity.CelebPhoto;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CelebPhotoRepository extends JpaRepository<CelebPhoto, Long> {

  List<CelebPhoto> findAllByOrderBySectionNameAscSortOrderAscIdAsc();
}
