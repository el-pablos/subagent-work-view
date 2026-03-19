# Event Broadcasting Improvements - 2026-03-20

## Overview
Perbaikan dan penambahan event broadcasting pada controller Laravel untuk memastikan frontend menerima update real-time yang konsisten melalui WebSocket channels.

## Perubahan yang Dilakukan

### 1. Event Class Baru

#### AgentCreated
- **File**: `backend/app/Events/AgentCreated.php`
- **Channel**: `dashboard.global`
- **Event Name**: `agent.created`
- **Payload**: id, uuid, name, type, status, avatar, capacity, priority, capabilities, created_at
- **Tujuan**: Memberitahu frontend ketika agent baru dibuat

#### TaskCreated
- **File**: `backend/app/Events/TaskCreated.php`
- **Channel**: `session.{session_id}` + `dashboard.global`
- **Event Name**: `task.created`
- **Payload**: id, uuid, session_id, title, status, progress, assigned_agent, created_at
- **Tujuan**: Memberitahu frontend ketika task baru dibuat (untuk future use)

#### SessionUpdated
- **File**: `backend/app/Events/SessionUpdated.php`
- **Channel**: `dashboard.global`
- **Event Name**: `session.updated`
- **Payload**: id, uuid, command_source, original_command, status, updated_at
- **Tujuan**: Memberitahu frontend ketika session di-pause atau resume

---

### 2. AgentController Updates

#### `store()` Method
**Perubahan**: Menambahkan broadcasting setelah agent dibuat
```php
broadcast(new AgentCreated($agent));
broadcast(new AgentStatusChanged($agent));
```
**Alasan**: Frontend perlu tahu ketika agent baru ditambahkan ke sistem

#### `update()` Method
**Perubahan**: Broadcasting conditional hanya ketika status atau current_task berubah
```php
$statusChanged = isset($validated['status']) && $validated['status'] !== $agent->status;
$currentTaskChanged = isset($validated['current_task']) && $validated['current_task'] !== $agent->current_task;

if ($statusChanged || $currentTaskChanged) {
    broadcast(new AgentStatusChanged($agent->fresh()));
}
```
**Alasan**: Menghindari event spam untuk perubahan field yang tidak relevan (misal: name, avatar)

#### `heartbeat()` Method
**Perubahan**: Broadcasting conditional saat status berubah atau auto offline→idle
```php
$statusChanged = $oldStatus !== $agent->status;
$currentTaskChanged = $oldTask !== $agent->current_task;

if ($statusChanged || $currentTaskChanged || $autoStatusChange) {
    broadcast(new AgentStatusChanged($agent));
}
```
**Alasan**: Heartbeat dipanggil sangat sering, hanya broadcast jika ada perubahan berarti

#### `reportEvents()` Method
**Perubahan**: Refactor untuk menangani broadcasting berbagai event types
- Mengumpulkan events yang perlu di-broadcast dalam array
- Broadcast setelah semua events diproses
- Menambahkan broadcasting untuk:
  - `status_change`: AgentStatusChanged
  - `task_started`: AgentStatusChanged
  - `task_progress`: TaskUpdated
  - `task_completed`: AgentStatusChanged + TaskUpdated + TaskCompleted
  - `task_failed`: AgentStatusChanged + TaskUpdated + TaskCompleted
  - `message_sent`/`message_received`: AgentStatusChanged + MessageCreated (jika data message provided)
  - `error`: AgentStatusChanged

**Alasan**: Agent reporting events adalah cara utama agent berkomunikasi dengan backend, perlu broadcast ke frontend

---

### 3. TaskController Updates

#### `update()` Method
**Perubahan**: Broadcasting TaskUpdated dan conditional TaskCompleted
```php
broadcast(new TaskUpdated($task));

// Jika status berubah ke completed atau failed
if ($oldStatus !== $task->status && in_array($task->status, ['completed', 'failed'])) {
    broadcast(new TaskCompleted($task));
}
```
**Alasan**: Frontend tracking task progress real-time

#### `retry()` Method
**Perubahan**: Broadcasting TaskUpdated setelah retry
```php
broadcast(new TaskUpdated($task));
```
**Alasan**: Frontend perlu tahu ketika task di-retry dan status kembali ke pending

---

### 4. SessionController Updates

#### `store()` Method
**Perubahan**: Menambahkan komentar dokumentasi
```php
// Note: OrchestrationService already broadcasts SessionCreated internally,
// so we don't duplicate the broadcast here to avoid double events.
```
**Alasan**: AgentOrchestrationService::createSession() sudah broadcast SessionCreated, menghindari double broadcast

**Design Decision**: Tidak menambahkan broadcast di controller karena service layer sudah menangani. Ini memastikan konsistensi apapun cara session dibuat (via controller atau service langsung).

#### `cancel()` Method
**Perubahan**: Broadcasting SessionCompleted setelah cancel
```php
broadcast(new SessionCompleted($session));
```
**Alasan**: Frontend perlu tahu ketika session di-cancel

#### `pause()` Method
**Perubahan**: Broadcasting SessionUpdated setelah pause
```php
broadcast(new SessionUpdated($session));
```
**Alasan**: Frontend perlu update UI untuk session yang di-pause

#### `resume()` Method
**Perubahan**: Broadcasting SessionUpdated setelah resume
```php
broadcast(new SessionUpdated($session));
```
**Alasan**: Frontend perlu update UI untuk session yang di-resume

---

### 5. MessageController
**Status**: Tidak ada perubahan diperlukan
**Alasan**: `MessageController::store()` sudah mem-broadcast `MessageCreated` dengan benar

---

## Channel Architecture

### Global Channels
- `dashboard.global`: Semua events yang perlu dilihat oleh dashboard admin/monitor
  - AgentStatusChanged
  - AgentCreated
  - TaskUpdated
  - TaskCompleted
  - SessionCreated
  - SessionCompleted
  - SessionUpdated

### Specific Channels
- `agent.{id}`: Events spesifik untuk agent tertentu
  - AgentStatusChanged
  
- `session.{session_id}`: Events spesifik untuk session tertentu
  - TaskUpdated
  - TaskCompleted
  - TaskCreated
  - SessionCompleted
  - MessageCreated

---

## Testing Strategy

### Syntax Validation
```bash
cd backend
php -l app/Events/AgentCreated.php
php -l app/Events/TaskCreated.php
php -l app/Events/SessionUpdated.php
php -l app/Http/Controllers/Api/AgentController.php
php -l app/Http/Controllers/Api/TaskController.php
php -l app/Http/Controllers/Api/SessionController.php
```

### Manual Testing Checklist
1. ✅ Create agent → check `dashboard.global` for AgentCreated & AgentStatusChanged
2. ✅ Update agent status → check for AgentStatusChanged (hanya jika status berubah)
3. ✅ Agent heartbeat → check for AgentStatusChanged (conditional)
4. ✅ Agent reportEvents → check for berbagai events tergantung event type
5. ✅ Update task progress → check for TaskUpdated
6. ✅ Update task to completed → check for TaskUpdated + TaskCompleted
7. ✅ Retry task → check for TaskUpdated
8. ✅ Create session → check for SessionCreated (dari service layer)
9. ✅ Cancel session → check for SessionCompleted
10. ✅ Pause session → check for SessionUpdated
11. ✅ Resume session → check for SessionUpdated
12. ✅ Create message → check for MessageCreated

---

## Design Decisions

### 1. Conditional Broadcasting
**Decision**: Hanya broadcast event ketika ada perubahan yang berarti
**Reasoning**: 
- Menghindari spam events yang tidak perlu
- Menghemat bandwidth WebSocket
- Mengurangi rendering overhead di frontend
- Contoh: `update()` hanya broadcast jika status/current_task berubah

### 2. Service Layer vs Controller Broadcasting
**Decision**: SessionCreated di-broadcast di service layer, bukan controller
**Reasoning**:
- Service layer adalah single source of truth untuk session creation
- Menghindari double broadcast jika ada multiple entry points
- Konsistensi: apapun cara create session (controller, job, command), event pasti ter-broadcast

### 3. TaskCompleted untuk Failed Status
**Decision**: Broadcast TaskCompleted juga untuk status `failed`
**Reasoning**:
- Frontend perlu tahu ketika task selesai, baik success maupun failed
- Event name `TaskCompleted` semantically berarti "task sudah tidak running"
- Payload berisi status actual ('completed' atau 'failed') untuk distinguish

### 4. Eager Loading Before Broadcasting
**Decision**: Refresh dan load relations sebelum broadcast
**Reasoning**:
- Memastikan data ter-update di event payload
- Relations (seperti assignedAgent) perlu di-load untuk frontend
- Contoh: `$task->fresh('assignedAgent')` sebelum broadcast

### 5. Batch Broadcasting di reportEvents()
**Decision**: Kumpulkan events, proses semua, lalu broadcast
**Reasoning**:
- Menghindari race condition
- Memastikan all events processed sebelum notify frontend
- Lebih efficient: satu kali update `last_seen_at` di akhir

---

## Breaking Changes
**None** - Ini adalah additive changes, tidak mengubah existing behavior

---

## Future Improvements
1. Rate limiting untuk broadcast events (jika ada spam dari heartbeat)
2. Event debouncing untuk high-frequency events
3. Batch broadcasting untuk multiple events dengan delay kecil
4. Monitoring dan metrics untuk event broadcasting performance
5. TaskCreated event integration (saat ini dibuat tapi belum dipanggil)

---

## Dependencies
- Laravel Broadcasting
- Pusher atau Laravel WebSockets (configured di config/broadcasting.php)
- Redis (untuk queue dan broadcasting driver)

---

## Related Files Modified
```
backend/app/Events/AgentCreated.php          [NEW]
backend/app/Events/TaskCreated.php           [NEW]
backend/app/Events/SessionUpdated.php        [NEW]
backend/app/Http/Controllers/Api/AgentController.php
backend/app/Http/Controllers/Api/TaskController.php
backend/app/Http/Controllers/Api/SessionController.php
docs/event-broadcasting-improvements-2026-03-20.md [NEW]
```

---

## Author
- Date: 2026-03-20
- Context: Event broadcasting improvements untuk real-time frontend updates
