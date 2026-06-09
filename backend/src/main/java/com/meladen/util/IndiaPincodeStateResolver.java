package com.meladen.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.client.RestTemplate;

@Slf4j
public final class IndiaPincodeStateResolver {

  private static final String API = "https://api.postalpincode.in/pincode/";

  private IndiaPincodeStateResolver() {}

  public static String resolveState(RestTemplate restTemplate, ObjectMapper objectMapper, String pincode) {
    String digits = normalizePostcode(pincode);
    if (digits == null) {
      return null;
    }
    try {
      String body = restTemplate.getForObject(API + digits, String.class);
      if (body == null || body.isBlank()) {
        return null;
      }
      JsonNode root = objectMapper.readTree(body);
      if (!"Success".equalsIgnoreCase(root.path("Status").asText())) {
        return null;
      }
      JsonNode offices = root.get("PostOffice");
      if (offices == null || !offices.isArray() || offices.isEmpty()) {
        return null;
      }
      String state = offices.get(0).path("State").asText(null);
      return state == null || state.isBlank() ? null : state.trim();
    } catch (Exception e) {
      log.warn("Pincode state lookup failed for {}: {}", digits, e.getMessage());
      return null;
    }
  }

  static String normalizePostcode(String raw) {
    if (raw == null) {
      return null;
    }
    String digits = raw.replaceAll("\\D", "");
    return digits.length() == 6 ? digits : null;
  }
}
