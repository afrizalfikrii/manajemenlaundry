/**
 * Format number as Indonesian Rupiah currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }

  return new Intl.DateTimeFormat('id-ID', options || defaultOptions).format(dateObj)
}

/**
 * Format date to short format (DD/MM/YYYY)
 */
export function formatDateShort(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj)
}

/**
 * Format date and time
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

/**
 * Get relative time (e.g., "2 hari yang lalu")
 */
export function getRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Baru saja'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} minggu yang lalu`
  
  return formatDate(dateObj)
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Format as: 0812-3456-7890
  if (cleaned.length >= 10) {
    return cleaned.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3')
  }
  
  return phone
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  const statusColors: { [key: string]: string } = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    ready: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  }

  return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
}

/**
 * Get status label in Indonesian
 */
export function getStatusLabel(status: string): string {
  const statusLabels: { [key: string]: string } = {
    pending: 'Menunggu',
    processing: 'Diproses',
    ready: 'Siap Diambil',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
    failed: 'Gagal',
  }

  return statusLabels[status.toLowerCase()] || status
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num)
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Truncate text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
