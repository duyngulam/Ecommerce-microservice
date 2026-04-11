# Microservices Implementation Plan (Based on Current API Docs)

## Phase 0 - Foundation (1 week)
1. Create repository scaffold and Docker baseline.
2. Provision infrastructure: PostgreSQL, Redis, RabbitMQ, Nginx gateway.
3. Define service contracts and OpenAPI split per service.
4. Define shared standards: trace id, error contract, idempotency keys.

Deliverables:
- running `docker compose` stack
- gateway routing skeleton
- database-per-service setup

## Phase 1 - Auth and Product Domains (2-3 weeks)
1. Extract `auth-service` APIs:
- `/api/auth/*`, `/api/profile/*`, `/api/locations/*`
2. Extract `product-service` APIs:
- catalog, categories, brands, blog, coupons, promotions, advertisements
3. Move admin endpoints by same domain into respective service.
4. Add contract tests for route compatibility.

Deliverables:
- parity for public auth/product APIs
- admin product/coupon/promotion/blog flows work through gateway

## Phase 2 - Order + Payment with Saga (2-3 weeks)
1. Extract `order-service` APIs:
- `/api/orders/*`, `/api/admin/orders*`, `/api/admin/statistics*` (temporary)
2. Extract `payment-service` APIs:
- `/api/payment/*`, `/api/v1/payments/*`, `/api/admin/payments*`
3. Introduce async flow using RabbitMQ:
- `OrderCreated` -> payment-service
- `PaymentSuccess/PaymentFailed` -> order-service
4. Implement idempotency for payment processing and callback handling.

Deliverables:
- stable checkout and retry flow
- no double-charge on retry
- order state synced by event consumers

## Phase 3 - Cart, Review, Notification (1-2 weeks)
1. Extract `cart-service`:
- cart + wishlist endpoints
2. Extract `review-service`:
- nested product reviews + admin moderation
3. Implement `notification-service` as event consumer.
4. Add outbox or reliable publish strategy where needed.

Deliverables:
- complete domain split per target services
- async notification pipeline online

## Phase 4 - Hardening and Observability (1-2 weeks)
1. Add gateway rate limit and service-level throttling.
2. Add dashboards and alerts:
- request latency
- queue lag
- retry counts
- payment error rates
3. Add DLQ handling and replay tooling.
4. Performance test and failover testing.

Deliverables:
- production-ready SLO/SLA baseline
- incident/debug playbook

## Migration strategy (strangler)
1. Keep existing monolith endpoints as fallback behind feature flags.
2. Move routes service-by-service at gateway.
3. Monitor error rates and roll back route mapping quickly if needed.

## Risks and mitigations
- Risk: cascade failure in sync calls.
  - Mitigation: timeout, circuit breaker, fallback.
- Risk: duplicate messages/events.
  - Mitigation: idempotent consumers + dedup store.
- Risk: schema drift across services.
  - Mitigation: API-first contracts, consumer-driven tests.

## Success criteria
- 100% existing endpoints mapped to target service ownership.
- Zero cross-service DB access.
- Payment endpoint idempotent under retry/load tests.
- Gateway is sole public entrypoint.

## Team assignment (4 developers, module-based)

### Dev 1 - Identity and Edge
Primary modules:
- gateway (Nginx routing, auth check, logging, optional rate limit)
- auth-service (auth, profile, locations, admin import)

Key responsibilities:
- Maintain single entrypoint routing and route versioning
- Implement JWT verification contract between gateway and auth-service
- Own auth-service API parity and migration
- Define shared auth middleware contract for other services

Delivery checkpoints:
- End Phase 0: gateway baseline online
- End Phase 1: auth-service endpoints migrated and stable

### Dev 2 - Catalog and Content
Primary modules:
- product-service

Owned domains:
- products, categories, brands
- coupons, promotions, advertisements
- blog, recommend, cloudinary helpers
- all matching admin product endpoints

Key responsibilities:
- Split product-related APIs from monolith into product-service
- Keep admin and public APIs backward compatible at gateway
- Stabilize product search/filter performance

Delivery checkpoints:
- End Phase 1: product-service public and admin parity

### Dev 3 - Orders and Checkout State
Primary modules:
- order-service
- cart-service

Owned domains:
- orders, admin orders, temporary admin statistics
- cart and wishlist

Key responsibilities:
- Implement order lifecycle and status transition safety
- Keep cart and order interaction consistent
- Consume payment events to update order state

Delivery checkpoints:
- End Phase 2: order-service parity with event-based status update
- End Phase 3: cart-service fully extracted

### Dev 4 - Payments and Async Reliability
Primary modules:
- payment-service
- review-service
- notification-service

Owned domains:
- payment process, callback, vnpay ipn/return, admin payments
- review and admin moderation
- async notification consumers and retry policies

Key responsibilities:
- Implement idempotency for payment endpoints and callbacks
- Build RabbitMQ event contracts and consumer reliability
- Own saga event flow with Dev 3 for checkout consistency
- Deliver notification pipeline with DLQ and replay support

Delivery checkpoints:
- End Phase 2: payment-service idempotent and saga-ready
- End Phase 3: review and notification services online

## Cross-team working agreement
- API and event contracts are versioned and reviewed by all 4 devs.
- No direct DB access across services.
- Each dev owns module tests, but integration tests are shared.
- Weekly integration window: merge route changes only after contract tests pass.

## Suggested parallel sprint execution
- Sprint A (Phase 0-1 overlap): Dev 1 + Dev 2 focus first for gateway/auth/product path readiness.
- Sprint B (Phase 2): Dev 3 + Dev 4 drive order-payment saga and idempotency.
- Sprint C (Phase 3-4): all devs harden reliability, observability, and incident tooling.
