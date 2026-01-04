"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Database, Loader2, Info, AlertTriangle } from "lucide-react"
import { downloadBackup } from "@/lib/utils/backup"
import { toast } from "sonner"

export function SettingsContent() {
  const [backupLoading, setBackupLoading] = useState(false)

  async function handleBackup() {
    try {
      setBackupLoading(true)
      await downloadBackup()
      toast.success('Backup berhasil didownload!')
    } catch (error) {
      console.error('Backup error:', error)
      toast.error('Gagal membuat backup')
    } finally {
      setBackupLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-muted-foreground mt-1">Kelola data dan backup aplikasi</p>
      </div>

      {/* Data & Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data & Backup
          </CardTitle>
          <CardDescription>
            Download backup data untuk keamanan dan arsip
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Backup akan mengunduh semua data (customers, services, orders, payments, expenses) 
              dalam format JSON. Simpan file backup di tempat yang aman.
            </AlertDescription>
          </Alert>

          {/* Warning Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Penting:</strong> Lakukan backup secara berkala untuk melindungi data bisnis Anda. 
              Disarankan backup minimal 1x per minggu.
            </AlertDescription>
          </Alert>

          {/* Backup Button */}
          <div className="pt-2">
            <Button 
              onClick={handleBackup} 
              disabled={backupLoading}
              size="lg"
              className="w-full sm:w-auto"
            >
              {backupLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat Backup...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Backup
                </>
              )}
            </Button>
          </div>

          {/* Info Text */}
          <div className="text-sm text-muted-foreground space-y-1 pt-2">
            <p>• File backup akan didownload dalam format JSON</p>
            <p>• Nama file: laundry-backup-YYYY-MM-DD.json</p>
            <p>• Backup berisi semua data aplikasi</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
