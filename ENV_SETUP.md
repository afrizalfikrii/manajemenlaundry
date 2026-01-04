# Supabase Environment Configuration

Untuk menjalankan aplikasi ini dengan Supabase, buat file `.env.local` di root project dengan isi:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Cara Mendapatkan Credentials:

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Klik **Settings** (icon gear) di sidebar kiri
4. Klik **API** di menu Settings
5. Copy nilai berikut:
   - **URL** → paste ke `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → paste ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Contoh:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjQwMjQwMCwiZXhwIjoxOTQ3OTc4NDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **Note:** File `.env.local` sudah ada di `.gitignore` sehingga credentials Anda tidak akan ter-commit ke git.
