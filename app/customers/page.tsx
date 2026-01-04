"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CustomersContent } from "@/components/customers/customers-content"

export default function CustomersPage() {
  return (
    <DashboardLayout>
      <CustomersContent />
    </DashboardLayout>
  )
}
