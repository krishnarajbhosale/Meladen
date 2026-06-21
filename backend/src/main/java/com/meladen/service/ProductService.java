package com.meladen.service;

import com.meladen.dto.ProductAdminResponse;
import com.meladen.dto.ProductPublicResponse;
import com.meladen.dto.ProductRequest;
import com.meladen.entity.Category;
import com.meladen.entity.Product;
import com.meladen.repository.CategoryRepository;
import com.meladen.repository.CustomerOrderRepository;
import com.meladen.repository.ProductRepository;
import com.meladen.util.UploadSizeValidator;
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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ProductService {

  private static final String BRAND = "MELADEN";

  private final ProductRepository productRepository;
  private final CategoryRepository categoryRepository;
  private final CustomerOrderRepository orderRepository;
  private final UploadSizeValidator uploadSizeValidator;

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
    if (p.isArchived()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
    }
    return toPublic(p);
  }

  @Transactional(readOnly = true)
  public ProductImageData getGalleryImage(String id, int slot) {
    if (slot < 1 || slot > 3) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid gallery slot");
    }
    Product p =
        productRepository
            .findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    byte[] bytes = galleryBlob(p, slot);
    if (bytes == null || bytes.length == 0) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Gallery image not found");
    }
    String contentType = galleryContentType(p, slot);
    if (contentType == null || contentType.isBlank()) {
      contentType = "application/octet-stream";
    }
    return new ProductImageData(bytes, contentType);
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
  public ProductAdminResponse replaceGalleryImage(String id, int slot, MultipartFile image) {
    if (slot < 1 || slot > 3) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid gallery slot");
    }
    if (image == null || image.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image file is required");
    }
    Product p =
        productRepository
            .findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    uploadSizeValidator.validateImageFile(image, "Gallery image " + slot);
    try {
      byte[] bytes = image.getBytes();
      uploadSizeValidator.validateImageBytes(bytes, "Gallery image " + slot);
      String contentType =
          image.getContentType() != null && !image.getContentType().isBlank()
              ? image.getContentType()
              : "application/octet-stream";
      setGalleryBlob(p, slot, bytes);
      setGalleryContentType(p, slot, contentType);
      setGalleryString(p, slot, null);
      return toAdmin(productRepository.save(p));
    } catch (java.io.IOException ex) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read uploaded image");
    }
  }

  @Transactional
  public ProductAdminResponse deleteGalleryImage(String id, int slot) {
    if (slot < 1 || slot > 3) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid gallery slot");
    }
    Product p =
        productRepository
            .findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    clearGallerySlot(p, slot);
    return toAdmin(productRepository.save(p));
  }

  @Transactional
  public void delete(String id) {
    Product p =
        productRepository
            .findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    long usedInOrders = orderRepository.countItemsByProductId(id);
    if (usedInOrders > 0) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Cannot delete this product because it is used in existing customer orders.");
    }
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
    String listSize = listSizeForCard(p);

    List<String> gallery = new ArrayList<>();
    for (int slot = 1; slot <= 3; slot++) {
      String ref = resolveGalleryRef(p, slot);
      if (ref != null) {
        gallery.add(ref);
      }
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
        listSize,
        cardCategory,
        p.getTag(),
        image,
        gallery,
        description,
        new ProductPublicResponse.Notes(splitNotes(p.getNotesTop()), splitNotes(p.getNotesMiddle()), splitNotes(p.getNotesBase())),
        toNullableInt(p.getPrice30Ml()),
        toNullableInt(p.getPrice50Ml()),
        toNullableInt(p.getPrice100Ml()),
        toNullableInt(p.getPriceGel()),
        toNullableInt(p.getPriceAttar()),
        toNullableInt(p.getPriceCarPerfume()),
        nullToEmpty(p.getInspiredBy()),
        nullToEmpty(p.getLuxuryDescription()),
        nullToEmpty(p.getMood()),
        nullToEmpty(p.getOccasion()),
        nullToEmpty(p.getSeason()),
        nullToEmpty(p.getIdealFor()),
        nullToEmpty(p.getMoreInformation()),
        nullToEmpty(p.getHowToApply()),
        nullToEmpty(p.getSearchKeywords()),
        nullToEmpty(p.getCategory2()),
        p.getProductOil(),
        nullToEmpty(p.getConcentration()),
        p.isNew(),
        p.isBestseller(),
        p.isPremium());
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
        p.getPriceGel(),
        p.getPriceAttar(),
        p.getPriceCarPerfume(),
        p.getNotesTop(),
        p.getNotesMiddle(),
        p.getNotesBase(),
        p.getMoreInformation(),
        p.getHowToApply(),
        p.getSearchKeywords(),
        p.getCategory2(),
        p.getProductOil(),
        p.getConcentration(),
        "/api/public/products/" + p.getId() + "/image",
        p.getImageBlob() != null && p.getImageBlob().length > 0,
        resolveGalleryRef(p, 1),
        resolveGalleryRef(p, 2),
        resolveGalleryRef(p, 3),
        p.getTag(),
        p.isNew(),
        p.isBestseller(),
        p.isPremium(),
        p.isArchived());
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
    p.setPriceGel(r.priceGel());
    p.setPriceAttar(r.priceAttar());
    p.setPriceCarPerfume(r.priceCarPerfume());
    p.setNotesTop(r.notesTop());
    p.setNotesMiddle(r.notesMiddle());
    p.setNotesBase(r.notesBase());
    p.setMoreInformation(r.moreInformation());
    p.setHowToApply(r.howToApply());
    p.setSearchKeywords(r.searchKeywords());
    p.setCategory2(r.category2());
    p.setProductOil(r.productOil());
    p.setConcentration(r.concentration());
    if (Boolean.TRUE.equals(r.clearImage())) {
      p.setImageBlob(null);
      p.setImageContentType(null);
    } else if (r.imageBase64() != null && !r.imageBase64().isBlank()) {
      try {
        byte[] imageBytes = Base64.getDecoder().decode(r.imageBase64());
        uploadSizeValidator.validateImageBytes(imageBytes, "Primary image");
        p.setImageBlob(imageBytes);
        p.setImageContentType(r.imageContentType());
      } catch (IllegalArgumentException ex) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid image data");
      }
    }
    uploadSizeValidator.validateGalleryImageValue(r.galleryImage1(), "Gallery image 1");
    uploadSizeValidator.validateGalleryImageValue(r.galleryImage2(), "Gallery image 2");
    uploadSizeValidator.validateGalleryImageValue(r.galleryImage3(), "Gallery image 3");
    applyGallerySlot(p, 1, r.galleryImage1());
    applyGallerySlot(p, 2, r.galleryImage2());
    applyGallerySlot(p, 3, r.galleryImage3());
    p.setTag(r.tag());
    p.setNew(Boolean.TRUE.equals(r.isNew()));
    p.setBestseller(Boolean.TRUE.equals(r.isBestseller()));
    p.setPremium(Boolean.TRUE.equals(r.isPremium()));
    p.setArchived(Boolean.TRUE.equals(r.archived()));
  }

  private void applyGallerySlot(Product p, int slot, String value) {
    if (value == null || value.isBlank()) {
      clearGallerySlot(p, slot);
      return;
    }
    String trimmed = normalizeGalleryInput(value);
    if (isExistingGalleryApiUrl(p.getId(), slot, trimmed)) {
      return;
    }
    if (trimmed.regionMatches(true, 0, "data:", 0, 5)) {
      int comma = trimmed.indexOf(',');
      if (comma < 0 || comma >= trimmed.length() - 1) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid gallery image data for slot " + slot);
      }
      String meta = trimmed.substring(5, comma);
      String contentType = "application/octet-stream";
      int semicolon = meta.indexOf(';');
      if (semicolon > 0) {
        contentType = meta.substring(0, semicolon).trim();
      } else if (!meta.isBlank()) {
        contentType = meta.trim();
      }
      try {
        byte[] bytes = Base64.getDecoder().decode(trimmed.substring(comma + 1).trim());
        uploadSizeValidator.validateImageBytes(bytes, "Gallery image " + slot);
        setGalleryBlob(p, slot, bytes);
        setGalleryContentType(p, slot, contentType);
        setGalleryString(p, slot, null);
      } catch (IllegalArgumentException ex) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid gallery image data for slot " + slot);
      }
      return;
    }
    setGalleryString(p, slot, trimmed);
    setGalleryBlob(p, slot, null);
    setGalleryContentType(p, slot, null);
  }

  private String resolveGalleryRef(Product p, int slot) {
    byte[] blob = galleryBlob(p, slot);
    if (blob != null && blob.length > 0) {
      return galleryApiPath(p.getId(), slot);
    }
    String url = galleryString(p, slot);
    if (url != null && !url.isBlank()) {
      return url.trim();
    }
    return null;
  }

  private boolean isExistingGalleryApiUrl(String productId, int slot, String value) {
    if (productId == null || productId.isBlank()) {
      return false;
    }
    String normalized = normalizeGalleryInput(value);
    String path = galleryApiPath(productId, slot);
    return normalized.equals(path) || normalized.endsWith(path);
  }

  private String normalizeGalleryInput(String value) {
    if (value == null) {
      return "";
    }
    String trimmed = value.trim();
    int query = trimmed.indexOf('?');
    return query >= 0 ? trimmed.substring(0, query).trim() : trimmed;
  }

  private String galleryApiPath(String productId, int slot) {
    return "/api/public/products/" + productId + "/gallery/" + slot;
  }

  private void clearGallerySlot(Product p, int slot) {
    setGalleryString(p, slot, null);
    setGalleryBlob(p, slot, null);
    setGalleryContentType(p, slot, null);
  }

  private byte[] galleryBlob(Product p, int slot) {
    return switch (slot) {
      case 1 -> p.getGalleryBlob1();
      case 2 -> p.getGalleryBlob2();
      case 3 -> p.getGalleryBlob3();
      default -> null;
    };
  }

  private String galleryContentType(Product p, int slot) {
    return switch (slot) {
      case 1 -> p.getGalleryContentType1();
      case 2 -> p.getGalleryContentType2();
      case 3 -> p.getGalleryContentType3();
      default -> null;
    };
  }

  private String galleryString(Product p, int slot) {
    return switch (slot) {
      case 1 -> p.getGalleryImage1();
      case 2 -> p.getGalleryImage2();
      case 3 -> p.getGalleryImage3();
      default -> null;
    };
  }

  private void setGalleryBlob(Product p, int slot, byte[] bytes) {
    switch (slot) {
      case 1 -> p.setGalleryBlob1(bytes);
      case 2 -> p.setGalleryBlob2(bytes);
      case 3 -> p.setGalleryBlob3(bytes);
      default -> {}
    }
  }

  private void setGalleryContentType(Product p, int slot, String contentType) {
    switch (slot) {
      case 1 -> p.setGalleryContentType1(contentType);
      case 2 -> p.setGalleryContentType2(contentType);
      case 3 -> p.setGalleryContentType3(contentType);
      default -> {}
    }
  }

  private void setGalleryString(Product p, int slot, String value) {
    switch (slot) {
      case 1 -> p.setGalleryImage1(value);
      case 2 -> p.setGalleryImage2(value);
      case 3 -> p.setGalleryImage3(value);
      default -> {}
    }
  }

  private boolean isPerfumeCategory(Product p) {
    Category c = p.getCategory();
    if (c == null || c.getName() == null) return false;
    return c.getName().toLowerCase().contains("perfume");
  }

  private BigDecimal primaryPrice(Product p) {
    if (isPerfumeCategory(p) && p.getPrice30Ml() != null) {
      return p.getPrice30Ml();
    }
    if (p.getPrice50Ml() != null) return p.getPrice50Ml();
    if (p.getPrice30Ml() != null) return p.getPrice30Ml();
    if (p.getPrice100Ml() != null) return p.getPrice100Ml();
    if (p.getPriceGel() != null) return p.getPriceGel();
    if (p.getPriceAttar() != null) return p.getPriceAttar();
    if (p.getPriceCarPerfume() != null) return p.getPriceCarPerfume();
    return BigDecimal.ZERO;
  }

  private String listSizeForCard(Product p) {
    if (isPerfumeCategory(p) && p.getPrice30Ml() != null) {
      return "30ml";
    }
    if (p.getPrice50Ml() != null) return "50ml";
    if (p.getPrice30Ml() != null) return "30ml";
    if (p.getPrice100Ml() != null) return "100ml";
    if (p.getPriceGel() != null) return "Perfume Gel";
    if (p.getPriceAttar() != null) return "Attar";
    if (p.getPriceCarPerfume() != null) return "Car Perfume";
    return "50ml";
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
