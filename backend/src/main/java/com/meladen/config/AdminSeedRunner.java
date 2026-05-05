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
    String seedEmail = seedProperties.getEmail();
    String seedPassword = seedProperties.getPassword();

    AdminUser user = adminUserRepository.findByEmailIgnoreCase(seedEmail).orElseGet(AdminUser::new);
    user.setEmail(seedEmail);
    user.setPasswordHash(passwordEncoder.encode(seedPassword));
    adminUserRepository.save(user);
  }
}
