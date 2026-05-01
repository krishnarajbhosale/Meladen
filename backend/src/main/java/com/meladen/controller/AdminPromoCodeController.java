package com.meladen.controller;

import com.meladen.entity.PromoCode;
import com.meladen.repository.PromoCodeRepository;
import com.meladen.service.PromoCodeService;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/promocodes")
@RequiredArgsConstructor
public class AdminPromoCodeController {

  private final PromoCodeRepository promoCodeRepository;
  private final PromoCodeService promoCodeService;

  @GetMapping
  public ResponseEntity<List<Map<String, Object>>> list() {
    List<Map<String, Object>> rows =
        promoCodeRepository.findAll().stream()
            .sorted(
                Comparator.comparing(PromoCode::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                    .reversed())
            .map(
                p -> {
                  Map<String, Object> m = new HashMap<>();
                  m.put("id", p.getId());
                  m.put("code", p.getCode());
                  m.put("percentOff", p.getPercentOff());
                  m.put("minOrderValue", p.getMinOrderValue());
                  m.put("maxDiscount", p.getMaxDiscount());
                  m.put("active", p.isActive());
                  m.put("createdAt", p.getCreatedAt());
                  return m;
                })
            .collect(Collectors.toList());
    return ResponseEntity.ok(rows);
  }

  @PostMapping
  public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
    try {
      String code = body.get("code") != null ? body.get("code").toString() : "";
      int percentOff =
          body.get("percentOff") instanceof Number ? ((Number) body.get("percentOff")).intValue() : 0;
      BigDecimal minOrderValue =
          body.get("minOrderValue") != null
              ? new BigDecimal(body.get("minOrderValue").toString())
              : BigDecimal.ZERO;
      BigDecimal maxDiscount =
          body.get("maxDiscount") != null
              ? new BigDecimal(body.get("maxDiscount").toString())
              : BigDecimal.ZERO;
      PromoCode saved = promoCodeService.create(code, percentOff, minOrderValue, maxDiscount);
      return ResponseEntity.ok(Map.of("success", true, "id", saved.getId()));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> delete(@PathVariable Long id) {
    if (!promoCodeRepository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }
    promoCodeRepository.deleteById(id);
    return ResponseEntity.ok(Map.of("success", true));
  }
}
