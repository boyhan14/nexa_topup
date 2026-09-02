# Database design

The canonical schema is `prisma/schema.prisma`. Amounts use Decimal. `OrderItem` snapshots name and price; `WalletTransaction` is an append-only ledger, written in the same database transaction as any balance update.
