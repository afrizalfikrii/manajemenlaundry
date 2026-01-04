# 🚀 Panduan Setup Supabase - Step by Step

Ikuti panduan ini untuk mengintegrasikan Supabase dengan website laundry admin Anda.

## ✅ Checklist Setup

- [ ] Buat akun Supabase
- [ ] Buat project baru
- [ ] Setup database schema
- [ ] Populate seed data
- [ ] Configure environment variables
- [ ] Test koneksi
- [ ] Integrasikan dengan frontend

---

## 📝 Step 1: Buat Akun & Project Supabase

### 1.1 Buat Akun

1. Buka https://supabase.com
2. Klik **Start your project**
3. Sign up dengan GitHub atau email

### 1.2 Buat Project Baru

1. Klik **New Project**
2. Pilih Organization (atau buat baru)
3. Isi detail project:
   - **Name**: `laundry-admin` (atau nama lain)
   - **Database Password**: Buat password yang kuat (SIMPAN password ini!)
   - **Region**: Pilih yang terdekat (Southeast Asia - Singapore)
4. Klik **Create new project**
5. Tunggu ~2 menit sampai project selesai dibuat

---

## 🗄️ Step 2: Setup Database Schema

### 2.1 Buka SQL Editor

1. Di sidebar kiri, klik **SQL Editor**
2. Klik **New query**

### 2.2 Jalankan Schema SQL

1. Buka file `supabase/schema.sql` di project Anda
2. **Copy semua isi file** (Ctrl+A, Ctrl+C)
3. **Paste** di SQL Editor Supabase
4. Klik **Run** (atau tekan Ctrl+Enter)
5. Tunggu sampai muncul pesan "Success. No rows returned"

### 2.3 Verifikasi Tables

1. Di sidebar kiri, klik **Table Editor**
2. Pastikan semua table sudah dibuat:
   - ✅ customers
   - ✅ services
   - ✅ orders
   - ✅ order_items
   - ✅ payments
   - ✅ expenses

---

## 🌱 Step 3: Populate Sample Data (Opsional)

### 3.1 Jalankan Seed SQL

1. Kembali ke **SQL Editor**
2. Klik **New query**
3. Buka file `supabase/seed.sql` di project Anda
4. **Copy semua isi file**
5. **Paste** di SQL Editor
6. Klik **Run**
7. Tunggu sampai selesai (~5-10 detik)

### 3.2 Verifikasi Data

1. Klik **Table Editor**
2. Klik table **customers** → Anda akan melihat 10 sample customers
3. Klik table **services** → Anda akan melihat 10 sample services
4. Klik table **orders** → Anda akan melihat 10+ sample orders

---

## 🔑 Step 4: Get API Credentials

### 4.1 Buka Settings

1. Di sidebar kiri, klik icon **Settings** (⚙️)
2. Klik **API**

### 4.2 Copy Credentials

Anda akan melihat:

**Project URL:**

```
https://xxxxxxxxxxxxx.supabase.co
```

👆 Copy ini

**API Keys:**

- **anon public** (yang panjang, dimulai dengan `eyJ...`)
  👆 Copy ini juga

> ⚠️ **JANGAN** copy service_role key! Itu untuk server-side saja.

---

## 🔧 Step 5: Configure Environment Variables

### 5.1 Buat File .env.local

1. Di root project Anda, buat file baru bernama `.env.local`
2. Paste kode berikut:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxx
```

3. **Ganti** `https://xxxxxxxxxxxxx.supabase.co` dengan URL Anda
4. **Ganti** `eyJhbG...` dengan anon key Anda
5. **Save** file

### 5.2 Verifikasi .gitignore

Pastikan `.env.local` ada di `.gitignore` agar tidak ter-commit:

```
# .gitignore
.env.local
.env*.local
```

---

## ✅ Step 6: Test Koneksi

### 6.1 Restart Dev Server

```bash
# Stop server yang sedang running (Ctrl+C)
# Kemudian restart:
pnpm dev
```

### 6.2 Test Koneksi dengan Test Page

**Cara termudah:**

1. Buka browser ke http://localhost:3000/test-supabase
2. Halaman akan otomatis test koneksi
3. Jika berhasil, Anda akan melihat:
   - ✅ Koneksi Supabase berhasil!
   - Total customers
   - Sample customer data
   - Checklist lengkap

**Jika error:**

- Halaman akan menampilkan error message dan troubleshooting steps
- Cek `.env.local` sudah benar
- Restart dev server
- Cek Supabase Dashboard

### 6.3 Alternative: Test di Browser Console

Jika ingin test manual, gunakan fetch API:

```javascript
// Ganti dengan credentials Anda
const SUPABASE_URL = "https://xxxxx.supabase.co";
const SUPABASE_KEY = "eyJhbG...";

fetch(`${SUPABASE_URL}/rest/v1/customers?limit=1`, {
  headers: {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  },
})
  .then((res) => res.json())
  .then((data) => console.log("✅ Success!", data))
  .catch((err) => console.error("❌ Error:", err));
```

---

## 🎨 Step 7: Integrasikan dengan Frontend

### 7.1 Update Dashboard

Lihat contoh di `examples/dashboard-with-supabase.tsx`

**Cara cepat:**

1. Copy isi file `examples/dashboard-with-supabase.tsx`
2. Paste ke `components/dashboard/dashboard-content.tsx` (replace semua)
3. Refresh browser
4. Dashboard sekarang menampilkan data real dari Supabase! 🎉

### 7.2 Update Customers Page

Lihat contoh di `examples/customers-with-supabase.tsx`

**Cara cepat:**

1. Copy isi file `examples/customers-with-supabase.tsx`
2. Paste ke `app/customers/page.tsx` (replace semua)
3. Refresh browser
4. Halaman customers sekarang menampilkan data real! 🎉

### 7.3 Update Pages Lainnya

Gunakan pola yang sama untuk:

- Services: Gunakan `lib/api/services.ts`
- Orders: Gunakan `lib/api/orders.ts`
- Finance: Gunakan `lib/api/payments.ts` dan `lib/api/expenses.ts`

---

## 🧪 Step 8: Testing

### 8.1 Test CRUD Operations

**Create Customer:**

```typescript
import { createCustomer } from "@/lib/api/customers";

const newCustomer = await createCustomer({
  name: "Test Customer",
  phone: "081234567999",
  email: "test@example.com",
  is_active: true,
});
```

**Update Customer:**

```typescript
import { updateCustomer } from "@/lib/api/customers";

await updateCustomer("customer-id-here", {
  name: "Updated Name",
});
```

**Delete Customer:**

```typescript
import { deleteCustomer } from "@/lib/api/customers";

await deleteCustomer("customer-id-here");
```

### 8.2 Test di Supabase Dashboard

1. Buka **Table Editor**
2. Klik table yang ingin dilihat
3. Verifikasi data yang baru dibuat/diupdate/dihapus

---

## 🐛 Troubleshooting

### Error: "Invalid API key"

**Solusi:**

- Cek file `.env.local` sudah dibuat
- Pastikan URL dan key sudah benar (copy paste lagi dari Supabase Dashboard)
- Restart dev server (`pnpm dev`)

### Error: "relation does not exist"

**Solusi:**

- Jalankan `schema.sql` di Supabase SQL Editor
- Verifikasi semua tables sudah dibuat di Table Editor

### Data tidak muncul

**Solusi:**

- Jalankan `seed.sql` untuk populate sample data
- Cek di Supabase Table Editor apakah data ada
- Cek browser console untuk error messages

### Error: "Failed to fetch"

**Solusi:**

- Cek koneksi internet
- Pastikan Supabase project masih aktif (buka dashboard)
- Cek apakah ada CORS issues di browser console

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase + Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [SQL Tutorial](https://supabase.com/docs/guides/database/overview)

---

## ✨ Next Steps

Setelah setup selesai:

1. **Customize Schema** - Sesuaikan database schema dengan kebutuhan Anda
2. **Add Authentication** - Implementasikan login/register dengan Supabase Auth
3. **Add Real-time** - Gunakan Supabase real-time untuk live updates
4. **Add Storage** - Upload foto/dokumen dengan Supabase Storage
5. **Deploy** - Deploy ke Vercel/Netlify

---

**Selamat! 🎉 Backend Supabase Anda sudah siap digunakan!**
