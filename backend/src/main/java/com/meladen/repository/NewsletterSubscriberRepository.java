package com.meladen.repository;

import com.meladen.entity.NewsletterSubscriber;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsletterSubscriberRepository extends JpaRepository<NewsletterSubscriber, Long> {

  Optional<NewsletterSubscriber> findByEmailIgnoreCase(String email);

  boolean existsByEmailIgnoreCase(String email);
}
