import { createClient } from '@/lib/supabase/client'
import type { Service } from '@/lib/supabase/types'

const supabase = createClient()

export async function fetchServices(category?: string) {
  let query = supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching services:', error)
    throw error
  }

  return data as Service[]
}

export async function fetchServiceById(id: string) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching service:', error)
    throw error
  }

  return data as Service
}

export async function createService(service: Omit<Service, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('services')
    .insert(service)
    .select()
    .single()

  if (error) {
    console.error('Error creating service:', error)
    throw error
  }

  return data as Service
}

export async function updateService(id: string, service: Partial<Service>) {
  const { data, error } = await supabase
    .from('services')
    .update(service)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating service:', error)
    throw error
  }

  return data as Service
}

export async function deleteService(id: string) {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting service:', error)
    throw error
  }

  return true
}

export async function getServiceCategories() {
  const { data, error } = await supabase
    .from('services')
    .select('category')
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching categories:', error)
    throw error
  }

  // Get unique categories
  const categories = [...new Set(data.map(s => s.category).filter(Boolean))]
  return categories as string[]
}
