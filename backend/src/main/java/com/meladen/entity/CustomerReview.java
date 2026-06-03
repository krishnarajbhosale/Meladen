package com.meladen.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "customer_reviews")
@Getter
@Setter
@NoArgsConstructor
public class CustomerReview {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "reviewer_name", nullable = false, length = 200)
  private String reviewerName;

  @Column(name = "review_text", nullable = false, length = 2000)
  private String reviewText;

  @Column(name = "sort_order", nullable = false)
  private Integer sortOrder = 0;

  @Column(name = "approved", nullable = false)
  private boolean approved = false;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Lob
  @Column(name = "photo_blob", nullable = false)
  private byte[] photoBlob;

  @Column(name = "photo_content_type", nullable = false, length = 100)
  private String photoContentType;

  @PrePersist
  void onCreate() {
    if (createdAt == null) {
      createdAt = Instant.now();
    }
  }
}
