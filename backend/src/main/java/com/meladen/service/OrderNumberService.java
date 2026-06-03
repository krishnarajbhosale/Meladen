package com.meladen.service;

import com.meladen.repository.CustomerOrderRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class OrderNumberService {

  private static final ZoneId ORDER_ZONE = ZoneId.of("Asia/Kolkata");
  private static final DateTimeFormatter DATE_PART = DateTimeFormatter.ofPattern("ddMMyyyy");
  private static final int MAX_DAILY_SEQUENCE = 9999;

  private final CustomerOrderRepository orderRepository;

  /** Format: MLD-DDMMYYYY0001 — e.g. MLD-030620260001 for the first order on 3 Jun 2026. */
  public synchronized String nextOrderNumber() {
    String prefix = "MLD-" + LocalDate.now(ORDER_ZONE).format(DATE_PART);
    String latest =
        orderRepository
            .findTopByOrderNumberStartingWithOrderByOrderNumberDesc(prefix)
            .map(o -> o.getOrderNumber())
            .orElse(null);

    int sequence = 1;
    if (latest != null && latest.startsWith(prefix) && latest.length() > prefix.length()) {
      String suffix = latest.substring(prefix.length());
      try {
        sequence = Integer.parseInt(suffix) + 1;
      } catch (NumberFormatException ignored) {
        sequence = 1;
      }
    }

    if (sequence > MAX_DAILY_SEQUENCE) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "Daily order number limit reached. Please try again tomorrow.");
    }

    return prefix + String.format("%04d", sequence);
  }
}
