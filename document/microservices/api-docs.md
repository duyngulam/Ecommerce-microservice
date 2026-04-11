# API to Service Mapping (Gateway -> Microservices)

Source: OpenAPI `document/APIdocs/apidocs.json`

## 1) Routing summary required by architecture
- `/api/auth` -> `auth-service`
- `/api/products` -> `product-service`
- `/api/orders` -> `order-service`
- `/api/payment` -> `payment-service`

## 2) Full endpoint split (including admin endpoints)

### auth-service
Gateway prefixes:
- `/api/auth/*`
- `/api/profile/*`
- `/api/locations/*`
- `/api/admin/locations/import`
- `/api/admin/training-seed/users`

Mapped operations:
- Auth: register/login
- Profile: profile info, email/password, addresses
- Location: provinces/districts/wards read APIs
- Admin location import
- Training user seeding

### product-service
Gateway prefixes:
- `/api/products/*` (except nested reviews)
- `/api/categories/*`
- `/api/brands/*`
- `/api/coupons/*`
- `/api/advertisements/*`
- `/api/blog/*`
- `/api/cloudinary/*`
- `/api/recommend/*`
- `/api/admin/products*`
- `/api/admin/categories*`
- `/api/admin/brands*`
- `/api/admin/coupons*`
- `/api/admin/promotions*`
- `/api/admin/advertisements*`
- `/api/admin/blog*`

Mapped operations:
- Product catalog/search/detail/variant
- Category/brand management
- Promotion/coupon/advertisement
- Public blog + admin blog management
- Recommendation APIs
- Media upload/delete helper APIs

### order-service
Gateway prefixes:
- `/api/orders/*`
- `/api/admin/orders*`
- `/api/admin/statistics*`

Mapped operations:
- Create order, order detail/history
- Admin order management (cancel/ship/deliver/status)
- Dashboard/statistics endpoints (current API shape)

Note:
- In a later phase, `/api/admin/statistics*` can move to dedicated analytics/reporting service.

### payment-service
Gateway prefixes:
- `/api/payment/*`
- `/api/v1/payments/*`
- `/api/admin/payments*`

Mapped operations:
- Process payment
- Payment callback/status/gateway info
- VNPay IPN and Return URL
- Admin payment analytics and timeout checks

### cart-service
Gateway prefixes:
- `/api/cart/*`
- `/api/wishlist/*`

Mapped operations:
- Cart CRUD
- Wishlist CRUD/check

### review-service
Gateway prefixes:
- `/api/products/{productId}/reviews*`
- `/api/admin/reviews*`

Mapped operations:
- User review CRUD/vote
- Review summary/can-review checks
- Admin review moderation

### notification-service
Gateway prefixes:
- `/api/notifications/*` (new, for future use)

Mapped responsibilities (async-first):
- Consume `OrderCreated`, `PaymentSuccess`, `PaymentFailed`, `OrderShipped`, `OrderDelivered`
- Send email/SMS/push notifications
- Store delivery logs and retry status

## 3) Gateway responsibilities
- Routing by prefix and regex
- Access logging
- Basic JWT verification via auth-service internal endpoint
- Optional rate limiting at route level

## 4) Gateway must not contain
- Business logic
- Database access
- Long-running orchestration

## 5) Response contract baseline
Use common envelope for errors:

```json
{
  "success": false,
  "message": "..."
}
```

## 6) Primary endpoints to implement first (minimal app workflow)

Goal: enable end-to-end customer flow with minimum scope:
- browse products -> login -> add cart -> create order -> process payment -> check result

### Priority 1 - Must-have for first usable release

#### auth-service
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/profile`
- `GET /api/profile/addresses`
- `POST /api/profile/addresses`

#### product-service
- `GET /api/products`
- `GET /api/products/{slug}`
- `GET /api/products/variants/{variantId}`
- `GET /api/categories/list`
- `GET /api/brands/list`

#### cart-service
- `GET /api/cart`
- `POST /api/cart/items`
- `PUT /api/cart/items/{variantId}`
- `DELETE /api/cart/items/{variantId}`

#### order-service
- `POST /api/orders/create`
- `GET /api/orders/{orderNumber}`
- `GET /api/orders/history`

#### payment-service
- `GET /api/payment/gateways`
- `POST /api/payment/process`
- `POST /api/payment/callback`
- `GET /api/payment/status/{transactionId}`

### Priority 2 - Needed for smooth checkout experience

#### auth-service
- `GET /api/locations/provinces`
- `GET /api/locations/provinces/{provinceCode}/districts`
- `GET /api/locations/districts/{districtCode}/wards`

#### cart-service
- `GET /api/wishlist`
- `POST /api/wishlist/items`
- `DELETE /api/wishlist/items/{productId}`

#### product-service
- `GET /api/coupons/validate` is not used (validation endpoint is POST)
- `POST /api/coupons/validate`
- `GET /api/products/on-sale`
- `GET /api/products/new/{categorySlug}`

#### payment-service
- `GET /api/payment/order/{orderId}/status`
- `GET /api/v1/payments/vnpay-return`
- `GET /api/v1/payments/vnpay-ipn`

### Priority 3 - Post-MVP (operations and moderation)
- Admin endpoints (`/api/admin/*`)
- Reviews (`/api/products/{productId}/reviews*`, `/api/admin/reviews*`)
- Notification public API (if introduced)

## 7) Minimal implementation sequence (recommended)
1. Gateway routing + JWT verify passthrough.
2. Auth login/register + profile/address APIs.
3. Product list/detail/variant APIs.
4. Cart APIs.
5. Order create/detail APIs.
6. Payment process/callback/status APIs.
7. Add location, coupon validation, wishlist.
