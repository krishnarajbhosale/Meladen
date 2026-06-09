package com.meladen.service;

import com.meladen.config.MeladenProperties;
import com.meladen.entity.CustomerOrder;
import com.meladen.entity.CustomerOrderItem;
import com.meladen.util.ShippingAddressFormatter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderMailService {

  private static final DateTimeFormatter ORDER_DATE_FMT =
      DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH).withZone(ZoneId.of("Asia/Kolkata"));

  private final JavaMailSender mailSender;
  private final MeladenProperties properties;
  private final InvoicePdfService invoicePdfService;

  public void sendOrderPendingEmail(CustomerOrder order) {
    String subject = "Meladen — Complete your order · " + order.getOrderNumber();
    String html =
        buildProfessionalEmail(
            order,
            "Your order is reserved",
            "Complete payment on the Méladen website to confirm your order. Once paid, we will send your invoice and begin preparing your shipment.",
            true,
            false,
            false);
    send(order.getCustomerEmail(), subject, html, null, null);
  }

  public void sendAdminNewOrderNotification(CustomerOrder order) {
    String adminTo = properties.getMail().getAdminNotifyTo();
    if (adminTo == null || adminTo.isBlank()) {
      return;
    }
    String subject = "Meladen — New order · " + order.getOrderNumber();
    String html = buildAdminNewOrderEmail(order);
    send(adminTo.trim(), subject, html, null, null);
  }

  public void sendOrderConfirmedEmail(CustomerOrder order) {
    boolean cod = order.getPaymentMethod() != null && "COD".equalsIgnoreCase(order.getPaymentMethod());
    String subject =
        cod
            ? "Meladen — Order confirmed · Invoice attached · " + order.getOrderNumber()
            : "Meladen — Order confirmed · Invoice attached · " + order.getOrderNumber();
    String headline =
        cod ? "Your Cash on Delivery order is confirmed" : "Thank you — your order is confirmed";
    String message =
        cod
            ? "Pay in cash when your order is delivered. Your tax invoice is attached to this email for your records."
            : "Your payment was received successfully. Your tax invoice is attached to this email for your records.";
    String html = buildProfessionalEmail(order, headline, message, false, cod, true);

    byte[] invoice = null;
    String invoiceName = null;
    try {
      invoice = invoicePdfService.generateInvoice(order);
      invoiceName = invoicePdfService.invoiceFileName(order);
    } catch (Exception e) {
      log.warn("Invoice PDF generation failed for order {}: {}", order.getOrderNumber(), e.getMessage());
    }

    send(order.getCustomerEmail(), subject, html, invoice, invoiceName);
  }

  public boolean sendLoginOtpEmail(String to, String otp) {
    String subject = "Meladen — Your sign-in code";
    String html =
        """
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#0d0d0d;font-family:Georgia,'Times New Roman',serif;">
        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;">
        <tr><td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%%" style="max-width:480px;background:#141414;border:1px solid #2a2a2a;border-radius:16px;">
        <tr><td style="padding:32px 28px;">
        <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#888;">Méladen</p>
        <h1 style="margin:0 0 16px;font-size:22px;font-weight:500;color:#f5f0e8;">Sign in to your account</h1>
        <p style="margin:0 0 24px;font-size:14px;line-height:1.65;color:#b8b3ac;">Use this one-time code to sign in. It expires in <strong style="color:#e8e4dc;">5 minutes</strong>.</p>
        <p style="margin:0 0 24px;font-size:32px;letter-spacing:0.3em;color:#c9a84c;font-weight:500;">%s</p>
        <p style="margin:0;font-size:12px;color:#666;">If you did not request this code, you can ignore this email.</p>
        </td></tr></table>
        </td></tr></table>
        </body></html>
        """
            .formatted(escape(otp));
    return send(to, subject, html, null, null);
  }

  private boolean send(String to, String subject, String html, byte[] attachment, String attachmentName) {
    if (to == null || to.isBlank()) {
      return false;
    }
    try {
      var message = mailSender.createMimeMessage();
      var helper = new MimeMessageHelper(message, true, "UTF-8");
      helper.setFrom(properties.getMail().getFrom(), "Méladen");
      helper.setTo(to.trim());
      helper.setSubject(subject);
      helper.setText(html, true);
      if (attachment != null && attachment.length > 0 && attachmentName != null) {
        helper.addAttachment(attachmentName, new ByteArrayResource(attachment), "application/pdf");
      }
      mailSender.send(message);
      return true;
    } catch (Exception e) {
      log.warn("Failed to send email to {}: {}", to, e.getMessage(), e);
      return false;
    }
  }

  private String buildAdminNewOrderEmail(CustomerOrder order) {
    StringBuilder itemRows = new StringBuilder();
    for (CustomerOrderItem i : order.getItems()) {
      itemRows.append(
          "<tr><td style=\"padding:8px 0;border-bottom:1px solid #eee;font-size:14px;color:#333;\">"
              + escape(i.getProductName())
              + " · "
              + escape(i.getSizeLabel())
              + " × "
              + i.getQuantity()
              + "</td><td style=\"padding:8px 0;border-bottom:1px solid #eee;font-size:14px;color:#333;text-align:right;\">₹"
              + money(i.getLineTotal())
              + "</td></tr>");
    }

    return """
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#f5f5f5;font-family:Georgia,'Times New Roman',serif;">
        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;">
        <tr><td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%%" style="max-width:560px;background:#fff;border:1px solid #e5e5e5;border-radius:12px;">
        <tr><td style="padding:28px 24px;">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#888;">Méladen Admin</p>
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:500;color:#111;">New order received</h1>
        <p style="margin:0 0 20px;font-size:14px;color:#666;">Order <strong style="color:#c9a84c;">%s</strong> · %s</p>
        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr><td style="padding:4px 0;font-size:13px;color:#888;">Customer</td>
        <td style="padding:4px 0;font-size:13px;color:#111;text-align:right;">%s</td></tr>
        <tr><td style="padding:4px 0;font-size:13px;color:#888;">Email</td>
        <td style="padding:4px 0;font-size:13px;color:#111;text-align:right;">%s</td></tr>
        <tr><td style="padding:4px 0;font-size:13px;color:#888;">Phone</td>
        <td style="padding:4px 0;font-size:13px;color:#111;text-align:right;">%s</td></tr>
        <tr><td style="padding:4px 0;font-size:13px;color:#888;">Payment</td>
        <td style="padding:4px 0;font-size:13px;color:#111;text-align:right;">%s</td></tr>
        <tr><td style="padding:4px 0;font-size:13px;color:#888;">Status</td>
        <td style="padding:4px 0;font-size:13px;color:#111;text-align:right;">%s</td></tr>
        </table>
        <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#888;">Items</p>
        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0">%s</table>
        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
        <tr><td style="padding:8px 0;font-size:15px;font-weight:600;color:#111;border-top:1px solid #eee;">Total</td>
        <td style="padding:8px 0;font-size:15px;font-weight:600;color:#c9a84c;text-align:right;border-top:1px solid #eee;">₹%s</td></tr>
        </table>
        <p style="margin:20px 0 0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#888;">Ship to</p>
        <p style="margin:6px 0 0;font-size:14px;line-height:1.6;color:#333;">
        %s<br>%s<br>%s, %s<br>%s
        </p>
        </td></tr></table>
        </td></tr></table>
        </body></html>
        """
        .formatted(
            escape(order.getOrderNumber()),
            formatOrderDate(order.getCreatedAt()),
            escape(order.getCustomerName()),
            escape(order.getCustomerEmail()),
            escape(order.getCustomerPhone() != null ? order.getCustomerPhone() : "—"),
            escape(paymentLabel(order)),
            escape(order.getStatus() != null ? order.getStatus().replace('_', ' ') : "—"),
            itemRows,
            money(order.getTotal()),
            escape(order.getCustomerName()),
            escape(ShippingAddressFormatter.streetLine(order)),
            escape(order.getCity()),
            escape(order.getPostcode()),
            escape(order.getCountry()));
  }

  private String buildProfessionalEmail(
      CustomerOrder order,
      String headline,
      String intro,
      boolean pending,
      boolean cod,
      boolean invoiceAttached) {
    StringBuilder itemRows = new StringBuilder();
    for (CustomerOrderItem i : order.getItems()) {
      itemRows.append(
          """
          <tr>
            <td style="padding:14px 0;border-bottom:1px solid #2a2a2a;font-size:14px;color:#e8e4dc;">
              <strong style="font-weight:500;">%s</strong><br>
              <span style="font-size:12px;color:#888;">%s · Qty %d</span>
            </td>
            <td style="padding:14px 0;border-bottom:1px solid #2a2a2a;font-size:14px;color:#c9a84c;text-align:right;vertical-align:top;">₹%s</td>
          </tr>
          """
              .formatted(
                  escape(i.getProductName()),
                  escape(i.getSizeLabel()),
                  i.getQuantity(),
                  money(i.getLineTotal())));
    }

    String statusBadge =
        pending
            ? badge("Payment pending", "#3d3420", "#c9a84c")
            : cod
                ? badge("Cash on Delivery", "#1e2e24", "#6fcf97")
                : badge("Confirmed", "#1e2e24", "#6fcf97");

    String paymentLine =
        "<tr><td style=\"padding:6px 0;font-size:13px;color:#888;\">Payment</td>"
            + "<td style=\"padding:6px 0;font-size:13px;color:#e8e4dc;text-align:right;\">"
            + escape(paymentLabel(order))
            + "</td></tr>";

    String invoiceNote =
        invoiceAttached
            ? """
            <tr><td colspan="2" style="padding:16px 0 0;">
              <table role="presentation" width="100%%" style="background:#1a1812;border:1px solid #3d3420;border-radius:10px;">
              <tr><td style="padding:14px 16px;font-size:13px;line-height:1.6;color:#d4c4a0;">
              📎 Your tax invoice is attached as a PDF to this email.
              </td></tr></table>
            </td></tr>
            """
            : "";

    String trackingBlock = "";
    if (!pending
        && order.getTrackingUrl() != null
        && !order.getTrackingUrl().isBlank()) {
      trackingBlock =
          """
          <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#b8b3ac;">
          Track your shipment:
          <a href="%s" style="color:#c9a84c;text-decoration:none;border-bottom:1px solid #c9a84c;">View tracking</a>
          </p>
          """
              .formatted(escape(order.getTrackingUrl()));
      if (order.getTrackingAwb() != null && !order.getTrackingAwb().isBlank()) {
        trackingBlock =
            trackingBlock.replace(
                "Track your shipment:",
                "AWB " + escape(order.getTrackingAwb()) + " — Track your shipment:");
      }
    }

    return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <title>Méladen Order</title>
        </head>
        <body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,'Times New Roman',serif;">
        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
        <tr><td align="center" style="padding:32px 16px 48px;">
        <table role="presentation" width="100%%" style="max-width:600px;border-collapse:collapse;">

        <tr><td style="padding:0 0 24px;text-align:center;">
          <p style="margin:0;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:#888;">Méladen</p>
          <p style="margin:4px 0 0;font-size:12px;color:#666;">Luxury Fragrances</p>
        </td></tr>

        <tr><td style="background:#111111;border:1px solid #2a2a2a;border-radius:16px 16px 0 0;padding:28px 28px 20px;">
          <table role="presentation" width="100%%"><tr>
          <td style="vertical-align:top;">
            <h1 style="margin:0 0 10px;font-size:24px;font-weight:500;line-height:1.3;color:#f5f0e8;">%s</h1>
            <p style="margin:0;font-size:14px;line-height:1.65;color:#b8b3ac;">%s</p>
          </td>
          <td style="vertical-align:top;text-align:right;width:120px;">%s</td>
          </tr></table>
        </td></tr>

        <tr><td style="background:#111111;border-left:1px solid #2a2a2a;border-right:1px solid #2a2a2a;padding:0 28px 20px;">
          <table role="presentation" width="100%%" style="background:#0d0d0d;border:1px solid #252525;border-radius:10px;">
          <tr><td style="padding:16px 18px;">
            <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#888;">Order</p>
            <p style="margin:0;font-size:18px;font-weight:500;color:#c9a84c;">%s</p>
            <p style="margin:6px 0 0;font-size:12px;color:#666;">%s</p>
          </td></tr></table>
        </td></tr>

        <tr><td style="background:#111111;border-left:1px solid #2a2a2a;border-right:1px solid #2a2a2a;padding:8px 28px 24px;">
          <p style="margin:0 0 12px;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#888;">Order summary</p>
          <table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
          <thead><tr>
            <th style="padding:0 0 8px;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#666;text-align:left;">Item</th>
            <th style="padding:0 0 8px;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#666;text-align:right;">Amount</th>
          </tr></thead>
          <tbody>%s</tbody>
          </table>
        </td></tr>

        <tr><td style="background:#111111;border-left:1px solid #2a2a2a;border-right:1px solid #2a2a2a;padding:0 28px 24px;">
          <table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:6px 0;font-size:13px;color:#888;">Subtotal</td>
          <td style="padding:6px 0;font-size:13px;color:#e8e4dc;text-align:right;">₹%s</td></tr>
          %s
          %s
          <tr><td style="padding:6px 0;font-size:13px;color:#888;">Shipping</td>
          <td style="padding:6px 0;font-size:13px;color:#e8e4dc;text-align:right;">₹%s</td></tr>
          %s
          %s
          %s
          <tr><td style="padding:14px 0 0;font-size:15px;font-weight:600;color:#f5f0e8;border-top:1px solid #2a2a2a;">Total</td>
          <td style="padding:14px 0 0;font-size:15px;font-weight:600;color:#c9a84c;text-align:right;border-top:1px solid #2a2a2a;">₹%s</td></tr>
          %s
          </table>
        </td></tr>

        <tr><td style="background:#111111;border-left:1px solid #2a2a2a;border-right:1px solid #2a2a2a;border-bottom:1px solid #2a2a2a;border-radius:0 0 16px 16px;padding:0 28px 28px;">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#888;">Shipping to</p>
          <p style="margin:0;font-size:14px;line-height:1.7;color:#e8e4dc;">
            %s<br>%s<br>%s, %s<br>%s
          </p>
          %s
        </td></tr>

        <tr><td style="padding:28px 8px 0;text-align:center;">
          <p style="margin:0 0 6px;font-size:12px;color:#666;">Questions? Reply to this email or contact</p>
          <p style="margin:0;font-size:12px;"><a href="mailto:team.meladenperfumes@gmail.com" style="color:#c9a84c;text-decoration:none;">team.meladenperfumes@gmail.com</a></p>
          <p style="margin:16px 0 0;font-size:11px;color:#444;">© Méladen Luxury Fragrances</p>
        </td></tr>

        </table>
        </td></tr></table>
        </body></html>
        """
        .formatted(
            escape(headline),
            escape(intro),
            statusBadge,
            escape(order.getOrderNumber()),
            formatOrderDate(order.getCreatedAt()),
            itemRows,
            money(order.getSubtotal()),
            discountRow(order),
            paymentLine,
            money(order.getShipping()),
            codRow(order),
            walletRow(order),
            "",
            money(order.getTotal()),
            invoiceNote,
            escape(order.getCustomerName()),
            escape(order.getCustomerEmail()),
            escape(ShippingAddressFormatter.streetLine(order)),
            escape(order.getCity()),
            escape(order.getPostcode()),
            escape(order.getCountry()),
            trackingBlock);
  }

  private static String badge(String text, String bg, String color) {
    return "<span style=\"display:inline-block;padding:6px 12px;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:"
        + color
        + ";background:"
        + bg
        + ";border-radius:999px;\">"
        + escape(text)
        + "</span>";
  }

  private static String discountRow(CustomerOrder order) {
    if (order.getDiscountAmount() != null
        && order.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
      String promo =
          order.getPromoCode() != null ? " (" + escape(order.getPromoCode()) + ")" : "";
      return "<tr><td style=\"padding:6px 0;font-size:13px;color:#6fcf97;\">Discount"
          + promo
          + "</td><td style=\"padding:6px 0;font-size:13px;color:#6fcf97;text-align:right;\">−₹"
          + money(order.getDiscountAmount())
          + "</td></tr>";
    }
    return "";
  }

  private static String codRow(CustomerOrder order) {
    if (order.getCodCharges() != null
        && order.getCodCharges().compareTo(BigDecimal.ZERO) > 0) {
      return "<tr><td style=\"padding:6px 0;font-size:13px;color:#888;\">COD charges</td>"
          + "<td style=\"padding:6px 0;font-size:13px;color:#e8e4dc;text-align:right;\">₹"
          + money(order.getCodCharges())
          + "</td></tr>";
    }
    return "";
  }

  private static String walletRow(CustomerOrder order) {
    if (order.getWalletDiscount() != null
        && order.getWalletDiscount().compareTo(BigDecimal.ZERO) > 0) {
      return "<tr><td style=\"padding:6px 0;font-size:13px;color:#6fcf97;\">Wallet</td>"
          + "<td style=\"padding:6px 0;font-size:13px;color:#6fcf97;text-align:right;\">−₹"
          + money(order.getWalletDiscount())
          + "</td></tr>";
    }
    return "";
  }

  private static String paymentLabel(CustomerOrder order) {
    String method = order.getPaymentMethod();
    if (method == null) {
      return order.getStatus() != null ? order.getStatus().replace('_', ' ') : "—";
    }
    return switch (method.toUpperCase(Locale.ROOT)) {
      case "RAZORPAY" -> "Online (Razorpay)";
      case "COD" -> "Cash on Delivery";
      case "WALLET" -> "Wallet";
      default -> method;
    };
  }

  private static String formatOrderDate(Instant instant) {
    if (instant == null) {
      return "";
    }
    return ORDER_DATE_FMT.format(instant);
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
