package com.meladen.service;

import com.meladen.entity.CustomerOrder;
import com.meladen.entity.CustomerOrderItem;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/** Sends confirmed purchases to Meta Conversions API. */
@Service
@Slf4j
public class MetaConversionsService {

  private final RestTemplate restTemplate = new RestTemplate();

  @Value("${meladen.meta.pixel-id:}")
  private String pixelId;

  @Value("${meladen.meta.access-token:}")
  private String accessToken;

  @Value("${meladen.meta.test-event-code:}")
  private String testEventCode;

  @Value("${meladen.meta.graph-version:v23.0}")
  private String graphVersion;

  @Value("${meladen.meta.website-url:https://meladenperfumes.com}")
  private String websiteUrl;

  public void sendPurchase(CustomerOrder order) {
    if (!isConfigured()) {
      log.debug("Meta CAPI disabled: pixel ID or access token is not configured");
      return;
    }

    String eventId = "purchase_" + order.getId();
    try {
      Map<String, Object> event = new LinkedHashMap<>();
      event.put("event_name", "Purchase");
      event.put("event_time", Instant.now().getEpochSecond());
      event.put("event_id", eventId);
      event.put("action_source", "website");
      event.put("event_source_url", normalizedWebsiteUrl() + "/order-confirmation");
      event.put("user_data", userData(order));
      event.put("custom_data", customData(order));

      Map<String, Object> payload = new LinkedHashMap<>();
      payload.put("data", List.of(event));
      if (testEventCode != null && !testEventCode.isBlank()) {
        payload.put("test_event_code", testEventCode.trim());
      }

      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      headers.setBearerAuth(accessToken.trim());

      String endpoint =
          "https://graph.facebook.com/"
              + graphVersion.trim()
              + "/"
              + pixelId.trim()
              + "/events";
      restTemplate.postForEntity(endpoint, new HttpEntity<>(payload, headers), String.class);
      log.info("Meta CAPI Purchase sent for order {} with event_id {}", order.getOrderNumber(), eventId);
    } catch (Exception ex) {
      // Tracking must never roll back or block a successfully confirmed customer order.
      log.warn("Meta CAPI Purchase failed for order {}: {}", order.getOrderNumber(), ex.getMessage());
    }
  }

  private boolean isConfigured() {
    return pixelId != null
        && !pixelId.isBlank()
        && accessToken != null
        && !accessToken.isBlank();
  }

  private Map<String, Object> userData(CustomerOrder order) {
    Map<String, Object> data = new LinkedHashMap<>();
    addHashed(data, "em", normalizeEmail(order.getCustomerEmail()));
    addHashed(data, "ph", normalizePhone(order.getCustomerPhone()));
    addHashed(
        data,
        "external_id",
        order.getCustomerId() != null
            ? String.valueOf(order.getCustomerId())
            : normalizeEmail(order.getCustomerEmail()));
    return data;
  }

  private Map<String, Object> customData(CustomerOrder order) {
    List<String> contentIds = new ArrayList<>();
    List<Map<String, Object>> contents = new ArrayList<>();

    for (CustomerOrderItem item : order.getItems()) {
      String productId = item.getProduct().getId();
      contentIds.add(productId);

      Map<String, Object> content = new LinkedHashMap<>();
      content.put("id", productId);
      content.put("quantity", item.getQuantity());
      content.put("item_price", decimal(item.getUnitPrice()));
      contents.add(content);
    }

    Map<String, Object> data = new LinkedHashMap<>();
    data.put("value", decimal(order.getTotal()));
    data.put("currency", "INR");
    data.put("content_ids", contentIds);
    data.put("contents", contents);
    data.put("content_type", "product");
    data.put("order_id", order.getOrderNumber());
    return data;
  }

  private void addHashed(Map<String, Object> target, String key, String normalizedValue) {
    if (normalizedValue == null || normalizedValue.isBlank()) return;
    target.put(key, List.of(sha256(normalizedValue)));
  }

  private String normalizeEmail(String email) {
    return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
  }

  private String normalizePhone(String phone) {
    if (phone == null) return null;
    String digits = phone.replaceAll("\\D", "");
    if (digits.length() == 10) digits = "91" + digits;
    return digits;
  }

  private String sha256(String value) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception ex) {
      throw new IllegalStateException("SHA-256 unavailable", ex);
    }
  }

  private double decimal(BigDecimal value) {
    return value == null ? 0d : value.doubleValue();
  }

  private String normalizedWebsiteUrl() {
    String value = websiteUrl == null ? "" : websiteUrl.trim();
    while (value.endsWith("/")) value = value.substring(0, value.length() - 1);
    return value.isBlank() ? "https://meladenperfumes.com" : value;
  }
}
