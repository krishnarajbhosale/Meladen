package com.meladen.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.meladen.config.MeladenProperties;
import com.meladen.dto.DeliveryQuote;
import com.meladen.entity.CustomerOrder;
import com.meladen.util.ShippingAddressFormatter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@Slf4j
public class ShiprocketService {

  private static final String BASE = "https://apiv2.shiprocket.in/v1/external";
  private static final String SOURCE_SHIPROCKET = "SHIPROCKET";
  private static final String SOURCE_FALLBACK = "FALLBACK";

  private final MeladenProperties properties;
  private final RestTemplate restTemplate = new RestTemplate();
  private final ObjectMapper objectMapper = new ObjectMapper();

  private String cachedToken;
  private Instant tokenExpiresAt = Instant.EPOCH;

  private String cachedToken;
  private Instant tokenExpiresAt = Instant.EPOCH;

  public ShiprocketService(MeladenProperties properties) {
    this.properties = properties;
  }

  /** Live courier rate from Shiprocket, or configured fallback when API is unavailable. */
  public DeliveryQuote quoteDelivery(
      String deliveryPostcode, BigDecimal declaredValue, int itemCount, boolean codPayment) {
    MeladenProperties.OrderPricing fallback = properties.getOrderPricing();
    BigDecimal fallbackShipping = fallback.getShippingFee().setScale(2, RoundingMode.HALF_UP);
    BigDecimal fallbackCod = fallback.getCodFee().setScale(2, RoundingMode.HALF_UP);

    if (!properties.getShiprocket().isEnabled() || !hasCredentials()) {
      return fallbackQuote(fallbackShipping, codPayment ? fallbackCod : BigDecimal.ZERO, SOURCE_FALLBACK);
    }

    String pickup = normalizePostcode(properties.getShiprocket().getPickupPostcode());
    String delivery = normalizePostcode(deliveryPostcode);
    if (pickup == null || delivery == null) {
      log.debug("Shiprocket quote skipped: pickup or delivery postcode missing");
      return fallbackQuote(fallbackShipping, codPayment ? fallbackCod : BigDecimal.ZERO, SOURCE_FALLBACK);
    }

    try {
      String token = getToken(properties.getShiprocket().getEmail(), properties.getShiprocket().getPassword());
      BigDecimal weight = shipmentWeightKg(itemCount);
      BigDecimal declared =
          declaredValue == null
              ? BigDecimal.ZERO
              : declaredValue.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

      BigDecimal prepaidRate = cheapestCourierRate(token, pickup, delivery, weight, declared, false);
      if (prepaidRate == null) {
        return fallbackQuote(fallbackShipping, codPayment ? fallbackCod : BigDecimal.ZERO, SOURCE_FALLBACK);
      }

      BigDecimal shipping = prepaidRate.setScale(2, RoundingMode.HALF_UP);
      BigDecimal codCharges = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
      if (codPayment) {
        BigDecimal codRate = cheapestCourierRate(token, pickup, delivery, weight, declared, true);
        if (codRate != null) {
          codCharges =
              codRate.subtract(prepaidRate).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        } else {
          codCharges = fallbackCod;
        }
      }

      return new DeliveryQuote(shipping, codCharges, true, SOURCE_SHIPROCKET);
    } catch (Exception e) {
      log.warn("Shiprocket rate quote failed: {}", e.getMessage());
      return fallbackQuote(fallbackShipping, codPayment ? fallbackCod : BigDecimal.ZERO, SOURCE_FALLBACK);
    }
  }

  private DeliveryQuote fallbackQuote(
      BigDecimal shippingFee, BigDecimal codCharges, String source) {
    return new DeliveryQuote(
        shippingFee.setScale(2, RoundingMode.HALF_UP),
        codCharges.setScale(2, RoundingMode.HALF_UP),
        false,
        source);
  }

  private boolean hasCredentials() {
    String email = properties.getShiprocket().getEmail();
    String password = properties.getShiprocket().getPassword();
    return email != null
        && !email.isBlank()
        && password != null
        && !password.isBlank();
  }

  private BigDecimal shipmentWeightKg(int itemCount) {
    int units = Math.max(1, itemCount);
    MeladenProperties.Shiprocket cfg = properties.getShiprocket();
    return cfg
        .getDefaultWeightKg()
        .add(cfg.getWeightPerItemKg().multiply(BigDecimal.valueOf(Math.max(0, units - 1))))
        .setScale(2, RoundingMode.HALF_UP);
  }

  private BigDecimal cheapestCourierRate(
      String token,
      String pickupPostcode,
      String deliveryPostcode,
      BigDecimal weightKg,
      BigDecimal declaredValue,
      boolean cod)
      throws Exception {
    URI uri =
        UriComponentsBuilder.fromHttpUrl(BASE + "/courier/serviceability/")
            .queryParam("pickup_postcode", pickupPostcode)
            .queryParam("delivery_postcode", deliveryPostcode)
            .queryParam("weight", weightKg.toPlainString())
            .queryParam("cod", cod ? 1 : 0)
            .queryParam("declared_value", declaredValue.toPlainString())
            .build()
            .encode()
            .toUri();

    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(token);
    ResponseEntity<String> res =
        restTemplate.exchange(uri, HttpMethod.GET, new HttpEntity<>(headers), String.class);
    JsonNode root = objectMapper.readTree(res.getBody());
    JsonNode couriers = root.path("data").path("available_courier_companies");
    if (!couriers.isArray() || couriers.isEmpty()) {
      return null;
    }

    BigDecimal min = null;
    for (JsonNode courier : couriers) {
      BigDecimal candidate = courierRate(courier);
      if (candidate == null) {
        continue;
      }
      if (min == null || candidate.compareTo(min) < 0) {
        min = candidate;
      }
    }
    return min;
  }

  private BigDecimal courierRate(JsonNode courier) {
    if (courier.hasNonNull("rate")) {
      return BigDecimal.valueOf(courier.get("rate").asDouble());
    }
    BigDecimal freight =
        courier.hasNonNull("freight_charge")
            ? BigDecimal.valueOf(courier.get("freight_charge").asDouble())
            : BigDecimal.ZERO;
    BigDecimal cod =
        courier.hasNonNull("cod_charges")
            ? BigDecimal.valueOf(courier.get("cod_charges").asDouble())
            : BigDecimal.ZERO;
    BigDecimal total = freight.add(cod);
    return total.compareTo(BigDecimal.ZERO) > 0 ? total : null;
  }

  private static String normalizePostcode(String raw) {
    if (raw == null) {
      return null;
    }
    String digits = raw.replaceAll("\\D", "");
    return digits.length() == 6 ? digits : null;
  }

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
    payload.put("billing_address", ShippingAddressFormatter.streetLine(order));
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
