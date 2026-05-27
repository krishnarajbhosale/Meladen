package com.meladen.service;

import com.meladen.dto.CategoryRequest;
import com.meladen.dto.CategoryResponse;
import com.meladen.dto.CategoryWithProductsResponse;
import com.meladen.entity.Category;
import com.meladen.repository.CategoryRepository;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CategoryService {

  private final CategoryRepository categoryRepository;
  private final ProductService productService;

  @Transactional(readOnly = true)
  public List<CategoryResponse> listAll() {
    return categoryRepository.findAllByOrderBySortOrderAscNameAsc().stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<CategoryWithProductsResponse> publicCatalog() {
    List<Category> categories = categoryRepository.findAllWithProducts();
    categories.sort(
        Comparator.comparing(Category::getSortOrder, Comparator.nullsLast(Integer::compareTo))
            .thenComparing(Category::getName, Comparator.nullsLast(String::compareToIgnoreCase)));

    return categories.stream()
        .map(
            c -> {
              List<com.meladen.dto.ProductPublicResponse> products =
                  c.getProducts().stream()
                      .filter(p -> !p.isArchived())
                      .sorted(
                          Comparator.comparing(
                              com.meladen.entity.Product::getMeladenFragrance,
                              Comparator.nullsLast(String::compareToIgnoreCase)))
                      .map(productService::toPublic)
                      .toList();
              return new CategoryWithProductsResponse(toResponse(c), products);
            })
        .toList();
  }

  @Transactional
  public CategoryResponse create(CategoryRequest request) {
    Category c = new Category();
    c.setName(request.name().trim());
    c.setDescription(request.description());
    c.setSortOrder(request.sortOrder());
    c.setSlug(ensureUniqueSlug(slugify(c.getName()), null));
    return toResponse(categoryRepository.save(c));
  }

  @Transactional
  public CategoryResponse update(Long id, CategoryRequest request) {
    Category c =
        categoryRepository
            .findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
    c.setName(request.name().trim());
    c.setDescription(request.description());
    c.setSortOrder(request.sortOrder());
    c.setSlug(ensureUniqueSlug(slugify(c.getName()), c.getId()));
    return toResponse(categoryRepository.save(c));
  }

  @Transactional
  public List<CategoryResponse> reorder(List<Long> orderedIds) {
    List<Category> all = categoryRepository.findAllByOrderBySortOrderAscNameAsc();
    if (orderedIds.size() != all.size()) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "orderedIds must include every category exactly once");
    }
    Set<Long> existing = all.stream().map(Category::getId).collect(Collectors.toSet());
    if (!existing.equals(new HashSet<>(orderedIds))) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid category ids in orderedIds");
    }
    Map<Long, Category> byId =
        all.stream().collect(Collectors.toMap(Category::getId, Function.identity()));
    for (int i = 0; i < orderedIds.size(); i++) {
      byId.get(orderedIds.get(i)).setSortOrder(i);
    }
    categoryRepository.saveAll(all);
    return listAll();
  }

  @Transactional
  public void delete(Long id) {
    Category c =
        categoryRepository
            .findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
    if (!c.getProducts().isEmpty()) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Delete products first or reassign them");
    }
    categoryRepository.delete(c);
  }

  public Category getByIdOrThrow(Long id) {
    return categoryRepository
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
  }

  private CategoryResponse toResponse(Category c) {
    return new CategoryResponse(c.getId(), c.getName(), c.getSlug(), c.getDescription(), c.getSortOrder());
  }

  private String slugify(String name) {
    String s =
        name.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    return s.isBlank() ? "category" : s;
  }

  private String ensureUniqueSlug(String base, Long excludeCategoryId) {
    String slug = base;
    int i = 2;
    while (true) {
      var found = categoryRepository.findBySlug(slug);
      if (found.isEmpty()) {
        return slug;
      }
      if (excludeCategoryId != null && found.get().getId().equals(excludeCategoryId)) {
        return slug;
      }
      slug = base + "-" + i++;
    }
  }
}
