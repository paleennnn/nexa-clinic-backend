# Panduan Setup & Pengujian — Nexa Clinic (Fullstack System)

Halo Tim Rekruter / Reviewer,

Terima kasih atas kesempatan yang diberikan. Berikut adalah panduan langkah demi langkah untuk melakukan *clone*, instalasi, konfigurasi, migrasi database, dan menjalankan **Nexa Clinic** (Frontend & Backend).

---

## 🔗 Repositori GitHub
- **Frontend**: [https://github.com/paleennnn/nexa-clinic-frontend.git](https://github.com/paleennnn/nexa-clinic-frontend.git)
- **Backend**: [https://github.com/paleennnn/nexa-clinic-backend.git](https://github.com/paleennnn/nexa-clinic-backend.git)

---

## ⚙️ Prasyarat Sistem
- **Node.js**: v18+ (direkomendasikan v20 / v22)
- **PostgreSQL**: v14+ (sudah berjalan secara lokal atau cloud)
- **Git** & **npm**

---

## 🚀 Langkah Instalasi & Menjalankan Aplikasi

### 1. Persiapan Folder & Clone Kedua Repositori

Buka Terminal / PowerShell Anda, lalu jalankan perintah berikut:

```bash
mkdir nexa-clinic
cd nexa-clinic
git clone https://github.com/paleennnn/nexa-clinic-backend.git
git clone https://github.com/paleennnn/nexa-clinic-frontend.git
```

---

### 2. Setup Backend & Database

Buka terminal pertama untuk backend:

```bash
cd nexa-clinic-backend
npm install
```

#### A. Konfigurasi Environment (`.env`)
Salin file `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Sesuaikan isi file `.env` dengan kredensial PostgreSQL Anda:
```env
PORT=4000
DATABASE_URL="postgresql://postgres:password_anda@localhost:5432/db-nexaclinic?schema=public"
JWT_SECRET=super_secret_jwt_key_clinic_2026
JWT_EXPIRES_IN=8h
```

#### B. Migrasi & Seeding Database
Jalankan migrasi skema dan seeder data awal:
```bash
# 1. Jalankan migrasi tabel database
npx prisma migrate dev --name init

# 2. Jalankan seeder (otomatis membuat akun default, poli, dokter, dan 15 data pasien demo)
npx prisma db seed
```

#### C. Jalankan Server Backend
```bash
npm run dev
```
> Server API backend kini berjalan aktif di: **`http://localhost:4000`**

---

### 3. Setup Frontend

Buka terminal kedua untuk frontend:

```bash
cd nexa-clinic/nexa-clinic-frontend
npm install
```

#### A. Konfigurasi Environment (`.env`)
Salin file `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Pastikan mengarah ke port backend:
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

#### B. Jalankan Server Frontend
```bash
npm run dev
```
> Aplikasi web frontend kini berjalan aktif di: **`http://localhost:5173`**

Buka browser Anda dan akses **`http://localhost:5173`**.

---

## 👥 Akun Login Demo

Pada halaman login terdapat card **Akun Demo** dengan fitur **Quick Autofill** (cukup klik salah satu akun untuk mengisi formulir login secara otomatis):

| Peran (Role) | Email | Password | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@clinic.test` | `Admin123!` | Akses seluruh sistem, manajemen Poli & Dokter, pantau seluruh pasien & antrean. |
| **Dokter** | `dokter@clinic.test` | `Dokter123!` | Ruang Pemeriksaan SOAP, resep obat & tindakan, pantau antrean poli dokter. |
| **Petugas Pendaftaran** | `petugas@clinic.test` | `Petugas123!` | Pendaftaran pasien & kunjungan baru, tiket nomor antrean, panggilan antrean (*Check In* & *Siap Periksa*). |

---

## 🔄 Rekomendasi Skenario Pengujian (End-to-End Workflow)

Untuk menguji siklus lengkap alur pelayanan klinik:

1. **Login sebagai Petugas Pendaftaran** (`petugas@clinic.test` / `Petugas123!`):
   - Masuk ke menu **Pendaftaran** $\to$ Klik **Daftarkan Pasien Baru**.
   - Pilih salah satu dari 15 pasien demo yang sudah tersedia, pilih unit Poli tujuan (misal: *Poli Umum*) dan Dokternya.
   - Pasien akan otomatis memperoleh nomor antrean dengan status `MENUNGGU`.
   - Klik tombol **Check In**, lalu klik **Siap Periksa** (status berubah menjadi `PEMERIKSAAN`).

2. **Login sebagai Dokter** (`dokter@clinic.test` / `Dokter123!`):
   - Pada **Dashboard**, antrean pasien yang berstatus pemeriksaan otomatis tampil pada bagian *Antrean Hari Ini*.
   - Buka menu **Pemeriksaan** $\to$ Pasien yang didaftarkan tadi akan muncul pada daftar tunggu periksa.
   - Klik **Periksa** untuk mengisi catatan medis:
     - **Subjective**: Keluhan pasien.
     - **Objective**: Tanda-tanda vital (Tekanan darah, Suhu, Berat/Tinggi badan).
     - **Assessment**: Diagnosa penyakit.
     - **Plan**: Rencana terapi/tindakan medis.
     - **Resep Obat (opsional)**: Input nama obat, dosis, jumlah, dan instruksi pemakaian.
   - Klik **Simpan Pemeriksaan**. Rekam medis tersimpan dan status kunjungan otomatis diperbarui menjadi `SELESAI`.

3. **Login sebagai Administrator** (`admin@clinic.test` / `Admin123!`):
   - Pantau statistik operasional hari ini pada **Dashboard**.
   - Kelola unit layanan dan penugasan dokter di menu **Poli & Dokter**.
   - Pantau histori seluruh rekam medis di menu **Riwayat Aktivitas**.

---

Apabila terdapat pertanyaan atau kendala saat pengujian, jangan ragu untuk menghubungi saya. Terima kasih!
