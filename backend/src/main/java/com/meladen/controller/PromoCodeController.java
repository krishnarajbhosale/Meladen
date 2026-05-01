package com.meladen.controller;

import com.meladen.service.PromoCodeService;
import java.math.BigDecimal;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/promocodes")
@RequiredArgsConstructor
public class PromoCodeController {

  private final PromoCodeService promoCodeService;

  @GetMapping("/validate")
  public ResponseEntity<Map<String, Object>> validate(
      @RequestParam("code") String code, @RequestParam("baseCartValue") BigDecimal baseCartValue) {
    return ResponseEntity.ok(promoCodeService.validate(code, baseCartValue));
  }
}
