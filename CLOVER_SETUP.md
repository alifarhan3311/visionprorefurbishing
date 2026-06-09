# Clover Payment Integration Setup Guide

## Overview
This guide covers the complete setup of Clover payment processing for both backend and frontend in the VisionPro Refurbishing Platform.

---

## Backend Configuration

### 1. Environment Variables (.env)

Update `backend/.env` with your Clover credentials:

```bash
# Clover Payment Configuration
CLOVER_PRIVATE_API_KEY=your_clover_private_key_here
CLOVER_PUBLIC_KEY=your_clover_public_key_here
CLOVER_MID=your_merchant_id_here
CLOVER_SANDBOX=true  # Set to 'true' for testing, omit or 'false' for production
```

### 2. API Endpoint

**Route:** `POST /api/v1/payment/clover-charge`
**Auth:** Protected (requires JWT token)
**Headers:** `Authorization: Bearer <jwt-token>`
**Body:**
```json
{
  "token": "card_token_from_iframe",
  "amount": 100.50,
  "currency": "usd",
  "idempotencyKey": "optional-unique-key"
}
```

**Success Response:**
```json
{
  "success": true,
  "chargeId": "charge_id",
  "status": "succeeded",
  "amount": 10050,
  "currency": "usd"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "cloverStatus": "failed"
}
```

---

## Frontend Configuration

### 1. Environment Variables (frontend/.env)

```bash
VITE_API_URL=http://localhost:5000/api/v1
VITE_IMAGE_URL=http://localhost:5000
VITE_CLOVER_PUBLIC_KEY=your_clover_public_key_here
VITE_CLOVER_SANDBOX=true  # Set to 'true' for testing
```

### 2. Files Created/Modified

| File | Purpose |
|------|---------|
| `src/components/shop/CloverPayment.jsx` | Clover iframe component for secure card entry |
| `src/components/shop/Checkout.jsx` | Updated to use CloverPayment component |
| `backend/.env` | Fixed variable names (CLOOVER_PRIVATE_IP → CLOVER_PRIVATE_API_KEY) |
| `CLOVER_SETUP.md` | This documentation file |

---

## Clover Account Setup

### 1. Create Clover Developer Account
- Visit: https://www.clover.com/developers/
- Sign up and create a new app in Clover Dashboard
- Navigate to "Settings" → "API Keys"

### 2. Get Your API Keys

**Sandbox (Testing):**
- Create a sandbox merchant account
- Get: Public Key, Private Key, Merchant ID

**Production:**
- Go live with your app
- Get production keys from the live dashboard

### 3. Test Card Numbers (Sandbox)
```
Card Number: 4111111111111111
Expiry: Any future date (MM/YY)
CVV: Any 3 digits
```

---

## How It Works

### Frontend Flow
1. User enters shipping details
2. Selects "Pay with Clover" 
3. CloverPayment component loads Clover.js iframe
4. User enters card details in secure iframe
5. Clover generates a payment token (PCI compliant)
6. Token sent to backend `/payment/clover-charge`
7. If successful, order is created in database

### Backend Flow
1. Receive token from frontend
2. Validate token and amount
3. Convert amount to cents (integer)
4. POST to Clover API `/v1/charges`
5. Return charge result to frontend

---

## Running the System

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Payment Flow
1. Go to http://localhost:5173
2. Add item to cart
3. Go to checkout
4. Fill shipping details
5. Select "Pay with Clover"
6. Enter test card: 4111111111111111
7. Submit order

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Clover public key not configured" | Add `VITE_CLOVER_PUBLIC_KEY` to frontend/.env |
| "Clover private key not configured" | Add `CLOVER_PRIVATE_API_KEY` to backend/.env |
| Iframe not loading | Check browser console, verify public key is correct |
| Tokenization fails | Use valid test card, check network tab for errors |
| Charge declined | Verify amount format, check Clover dashboard for transaction logs |

---

## Security Notes
- Private key NEVER exposed to frontend
- Clover.js handles PCI compliance via iframe
- All card data goes directly to Clover servers
- JWT authentication required for charge endpoint
- Amount in cents prevents decimal errors