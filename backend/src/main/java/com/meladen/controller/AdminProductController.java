package com.meladen.controller;

import com.meladen.dto.ProductAdminResponse;
import com.meladen.dto.ProductRequest;
import com.meladen.service.ProductService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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

  @PutMapping(value = "/{id}/gallery/{slot}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ProductAdminResponse replaceGalleryImage(
      @PathVariable String id, @PathVariable int slot, @RequestPart("image") MultipartFile image) {
    return productService.replaceGalleryImage(id, slot, image);
  }

  @DeleteMapping("/{id}/gallery/{slot}")
  public ProductAdminResponse deleteGalleryImage(@PathVariable String id, @PathVariable int slot) {
    return productService.deleteGalleryImage(id, slot);
  }

  @DeleteMapping("/{id}/image")
  public ProductAdminResponse deletePrimaryImage(@PathVariable String id) {
    return productService.deletePrimaryImage(id);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable String id) {
    productService.delete(id);
  }
}
