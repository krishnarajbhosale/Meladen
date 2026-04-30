package com.meladen.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "meladen.seed.admin")
public class SeedProperties {

  private String email = "admin@meladen.com";
  private String password = "changeMe";
}
