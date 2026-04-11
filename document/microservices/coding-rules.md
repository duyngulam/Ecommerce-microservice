# Coding Rules and Service Governance (Standardized)

## 1) Service isolation (mandatory)
Service A is NOT allowed to:
- query Service B database
- import Service B codebase or internal package directly

Allowed interaction:
- Sync API call (HTTP)
- Async message via RabbitMQ

## 2) API design
Use REST-style resources:
- `GET /api/products`
- `POST /api/orders`
- `GET /api/orders/{id}`

Avoid action-style endpoint names:
- `/api/doSomething`
- `/api/admin/doAllThings`

## 3) Naming conventions
- Service: `product-service`
- Route prefix: `/api/products`
- Database: `product_db`
- Table: `products`
- Event name: `OrderCreated`, `PaymentSuccess`

## 4) Standard error response
All services return a consistent error envelope:

```json
{
  "success": false,
  "message": "Product not found"
}
```

Recommended optional fields:
- `code`: machine-readable error code
- `traceId`: request correlation id
- `details`: validation errors

## 5) Idempotency (critical)
Endpoints that can charge money or create irreversible side effects MUST be idempotent.

Examples:
- `POST /api/payment/process`
- payment callback endpoints

Implementation checklist:
- Require `Idempotency-Key` for payment create/confirm APIs.
- Store key + response hash in payment DB.
- If retry with same key: return previous result.
- If retry with different payload and same key: reject.
- Add unique constraints for transaction references.

## 6) Reliability patterns
- Use timeout + retry policy for outbound HTTP.
- Use exponential backoff for queue consumers.
- Use dead-letter queue for poison messages.
- Include `eventId` and deduplication in consumers.

## 7) Saga (basic)
- Use event-driven saga for cross-service flow.
- Keep local transaction per service only.
- Use compensating action on failure.

Minimal example:
1. order-service creates pending order.
2. payment-service fails payment.
3. order-service receives `PaymentFailed` and marks order cancelled.
4. cart-service restores cart items if needed.

## 8) Logging and observability
- Include `traceId` and `requestId` in logs.
- Structured logs (JSON preferred in production).
- Log levels: `INFO`, `WARN`, `ERROR`.
- Do not log secrets/tokens/plain passwords.

## 9) Security baseline
- JWT verification at gateway and/or service middleware.
- Role checks remain in service layer (admin/customer).
- Validate all input at API boundary.
- Enforce HTTPS at edge environment.
