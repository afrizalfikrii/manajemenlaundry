import { createClient } from '@/lib/supabase/client'
import type { Expense } from '@/lib/supabase/types'

const supabase = createClient()

export async function fetchExpenses(category?: string, startDate?: string, endDate?: string) {
  let query = supabase
    .from('expenses')
    .select('*')
    .order('expense_date', { ascending: false })

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  if (startDate) {
    query = query.gte('expense_date', startDate)
  }

  if (endDate) {
    query = query.lte('expense_date', endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching expenses:', error)
    throw error
  }

  return data as Expense[]
}

export async function createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single()

  if (error) {
    console.error('Error creating expense:', error)
    throw error
  }

  return data as Expense
}

export async function updateExpense(id: string, expense: Partial<Expense>) {
  const { data, error } = await supabase
    .from('expenses')
    .update(expense)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating expense:', error)
    throw error
  }

  return data as Expense
}

export async function deleteExpense(id: string) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting expense:', error)
    throw error
  }

  return true
}

export async function getTotalExpenses(startDate?: string, endDate?: string) {
  let query = supabase
    .from('expenses')
    .select('amount')

  if (startDate) {
    query = query.gte('expense_date', startDate)
  }

  if (endDate) {
    query = query.lte('expense_date', endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error calculating expenses:', error)
    throw error
  }

  const total = data.reduce((sum, expense) => sum + Number(expense.amount), 0)
  return total
}

export async function getExpensesByCategory(startDate?: string, endDate?: string) {
  let query = supabase
    .from('expenses')
    .select('category, amount')

  if (startDate) {
    query = query.gte('expense_date', startDate)
  }

  if (endDate) {
    query = query.lte('expense_date', endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching expenses by category:', error)
    throw error
  }

  // Group by category
  const expensesByCategory: { [key: string]: number } = {}
  
  data.forEach(expense => {
    expensesByCategory[expense.category] = 
      (expensesByCategory[expense.category] || 0) + Number(expense.amount)
  })

  return Object.entries(expensesByCategory).map(([category, amount]) => ({
    category,
    amount,
  }))
}

export async function getExpenseCategories() {
  const { data, error } = await supabase
    .from('expenses')
    .select('category')

  if (error) {
    console.error('Error fetching categories:', error)
    throw error
  }

  // Get unique categories
  const categories = [...new Set(data.map(e => e.category))]
  return categories as string[]
}
