# broadcast channels & soketi config - 2026-03-19

## ringkasan

- merapikan `backend/routes/channels.php` agar channel publik `dashboard`, `session.{sessionId}`, dan `agent.{agentId}` terdefinisi jelas
- menambahkan alias `dashboard.global` agar tetap kompatibel dengan event existing yang memakai `broadcastOn()`
- menyesuaikan default config `pusher` di `backend/config/broadcasting.php` supaya cocok dengan container Soketi di `docker-compose.yml`
- menambahkan variabel environment broadcasting yang dibutuhkan ke `backend/.env.example`
- memverifikasi `BroadcastServiceProvider` sudah load `routes/channels.php` dan sudah terdaftar di `backend/bootstrap/providers.php`

## detail perubahan

### channels

- `dashboard` disiapkan sebagai channel publik untuk monitoring dashboard
- `dashboard.global` dipertahankan sebagai compatibility layer karena event-event backend saat ini masih broadcast ke channel tersebut
- `session.{sessionId}` dan `agent.{agentId}` tetap public sesuai kebutuhan monitoring realtime saat ini

### pusher / soketi

default `pusher` connection sekarang memakai fallback berikut:

- `PUSHER_APP_ID=app-id`
- `PUSHER_APP_KEY=app-key`
- `PUSHER_APP_SECRET=app-secret`
- `PUSHER_HOST=127.0.0.1` pada config default Laravel
- `PUSHER_PORT=6001`
- `PUSHER_SCHEME=http`
- `encrypted=false`
- `useTLS=false`

catatan: untuk environment Docker, `.env.example` tetap diarahkan ke `PUSHER_HOST=soketi` agar service backend dapat mengakses container Soketi lewat network internal Docker.

## verifikasi

1. `backend/app/Providers/BroadcastServiceProvider.php` sudah memanggil:
   - `Broadcast::routes();`
   - `require base_path('routes/channels.php');`
2. `backend/bootstrap/providers.php` sudah mendaftarkan `App\Providers\BroadcastServiceProvider::class`
3. channel existing di event masih kompatibel karena `dashboard.global` tidak dihapus

## testing yang disarankan

1. jalankan `php artisan config:clear`
2. jalankan `php artisan route:list | grep broadcast`
3. test subscription frontend ke:
   - `dashboard`
   - `dashboard.global`
   - `session.{id}`
   - `agent.{id}`
4. pastikan event realtime terkirim saat Soketi aktif
