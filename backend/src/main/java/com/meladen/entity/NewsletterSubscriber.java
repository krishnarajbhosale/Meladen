package com.meladen.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "newsletter_subscribers",
    indexes = {@Index(name = "idx_newsletter_email", columnList = "email", unique = true)})
@Getter
@Setter
@NoArgsConstructor
public class NewsletterSubscriber {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "email", length = 255, nullable = false, unique = true)
  private String email;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();
}
