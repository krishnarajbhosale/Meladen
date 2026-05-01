package com.meladen.controller;

import com.meladen.entity.ReturnRequest;
import com.meladen.repository.ReturnRequestRepository;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/returns")
@RequiredArgsConstructor
public class AdminReturnRequestController {

  private final ReturnRequestRepository returnRequestRepository;

  @GetMapping
  public ResponseEntity<List<Map<String, Object>>> list() {
    List<Map<String, Object>> rows =
        returnRequestRepository.findAll().stream()
            .sorted(
                Comparator.comparing(ReturnRequest::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                    .reversed())
            .map(
                r -> {
                  Map<String, Object> m = new HashMap<>();
                  m.put("id", r.getId());
                  m.put("customerName", r.getCustomerName());
                  m.put("contactNumber", r.getContactNumber());
                  m.put("email", r.getEmail());
                  m.put("orderId", r.getOrderId());
                  m.put("issueText", r.getIssueText());
                  m.put("createdAt", r.getCreatedAt());
                  m.put("hasVideo", (r.getVideoPath() != null && !r.getVideoPath().isBlank()));
                  return m;
                })
            .collect(Collectors.toList());
    return ResponseEntity.ok(rows);
  }

  @GetMapping("/{id}/video")
  public ResponseEntity<byte[]> video(@PathVariable Long id) {
    ReturnRequest r = returnRequestRepository.findById(id).orElse(null);
    if (r == null) {
      return ResponseEntity.notFound().build();
    }
    byte[] data = null;
    if (r.getVideoPath() != null && !r.getVideoPath().isBlank()) {
      try {
        Path p = Paths.get(r.getVideoPath());
        if (Files.exists(p)) {
          data = Files.readAllBytes(p);
        }
      } catch (Exception ignored) {
      }
    }
    if (data == null || data.length == 0) {
      return ResponseEntity.notFound().build();
    }

    HttpHeaders headers = new HttpHeaders();
    String ct = r.getVideoContentType();
    if (ct != null && !ct.isBlank()) {
      headers.setContentType(MediaType.parseMediaType(ct));
    } else {
      headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
    }
    headers.set("Content-Disposition", "inline; filename=\"return-video-" + id + "\"");
    return ResponseEntity.ok().headers(headers).body(data);
  }
}
