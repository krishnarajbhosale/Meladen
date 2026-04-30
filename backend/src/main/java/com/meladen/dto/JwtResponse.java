package com.meladen.dto;

public record JwtResponse(String token, String email, long expiresInSeconds) {}
