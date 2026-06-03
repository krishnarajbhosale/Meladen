package com.meladen.service;

import com.meladen.dto.NewsletterSubscriberResponse;
import com.meladen.entity.NewsletterSubscriber;
import com.meladen.repository.NewsletterSubscriberRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class NewsletterSubscriberService {

  private static final Pattern EMAIL_PATTERN =
      Pattern.compile("^[\\w.+-]+@[\\w.-]+\\.[A-Za-z]{2,}$");

  private final NewsletterSubscriberRepository repository;

  @Transactional
  public NewsletterSubscriberResponse subscribe(String rawEmail) {
    String email = normalizeEmail(rawEmail);
    if (email.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
    }
    if (!EMAIL_PATTERN.matcher(email).matches()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please enter a valid email address");
    }

    return repository
        .findByEmailIgnoreCase(email)
        .map(this::toResponse)
        .orElseGet(
            () -> {
              NewsletterSubscriber row = new NewsletterSubscriber();
              row.setEmail(email);
              return toResponse(repository.save(row));
            });
  }

  @Transactional(readOnly = true)
  public List<NewsletterSubscriberResponse> listForAdmin() {
    return repository.findAll().stream()
        .sorted(
            Comparator.comparing(
                    NewsletterSubscriber::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                .reversed())
        .map(this::toResponse)
        .toList();
  }

  @Transactional
  public void delete(Long id) {
    if (!repository.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscriber not found");
    }
    repository.deleteById(id);
  }

  private NewsletterSubscriberResponse toResponse(NewsletterSubscriber row) {
    return new NewsletterSubscriberResponse(row.getId(), row.getEmail(), row.getCreatedAt());
  }

  private String normalizeEmail(String raw) {
    if (raw == null) {
      return "";
    }
    return raw.trim().toLowerCase(Locale.ROOT);
  }
}
