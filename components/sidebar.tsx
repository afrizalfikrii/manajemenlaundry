"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Shirt, DollarSign, Settings, BarChart3, X, Droplet } from "lucide-react"

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const menuItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/customers",
    label: "Pelanggan",
    icon: Users,
  },
  {
    href: "/orders",
    label: "Pesanan",
    icon: Shirt,
  },
  {
    href: "/services",
    label: "Layanan",
    icon: Droplet,
  },
  {
    href: "/finance",
    label: "Keuangan",
    icon: DollarSign,
  },
  {
    href: "/reports",
    label: "Laporan",
    icon: BarChart3,
  },
  {
    href: "/settings",
    label: "Pengaturan",
    icon: Settings,
  },
]

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => onOpenChange(false)} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-50",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Laundry Admin" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-sidebar-foreground hidden md:inline">Laundry Admin</span>
          </div>
          <button onClick={() => onOpenChange(false)} className="md:hidden text-sidebar-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="px-4 py-3 rounded-lg bg-sidebar-accent/10">
            <p className="text-xs text-sidebar-foreground/70">LaundryPro v1.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}
