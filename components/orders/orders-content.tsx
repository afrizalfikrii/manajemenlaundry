"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, FileText, Eye, Trash2, Loader2, Edit } from "lucide-react"
import { fetchOrders, deleteOrder } from '@/lib/api/orders'
import { formatCurrency, formatDateShort, getStatusColor, getStatusLabel } from '@/lib/utils/formatters'
import type { OrderWithDetails } from '@/lib/supabase/types'
import { toast } from 'sonner'
import { CreateOrderDialog } from './create-order-dialog'
import { UpdateStatusDialog } from './update-status-dialog'
import { OrderDetailsDialog } from './order-details-dialog'
import { CreatePaymentDialog } from './create-payment-dialog'

export function OrdersContent() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Dialog states
  const [createOrderOpen, setCreateOrderOpen] = useState(false)
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null)

  useEffect(() => {
    loadOrders()
  }, [statusFilter])

  async function loadOrders() {
    try {
      setLoading(true)
      const data = await fetchOrders(statusFilter === "all" ? undefined : statusFilter)
      setOrders(data)
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Gagal memuat data pesanan')
    } finally {
      setLoading(false)
    }
  }

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchLower) ||
      order.customer?.name?.toLowerCase().includes(searchLower) ||
      false
    return matchesSearch
  })

  async function handleDelete(id: string, orderNumber: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus pesanan "${orderNumber}"?`)) {
      return
    }

    try {
      await deleteOrder(id)
      toast.success('Pesanan berhasil dihapus')
      loadOrders()
    } catch (error) {
      console.error('Error deleting order:', error)
      toast.error('Gagal menghapus pesanan')
    }
  }

  function handleViewDetails(order: OrderWithDetails) {
    setSelectedOrder(order)
    setDetailsOpen(true)
  }

  function handleUpdateStatus(order: OrderWithDetails) {
    setSelectedOrder(order)
    setUpdateStatusOpen(true)
  }

  function handleAddPayment(order: OrderWithDetails) {
    setSelectedOrder(order)
    setPaymentOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Memuat data pesanan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manajemen Pesanan</h1>
          <p className="text-muted-foreground mt-1">Kelola dan pantau pesanan pelanggan</p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOrderOpen(true)}>
          <Plus className="w-4 h-4" />
          Buat Pesanan Baru
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Cari nomor nota atau nama pelanggan..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="processing">Proses</SelectItem>
                <SelectItem value="ready">Siap Diambil</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">No. Nota</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Pelanggan</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Items</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Total</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Dibayar</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tanggal</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{order.order_number}</td>
                      <td className="py-3 px-4 text-foreground">{order.customer?.name || '-'}</td>
                      <td className="py-3 px-4 text-foreground">
                        {order.order_items?.length || 0} item(s)
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-foreground">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="py-3 px-4 text-right text-foreground">
                        {formatCurrency(order.paid_amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {formatDateShort(order.order_date)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1" 
                            title="Lihat Detail"
                            onClick={() => handleViewDetails(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1" 
                            title="Update Status"
                            onClick={() => handleUpdateStatus(order)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-destructive hover:text-destructive"
                            title="Hapus"
                            onClick={() => handleDelete(order.id, order.order_number)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? 'Tidak ada pesanan yang cocok dengan pencarian' : 'Belum ada pesanan'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateOrderDialog
        open={createOrderOpen}
        onOpenChange={setCreateOrderOpen}
        onSuccess={loadOrders}
      />

      <UpdateStatusDialog
        open={updateStatusOpen}
        onOpenChange={setUpdateStatusOpen}
        order={selectedOrder}
        onSuccess={loadOrders}
      />

      <OrderDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        order={selectedOrder}
        onUpdateStatus={() => {
          setDetailsOpen(false)
          setUpdateStatusOpen(true)
        }}
        onAddPayment={() => {
          setDetailsOpen(false)
          setPaymentOpen(true)
        }}
      />

      <CreatePaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        preselectedOrder={selectedOrder}
        onSuccess={loadOrders}
      />
    </div>
  )
}
