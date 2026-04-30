package com.meladen.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.List;

/**
 * Public catalog shape aligned with the React {@code Product} type (plus extended fragrance fields).
 */
public record ProductPublicResponse(
    String id,
    String name,
    String brand,
    int price,
    String size,
    String category,
    String tag,
    String image,
    List<String> gallery,
    String description,
    Notes notes,
    Integer price30Ml,
    Integer price50Ml,
    Integer price100Ml,
    String inspiredBy,
    String luxuryDescription,
    String mood,
    String occasion,
    String season,
    String idealFor,
    String moreInformation,
    String searchKeywords,
    String category2,
    BigDecimal productOil,
    String concentration,
    @JsonProperty("isNew") boolean isNew,
    @JsonProperty("isBestseller") boolean isBestseller) {

  public record Notes(List<String> top, List<String> heart, List<String> base) {}
}
