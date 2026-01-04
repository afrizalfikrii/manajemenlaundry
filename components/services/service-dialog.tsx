"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { createService, updateService } from '@/lib/api/services'
import type { Service } from '@/lib/supabase/types'
import { toast } from 'sonner'

interface ServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service?: Service | null
  onSuccess: () => void
}

export function ServiceDialog({ open, onOpenChange, service, onSuccess }: ServiceDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    unit_price: service?.unit_price?.toString() || '',
    unit: service?.unit || 'kg',
    category: service?.category || 'washing',
  })

  const isEdit = !!service

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Nama layanan harus diisi')
      return
    }
    if (!formData.unit_price || parseFloat(formData.unit_price) <= 0) {
      toast.error('Harga harus lebih dari 0')
      return
    }

    try {
      setLoading(true)
      
      const data = {
        name: formData.name,
        description: formData.description || undefined,
        unit_price: parseFloat(formData.unit_price),
        unit: formData.unit,
        category: formData.category,
        is_active: true,
      }
      
      if (isEdit) {
        await updateService(service.id, data)
        toast.success('Layanan berhasil diupdate')
      } else {
        await createService(data)
        toast.success('Layanan berhasil ditambahkan')
      }
      
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      console.error('Error saving service:', error)
      toast.error(isEdit ? 'Gagal mengupdate layanan' : 'Gagal menambahkan layanan')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      unit_price: '',
      unit: 'kg',
      category: 'washing',
    })
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !loading) {
      resetForm()
    }
    onOpenChange(open)
  }

  if (service && formData.name === '' && open) {
    setFormData({
      name: service.name,
      description: service.description || '',
      unit_price: service.unit_price.toString(),
      unit: service.unit,
      category: service.category || 'washing',
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Layanan' : 'Tambah Layanan Baru'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update informasi layanan' : 'Masukkan data layanan baru'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Layanan *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Cuci Kiloan Reguler"
                disabled={loading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi layanan"
                disabled={loading}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="unit_price">Harga *</Label>
                <Input
                  id="unit_price"
                  type="number"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                  placeholder="10000"
                  disabled={loading}
                  required
                  min="0"
                  step="100"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="unit">Satuan *</Label>
                <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="item">Item</SelectItem>
                    <SelectItem value="pasang">Pasang</SelectItem>
                    <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="washing">Cuci (Washing)</SelectItem>
                  <SelectItem value="dry_cleaning">Dry Cleaning</SelectItem>
                  <SelectItem value="ironing">Setrika (Ironing)</SelectItem>
                  <SelectItem value="express">Express</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
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
