# API Documentation — Nexa Clinic Backend

Base URL (local): `http://localhost:4000/api`

Semua endpoint mengembalikan response dengan bentuk:

```json
{ "success": true, "message": "...", "data": {} }
```
atau
```json
{ "success": false, "message": "...", "errors": {} }
```

Endpoint yang butuh login mengharapkan header:
```
Authorization: Bearer <token>
```

Token didapat dari `POST /auth/login`, berlaku 8 jam.

---

## Daftar Isi

1. [Auth](#1-auth)
2. [Patients](#2-patients)
3. [Poli](#3-poli)
4. [Doctors](#4-doctors)
5. [Registrations](#5-registrations)
6. [Queue](#6-queue)
7. [Medical Records](#7-medical-records)
8. [Prescriptions](#8-prescriptions)
9. [Dashboard](#9-dashboard)

---

## 1. Auth

### POST /auth/login
Login, tidak butuh token.

**Body**
```json
{
  "email": "admin@clinic.test",
  "password": "Admin123!"
}
```

**Response 200**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "uuid",
      "name": "Administrator",
      "email": "admin@clinic.test",
      "role": "ADMIN"
    }
  }
}
```

**Error**
- `400` — email/password kosong atau format email salah
- `401` — email atau password salah (pesannya sengaja generik, tidak dibedakan mana yang salah)

---

### POST /auth/logout
Butuh token (role apa saja). Stateless — cukup konfirmasi sukses, hapus token di sisi client.

**Response 200**
```json
{ "success": true, "message": "Logout berhasil", "data": {} }
```

---

### GET /auth/me
Butuh token. Mengembalikan profil user yang sedang login.

**Response 200**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": "uuid",
    "name": "Dr. Contoh",
    "email": "dokter@clinic.test",
    "role": "DOKTER",
    "isActive": true,
    "doctor": { "id": "uuid", "poliId": "uuid", "sipNumber": null, "specialization": "Umum" }
  }
}
```
`doctor` bernilai `null` untuk role selain DOKTER.

---

## 2. Patients

Semua endpoint di bawah butuh token, role: **ADMIN, PETUGAS_PENDAFTARAN**.

### GET /patients
Query params (semua opsional): `search`, `page` (default 1), `limit` (default 10, maks 100). `search` mencari di nama, NIK, dan no. RM.

**Response 200**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "items": [
      {
        "id": "uuid",
        "noRm": "RM-000001",
        "nik": "1234567890123456",
        "name": "Budi Santoso",
        "gender": "L",
        "birthDate": "1990-05-10T00:00:00.000Z",
        "phone": "081234567890",
        "address": "Jl. Melati No. 1",
        "isActive": true,
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
  }
}
```

### GET /patients/:id
**Response 200** — objek pasien tunggal (bentuk sama seperti item di atas).
**Error**: `404` kalau id tidak ada / sudah soft-delete, `400` kalau id bukan UUID.

### POST /patients
No. RM digenerate otomatis (`RM-000001`, increment), jangan dikirim di body.

**Body**
```json
{
  "nik": "1234567890123456",
  "name": "Budi Santoso",
  "gender": "L",
  "birthDate": "1990-05-10",
  "phone": "081234567890",
  "address": "Jl. Melati No. 1"
}
```

**Response 201** — objek pasien yang baru dibuat.

**Error**
- `400` — NIK bukan 16 digit angka, gender bukan L/P, field wajib kosong
- `409` — NIK sudah terdaftar

### PUT /patients/:id
Body sama seperti create, tapi semua field opsional (partial update).

**Response 200** — objek pasien setelah diupdate.

### DELETE /patients/:id
Soft delete (`isActive` jadi `false`). Data tidak benar-benar hilang, hanya tidak muncul lagi di list/detail.

**Response 200**
```json
{ "success": true, "message": "Pasien berhasil dihapus", "data": {} }
```

---

## 3. Poli

Read (`GET`) bisa diakses semua role yang sudah login. Create/update/delete khusus **ADMIN**.

### GET /poli
**Response 200** — array semua poli, tanpa pagination (data referensi, jumlahnya kecil).
```json
{ "success": true, "message": "OK", "data": [{ "id": "uuid", "name": "Poli Umum", "code": "UMUM" }] }
```

### GET /poli/:id
Detail satu poli. `404` kalau tidak ada.

### POST /poli
**Body**
```json
{ "name": "Poli Gigi", "code": "GIGI" }
```
**Error**: `409` kalau `code` sudah dipakai poli lain.

### PUT /poli/:id
Body sama seperti create, semua field opsional.

### DELETE /poli/:id
**Error**: `409` kalau poli ini masih punya dokter atau registrasi yang terhubung — dicegah supaya tidak merusak relasi data, bukan sekadar gagal karena foreign key.

---

## 4. Doctors

Read bisa diakses semua role login. Create/update/delete khusus **ADMIN**.

### GET /doctors
**Response 200**
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "poliId": "uuid",
      "sipNumber": null,
      "specialization": "Umum",
      "user": { "id": "uuid", "name": "Dr. Contoh", "email": "dokter@clinic.test", "isActive": true },
      "poli": { "id": "uuid", "name": "Poli Umum", "code": "UMUM" }
    }
  ]
}
```

### GET /doctors/:id
Detail satu dokter, bentuk sama seperti item di atas.

### POST /doctors
Membuat akun `User` (role `DOKTER`) dan profil `Doctor` sekaligus dalam satu transaksi.

**Body**
```json
{
  "name": "Dr. Siti Aminah",
  "email": "siti@clinic.test",
  "password": "Dokter123!",
  "poliId": "uuid-poli",
  "sipNumber": "SIP-001",
  "specialization": "Umum"
}
```
`sipNumber` dan `specialization` opsional.

**Error**: `409` kalau email sudah dipakai.

### PUT /doctors/:id
**Body** (semua opsional)
```json
{ "name": "Dr. Siti Aminah, M.Kes", "poliId": "uuid-poli-lain", "specialization": "Gigi" }
```
Tidak menerima perubahan email/password lewat endpoint ini.

### DELETE /doctors/:id
Tidak menghapus baris data — menonaktifkan akun user-nya (`isActive=false`) supaya histori registrasi & rekam medis yang sudah tercatat tidak kehilangan relasi. Setelah ini dokter tidak muncul lagi di list dan tidak bisa login.

---

## 5. Registrations

Read bisa diakses semua role login (dokter perlu lihat pasien yang perlu ditangani). Create/update khusus **ADMIN, PETUGAS_PENDAFTARAN**.

### GET /registrations
Query params opsional: `date` (format `YYYY-MM-DD`, filter berdasarkan `visitDate`), `status` (`MENUNGGU`/`CHECK_IN`/`PEMERIKSAAN`/`SELESAI`), `page`, `limit`.

**Response 200** — bentuk sama seperti pola pagination di Patients, tiap item menyertakan `patient`, `doctor`, `poli`, dan `queue` yang terhubung.

### GET /registrations/:id
Detail satu registrasi, include relasi lengkap.

### POST /registrations
Membuat registrasi dan otomatis membuat antrean (`Queue`) untuk registrasi itu, dalam satu transaksi.

**Body**
```json
{
  "patientId": "uuid",
  "doctorId": "uuid",
  "poliId": "uuid",
  "visitDate": "2026-09-09",
  "paymentType": "UMUM",
  "chiefComplaint": "Demam 2 hari"
}
```
`paymentType`: `UMUM` / `BPJS` / `ASURANSI`.

**Response 201**
```json
{
  "success": true,
  "message": "Registrasi berhasil dibuat",
  "data": {
    "id": "uuid",
    "status": "MENUNGGU",
    "queue": { "id": "uuid", "queueNumber": "A001", "status": "WAITING" }
  }
}
```

**Error**
- `404` — pasien/dokter/poli tidak ditemukan
- `400` — dokter yang dipilih tidak terdaftar di poli yang dipilih

### PUT /registrations/:id
**Body** (semua opsional)
```json
{ "status": "CHECK_IN" }
```
Status berjalan linear: `MENUNGGU → CHECK_IN → PEMERIKSAAN → SELESAI`. Selain role ADMIN, status tidak boleh diubah mundur (`400` kalau dicoba).

---

## 6. Queue

Read bisa diakses semua role login. `call`/`status` untuk **ADMIN, PETUGAS_PENDAFTARAN, DOKTER**. Create manual untuk **ADMIN, PETUGAS_PENDAFTARAN** (jarang dipakai — normalnya antrean sudah otomatis dibuat lewat `POST /registrations`).

### GET /queues
Query params opsional: `date` (default hari ini), `poliId`, `status` (`WAITING`/`CALLED`/`IN_PROGRESS`/`DONE`/`SKIPPED`). Diurutkan berdasarkan nomor antrean.

**Response 200** — array antrean, tiap item include data registrasi (pasien, dokter, poli) terkait.

### POST /queues
**Body**
```json
{ "registrationId": "uuid" }
```
**Error**: `409` kalau registrasi ini sudah punya antrean.

### PUT /queues/:id/call
Tidak butuh body. Set status jadi `CALLED` dan mencatat `calledAt`.

**Error**: `409` kalau di poli yang sama masih ada antrean lain yang berstatus `CALLED` — hanya boleh satu yang dipanggil dalam satu waktu per poli. Ubah status antrean yang sedang `CALLED` (mis. ke `IN_PROGRESS`) dulu sebelum memanggil antrean berikutnya.

### PUT /queues/:id/status
**Body**
```json
{ "status": "IN_PROGRESS" }
```

---

## 7. Medical Records

Create khusus **DOKTER**. Read bisa diakses semua role login.

### POST /medical-records
Menyimpan hasil pemeriksaan SOAP sekaligus tindakan medis dan resep (kalau ada), dalam satu transaksi. Setelah tersimpan, status registrasi otomatis jadi `SELESAI` dan status antrean terkait otomatis jadi `DONE`.

Syarat: registrasi harus berstatus `PEMERIKSAAN`, dan hanya dokter yang memang ditugaskan pada registrasi itu yang boleh mengisi.

**Body**
```json
{
  "registrationId": "uuid",
  "subjective": "Demam 2 hari, batuk kering",
  "bloodPressure": "120/80",
  "temperature": 38.5,
  "weight": 60,
  "height": 170,
  "diagnosis": "ISPA",
  "therapyPlan": "Istirahat cukup, kontrol 3 hari lagi",
  "actions": [
    { "actionName": "Cek tekanan darah", "notes": "Normal" }
  ],
  "prescriptionItems": [
    { "medicineName": "Paracetamol", "dosage": "500mg", "quantity": 10, "instructions": "3x sehari setelah makan" }
  ]
}
```
`actions` dan `prescriptionItems` opsional (boleh array kosong atau tidak dikirim sama sekali) — tidak semua kunjungan perlu tindakan/resep. Kalau `prescriptionItems` kosong, field `prescription` di response akan `null`.

**Response 201**
```json
{
  "success": true,
  "message": "Pemeriksaan berhasil disimpan",
  "data": {
    "id": "uuid",
    "actions": [{ "id": "uuid", "actionName": "Cek tekanan darah", "notes": "Normal" }],
    "prescription": {
      "id": "uuid",
      "items": [{ "id": "uuid", "medicineName": "Paracetamol", "dosage": "500mg", "quantity": 10, "instructions": "3x sehari setelah makan" }]
    }
  }
}
```

**Error**
- `403` — dokter yang login bukan dokter yang ditugaskan di registrasi tersebut
- `400` — registrasi belum berstatus `PEMERIKSAAN`
- `409` — registrasi ini sudah punya rekam medis

### GET /medical-records/:patientId
Riwayat pemeriksaan seorang pasien, terbaru ke terlama. Tiap item include dokter yang menangani, tindakan, dan resep.

---

## 8. Prescriptions

Endpoint tambahan untuk melihat/menambah resep secara berdiri sendiri (di luar alur pembuatan rekam medis). Create khusus **DOKTER**, read semua role login.

### POST /prescriptions
Dipakai kalau sebuah rekam medis dibuat tanpa resep di awal, lalu belakangan mau ditambahkan.

**Body**
```json
{
  "medicalRecordId": "uuid",
  "items": [
    { "medicineName": "Amoxicillin", "dosage": "500mg", "quantity": 15, "instructions": "3x sehari" }
  ]
}
```
**Error**: `409` kalau rekam medis itu sudah punya resep.

### GET /prescriptions/:id
Detail resep beserta item-itemnya dan data rekam medis/pasien/dokter terkait.

---

## 9. Dashboard

Bisa diakses semua role login.

### GET /dashboard/summary
Tidak ada query param.

**Response 200**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "totalPatients": 42,
    "newPatientsToday": 3,
    "totalQueuesToday": 8,
    "waitingToday": 2,
    "doneToday": 5
  }
}
```
Semua angka "hari ini" dihitung berdasarkan tanggal server saat request dikirim.

---

## Urutan Testing yang Disarankan

Kalau mau coba dari nol, urutan ini menghindari error karena data referensi belum ada:

1. Login sebagai admin — `POST /auth/login`
2. Buat poli — `POST /poli`
3. Buat dokter di poli itu — `POST /doctors`
4. Buat pasien — `POST /patients`
5. Login sebagai petugas, buat registrasi — `POST /registrations` (otomatis dapat antrean)
6. Update status registrasi: `CHECK_IN`, lalu `PEMERIKSAAN` — `PUT /registrations/:id`
7. Login sebagai dokter yang bersangkutan, isi pemeriksaan — `POST /medical-records`
8. Cek `GET /registrations/:id` dan `GET /queues` — status harusnya sudah `SELESAI` / `DONE`
9. Cek riwayat pasien — `GET /medical-records/:patientId`
10. Cek `GET /dashboard/summary`
