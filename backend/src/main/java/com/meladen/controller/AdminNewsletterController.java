package com.meladen.controller;

import com.meladen.dto.NewsletterSubscriberResponse;
import com.meladen.service.NewsletterSubscriberService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/newsletter-subscribers")
@RequiredArgsConstructor
public class AdminNewsletterController {

  private final NewsletterSubscriberService newsletterSubscriberService;

  @GetMapping
  public ResponseEntity<List<NewsletterSubscriberResponse>> list() {
    return ResponseEntity.ok(newsletterSubscriberService.listForAdmin());
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Map<String, Boolean>> delete(@PathVariable Long id) {
    newsletterSubscriberService.delete(id);
    return ResponseEntity.ok(Map.of("success", true));
  }
}
