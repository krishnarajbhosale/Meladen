package com.meladen.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "meladen.jwt")
public class JwtProperties {

  /** HS256 secret; use a long random string in production. */
  private String secret = "";

  private long expirationMs = 86400000L;
}
