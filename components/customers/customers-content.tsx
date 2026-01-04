"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Edit, Trash2, Phone, MapPin, Loader2 } from "lucide-react"
import { fetchCustomers, deleteCustomer } from '@/lib/api/customers'
import { formatPhoneNumber, formatDate } from '@/lib/utils/formatters'
import type { Customer } from '@/lib/supabase/types'
import { toast } from 'sonner'
import { CustomerDialog } from './customer-dialog'

export function CustomersContent() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    try {
      setLoading(true)
      const data = await fetchCustomers()
      setCustomers(data)
    } catch (error) {
      console.error('Error loading customers:', error)
      toast.error('Gagal memuat data pelanggan')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus pelanggan "${name}"?`)) {
      return
    }

    try {
      await deleteCustomer(id)
      toast.success('Pelanggan berhasil dihapus')
      loadCustomers()
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error('Gagal menghapus pelanggan')
    }
  }

  function handleEdit(customer: Customer) {
    setSelectedCustomer(customer)
    setDialogOpen(true)
  }

  function handleCreate() {
    setSelectedCustomer(null)
    setDialogOpen(true)
  }

  const filteredCustomers = customers.filter(
    (customer) => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      customer.phone.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Memuat data pelanggan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manajemen Pelanggan</h1>
          <p className="text-muted-foreground mt-1">Kelola data dan riwayat pelanggan Anda</p>
        </div>
        <Button className="gap-2" onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          Tambah Pelanggan
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan nama, nomor HP, atau email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <div className="space-y-4">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{customer.name}</h3>
                    <div className="space-y-2 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {formatPhoneNumber(customer.phone)}
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4">📧</span>
                          {customer.email}
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {customer.address}
                          {customer.city && `, ${customer.city}`}
                          {customer.postal_code && ` ${customer.postal_code}`}
                        </div>
                      )}
                    </div>
                    {customer.special_notes && (
                      <div className="mt-3 p-2 bg-secondary/50 rounded text-sm text-foreground">
                        <span className="font-medium">Catatan:</span> {customer.special_notes}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-muted-foreground">
                      Bergabung: {formatDate(customer.created_at)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:flex-col">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 bg-transparent"
                      onClick={() => handleEdit(customer)}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive gap-2 bg-transparent"
                      onClick={() => handleDelete(customer.id, customer.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">
                {searchTerm ? 'Tidak ada pelanggan yang cocok dengan pencarian' : 'Belum ada pelanggan'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Customer Dialog */}
      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={selectedCustomer}
        onSuccess={loadCustomers}
      />
    </div>
  )
}
