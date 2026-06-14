package com.meladen.controller;

import com.meladen.dto.CelebPhotoResponse;
import com.meladen.service.CelebPhotoService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/celeb-photos")
@RequiredArgsConstructor
public class AdminCelebPhotoController {

  private final CelebPhotoService celebPhotoService;

  @GetMapping
  public List<CelebPhotoResponse> list() {
    return celebPhotoService.listAdmin();
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public CelebPhotoResponse create(
      @RequestParam("sectionName") String sectionName,
      @RequestParam(value = "personName", required = false) String personName,
      @RequestParam(value = "personPosition", required = false) String personPosition,
      @RequestParam(value = "sortOrder", required = false) Integer sortOrder,
      @RequestPart("image") MultipartFile image) {
    return celebPhotoService.create(sectionName, personName, personPosition, sortOrder, image);
  }

  @PutMapping("/{id}")
  public CelebPhotoResponse updateMeta(
      @PathVariable Long id,
      @RequestParam(value = "sectionName", required = false) String sectionName,
      @RequestParam(value = "personName", required = false) String personName,
      @RequestParam(value = "personPosition", required = false) String personPosition,
      @RequestParam(value = "sortOrder", required = false) Integer sortOrder) {
    return celebPhotoService.updateMeta(
        id, sectionName, personName, personPosition, sortOrder);
  }

  @PutMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public CelebPhotoResponse replaceImage(
      @PathVariable Long id, @RequestPart("image") MultipartFile image) {
    return celebPhotoService.replaceImage(id, image);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Map<String, Boolean>> delete(@PathVariable Long id) {
    celebPhotoService.delete(id);
    return ResponseEntity.ok(Map.of("success", true));
  }
}
