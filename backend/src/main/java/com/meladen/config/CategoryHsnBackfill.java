package com.meladen.config;

import com.meladen.entity.Category;
import com.meladen.repository.CategoryRepository;
import com.meladen.util.InvoiceHsnCodes;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Ensures every category has an HSN code for invoice generation. */
@Component
@RequiredArgsConstructor
@Slf4j
public class CategoryHsnBackfill implements ApplicationRunner {

  private final CategoryRepository categoryRepository;

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    int updated = 0;
    for (Category category : categoryRepository.findAll()) {
      if (category.getHsnCode() != null && !category.getHsnCode().isBlank()) {
        continue;
      }
      category.setHsnCode(
          InvoiceHsnCodes.resolveForCategory(category.getName(), category.getSlug()));
      categoryRepository.save(category);
      updated++;
    }
    if (updated > 0) {
      log.info("Assigned HSN codes to {} categor(ies)", updated);
    }
  }
}
