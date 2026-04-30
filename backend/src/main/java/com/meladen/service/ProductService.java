package com.meladen.service;

import com.meladen.dto.ProductAdminResponse;
import com.meladen.dto.ProductPublicResponse;
import com.meladen.dto.ProductRequest;
import com.meladen.entity.Category;
import com.meladen.entity.Product;
import com.meladen.repository.CategoryRepository;
import com.meladen.repository.ProductRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ProductService {

  private static final String BRAND = "MELADEN";

  private final ProductRepository productRepository;
  private final CategoryRepository categoryRepository;

  @Transactional(readOnly = true)
  public List<ProductAdminResponse> listForAdmin() {
    return productRepository.findAllForAdmin().stream()
        .sorted(
            Comparator.comparing(
                    (Product p) -> p.getCategory().getSortOrder(),
                    Comparator.nullsLast(Integer::compareTo))
                .thenComparing(p -> p.getCategory().getName(), Comparator.nullsLast(String::compareToIgnoreCase))
                .thenComparing(Product::getMeladenFragrance, Comparator.nullsLast(String::compareToIgnoreCase)))
        .map(this::toAdmin)
        .toList();
  }

  @Transactional(readOnly = true)
  public ProductAdminResponse getForAdmin(String id) {
    Product p =
        productRepository
            .findDetailById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    return toAdmin(p);
  }

  @Transactional(readOnly = true)
  public ProductPublicResponse getPublic(String id) {
    Product p =
        productRepository
            .findDetailById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    return toPublic(p);
  }

  @Transactional(readOnly = true)
  public ProductImageData getImage(String id) {
    Product p =
        productRepository
            .findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    if (p.getImageBlob() == null || p.getImageBlob().length == 0) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product image not found");
    }
    String contentType =
        p.getImageContentType() != null && !p.getImageContentType().isBlank()
            ? p.getImageContentType()
            : "application/octet-stream";
    return new ProductImageData(p.getImageBlob(), contentType);
  }

  @Transactional
  public ProductAdminResponse create(ProductRequest request) {
    Category category =
        categoryRepository
            .findById(request.categoryId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid category"));

    Product p = new Product();
    p.setId(UUID.randomUUID().toString());
    apply(p, request, category);
    return toAdmin(productRepository.save(p));
  }

  @Transactional
  public ProductAdminResponse update(String id, ProductRequest request) {
    Product p =
        productRepository
            .findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    Category category =
        categoryRepository
            .findById(request.categoryId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid category"));
    apply(p, request, category);
    return toAdmin(productRepository.save(p));
  }

  @Transactional
  public void delete(String id) {
    Product p =
        productRepository
            .findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    productRepository.delete(p);
  }

  public ProductPublicResponse toPublic(Product p) {
    Category c = p.getCategory();
    String cardCategory =
        p.getConcentration() != null && !p.getConcentration().isBlank()
            ? p.getConcentration()
            : c.getName();

    BigDecimal primary = primaryPrice(p);
    int price = toInt(primary);

    List<String> gallery = new ArrayList<>();
    if (p.getGalleryImage1() != null && !p.getGalleryImage1().isBlank()) {
      gallery.add(p.getGalleryImage1());
    }
    if (p.getGalleryImage2() != null && !p.getGalleryImage2().isBlank()) {
      gallery.add(p.getGalleryImage2());
    }
    if (p.getGalleryImage3() != null && !p.getGalleryImage3().isBlank()) {
      gallery.add(p.getGalleryImage3());
    }

    String image = "/api/public/products/" + p.getId() + "/image";

    String description =
        p.getLuxuryDescription() != null && !p.getLuxuryDescription().isBlank()
            ? p.getLuxuryDescription()
            : "";

    return new ProductPublicResponse(
        p.getId(),
        p.getMeladenFragrance(),
        BRAND,
        price,
        "50ml",
        cardCategory,
        p.getTag(),
        image,
        gallery,
        description,
        new ProductPublicResponse.Notes(splitNotes(p.getNotesTop()), splitNotes(p.getNotesMiddle()), splitNotes(p.getNotesBase())),
        toNullableInt(p.getPrice30Ml()),
        toNullableInt(p.getPrice50Ml()),
        toNullableInt(p.getPrice100Ml()),
        nullToEmpty(p.getInspiredBy()),
        nullToEmpty(p.getLuxuryDescription()),
        nullToEmpty(p.getMood()),
        nullToEmpty(p.getOccasion()),
        nullToEmpty(p.getSeason()),
        nullToEmpty(p.getIdealFor()),
        nullToEmpty(p.getMoreInformation()),
        nullToEmpty(p.getSearchKeywords()),
        nullToEmpty(p.getCategory2()),
        p.getProductOil(),
        nullToEmpty(p.getConcentration()),
        p.isNew(),
        p.isBestseller());
  }

  private ProductAdminResponse toAdmin(Product p) {
    Category c = p.getCategory();
    return new ProductAdminResponse(
        p.getId(),
        c.getId(),
        c.getName(),
        p.getMeladenFragrance(),
        p.getInspiredBy(),
        p.getLuxuryDescription(),
        p.getMood(),
        p.getOccasion(),
        p.getSeason(),
        p.getIdealFor(),
        p.getPrice30Ml(),
        p.getPrice50Ml(),
        p.getPrice100Ml(),
        p.getNotesTop(),
        p.getNotesMiddle(),
        p.getNotesBase(),
        p.getMoreInformation(),
        p.getSearchKeywords(),
        p.getCategory2(),
        p.getProductOil(),
        p.getConcentration(),
        "/api/public/products/" + p.getId() + "/image",
        p.getImageBlob() != null && p.getImageBlob().length > 0,
        p.getGalleryImage1(),
        p.getGalleryImage2(),
        p.getGalleryImage3(),
        p.getTag(),
        p.isNew(),
        p.isBestseller());
  }

  private void apply(Product p, ProductRequest r, Category category) {
    p.setCategory(category);
    p.setMeladenFragrance(r.meladenFragrance().trim());
    p.setInspiredBy(r.inspiredBy());
    p.setLuxuryDescription(r.luxuryDescription());
    p.setMood(r.mood());
    p.setOccasion(r.occasion());
    p.setSeason(r.season());
    p.setIdealFor(r.idealFor());
    p.setPrice30Ml(r.price30Ml());
    p.setPrice50Ml(r.price50Ml());
    p.setPrice100Ml(r.price100Ml());
    p.setNotesTop(r.notesTop());
    p.setNotesMiddle(r.notesMiddle());
    p.setNotesBase(r.notesBase());
    p.setMoreInformation(r.moreInformation());
    p.setSearchKeywords(r.searchKeywords());
    p.setCategory2(r.category2());
    p.setProductOil(r.productOil());
    p.setConcentration(r.concentration());
    if (Boolean.TRUE.equals(r.clearImage())) {
      p.setImageBlob(null);
      p.setImageContentType(null);
    } else if (r.imageBase64() != null && !r.imageBase64().isBlank()) {
      try {
        p.setImageBlob(Base64.getDecoder().decode(r.imageBase64()));
        p.setImageContentType(r.imageContentType());
      } catch (IllegalArgumentException ex) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid image data");
      }
    }
    p.setGalleryImage1(r.galleryImage1());
    p.setGalleryImage2(r.galleryImage2());
    p.setGalleryImage3(r.galleryImage3());
    p.setTag(r.tag());
    p.setNew(Boolean.TRUE.equals(r.isNew()));
    p.setBestseller(Boolean.TRUE.equals(r.isBestseller()));
  }

  private BigDecimal primaryPrice(Product p) {
    if (p.getPrice50Ml() != null) return p.getPrice50Ml();
    if (p.getPrice30Ml() != null) return p.getPrice30Ml();
    if (p.getPrice100Ml() != null) return p.getPrice100Ml();
    return BigDecimal.ZERO;
  }

  private int toInt(BigDecimal v) {
    if (v == null) return 0;
    return v.setScale(0, RoundingMode.HALF_UP).intValue();
  }

  private Integer toNullableInt(BigDecimal v) {
    if (v == null) return null;
    return v.setScale(0, RoundingMode.HALF_UP).intValue();
  }

  private List<String> splitNotes(String raw) {
    if (raw == null || raw.isBlank()) return List.of();
    return Arrays.stream(raw.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
  }

  private String nullToEmpty(String s) {
    return s == null ? "" : s;
  }

  public record ProductImageData(byte[] bytes, String contentType) {}
}
