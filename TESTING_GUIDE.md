# HamroStay System Testing Guide

## Overview
This guide covers comprehensive testing of the HamroStay system including authentication, authorization, all user roles, workflows, and data synchronization.

---

## 1. AUTHENTICATION & AUTHORIZATION TESTING

### 1.1 User Registration
**Test Cases:**
- [ ] Register with weak password (< 8 chars) → Should fail
- [ ] Register without uppercase letter → Should fail
- [ ] Register without lowercase letter → Should fail
- [ ] Register without number → Should fail
- [ ] Register without special character → Should fail
- [ ] Register with valid strong password → Should succeed
- [ ] Register with duplicate email → Should fail with 409
- [ ] Register creates welcome email → Should be non-blocking
- [ ] Different roles (ADMIN, CUSTOMER, VENDOR) → Defaults to CUSTOMER

**Expected Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one digit
- At least one special character (!@#$%^&*)

### 1.2 Login
**Test Cases:**
- [ ] Login with correct credentials → Should succeed and return tokens
- [ ] Login with wrong password → Should fail with 401
- [ ] Login with non-existent email → Should fail with 401
- [ ] Login with deactivated account → Should fail with 403
- [ ] Tokens are stored in authStore → Should persist via Zustand
- [ ] Access token is sent in Authorization header → Should work
- [ ] Refresh token properly stored → Should be usable for token refresh

### 1.3 Token Refresh
**Test Cases:**
- [ ] Access token expires → Should trigger refresh
- [ ] Refresh with valid token → Should get new access token
- [ ] Refresh with invalid token → Should fail with 401
- [ ] Refresh with revoked token → Should fail with 401
- [ ] Multiple simultaneous refresh requests → Should not cause race condition
- [ ] New refresh token is returned and stored → Should persist

### 1.4 Socket.IO Authentication
**Test Cases:**
- [ ] Socket connection without token → Should reject with auth error
- [ ] Socket connection with valid token → Should authenticate
- [ ] Socket connection with expired token → Should reject
- [ ] User can only send messages on their own channel → Should prevent impersonation
- [ ] Admin can access admin room → Should join successfully
- [ ] Vendor can access vendor room → Should join successfully
- [ ] Online user count updates correctly → Should emit to all connected clients

### 1.5 Change Password
**Test Cases:**
- [ ] Change with incorrect current password → Should fail
- [ ] Change to weak password → Should fail with validation error
- [ ] Change to strong password → Should succeed
- [ ] Old refresh token invalidated → Should require new login
- [ ] Password strength validation applied → Must meet requirements

---

## 2. CUSTOMER WORKFLOWS

### 2.1 Room Browsing
**Test Cases:**
- [ ] Browse all available rooms → Should paginate correctly
- [ ] Filter by room type → Should filter results
- [ ] Filter by price range → Should work with min/max
- [ ] Filter by capacity → Should show rooms with min capacity
- [ ] Search by name/description → Should find rooms
- [ ] Featured rooms displayed → Should show featured rooms first
- [ ] Average rating calculated → Should show rating from reviews
- [ ] Room details load with reviews → Should include latest 20 reviews
- [ ] Images load properly → Should display all images
- [ ] Pagination works → Should navigate pages correctly

### 2.2 Booking Creation
**Test Cases:**
- [ ] Create booking with valid data → Should succeed
- [ ] Check-in date in past → Should fail
- [ ] Check-out before check-in → Should fail
- [ ] Guest count exceeds room capacity → Should fail
- [ ] Guest count = 0 → Should fail
- [ ] Room unavailable for dates → Should fail with 409
- [ ] Missing required fields → Should return 400
- [ ] Booking cost calculated correctly → TAX_RATE applied (13%)
- [ ] Discount applied correctly → Should reduce base amount
- [ ] Admin notified of new booking → Should receive socket event
- [ ] Email sent to customer → Should be non-blocking

### 2.3 Payment Workflow
**Test Cases:**
- [ ] Create checkout session → Should generate Khalti session
- [ ] Session ID generated with booking reference → Should include timestamp
- [ ] Cannot pay twice for same booking → Should prevent duplicate payment
- [ ] Khalti verification idempotent → Multiple verifications succeed safely
- [ ] Payment marked as COMPLETED → Should update booking status
- [ ] Customer redirected on success → Should show booking success page
- [ ] Customer redirected on failure → Should show failure message
- [ ] Payment history shows customer's payments → Should filter by userId
- [ ] Admin can view all payments → Should show all payments

### 2.4 Booking Management
**Test Cases:**
- [ ] Customer sees only their bookings → Should filter by userId
- [ ] Customer can view booking details → Should include all details
- [ ] Customer can cancel pending booking → Should succeed
- [ ] Customer cannot cancel confirmed booking → Should fail
- [ ] Customer cannot cancel checked-in booking → Should fail
- [ ] Booking status update sends notification → Should emit socket event
- [ ] Customer receives email on status change → Should be non-blocking
- [ ] Pagination works on bookings list → Should navigate correctly
- [ ] Search by booking ref works → Should find booking
- [ ] Filter by status works → Should filter results

### 2.5 Customer Profile
**Test Cases:**
- [ ] View profile information → Should display all fields
- [ ] Update profile fields → Should persist changes
- [ ] Upload avatar → Should store new image
- [ ] Change password works → Should follow validation rules
- [ ] Customer role permissions respected → Should not access admin routes

---

## 3. ADMIN WORKFLOWS

### 3.1 Admin Dashboard
**Test Cases:**
- [ ] Admin can access admin dashboard → Should render
- [ ] Dashboard shows key metrics → Occupancy, revenue, bookings
- [ ] Real-time booking notifications → Should receive socket events
- [ ] Cannot access unless ADMIN role → Should get 403
- [ ] Admin-only routes protected → Should verify authorization

### 3.2 Booking Management (Admin)
**Test Cases:**
- [ ] Admin sees all bookings → Should not filter by userId
- [ ] Admin can update booking status → To CONFIRMED, CANCELLED, REFUNDED
- [ ] Status change sends customer notification → Should emit to customer's room
- [ ] Confirmation email sent to customer → On CONFIRMED status
- [ ] Cancellation email sent to customer → On CANCELLED status
- [ ] Admin can cancel any booking → Should work regardless of status
- [ ] Admin can search/filter bookings → By ref, status, date range

### 3.3 Room Management (Admin)
**Test Cases:**
- [ ] Admin can create new room → With all required fields
- [ ] Room created with AVAILABLE status → Default status correct
- [ ] Admin can update room details → Price, capacity, amenities
- [ ] Admin can update room status → AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED
- [ ] Admin cannot delete room with active bookings → Should prevent deletion
- [ ] Featured rooms can be toggled → Should update isFeatured flag
- [ ] Discount percentage applied → Should validate 0-100 range
- [ ] Cache invalidated on room update → Should refresh client data

### 3.4 Payment Refunds (Admin)
**Test Cases:**
- [ ] Admin can refund completed payments → Should work
- [ ] Cannot refund pending/failed payments → Should fail
- [ ] Refund reason stored → Should track refund reason
- [ ] Booking status updated to REFUNDED → Should reflect in booking
- [ ] Refund is idempotent → Multiple refunds for same booking fail safely
- [ ] Payment status changes to REFUNDED → Verified in database
- [ ] Non-admin cannot access refund → Should return 403

### 3.5 User Management (Admin)
**Test Cases:**
- [ ] Admin can view all users → With pagination
- [ ] Admin can filter by role → ADMIN, CUSTOMER, VENDOR
- [ ] Admin can search users → By name or email
- [ ] Admin can deactivate user → Should set isActive to false
- [ ] Deactivated user cannot login → Should fail
- [ ] Admin can view user details → Including booking history

### 3.6 Vendor Approval (Admin)
**Test Cases:**
- [ ] Admin can approve pending vendors → Should set isApproved to true
- [ ] Only admins can approve → Non-admin should get 403
- [ ] Vendor cannot self-approve → Even with direct access
- [ ] Approved vendor can operate → Can create inventory, orders
- [ ] Email sent to vendor on approval → Should be non-blocking

---

## 4. VENDOR WORKFLOWS

### 4.1 Vendor Registration & Profile
**Test Cases:**
- [ ] Vendor can register with business details → Should create vendor profile
- [ ] Cannot register without required fields → Business name, contact, email, phone
- [ ] Can only have one vendor profile → Should prevent duplicates
- [ ] Vendor status is PENDING approval initially → isApproved = false
- [ ] Cannot operate until approved → Should prevent inventory/orders
- [ ] Vendor profile shows pending status → Should notify vendor
- [ ] Email sent on registration → Confirmation email to vendor

### 4.2 Inventory Management
**Test Cases:**
- [ ] Vendor can add inventory items → To their profile
- [ ] Vendor can only access own inventory → Should prevent cross-vendor access
- [ ] Admin can view all vendor inventory → Should show all items
- [ ] Inventory item fields validated → Unit, price, stock
- [ ] Can update stock levels → When items received/used
- [ ] Min stock tracking works → For reordering alerts
- [ ] Images uploaded for items → Should store image URLs
- [ ] Vendor cannot access other vendor's inventory → Authorization check

### 4.3 Order Management
**Test Cases:**
- [ ] Admin can create order from vendor inventory → Select items and quantities
- [ ] Order total calculated correctly → Based on unit prices
- [ ] Order reference generated → Unique tracking ID
- [ ] Order status progresses → PENDING → PROCESSING → DELIVERED
- [ ] Vendor can view orders → Only their own orders
- [ ] Admin can view all orders → All vendors
- [ ] Order delivery date tracked → When marked DELIVERED
- [ ] Inventory not auto-deducted → Manual adjustment by staff

### 4.4 Rating & Performance
**Test Cases:**
- [ ] Vendor rating calculated → From completed orders
- [ ] Total orders tracked → Incremented on each order
- [ ] Performance metrics visible → To admins on dashboard
- [ ] Vendor filter by category works → FOOD_BEVERAGE, etc.
- [ ] Vendor search functional → By business name, contact

---

## 5. REAL-TIME DATA SYNCHRONIZATION

### 5.1 Customer to Admin Sync
**Test Cases:**
- [ ] New booking appears in admin dashboard → Real-time socket event
- [ ] Booking update visible to customer immediately → Status change
- [ ] Payment completion notifies admin → Real-time event
- [ ] Cancellation updates reflected → In admin's booking list
- [ ] Live booking count updates → In admin stats

### 5.2 Admin to Customer Sync
**Test Cases:**
- [ ] Booking status change notifies customer → Email + socket event
- [ ] Customer sees updated booking status → In their bookings list
- [ ] Cancellation confirmed → In customer's records
- [ ] Price changes reflected → If payment re-required
- [ ] Room availability updates → When bookings change

### 5.3 Vendor Notifications
**Test Cases:**
- [ ] Vendor notified of new orders → Real-time alert
- [ ] Order status updates visible → To vendor and admin
- [ ] Inventory low stock alerts → When stock < minStock
- [ ] Approval notifications → Email when approved

### 5.4 Broadcast Messages
**Test Cases:**
- [ ] System announcements → Go to all users
- [ ] Maintenance notifications → Go to all users
- [ ] New room announcements → Broadcasted
- [ ] Special offers → To relevant users

---

## 6. PERFORMANCE TESTING

### 6.1 Query Performance
**Test Cases:**
- [ ] Room listing with 1000+ rooms → < 500ms response
- [ ] Booking list pagination → < 300ms response
- [ ] Payment history load → < 300ms response
- [ ] Vendor inventory search → < 300ms response
- [ ] Database indexes working → Check query execution plans

### 6.2 Socket.IO Performance
**Test Cases:**
- [ ] 100 concurrent connections → Should handle smoothly
- [ ] Message delivery < 100ms → Between connected users
- [ ] No memory leaks → Monitor memory over time
- [ ] Proper cleanup on disconnect → Remove from online tracking

### 6.3 Real-Time Updates
**Test Cases:**
- [ ] Admin dashboard updates instantly → Multiple booking events
- [ ] Customer sees updates immediately → No staleness
- [ ] No duplicate notifications → Sent exactly once

### 6.4 Loader & Loading States
**Test Cases:**
- [ ] Loading spinner shows on data fetch → UX feedback
- [ ] Data populates after load → Smooth transition
- [ ] No blocking interactions → Can cancel/navigate
- [ ] Error handling graceful → Shows error message
- [ ] Retry mechanism works → For failed requests

---

## 7. ERROR HANDLING & VALIDATION

### 7.1 Input Validation
**Test Cases:**
- [ ] Empty fields rejected → Returns 400
- [ ] Invalid date formats handled → Returns 400
- [ ] XSS attempts sanitized → No injection
- [ ] SQL injection attempts blocked → Prisma parameterized
- [ ] File upload validation → Size, type checks

### 7.2 Authorization Errors
**Test Cases:**
- [ ] Accessing other user's data → Returns 403
- [ ] Non-admin accessing admin routes → Returns 403
- [ ] Non-vendor accessing vendor routes → Returns 403
- [ ] Expired token handled → Returns 401 or forces refresh
- [ ] Missing token handled → Returns 401

### 7.3 Server Errors
**Test Cases:**
- [ ] Database connection failure → Graceful error message
- [ ] External API failure (Khalti) → Handled gracefully
- [ ] Email service failure → Non-blocking, logged
- [ ] Socket connection failure → Reconnects automatically
- [ ] Rate limiting triggered → Returns 429

### 7.4 Client Error Handling
**Test Cases:**
- [ ] Network timeout shown → User-friendly message
- [ ] Failed payment shown → Offer retry option
- [ ] Form submission failure → Error below input
- [ ] Loading state errors → Can retry or go back

---

## 8. SECURITY TESTING

### 8.1 Authentication Security
**Test Cases:**
- [ ] Tokens stored securely → httpOnly cookies or secure storage
- [ ] No sensitive data in JWT → Check decoded token
- [ ] Token expiration enforced → Access token expires quickly
- [ ] Refresh token rotation → New token on each refresh
- [ ] Session termination works → On logout

### 8.2 Authorization Security
**Test Cases:**
- [ ] Role-based access enforced → Cannot bypass with URL manipulation
- [ ] Vendor inventory isolation → Cannot access other vendors
- [ ] Customer booking privacy → Cannot access other customers
- [ ] Admin-only functions protected → Verified on every request
- [ ] Permission checks not bypassed → Frontend + Backend validation

### 8.3 Data Protection
**Test Cases:**
- [ ] Passwords hashed with bcrypt → 12 salt rounds
- [ ] Sensitive fields excluded from responses → No plaintext passwords
- [ ] CORS properly configured → Only allowed origins
- [ ] Rate limiting applied → 100 req/15min globally, 10 for auth
- [ ] SQL injection prevention → Prisma parameterized queries
- [ ] XSS prevention → React escapes by default

### 8.4 Payment Security
**Test Cases:**
- [ ] Payment tokens never logged → No sensitive data in logs
- [ ] Khalti integration secure → Via secret key only
- [ ] Payment verification idempotent → Cannot double-charge
- [ ] Amount validation → Compare before and after payment
- [ ] Refund validation → Only completed payments

---

## 9. WORKFLOW INTEGRATION TESTS

### 9.1 Complete Booking Flow
```
1. Customer registers → Strong password required
2. Customer browses rooms → Filters work, pagination works
3. Customer creates booking → Dates validated, capacity checked
4. Payment session created → Khalti integration works
5. Customer makes payment → Khalti verification succeeds
6. Booking confirmed → Status updated, emails sent
7. Admin sees new booking → Socket notification received
8. Admin can manage booking → Status updates work
9. Customer sees updates → Real-time socket notification
10. Booking lifecycle complete → Status transitions correct
```

### 9.2 Vendor Operations Flow
```
1. Vendor registers → With business details
2. Admin approves vendor → Email notification sent
3. Vendor adds inventory → Items stored with images
4. Admin creates order → From vendor inventory
5. Order processing → Status updates visible
6. Vendor sees order → Real-time notification
7. Order delivery → Status marked DELIVERED
8. Vendor performance tracked → Rating and metrics updated
```

### 9.3 Admin Management Flow
```
1. Admin logs in → Access token obtained
2. Dashboard loads → Real-time metrics
3. Manage bookings → Create, update, cancel
4. Manage rooms → CRUD operations
5. Manage users → View, filter, deactivate
6. Manage vendors → Approve, view performance
7. View finances → Revenue, expenses tracking
8. System configuration → Settings management
```

---

## 10. TESTING CHECKLIST

### Before Testing
- [ ] Database is populated with test data
- [ ] Environment variables correctly configured
- [ ] Server running on correct port
- [ ] Client running with correct API URL
- [ ] Socket.IO URL configured
- [ ] Khalti sandbox credentials configured

### During Testing  
- [ ] Check browser console for errors
- [ ] Monitor server logs for issues
- [ ] Check database for correct data
- [ ] Verify email sending (or mock)
- [ ] Verify socket events in Network tab
- [ ] Check performance metrics

### After Testing
- [ ] Document any failures
- [ ] Check for data consistency
- [ ] Verify cleanup (no orphaned records)
- [ ] Memory usage normalized
- [ ] All tests passed

---

## 11. TEST ACCOUNT CREDENTIALS

Create these test accounts before testing:

### Customer Accounts
```
Email: customer1@test.com
Password: TestPassword@123

Email: customer2@test.com
Password: SecurePass@2024
```

### Vendor Accounts  
```
Email: vendor1@test.com
Password: VendorPass@123
Business: ABC Catering

Email: vendor2@test.com
Password: VendorPass@456
Business: XYZ Housekeeping
```

### Admin Accounts
```
Email: admin@test.com
Password: AdminPass@2024

Email: admin2@test.com
Password: AdminSecure@123
```

---

## 12. KNOWN ISSUES TO VERIFY FIXED

- [x] Socket.io authentication now uses JWT tokens
- [x] Booking input validation added (dates, capacity, guests)
- [x] Password strength validation implemented
- [x] Refund endpoint has authorization checks
- [x] Payment verification is idempotent
- [x] Vendor inventory access controlled
- [x] Database indexes added for performance
- [x] Socket error handling improved

---

## 13. CONTINUOUS MONITORING

After deployment, monitor:
- [ ] Error rate < 0.1%
- [ ] API response times < 500ms (p99)
- [ ] Socket message delivery < 100ms
- [ ] Database query times < 100ms (p99)
- [ ] Memory usage stable
- [ ] No token-related errors increasing
- [ ] Payment success rate > 95%

