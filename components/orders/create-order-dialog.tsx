"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, Loader2, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { fetchCustomers } from '@/lib/api/customers'
import { fetchServices } from '@/lib/api/services'
import { createOrder } from '@/lib/api/orders'
import { formatCurrency, formatPhoneNumber } from '@/lib/utils/formatters'
import { cn } from "@/lib/utils"
import { toast } from 'sonner'

interface OrderItem {
  service_id: string
  service_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

interface CreateOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateOrderDialog({ open, onOpenChange, onSuccess }: CreateOrderDialogProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  
  // Data
  const [customers, setCustomers] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  
  // Form data
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [items, setItems] = useState<OrderItem[]>([])
  const [pickupDate, setPickupDate] = useState<Date | undefined>(new Date())
  const [notes, setNotes] = useState('')

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId)
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0)

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  async function loadData() {
    try {
      setLoadingData(true)
      const [customersData, servicesData] = await Promise.all([
        fetchCustomers(),
        fetchServices(),
      ])
      setCustomers(customersData.filter(c => c.is_active))
      setServices(servicesData.filter(s => s.is_active))
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Gagal memuat data')
    } finally {
      setLoadingData(false)
    }
  }

  function addItem() {
    setItems([...items, {
      service_id: '',
      service_name: '',
      quantity: 1,
      unit_price: 0,
      subtotal: 0,
    }])
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof OrderItem, value: any) {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Update related fields
    if (field === 'service_id') {
      const service = services.find(s => s.id === value)
      if (service) {
        newItems[index].service_name = service.name
        newItems[index].unit_price = service.unit_price
        newItems[index].subtotal = newItems[index].quantity * service.unit_price
      }
    } else if (field === 'quantity') {
      newItems[index].subtotal = value * newItems[index].unit_price
    }
    
    setItems(newItems)
  }

  function canProceedToStep2() {
    return selectedCustomerId !== ''
  }

  function canProceedToStep3() {
    return items.length > 0 && items.every(item => item.service_id && item.quantity > 0)
  }

  async function handleSubmit() {
    if (!selectedCustomerId || items.length === 0) {
      toast.error('Data tidak lengkap')
      return
    }

    try {
      setLoading(true)
      
      await createOrder({
        customer_id: selectedCustomerId,
        items: items.map(item => ({
          service_id: item.service_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
        pickup_date: pickupDate?.toISOString(),
        notes: notes || undefined,
      })
      
      toast.success('Pesanan berhasil dibuat')
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      console.error('Error creating order:', error)
      toast.error('Gagal membuat pesanan')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setStep(1)
    setSelectedCustomerId('')
    setItems([])
    setPickupDate(new Date())
    setNotes('')
  }

  function handleOpenChange(open: boolean) {
    if (!open && !loading) {
      resetForm()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Pesanan Baru</DialogTitle>
          <DialogDescription>
            Step {step} dari 3: {step === 1 ? 'Pilih Pelanggan' : step === 2 ? 'Tambah Item' : 'Review & Konfirmasi'}
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Step 1: Select Customer */}
            {step === 1 && (
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer">Pilih Pelanggan *</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger id="customer">
                      <SelectValue placeholder="Pilih pelanggan" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {formatPhoneNumber(customer.phone)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCustomer && (
                  <div className="p-4 bg-secondary rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nama:</span>
                      <span className="font-medium">{selectedCustomer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Telepon:</span>
                      <span>{formatPhoneNumber(selectedCustomer.phone)}</span>
                    </div>
                    {selectedCustomer.address && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Alamat:</span>
                        <span className="text-right max-w-[300px]">{selectedCustomer.address}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Add Items */}
            {step === 2 && (
              <div className="space-y-4 py-4">
                <div className="flex justify-between items-center">
                  <Label>Item Pesanan</Label>
                  <Button type="button" size="sm" onClick={addItem}>
                    <Plus className="w-4 h-4 mr-1" />
                    Tambah Item
                  </Button>
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Belum ada item</p>
                    <p className="text-sm">Klik "Tambah Item" untuk menambahkan layanan</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="p-3 border rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <Label className="text-sm">Item {index + 1}</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="h-auto p-1 text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid gap-2">
                          <Select
                            value={item.service_id}
                            onValueChange={(value) => updateItem(index, 'service_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih layanan" />
                            </SelectTrigger>
                            <SelectContent>
                              {services.map((service) => (
                                <SelectItem key={service.id} value={service.id}>
                                  {service.name} - {formatCurrency(service.unit_price)}/{service.unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Jumlah</Label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              min="0.1"
                              step="0.1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Subtotal</Label>
                            <div className="h-10 px-3 py-2 bg-secondary rounded-md text-sm font-medium flex items-center">
                              {formatCurrency(item.subtotal)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Separator />
                    <div className="flex justify-between items-center font-bold">
                      <span>Total:</span>
                      <span className="text-lg">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-4 py-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Pelanggan</Label>
                    <p className="font-medium">{selectedCustomer?.name}</p>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm text-muted-foreground">Item Pesanan ({items.length})</Label>
                    <div className="mt-2 space-y-2">
                      {items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.service_name} × {item.quantity}</span>
                          <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-lg">{formatCurrency(totalAmount)}</span>
                  </div>

                  <Separator />

                  <div className="grid gap-2">
                    <Label>Tanggal Pickup</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !pickupDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {pickupDate ? format(pickupDate, "PPP", { locale: id }) : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={pickupDate}
                          onSelect={setPickupDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="notes">Catatan</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Catatan pesanan (opsional)"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <DialogFooter className="flex justify-between sm:justify-between">
          <div className="flex gap-2">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={loading}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Kembali
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>

            {step < 3 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !canProceedToStep2()) ||
                  (step === 2 && !canProceedToStep3())
                }
              >
                Lanjut
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Buat Pesanan
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
