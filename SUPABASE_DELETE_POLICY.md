# Supabase Storage DELETE Policy Setup

## Overview
Fitur auto-delete gambar lama sudah diimplementasi di semua komponen upload. Sekarang perlu menambahkan RLS policy untuk operasi DELETE di Supabase Storage.

## Langkah-langkah

### 1. Buka Supabase Dashboard
- Login ke https://supabase.com/dashboard
- Pilih project: `aldfhmhqvpyozfiwserl`

### 2. Tambah DELETE Policy untuk Bucket `images` (Public)

1. Buka **Storage** → **Policies** → Pilih bucket `images`
2. Klik **New Policy**
3. Pilih **Custom Policy**
4. Isi form:
   - **Policy Name**: `Allow authenticated users to delete images`
   - **Allowed Operation**: `DELETE`
   - **Target Roles**: `authenticated`
   - **Policy Definition**:
   ```sql
   (auth.role() = 'authenticated')
   ```
5. Klik **Save**

### 3. Tambah DELETE Policy untuk Bucket `private-files` (Private)

1. Buka **Storage** → **Policies** → Pilih bucket `private-files`
2. Klik **New Policy**
3. Pilih **Custom Policy**
4. Isi form:
   - **Policy Name**: `Allow authenticated users to delete private files`
   - **Allowed Operation**: `DELETE`
   - **Target Roles**: `authenticated`
   - **Policy Definition**:
   ```sql
   (auth.role() = 'authenticated')
   ```
5. Klik **Save**

## Verifikasi

Setelah policy ditambahkan, coba:
1. Login sebagai admin
2. Edit produk/paket/mitra/agenda/diklat yang sudah ada gambarnya
3. Upload gambar baru
4. Gambar lama akan otomatis terhapus dari Supabase Storage

## Catatan

- Policy ini mengizinkan semua user yang authenticated untuk delete files
- Jika ingin lebih ketat, bisa tambahkan kondisi role admin:
  ```sql
  (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'SUPERADMIN')
  ```
- Tapi untuk sekarang, policy sederhana sudah cukup karena endpoint API sudah dilindungi NextAuth

## Files yang Sudah Diupdate

✅ `src/lib/supabase-helpers.ts` - Helper functions untuk delete
✅ `src/app/api/files/[bucket]/[...path]/route.ts` - DELETE endpoint
✅ `src/components/admin/ProductModal.tsx` - Auto-delete saat ganti gambar
✅ `src/components/admin/PackageModal.tsx` - Auto-delete saat ganti gambar
✅ `src/app/admin/partners/create/page.tsx` - Auto-delete saat ganti logo
✅ `src/app/admin/partners/edit/[id]/page.tsx` - Auto-delete saat ganti logo
✅ `src/app/admin/agenda/create/page.tsx` - Auto-delete saat ganti gambar
✅ `src/app/admin/agenda/edit/[id]/page.tsx` - Auto-delete saat ganti gambar
✅ `src/app/admin/diklat/create/page.tsx` - Auto-delete saat ganti gambar
✅ `src/app/admin/diklat/edit/[id]/page.tsx` - Auto-delete saat ganti gambar

## Cara Kerja

1. User memilih gambar baru untuk diupload
2. Sistem menyimpan URL gambar lama
3. Upload gambar baru ke Supabase
4. Jika upload berhasil, sistem otomatis menghapus gambar lama
5. Gambar lama hanya dihapus jika URL-nya dari Supabase (mengandung 'supabase.co')
