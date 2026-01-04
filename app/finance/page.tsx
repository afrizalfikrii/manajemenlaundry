"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { FinanceContent } from "@/components/finance/finance-content"

export default function FinancePage() {
  return (
    <DashboardLayout>
      <FinanceContent />
    </DashboardLayout>
  )
}
