package com.meladen.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "return_requests")
@Getter
@Setter
@NoArgsConstructor
public class ReturnRequest {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "customer_name", length = 255, nullable = false)
  private String customerName;

  @Column(name = "contact_number", length = 50, nullable = false)
  private String contactNumber;

  @Column(name = "email", length = 255, nullable = false)
  private String email;

  @Column(name = "order_id_text", length = 100, nullable = false)
  private String orderId;

  @Column(name = "issue_text", columnDefinition = "TEXT", nullable = false)
  private String issueText;

  @Column(name = "video_content_type", length = 120)
  private String videoContentType;

  @Column(name = "video_path", length = 500)
  private String videoPath;

  @Column(name = "customer_id")
  private Long customerId;

  @Column(name = "created_at")
  private Instant createdAt = Instant.now();
}
