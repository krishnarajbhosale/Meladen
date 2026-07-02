package com.meladen.util;

import com.meladen.entity.Category;
import com.meladen.entity.Product;
import java.math.BigDecimal;
import java.util.Locale;

/**
 * Shared rules for liquid perfumes vs finished products (attar, gel, car,
 * mist).
 */
public final class ProductCategoryRules {

  public static final BigDecimal LIQUID_PERFUME_LOW_OIL_GM = new BigDecimal("100");
  public static final BigDecimal FINISHED_PRODUCT_LOW_OIL_UNITS = new BigDecimal("3");
  public static final BigDecimal FINISHED_PRODUCT_OIL_PER_UNIT = BigDecimal.ONE;

  private ProductCategoryRules() {
  }

  public static boolean isNonMlFragranceCategory(String cat) {
    if (cat == null || cat.isBlank()) {
      return false;
    }
    String normalized = cat.trim().toLowerCase(Locale.ROOT);
    return normalized.contains("gel")
        || normalized.contains("attar")
        || normalized.contains("car")
        || normalized.contains("mist")
        || normalized.contains("body")
        || normalized.contains("hair");
  }

  public static boolean isLiquidPerfumeProduct(Product p) {
    Category c = p.getCategory();
    String categoryName = c != null && c.getName() != null ? c.getName().toLowerCase(Locale.ROOT) : "";
    String concentration = p.getConcentration() != null ? p.getConcentration().toLowerCase(Locale.ROOT) : "";

    if (isNonMlFragranceCategory(categoryName) || isNonMlFragranceCategory(concentration)) {
      return false;
    }

    boolean hasFinished =
        p.getPriceGel() != null
            || p.getPriceAttar() != null
            || p.getPriceCarPerfume() != null
            || p.getPriceBodyHairMist() != null;
    boolean hasMl = p.getPrice30Ml() != null || p.getPrice50Ml() != null || p.getPrice100Ml() != null;
    if (hasFinished && !hasMl) {
      return false;
    }
    if (hasMl) {
      return true;
    }

    return isLiquidPerfumeCategoryName(categoryName) || isLiquidPerfumeCategoryName(concentration);
  }

  public static boolean isFinishedProduct(Product p) {
    return !isLiquidPerfumeProduct(p);
  }

  public static BigDecimal lowProductOilThreshold(Product p) {
    return isLiquidPerfumeProduct(p) ? LIQUID_PERFUME_LOW_OIL_GM : FINISHED_PRODUCT_LOW_OIL_UNITS;
  }

  public static boolean isLowProductOil(Product p) {
    if (p.getProductOil() == null) {
      return false;
    }
    return p.getProductOil().compareTo(lowProductOilThreshold(p)) <= 0;
  }

  public static boolean isOutOfStockProductOil(Product p) {
    if (p.getProductOil() == null) {
      return true;
    }
    return p.getProductOil().compareTo(BigDecimal.ZERO) <= 0;
  }

  private static boolean isLiquidPerfumeCategoryName(String cat) {
    if (cat == null || cat.isBlank() || isNonMlFragranceCategory(cat)) {
      return false;
    }
    return cat.contains("eau de parfum")
        || cat.contains("extrait")
        || cat.contains("eau de toilette")
        || cat.contains("edp")
        || cat.contains("edt")
        || cat.equals("perfume")
        || cat.equals("perfumes")
        || (cat.contains("parfum") && !cat.contains("gel") && !cat.contains("car"));
  }
}
