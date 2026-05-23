package com.meladen.service;

import com.meladen.config.MeladenProperties;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class RazorpayService {

  private final MeladenProperties properties;

  public String createOrder(String receipt, BigDecimal amountInr) {
    String keyId = properties.getRazorpay().getKeyId();
    String keySecret = properties.getRazorpay().getKeySecret();
    if (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank()) {
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE, "Payment is not configured. Contact support.");
    }
    int paise =
        amountInr
            .multiply(BigDecimal.valueOf(100))
            .setScale(0, RoundingMode.HALF_UP)
            .intValueExact();
    if (paise <= 0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nothing to charge");
    }
    try {
      RazorpayClient client = new RazorpayClient(keyId, keySecret);
      var options = new org.json.JSONObject();
      options.put("amount", paise);
      options.put("currency", "INR");
      options.put("receipt", receipt);
      Order order = client.orders.create(options);
      return order.get("id");
    } catch (RazorpayException e) {
      throw new ResponseStatusException(
          HttpStatus.BAD_GATEWAY, "Could not start payment: " + e.getMessage());
    }
  }

  public boolean verifySignature(String razorpayOrderId, String razorpayPaymentId, String signature) {
    String secret = properties.getRazorpay().getKeySecret();
    if (secret == null || secret.isBlank()) {
      return false;
    }
    try {
      String payload = razorpayOrderId + "|" + razorpayPaymentId;
      Mac mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
      byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
      return bytesToHex(hash).equals(signature);
    } catch (Exception e) {
      return false;
    }
  }

  public String getKeyId() {
    return properties.getRazorpay().getKeyId();
  }

  private static String bytesToHex(byte[] bytes) {
    StringBuilder sb = new StringBuilder(bytes.length * 2);
    for (byte b : bytes) {
      sb.append(String.format("%02x", b));
    }
    return sb.toString();
  }
}
