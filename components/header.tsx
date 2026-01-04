"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, Bell, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getCurrentUser, signOut } from "@/lib/api/auth"
import { toast } from "sonner"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadUser()
  }, [])

  async function loadUser() {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  async function handleLogout() {
    try {
      await signOut()
      toast.success('Logout berhasil')
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout gagal')
    }
  }

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <button onClick={onMenuClick} className="md:hidden text-foreground">
        <Menu className="w-6 h-6" />
      </button>

      <div className="hidden md:block">
        <h1 className="text-2xl font-bold text-foreground">Laundry Admin</h1>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.email || 'Admin'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  Administrator
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
