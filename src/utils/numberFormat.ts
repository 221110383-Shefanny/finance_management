/**
 * Centralized number formatting utilities
 */

/**
 * Format number with thousand separators
 * @param value - Number to format
 * @returns Formatted number string with commas (e.g., 1,234,567)
 */
export const formatNumber = (
  value: number | string | undefined,
): string => {
  if (value === undefined || value === null || value === "") {
    return "0";
  }

  const numValue =
    typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return "0";
  }

  return numValue.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Format currency with IDR prefix
 * @param value - Number to format
 * @returns Formatted currency string (e.g., Rp 1,234,567)
 */
export const formatCurrency = (
  value: number | string | undefined,
): string => {
  return `Rp ${formatNumber(value)}`;
};

/**
 * Parse formatted number back to numeric value
 * Handles both Indonesian format (dots for thousands, comma for decimal)
 * and regular format
 * @param value - Formatted number string (e.g., "1.234.567,89")
 * @returns Numeric value
 */
export const parseFormattedNumber = (
  value: string | undefined | null,
): number => {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  // Remove spaces
  let cleanValue = value.toString().trim();

  // Check if it uses Indonesian format (dots for thousands, comma for decimal)
  if (cleanValue.includes(",")) {
    // Replace dots with empty string (thousands separator)
    // Replace comma with dot (decimal separator)
    cleanValue = cleanValue.replace(/\./g, "").replace(",", ".");
  }

  const numValue = parseFloat(cleanValue);
  return isNaN(numValue) ? 0 : numValue;
};