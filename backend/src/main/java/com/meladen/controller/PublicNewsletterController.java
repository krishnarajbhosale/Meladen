package com.meladen.controller;

import com.meladen.dto.NewsletterSubscribeRequest;
import com.meladen.dto.NewsletterSubscriberResponse;
import com.meladen.service.NewsletterSubscriberService;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/newsletter")
@RequiredArgsConstructor
public class PublicNewsletterController {

  private final NewsletterSubscriberService newsletterSubscriberService;

  @PostMapping("/subscribe")
  public ResponseEntity<Map<String, Object>> subscribe(@Valid @RequestBody NewsletterSubscribeRequest body) {
    NewsletterSubscriberResponse saved = newsletterSubscriberService.subscribe(body.email());
    return ResponseEntity.ok(
        Map.of(
            "success",
            true,
            "message",
            "Thank you for subscribing.",
            "email",
            saved.email(),
            "id",
            saved.id()));
  }
}
