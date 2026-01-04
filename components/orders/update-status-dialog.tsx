"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, MessageCircle } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { updateOrderStatus } from '@/lib/api/orders'
import { cn } from "@/lib/utils"
import { toast } from 'sonner'
import { Checkbox } from "@/components/ui/checkbox"
import { sendWhatsApp, generatePickupReminderMessage } from '@/lib/utils/whatsapp'

interface UpdateStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: any
  onSuccess: () => void
}

export function UpdateStatusDialog({ open, onOpenChange, order, onSuccess }: UpdateStatusDialogProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(order?.status || 'pending')
  const [sendNotification, setSendNotification] = useState(true)
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    order?.delivery_date ? new Date(order.delivery_date) : undefined
  )
  
  // Sync status with order when dialog opens or order changes
  useEffect(() => {
    if (order?.status) {
      setStatus(order.status)
    }
  }, [order?.status, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!order) return

    try {
      setLoading(true)
      
      await updateOrderStatus(
        order.id, 
        status,
        status === 'completed' && deliveryDate ? deliveryDate.toISOString() : undefined
      )
      
      toast.success('Status pesanan berhasil diupdate')
      
      // Send WhatsApp notification if status is ready and checkbox is checked
      if (status === 'ready' && sendNotification && order.customer?.phone) {
        const message = generatePickupReminderMessage({
          customerName: order.customer.name,
          orderNumber: order.order_number,
        })
        
        sendWhatsApp(order.customer.phone, message)
        toast.success('WhatsApp terbuka! Silakan kirim notifikasi ke customer', {
          duration: 5000,
        })
      }
      
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error updating status:', error)
      toast.error('Gagal mengupdate status pesanan')
    } finally {
      setLoading(false)
    }
  }

  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Status Pesanan</DialogTitle>
          <DialogDescription>
            Order: {order.order_number}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Status Saat Ini</Label>
              <div className="p-2 bg-secondary rounded text-sm">
                <span className="capitalize">{order.status}</span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status Baru *</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="processing">Diproses</SelectItem>
                  <SelectItem value="ready">Siap Diambil</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {status === 'completed' && (
              <div className="grid gap-2">
                <Label>Tanggal Pengambilan</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !deliveryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deliveryDate ? format(deliveryDate, "PPP", { locale: id }) : "Pilih tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={deliveryDate}
                      onSelect={setDeliveryDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {status === 'ready' && order.customer?.phone && (
              <div className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <Checkbox 
                  id="send-notification" 
                  checked={sendNotification}
                  onCheckedChange={(checked) => setSendNotification(checked as boolean)}
                  className="mt-0.5"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="send-notification"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    Kirim notifikasi WhatsApp ke customer
                  </label>
                  <p className="text-xs text-muted-foreground">
                    WhatsApp akan terbuka dengan pesan "Pesanan sudah selesai, silakan diambil"
                  </p>
                </div>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Alur Status:</p>
              <p>Menunggu → Diproses → Siap Diambil → Selesai</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
