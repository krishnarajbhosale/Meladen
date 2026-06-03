package com.meladen.dto;

import java.time.Instant;

public record CustomerReviewResponse(
    Long id,
    String reviewerName,
    String reviewText,
    int sortOrder,
    boolean approved,
    Instant createdAt,
    String photoUrl) {}
