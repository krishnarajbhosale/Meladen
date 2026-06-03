package com.meladen.util;

import com.meladen.entity.Category;
import com.meladen.entity.CustomerOrderItem;
import com.meladen.entity.Product;
import java.util.Locale;
import java.util.Map;

/** GST HSN codes mapped from Méladen product categories (invoice line items). */
public final class InvoiceHsnCodes {

  public static final String PERFUMES = "3303";
  public static final String ATTAR = "3301";
  public static final String CAR_FRAGRANCES = "3307";
  public static final String PERFUME_GEL = "3304";
  public static final String HAIR_AND_BODY_MIST = "3304";

  /** Known admin / catalog category slugs → HSN (exact match). */
  private static final Map<String, String> SLUG_TO_HSN =
      Map.ofEntries(
          Map.entry("perfumes", PERFUMES),
          Map.entry("perfume", PERFUMES),
          Map.entry("attars", ATTAR),
          Map.entry("attar", ATTAR),
          Map.entry("perfume-gel", PERFUME_GEL),
          Map.entry("body-and-hair-mist", HAIR_AND_BODY_MIST),
          Map.entry("hair-and-body-mist", HAIR_AND_BODY_MIST),
          Map.entry("body-hair-mist", HAIR_AND_BODY_MIST),
          Map.entry("car-fragrance", CAR_FRAGRANCES),
          Map.entry("car-fragrances", CAR_FRAGRANCES),
          Map.entry("car-perfume", CAR_FRAGRANCES),
          Map.entry("car-perfumes", CAR_FRAGRANCES));

  private InvoiceHsnCodes() {}

  /** Resolve HSN from category name and slug (used when saving categories and at checkout). */
  public static String resolveForCategory(String name, String slug) {
    if (slug != null && !slug.isBlank()) {
      String exact = SLUG_TO_HSN.get(slug.trim().toLowerCase(Locale.ROOT));
      if (exact != null) {
        return exact;
      }
    }
    String fromLabels = matchLabels(name, slug);
    return fromLabels != null ? fromLabels : PERFUMES;
  }

  public static String forProduct(Product product) {
    if (product == null) {
      return PERFUMES;
    }
    Category category = product.getCategory();
    if (category != null) {
      if (category.getHsnCode() != null && !category.getHsnCode().isBlank()) {
        return category.getHsnCode().trim();
      }
      return resolveForCategory(category.getName(), category.getSlug());
    }
    if (product.getCategory2() != null && !product.getCategory2().isBlank()) {
      return resolveForCategory(product.getCategory2(), slugify(product.getCategory2()));
    }
    return PERFUMES;
  }

  /** HSN for an invoice line (snapshot on item, then live product category). */
  public static String forOrderItem(CustomerOrderItem item) {
    if (item == null) {
      return PERFUMES;
    }
    if (item.getHsnCode() != null && !item.getHsnCode().isBlank()) {
      return item.getHsnCode().trim();
    }
    if (item.getProduct() != null) {
      return forProduct(item.getProduct());
    }
    String fallback = matchLabels(item.getProductName(), slugify(item.getProductName()));
    return fallback != null ? fallback : PERFUMES;
  }

  /** Reference lines for the invoice HSN legend. */
  public static String[] referenceLines() {
    return new String[] {
      "Perfumes " + PERFUMES,
      "Attar " + ATTAR,
      "Car Fragrances / Car Perfume " + CAR_FRAGRANCES,
      "Perfume Gel " + PERFUME_GEL,
      "Hair and body Mist " + HAIR_AND_BODY_MIST,
    };
  }

  /** Keyword match — specific categories before generic "perfume". */
  private static String matchLabels(String name, String slug) {
    String combined = normalize(name) + " " + normalize(slug);
    if (combined.isBlank()) {
      return null;
    }

    if (containsAny(
        combined, "carfragrance", "carfragrances", "carperfume", "carperfumes")) {
      return CAR_FRAGRANCES;
    }
    if (containsAny(combined, "perfumegel", "perfumegels")) {
      return PERFUME_GEL;
    }
    if (containsAny(
        combined,
        "bodyandhairmist",
        "hairandbodymist",
        "hairbodymist",
        "bodymist",
        "hairmist",
        "hairandbody")) {
      return HAIR_AND_BODY_MIST;
    }
    if (containsAny(combined, "attar", "attars", "itar", "itars")) {
      return ATTAR;
    }
    if (containsAny(combined, "perfume", "perfumes", "edp", "edt", "parfum", "cologne")) {
      return PERFUMES;
    }
    if (containsAny(combined, "fragrance", "fragrances") && !combined.contains("car")) {
      return PERFUMES;
    }
    return null;
  }

  private static String normalize(String raw) {
    if (raw == null) {
      return "";
    }
    return raw.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
  }

  private static String slugify(String raw) {
    if (raw == null || raw.isBlank()) {
      return "";
    }
    return raw.toLowerCase(Locale.ROOT).trim().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
  }

  private static boolean containsAny(String haystack, String... needles) {
    for (String needle : needles) {
      if (haystack.contains(needle)) {
        return true;
      }
    }
    return false;
  }
}
