import { fetchCustomers } from '../api/customers'
import { fetchServices } from '../api/services'
import { fetchOrders } from '../api/orders'
import { fetchPayments } from '../api/payments'
import { fetchExpenses } from '../api/expenses'

/**
 * Generate complete backup of all application data
 */
export async function generateBackup() {
  try {
    // Fetch all data
    const [customers, services, orders, payments, expenses] = await Promise.all([
      fetchCustomers(),
      fetchServices(),
      fetchOrders(),
      fetchPayments(),
      fetchExpenses(),
    ])

    // Create backup object
    const backup = {
      metadata: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        application: 'Laundry Admin',
      },
      data: {
        customers,
        services,
        orders,
        payments,
        expenses,
      },
      stats: {
        totalCustomers: customers.length,
        totalServices: services.length,
        totalOrders: orders.length,
        totalPayments: payments.length,
        totalExpenses: expenses.length,
      },
    }

    return backup
  } catch (error) {
    console.error('Error generating backup:', error)
    throw error
  }
}

/**
 * Download backup as JSON file
 */
export async function downloadBackup() {
  try {
    const backup = await generateBackup()
    
    // Convert to JSON string
    const jsonString = JSON.stringify(backup, null, 2)
    
    // Create blob
    const blob = new Blob([jsonString], { type: 'application/json' })
    
    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    link.download = `laundry-backup-${timestamp}.json`
    
    link.href = url
    link.click()
    
    // Cleanup
    URL.revokeObjectURL(url)
    
    return true
  } catch (error) {
    console.error('Error downloading backup:', error)
    throw error
  }
}

/**
 * Get backup file size estimate
 */
export async function getBackupSize() {
  try {
    const backup = await generateBackup()
    const jsonString = JSON.stringify(backup)
    const sizeInBytes = new Blob([jsonString]).size
    const sizeInKB = (sizeInBytes / 1024).toFixed(2)
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2)
    
    return {
      bytes: sizeInBytes,
      kb: sizeInKB,
      mb: sizeInMB,
      formatted: sizeInBytes > 1024 * 1024 
        ? `${sizeInMB} MB` 
        : `${sizeInKB} KB`,
    }
  } catch (error) {
    console.error('Error calculating backup size:', error)
    throw error
  }
}
