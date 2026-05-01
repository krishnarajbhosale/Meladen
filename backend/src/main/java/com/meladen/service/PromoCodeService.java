package com.meladen.service;

import com.meladen.entity.PromoCode;
import com.meladen.repository.PromoCodeRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PromoCodeService {

  private final PromoCodeRepository promoCodeRepository;

  public PromoCode create(
      String code, int percentOff, BigDecimal minOrderValue, BigDecimal maxDiscount) {
    String normalized = normalize(code);
    if (normalized.isBlank()) {
      throw new IllegalArgumentException("Code is required");
    }
    if (percentOff <= 0 || percentOff > 100) {
      throw new IllegalArgumentException("Percent must be 1-100");
    }
    if (minOrderValue == null || minOrderValue.compareTo(BigDecimal.ZERO) < 0) {
      throw new IllegalArgumentException("Minimum order value must be >= 0");
    }
    if (maxDiscount == null || maxDiscount.compareTo(BigDecimal.ZERO) <= 0) {
      throw new IllegalArgumentException("Max discount must be > 0");
    }

    PromoCode p = promoCodeRepository.findByCodeIgnoreCase(normalized).orElse(new PromoCode());
    p.setCode(normalized);
    p.setPercentOff(percentOff);
    p.setMinOrderValue(minOrderValue);
    p.setMaxDiscount(maxDiscount);
    p.setActive(true);
    return promoCodeRepository.save(p);
  }

  public Map<String, Object> validate(String code, BigDecimal baseCartValue) {
    String normalized = normalize(code);
    Map<String, Object> out = new HashMap<>();
    out.put("code", normalized);
    out.put("baseCartValue", baseCartValue);

    if (normalized.isBlank()) {
      out.put("valid", false);
      out.put("message", "Promo code is required");
      out.put("discountAmount", BigDecimal.ZERO);
      return out;
    }
    if (baseCartValue == null || baseCartValue.compareTo(BigDecimal.ZERO) <= 0) {
      out.put("valid", false);
      out.put("message", "Cart value is invalid");
      out.put("discountAmount", BigDecimal.ZERO);
      return out;
    }

    PromoCode promo = promoCodeRepository.findByCodeIgnoreCase(normalized).orElse(null);
    if (promo == null || !promo.isActive()) {
      out.put("valid", false);
      out.put("message", "Invalid promo code");
      out.put("discountAmount", BigDecimal.ZERO);
      return out;
    }

    if (baseCartValue.compareTo(promo.getMinOrderValue()) < 0) {
      out.put("valid", false);
      out.put("message", "Minimum order value not met");
      out.put("discountAmount", BigDecimal.ZERO);
      out.put("minOrderValue", promo.getMinOrderValue());
      return out;
    }

    BigDecimal percent =
        new BigDecimal(promo.getPercentOff()).divide(new BigDecimal(100), 4, RoundingMode.HALF_UP);
    BigDecimal raw = baseCartValue.multiply(percent);
    BigDecimal discount = raw.min(promo.getMaxDiscount()).setScale(2, RoundingMode.HALF_UP);

    out.put("valid", true);
    out.put("message", "Promo applied");
    out.put("percentOff", promo.getPercentOff());
    out.put("minOrderValue", promo.getMinOrderValue());
    out.put("maxDiscount", promo.getMaxDiscount());
    out.put("discountAmount", discount);
    return out;
  }

  private String normalize(String code) {
    return code == null ? "" : code.trim().toUpperCase();
  }
}
