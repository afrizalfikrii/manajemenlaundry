"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, ToggleLeft as Toggle, Loader2 } from "lucide-react"
import { fetchServices, deleteService, updateService } from '@/lib/api/services'
import { formatCurrency } from '@/lib/utils/formatters'
import type { Service } from '@/lib/supabase/types'
import { toast } from 'sonner'
import { ServiceDialog } from './service-dialog'

export function ServicesContent() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  useEffect(() => {
    loadServices()
  }, [])

  async function loadServices() {
    try {
      setLoading(true)
      const data = await fetchServices()
      setServices(data)
    } catch (error) {
      console.error('Error loading services:', error)
      toast.error('Gagal memuat data layanan')
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    try {
      await updateService(id, { is_active: !currentStatus })
      toast.success(`Layanan ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
      loadServices()
    } catch (error) {
      console.error('Error toggling service:', error)
      toast.error('Gagal mengubah status layanan')
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus layanan "${name}"?`)) {
      return
    }

    try {
      await deleteService(id)
      toast.success('Layanan berhasil dihapus')
      loadServices()
    } catch (error) {
      console.error('Error deleting service:', error)
      toast.error('Gagal menghapus layanan')
    }
  }

  function handleEdit(service: Service) {
    setSelectedService(service)
    setDialogOpen(true)
  }

  function handleCreate() {
    setSelectedService(null)
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Memuat data layanan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manajemen Layanan</h1>
          <p className="text-muted-foreground mt-1">Kelola jenis layanan dan harga</p>
        </div>
        <Button className="gap-2" onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          Tambah Layanan
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.length > 0 ? (
          services.map((service) => (
            <Card key={service.id} className={`${!service.is_active ? "opacity-60" : ""} hover:shadow-md transition-shadow`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{service.description || 'Tidak ada deskripsi'}</p>
                    {service.category && (
                      <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">
                        {service.category}
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      service.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {service.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-secondary/50 rounded">
                  <p className="text-xs text-muted-foreground">Harga per {service.unit}</p>
                  <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(service.unit_price)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2 bg-transparent"
                    onClick={() => handleEdit(service)}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 bg-transparent"
                    onClick={() => toggleActive(service.id, service.is_active)}
                  >
                    <Toggle className="w-4 h-4" />
                    {service.is_active ? "Nonaktifkan" : "Aktifkan"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive gap-2 bg-transparent"
                    onClick={() => handleDelete(service.id, service.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">Belum ada layanan</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Service Dialog */}
      <ServiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={selectedService}
        onSuccess={loadServices}
      />
    </div>
  )
}
