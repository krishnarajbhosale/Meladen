package com.meladen.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
public class Product {

  @Id
  @Column(length = 36)
  private String id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "category_id", nullable = false)
  private Category category;

  /** Display name: "Méladen Fragrance" */
  @Column(name = "meladen_fragrance", nullable = false, length = 500)
  private String meladenFragrance;

  @Lob
  @Column(name = "inspired_by", columnDefinition = "TEXT")
  private String inspiredBy;

  @Lob
  @Column(name = "luxury_description", columnDefinition = "TEXT")
  private String luxuryDescription;

  @Column(length = 500)
  private String mood;

  @Column(length = 500)
  private String occasion;

  @Column(length = 500)
  private String season;

  @Column(name = "ideal_for", length = 500)
  private String idealFor;

  @Column(name = "price_30_ml", precision = 12, scale = 2)
  private BigDecimal price30Ml;

  @Column(name = "price_50_ml", precision = 12, scale = 2)
  private BigDecimal price50Ml;

  @Column(name = "price_100_ml", precision = 12, scale = 2)
  private BigDecimal price100Ml;

  @Lob
  @Column(name = "notes_top", columnDefinition = "TEXT")
  private String notesTop;

  @Lob
  @Column(name = "notes_middle", columnDefinition = "TEXT")
  private String notesMiddle;

  @Lob
  @Column(name = "notes_base", columnDefinition = "TEXT")
  private String notesBase;

  @Lob
  @Column(name = "more_information", columnDefinition = "TEXT")
  private String moreInformation;

  @Lob
  @Column(name = "search_keywords", columnDefinition = "TEXT")
  private String searchKeywords;

  @Column(name = "category2", length = 500)
  private String category2;

  @Column(name = "product_oil", precision = 12, scale = 2)
  private BigDecimal productOil;

  /** Used for collection filters (e.g. Eau de Parfum). */
  @Column(length = 255)
  private String concentration;

  @Lob
  @Column(name = "image_blob", columnDefinition = "LONGBLOB")
  private byte[] imageBlob;

  @Column(name = "image_content_type", length = 255)
  private String imageContentType;

  @Lob
  @Column(name = "gallery_image_1", columnDefinition = "TEXT")
  private String galleryImage1;

  @Lob
  @Column(name = "gallery_image_2", columnDefinition = "TEXT")
  private String galleryImage2;

  @Lob
  @Column(name = "gallery_image_3", columnDefinition = "TEXT")
  private String galleryImage3;

  @Column(length = 64)
  private String tag;

  @Column(name = "is_new")
  private boolean isNew;

  @Column(name = "is_bestseller")
  private boolean isBestseller;
}
