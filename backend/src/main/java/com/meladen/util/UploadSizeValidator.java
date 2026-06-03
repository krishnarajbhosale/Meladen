package com.meladen.util;

import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Component
public class UploadSizeValidator {

  @Value("${meladen.upload.max-image-bytes:5242880}")
  private long maxImageBytes;

  public long getMaxImageBytes() {
    return maxImageBytes;
  }

  public int getMaxImageMegabytes() {
    return (int) (maxImageBytes / (1024 * 1024));
  }

  public void validateImageBytes(byte[] bytes, String fieldLabel) {
    if (bytes != null && bytes.length > maxImageBytes) {
      throw tooLarge(fieldLabel);
    }
  }

  public void validateImageFile(MultipartFile file, String fieldLabel) {
    if (file != null && !file.isEmpty() && file.getSize() > maxImageBytes) {
      throw tooLarge(fieldLabel);
    }
  }

  /** Gallery values may be a data URL (base64) or a plain URL/path. */
  public void validateGalleryImageValue(String value, String fieldLabel) {
    if (value == null || value.isBlank()) {
      return;
    }
    String trimmed = value.trim();
    if (!trimmed.regionMatches(true, 0, "data:", 0, 5)) {
      return;
    }
    int comma = trimmed.indexOf(',');
    if (comma < 0 || comma >= trimmed.length() - 1) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid image data for " + fieldLabel);
    }
    try {
      byte[] decoded = Base64.getDecoder().decode(trimmed.substring(comma + 1).trim());
      validateImageBytes(decoded, fieldLabel);
    } catch (IllegalArgumentException ex) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid image data for " + fieldLabel);
    }
  }

  private ResponseStatusException tooLarge(String fieldLabel) {
    return new ResponseStatusException(
        HttpStatus.BAD_REQUEST,
        fieldLabel + " must be " + getMaxImageMegabytes() + " MB or smaller");
  }
}
