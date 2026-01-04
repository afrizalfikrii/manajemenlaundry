"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { fetchOrders } from '@/lib/api/orders'
import { createPayment } from '@/lib/api/payments'
import { formatCurrency } from '@/lib/utils/formatters'
import { toast } from 'sonner'

interface CreatePaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedOrder?: any
  onSuccess: () => void
}

export function CreatePaymentDialog({ open, onOpenChange, preselectedOrder, onSuccess }: CreatePaymentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState(preselectedOrder?.id || '')
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'cash',
    notes: '',
  })

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || preselectedOrder
  const remainingBalance = selectedOrder ? selectedOrder.total_amount - selectedOrder.paid_amount : 0

  useEffect(() => {
    if (open && !preselectedOrder) {
      loadOrders()
    }
  }, [open, preselectedOrder])

  useEffect(() => {
    if (preselectedOrder) {
      setSelectedOrderId(preselectedOrder.id)
    }
  }, [preselectedOrder])

  async function loadOrders() {
    try {
      setLoadingOrders(true)
      // Get orders that are not fully paid
      const allOrders = await fetchOrders()
      const unpaidOrders = allOrders.filter(o => o.paid_amount < o.total_amount)
      setOrders(unpaidOrders)
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Gagal memuat data pesanan')
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedOrderId) {
      toast.error('Pilih pesanan terlebih dahulu')
      return
    }

    const amount = parseFloat(formData.amount)
    if (!amount || amount <= 0) {
      toast.error('Jumlah pembayaran harus lebih dari 0')
      return
    }

    if (amount > remainingBalance) {
      toast.error(`Jumlah pembayaran melebihi sisa tagihan (${formatCurrency(remainingBalance)})`)
      return
    }

    try {
      setLoading(true)
      
      await createPayment({
        order_id: selectedOrderId,
        amount: amount,
        payment_method: formData.payment_method,
        notes: formData.notes || undefined,
      })
      
      toast.success('Pembayaran berhasil dicatat')
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      console.error('Error creating payment:', error)
      toast.error('Gagal mencatat pembayaran')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      amount: '',
      payment_method: 'cash',
      notes: '',
    })
    if (!preselectedOrder) {
      setSelectedOrderId('')
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !loading) {
      resetForm()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Catat Pembayaran</DialogTitle>
          <DialogDescription>
            Tambahkan pembayaran untuk pesanan
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {!preselectedOrder && (
              <div className="grid gap-2">
                <Label htmlFor="order">Pesanan *</Label>
                <Select value={selectedOrderId} onValueChange={setSelectedOrderId} disabled={loadingOrders}>
                  <SelectTrigger id="order">
                    <SelectValue placeholder={loadingOrders ? "Memuat..." : "Pilih pesanan"} />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.order_number} - {order.customer?.name} ({formatCurrency(order.total_amount - order.paid_amount)} tersisa)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedOrder && (
              <div className="p-3 bg-secondary rounded-lg space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">No. Pesanan:</span>
                  <span className="font-medium">{selectedOrder.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span>{formatCurrency(selectedOrder.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sudah Dibayar:</span>
                  <span className="text-green-600">{formatCurrency(selectedOrder.paid_amount)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Sisa:</span>
                  <span className="text-red-600">{formatCurrency(remainingBalance)}</span>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="amount">Jumlah Pembayaran *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Contoh: 50000"
                disabled={loading || !selectedOrderId}
                required
                min="0"
                step="100"
              />
              {selectedOrder && remainingBalance > 0 && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => setFormData({ ...formData, amount: remainingBalance.toString() })}
                >
                  Bayar Penuh ({formatCurrency(remainingBalance)})
                </Button>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="payment_method">Metode Pembayaran *</Label>
              <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value })}>
                <SelectTrigger id="payment_method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Tunai (Cash)</SelectItem>
                  <SelectItem value="transfer">Transfer Bank</SelectItem>
                  <SelectItem value="debit">Kartu Debit</SelectItem>
                  <SelectItem value="credit">Kartu Kredit</SelectItem>
                  <SelectItem value="e-wallet">E-Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Catatan pembayaran (opsional)"
                disabled={loading}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading || !selectedOrderId}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Catat Pembayaran
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
