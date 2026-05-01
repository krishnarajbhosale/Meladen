package com.meladen.service;

import com.meladen.entity.Customer;
import com.meladen.entity.CustomerOrder;
import com.meladen.entity.ReturnRequest;
import com.meladen.repository.CustomerOrderRepository;
import com.meladen.repository.CustomerRepository;
import com.meladen.repository.ReturnRequestRepository;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ReturnRequestService {

  @Value("${meladen.upload.returns-dir:uploads/returns}")
  private String returnsDir;

  private final ReturnRequestRepository returnRequestRepository;
  private final CustomerOrderRepository orderRepository;
  private final CustomerRepository customerRepository;

  public ReturnRequest submit(
      String customerName,
      String contactNumber,
      String email,
      String orderIdText,
      String issueText,
      MultipartFile video) {
    String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
    if (orderIdText == null || orderIdText.isBlank()) {
      throw new IllegalArgumentException("Order id is required");
    }
    String trimmedOrderId = orderIdText.trim();
    Optional<CustomerOrder> orderOpt = orderRepository.findById(trimmedOrderId);
    if (orderOpt.isEmpty()) {
      throw new IllegalArgumentException("Order not found");
    }
    CustomerOrder order = orderOpt.get();
    String orderEmail =
        order.getCustomerEmail() == null ? "" : order.getCustomerEmail().trim().toLowerCase();
    if (!orderEmail.equals(normalizedEmail)) {
      throw new IllegalArgumentException("This order does not belong to the provided email");
    }

    if (video == null || video.isEmpty()) {
      throw new IllegalArgumentException("A video is required to submit a return request");
    }

    ReturnRequest req = new ReturnRequest();
    req.setCustomerName(customerName == null ? "" : customerName.trim());
    req.setContactNumber(contactNumber == null ? "" : contactNumber.trim());
    req.setEmail(normalizedEmail);
    req.setOrderId(trimmedOrderId);
    req.setIssueText(issueText == null ? "" : issueText.trim());
    if (order.getCustomerId() != null) {
      req.setCustomerId(order.getCustomerId());
    } else {
      req.setCustomerId(
          customerRepository.findByEmailIgnoreCase(normalizedEmail).map(Customer::getId).orElse(null));
    }
    try {
      req.setVideoContentType(video.getContentType());
      String filename = UUID.randomUUID() + safeExtension(video.getOriginalFilename());
      Path dir = Paths.get(returnsDir);
      Files.createDirectories(dir);
      Path filePath = dir.resolve(filename);
      video.transferTo(filePath.toFile());
      req.setVideoPath(filePath.toString());
    } catch (Exception e) {
      throw new RuntimeException("Failed to save video file", e);
    }
    return returnRequestRepository.save(req);
  }

  private String safeExtension(String originalName) {
    if (originalName == null) {
      return "";
    }
    int dot = originalName.lastIndexOf('.');
    if (dot < 0 || dot == originalName.length() - 1) {
      return "";
    }
    String ext = originalName.substring(dot).toLowerCase();
    if (ext.length() > 10) {
      return "";
    }
    if (!ext.matches("\\.[a-z0-9]+")) {
      return "";
    }
    return ext;
  }
}
