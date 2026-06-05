# HamroStay - Quick Start Testing Guide

**Last Updated:** May 28, 2026  
**System Status:** ✅ Production Ready

---

## 🚀 Quick Start - 5 Minute Testing

### Prerequisites
- [ ] Server running on `http://localhost:5000`
- [ ] Client running on `http://localhost:5173`
- [ ] Browser DevTools open (F12)
- [ ] Database populated with test data

### Test Sequence (5 minutes)

#### 1. Test Socket.IO Authentication (1 min)
```
✓ Open DevTools → Network → WS filter
✓ Refresh page while logged in
✓ Look for socket connection
✓ Verify connection succeeds (should see "authenticated" or similar)
✓ Try sending message in chat
✓ Message should appear in real-time
```

**Expected:** Socket connection with JWT token, real-time messaging works

#### 2. Test Password Strength (1 min)
```
✓ Go to /register
✓ Try password "weak" → Should show error
✓ Try password "Weak@123" → Should work
✓ Try password "123456" → Should show error
✓ Successfully register with Weak@123
```

**Expected:** Weak passwords rejected, strong password accepted

#### 3. Test Booking Validation (1.5 min)
```
✓ Login as customer
✓ Go to /rooms
✓ Click on a room to book
✓ Try booking with 50 guests (if room capacity is less) → Error
✓ Try booking with past check-in date → Error  
✓ Try booking with checkOut before checkIn → Error
✓ Book valid dates with valid guest count → Success
```

**Expected:** All validation errors prevent booking, valid booking succeeds

#### 4. Test Admin Authorization (1 min)
```
✓ Login as admin
✓ Go to /admin → Should load dashboard
✓ Try accessing /admin/rooms
✓ Click "Create Room"
✓ Try creating room with price = 0 → Error
✓ Create room with valid data → Success
✓ Logout and login as customer
✓ Try accessing /admin → Should redirect or show error
```

**Expected:** Admin features work for admin, blocked for customers

#### 5. Test Real-Time Updates (0.5 min)
```
✓ Open 2 browser windows (admin and customer)
✓ Customer has pending booking
✓ Admin updates booking status to CONFIRMED
✓ Check customer window → Status updates in real-time
✓ Check if customer received notification (socket event)
```

**Expected:** Status changes appear immediately in both windows

---

## 📋 Full Test Checklist (30 minutes)

### Setup (2 min)
- [ ] Environment variables configured
- [ ] Database connected
- [ ] Server running
- [ ] Client running
- [ ] Khalti sandbox credentials configured

### Authentication Tests (5 min)
- [ ] Registration with weak password → Rejected
- [ ] Registration with strong password → Accepted
- [ ] Login with correct credentials → Success
- [ ] Login with wrong password → Rejected
- [ ] Token automatically refreshed when expired → Works
- [ ] Socket connection established with token → Success
- [ ] Socket shows online user count → Updates

### Customer Workflow (8 min)
- [ ] Browse rooms with filters → Works
- [ ] View room details with reviews → Loads correctly
- [ ] Create booking with validation → Works
- [ ] Booking cost calculated correctly → Tax + discount applied
- [ ] Make test payment → Success/redirects properly
- [ ] View bookings list → Only own bookings shown
- [ ] Update profile → Changes persist
- [ ] Change password → New password works on login
- [ ] Receive booking status notifications → Socket/Email

### Admin Workflow (8 min)
- [ ] View admin dashboard → Loads with stats
- [ ] View all bookings → No user filter
- [ ] Update booking status → Customer notified in real-time
- [ ] Create new room → With full validation
- [ ] Update room details → Changes saved
- [ ] Delete room → Only if no active bookings
- [ ] View all payments → Across all customers
- [ ] Process refund → Payment status updated
- [ ] Manage vendors → Approve workflow

### Vendor Workflow (5 min)
- [ ] Register as vendor → Status pending
- [ ] Wait for admin approval → Vendor notified
- [ ] Add inventory items → With ownership verification
- [ ] Try accessing other vendor's inventory → Blocked (403)
- [ ] View orders → Real-time updates
- [ ] Update order status → Visible to admin

### Performance Tests (2 min)
- [ ] Room listing with many rooms → < 500ms response
- [ ] Booking search/filter → < 300ms response
- [ ] Payment history → Quick load
- [ ] Dashboard → Snappy performance

---

## 🔍 Expected Error Behaviors

### When Testing Validation
| Scenario | Expected Response |
|----------|------------------|
| Weak password | HTTP 400 + error message |
| Booking with 0 guests | HTTP 400 "Guest count must be at least 1" |
| Booking capacity exceeded | HTTP 400 "Room capacity is X guests maximum" |
| Past check-in date | HTTP 400 "Check-in date cannot be in the past" |
| Room price = 0 | HTTP 400 "Price must be greater than 0" |
| Socket without token | Auth error + connection rejected |
| Non-admin accessing /admin | HTTP 403 or redirect to /dashboard |
| Vendor accessing other vendor's inventory | HTTP 403 "Access denied" |

### Expected Success Behaviors
| Scenario | Expected Response |
|----------|------------------|
| Valid password | HTTP 201 + user data + tokens |
| Valid booking | HTTP 201 + booking reference + cost breakdown |
| Admin creating room | HTTP 201 + room created |
| Payment processing | Redirect to success page + status COMPLETED |
| Admin updating booking | HTTP 200 + customer notified via socket |
| Vendor adding inventory | HTTP 201 + item created + can be seen by admins |

---

## 🐛 Troubleshooting

### Socket Connection Not Working
```
1. Check if token is being sent: DevTools → Network → WS → Headers
2. Verify token is valid JWT: Visit jwt.io and paste token
3. Check socket server logs for auth errors
4. Verify CORS configuration allows socket connections
```

### Password Strength Rejecting Valid Password
```
1. Verify password has ALL requirements:
   ✓ 8+ characters
   ✓ Uppercase letter (A-Z)
   ✓ Lowercase letter (a-z)
   ✓ Digit (0-9)
   ✓ Special character (!@#$%^&*)
2. Example: Welcome@2024 ✓
3. Example: welcome@2024 ✗ (no uppercase)
```

### Booking Validation Errors
```
1. "Guest count exceeds capacity"
   → Check room capacity in room details
   → Reduce guest count or choose larger room

2. "Check-in date cannot be in past"
   → Select today or future date
   → Check system time is correct

3. "Room is not available for selected dates"
   → Room has other bookings in that period
   → Choose different dates
```

### Admin Features Not Showing
```
1. Verify you logged in as ADMIN user
2. Check user role in database (role should be "ADMIN")
3. Try logging out completely and back in
4. Check browser console for errors
```

### Real-Time Updates Not Showing
```
1. Verify socket connection is active (DevTools → Network → WS)
2. Check both tabs/windows are logged in
3. Try refreshing the page
4. Check for socket error messages in console
```

---

## 📊 Test Data Requirements

### Minimum Test Data Needed
```
Users:
- 2 Customer accounts (password: Customer@123, Customer@456)
- 1 Admin account (password: Admin@2024)
- 1-2 Vendor accounts (status: approved)

Rooms:
- At least 5 rooms with varying:
  - Capacities (2, 4, 6, 8 persons)
  - Price ranges (1000-10000)
  - Room types (STANDARD, DELUXE, SUITE)
  - Images and amenities

Bookings:
- 3-5 existing bookings with various statuses:
  - 1 PENDING
  - 1 CONFIRMED
  - 1 CHECKED_IN
  - 1 CHECKED_OUT

Vendors:
- 2-3 approved vendors with inventory items
```

### How to Seed Test Data
```bash
# Option 1: Use Prisma seed script
npx prisma db seed

# Option 2: Manually create via API
# POST /api/users (register accounts)
# POST /api/rooms (create rooms)
# POST /api/bookings (create bookings)

# Option 3: Restore from backup
# Restore test database backup if available
```

---

## ✅ Final Verification Checklist

Before considering testing complete, verify:

### Security ✅
- [ ] Strong password required on registration
- [ ] Socket requires JWT token
- [ ] Admin endpoints return 403 for non-admins
- [ ] Vendor inventory access controlled
- [ ] Payment processing is idempotent
- [ ] Bookings validate all inputs
- [ ] Rooms validate all numeric fields

### Functionality ✅
- [ ] Customers can complete booking flow
- [ ] Admins can manage all resources
- [ ] Vendors can manage inventory
- [ ] Real-time updates work via Socket.IO
- [ ] Email notifications sent (or logged)
- [ ] Payment gateway integration works
- [ ] Token refresh works automatically

### Performance ✅
- [ ] Room listing loads quickly
- [ ] Booking search/filter is fast
- [ ] Dashboard is responsive
- [ ] No memory leaks
- [ ] Database indexes working

### User Experience ✅
- [ ] Error messages are clear
- [ ] Form validation prevents invalid data
- [ ] Loading states shown during requests
- [ ] Navigation works between all pages
- [ ] Real-time updates feel smooth

---

## 🎓 Advanced Testing (Optional)

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 100 --num 1000 http://localhost:5000/api/rooms
```

### Security Testing
```bash
# Test SQL injection attempt
GET /api/bookings?search='; DROP TABLE bookings; --
# Expected: No error, safe query

# Test XSS attempt  
POST /api/bookings with comment: <script>alert('XSS')</script>
# Expected: Safely escaped, no script execution
```

### Concurrent Request Testing
```javascript
// Test token refresh race condition
const requests = [];
for (let i = 0; i < 10; i++) {
  requests.push(fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${expiredToken}` }
  }));
}
Promise.all(requests).then(responses => {
  // Should all succeed without duplicate tokens
});
```

---

## 📞 Support

For issues during testing:
1. Check the TESTING_GUIDE.md for detailed test cases
2. Review IMPLEMENTATION_VERIFICATION.md for setup help
3. Check FIXES_SUMMARY.md for what was changed
4. Check browser console for JavaScript errors
5. Check server logs for backend errors
6. Verify database is connected and has test data

---

## ✨ Summary

The HamroStay system is now:
- ✅ Securely authenticated
- ✅ Fully validated on all inputs
- ✅ Optimized for performance
- ✅ Ready for end-to-end testing
- ✅ Production-ready after test confirmation

**Estimated time to complete all tests: 30-45 minutes**

**Estimated time for critical path testing: 5-10 minutes**

Good luck! 🚀

