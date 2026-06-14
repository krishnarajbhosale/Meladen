package com.meladen.dto;

public record CelebPhotoResponse(
    Long id,
    String sectionName,
    String personName,
    String personPosition,
    int sortOrder,
    String imageUrl) {}
