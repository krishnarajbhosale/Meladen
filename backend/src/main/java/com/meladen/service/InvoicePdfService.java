package com.meladen.service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.meladen.entity.CustomerOrder;
import com.meladen.entity.CustomerOrderItem;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import org.springframework.stereotype.Service;

@Service
public class InvoicePdfService {

  private static final Color INK = new Color(36, 29, 20);
  private static final Color MUTED = new Color(107, 92, 75);
  private static final Color LINE = new Color(234, 223, 206);
  private static final DateTimeFormatter DATE_FMT =
      DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a", Locale.ENGLISH)
          .withZone(ZoneId.of("Asia/Kolkata"));

  public byte[] generateInvoice(CustomerOrder order) {
    try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
      Document doc = new Document(PageSize.A4, 48, 48, 56, 56);
      PdfWriter.getInstance(doc, out);
      doc.open();

      Font brandFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, INK);
      Font taglineFont = FontFactory.getFont(FontFactory.HELVETICA, 9, MUTED);
      Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, INK);
      Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, MUTED);
      Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10, INK);
      Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 9, MUTED);

      Paragraph brand = new Paragraph("MÉLADEN", brandFont);
      brand.setSpacingAfter(2f);
      doc.add(brand);

      Paragraph tagline = new Paragraph("Luxury Fragrances", taglineFont);
      tagline.setSpacingAfter(18f);
      doc.add(tagline);

      PdfPTable header = new PdfPTable(2);
      header.setWidthPercentage(100);
      header.setWidths(new float[] {1.4f, 1f});

      PdfPCell left = new PdfPCell();
      left.setBorder(PdfPCell.NO_BORDER);
      left.setPadding(0);
      left.addElement(new Paragraph("TAX INVOICE", titleFont));
      left.addElement(new Paragraph("Invoice #" + safe(order.getOrderNumber()), bodyFont));
      left.addElement(new Paragraph("Order ID: " + safe(order.getId()), smallFont));
      header.addCell(left);

      PdfPCell right = new PdfPCell();
      right.setBorder(PdfPCell.NO_BORDER);
      right.setHorizontalAlignment(Element.ALIGN_RIGHT);
      right.setPadding(0);
      right.addElement(new Paragraph("Date", labelFont));
      right.addElement(new Paragraph(formatDate(order.getCreatedAt()), bodyFont));
      right.addElement(new Paragraph("Payment: " + paymentLabel(order), smallFont));
      header.addCell(right);

      header.setSpacingAfter(16f);
      doc.add(header);

      doc.add(sectionTitle("Bill To", labelFont));
      doc.add(
          new Paragraph(
              joinLines(
                  order.getCustomerName(),
                  order.getCustomerEmail(),
                  phoneOrDash(order.getCustomerPhone()),
                  order.getAddress(),
                  order.getCity() + ", " + order.getPostcode(),
                  order.getCountry()),
              bodyFont));
      doc.add(spacer(14f));

      PdfPTable table = new PdfPTable(5);
      table.setWidthPercentage(100);
      table.setWidths(new float[] {3.2f, 1.2f, 0.8f, 1.4f, 1.4f});
      table.setSpacingBefore(4f);
      table.setSpacingAfter(12f);

      addHeaderCell(table, "Product", labelFont);
      addHeaderCell(table, "Size", labelFont);
      addHeaderCell(table, "Qty", labelFont);
      addHeaderCell(table, "Unit price", labelFont);
      addHeaderCell(table, "Amount", labelFont);

      for (CustomerOrderItem item : order.getItems()) {
        addBodyCell(table, safe(item.getProductName()), bodyFont, Element.ALIGN_LEFT);
        addBodyCell(table, safe(item.getSizeLabel()), bodyFont, Element.ALIGN_LEFT);
        addBodyCell(table, String.valueOf(item.getQuantity()), bodyFont, Element.ALIGN_CENTER);
        addBodyCell(table, inr(item.getUnitPrice()), bodyFont, Element.ALIGN_RIGHT);
        addBodyCell(table, inr(item.getLineTotal()), bodyFont, Element.ALIGN_RIGHT);
      }
      doc.add(table);

      PdfPTable totals = new PdfPTable(2);
      totals.setWidthPercentage(42);
      totals.setHorizontalAlignment(Element.ALIGN_RIGHT);
      totals.setWidths(new float[] {1.6f, 1f});

      addTotalRow(totals, "Subtotal", inr(order.getSubtotal()), bodyFont, false);
      if (positive(order.getDiscountAmount())) {
        addTotalRow(
            totals,
            "Discount" + (order.getPromoCode() != null ? " (" + order.getPromoCode() + ")" : ""),
            "−" + inr(order.getDiscountAmount()),
            bodyFont,
            false);
      }
      addTotalRow(totals, "Shipping", inr(order.getShipping()), bodyFont, false);
      if (positive(order.getWalletDiscount())) {
        addTotalRow(totals, "Wallet", "−" + inr(order.getWalletDiscount()), bodyFont, false);
      }
      addTotalRow(totals, "Total", inr(order.getTotal()), titleFont, true);
      doc.add(totals);

      doc.add(spacer(20f));
      Paragraph thanks =
          new Paragraph(
              "Thank you for shopping with Méladen. This invoice is generated automatically for your records.",
              smallFont);
      thanks.setAlignment(Element.ALIGN_CENTER);
      doc.add(thanks);

      Paragraph footer =
          new Paragraph("team.meladenperfumes@gmail.com · www.meladen.com", smallFont);
      footer.setAlignment(Element.ALIGN_CENTER);
      footer.setSpacingBefore(6f);
      doc.add(footer);

      doc.close();
      return out.toByteArray();
    } catch (Exception e) {
      throw new IllegalStateException("Could not generate invoice PDF", e);
    }
  }

  public String invoiceFileName(CustomerOrder order) {
    String num = order.getOrderNumber() != null ? order.getOrderNumber() : order.getId();
    return "Meladen-Invoice-" + num.replaceAll("[^a-zA-Z0-9_-]", "-") + ".pdf";
  }

  private static Paragraph sectionTitle(String text, Font font) {
    Paragraph p = new Paragraph(text.toUpperCase(Locale.ROOT), font);
    p.setSpacingAfter(6f);
    return p;
  }

  private static Paragraph spacer(float after) {
    Paragraph p = new Paragraph(" ");
    p.setSpacingAfter(after);
    return p;
  }

  private static void addHeaderCell(PdfPTable table, String text, Font font) {
    PdfPCell cell = new PdfPCell(new Phrase(text, font));
    cell.setBackgroundColor(new Color(247, 242, 234));
    cell.setBorderColor(LINE);
    cell.setPadding(8f);
    cell.setHorizontalAlignment(Element.ALIGN_LEFT);
    table.addCell(cell);
  }

  private static void addBodyCell(PdfPTable table, String text, Font font, int align) {
    PdfPCell cell = new PdfPCell(new Phrase(text, font));
    cell.setBorderColor(LINE);
    cell.setPadding(7f);
    cell.setHorizontalAlignment(align);
    table.addCell(cell);
  }

  private static void addTotalRow(
      PdfPTable table, String label, String value, Font font, boolean highlight) {
    PdfPCell labelCell = new PdfPCell(new Phrase(label, font));
    labelCell.setBorder(PdfPCell.NO_BORDER);
    labelCell.setPadding(4f);
    labelCell.setHorizontalAlignment(Element.ALIGN_LEFT);
    if (highlight) {
      labelCell.setBackgroundColor(new Color(247, 242, 234));
    }
    table.addCell(labelCell);

    PdfPCell valueCell = new PdfPCell(new Phrase(value, font));
    valueCell.setBorder(PdfPCell.NO_BORDER);
    valueCell.setPadding(4f);
    valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
    if (highlight) {
      valueCell.setBackgroundColor(new Color(247, 242, 234));
    }
    table.addCell(valueCell);
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

  private static String formatDate(Instant instant) {
    if (instant == null) {
      return "—";
    }
    return DATE_FMT.format(instant);
  }

  private static String inr(BigDecimal amount) {
    if (amount == null) {
      return "₹0.00";
    }
    return "₹" + amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
  }

  private static boolean positive(BigDecimal v) {
    return v != null && v.compareTo(BigDecimal.ZERO) > 0;
  }

  private static String safe(String s) {
    return s == null ? "" : s;
  }

  private static String phoneOrDash(String phone) {
    return phone != null && !phone.isBlank() ? phone.trim() : "—";
  }

  private static String joinLines(String... lines) {
    StringBuilder sb = new StringBuilder();
    for (String line : lines) {
      if (line == null || line.isBlank()) {
        continue;
      }
      if (!sb.isEmpty()) {
        sb.append('\n');
      }
      sb.append(line.trim());
    }
    return sb.toString();
  }
}
