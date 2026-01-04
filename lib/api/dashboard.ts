import { getCustomersCount } from './customers'
import { getActiveOrdersCount, getRecentOrders } from './orders'
import { getTotalRevenue, getRevenueByDateRange } from './payments'
import { getTotalExpenses } from './expenses'
import type { DashboardStats } from '@/lib/supabase/types'

export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    // Get current month dates
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    // Get previous month dates for comparison
    const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Fetch all stats in parallel
    const [
      totalRevenue,
      prevMonthRevenue,
      activeOrders,
      totalCustomers,
    ] = await Promise.all([
      getTotalRevenue(firstDayOfMonth.toISOString(), lastDayOfMonth.toISOString()),
      getTotalRevenue(firstDayOfPrevMonth.toISOString(), lastDayOfPrevMonth.toISOString()),
      getActiveOrdersCount(),
      getCustomersCount(),
    ])

    // Calculate percentage changes
    const revenueChange = prevMonthRevenue > 0 
      ? ((totalRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 
      : 0

    return {
      totalRevenue,
      totalOrders: activeOrders,
      activeOrders,
      totalCustomers,
      revenueChange: Math.round(revenueChange * 10) / 10, // Round to 1 decimal
      ordersChange: 0, // You can implement this similar to revenue if needed
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw error
  }
}

export async function fetchRevenueChart(days: number = 30) {
  try {
    const data = await getRevenueByDateRange(days)
    return data
  } catch (error) {
    console.error('Error fetching revenue chart:', error)
    throw error
  }
}

export async function fetchRecentOrdersForDashboard(limit: number = 5) {
  try {
    const orders = await getRecentOrders(limit)
    return orders
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    throw error
  }
}

export async function fetchFinancialSummary(startDate?: string, endDate?: string) {
  try {
    const [revenue, expenses] = await Promise.all([
      getTotalRevenue(startDate, endDate),
      getTotalExpenses(startDate, endDate),
    ])

    return {
      revenue,
      expenses,
      profit: revenue - expenses,
    }
  } catch (error) {
    console.error('Error fetching financial summary:', error)
    throw error
  }
}
