package com.meladen.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CategoryReorderRequest(@NotEmpty List<@NotNull Long> orderedIds) {}
