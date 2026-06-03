package com.meladen.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Converts invoice totals to words for PDF invoices (e.g. "Five Hundred and Forty Nine Rupees only"). */
public final class InvoiceAmountWords {

  private static final String[] BELOW_TWENTY = {
    "Zero",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen"
  };

  private static final String[] TENS = {
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety"
  };

  private InvoiceAmountWords() {}

  public static String rupeesOnly(BigDecimal amount) {
    if (amount == null) {
      return "Zero Rupees only";
    }
    long rupees = amount.setScale(0, RoundingMode.HALF_UP).longValue();
    if (rupees == 0) {
      return "Zero Rupees only";
    }
    if (rupees < 0) {
      return "Zero Rupees only";
    }
    return convert(rupees) + " Rupees only";
  }

  private static String convert(long n) {
    if (n < 20) {
      return BELOW_TWENTY[(int) n];
    }
    if (n < 100) {
      int tens = (int) (n / 10);
      int ones = (int) (n % 10);
      return ones == 0 ? TENS[tens] : TENS[tens] + " " + BELOW_TWENTY[ones];
    }
    if (n < 1000) {
      int hundreds = (int) (n / 100);
      long remainder = n % 100;
      String head = BELOW_TWENTY[hundreds] + " Hundred";
      if (remainder == 0) {
        return head;
      }
      return head + " and " + convert(remainder);
    }
    if (n < 1_000_000) {
      int thousands = (int) (n / 1000);
      long remainder = n % 1000;
      String head = convert(thousands) + " Thousand";
      if (remainder == 0) {
        return head;
      }
      return head + " " + convert(remainder);
    }
    if (n < 1_000_000_000L) {
      int millions = (int) (n / 1_000_000);
      long remainder = n % 1_000_000;
      String head = convert(millions) + " Million";
      if (remainder == 0) {
        return head;
      }
      return head + " " + convert(remainder);
    }
    return Long.toString(n);
  }
}
