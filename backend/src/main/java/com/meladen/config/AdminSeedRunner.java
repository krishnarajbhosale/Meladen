package com.meladen.config;

import com.meladen.entity.AdminUser;
import com.meladen.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminSeedRunner implements ApplicationRunner {

  private final AdminUserRepository adminUserRepository;
  private final PasswordEncoder passwordEncoder;
  private final SeedProperties seedProperties;

  @Override
  public void run(ApplicationArguments args) {
    if (adminUserRepository.findByEmailIgnoreCase(seedProperties.getEmail()).isPresent()) {
      return;
    }
    AdminUser user = new AdminUser();
    user.setEmail(seedProperties.getEmail());
    user.setPasswordHash(passwordEncoder.encode(seedProperties.getPassword()));
    adminUserRepository.save(user);
  }
}
