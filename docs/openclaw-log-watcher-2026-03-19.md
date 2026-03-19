# openclaw log watcher - 2026-03-19

## ringkasan

- tambah artisan command `openclaw:watch` untuk monitor file JSONL OpenClaw secara daemon dan forward event ke endpoint webhook Laravel
- tambah artisan command `openclaw:sync` untuk one-time ingest semua file session OpenClaw yang sudah ada
- tambah `OpenClawService` untuk shared parsing + persistence logic ke tabel `sessions`, `agents`, dan `messages`
- tambah `WebhookController` agar endpoint `/api/v1/webhook/openclaw` bisa menerima event realtime dari watcher
- tambah feature test untuk sync idempotent dan ingest webhook

## mapping event ke model

- **session** → upsert `sessions` dengan `command_source = openclaw`, simpan metadata penting di kolom `context`
- **message** → create `messages` dengan channel `openclaw`; role `user` jadi `MessageType::USER`, sisanya default ke `AGENT`/`SYSTEM`
- **model_change** → update `sessions.context.model_id` dan simpan system message ringkas
- **custom: thinking_level_change** → update `sessions.context.thinking_level` dan simpan system message ringkas
- **agent** → dibuat per session dengan nama `openclaw {session_id}` agar relasi `from_agent_id`/`to_agent_id` pada message tetap konsisten

## catatan implementasi

- watcher menyimpan offset file di memory sehingga hanya event baru yang dikirim
- jika file di-rotate atau size mengecil, watcher otomatis reset offset ke awal file
- malformed JSON di-skip, dicatat ke log, dan loop tidak dihentikan
- sync command dibuat idempotent dengan deduplikasi message berdasarkan `session_id + channel + message_type + content + timestamp`
- endpoint webhook hanya menerima source `openclaw`; source lain akan ditolak dengan status `422`

## contoh penggunaan

```bash
cd backend
php artisan openclaw:sync
php artisan openclaw:watch
php artisan openclaw:watch --path=/root/.openclaw/agents/main/sessions --interval=5
```

## verifikasi yang disarankan

1. jalankan `php artisan test --filter=OpenClawIntegrationTest`
2. uji manual watcher sambil append line baru ke file `.jsonl`
3. bila ada perubahan schema di masa depan, tetap jalankan `php artisan migrate --pretend` sebelum deploy ke production
