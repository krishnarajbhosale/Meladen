package com.meladen.security;

import com.meladen.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private final JwtProperties props;
  private final SecretKey key;

  public JwtService(JwtProperties props) {
    this.props = props;
    this.key = Keys.hmacShaKeyFor(props.getSecret().getBytes(StandardCharsets.UTF_8));
  }

  public String generateToken(String email) {
    long now = System.currentTimeMillis();
    long exp = now + props.getExpirationMs();
    return Jwts.builder()
        .subject(email)
        .claim("role", "ADMIN")
        .issuedAt(new Date(now))
        .expiration(new Date(exp))
        .signWith(key)
        .compact();
  }

  public boolean isTokenValid(String token) {
    try {
      Claims claims = parseAllClaims(token);
      return claims.getExpiration().after(new Date());
    } catch (Exception e) {
      return false;
    }
  }

  public String extractSubject(String token) {
    return parseAllClaims(token).getSubject();
  }

  private Claims parseAllClaims(String token) {
    return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
  }
}
