# Nexa Clinic - Backend

REST API backend untuk Mini Clinic Information System. Menangani autentikasi, data pasien, poli & dokter, pendaftaran kunjungan, antrean, pemeriksaan dokter (SOAP), resep obat, dan dashboard ringkasan.

## Tech Stack

- **Runtime**: Node.js + Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT (access token, expiry 8 jam)
- **Validasi**: Zod
- **Hashing password**: bcrypt

## Requirement

- Node.js 18+ (dikembangkan dengan Node 22)
- PostgreSQL 14+ (lokal atau remote)
- npm

## Instalasi

```bash
# 1. Install dependency
npm install

# 2. Siapkan file environment
cp .env.example .env
# lalu edit .env, sesuaikan DATABASE_URL

# 3. Buat database
createdb db-nexaclinic
# atau lewat psql: CREATE DATABASE "db-nexaclinic";

# 4. Jalankan migrasi
npx prisma migrate dev --name init

# 5. Jalankan seeder (membuat akun default, poli, dokter, dan 15 data pasien demo)
npx prisma db seed

# 6. Jalankan server
npm run dev
```

Server berjalan di `http://localhost:4000` (atau sesuai `PORT` di `.env`).

## Konfigurasi `.env`

```env
PORT=4000
DATABASE_URL="postgresql://postgres:password@localhost:5432/db-nexaclinic?schema=public"
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=8h
```

## Migrasi Database

Setiap kali `prisma/schema.prisma` berubah:

```bash
npx prisma migrate dev --name <nama_perubahan>
```

Untuk apply migrasi yang sudah ada tanpa membuat migrasi baru:

```bash
npx prisma migrate deploy
```

Untuk reset ulang database dari awal sekaligus menjalankan seeder data:

```bash
npx prisma migrate reset
```

## Akun Default & Data Demo (dari seed)

### Akun Pengguna

| Role | Email | Password |
|---|---|---|
| Administrator | admin@clinic.test | Admin123! |
| Dokter | dokter@clinic.test | Dokter123! |
| Petugas Pendaftaran | petugas@clinic.test | Petugas123! |

Password di atas plaintext hanya untuk keperluan login demo, di database tersimpan sudah di-hash (bcrypt).

### Data Pasien Demo
Seeder juga otomatis menambahkan **15 data pasien demo** (`RM-000001` s/d `RM-000015`) lengkap dengan data NIK, nomor telepon, tanggal lahir, dan alamat.

## Struktur Project

```
nexa-clinic-backend/
├── prisma/
│   ├── schema.prisma        # 5 enum, 10 model, relasi lengkap
│   └── seed.js               # akun default, poli, dokter, dan 15 data pasien demo
├── src/
│   ├── app.js                 # entry point express
│   ├── config/
│   │   └── prisma.js          # Prisma Client singleton
│   ├── routes/                 # 1 file per resource
│   ├── controllers/           # terima req/res, panggil service
│   ├── services/               # business logic, akses Prisma
│   ├── validators/            # skema Zod per resource
│   ├── middlewares/            # auth, role guard, validate, error handler
│   └── utils/                  # AppError, response helper, jwt helper
├── .env.example
├── package.json
└── README.md
```

Alur layer: `routes → controllers → services → Prisma Client`. Controller tidak pernah query database langsung.

## Format Response

Semua endpoint mengembalikan bentuk yang sama.

Sukses:
```json
{ "success": true, "message": "...", "data": {} }
```

Error:
```json
{ "success": false, "message": "...", "errors": {} }
```

Status code yang dipakai: `200` OK, `201` Created, `400` validasi/bad request, `401` belum login/token invalid, `403` tidak punya akses, `404` data tidak ditemukan, `409` konflik (duplikat/data terkait), `500` error server.

## Role & Autentikasi

Tiga role: `ADMIN`, `DOKTER`, `PETUGAS_PENDAFTARAN`.

Kirim token lewat header di setiap request yang butuh login:
```
Authorization: Bearer <token>
```
Token didapat dari `POST /api/auth/login`, berlaku 8 jam.

Daftar lengkap endpoint beserta role yang diizinkan, contoh request & response: lihat **[`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md)**.

Postman collection siap-import (dengan auto-chaining ID antar request): **`postman/nexa-clinic.postman_collection.json`** + environment-nya di **`postman/nexa-clinic.postman_environment.json`**.

## Asumsi & Penyederhanaan

1. Poli & Dokter adalah master data sederhana yang dikelola Admin, tanpa jadwal praktik (dianggap selalu tersedia).
2. Jenis Pembayaran (`UMUM`/`BPJS`/`ASURANSI`) hanya field data, tanpa modul kasir/billing.
3. Nomor antrean: prefix tunggal `A` + 3 digit, reset tiap hari, urutan global (tidak dipisah per poli).
4. Update status antrean memakai polling REST dari frontend, bukan WebSocket.
5. Hapus pasien = soft delete (`isActive=false`) agar riwayat registrasi/rekam medis tetap utuh. Hapus dokter juga tidak permanen, akun user-nya dinonaktifkan, dengan alasan yang sama.
6. Tidak ada refresh token; access token JWT berlaku 8 jam untuk kesederhanaan sesi demo.
7. Satu dokter terikat satu poli (tidak multi-poli).
8. Rekam medis hanya bisa dibuat oleh dokter yang memang ditugaskan pada registrasi tersebut, dan registrasi harus sudah berstatus `PEMERIKSAAN`.
9. Perubahan status registrasi bersifat linear (tidak bisa mundur) kecuali dilakukan oleh Admin.

## Testing

Semua endpoint sudah diuji manual lewat Postman selama development. Gunakan `API_DOCUMENTATION.md` atau import collection Postman di folder `postman/` untuk mencoba sendiri.
