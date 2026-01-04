"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { OrdersContent } from "@/components/orders/orders-content"

export default function OrdersPage() {
  return (
    <DashboardLayout>
      <OrdersContent />
    </DashboardLayout>
  )
}
