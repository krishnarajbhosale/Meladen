package com.meladen.dto;

public record CategoryResponse(
    Long id, String name, String slug, String description, Integer sortOrder) {}