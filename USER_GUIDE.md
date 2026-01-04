# 📖 User Guide - Laundry Admin

Panduan lengkap penggunaan aplikasi Laundry Admin untuk pengguna.

---

## 🔐 Login

1. Buka aplikasi di browser
2. Masukkan email dan password
3. Klik **"Masuk"**
4. Anda akan diarahkan ke Dashboard

**Default Credentials:**

- Email: `admin@laundry.com`
- Password: `admin123`

---

## 🏠 Dashboard

Dashboard menampilkan ringkasan bisnis:

- **Total Pendapatan** - Total revenue dari semua pembayaran
- **Total Pesanan** - Jumlah pesanan aktif
- **Total Pelanggan** - Jumlah pelanggan terdaftar
- **Chart Revenue** - Grafik pendapatan
- **Pesanan Terbaru** - List 10 pesanan terakhir

---

## 👥 Mengelola Pelanggan

### Tambah Pelanggan Baru

1. Klik menu **"Pelanggan"**
2. Klik tombol **"Tambah Pelanggan"**
3. Isi form:
   - Nama (wajib)
   - Telepon (wajib)
   - Email (opsional)
   - Alamat (opsional)
4. Klik **"Simpan"**

### Edit Pelanggan

1. Klik icon **Edit** (pensil) pada pelanggan
2. Ubah data yang diperlukan
3. Klik **"Simpan"**

### Hapus Pelanggan

1. Klik icon **Hapus** (trash) pada pelanggan
2. Konfirmasi penghapusan
3. Pelanggan akan dihapus

### Cari Pelanggan

- Ketik nama, telepon, atau email di search box
- Hasil akan filter otomatis

---

## 🧺 Mengelola Layanan

### Tambah Layanan Baru

1. Klik menu **"Layanan"**
2. Klik **"Tambah Layanan"**
3. Isi form:
   - Nama layanan (contoh: Cuci Kiloan)
   - Deskripsi (opsional)
   - Harga per unit
   - Unit (kg, pcs, pasang)
   - Kategori (Cuci, Setrika, Dry Clean, dll)
4. Klik **"Simpan"**

### Edit Layanan

1. Klik icon **Edit** pada layanan
2. Ubah data (harga, deskripsi, dll)
3. Klik **"Simpan"**

### Hapus Layanan

1. Klik icon **Hapus** pada layanan
2. Konfirmasi penghapusan

---

## 📦 Mengelola Pesanan

### Buat Pesanan Baru

**Step 1: Pilih Pelanggan**

1. Klik menu **"Pesanan"**
2. Klik **"Buat Pesanan"**
3. Pilih pelanggan dari dropdown
4. Klik **"Lanjut"**

**Step 2: Tambah Item**

1. Klik **"Tambah Item"**
2. Pilih layanan (contoh: Cuci Kiloan)
3. Masukkan jumlah (contoh: 5 kg)
4. Subtotal akan dihitung otomatis
5. Tambah item lain jika perlu
6. Klik **"Lanjut"**

**Step 3: Review & Konfirmasi**

1. Review data pesanan
2. Set tanggal pickup
3. Tambah catatan (opsional)
4. Klik **"Buat Pesanan"**

### Lihat Detail Pesanan

1. Klik **"Lihat Detail"** pada pesanan
2. Akan muncul dialog dengan info:
   - Nomor order
   - Customer info
   - Item pesanan
   - Total amount
   - Paid amount
   - Remaining balance
   - Payment history

### Update Status Pesanan

1. Klik **"Update Status"** pada pesanan
2. Pilih status baru:
   - **Pending** - Pesanan baru masuk
   - **Processing** - Sedang dikerjakan
   - **Completed** - Selesai dikerjakan
   - **Delivered** - Sudah diambil customer
   - **Cancelled** - Dibatalkan
3. Klik **"Simpan"**

### Tambah Pembayaran

1. Buka detail pesanan
2. Klik **"Tambah Pembayaran"**
3. Isi form:
   - Jumlah bayar
   - Metode pembayaran (Cash, Transfer, E-Wallet)
   - Catatan (opsional)
4. Klik **"Simpan"**
5. Remaining balance akan update otomatis

### Cetak Nota/Invoice

1. Buka detail pesanan
2. Klik **"Cetak Nota"**
3. Browser print dialog akan muncul
4. Pilih:
   - **Print** - Cetak ke printer
   - **Save as PDF** - Simpan sebagai PDF
5. Nota siap diberikan ke customer

### Cari & Filter Pesanan

**Search:**

- Ketik nomor order atau nama customer
- Hasil filter otomatis

**Filter by Status:**

- Pilih status dari dropdown
- Pilih "Semua" untuk lihat semua pesanan

### Hapus Pesanan

1. Klik icon **Hapus** pada pesanan
2. Konfirmasi penghapusan
3. Pesanan akan dihapus

---

## 💰 Mengelola Keuangan

### Lihat Pembayaran

- Menu **"Keuangan"** → Tab Pembayaran
- Lihat semua payment masuk
- Info: Order number, tanggal, jumlah, metode

### Tambah Pengeluaran

1. Klik **"Tambah Pengeluaran"**
2. Isi form:
   - Kategori (Operasional, Gaji, Supplies, dll)
   - Deskripsi
   - Jumlah
   - Metode pembayaran
   - Catatan (opsional)
3. Klik **"Simpan"**

### Hapus Pembayaran/Pengeluaran

1. Klik icon **Hapus** (trash) pada row
2. Konfirmasi penghapusan
3. Data akan dihapus
4. Total akan recalculate

### Export Data ke CSV

1. Set date range filter (opsional)
2. Klik **"Export CSV"** untuk:
   - Pembayaran
   - Pengeluaran
   - Laporan keuangan (summary)
3. File CSV akan auto-download
4. Buka di Excel/Google Sheets

### Lihat Laporan Keuangan

1. Klik **"Laporan"** button
2. Export financial summary
3. Berisi:
   - Total pendapatan
   - Total pengeluaran
   - Net profit
   - Periode data

### Filter by Date Range

1. Klik **"Tanggal Mulai"** → Pilih tanggal
2. Klik **"Tanggal Akhir"** → Pilih tanggal
3. Data akan filter otomatis
4. Summary akan update

---

## 📊 Melihat Laporan

### Akses Laporan

1. Klik menu **"Laporan"**
2. Lihat berbagai chart dan statistik

### Chart Distribusi Layanan

- **Pie Chart** menampilkan:
  - Layanan apa yang paling laku
  - Persentase masing-masing layanan
  - Total orders per layanan

### Chart Trend Pesanan

- **Line Chart** menampilkan:
  - Jumlah pesanan per bulan
  - Trend naik/turun
  - Perbandingan antar bulan

### Summary Statistics

- **Total Pesanan** - Jumlah order dalam periode
- **Total Pendapatan** - Revenue dalam periode
- **Rata-rata per Order** - Average order value
- **Pelanggan Aktif** - Jumlah customer yang order

### Filter Laporan

1. Set **Tanggal Mulai** dan **Tanggal Akhir**
2. Semua chart dan stats akan update
3. Gunakan untuk analisis periode tertentu

---

## 🔧 Tips & Tricks

### Workflow Harian

**Pagi:**

1. Check dashboard untuk overview
2. Lihat pesanan baru (status Pending)
3. Update status pesanan yang sedang dikerjakan

**Siang:**

1. Input pesanan baru dari customer
2. Update status pesanan yang selesai
3. Record pembayaran yang masuk

**Sore:**

1. Print nota untuk pesanan yang akan diambil
2. Update status Delivered untuk yang sudah diambil
3. Input pengeluaran harian

**Akhir Hari:**

1. Check laporan keuangan
2. Export data jika perlu
3. Review pesanan untuk besok

### Best Practices

**Pesanan:**

- Selalu double-check item dan quantity sebelum save
- Tambahkan catatan penting (urgent, pewangi khusus, dll)
- Update status secara berkala

**Pembayaran:**

- Record payment segera setelah terima
- Catat metode pembayaran dengan benar
- Check remaining balance sebelum delivery

**Keuangan:**

- Input pengeluaran setiap hari
- Export data mingguan untuk backup
- Review laporan bulanan

**Data:**

- Backup data secara berkala
- Export CSV untuk arsip
- Jangan hapus data lama kecuali perlu

---

## ❓ FAQ

**Q: Bagaimana cara reset password?**
A: Hubungi administrator untuk reset password.

**Q: Bisa edit pesanan yang sudah dibuat?**
A: Saat ini belum ada fitur edit. Bisa delete dan create ulang.

**Q: Data hilang setelah refresh?**
A: Semua data tersimpan di database. Jika hilang, check koneksi internet.

**Q: Bisa akses dari HP?**
A: Ya, aplikasi responsive dan bisa diakses dari mobile browser.

**Q: Maksimal berapa item per order?**
A: Tidak ada limit, bisa tambah sebanyak yang diperlukan.

**Q: Bisa print nota tanpa printer?**
A: Ya, bisa save as PDF lalu kirim via WhatsApp/email.

---

## 🆘 Troubleshooting

**Masalah: Tidak bisa login**

- Check email dan password benar
- Pastikan koneksi internet stabil
- Clear browser cache dan coba lagi

**Masalah: Data tidak muncul**

- Refresh halaman
- Check filter/search tidak aktif
- Logout dan login kembali

**Masalah: Print tidak jalan**

- Check printer connected
- Coba save as PDF dulu
- Check browser allow pop-ups

**Masalah: Export CSV gagal**

- Check browser allow downloads
- Coba browser lain
- Pastikan ada data untuk di-export

---

## 📞 Bantuan

Jika mengalami masalah atau butuh bantuan:

1. Check FAQ di atas
2. Hubungi administrator
3. Laporkan bug/error dengan screenshot

---

**Selamat menggunakan Laundry Admin! 🧺**
