// Database Types
export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  city?: string
  postal_code?: string
  special_notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  description?: string
  unit_price: number
  unit: string // "kg", "item", "piece"
  category?: string // "washing", "dry_cleaning", "ironing"
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_id: string
  order_date: string
  pickup_date?: string
  delivery_date?: string
  status: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled'
  notes?: string
  total_amount: number
  paid_amount: number
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  service_id: string
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
}

export interface Payment {
  id: string
  order_id: string
  amount: number
  payment_date: string
  payment_method?: string // "cash", "transfer", "credit_card"
  status: 'pending' | 'completed' | 'failed'
  notes?: string
  created_at: string
}

export interface Expense {
  id: string
  category: string // "supplies", "utilities", "staff", "maintenance"
  description: string
  amount: number
  expense_date: string
  payment_method?: string
  notes?: string
  created_at: string
  updated_at: string
}

// Extended types with relations
export interface OrderWithDetails extends Order {
  customer?: Customer
  order_items?: (OrderItem & { service?: Service })[]
  payments?: Payment[]
}

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  activeOrders: number
  totalCustomers: number
  revenueChange: number
  ordersChange: number
}

export interface RevenueData {
  date: string
  revenue: number
}
