package com.meladen.controller;

import com.meladen.dto.ProductAdminResponse;
import com.meladen.dto.ProductRequest;
import com.meladen.service.ProductService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

  private final ProductService productService;

  @GetMapping
  public List<ProductAdminResponse> list() {
    return productService.listForAdmin();
  }

  @GetMapping("/{id}")
  public ProductAdminResponse get(@PathVariable String id) {
    return productService.getForAdmin(id);
  }

  @PostMapping
  public ProductAdminResponse create(@Valid @RequestBody ProductRequest request) {
    return productService.create(request);
  }

  @PutMapping("/{id}")
  public ProductAdminResponse update(@PathVariable String id, @Valid @RequestBody ProductRequest request) {
    return productService.update(id, request);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable String id) {
    productService.delete(id);
  }
}
