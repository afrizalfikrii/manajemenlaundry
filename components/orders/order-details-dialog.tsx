"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { FileText, User, Package, CreditCard, Printer, MessageCircle } from "lucide-react"
import { formatCurrency, formatDate, formatPhoneNumber, getStatusColor, getStatusLabel } from '@/lib/utils/formatters'
import { InvoiceTemplate } from './invoice-template'
import { printInvoice } from '@/lib/utils/print'
import { sendWhatsApp, generatePickupReminderMessage } from '@/lib/utils/whatsapp'
import { toast } from 'sonner'

interface OrderDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: any
  onUpdateStatus?: () => void
  onAddPayment?: () => void
}

export function OrderDetailsDialog({ open, onOpenChange, order, onUpdateStatus, onAddPayment }: OrderDetailsDialogProps) {
  if (!order) return null

  const remainingBalance = order.total_amount - order.paid_amount
  
  function handleSendPickupReminder() {
    if (!order.customer?.phone) {
      toast.error('Nomor telepon customer tidak tersedia')
      return
    }
    
    const message = generatePickupReminderMessage({
      customerName: order.customer.name,
      orderNumber: order.order_number,
    })
    
    sendWhatsApp(order.customer.phone, message)
    toast.success('WhatsApp terbuka! Silakan kirim pesan')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Detail Pesanan
          </DialogTitle>
          <DialogDescription>
            {order.order_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-4 h-4" />
                Informasi Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">No. Pesanan:</span>
                <span className="font-medium">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal Order:</span>
                <span>{formatDate(order.order_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge className={getStatusColor(order.status)}>
                  {getStatusLabel(order.status)}
                </Badge>
              </div>
              {order.pickup_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal Pickup:</span>
                  <span>{formatDate(order.pickup_date)}</span>
                </div>
              )}
              {order.delivery_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal Selesai:</span>
                  <span>{formatDate(order.delivery_date)}</span>
                </div>
              )}
              {order.notes && (
                <div className="pt-2">
                  <p className="text-muted-foreground mb-1">Catatan:</p>
                  <p className="text-foreground">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                Informasi Pelanggan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nama:</span>
                <span className="font-medium">{order.customer?.name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Telepon:</span>
                <span>{order.customer?.phone ? formatPhoneNumber(order.customer.phone) : '-'}</span>
              </div>
              {order.customer?.address && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alamat:</span>
                  <span className="text-right max-w-[300px]">{order.customer.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Item Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.order_items && order.order_items.length > 0 ? (
                  <>
                    {order.order_items.map((item: any, index: number) => (
                      <div key={item.id || index} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.service?.name || 'Unknown Service'}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} × {formatCurrency(item.unit_price)}
                          </p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center font-bold">
                      <span>Total:</span>
                      <span className="text-lg">{formatCurrency(order.total_amount)}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Tidak ada item</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Informasi Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Pesanan:</span>
                  <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sudah Dibayar:</span>
                  <span className="font-medium text-green-600">{formatCurrency(order.paid_amount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium">Sisa:</span>
                  <span className={`font-bold ${remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(remainingBalance)}
                  </span>
                </div>
              </div>

              {remainingBalance > 0 && onAddPayment && (
                <Button 
                  onClick={onAddPayment} 
                  className="w-full"
                  size="sm"
                >
                  Tambah Pembayaran
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button onClick={printInvoice} variant="outline" className="flex-1">
              <Printer className="w-4 h-4 mr-2" />
              Cetak Nota
            </Button>
            {order.status === 'ready' && order.customer?.phone && (
              <Button onClick={handleSendPickupReminder} variant="outline" className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
                <MessageCircle className="w-4 h-4 mr-2" />
                Kirim Reminder
              </Button>
            )}
            {onUpdateStatus && (
              <Button onClick={onUpdateStatus} variant="outline" className="flex-1">
                Update Status
              </Button>
            )}
            <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
              Tutup
            </Button>
          </div>
        </div>

        {/* Invoice Template (hidden, only for printing) */}
        <InvoiceTemplate order={order} />
      </DialogContent>
    </Dialog>
  )
}
