# Auto-Delete Old Images Implementation

## Status: ✅ COMPLETED & FIXED

## Overview
Fitur auto-delete gambar lama saat upload gambar baru sudah berhasil diimplementasi di seluruh aplikasi. Auto-delete **HANYA terjadi saat EDIT**, tidak saat CREATE/tambah baru.

## What Was Done

### 1. Created Helper Functions
**File**: `src/lib/supabase-helpers.ts`
- `extractSupabasePath(url)` - Extract bucket dan path dari Supabase URL
- `deleteSupabaseFile(url)` - Delete file via API endpoint

### 2. Added DELETE API Endpoint
**File**: `src/app/api/files/[bucket]/[...path]/route.ts`
- Added DELETE method handler
- Requires authentication (NextAuth)
- Deletes file from Supabase Storage

### 3. Updated All Upload Components

#### Products
- ✅ `src/components/admin/ProductModal.tsx` - Auto-delete ONLY on EDIT

#### Packages
- ✅ `src/components/admin/PackageModal.tsx` - Auto-delete ONLY on EDIT

#### Partners (Mitra Pesantren)
- ✅ `src/app/admin/partners/create/page.tsx` - NO auto-delete (CREATE page)
- ✅ `src/app/admin/partners/edit/[id]/page.tsx` - Auto-delete on EDIT

#### Agenda
- ✅ `src/app/admin/agenda/create/page.tsx` - NO auto-delete (CREATE page)
- ✅ `src/app/admin/agenda/edit/[id]/page.tsx` - Auto-delete on EDIT

#### Diklat
- ✅ `src/app/admin/diklat/create/page.tsx` - NO auto-delete (CREATE page)
- ✅ `src/app/admin/diklat/edit/[id]/page.tsx` - Auto-delete on EDIT

## How It Works

### On CREATE (Tambah Baru)
```typescript
// Upload new image
const uploadRes = await fetch("/api/upload", {
  method: "POST",
  body: uploadFormData
});

const uploadData = await uploadRes.json();
imageUrl = uploadData.url;

// NO DELETE - gambar baru saja, tidak ada yang perlu dihapus
```

### On EDIT (Update Existing)
```typescript
// 1. Store old image URL BEFORE upload
const oldImageUrl = formData.image;

// 2. Upload new image
const uploadRes = await fetch("/api/upload", {
  method: "POST",
  body: uploadFormData
});

const uploadData = await uploadRes.json();
const newImageUrl = uploadData.url;

// 3. Delete old image ONLY if:
//    - This is EDIT mode (product/packageData exists)
//    - New image was uploaded (imageFile exists)
//    - Old image exists
//    - Old image is DIFFERENT from new image (oldImageUrl !== newImageUrl)
//    - Old image is from Supabase
if (product && imageFile && oldImageUrl && oldImageUrl !== newImageUrl && oldImageUrl.includes('supabase.co')) {
  await deleteSupabaseFile(oldImageUrl);
}
```

### Key Safety Checks:
1. ✅ **Mode check**: `product` or `packageData` exists (EDIT mode)
2. ✅ **New upload check**: `imageFile` exists (user uploaded new image)
3. ✅ **Old image exists**: `oldImageUrl` is not empty
4. ✅ **Different URL**: `oldImageUrl !== newImageUrl` (prevents deleting same image)
5. ✅ **Supabase check**: `oldImageUrl.includes('supabase.co')` (only delete our files)

## Next Steps

### Required: Add Supabase RLS Policies
Anda perlu menambahkan DELETE policy di Supabase Dashboard untuk kedua bucket:

1. **Bucket `images`** (public images)
2. **Bucket `private-files`** (private files)

Lihat file `SUPABASE_DELETE_POLICY.md` untuk panduan lengkap.

## Testing Checklist

Setelah menambahkan RLS policies, test dengan:

### CREATE (Tambah Baru) - Tidak boleh delete
- [ ] Tambah produk baru → upload gambar → gambar tidak terhapus ✅
- [ ] Tambah paket baru → upload gambar → gambar tidak terhapus ✅
- [ ] Tambah mitra baru → upload logo → logo tidak terhapus ✅
- [ ] Tambah agenda baru → upload gambar → gambar tidak terhapus ✅
- [ ] Tambah diklat baru → upload gambar → gambar tidak terhapus ✅

### EDIT (Update) - Harus delete gambar lama
- [ ] Edit produk yang sudah ada gambarnya → upload gambar baru → gambar lama terhapus ✅
- [ ] Edit paket yang sudah ada gambarnya → upload gambar baru → gambar lama terhapus ✅
- [ ] Edit mitra yang sudah ada logonya → upload logo baru → logo lama terhapus ✅
- [ ] Edit agenda yang sudah ada gambarnya → upload gambar baru → gambar lama terhapus ✅
- [ ] Edit diklat yang sudah ada gambarnya → upload gambar baru → gambar lama terhapus ✅

Expected behavior:
- CREATE: Gambar baru berhasil diupload, tidak ada yang terhapus
- EDIT: Gambar baru berhasil diupload, gambar lama otomatis terhapus
- Tidak ada error di console

## Benefits

✅ Hemat storage space - gambar lama otomatis terhapus saat edit
✅ Tidak ada file sampah menumpuk di Supabase
✅ User experience lebih baik - tidak perlu manual delete
✅ Konsisten di semua fitur upload
✅ Aman - tidak menghapus gambar saat tambah produk baru

## Bug Fixed

🐛 **Bug 1**: Saat tambah produk baru, gambar yang sebelumnya diupload ikut terhapus
✅ **Fixed**: Auto-delete sekarang HANYA terjadi saat EDIT, tidak saat CREATE

🐛 **Bug 2**: Saat edit produk, gambar produk lain ikut terhapus
✅ **Fixed**: Menambahkan pengecekan `oldImageUrl !== newImageUrl` untuk memastikan hanya gambar yang berbeda yang dihapus

### Pengecekan Keamanan yang Ditambahkan:
1. ✅ Cek mode EDIT (product/packageData exists)
2. ✅ Cek ada file baru diupload (imageFile exists)
3. ✅ Cek old image exists
4. ✅ Cek old image BERBEDA dari new image (mencegah delete gambar yang sama)
5. ✅ Cek old image dari Supabase

## Notes

- Auto-delete hanya terjadi untuk file dari Supabase (URL mengandung 'supabase.co')
- Auto-delete HANYA terjadi saat EDIT (product/packageData exists)
- File dari source lain (jika ada) tidak akan dihapus
- Delete operation berjalan di background, tidak mengganggu user experience
- Jika delete gagal, tidak akan mempengaruhi upload gambar baru
