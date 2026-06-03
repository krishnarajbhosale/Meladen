package com.meladen.controller;

import com.meladen.dto.CustomerReviewResponse;
import com.meladen.service.CustomerReviewService;
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
@RequestMapping("/api/public/customer-reviews")
@RequiredArgsConstructor
public class PublicCustomerReviewController {

  private final CustomerReviewService customerReviewService;

  @GetMapping
  public List<CustomerReviewResponse> list() {
    return customerReviewService.listPublic();
  }

  @GetMapping("/{id}/photo")
  public ResponseEntity<byte[]> photo(@PathVariable Long id) {
    var image = customerReviewService.getPhoto(id);
    return ResponseEntity.ok()
        .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
        .contentType(MediaType.parseMediaType(image.contentType()))
        .body(image.bytes());
  }
}
