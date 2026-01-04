"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { signIn } from "@/lib/api/auth"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validation
    if (!formData.email || !formData.password) {
      toast.error('Email dan password harus diisi')
      return
    }

    if (!formData.email.includes('@')) {
      toast.error('Format email tidak valid')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }

    try {
      setLoading(true)
      await signIn(formData.email, formData.password)
      toast.success('Login berhasil!')
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      console.error('Login error:', error)
      
      // Handle specific error messages
      if (error.message?.includes('Invalid login credentials')) {
        toast.error('Email atau password salah')
      } else if (error.message?.includes('Email not confirmed')) {
        toast.error('Email belum diverifikasi')
      } else {
        toast.error('Login gagal. Silakan coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-blue-600 p-12">
        <div className="max-w-xl">
          <div className="text-white text-center mb-8">
            <h1 className="text-4xl font-bold mb-3">Welcome Back</h1>
            <p className="text-lg text-blue-100">Kelola bisnis laundry Anda dengan mudah</p>
          </div>
          <img 
            src="/laundry_illustration.webp" 
            alt="Laundry Illustration" 
            className="w-full object-contain"
          />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src="/logo.png" 
              alt="Laundry Admin" 
              className="w-16 h-16 rounded-lg object-cover" 
            />
          </div>

          {/* Login Form */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Log In</h2>
            <p className="text-gray-600 dark:text-gray-400">Enter your valid credential for logging in</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enter your email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@laundry.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
                required
                className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enter your password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                  required
                  className="h-12 pr-10 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {loading ? 'Memproses...' : 'Log In'}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Aplikasi Admin Laundry</p>
            <p className="mt-1">Hubungi administrator untuk akses</p>
          </div>
        </div>
      </div>
    </div>
  )
}
