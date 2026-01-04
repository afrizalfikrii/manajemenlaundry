"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { ShoppingBag, CheckCircle, Clock, DollarSign, Loader2 } from "lucide-react"
import { fetchDashboardStats, fetchRevenueChart, fetchRecentOrdersForDashboard } from '@/lib/api/dashboard'
import { formatCurrency, formatDateShort, getStatusColor, getStatusLabel } from '@/lib/utils/formatters'
import type { DashboardStats, RevenueData } from '@/lib/supabase/types'

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch all dashboard data in parallel
        const [statsData, revenueChartData, ordersData] = await Promise.all([
          fetchDashboardStats(),
          fetchRevenueChart(7), // Last 7 days
          fetchRecentOrdersForDashboard(5),
        ])

        setStats(statsData)
        setRevenueData(revenueChartData)
        setRecentOrders(ordersData)
      } catch (err) {
        console.error('Error loading dashboard:', err)
        setError('Gagal memuat data dashboard. Pastikan Supabase sudah dikonfigurasi dengan benar.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
            <p className="text-sm text-red-600 mt-2">
              Periksa file .env.local dan pastikan database schema sudah dijalankan.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Pendapatan Bulan Ini",
      value: formatCurrency(stats?.totalRevenue || 0),
      change: stats?.revenueChange || 0,
      icon: DollarSign,
      color: "text-emerald-600",
    },
    {
      title: "Pesanan Aktif",
      value: stats?.activeOrders.toString() || "0",
      icon: ShoppingBag,
      color: "text-blue-600",
    },
    {
      title: "Total Pelanggan",
      value: stats?.totalCustomers.toString() || "0",
      icon: CheckCircle,
      color: "text-purple-600",
    },
    {
      title: "Total Pesanan",
      value: stats?.totalOrders.toString() || "0",
      icon: Clock,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                {stat.change !== undefined && (
                  <p className={`text-xs mt-1 ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}% dari bulan lalu
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Pendapatan 7 Hari Terakhir</CardTitle>
          <CardDescription>Tren pendapatan harian</CardDescription>
        </CardHeader>
        <CardContent>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--color-muted-foreground)"
                  tickFormatter={(value) => formatDateShort(value)}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  tickFormatter={(value) => `Rp ${(value / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: `1px solid var(--color-border)`,
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => [formatCurrency(value), 'Pendapatan']}
                  labelFormatter={(label) => formatDateShort(label)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Pendapatan"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-primary)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">Belum ada data pendapatan</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pesanan Terbaru</CardTitle>
            <CardDescription>5 pesanan terakhir</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/orders'}>
            Lihat Semua
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">No. Order</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Pelanggan</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Total</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-4 text-foreground font-medium">{order.order_number}</td>
                      <td className="py-3 px-4 text-foreground">{order.customer?.name || '-'}</td>
                      <td className="py-3 px-4 text-right text-foreground font-medium">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {formatDateShort(order.order_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Belum ada pesanan</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
