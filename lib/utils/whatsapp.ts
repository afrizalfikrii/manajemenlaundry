/**
 * WhatsApp Click-to-Chat Integration
 * Free WhatsApp integration using wa.me links
 */

/**
 * Format phone number for WhatsApp
 * Converts Indonesian phone format to international format
 * Example: 0812-3456-7890 → 6281234567890
 */
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-numeric characters
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  
  // Convert to international format (62xxx)
  if (cleanPhone.startsWith('0')) {
    return '62' + cleanPhone.substring(1)
  }
  
  // Already in international format or invalid
  return cleanPhone.startsWith('62') ? cleanPhone : '62' + cleanPhone
}

/**
 * Send message via WhatsApp
 * Opens WhatsApp with pre-filled message
 */
export function sendWhatsApp(phone: string, message: string) {
  const waPhone = formatPhoneForWhatsApp(phone)
  const encodedMessage = encodeURIComponent(message)
  const url = `https://wa.me/${waPhone}?text=${encodedMessage}`
  
  window.open(url, '_blank')
}

/**
 * Generate invoice message for WhatsApp
 */
export function generateInvoiceMessage(data: {
  customerName: string
  orderNumber: string
  totalAmount: number
  items: Array<{ name: string; quantity: number; price: number }>
  pickupDate?: string
}) {
  const { customerName, orderNumber, totalAmount, items, pickupDate } = data
  
  let message = `Halo Bapak/Ibu *${customerName}*,\n\n`
  message += `Terima kasih telah menggunakan layanan kami!\n\n`
  message += `*Detail Pesanan*\n`
  message += `No. Order: ${orderNumber}\n\n`
  
  message += `*Item Pesanan:*\n`
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.name} - ${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}\n`
  })
  
  message += `\n*Total: Rp ${totalAmount.toLocaleString('id-ID')}*\n\n`
  
  if (pickupDate) {
    message += `Tanggal Pickup: ${pickupDate}\n\n`
  }
  
  message += `Terima kasih!`
  
  return message
}

/**
 * Generate pickup reminder message
 */
export function generatePickupReminderMessage(data: {
  customerName: string
  orderNumber: string
}) {
  const { customerName, orderNumber } = data
  
  let message = `Halo Bapak/Ibu *${customerName}*,\n\n`
  message += `Pesanan Anda (${orderNumber}) sudah *selesai* dan siap diambil!\n\n`
  message += `Silakan datang ke laundry kami untuk mengambil cucian Anda.\n\n`
  message += `Terima kasih!`
  
  return message
}

/**
 * Generate order status update message
 */
export function generateStatusUpdateMessage(data: {
  customerName: string
  orderNumber: string
  status: string
  statusLabel: string
}) {
  const { customerName, orderNumber, statusLabel } = data
  
  let message = `Halo Bapak/Ibu *${customerName}*,\n\n`
  message += `Update status pesanan Anda:\n\n`
  message += `No. Order: ${orderNumber}\n`
  message += `Status: *${statusLabel}*\n\n`
  message += `Terima kasih!`
  
  return message
}
