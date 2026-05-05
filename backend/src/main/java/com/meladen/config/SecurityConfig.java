package com.meladen.config;

import com.meladen.security.ApiPathNormalizationFilter;
import com.meladen.security.AuthorizationHeaderBridgeFilter;
import com.meladen.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

  private final JwtAuthFilter jwtAuthFilter;

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(AbstractHttpConfigurer::disable)
        .cors(Customizer.withDefaults())
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

        .authorizeHttpRequests(auth -> auth
            // Preflight
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

            // Public APIs (and paths when /api is stripped by reverse proxy)
            .requestMatchers("/api/public/**", "/public/**").permitAll()
            .requestMatchers("/api/auth/**", "/auth/**").permitAll()

            // Admin login UI
            .requestMatchers("/ladmin/**").permitAll()

            // Protected (and /admin/** when proxy strips /api)
            .requestMatchers("/api/admin/**", "/admin/**").authenticated()

            // Everything else
            .anyRequest().permitAll())

        .exceptionHandling(e -> e
            .authenticationEntryPoint((req, res, ex) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED)))

        .httpBasic(AbstractHttpConfigurer::disable)
        .addFilterBefore(new ApiPathNormalizationFilter(), JwtAuthFilter.class)
        .addFilterBefore(new AuthorizationHeaderBridgeFilter(), JwtAuthFilter.class)
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }
}