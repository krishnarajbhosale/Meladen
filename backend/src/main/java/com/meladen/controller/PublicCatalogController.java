package com.meladen.controller;

import com.meladen.dto.CategoryWithProductsResponse;
import com.meladen.dto.ProductPublicResponse;
import com.meladen.dto.StockSummaryResponse;
import com.meladen.service.CategoryService;
import com.meladen.service.OrderService;
import com.meladen.service.ProductService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicCatalogController {

  private final CategoryService categoryService;
  private final ProductService productService;
  private final OrderService orderService;

  @GetMapping("/categories-with-products")
  public List<CategoryWithProductsResponse> categoriesWithProducts() {
    return categoryService.publicCatalog();
  }

  @GetMapping("/products/{id}")
  public ProductPublicResponse product(@PathVariable String id) {
    return productService.getPublic(id);
  }

  @GetMapping("/products/{id}/image")
  public ResponseEntity<byte[]> productImage(@PathVariable String id) {
    var image = productService.getImage(id);
    return ResponseEntity.ok()
        .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
        .contentType(MediaType.parseMediaType(image.contentType()))
        .body(image.bytes());
  }

  @GetMapping("/stock")
  public StockSummaryResponse stockSummary() {
    return orderService.getStockSummary();
  }
}
