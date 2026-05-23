/**
 * Format a number as a currency string using the detected currency code.
 * e.g. formatCurrency(12500, "NGN") → "₦12,500.00"
 */
export function formatCurrency(value, currency = "USD") {
  if (value === null || value === undefined || isNaN(value)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    // Fallback for unknown currency codes
    return `${currency} ${Number(value).toFixed(2)}`;
  }
}

/**
 * Format a number as a percentage string.
 * e.g. formatPercent(23.7) → "23.7%"
 */
export function formatPercent(value) {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return `${parseFloat(value).toFixed(1)}%`;
}

/**
 * Format a large number with thousands separators.
 */
export function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

/**
 * Compact currency for chart axis labels (e.g. "$1.5M", "₦45K").
 * Derives the symbol from the Intl formatter for accuracy.
 */
export function formatCurrencyCompact(value, currency = "USD") {
  if (!value && value !== 0) return "—";
  let symbol = "$";
  try {
    // Extract the currency symbol using a zero-value format
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(0);
    // Strip digits and spaces to isolate symbol
    symbol = formatted.replace(/[\d\s,]/g, "").trim();
    if (!symbol) symbol = currency || "$";
  } catch {
    symbol = currency || "$";
  }

  if (Math.abs(value) >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${symbol}${(value / 1_000).toFixed(1)}K`;
  return `${symbol}${value.toFixed(0)}`;
}
