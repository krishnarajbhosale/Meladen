package com.meladen.dto;

import java.time.Instant;

public record NewsletterSubscriberResponse(Long id, String email, Instant createdAt) {}
