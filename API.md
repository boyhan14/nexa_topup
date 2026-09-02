# API contract

All responses use `{ success, message, data, error, code }`.

- `POST /api/orders`: validates target, resolves server-side price, needs `Idempotency-Key`.
- `POST /api/webhooks/payments/:provider`: validates raw-body signature and writes payment updates idempotently.
- `GET /api/orders/:reference`: returns redacted status tracking.

Payment adapters: `createPayment`, `getPaymentStatus`, `handleWebhook`, `cancelPayment`, `refundPayment`. Product adapters: `getProducts`, `checkBalance`, `createTransaction`, `checkTransaction`, `handleCallback`.
