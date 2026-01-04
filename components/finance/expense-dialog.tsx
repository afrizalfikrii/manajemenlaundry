"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { createExpense } from '@/lib/api/expenses'
import { toast } from 'sonner'

interface ExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ExpenseDialog({ open, onOpenChange, onSuccess }: ExpenseDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    category: 'supplies',
    description: '',
    amount: '',
    payment_method: 'cash',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.description.trim()) {
      toast.error('Deskripsi harus diisi')
      return
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Jumlah harus lebih dari 0')
      return
    }

    try {
      setLoading(true)
      
      await createExpense({
        category: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount),
        expense_date: new Date().toISOString(),
        payment_method: formData.payment_method,
        notes: formData.notes || undefined,
      })
      
      toast.success('Pengeluaran berhasil ditambahkan')
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      console.error('Error saving expense:', error)
      toast.error('Gagal menambahkan pengeluaran')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      category: 'supplies',
      description: '',
      amount: '',
      payment_method: 'cash',
      notes: '',
    })
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
          <DialogTitle>Tambah Pengeluaran</DialogTitle>
          <DialogDescription>
            Catat pengeluaran bisnis Anda
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplies">Perlengkapan (Supplies)</SelectItem>
                  <SelectItem value="utilities">Utilitas (Listrik, Air)</SelectItem>
                  <SelectItem value="staff">Gaji Karyawan</SelectItem>
                  <SelectItem value="maintenance">Perawatan & Perbaikan</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Contoh: Pembelian detergen 10kg"
                disabled={loading}
                required
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Jumlah *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="100000"
                disabled={loading}
                required
                min="0"
                step="100"
              />
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
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Catatan tambahan (opsional)"
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
              Tambah
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
