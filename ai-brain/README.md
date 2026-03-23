# AI Brain — VPS2 Moderation Orchestrator

NestJS service running on VPS2 (ai-core) behind Tailscale. Provides the 3-layer moderation pipeline for the marketplace messaging system.

## Architecture

```
VPS1 (app-core)                    VPS2 (ai-core)
─────────────────                  ──────────────────
messages.service.ts ──────────►  /internal/v1/moderate/message
chat.service.ts     ──────────►  │
                                 ├─ Layer 1: DetectorService (regex/heuristics)
                                 │           + ConversationStateEvaluator (policy matrix)
                                 ├─ Layer 2: OpenClawAdapter (semantic, when available)
                                 └─ Layer 3: Decision engine → ModerationResponse
```

## Quick Start

```bash
cd ai-brain
cp .env.example .env
# Edit .env — set AI_INTERNAL_TOKEN (must match VPS1)
npm install
npm run build
npm start
```

## Environment Variables

| Variable                 | Required | Description                                                          |
| ------------------------ | -------- | -------------------------------------------------------------------- |
| `PORT`                   | Yes      | HTTP port (default: 8088)                                            |
| `AI_INTERNAL_TOKEN`      | Yes      | Service-to-service auth token. Must match VPS1's `AI_INTERNAL_TOKEN` |
| `AI_POLICY_VERSION`      | No       | Policy version string (default: ts-v2)                               |
| `OPENCLAW_BASE_URL`      | No       | OpenClaw gateway URL (default: http://127.0.0.1:18789)               |
| `OPENCLAW_GATEWAY_TOKEN` | No       | OpenClaw auth token                                                  |

## Endpoints

| Method | Path                            | Auth         | Description                                         |
| ------ | ------------------------------- | ------------ | --------------------------------------------------- |
| POST   | `/internal/v1/moderate/message` | Bearer token | Moderate a message through 3-layer pipeline         |
| GET    | `/internal/v1/health/live`      | Bearer token | Liveness probe                                      |
| GET    | `/internal/v1/health/ready`     | Bearer token | Readiness probe (checks config, detector, OpenClaw) |
| GET    | `/internal/v1/health/deps`      | Bearer token | Dependency status (probes OpenClaw)                 |

## Moderation Pipeline

### Layer 1 — Deterministic Rules (DetectorService)

15 regex/heuristic rules organized by category:

- PII detection (phone, email)
- Off-platform contact (Zalo, Telegram, Facebook, other social)
- Payment bypass / off-platform transactions
- Scam/fraud (urgency, impersonation)
- Abuse/toxic (profanity, threats)
- Spam (repetition, caps flood)
- External links

Plus `ConversationStateEvaluator`: 7 conversation states × 3 roles policy matrix that amplifies/relaxes rules based on context.

### Layer 2 — Semantic Analysis (OpenClawAdapter)

Invoked when Layer 1 risk is 25–60 (gray zone) and OpenClaw is connected. Currently a mock — Wave 3 will connect the real adapter.

### Layer 3 — Decision Engine

Aggregates all hits and produces one of 5 decisions:

- `ALLOW` — message passes
- `ALLOW_WITH_REDACTION` — PII redacted, message passes
- `SOFT_BLOCK` — message rejected with user notice, can retry
- `BLOCK` — message rejected permanently
- `ESCALATE_REVIEW` — message held for human review (not blocked)

## Production Deployment (PM2)

```bash
# On VPS2
cd /srv/ai-brain/current
npm ci --production
npm run build

# Start with PM2
pm2 start ecosystem.config.js --only ai-orchestrator-api
pm2 save

# Verify
curl -s http://localhost:8088/internal/v1/health/live \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## VPS1 Migration (labels field)

```bash
# On VPS1 — after deploying the updated Prisma schema
cd /srv/BE-baotienweb.cloud
npx prisma migrate deploy
```

This applies the `20260321000000_add_labels_to_moderation_log` migration which adds the `labels` column to `marketplace_message_moderation_logs`.

## Backward Compatibility

- `AI_INTERNAL_ENABLED=false` on VPS1 → old moderation path works unchanged
- `AI_INTERNAL_ENABLED=true` → VPS1 calls this service; if circuit breaker trips (5 failures), falls back to allow-with-warning
- OpenClaw disconnected → Layer 2 is skipped; Layers 1+3 still produce decisions
