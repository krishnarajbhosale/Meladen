package com.meladen.service;

import com.meladen.dto.CustomerReviewResponse;
import com.meladen.entity.CustomerReview;
import com.meladen.repository.CustomerReviewRepository;
import com.meladen.util.UploadSizeValidator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CustomerReviewService {

  private final CustomerReviewRepository repository;
  private final UploadSizeValidator uploadSizeValidator;

  @Transactional(readOnly = true)
  public List<CustomerReviewResponse> listPublic() {
    return repository.findAllByApprovedTrueOrderBySortOrderAscIdAsc().stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<CustomerReviewResponse> listAdmin() {
    return repository.findAllByOrderByCreatedAtDescIdDesc().stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public ImagePayload getPhoto(Long id) {
    CustomerReview row =
        repository
            .findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));
    if (row.getPhotoBlob() == null || row.getPhotoBlob().length == 0) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Photo missing");
    }
    String type =
        row.getPhotoContentType() != null && !row.getPhotoContentType().isBlank()
            ? row.getPhotoContentType()
            : "image/jpeg";
    return new ImagePayload(row.getPhotoBlob(), type);
  }

  @Transactional
  public CustomerReviewResponse createAdmin(
      String reviewerName,
      String reviewText,
      Integer sortOrder,
      MultipartFile photo,
      Boolean approved) {
    boolean publish = approved == null || approved;
    return create(reviewerName, reviewText, sortOrder, photo, publish);
  }

  @Transactional
  public CustomerReviewResponse approve(Long id) {
    CustomerReview row = load(id);
    row.setApproved(true);
    return toResponse(repository.save(row));
  }

  @Transactional
  public void delete(Long id) {
    if (!repository.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found");
    }
    repository.deleteById(id);
  }

  private CustomerReviewResponse create(
      String reviewerName,
      String reviewText,
      Integer sortOrder,
      MultipartFile photo,
      boolean approved) {
    CustomerReview row = new CustomerReview();
    row.setReviewerName(normalizeName(reviewerName));
    row.setReviewText(normalizeReview(reviewText));
    row.setSortOrder(sortOrder != null ? sortOrder : 0);
    row.setApproved(approved);
    applyPhoto(row, photo);
    return toResponse(repository.save(row));
  }

  private CustomerReview load(Long id) {
    return repository
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));
  }

  private void applyPhoto(CustomerReview row, MultipartFile photo) {
    if (photo == null || photo.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reviewer photo is required");
    }
    uploadSizeValidator.validateImageFile(photo, "Photo");
    try {
      row.setPhotoBlob(photo.getBytes());
      String contentType = photo.getContentType();
      row.setPhotoContentType(
          contentType != null && !contentType.isBlank() ? contentType : "image/jpeg");
    } catch (Exception ex) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read photo file");
    }
  }

  private static String normalizeName(String raw) {
    if (raw == null || raw.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reviewer name is required");
    }
    String trimmed = raw.trim();
    if (trimmed.length() > 200) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is too long");
    }
    return trimmed;
  }

  private static String normalizeReview(String raw) {
    if (raw == null || raw.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Review text is required");
    }
    String trimmed = raw.trim();
    if (trimmed.length() > 2000) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Review is too long (max 2000 characters)");
    }
    return trimmed;
  }

  private CustomerReviewResponse toResponse(CustomerReview row) {
    return new CustomerReviewResponse(
        row.getId(),
        row.getReviewerName(),
        row.getReviewText(),
        row.getSortOrder() != null ? row.getSortOrder() : 0,
        row.isApproved(),
        row.getCreatedAt(),
        "/api/public/customer-reviews/" + row.getId() + "/photo");
  }

  public record ImagePayload(byte[] bytes, String contentType) {}
}
