# api broadcast payload consistency - 2026-03-19

## ringkasan

- menambahkan `CommandController` dan mengarahkan route `POST /api/v1/commands/execute` ke controller tersebut
- memperbaiki validasi `message_type` di `MessageController` agar mengikuti `App\Enums\MessageType`
- menyeragamkan payload `broadcastWith()` di event backend agar selalu dibungkus dengan key model seperti `agent`, `task`, `message`, dan `session`

## detail perubahan

### command route

- `backend/routes/api.php` sekarang meng-import `App\Http\Controllers\Api\CommandController`
- route `commands/execute` tidak lagi menunjuk ke `SessionController::store`, tetapi ke `CommandController::execute`
- implementasi `CommandController::execute()` mempertahankan perilaku pembuatan session yang sama seperti endpoint sebelumnya

### validasi message type

- `backend/app/Http/Controllers/Api/MessageController.php` sekarang meng-import:
  - `App\Enums\MessageType`
  - `Illuminate\Validation\Rules\Enum`
- rule `message_type` diubah ke `['required', new Enum(MessageType::class)]`

### event payload realtime

- event-event berikut sekarang mengembalikan payload terbungkus:
  - `AgentCreated` / `AgentStatusChanged` → `agent`
  - `TaskCreated` / `TaskUpdated` / `TaskCompleted` → `task`
  - `SessionCreated` / `SessionUpdated` / `SessionCompleted` → `session`
  - `MessageCreated` → `message`

## verifikasi

jalankan syntax check:

```bash
cd backend
php -l routes/api.php
php -l app/Http/Controllers/Api/CommandController.php
php -l app/Http/Controllers/Api/MessageController.php
php -l app/Events/AgentCreated.php
php -l app/Events/AgentStatusChanged.php
php -l app/Events/TaskCreated.php
php -l app/Events/TaskUpdated.php
php -l app/Events/TaskCompleted.php
php -l app/Events/SessionCreated.php
php -l app/Events/SessionUpdated.php
php -l app/Events/SessionCompleted.php
php -l app/Events/MessageCreated.php
```
