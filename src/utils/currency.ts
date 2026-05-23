const inrWhole = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const inrDecimal = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format an amount in Indian Rupees (₹). */
export function formatInr(amount: number, decimals: 0 | 2 = 2): string {
  const n = Number(amount);
  if (Number.isNaN(n)) return decimals === 0 ? '₹0' : '₹0.00';
  return (decimals === 0 ? inrWhole : inrDecimal).format(n);
}

/** Format a discount / deduction with a minus prefix. */
export function formatInrDiscount(amount: number, decimals: 0 | 2 = 2): string {
  return `−${formatInr(amount, decimals)}`;
}
