# API Reference Documentation

Base URL: `http://localhost:8080`

---

## Authentication

### Register

Create a new user account.

**Endpoint:** `POST /user/register`

**Request Body:**
```json
{
  "username": "string (required, 3-50 chars)",
  "password": "string (required, 6-20 chars)",
  "nickname": "string (optional)",
  "phone": "string (optional, unique)",
  "email": "string (optional, unique)",
  "school": "string (optional)",
  "studentId": "string (optional)"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "Test User",
    "phone": "13800138000",
    "email": "test@example.com",
    "school": "Test University",
    "studentId": "2021001",
    "status": 1,
    "createTime": "2024-01-01T00:00:00",
    "updateTime": "2024-01-01T00:00:00"
  }
}
```

**Error Responses:**
- `500` - Username already exists
- `500` - Phone number already registered

---

### Login

Authenticate and receive JWT token.

**Endpoint:** `POST /user/login`

**Request Body:**
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": 1,
      "username": "testuser",
      "nickname": "Test User"
    }
  }
}
```

**Error Responses:**
- `500` - Invalid username or password
- `500` - Account disabled

---

### Get User Info

Get current authenticated user's information.

**Endpoint:** `GET /user/info`

**Headers:**
- `token`: JWT token (required)

**Response:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "Test User",
    "phone": "13800138000",
    "email": "test@example.com",
    "school": "Test University",
    "studentId": "2021001",
    "status": 1
  }
}
```

---

### Update User Info

Update current user's profile information.

**Endpoint:** `PUT /user/info`

**Headers:**
- `token`: JWT token (required)

**Request Body:**
```json
{
  "nickname": "New Nickname",
  "phone": "13900139000",
  "email": "new@example.com",
  "school": "New University",
  "studentId": "2021002"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "New Nickname"
  }
}
```

---

## Goods

### List All On-Sale Goods

Get all goods with status = 1 (on sale).

**Endpoint:** `GET /goods/list`

**Authentication:** Not required

**Response:**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "name": "二手教材",
      "price": 25.00,
      "description": "九成新数据结构教材",
      "status": 1,
      "createTime": "2024-01-01T00:00:00",
      "updateTime": "2024-01-01T00:00:00"
    }
  ]
}
```

---

### Get Goods Detail

Get detailed information about a specific goods item.

**Endpoint:** `GET /goods/detail/{id}`

**Path Parameters:**
- `id` (Long): Goods ID

**Response:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "userId": 1,
    "name": "二手教材",
    "price": 25.00,
    "description": "九成新数据结构教材",
    "status": 1,
    "createTime": "2024-01-01T00:00:00",
    "updateTime": "2024-01-01T00:00:00"
  }
}
```

---

### Get My Goods

Get all goods published by the current user.

**Endpoint:** `GET /goods/my`

**Headers:**
- `token`: JWT token (required)

**Response:** Same as List All On-Sale Goods

---

### Create Goods

Create a new goods listing.

**Endpoint:** `POST /goods/create`

**Headers:**
- `token`: JWT token (required)

**Request Body:**
```json
{
  "name": "string (required)",
  "price": "number (required)",
  "description": "string (optional)",
  "status": "integer (optional, default: 1)"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 2,
    "userId": 1,
    "name": "新商品",
    "price": 50.00,
    "description": "商品描述",
    "status": 1
  }
}
```

---

### Update Goods

Update an existing goods listing.

**Endpoint:** `PUT /goods/update`

**Headers:**
- `token`: JWT token (required)

**Request Body:**
```json
{
  "id": 1,
  "name": "Updated Name",
  "price": 30.00,
  "description": "Updated description",
  "status": 1
}
```

**Response:** Same as Create Goods

---

### Delete Goods

Delete a goods listing.

**Endpoint:** `DELETE /goods/delete/{id}`

**Path Parameters:**
- `id` (Long): Goods ID

**Response:**
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## Orders

### Create Order

Place a new order for a goods item.

**Endpoint:** `POST /order/create`

**Headers:**
- `token`: JWT token (required)

**Request Body:**
```json
{
  "goodsId": 1,
  "sellerId": 2
}
```

**Response:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "buyerId": 1,
    "sellerId": 2,
    "goodsId": 1,
    "status": 0,
    "createTime": "2024-01-01T00:00:00",
    "updateTime": "2024-01-01T00:00:00"
  }
}
```

**Order Status Codes:**
- `0` - Pending confirmation
- `1` - Confirmed
- `2` - Cancelled

---

### Get Buyer Orders

Get all orders where current user is the buyer.

**Endpoint:** `GET /order/my/buy`

**Headers:**
- `token`: JWT token (required)

**Response:**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "buyerId": 1,
      "sellerId": 2,
      "goodsId": 1,
      "status": 0,
      "createTime": "2024-01-01T00:00:00"
    }
  ]
}
```

---

### Get Seller Orders

Get all orders where current user is the seller.

**Endpoint:** `GET /order/my/sell`

**Headers:**
- `token`: JWT token (required)

**Response:** Same as Get Buyer Orders

---

### Update Order Status

Update the status of an existing order.

**Endpoint:** `PUT /order/status/{id}`

**Path Parameters:**
- `id` (Long): Order ID

**Query Parameters:**
- `status` (Integer): New status code (0, 1, or 2)

**Response:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "status": 1,
    "updateTime": "2024-01-01T12:00:00"
  }
}
```

---

## Error Responses

All error responses follow the same format:

```json
{
  "code": 500,
  "message": "Error description",
  "data": null
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 401 | Unauthorized (invalid or missing token) |
| 500 | Internal server error |

### Authentication Errors

When authentication fails, the response includes:
```json
{
  "code": 401,
  "message": "未登录"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding:
- 100 requests per minute per IP for public endpoints
- 1000 requests per minute per user for authenticated endpoints

---

## Pagination

Currently not implemented. Future implementation will use:

**Request:**
```
GET /goods/list?page=1&size=20
```

**Response:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [...],
    "total": 100,
    "size": 20,
    "current": 1,
    "pages": 5
  }
}
```
