import { createClient } from '@/lib/supabase/client'
import type { Payment } from '@/lib/supabase/types'

const supabase = createClient()

export async function fetchPayments() {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      order:orders(
        order_number,
        customer:customers(name)
      )
    `)
    .order('payment_date', { ascending: false })

  if (error) {
    console.error('Error fetching payments:', error)
    throw error
  }

  return data
}

export async function fetchPaymentsByOrder(orderId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', orderId)
    .order('payment_date', { ascending: false })

  if (error) {
    console.error('Error fetching payments:', error)
    throw error
  }

  return data as Payment[]
}

export async function createPayment(payment: {
  order_id: string
  amount: number
  payment_method: string
  notes?: string
}) {
  // Insert payment
  const { data: newPayment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      ...payment,
      status: 'completed',
    })
    .select()
    .single()

  if (paymentError) {
    console.error('Error creating payment:', paymentError)
    throw paymentError
  }

  // Update order paid_amount
  const { data: order } = await supabase
    .from('orders')
    .select('paid_amount')
    .eq('id', payment.order_id)
    .single()

  if (order) {
    const newPaidAmount = (order.paid_amount || 0) + payment.amount

    await supabase
      .from('orders')
      .update({ paid_amount: newPaidAmount })
      .eq('id', payment.order_id)
  }

  return newPayment as Payment
}

export async function deletePayment(id: string) {
  // Get payment details first to update order
  const { data: payment } = await supabase
    .from('payments')
    .select('order_id, amount')
    .eq('id', id)
    .single()

  if (!payment) {
    throw new Error('Payment not found')
  }

  // Delete payment
  const { error: deleteError } = await supabase
    .from('payments')
    .delete()
    .eq('id', id)

  if (deleteError) {
    console.error('Error deleting payment:', deleteError)
    throw deleteError
  }

  // Update order paid_amount
  const { data: order } = await supabase
    .from('orders')
    .select('paid_amount')
    .eq('id', payment.order_id)
    .single()

  if (order) {
    const newPaidAmount = Math.max(0, (order.paid_amount || 0) - payment.amount)

    await supabase
      .from('orders')
      .update({ paid_amount: newPaidAmount })
      .eq('id', payment.order_id)
  }

  return true
}

export async function getTotalRevenue(startDate?: string, endDate?: string) {
  let query = supabase
    .from('payments')
    .select('amount')
    .eq('status', 'completed')

  if (startDate) {
    query = query.gte('payment_date', startDate)
  }

  if (endDate) {
    query = query.lte('payment_date', endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error calculating revenue:', error)
    throw error
  }

  const total = data.reduce((sum, payment) => sum + Number(payment.amount), 0)
  return total
}

export async function getRevenueByDateRange(days: number = 30) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('payments')
    .select('amount, payment_date')
    .eq('status', 'completed')
    .gte('payment_date', startDate.toISOString())
    .lte('payment_date', endDate.toISOString())
    .order('payment_date', { ascending: true })

  if (error) {
    console.error('Error fetching revenue data:', error)
    throw error
  }

  // Group by date
  const revenueByDate: { [key: string]: number } = {}
  
  data.forEach(payment => {
    const date = new Date(payment.payment_date).toISOString().split('T')[0]
    revenueByDate[date] = (revenueByDate[date] || 0) + Number(payment.amount)
  })

  return Object.entries(revenueByDate).map(([date, revenue]) => ({
    date,
    revenue,
  }))
}
