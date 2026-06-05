# Payment System Integration Guide

## Overview

HamroStay now has a **complete payment system** powered by **eSewa**. Customers can:
- Create bookings without immediate payment (PENDING status)
- Pay for bookings anytime before check-in
- Get automatic confirmation after successful payment
- Refund their bookings (with admin approval)
- Download payment receipts

## Architecture

### Payment Flow

```
Customer Books Room
    ↓
Booking Created (PENDING status)
    ↓
Customer Views Booking Details
    ↓
Customer Clicks "Pay Now" Button
    ↓
eSewa Payment Session Created
    ↓
Redirected to eSewa Payment Page
    ↓
Customer Completes Payment in eSewa
    ↓
eSewa Redirects Back to HamroStay
    ↓
Booking Status → CONFIRMED
    ↓
Email Confirmation Sent
    ↓
Payment Receipt Generated
```

## Key Components

### Backend

**Payment Module**: [server/src/modules/payments/](server/src/modules/payments/)

1. **payment.controller.js**
   - `POST /payments/checkout` - Create checkout session
   - `GET /payments/verify/:sessionId` - Verify payment
   - `GET /payments/history` - Get payment history
   - `POST /payments/refund` - Refund payment

2. **payment.service.js**
   - `createCheckoutSession()` - Create an eSewa payment session
   - `verifyPayment()` - Verify payment status
   - `getPaymentHistory()` - Retrieve payment history
   - `refundPayment()` - Process refunds

3. **payment.routes.js**
   - Route handlers for all payment endpoints

### Frontend

**Payment API**: [client/src/api/paymentApi.js](client/src/api/paymentApi.js)

```javascript
export const paymentApi = {
  createSession:  (bookingId)    => axiosInstance.post("/payments/checkout", { bookingId }),
  getHistory:     ()             => axiosInstance.get("/payments/history"),
  refund:         (data)         => axiosInstance.post("/payments/refund", data),
  verifyPayment:  (sessionId)    => axiosInstance.get(`/payments/verify/${sessionId}`),
};
```

**Components**:
- [BookingDetail.jsx](client/src/pages/customer/BookingDetail.jsx) - "Pay Now" button
- [BookingSuccess.jsx](client/src/pages/customer/BookingSuccess.jsx) - Payment success page

## API Endpoints

### 1. Create Checkout Session

**POST** `/api/payments/checkout`

```json
Request:
{
  "bookingId": "65a1b2c3d4e5f6g7h8i9j0k1"
}

Response:
{
  "success": true,
  "message": "Checkout session created.",
  "data": {
    "sessionId": "ESEWA-...",
    "url": "http://localhost:5173/esewa/ESEWA-..."
  }
}
```

### 2. Verify Payment

**GET** `/api/payments/verify/{sessionId}`

```json
Response:
{
  "success": true,
  "message": "Payment verified.",
  "data": {
    "bookingId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "status": "COMPLETED",
    "amount": 50000,
    "sessionStatus": "complete"
  }
}
```

### 3. Get Payment History

**GET** `/api/payments/history`

```json
Response:
{
  "success": true,
  "message": "Payment history fetched.",
  "data": [
    {
      "id": "...",
      "bookingId": "...",
      "amount": 50000,
      "status": "COMPLETED",
      "paidAt": "2024-01-15T10:30:00Z",
      "booking": {
        "bookingRef": "HRS-2024-001",
        "room": { "name": "Deluxe Room", "roomNumber": "101" }
      }
    }
  ]
}
```

### 4. Refund Payment

**POST** `/api/payments/refund`

```json
Request:
{
  "bookingId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "reason": "Changed plans"
}

Response:
{
  "success": true,
  "message": "Refund initiated.",
  "data": {
    "id": "re_...",
    "status": "succeeded",
    "amount": 50000
  }
}
```

## eSewa Configuration

Required environment variables in `.env`:

```
ESEWA_MERCHANT_CODE=EPAYTEST
ESEWA_URL=https://uat.esewa.com.np/epay/main
```

## Payment Status Flow

```
PENDING
  ↓ (Customer starts payment)
PROCESSING
  ↓ (Customer completes payment in eSewa)
COMPLETED ✓ → Booking status: CONFIRMED
  ↓ (Customer receives confirmation)
PAYMENT_SUCCESS

FAILED → Booking remains PENDING (can retry)
REFUNDED → Booking status: REFUNDED
```

## Customer Usage Flow

### Step 1: Create Booking
```javascript
const booking = await bookingApi.createBooking({
  roomId: "room123",
  checkIn: "2024-02-15",
  checkOut: "2024-02-18",
  guests: 2,
  guestDetails: {
    name: "John Doe",
    email: "john@example.com"
  }
});
// Status: PENDING
```

### Step 2: View Booking
```javascript
const booking = await bookingApi.getBookingById(bookingId);
// Shows payment summary with "Pay Now" button
```

### Step 3: Initiate Payment
```javascript
const session = await paymentApi.createSession(bookingId);
// Redirects to: window.location.href = session.url
```

### Step 4: eSewa Payment
- Customer completes the payment on the eSewa page
- eSewa redirects back to HamroStay using success/failure URLs

### Step 5: Payment Verification
- HamroStay checks the payment session status
- Booking status updated to CONFIRMED on success
- Email confirmation is sent to the customer

### Step 6: Booking Confirmed
- Customer sees the booking success page
- Booking is ready for check-in

## Currency Support

- **Primary**: NPR (Nepalese Rupee)
- **Tax**: 13% VAT automatically added to final amount

## Security

✅ **eSewa Compliance**
- eSewa handles payment processing securely
- No sensitive payment details are stored on the HamroStay server
- Secure redirect and verification handling

✅ **Authorization Checks**
- Customer can only pay/refund their own bookings
- Payment verification matches user ID
- Admin-only refund approval

✅ **Amount Validation**
- Server-side amount verification
- Prevents manipulation by client

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| "Booking already paid" | Payment already completed | Show booking is confirmed |
| "Session not found" | Invalid session ID | Retry payment creation |
| "Access denied" | Wrong user booking | Check booking ownership |
| "Webhook verification failed" | Invalid signature | Check eSewa callback configuration |
| "Payment intent not found" | Invalid session or callback data | Retry or contact support |

## Testing

### eSewa Sandbox Testing

```
✓ Successful Payment:  4242 4242 4242 4242
✗ Declined:            4000 0000 0000 0002
✓ 3D Secure:           4000 0025 0000 3155
```

Expiry: Any future date
CVC: Any 3 digits

### Webhook Testing

Use eSewa UAT sandbox and success/failure URLs configured in `ESEWA_URL`.

## Troubleshooting

### Payment Not Processing

1. Check eSewa merchant config in `.env`
2. Verify success/failure URLs are correct
3. Check server logs for errors
4. Confirm booking status is PENDING

### Customer Not Receiving Confirmation Email

1. Verify email service configured in `.env`
2. Check webhook processing in logs
3. Ensure booking status updated to CONFIRMED

### Refund Not Processing

1. Verify payment status is COMPLETED
2. Confirm the refund request is approved by admin
3. Ensure payment record is available in the system

## Future Enhancements

- [ ] Multiple payment methods (digital wallets)
- [ ] Partial refunds
- [ ] Payment plan/installments
- [ ] Invoice generation
- [ ] Email receipts
- [ ] Payment analytics dashboard
- [ ] Multi-currency support

---

**Status**: ✅ Production Ready | **Last Updated**: May 2024
