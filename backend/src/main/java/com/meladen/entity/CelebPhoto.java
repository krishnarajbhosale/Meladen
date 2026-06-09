package com.meladen.entity;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "celeb_photos")
@Getter
@Setter
@NoArgsConstructor
public class CelebPhoto {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "section_name", nullable = false, length = 200)
  private String sectionName;

  @Column(name = "sort_order", nullable = false)
  private Integer sortOrder = 0;

  @Lob
  @Basic(fetch = FetchType.LAZY)
  @Column(name = "image_blob", nullable = false, columnDefinition = "LONGBLOB")
  private byte[] imageBlob;

  @Column(name = "image_content_type", nullable = false, length = 100)
  private String imageContentType;
}
