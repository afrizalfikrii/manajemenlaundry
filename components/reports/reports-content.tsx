"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { Download, CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { getServiceDistribution, getMonthlyOrdersTrend } from '@/lib/api/analytics'
import { fetchOrders } from '@/lib/api/orders'
import { getTotalRevenue } from '@/lib/api/payments'
import { formatCurrency } from '@/lib/utils/formatters'
import { cn } from "@/lib/utils"
import { toast } from 'sonner'

const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
]

export function ReportsContent() {
  const [loading, setLoading] = useState(true)
  const [serviceData, setServiceData] = useState<any[]>([])
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgPerOrder: 0,
    activeCustomers: 0
  })
  
  // Date range filter
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().setMonth(new Date().getMonth() - 6)) // Last 6 months
  )
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    loadReportsData()
  }, [startDate, endDate])

  async function loadReportsData() {
    try {
      setLoading(true)
      
      const start = startDate?.toISOString()
      const end = endDate?.toISOString()

      const [services, trend, orders, revenue] = await Promise.all([
        getServiceDistribution(start, end),
        getMonthlyOrdersTrend(12),
        fetchOrders(),
        getTotalRevenue(start, end),
      ])

      // Filter orders by date range
      const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.order_date)
        const afterStart = !startDate || orderDate >= startDate
        const beforeEnd = !endDate || orderDate <= endDate
        return afterStart && beforeEnd
      })

      // Calculate stats
      const totalOrders = filteredOrders.length
      const totalRevenue = revenue
      const avgPerOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0
      
      // Count unique customers
      const uniqueCustomers = new Set(filteredOrders.map(o => o.customer_id)).size

      setServiceData(services.map((item, index) => ({
        ...item,
        fill: COLORS[index % COLORS.length]
      })))
      
      setMonthlyTrend(trend)
      
      setStats({
        totalOrders,
        totalRevenue,
        avgPerOrder,
        activeCustomers: uniqueCustomers
      })
    } catch (error) {
      console.error('Error loading reports data:', error)
      toast.error('Gagal memuat data laporan')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Memuat data laporan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Laporan & Analitik</h1>
          <p className="text-muted-foreground mt-1">Visualisasi data penjualan dan performa bisnis</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dari Tanggal</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP", { locale: id }) : "Pilih tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sampai Tanggal</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP", { locale: id }) : "Pilih tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{stats.totalOrders.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Periode terpilih</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">Periode terpilih</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rata-rata per Order</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{formatCurrency(stats.avgPerOrder)}</p>
            <p className="text-xs text-muted-foreground mt-1">Average order value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pelanggan Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-chart-5">{stats.activeCustomers}</p>
            <p className="text-xs text-muted-foreground mt-1">Unique customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Layanan</CardTitle>
          </CardHeader>
          <CardContent>
            {serviceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Tidak ada data layanan
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Pesanan Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: `1px solid hsl(var(--border))`,
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Tidak ada data trend
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
