package com.meladen.service;

import com.meladen.config.MeladenProperties;
import com.meladen.entity.CustomerOrder;
import com.meladen.entity.CustomerOrderItem;
import java.math.BigDecimal;
import java.math.RoundingMode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderMailService {

  private final JavaMailSender mailSender;
  private final MeladenProperties properties;

  public void sendOrderPendingEmail(CustomerOrder order) {
    String subject = "Meladen — Order pending payment · " + order.getOrderNumber();
    String html = buildOrderHtml(order, "Your order is pending payment", true, false);
    send(order.getCustomerEmail(), subject, html);
  }

  public void sendOrderConfirmedEmail(CustomerOrder order) {
    boolean cod = order.getPaymentMethod() != null && "COD".equalsIgnoreCase(order.getPaymentMethod());
    String subject =
        cod
            ? "Meladen — Order confirmed (Cash on Delivery) · " + order.getOrderNumber()
            : "Meladen — Order confirmed · " + order.getOrderNumber();
    String headline =
        cod
            ? "Your Cash on Delivery order is confirmed"
            : "Thank you — your payment was received";
    String html = buildOrderHtml(order, headline, false, cod);
    send(order.getCustomerEmail(), subject, html);
  }

  public boolean sendLoginOtpEmail(String to, String otp) {
    String subject = "Meladen — Your sign-in code";
    String html =
        """
        <!DOCTYPE html><html><body style="margin:0;background:#0a0a0a;color:#e8e4dc;font-family:Georgia,serif;">
        <div style="max-width:480px;margin:0 auto;padding:32px 24px;">
        <p style="letter-spacing:0.2em;font-size:11px;color:#888;text-transform:uppercase;">Meladen</p>
        <h1 style="font-weight:500;font-size:22px;color:#e8e4dc;">Sign in to your account</h1>
        <p style="color:#aaa;font-size:14px;line-height:1.6;">Use this one-time code to sign in. It expires in <strong>5 minutes</strong>.</p>
        <p style="margin:28px 0;font-size:32px;letter-spacing:0.35em;color:#c9a962;font-weight:500;">%s</p>
        <p style="color:#666;font-size:12px;">If you did not request this code, you can ignore this email.</p>
        </div></body></html>
        """
            .formatted(escape(otp));
    return send(to, subject, html);
  }

  private boolean send(String to, String subject, String html) {
    if (to == null || to.isBlank()) {
      return false;
    }
    try {
      var message = mailSender.createMimeMessage();
      var helper = new MimeMessageHelper(message, true, "UTF-8");
      helper.setFrom(properties.getMail().getFrom());
      helper.setTo(to.trim());
      helper.setSubject(subject);
      helper.setText(html, true);
      mailSender.send(message);
      return true;
    } catch (Exception e) {
      log.warn("Failed to send email to {}: {}", to, e.getMessage(), e);
      return false;
    }
  }

  private static String buildOrderHtml(CustomerOrder order, String headline, boolean pending, boolean cod) {
    StringBuilder items = new StringBuilder();
    for (CustomerOrderItem i : order.getItems()) {
      items.append("<tr><td style=\"padding:8px 0;border-bottom:1px solid #333;\">")
          .append(escape(i.getProductName()))
          .append(" · ")
          .append(escape(i.getSizeLabel()))
          .append(" × ")
          .append(i.getQuantity())
          .append("</td><td style=\"padding:8px 0;border-bottom:1px solid #333;text-align:right;\">₹")
          .append(money(i.getLineTotal()))
          .append("</td></tr>");
    }
    String tracking =
        order.getTrackingUrl() != null && !order.getTrackingUrl().isBlank()
            ? "<p style=\"color:#c9a962;\">Track shipment: <a href=\""
                + escape(order.getTrackingUrl())
                + "\" style=\"color:#c9a962;\">"
                + escape(order.getTrackingUrl())
                + "</a></p>"
            : "";
    String cta =
        pending
            ? "<p style=\"color:#aaa;\">Complete payment on the Meladen website to confirm your order.</p>"
            : cod
                ? "<p style=\"color:#aaa;\">Pay in cash when your order is delivered. We are preparing your shipment.</p>"
                : "<p style=\"color:#aaa;\">We are preparing your order with care.</p>";

    return """
        <!DOCTYPE html><html><body style="margin:0;background:#0a0a0a;color:#e8e4dc;font-family:Georgia,serif;">
        <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
        <p style="letter-spacing:0.2em;font-size:11px;color:#888;text-transform:uppercase;">Meladen</p>
        <h1 style="font-weight:500;font-size:22px;color:#e8e4dc;">%s</h1>
        <p style="color:#aaa;font-size:14px;">Order <strong style="color:#c9a962;">%s</strong></p>
        %s
        <table style="width:100%%;margin:24px 0;font-size:14px;border-collapse:collapse;">
        <thead><tr><th style="text-align:left;color:#888;font-size:11px;text-transform:uppercase;">Items</th>
        <th style="text-align:right;color:#888;font-size:11px;text-transform:uppercase;">Amount</th></tr></thead>
        <tbody>%s</tbody></table>
        <p style="font-size:14px;"><strong>Subtotal:</strong> ₹%s</p>
        %s
        %s
        <p style="font-size:14px;"><strong>Total:</strong> <span style="color:#c9a962;">₹%s</span></p>
        <hr style="border:none;border-top:1px solid #333;margin:24px 0;">
        <p style="font-size:13px;color:#888;">%s<br>%s, %s %s<br>%s</p>
        %s
        </div></body></html>
        """
        .formatted(
            escape(headline),
            escape(order.getOrderNumber()),
            cta,
            items,
            money(order.getSubtotal()),
            discountLine(order),
            walletLine(order),
            money(order.getTotal()),
            escape(order.getCustomerName()),
            escape(order.getAddress()),
            escape(order.getCity()),
            escape(order.getPostcode()),
            escape(order.getCountry()),
            tracking);
  }

  private static String discountLine(CustomerOrder order) {
    if (order.getDiscountAmount() != null
        && order.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
      return "<p style=\"font-size:14px;\"><strong>Discount"
          + (order.getPromoCode() != null ? " (" + escape(order.getPromoCode()) + ")" : "")
          + ":</strong> −₹"
          + money(order.getDiscountAmount())
          + "</p>";
    }
    return "";
  }

  private static String walletLine(CustomerOrder order) {
    if (order.getWalletDiscount() != null
        && order.getWalletDiscount().compareTo(BigDecimal.ZERO) > 0) {
      return "<p style=\"font-size:14px;\"><strong>Wallet:</strong> −₹" + money(order.getWalletDiscount()) + "</p>";
    }
    return "";
  }

  private static String money(BigDecimal v) {
    return v == null ? "0.00" : v.setScale(2, RoundingMode.HALF_UP).toPlainString();
  }

  private static String escape(String s) {
    if (s == null) {
      return "";
    }
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
  }
}
