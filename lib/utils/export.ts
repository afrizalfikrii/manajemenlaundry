import { formatCurrency, formatDate } from './formatters'

/**
 * Convert array of objects to CSV string
 */
function convertToCSV(data: any[], headers: string[]): string {
  const headerRow = headers.join(',')
  const rows = data.map(row => 
    headers.map(header => {
      const value = row[header]
      // Escape quotes and wrap in quotes if contains comma
      if (value === null || value === undefined) return ''
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }).join(',')
  )
  return [headerRow, ...rows].join('\n')
}

/**
 * Download CSV file
 */
function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export payments to CSV
 */
export function exportPaymentsToCSV(payments: any[]) {
  const data = payments.map(payment => ({
    'Tanggal': formatDate(payment.payment_date),
    'No. Order': payment.order?.order_number || '-',
    'Pelanggan': payment.order?.customer?.name || '-',
    'Jumlah': payment.amount,
    'Metode': payment.payment_method,
    'Status': payment.status,
    'Catatan': payment.notes || '-'
  }))

  const headers = ['Tanggal', 'No. Order', 'Pelanggan', 'Jumlah', 'Metode', 'Status', 'Catatan']
  const csv = convertToCSV(data, headers)
  
  const filename = `pembayaran_${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(csv, filename)
}

/**
 * Export expenses to CSV
 */
export function exportExpensesToCSV(expenses: any[]) {
  const data = expenses.map(expense => ({
    'Tanggal': formatDate(expense.expense_date),
    'Kategori': expense.category,
    'Deskripsi': expense.description,
    'Jumlah': expense.amount,
    'Metode Pembayaran': expense.payment_method || '-',
    'Catatan': expense.notes || '-'
  }))

  const headers = ['Tanggal', 'Kategori', 'Deskripsi', 'Jumlah', 'Metode Pembayaran', 'Catatan']
  const csv = convertToCSV(data, headers)
  
  const filename = `pengeluaran_${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(csv, filename)
}

/**
 * Export financial summary to CSV
 */
export function exportFinancialSummaryToCSV(
  payments: any[],
  expenses: any[],
  startDate?: string,
  endDate?: string
) {
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const netProfit = totalRevenue - totalExpenses

  // Summary section
  const summaryData = [
    { 'Keterangan': 'Total Pendapatan', 'Jumlah': formatCurrency(totalRevenue) },
    { 'Keterangan': 'Total Pengeluaran', 'Jumlah': formatCurrency(totalExpenses) },
    { 'Keterangan': 'Keuntungan Bersih', 'Jumlah': formatCurrency(netProfit) },
    { 'Keterangan': '', 'Jumlah': '' }, // Empty row
  ]

  // Revenue by payment method
  const revenueByMethod: Record<string, number> = {}
  payments.forEach(p => {
    const method = p.payment_method || 'unknown'
    revenueByMethod[method] = (revenueByMethod[method] || 0) + p.amount
  })

  Object.entries(revenueByMethod).forEach(([method, amount]) => {
    summaryData.push({
      'Keterangan': `Pendapatan (${method})`,
      'Jumlah': formatCurrency(amount)
    })
  })

  summaryData.push({ 'Keterangan': '', 'Jumlah': '' }) // Empty row

  // Expenses by category
  const expensesByCategory: Record<string, number> = {}
  expenses.forEach(e => {
    const category = e.category || 'unknown'
    expensesByCategory[category] = (expensesByCategory[category] || 0) + e.amount
  })

  Object.entries(expensesByCategory).forEach(([category, amount]) => {
    summaryData.push({
      'Keterangan': `Pengeluaran (${category})`,
      'Jumlah': formatCurrency(amount)
    })
  })

  const headers = ['Keterangan', 'Jumlah']
  const csv = convertToCSV(summaryData, headers)
  
  const dateRange = startDate && endDate 
    ? `_${startDate}_to_${endDate}`
    : `_${new Date().toISOString().split('T')[0]}`
  
  const filename = `laporan_keuangan${dateRange}.csv`
  downloadCSV(csv, filename)
}

/**
 * Export customers to CSV
 */
export function exportCustomersToCSV(customers: any[]) {
  const data = customers.map(customer => ({
    'Nama': customer.name,
    'Telepon': customer.phone,
    'Email': customer.email || '-',
    'Alamat': customer.address || '-',
    'Kota': customer.city || '-',
    'Kode Pos': customer.postal_code || '-',
    'Catatan Khusus': customer.special_notes || '-',
    'Tanggal Bergabung': formatDate(customer.created_at)
  }))

  const headers = ['Nama', 'Telepon', 'Email', 'Alamat', 'Kota', 'Kode Pos', 'Catatan Khusus', 'Tanggal Bergabung']
  const csv = convertToCSV(data, headers)
  
  const filename = `pelanggan_${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(csv, filename)
}

/**
 * Export orders to CSV
 */
export function exportOrdersToCSV(orders: any[]) {
  const data = orders.map(order => ({
    'No. Order': order.order_number,
    'Tanggal': formatDate(order.order_date),
    'Pelanggan': order.customer?.name || '-',
    'Total': order.total_amount,
    'Dibayar': order.paid_amount,
    'Sisa': order.total_amount - order.paid_amount,
    'Status': order.status,
    'Items': order.order_items?.length || 0,
    'Catatan': order.notes || '-'
  }))

  const headers = ['No. Order', 'Tanggal', 'Pelanggan', 'Total', 'Dibayar', 'Sisa', 'Status', 'Items', 'Catatan']
  const csv = convertToCSV(data, headers)
  
  const filename = `pesanan_${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(csv, filename)
}
