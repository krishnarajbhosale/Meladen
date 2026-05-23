package com.meladen.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "meladen")
@Getter
@Setter
public class MeladenProperties {

  private Mail mail = new Mail();
  private Razorpay razorpay = new Razorpay();
  private Shiprocket shiprocket = new Shiprocket();

  @Getter
  @Setter
  public static class Mail {
    private String from = "team.meladenperfumes@gmail.com";
  }

  @Getter
  @Setter
  public static class Razorpay {
    private String keyId = "";
    private String keySecret = "";
  }

  @Getter
  @Setter
  public static class Shiprocket {
    private String email = "";
    private String password = "";
    private boolean enabled = true;
    private String pickupLocation = "Primary";
  }
}
