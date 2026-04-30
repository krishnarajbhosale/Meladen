package com.meladen.dto;

import java.util.List;

public record CategoryWithProductsResponse(
    CategoryResponse category, List<ProductPublicResponse> products) {}
