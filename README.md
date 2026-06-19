# Task Management API

REST API untuk sistem Task Management dengan fitur AI Command — pengguna dapat melakukan operasi CRUD pada Task menggunakan instruksi bahasa natural yang diproses oleh Gemini AI.

## Tech Stack

- **Runtime:** Node.js v24.14.0
- **Framework:** Express.js 5
- **Database:** PostgreSQL
- **ORM:** Sequelize
- **Auth:** JSON Web Token (JWT)
- **AI:** Google Gemini API (model `gemini-2.5-flash`)
- **Password Hashing:** bcryptjs + pepper

## Struktur Proyek

```
src/
├── config/
│   └── database.js          # konfigurasi koneksi Sequelize
├── exception/
│   ├── app_error.js         # custom error classes (NotFoundError, BadRequestError, dll)
│   └── error_handler.js     # global error handler middleware
├── feature/
│   ├── ai/                  # fitur AI Command
│   │   ├── ai_controller.js
│   │   ├── ai_prompt.js     # system prompt untuk Gemini
│   │   ├── ai_repository.js
│   │   ├── ai_routes.js
│   │   ├── ai_schema.js     # JSON schema constraint untuk response Gemini
│   │   └── ai_service.js
│   ├── audit/
│   │   └── audit_repository.js
│   ├── auth/                # register, login
│   ├── project/             # CRUD project (admin only)
│   └── task/                # CRUD task
├── helpers/
│   ├── ai_parse.js          # parsing aman response JSON dari AI
│   ├── ai_validator.js      # validasi struktur & business rule response AI
│   ├── jwt_helper.js
│   └── password_helper.js
├── middleware/
│   └── auth_middleware.js   # JWT authentication & role authorization
├── models/                  # Sequelize models (User, Project, Task, AuditLog)
├── routes/
│   └── index.js             # route aggregator
├── app.js                   # entry point
└── seed.js                  # database seeder
```

Pattern yang digunakan: **Controller → Service → Repository → Model**, dipisah per feature (modular by feature, bukan by layer).

---

## 1. Setup & Instalasi

### Prasyarat

- Node.js v18+ (development menggunakan v24.14.0)
- PostgreSQL sudah terinstall dan running
- API Key Gemini ([Google AI Studio](https://aistudio.google.com))

### Langkah instalasi

```bash
# 1. Clone repository
git clone <repository-url>
cd task-managemenr-api

# 2. Install dependencies
npm install

# 3. Buat database PostgreSQL secara manual
psql -U postgres
CREATE DATABASE task_management;

```

> **Catatan:** Sequelize tidak membuat database secara otomatis, hanya membuat/menyesuaikan **table** lewat `sequelize.sync()`. Database itu sendiri harus dibuat manual terlebih dahulu.

---

## 2. Konfigurasi `.env`

Salin `.env.example` menjadi `.env`, lalu isi sesuai environment masing-masing:

```bash
cp .env.example .env
```

### `.env.example`

```env
# Port backend
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_management
DB_USER=postgres
DB_PASSWORD=

# Security
JWT_SECRET=
PEPPER=

# Gemini AI
GEMINI_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
GEMINI_API_KEY=
```

### Penjelasan tiap variabel

| Variabel | Keterangan |
|---|---|
| `PORT` | Port server Express dijalankan (default `3000`) |
| `DB_HOST` | Host PostgreSQL (`localhost` untuk lokal) |
| `DB_PORT` | Port PostgreSQL (default `5432`) |
| `DB_NAME` | Nama database yang sudah dibuat manual (`task_management`) |
| `DB_USER` | Username PostgreSQL |
| `DB_PASSWORD` | Password PostgreSQL |
| `JWT_SECRET` | Secret key untuk signing JWT, isi dengan string acak yang panjang |
| `PEPPER` | String rahasia tambahan yang digabung ke password sebelum di-hash (selain salt bawaan bcrypt) |
| `GEMINI_URL` | Endpoint Gemini API untuk `generateContent` |
| `GEMINI_API_KEY` | API Key dari Google AI Studio |

---

## 3. Menjalankan Aplikasi

### Seeding data awal

Sebelum testing, jalankan seeder untuk mengisi data dummy (user admin, user biasa, project, task contoh) agar API bisa langsung diuji tanpa input manual:

```bash
node src/seed.js
```

### Menjalankan server

```bash
node src/app.js
```

Server berjalan di `http://localhost:3000` (atau sesuai `PORT` di `.env`). Saat start, aplikasi otomatis menjalankan `sequelize.sync({ alter: true })` untuk membuat/menyesuaikan struktur table di database.

---

## 4. Penjelasan Desain Prompt AI

Endpoint `POST /ai/command` menerima instruksi bahasa natural dan mengonversinya menjadi operasi database (CRUD) pada tabel `tasks`, menggunakan Gemini API dengan `responseMimeType: application/json` dan `responseSchema` agar output terjamin berupa JSON terstruktur.

### Pendekatan: 3 Lapis Pertahanan

AI tidak pernah dipercaya untuk langsung mengeksekusi query ke database. Ada 3 lapis validasi sebelum sebuah instruksi benar-benar dieksekusi:

```
User prompt
     │
     ▼
[Lapis 1] System Prompt (ai_prompt.js)
     — instruksi ketat: enum mapping, larangan tabel users,
     — larangan menebak data, format output wajib
     │
     ▼
[Lapis 2] responseSchema (ai_schema.js)
     — constrained decoding di level Gemini API,
     — memaksa struktur JSON & tipe data tiap field
     │
     ▼
Parsing aman (ai_parse.js)
     — strip markdown fence, try/catch JSON.parse,
     — tidak pernah crash walau AI berhalusinasi
     │
     ▼
[Lapis 3] Validasi backend (ai_validator.js)
     — cek ulang business rule yang tidak bisa
     — dipaksa lewat schema (misalnya assignee_id wajib di CREATE, project_id terlarang di UPDATE)
     │
     ▼
Eksekusi dalam Database Transaction (ai_repository.js)
     — semua operasi commit/rollback bersama
```

### Aturan kunci dalam System Prompt

1. **Never guess data** AI dilarang keras menebak `project_id`, `assignee_id`, `task id`, `title`, atau `description`. Jika informasi wajib tidak disebutkan eksplisit oleh user, AI harus merespons `REJECTED` dengan alasan jelas di field `reason`.
2. **Strict enum mapping** `status` dan `priority` punya mapping kata kunci Bahasa Indonesia/Inggris (`"selesai"` → `done`, `"urgent"` → `high`, dst), AI dilarang menciptakan nilai enum baru di luar yang diizinkan.
3. **Title & description extraction by keyword** judul/deskripsi diambil persis dari teks setelah kata kunci pemicu (`judul`, `deskripsi`), bukan disimpulkan bebas dari kalimat ini mencegah AI menghasilkan title yang berantakan/berulang.
4. **Struktur output selalu lengkap (5 keys: `operation`, `table`, `data`, `where`, `reason`)** field yang tidak relevan untuk suatu operasi diisi `null`, bukan dihilangkan. Ini krusial agar Gemini tidak memecah satu instruksi menjadi beberapa object JSON terpisah (masalah yang sempat terjadi saat schema masih longgar).
5. **One instruction = one operation object** mencegah duplikasi operasi untuk task id yang sama dalam satu request.
6. **Larangan tabel `users` & `projects`** permintaan untuk mengubah/menghapus user, atau di luar konteks task management (mis. "buatkan kode python"), wajib direspons `REJECTED`.

### Database Transaction & Rollback

Seluruh operasi hasil parsing AI dalam satu request dieksekusi dalam satu `sequelize.transaction()`. Jika prompt berisi instruksi ganda (mis. *"buat task baru ... terus update task ID 5 ..."*) dan salah satu operasi gagal (misal `project_id` atau task id yang dirujuk tidak ditemukan), seluruh operasi dalam transaksi tersebut **otomatis di-rollback**.

### Audit Log

Setiap pemanggilan `POST /ai/command` baik berhasil maupun gagal selalu menyimpan satu record ke tabel `audit_log`, berisi prompt asli, response mentah dari AI, status (`success`/`failed`), dan alasan kegagalan jika ada. Penyimpanan audit log dijalankan di blok `finally` agar tetap tercatat apa pun hasil eksekusinya, dan kegagalan menyimpan audit log sendiri tidak mengganggu response utama ke user.

---

## 5. Dokumentasi API

Dokumentasi endpoint tersedia dalam bentuk Postman Collection, bisa diakses melalui:

- **Link publik:** [Task Management API — Postman Collection](https://www.postman.com/tokopulaubarupinyuh-7631607/task-management-api/collection/22uxeg6/task-management-api)
- **File JSON export:** `postman_collection.json` pada root repository (cadangan jika link di atas tidak dapat diakses)

Import salah satu sumber di atas ke Postman untuk mencoba seluruh endpoint, termasuk contoh request body untuk `POST /ai/command`.

### Ringkasan Endpoint

| Method | Endpoint | Role | Keterangan |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Registrasi user (admin/user) |
| POST | `/api/auth/login` | Public | Login, mendapatkan JWT |
| GET | `/api/auth/me` | Authenticated | Data user yang sedang login |
| POST | `/api/projects` | Admin | Membuat project |
| GET | `/api/projects` | Authenticated | Daftar semua project |
| GET | `/api/projects/:id` | Authenticated | Detail project |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Hapus project |
| GET | `/api/projects/:id/tasks` | Authenticated | Daftar task dalam project |
| POST | `/api/ai/command` | Authenticated | Eksekusi instruksi natural language ke operasi Task |

---

## Akun Default (Hasil Seeder)

Setelah menjalankan `node src/seed.js`, gunakan akun berikut untuk login dan testing:

| Email | Password | Role |
|---|---|---|
| `admin@gmail.com` | `123456` | admin |
| `user@gmail.com` | `123456` | user |
