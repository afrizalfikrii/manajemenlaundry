import { createClient } from '@/lib/supabase/client'
import type { Customer } from '@/lib/supabase/types'

const supabase = createClient()

export async function fetchCustomers(search?: string) {
  let query = supabase
    .from('customers')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching customers:', error)
    throw error
  }

  return data as Customer[]
}

export async function fetchCustomerById(id: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching customer:', error)
    throw error
  }

  return data as Customer
}

export async function createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single()

  if (error) {
    console.error('Error creating customer:', error)
    throw error
  }

  return data as Customer
}

export async function updateCustomer(id: string, customer: Partial<Customer>) {
  const { data, error } = await supabase
    .from('customers')
    .update(customer)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating customer:', error)
    throw error
  }

  return data as Customer
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting customer:', error)
    throw error
  }

  return true
}

export async function getCustomersCount() {
  const { count, error } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  if (error) {
    console.error('Error counting customers:', error)
    throw error
  }

  return count || 0
}
