# NexaTopup

Platform top-up game dan PPOB berbasis Next.js. Fondasi ini menyediakan storefront responsif, katalog game, desain data PostgreSQL/Prisma, serta kontrak arsitektur untuk pembayaran dan fulfilment yang aman.

## Menjalankan lokal

1. Salin `.env.example` menjadi `.env` dan isi `DATABASE_URL` PostgreSQL.
2. Jalankan `npm install`.
3. Jalankan `npm run dev`.
4. Untuk pemeriksaan produksi, jalankan `npx next build --webpack`.

## Status integrasi

Katalog UI menggunakan data presentasi sementara sampai migrasi Prisma dan seed dijalankan. Harga checkout, order, autentikasi, CMS, webhook, dan adapter gateway/provider perlu diimplementasikan terhadap database dan kredensial yang belum tersedia. Detail desain dan kontrak ada di `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, dan `DEPLOYMENT.md`.

## Guardrails penting

- Browser tidak boleh mengirim harga sebagai sumber kebenaran.
- Gunakan idempotency key untuk order, webhook, dan pengiriman provider.
- Simpan harga sebagai snapshot item pesanan dan saldo sebagai ledger append-only.
- Simpan seluruh secret di environment/deployment secret manager saja.
