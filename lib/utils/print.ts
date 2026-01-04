/**
 * Utility function to print invoice
 * Uses browser's native print dialog
 */
export function printInvoice() {
  window.print()
}

/**
 * Utility function to prepare and print invoice for an order
 * @param orderId - The order ID to print
 */
export function handlePrintOrder(orderId: string) {
  // Trigger print
  // The InvoiceTemplate component will handle the print styling
  window.print()
}
