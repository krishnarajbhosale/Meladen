package com.meladen.service;

import com.meladen.dto.CelebPhotoResponse;
import com.meladen.entity.CelebPhoto;
import com.meladen.repository.CelebPhotoRepository;
import com.meladen.repository.CelebPhotoSummary;
import com.meladen.util.UploadSizeValidator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class CelebPhotoService {

  private final CelebPhotoRepository repository;
  private final UploadSizeValidator uploadSizeValidator;

  @Transactional(readOnly = true)
  public List<CelebPhotoResponse> listPublic() {
    try {
      return repository.findAllSummaries().stream().map(this::toResponse).toList();
    } catch (Exception e) {
      log.error("Failed to list celeb photos: {}", e.getMessage(), e);
      throw e;
    }
  }

  @Transactional(readOnly = true)
  public List<CelebPhotoResponse> listAdmin() {
    return listPublic();
  }

  @Transactional(readOnly = true)
  public ImagePayload getImage(Long id) {
    CelebPhoto row =
        repository
            .findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Photo not found"));
    if (row.getImageBlob() == null || row.getImageBlob().length == 0) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Image missing");
    }
    String type =
        row.getImageContentType() != null && !row.getImageContentType().isBlank()
            ? row.getImageContentType()
            : "image/jpeg";
    return new ImagePayload(row.getImageBlob(), type);
  }

  @Transactional
  public CelebPhotoResponse create(String sectionName, Integer sortOrder, MultipartFile image) {
    String name = normalizeSectionName(sectionName);
    CelebPhoto row = new CelebPhoto();
    row.setSectionName(name);
    row.setSortOrder(sortOrder != null ? sortOrder : 0);
    applyImage(row, image);
    return toResponse(repository.save(row));
  }

  @Transactional
  public CelebPhotoResponse updateMeta(Long id, String sectionName, Integer sortOrder) {
    CelebPhoto row = load(id);
    if (sectionName != null && !sectionName.isBlank()) {
      row.setSectionName(normalizeSectionName(sectionName));
    }
    if (sortOrder != null) {
      row.setSortOrder(sortOrder);
    }
    return toResponse(repository.save(row));
  }

  @Transactional
  public CelebPhotoResponse replaceImage(Long id, MultipartFile image) {
    CelebPhoto row = load(id);
    applyImage(row, image);
    return toResponse(repository.save(row));
  }

  @Transactional
  public void delete(Long id) {
    if (!repository.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Photo not found");
    }
    repository.deleteById(id);
  }

  private CelebPhoto load(Long id) {
    return repository
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Photo not found"));
  }

  private void applyImage(CelebPhoto row, MultipartFile image) {
    if (image == null || image.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image file is required");
    }
    uploadSizeValidator.validateImageFile(image, "Photo");
    try {
      row.setImageBlob(image.getBytes());
      String contentType = image.getContentType();
      row.setImageContentType(
          contentType != null && !contentType.isBlank() ? contentType : "image/jpeg");
    } catch (Exception ex) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read image file");
    }
  }

  private static String normalizeSectionName(String raw) {
    if (raw == null || raw.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Section name is required");
    }
    return raw.trim();
  }

  private CelebPhotoResponse toResponse(CelebPhoto row) {
    return toResponse(row.getId(), row.getSectionName(), row.getSortOrder());
  }

  private CelebPhotoResponse toResponse(CelebPhotoSummary row) {
    return toResponse(row.getId(), row.getSectionName(), row.getSortOrder());
  }

  private CelebPhotoResponse toResponse(Long id, String sectionName, Integer sortOrder) {
    return new CelebPhotoResponse(
        id,
        sectionName,
        sortOrder != null ? sortOrder : 0,
        "/api/public/celeb-photos/" + id + "/image");
  }

  public record ImagePayload(byte[] bytes, String contentType) {}
}
