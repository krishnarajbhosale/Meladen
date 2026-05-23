package com.meladen.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.meladen.config.MeladenProperties;
import com.meladen.entity.CustomerOrder;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShiprocketService {

  private static final String BASE = "https://apiv2.shiprocket.in/v1/external";

  private final MeladenProperties properties;
  private final RestTemplate restTemplate = new RestTemplate();
  private final ObjectMapper objectMapper = new ObjectMapper();

  private String cachedToken;
  private Instant tokenExpiresAt = Instant.EPOCH;

  public void createShipmentForOrder(CustomerOrder order) {
    if (!properties.getShiprocket().isEnabled()) {
      return;
    }
    String email = properties.getShiprocket().getEmail();
    String password = properties.getShiprocket().getPassword();
    if (email == null || email.isBlank() || password == null || password.isBlank()) {
      log.debug("Shiprocket credentials not configured");
      return;
    }
    try {
      String token = getToken(email, password);
      JsonNode created = createAdhocOrder(token, order);
      if (created == null) {
        return;
      }
      if (created.hasNonNull("order_id")) {
        order.setShiprocketOrderId(String.valueOf(created.get("order_id").asLong()));
      }
      JsonNode shipments = created.get("shipments");
      if (shipments != null && shipments.isArray() && !shipments.isEmpty()) {
        JsonNode first = shipments.get(0);
        if (first.hasNonNull("awb")) {
          order.setTrackingAwb(first.get("awb").asText());
        }
      }
      if (order.getTrackingAwb() != null) {
        order.setTrackingUrl("https://shiprocket.co/tracking/" + order.getTrackingAwb());
      }
    } catch (Exception e) {
      log.warn("Shiprocket shipment failed for {}: {}", order.getOrderNumber(), e.getMessage());
    }
  }

  private String getToken(String email, String password) throws Exception {
    if (cachedToken != null && Instant.now().isBefore(tokenExpiresAt)) {
      return cachedToken;
    }
    Map<String, String> body = Map.of("email", email, "password", password);
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    ResponseEntity<String> res =
        restTemplate.postForEntity(BASE + "/auth/login", new HttpEntity<>(body, headers), String.class);
    JsonNode json = objectMapper.readTree(res.getBody());
    cachedToken = json.path("token").asText(null);
    if (cachedToken == null || cachedToken.isBlank()) {
      throw new IllegalStateException("Shiprocket login did not return a token");
    }
    tokenExpiresAt = Instant.now().plusSeconds(9 * 24 * 3600);
    return cachedToken;
  }

  private JsonNode createAdhocOrder(String token, CustomerOrder order) throws Exception {
    String[] nameParts = splitName(order.getCustomerName());
    Map<String, Object> payload = new HashMap<>();
    payload.put("order_id", order.getOrderNumber());
    payload.put("order_date", order.getCreatedAt().toString().substring(0, 10));
    payload.put("pickup_location", properties.getShiprocket().getPickupLocation());
    payload.put("billing_customer_name", nameParts[0]);
    payload.put("billing_last_name", nameParts[1]);
    payload.put("billing_address", order.getAddress());
    payload.put("billing_city", order.getCity());
    payload.put("billing_pincode", order.getPostcode());
    payload.put("billing_state", order.getCity());
    payload.put("billing_country", order.getCountry());
    payload.put("billing_email", order.getCustomerEmail());
    payload.put("billing_phone", phoneOrDefault(order.getCustomerPhone()));
    payload.put("shipping_is_billing", true);
    payload.put(
        "payment_method",
        order.getPaymentMethod() != null && "COD".equalsIgnoreCase(order.getPaymentMethod())
            ? "COD"
            : "Prepaid");
    payload.put("sub_total", order.getTotal());
    payload.put("length", 10);
    payload.put("breadth", 10);
    payload.put("height", 10);
    payload.put("weight", 0.5);

    List<Map<String, Object>> orderItems =
        order.getItems().stream()
            .map(
                i -> {
                  Map<String, Object> row = new HashMap<>();
                  row.put("name", i.getProductName());
                  row.put("sku", i.getProduct().getId());
                  row.put("units", i.getQuantity());
                  row.put("selling_price", i.getUnitPrice());
                  return row;
                })
            .toList();
    payload.put("order_items", orderItems);

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setBearerAuth(token);
    ResponseEntity<String> res =
        restTemplate.postForEntity(
            BASE + "/orders/create/adhoc", new HttpEntity<>(payload, headers), String.class);
    return objectMapper.readTree(res.getBody());
  }

  private static String[] splitName(String full) {
    if (full == null || full.isBlank()) {
      return new String[] {"Customer", ""};
    }
    String trimmed = full.trim();
    int space = trimmed.indexOf(' ');
    if (space < 0) {
      return new String[] {trimmed, ""};
    }
    return new String[] {trimmed.substring(0, space), trimmed.substring(space + 1).trim()};
  }

  private static String phoneOrDefault(String phone) {
    if (phone != null && !phone.isBlank()) {
      return phone.replaceAll("[^0-9]", "");
    }
    return "9999999999";
  }
}
