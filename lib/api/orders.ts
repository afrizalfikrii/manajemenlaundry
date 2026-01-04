import { createClient } from '@/lib/supabase/client'
import type { Order, OrderWithDetails, OrderItem } from '@/lib/supabase/types'

const supabase = createClient()

export async function fetchOrders(status?: string) {
  let query = supabase
    .from('orders')
    .select(`
      *,
      customer:customers(*),
      order_items(
        *,
        service:services(*)
      ),
      payments(*)
    `)
    .order('order_date', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching orders:', error)
    throw error
  }

  return data as OrderWithDetails[]
}

export async function fetchOrderById(id: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(*),
      order_items(
        *,
        service:services(*)
      ),
      payments(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    throw error
  }

  return data as OrderWithDetails
}

export async function createOrder(orderData: {
  customer_id: string
  items: Array<{ service_id: string; quantity: number; unit_price: number }>
  notes?: string
  pickup_date?: string
}) {
  // Generate order number
  const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
  
  // Calculate total
  const totalAmount = orderData.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  )

  // Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_id: orderData.customer_id,
      total_amount: totalAmount,
      notes: orderData.notes,
      pickup_date: orderData.pickup_date,
      status: 'pending',
      paid_amount: 0,
    })
    .select()
    .single()

  if (orderError) {
    console.error('Error creating order:', orderError)
    throw orderError
  }

  // Insert order items
  const orderItems = orderData.items.map(item => ({
    order_id: order.id,
    service_id: item.service_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.quantity * item.unit_price,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    console.error('Error creating order items:', itemsError)
    throw itemsError
  }

  return order as Order
}

export async function updateOrderStatus(id: string, status: string, deliveryDate?: string) {
  const updateData: any = { status }
  
  if (deliveryDate) {
    updateData.delivery_date = deliveryDate
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating order status:', error)
    throw error
  }

  return data as Order
}

export async function deleteOrder(id: string) {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting order:', error)
    throw error
  }

  return true
}

export async function getOrdersCount(status?: string) {
  let query = supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  if (status) {
    query = query.eq('status', status)
  }

  const { count, error } = await query

  if (error) {
    console.error('Error counting orders:', error)
    throw error
  }

  return count || 0
}

export async function getActiveOrdersCount() {
  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'processing', 'ready'])

  if (error) {
    console.error('Error counting active orders:', error)
    throw error
  }

  return count || 0
}

export async function getRecentOrders(limit: number = 5) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(name, phone)
    `)
    .order('order_date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent orders:', error)
    throw error
  }

  return data
}
