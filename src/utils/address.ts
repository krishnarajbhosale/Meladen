type ShippingAddressFields = {
  apartmentHouseNumber?: string | null;
  address: string;
  nearestLandmark?: string | null;
  city: string;
  postcode: string;
  country: string;
};

export function formatShippingStreetLine(
  order: Pick<ShippingAddressFields, 'apartmentHouseNumber' | 'address' | 'nearestLandmark'>,
): string {
  const parts: string[] = [];
  const apt = order.apartmentHouseNumber?.trim();
  const street = order.address?.trim();
  const landmark = order.nearestLandmark?.trim();

  if (apt) parts.push(apt);
  if (street) parts.push(street);
  if (landmark) parts.push(`Near ${landmark}`);

  return parts.join(', ');
}

export function formatShippingAddress(order: ShippingAddressFields): string {
  const streetLine = formatShippingStreetLine(order);
  return [streetLine, `${order.city} ${order.postcode}`, order.country].filter(Boolean).join(', ');
}

export function formatShippingAddressLines(order: ShippingAddressFields): string[] {
  const lines = [formatShippingStreetLine(order), `${order.city}, ${order.postcode}`, order.country];
  return lines.filter(line => line.trim().length > 0);
}
