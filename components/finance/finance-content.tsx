"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Download, Plus, Loader2, CalendarIcon, FileText, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { fetchPayments, deletePayment } from '@/lib/api/payments'
import { fetchExpenses, getTotalExpenses, deleteExpense } from '@/lib/api/expenses'
import { getTotalRevenue } from '@/lib/api/payments'
import { formatCurrency, formatDateShort } from '@/lib/utils/formatters'
import { exportPaymentsToCSV, exportExpensesToCSV, exportFinancialSummaryToCSV } from '@/lib/utils/export'
import { cn } from "@/lib/utils"
import { toast } from 'sonner'
import { ExpenseDialog } from './expense-dialog'

export function FinanceContent() {
  const [payments, setPayments] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [allPayments, setAllPayments] = useState<any[]>([]) // For export
  const [allExpenses, setAllExpenses] = useState<any[]>([]) // For export
  const [loading, setLoading] = useState(true)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // Date range filter
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() - 30)) // Last 30 days
  )
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    loadFinanceData()
  }, [startDate, endDate])

  async function loadFinanceData() {
    try {
      setLoading(true)
      
      const start = startDate || new Date(new Date().setDate(new Date().getDate() - 30))
      const end = endDate || new Date()

      const [paymentsData, expensesData, revenue, expense] = await Promise.all([
        fetchPayments(),
        fetchExpenses(),
        getTotalRevenue(start.toISOString(), end.toISOString()),
        getTotalExpenses(start.toISOString(), end.toISOString()),
      ])

      // Filter by date range
      const filteredPayments = paymentsData.filter(p => {
        const paymentDate = new Date(p.payment_date)
        return paymentDate >= start && paymentDate <= end
      })

      const filteredExpenses = expensesData.filter(e => {
        const expenseDate = new Date(e.expense_date)
        return expenseDate >= start && expenseDate <= end
      })

      setAllPayments(filteredPayments)
      setAllExpenses(filteredExpenses)
      setPayments(filteredPayments.slice(0, 10)) // Latest 10 for display
      setExpenses(filteredExpenses.slice(0, 10)) // Latest 10 for display
      setTotalRevenue(revenue)
      setTotalExpense(expense)
    } catch (error) {
      console.error('Error loading finance data:', error)
      toast.error('Gagal memuat data keuangan')
    } finally {
      setLoading(false)
    }
  }

  function handleExportPayments() {
    if (allPayments.length === 0) {
      toast.error('Tidak ada data pembayaran untuk diexport')
      return
    }
    exportPaymentsToCSV(allPayments)
    toast.success(`${allPayments.length} pembayaran berhasil diexport`)
  }

  function handleExportExpenses() {
    if (allExpenses.length === 0) {
      toast.error('Tidak ada data pengeluaran untuk diexport')
      return
    }
    exportExpensesToCSV(allExpenses)
    toast.success(`${allExpenses.length} pengeluaran berhasil diexport`)
  }

  function handleExportSummary() {
    const start = startDate?.toISOString().split('T')[0]
    const end = endDate?.toISOString().split('T')[0]
    exportFinancialSummaryToCSV(allPayments, allExpenses, start, end)
    toast.success('Laporan keuangan berhasil diexport')
  }

  async function handleDeletePayment(id: string, orderNumber: string) {
    if (!confirm(`Hapus pembayaran untuk order "${orderNumber}"?`)) {
      return
    }

    try {
      await deletePayment(id)
      toast.success('Pembayaran berhasil dihapus')
      loadFinanceData()
    } catch (error) {
      console.error('Error deleting payment:', error)
      toast.error('Gagal menghapus pembayaran')
    }
  }

  async function handleDeleteExpense(id: string, description: string) {
    if (!confirm(`Hapus pengeluaran "${description}"?`)) {
      return
    }

    try {
      await deleteExpense(id)
      toast.success('Pengeluaran berhasil dihapus')
      loadFinanceData()
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast.error('Gagal menghapus pengeluaran')
    }
  }

  const totalProfit = totalRevenue - totalExpense

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Memuat data keuangan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manajemen Keuangan</h1>
          <p className="text-muted-foreground mt-1">Pantau pendapatan, pengeluaran, dan keuntungan</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Tambah Pengeluaran
          </Button>
        </div>
      </div>

      {/* Date Range Filter & Export */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tanggal Mulai</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP", { locale: id }) : "Pilih tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tanggal Akhir</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP", { locale: id }) : "Pilih tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportSummary} className="gap-2">
                <FileText className="w-4 h-4" />
                Laporan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">Periode terpilih</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{formatCurrency(totalExpense)}</p>
            <p className="text-xs text-muted-foreground mt-1">Periode terpilih</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Keuntungan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(totalProfit)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Periode terpilih</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pembayaran Terbaru ({allPayments.length})</CardTitle>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleExportPayments}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">No. Order</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tanggal</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Jumlah</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Metode</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">
                        {payment.order?.order_number || '-'}
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {formatDateShort(payment.payment_date)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-foreground">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="py-3 px-4 text-foreground capitalize">
                        {payment.payment_method || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            payment.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payment.status === "completed" ? "Lunas" : "Pending"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePayment(payment.id, payment.order?.order_number || 'Unknown')}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allPayments.length > 10 && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Menampilkan 10 dari {allPayments.length} pembayaran. Export untuk melihat semua data.
                </p>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Belum ada pembayaran</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pengeluaran Terbaru ({allExpenses.length})</CardTitle>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleExportExpenses}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Kategori</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Deskripsi</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tanggal</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Jumlah</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-4 text-foreground">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-foreground">{expense.description}</td>
                      <td className="py-3 px-4 text-foreground">
                        {formatDateShort(expense.expense_date)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-destructive">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExpense(expense.id, expense.description)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allExpenses.length > 10 && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Menampilkan 10 dari {allExpenses.length} pengeluaran. Export untuk melihat semua data.
                </p>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Belum ada pengeluaran</p>
          )}
        </CardContent>
      </Card>

      {/* Expense Dialog */}
      <ExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadFinanceData}
      />
    </div>
  )
}
