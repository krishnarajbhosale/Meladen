package com.meladen.controller;

import com.meladen.dto.CustomerReviewResponse;
import com.meladen.service.CustomerReviewService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/customer-reviews")
@RequiredArgsConstructor
public class AdminCustomerReviewController {

  private final CustomerReviewService customerReviewService;

  @GetMapping
  public List<CustomerReviewResponse> list() {
    return customerReviewService.listAdmin();
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public CustomerReviewResponse create(
      @RequestParam("reviewerName") String reviewerName,
      @RequestParam("reviewText") String reviewText,
      @RequestParam(value = "sortOrder", required = false) Integer sortOrder,
      @RequestParam(value = "approved", required = false) Boolean approved,
      @RequestPart("photo") MultipartFile photo) {
    return customerReviewService.createAdmin(reviewerName, reviewText, sortOrder, photo, approved);
  }

  @PutMapping("/{id}/approve")
  public CustomerReviewResponse approve(@PathVariable Long id) {
    return customerReviewService.approve(id);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Map<String, Boolean>> delete(@PathVariable Long id) {
    customerReviewService.delete(id);
    return ResponseEntity.ok(Map.of("success", true));
  }
}
