package com.meladen.controller;

import com.meladen.dto.CelebPhotoResponse;
import com.meladen.service.CelebPhotoService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/celeb-photos")
@RequiredArgsConstructor
public class PublicCelebPhotoController {

  private final CelebPhotoService celebPhotoService;

  @GetMapping
  public List<CelebPhotoResponse> list() {
    return celebPhotoService.listPublic();
  }

  @GetMapping("/{id}/image")
  public ResponseEntity<byte[]> image(@PathVariable Long id) {
    var image = celebPhotoService.getImage(id);
    return ResponseEntity.ok()
        .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
        .contentType(MediaType.parseMediaType(image.contentType()))
        .body(image.bytes());
  }
}
