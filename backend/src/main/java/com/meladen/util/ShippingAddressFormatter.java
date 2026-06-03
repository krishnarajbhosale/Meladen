package com.meladen.util;

import com.meladen.entity.CustomerOrder;

public final class ShippingAddressFormatter {

  private ShippingAddressFormatter() {}

  public static String streetLine(CustomerOrder order) {
    StringBuilder address = new StringBuilder();
    if (order.getApartmentHouseNumber() != null && !order.getApartmentHouseNumber().isBlank()) {
      address.append(order.getApartmentHouseNumber().trim()).append(", ");
    }
    address.append(order.getAddress() == null ? "" : order.getAddress().trim());
    if (order.getNearestLandmark() != null && !order.getNearestLandmark().isBlank()) {
      if (!address.isEmpty()) {
        address.append(", ");
      }
      address.append("Near ").append(order.getNearestLandmark().trim());
    }
    return address.toString();
  }
}
