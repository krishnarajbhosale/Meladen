package com.meladen.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.meladen.config.MeladenProperties;
import com.meladen.dto.DeliveryQuote;
import com.meladen.entity.CustomerOrder;
import com.meladen.util.IndiaPincodeStateResolver;
import com.meladen.util.ShippingAddressFormatter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
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
    return selectCheapestCourier(token, pickupPostcode, deliveryPostcode, weightKg, declaredValue, cod)
        .map(CourierSelection::totalRate)
        .orElse(null);
  }

  private Optional<CourierSelection> selectCheapestCourier(
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
      return Optional.empty();
    }

    CourierSelection best = null;
    for (JsonNode courier : couriers) {
      BigDecimal candidate = courierRate(courier);
      if (candidate == null) {
        continue;
      }
      int courierCompanyId = courierCompanyId(courier);
      if (best == null || candidate.compareTo(best.totalRate()) < 0) {
        best = new CourierSelection(courierCompanyId, candidate);
      }
    }
    return Optional.ofNullable(best);
  }

  private static int courierCompanyId(JsonNode courier) {
    if (courier.hasNonNull("courier_company_id")) {
      return courier.get("courier_company_id").asInt();
    }
    if (courier.hasNonNull("courier_id")) {
      return courier.get("courier_id").asInt();
    }
    return courier.path("id").asInt(0);
  }

  private record CourierSelection(int courierCompanyId, BigDecimal totalRate) {}

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
      log.info("Shiprocket disabled — skipping order {}", order.getOrderNumber());
      return;
    }
    if (!hasCredentials()) {
      log.warn(
          "Shiprocket credentials not configured — set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD (use a dedicated API user from Shiprocket Settings > API)");
      return;
    }
    try {
      String token = getToken(properties.getShiprocket().getEmail(), properties.getShiprocket().getPassword());
      JsonNode created = createAdhocOrder(token, order);
      validateShiprocketResponse(created);

      JsonNode orderIdNode = created.get("order_id");
      if (orderIdNode == null || orderIdNode.isNull()) {
        log.warn(
            "Shiprocket create order returned no order_id for {} — response: {}",
            order.getOrderNumber(),
            created);
        return;
      }

      order.setShiprocketOrderId(orderIdNode.asText());

      Long shipmentId = parseShipmentId(created);
      String awb = parseAwbFromCreateResponse(created);
      Integer courierId = null;

      String pickup = normalizePostcode(properties.getShiprocket().getPickupPostcode());
      String delivery = normalizePostcode(order.getPostcode());
      if (pickup != null && delivery != null) {
        int itemUnits =
            order.getItems().stream().mapToInt(i -> i.getQuantity() == null ? 0 : i.getQuantity()).sum();
        BigDecimal weight = shipmentWeightKg(itemUnits);
        BigDecimal declared =
            order.getSubtotal() != null ? order.getSubtotal().max(BigDecimal.ZERO) : BigDecimal.ZERO;
        boolean cod =
            order.getPaymentMethod() != null && "COD".equalsIgnoreCase(order.getPaymentMethod());
        Optional<CourierSelection> courier =
            selectCheapestCourier(token, pickup, delivery, weight, declared, cod);
        courierId = courier.map(CourierSelection::courierCompanyId).filter(id -> id > 0).orElse(null);
      }

      if (shipmentId != null && (awb == null || awb.isBlank())) {
        awb = assignAwb(token, shipmentId, courierId);
      }

      if (awb != null && !awb.isBlank()) {
        order.setTrackingAwb(awb.trim());
        String trackUrl = fetchTrackingUrl(token, shipmentId, awb.trim());
        order.setTrackingUrl(trackUrl);
      }

      log.info(
          "Shiprocket order created for {} — shiprocketOrderId={}, awb={}",
          order.getOrderNumber(),
          order.getShiprocketOrderId(),
          order.getTrackingAwb());
    } catch (HttpStatusCodeException e) {
      log.warn(
          "Shiprocket HTTP error for {} ({}): {}",
          order.getOrderNumber(),
          e.getStatusCode(),
          e.getResponseBodyAsString());
    } catch (Exception e) {
      log.warn("Shiprocket shipment failed for {}: {}", order.getOrderNumber(), e.getMessage(), e);
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
    String pincode = normalizePostcode(order.getPostcode());
    if (pincode == null) {
      throw new IllegalStateException("Invalid delivery pincode: " + order.getPostcode());
    }

    String state = resolveBillingState(order, pincode);
    if (state == null || state.isBlank()) {
      throw new IllegalStateException("Could not resolve billing state for pincode " + pincode);
    }

    int itemUnits = order.getItems().stream().mapToInt(i -> i.getQuantity() == null ? 0 : i.getQuantity()).sum();
    BigDecimal itemsSubtotal =
        order.getItems().stream()
            .map(i -> i.getLineTotal() == null ? BigDecimal.ZERO : i.getLineTotal())
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .setScale(2, RoundingMode.HALF_UP);

    String[] nameParts = splitName(order.getCustomerName());
    Map<String, Object> payload = new HashMap<>();
    payload.put("order_id", order.getOrderNumber());
    payload.put(
        "order_date",
        DateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.ENGLISH)
            .withZone(ZoneId.of("Asia/Kolkata"))
            .format(order.getCreatedAt()));
    payload.put("pickup_location", properties.getShiprocket().getPickupLocation());
    payload.put("billing_customer_name", nameParts[0]);
    payload.put("billing_last_name", nameParts[1]);
    payload.put("billing_address", ShippingAddressFormatter.streetLine(order));
    payload.put("billing_city", order.getCity().trim());
    payload.put("billing_pincode", Integer.parseInt(pincode));
    payload.put("billing_state", state);
    payload.put("billing_country", normalizeCountry(order.getCountry()));
    payload.put("billing_email", order.getCustomerEmail().trim());
    payload.put("billing_phone", phoneOrDefault(order.getCustomerPhone()));
    payload.put("shipping_is_billing", true);
    payload.put(
        "payment_method",
        order.getPaymentMethod() != null && "COD".equalsIgnoreCase(order.getPaymentMethod())
            ? "COD"
            : "Prepaid");
    payload.put("sub_total", itemsSubtotal);
    payload.put("length", 10);
    payload.put("breadth", 10);
    payload.put("height", 10);
    payload.put("weight", shipmentWeightKg(itemUnits));

    List<Map<String, Object>> orderItems =
        order.getItems().stream()
            .map(
                i -> {
                  Map<String, Object> row = new HashMap<>();
                  row.put("name", i.getProductName());
                  row.put("sku", i.getProduct().getId());
                  row.put("units", i.getQuantity());
                  row.put("selling_price", i.getUnitPrice().setScale(2, RoundingMode.HALF_UP));
                  if (i.getHsnCode() != null && !i.getHsnCode().isBlank()) {
                    try {
                      row.put("hsn", Integer.parseInt(i.getHsnCode().trim()));
                    } catch (NumberFormatException ignored) {
                      // optional field
                    }
                  }
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

  private String resolveBillingState(CustomerOrder order, String pincode) {
    if (order.getState() != null && !order.getState().isBlank()) {
      return order.getState().trim();
    }
    return IndiaPincodeStateResolver.resolveState(restTemplate, objectMapper, pincode);
  }

  private static String normalizeCountry(String country) {
    if (country == null || country.isBlank()) {
      return "India";
    }
    String trimmed = country.trim();
    if (trimmed.equalsIgnoreCase("in") || trimmed.equalsIgnoreCase("india")) {
      return "India";
    }
    return trimmed;
  }

  private static void validateShiprocketResponse(JsonNode json) {
    if (json == null || json.isNull()) {
      throw new IllegalStateException("Empty Shiprocket response");
    }
    if (json.has("status_code")) {
      int code = json.get("status_code").asInt();
      if (code >= 400) {
        String message = json.path("message").asText("Unknown Shiprocket error");
        throw new IllegalStateException("Shiprocket API error " + code + ": " + message);
      }
    }
  }

  private static Long parseShipmentId(JsonNode created) {
    if (created.hasNonNull("shipment_id")) {
      return created.get("shipment_id").asLong();
    }
    JsonNode shipments = created.get("shipments");
    if (shipments != null && shipments.isArray() && !shipments.isEmpty()) {
      JsonNode first = shipments.get(0);
      if (first.hasNonNull("id")) {
        return first.get("id").asLong();
      }
      if (first.hasNonNull("shipment_id")) {
        return first.get("shipment_id").asLong();
      }
    }
    return null;
  }

  private static String parseAwbFromCreateResponse(JsonNode created) {
    if (created.hasNonNull("awb_code")) {
      return created.get("awb_code").asText();
    }
    JsonNode shipments = created.get("shipments");
    if (shipments != null && shipments.isArray() && !shipments.isEmpty()) {
      JsonNode first = shipments.get(0);
      if (first.hasNonNull("awb")) {
        return first.get("awb").asText();
      }
      if (first.hasNonNull("awb_code")) {
        return first.get("awb_code").asText();
      }
    }
    return null;
  }

  private String assignAwb(String token, long shipmentId, Integer courierId) throws Exception {
    Map<String, Object> body = new HashMap<>();
    body.put("shipment_id", shipmentId);
    if (courierId != null && courierId > 0) {
      body.put("courier_id", courierId);
    }

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setBearerAuth(token);
    ResponseEntity<String> res =
        restTemplate.postForEntity(
            BASE + "/courier/assign/awb", new HttpEntity<>(body, headers), String.class);
    JsonNode root = objectMapper.readTree(res.getBody());
    if (root.path("awb_assign_status").asInt(0) != 1) {
      log.warn("Shiprocket AWB assign failed for shipment {}: {}", shipmentId, root);
      return null;
    }

    String awb = root.path("response").path("data").path("awb_code").asText(null);
    if (awb == null || awb.isBlank()) {
      awb = root.path("awb_code").asText(null);
    }
    if (awb == null || awb.isBlank()) {
      awb = root.path("response").path("awb_code").asText(null);
    }
    if (awb == null || awb.isBlank()) {
      log.warn("Shiprocket AWB assign returned no awb_code for shipment {}: {}", shipmentId, root);
      return null;
    }
    return awb.trim();
  }

  private String fetchTrackingUrl(String token, Long shipmentId, String awb) {
    if (shipmentId != null) {
      try {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        ResponseEntity<String> res =
            restTemplate.exchange(
                BASE + "/courier/track/shipment/" + shipmentId,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                String.class);
        JsonNode root = objectMapper.readTree(res.getBody());
        String trackUrl = root.path("tracking_data").path("track_url").asText(null);
        if (trackUrl != null && !trackUrl.isBlank()) {
          return normalizeTrackingUrl(trackUrl);
        }
      } catch (Exception e) {
        log.debug("Shiprocket track/shipment lookup failed for {}: {}", shipmentId, e.getMessage());
      }
    }
    return buildTrackingUrl(awb);
  }

  private static String buildTrackingUrl(String awb) {
    return "https://shiprocket.co/tracking/" + awb.trim();
  }

  private static String normalizeTrackingUrl(String raw) {
    return raw.replace("shiprocket.co//tracking/", "shiprocket.co/tracking/").trim();
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
