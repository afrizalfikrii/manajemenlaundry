"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { createCustomer, updateCustomer } from '@/lib/api/customers'
import type { Customer } from '@/lib/supabase/types'
import { toast } from 'sonner'

interface CustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer | null
  onSuccess: () => void
}

export function CustomerDialog({ open, onOpenChange, customer, onSuccess }: CustomerDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || '',
    city: customer?.city || '',
    postal_code: customer?.postal_code || '',
    special_notes: customer?.special_notes || '',
  })

  const isEdit = !!customer

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Nama pelanggan harus diisi')
      return
    }
    if (!formData.phone.trim()) {
      toast.error('Nomor telepon harus diisi')
      return
    }

    try {
      setLoading(true)
      
      if (isEdit) {
        await updateCustomer(customer.id, formData)
        toast.success('Pelanggan berhasil diupdate')
      } else {
        await createCustomer({ ...formData, is_active: true })
        toast.success('Pelanggan berhasil ditambahkan')
      }
      
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      console.error('Error saving customer:', error)
      if (error.message?.includes('duplicate key')) {
        toast.error('Nomor telepon sudah terdaftar')
      } else {
        toast.error(isEdit ? 'Gagal mengupdate pelanggan' : 'Gagal menambahkan pelanggan')
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      postal_code: '',
      special_notes: '',
    })
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !loading) {
      resetForm()
    }
    onOpenChange(open)
  }

  // Update form when customer prop changes
  if (customer && formData.name === '' && open) {
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      city: customer.city || '',
      postal_code: customer.postal_code || '',
      special_notes: customer.special_notes || '',
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update informasi pelanggan' : 'Masukkan data pelanggan baru'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Ahmad Santoso"
                disabled={loading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Nomor Telepon *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Contoh: 081234567890"
                disabled={loading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Contoh: email@example.com"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Jl. Contoh No. 123"
                disabled={loading}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">Kota</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Jakarta"
                  disabled={loading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="postal_code">Kode Pos</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  placeholder="12345"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="special_notes">Catatan Khusus</Label>
              <Textarea
                id="special_notes"
                value={formData.special_notes}
                onChange={(e) => setFormData({ ...formData, special_notes: e.target.value })}
                placeholder="Contoh: Alergi pewangi, cuci terpisah, dll"
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Update' : 'Tambah'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
