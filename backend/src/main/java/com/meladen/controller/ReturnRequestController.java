package com.meladen.controller;

import com.meladen.entity.ReturnRequest;
import com.meladen.service.ReturnRequestService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/returns")
@RequiredArgsConstructor
public class ReturnRequestController {

  private final ReturnRequestService returnRequestService;

  @PostMapping(consumes = "multipart/form-data")
  public ResponseEntity<?> submit(
      @RequestParam("name") String name,
      @RequestParam("contactNumber") String contactNumber,
      @RequestParam("email") String email,
      @RequestParam("orderId") String orderId,
      @RequestParam("issueText") String issueText,
      @RequestParam(value = "video", required = false) MultipartFile video) {
    try {
      ReturnRequest saved =
          returnRequestService.submit(name, contactNumber, email, orderId, issueText, video);
      return ResponseEntity.ok(Map.of("success", true, "id", saved.getId()));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
    } catch (RuntimeException e) {
      return ResponseEntity.internalServerError()
          .body(Map.of("success", false, "message", e.getMessage() != null ? e.getMessage() : "Server error"));
    }
  }
}
