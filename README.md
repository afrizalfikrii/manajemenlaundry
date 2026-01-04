# 🧺 Laundry Admin - Web Portal

Sistem manajemen laundry profesional berbasis web untuk mengelola pesanan, pelanggan, keuangan, dan laporan bisnis laundry.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)

---

## 📋 Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Penggunaan](#penggunaan)
- [Struktur Project](#struktur-project)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## ✨ Fitur Utama

### 🏠 Dashboard

- Overview bisnis (revenue, orders, customers)
- Chart revenue trend
- Recent orders list
- Quick statistics

### 👥 Manajemen Pelanggan

- CRUD pelanggan (Create, Read, Update, Delete)
- Search pelanggan
- Data lengkap (nama, telepon, email, alamat)
- Status aktif/non-aktif

### � Manajemen Layanan

- CRUD layanan laundry
- Kategori layanan (Cuci, Setrika, Dry Clean, dll)
- Harga per unit (kg, pcs, pasang)
- Status aktif/non-aktif

### 📦 Manajemen Pesanan

- **Create order** - Multi-step wizard untuk buat pesanan
- **Order details** - Lihat detail lengkap pesanan
- **Update status** - Ubah status (Pending → Processing → Completed)
- **Add payment** - Tambah pembayaran untuk pesanan
- **Delete order** - Hapus pesanan
- **Search & filter** - Cari by nomor order/customer, filter by status
- **Print invoice** - Cetak nota untuk customer
- Auto-calculate totals

### 💰 Manajemen Keuangan

- View payments list
- Add/delete expenses
- Delete payments
- **Export to CSV** - Download data payments/expenses
- **Financial summary** - Laporan pendapatan vs pengeluaran
- **Date range filter** - Filter data by periode
- Net profit calculation

### 📊 Laporan & Analitik

- **Service distribution chart** - Pie chart layanan terlaris
- **Monthly trend chart** - Line chart pertumbuhan pesanan
- Summary statistics (orders, revenue, customers)
- Date range filter
- Real-time data dari Supabase

### � Authentication

- Login dengan email & password
- Protected routes (middleware)
- Session management
- Logout functionality
- User display di header

---

## 🛠 Tech Stack

### Frontend

- **Next.js 16** - React framework dengan App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Re-usable component library
- **Recharts** - Chart library untuk visualisasi data
- **Lucide React** - Icon library

### Backend

- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row Level Security (RLS)

### Tools & Libraries

- **date-fns** - Date manipulation
- **sonner** - Toast notifications
- **clsx** - Conditional classnames

---

## 📥 Instalasi

### Prerequisites

- Node.js 18+
- pnpm (atau npm/yarn)
- Supabase account

### Steps

1. **Clone repository**

```bash
git clone <repository-url>
cd laundry-admin
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Setup environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Setup database**

- Buka Supabase Dashboard
- Buat project baru
- Jalankan SQL dari `supabase/schema.sql`
- (Optional) Jalankan `supabase/seed.sql` untuk sample data

5. **Create admin user**

- Go to Supabase Dashboard → Authentication → Users
- Click "Add User"
- Email: `admin@laundry.com`
- Password: `admin123`
- Auto Confirm User: ON

6. **Run development server**

```bash
pnpm run dev
```

7. **Open browser**

```
http://localhost:3000
```

---

## ⚙️ Konfigurasi

### Supabase Setup

1. **Create Supabase Project**

   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Copy URL & Anon Key

2. **Run Database Schema**

   - Open SQL Editor di Supabase Dashboard
   - Copy paste dari `supabase/schema.sql`
   - Run query

3. **Enable RLS (Row Level Security)**

   - Sudah included di schema.sql
   - Pastikan RLS enabled untuk semua tables

4. **Seed Data (Optional)**
   - Run `supabase/seed.sql` untuk sample data
   - Atau create data manual via aplikasi

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

---

## 🚀 Penggunaan

### Login

1. Buka `http://localhost:3000`
2. Auto-redirect ke `/login`
3. Enter credentials:
   - Email: `admin@laundry.com`
   - Password: `admin123`
4. Click "Masuk"

### Buat Pesanan Baru

1. Go to **Pesanan** page
2. Click **"Buat Pesanan"**
3. **Step 1:** Pilih pelanggan
4. **Step 2:** Tambah item (layanan + quantity)
5. **Step 3:** Review & set tanggal pickup
6. Click **"Buat Pesanan"**

### Tambah Pembayaran

1. Go to **Pesanan** page
2. Click **"Lihat Detail"** pada order
3. Click **"Tambah Pembayaran"**
4. Enter amount & payment method
5. Click **"Simpan"**

### Export Data

1. Go to **Keuangan** page
2. Set date range filter
3. Click **"Export CSV"** untuk payments atau expenses
4. File akan auto-download

### Print Invoice

1. Go to **Pesanan** page
2. Click **"Lihat Detail"** pada order
3. Click **"Cetak Nota"**
4. Browser print dialog akan muncul
5. Print atau Save as PDF

---

## 📁 Struktur Project

```
laundry-admin/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   └── login/               # Login page
│   ├── customers/               # Customers page
│   ├── orders/                  # Orders page
│   ├── services/                # Services page
│   ├── finance/                 # Finance page
│   ├── reports/                 # Reports page
│   ├── settings/                # Settings page
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Dashboard page
│
├── components/                   # React components
│   ├── ui/                      # Shadcn UI components
│   ├── dashboard/               # Dashboard components
│   ├── customers/               # Customer components
│   ├── orders/                  # Order components
│   ├── services/                # Service components
│   ├── finance/                 # Finance components
│   ├── reports/                 # Report components
│   ├── header.tsx               # Header component
│   ├── sidebar.tsx              # Sidebar component
│   └── dashboard-layout.tsx     # Main layout
│
├── lib/                         # Utilities & helpers
│   ├── api/                     # API functions
│   │   ├── auth.ts             # Authentication API
│   │   ├── customers.ts        # Customers API
│   │   ├── services.ts         # Services API
│   │   ├── orders.ts           # Orders API
│   │   ├── payments.ts         # Payments API
│   │   ├── expenses.ts         # Expenses API
│   │   └── analytics.ts        # Analytics API
│   │
│   ├── supabase/               # Supabase config
│   │   ├── client.ts           # Client instance
│   │   └── types.ts            # TypeScript types
│   │
│   └── utils/                  # Utility functions
│       ├── formatters.ts       # Format helpers
│       ├── export.ts           # CSV export
│       └── print.ts            # Print helpers
│
├── supabase/                    # Database files
│   ├── schema.sql              # Database schema
│   └── seed.sql                # Sample data
│
├── public/                      # Static files
│   └── logo.jpg                # App logo
│
├── middleware.ts                # Auth middleware
├── .env.local                   # Environment variables
└── package.json                 # Dependencies
```

---

## 📚 API Documentation

### Authentication

```typescript
// Login
signIn(email: string, password: string)

// Logout
signOut()

// Get current user
getCurrentUser()

// Get session
getSession()
```

### Customers

```typescript
// Get all customers
fetchCustomers(search?: string)

// Get customer by ID
fetchCustomerById(id: string)

// Create customer
createCustomer(customer: CustomerData)

// Update customer
updateCustomer(id: string, customer: Partial<Customer>)

// Delete customer
deleteCustomer(id: string)
```

### Orders

```typescript
// Get all orders
fetchOrders(status?: string)

// Get order by ID
fetchOrderById(id: string)

// Create order
createOrder(orderData: CreateOrderData)

// Update order status
updateOrderStatus(id: string, status: string)

// Delete order
deleteOrder(id: string)
```

### Payments

```typescript
// Get all payments
fetchPayments()

// Create payment
createPayment(payment: PaymentData)

// Delete payment
deletePayment(id: string)

// Get total revenue
getTotalRevenue(startDate?: string, endDate?: string)
```

### Expenses

```typescript
// Get all expenses
fetchExpenses(category?: string, startDate?: string, endDate?: string)

// Create expense
createExpense(expense: ExpenseData)

// Delete expense
deleteExpense(id: string)

// Get total expenses
getTotalExpenses(startDate?: string, endDate?: string)
```

---

## 🐛 Troubleshooting

### Build Errors

**Error: "Supabase URL not found"**

- Pastikan `.env.local` sudah dibuat
- Check `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Error: "Invalid login credentials"**

- Pastikan user sudah dibuat di Supabase
- Check email & password benar
- Pastikan email sudah confirmed

### Database Issues

**Error: "relation does not exist"**

- Pastikan schema.sql sudah dijalankan
- Check table names di Supabase Dashboard

**Error: "permission denied"**

- Check RLS policies
- Pastikan user authenticated

### Common Issues

**Chart tidak muncul**

- Check apakah ada data di database
- Lihat console untuk error
- Pastikan date range filter benar

**Export CSV tidak jalan**

- Check browser allow downloads
- Pastikan ada data untuk di-export

---

## � License

MIT License - feel free to use for personal or commercial projects.

---

## 👨‍💻 Developer

Developed with ❤️ using Next.js & Supabase

---

## � Support

Untuk pertanyaan atau issue, silakan buat issue di repository atau hubungi developer.

---

**Happy Laundering! 🧺✨**
