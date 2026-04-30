package com.meladen.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

public record ProductAdminResponse(
    String id,
    Long categoryId,
    String categoryName,
    String meladenFragrance,
    String inspiredBy,
    String luxuryDescription,
    String mood,
    String occasion,
    String season,
    String idealFor,
    BigDecimal price30Ml,
    BigDecimal price50Ml,
    BigDecimal price100Ml,
    String notesTop,
    String notesMiddle,
    String notesBase,
    String moreInformation,
    String searchKeywords,
    String category2,
    BigDecimal productOil,
    String concentration,
    String imageUrl,
    boolean hasImage,
    String galleryImage1,
    String galleryImage2,
    String galleryImage3,
    String tag,
    @JsonProperty("isNew") boolean isNew,
    @JsonProperty("isBestseller") boolean isBestseller) {}
