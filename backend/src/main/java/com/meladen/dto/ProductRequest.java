package com.meladen.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ProductRequest(
    @NotNull Long categoryId,
    @NotBlank String meladenFragrance,
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
    String imageBase64,
    String imageContentType,
    Boolean clearImage,
    String galleryImage1,
    String galleryImage2,
    String galleryImage3,
    String tag,
    Boolean isNew,
    Boolean isBestseller) {}
