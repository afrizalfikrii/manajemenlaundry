import { createClient } from '../supabase/client'

const supabase = createClient()

export async function getServiceDistribution(startDate?: string, endDate?: string) {
  try {
    let query = supabase
      .from('order_items')
      .select(`
        service_id,
        quantity,
        services (
          name,
          category
        )
      `)

    // Join with orders to filter by date if provided
    if (startDate || endDate) {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          id,
          service_id,
          quantity,
          order_id,
          services (
            name,
            category
          ),
          orders!inner (
            order_date
          )
        `)
      
      let filteredItems = orderItems || []
      
      if (startDate) {
        filteredItems = filteredItems.filter(item => 
          (item.orders as any)?.order_date && new Date((item.orders as any).order_date) >= new Date(startDate)
        )
      }
      
      if (endDate) {
        filteredItems = filteredItems.filter(item =>
          (item.orders as any)?.order_date && new Date((item.orders as any).order_date) <= new Date(endDate)
        )
      }

      // Aggregate by service
      const serviceMap: Record<string, { name: string; total: number }> = {}
      
      filteredItems.forEach(item => {
        const serviceName = (item.services as any)?.name || 'Unknown'
        if (!serviceMap[serviceName]) {
          serviceMap[serviceName] = { name: serviceName, total: 0 }
        }
        serviceMap[serviceName].total += item.quantity
      })

      const data = Object.values(serviceMap)
      const total = data.reduce((sum, item) => sum + item.total, 0)

      return data.map(item => ({
        name: item.name,
        value: item.total,
        percentage: total > 0 ? Math.round((item.total / total) * 100) : 0
      }))
    }

    const { data, error } = await query

    if (error) throw error

    // Aggregate by service
    const serviceMap: Record<string, { name: string; total: number }> = {}
    
    data?.forEach((item: any) => {
      const serviceName = (item.services as any)?.name || 'Unknown'
      if (!serviceMap[serviceName]) {
        serviceMap[serviceName] = { name: serviceName, total: 0 }
      }
      serviceMap[serviceName].total += item.quantity
    })

    const aggregated = Object.values(serviceMap)
    const total = aggregated.reduce((sum, item) => sum + item.total, 0)

    return aggregated.map(item => ({
      name: item.name,
      value: item.total,
      percentage: total > 0 ? Math.round((item.total / total) * 100) : 0
    }))
  } catch (error) {
    console.error('Error fetching service distribution:', error)
    return []
  }
}

/**
 * Get monthly orders trend data for line chart
 */
export async function getMonthlyOrdersTrend(months: number = 12) {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const { data, error } = await supabase
      .from('orders')
      .select('order_date, total_amount')
      .gte('order_date', startDate.toISOString())
      .lte('order_date', endDate.toISOString())
      .order('order_date', { ascending: true })

    if (error) throw error

    // Group by month
    const monthlyData: Record<string, { count: number; revenue: number }> = {}

    data?.forEach(order => {
      const date = new Date(order.order_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, revenue: 0 }
      }
      
      monthlyData[monthKey].count += 1
      monthlyData[monthKey].revenue += order.total_amount
    })

    // Convert to array and format
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        const [year, month] = key.split('-')
        return {
          month: monthNames[parseInt(month) - 1],
          orders: value.count,
          revenue: value.revenue
        }
      })
  } catch (error) {
    console.error('Error fetching monthly trend:', error)
    return []
  }
}

/**
 * Get top customers by revenue
 */
export async function getTopCustomers(limit: number = 10, startDate?: string, endDate?: string) {
  try {
    let query = supabase
      .from('orders')
      .select(`
        customer_id,
        total_amount,
        customers (
          name,
          phone
        )
      `)

    if (startDate) {
      query = query.gte('order_date', startDate)
    }

    if (endDate) {
      query = query.lte('order_date', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    // Aggregate by customer
    const customerMap: Record<string, { name: string; phone: string; total: number; orders: number }> = {}

    data?.forEach(order => {
      const customerId = order.customer_id
      if (!customerMap[customerId]) {
        customerMap[customerId] = {
          name: (order.customers as any)?.name || 'Unknown',
          phone: (order.customers as any)?.phone || '-',
          total: 0,
          orders: 0
        }
      }
      customerMap[customerId].total += order.total_amount
      customerMap[customerId].orders += 1
    })

    return Object.values(customerMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, limit)
  } catch (error) {
    console.error('Error fetching top customers:', error)
    return []
  }
}

/**
 * Get payment methods distribution
 */
export async function getPaymentMethodsDistribution(startDate?: string, endDate?: string) {
  try {
    let query = supabase
      .from('payments')
      .select('payment_method, amount')

    if (startDate) {
      query = query.gte('payment_date', startDate)
    }

    if (endDate) {
      query = query.lte('payment_date', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    // Aggregate by payment method
    const methodMap: Record<string, number> = {}

    data?.forEach(payment => {
      const method = payment.payment_method || 'unknown'
      methodMap[method] = (methodMap[method] || 0) + payment.amount
    })

    const total = Object.values(methodMap).reduce((sum, amount) => sum + amount, 0)

    return Object.entries(methodMap).map(([method, amount]) => ({
      method,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0
    }))
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return []
  }
}
