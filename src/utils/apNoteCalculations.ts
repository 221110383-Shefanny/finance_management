/**
 * Utility functions for AP Note calculations
 */

/**
 * Calculate total amount for an item (qty * unitPrice)
 */
export function calculateItemTotal(qty: number, unitPrice: number): number {
  return qty * unitPrice;
}

/**
 * Calculate total from an array of items
 */
export function calculateTotalFromItems(
  items: Array<{ totalAmount: number }>
): number {
  return items.reduce((sum, item) => sum + item.totalAmount, 0);
}

/**
 * Calculate total from an array of linked documents
 */
export function calculateTotalFromDocs(
  docs: Array<{ totalAmount: number }>
): number {
  return docs.reduce((sum, doc) => sum + doc.totalAmount, 0);
}

/**
 * Calculate combined total from items with tax, discount, and pph
 */
export function calculateCombinedTotal(
  itemsTotal: number,
  tax: number = 0,
  discount: number = 0,
  pph: number = 0
): number {
  return itemsTotal + tax - discount + pph;
}

/**
 * Calculate net total (items + tax - discount + pph)
 */
export function calculateNetTotal(
  items: Array<{ totalAmount: number }>,
  tax: number = 0,
  discount: number = 0,
  pph: number = 0
): number {
  const itemsTotal = calculateTotalFromItems(items);
  return calculateCombinedTotal(itemsTotal, tax, discount, pph);
}
