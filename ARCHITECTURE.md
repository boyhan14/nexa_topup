# Architecture

Next.js acts as BFF, PostgreSQL/Prisma persists data, and server-only adapters isolate payment and fulfilment vendors. UI sends product ID and target data only; order services derive every price from the database and store immutable order-item snapshots.

Payment and fulfilment states are independent. Webhooks are signature-verified and idempotent by external reference. Production should add a durable queue for retries.
