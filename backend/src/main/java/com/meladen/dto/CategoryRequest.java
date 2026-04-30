package com.meladen.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CategoryRequest(
    @NotBlank String name,
    String description,
    @NotNull Integer sortOrder) {}
