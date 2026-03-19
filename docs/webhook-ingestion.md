# webhook ingestion

## endpoint baru

- `POST /api/v1/webhook/claude`
- `POST /api/v1/webhook/openclaw`

Endpoint masuk lewat route dinamis `POST /api/v1/webhook/{source}` dan diproses oleh `WebhookController`.

## alur ingest

1. `WebhookController` melakukan request validation dasar.
2. `WebhookNormalizer` mengubah payload Claude dan OpenClaw ke struktur internal yang seragam.
3. `AgentIngestService` melakukan upsert session + agent, normalisasi status, create message idempotent, dan create/update task untuk `agent_action`.
4. Event realtime yang ada tetap dipakai: `AgentStatusChanged`, `SessionCreated`, `SessionCompleted`, `MessageCreated`, `TaskUpdated`, `TaskCompleted`.

## perubahan schema

- `sessions.external_id`
- `agents.session_id`
- `agents.metadata`

Kolom tambahan ini dipakai untuk correlation antar event webhook dan supaya UUID internal aplikasi tetap terpisah dari identifier eksternal.
