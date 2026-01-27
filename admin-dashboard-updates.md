# Admin & Merchant Dashboard Updates

## Phase 2: Order Polling & Real-time Updates

### What's Being Implemented

#### 1. Admin Dashboard - Order Polling (Every 30 seconds)
- Fetch pending orders from Simba Express orders table
- Display new orders with customer info (name, phone, location)
- Show order status: pending → sent_to_merchant → in_transit → delivered
- Manual intervention section for unmatched orders
- Real-time badge that shows "New Orders" count

#### 2. Merchant Matching Engine - Updated
- Use GPS coordinates (latitude/longitude) instead of text addresses
- Find merchants within 5km radius of delivery location
- Check merchant inventory for required products
- Auto-assign order to closest merchant with inventory
- If no match found → flag as "manual_required"

#### 3. Merchant Dashboard - Real-time Order Notifications
- Listen for orders assigned to this merchant
- Display incoming orders with customer info
- Show "Accept Order" or "Defer" buttons
- Allow merchant to update order status (accepted → processing → ready_for_pickup → picked_up)
- Real-time badge showing new orders count

### Database Schema Used
```sql
orders table:
- id (UUID)
- user_id (UUID) - customer's user ID
- user_email (TEXT)
- customer_name (TEXT) ✅ NEW
- customer_phone (TEXT) ✅ NEW
- delivery_latitude (NUMERIC) ✅ NEW - GPS latitude
- delivery_longitude (NUMERIC) ✅ NEW - GPS longitude
- order_items (JSONB) - array of products
- subtotal, delivery_fee, total_amount
- order_status (TEXT) - pending|sent_to_merchant|in_transit|delivered
- assigned_merchant_id (UUID) - which merchant has this order
- created_at (TIMESTAMP)
```

### Implementation Strategy

**Step 1:** Update admin-dash.html
- Add setInterval() to poll orders table every 30 seconds
- Query orders WHERE order_status = 'pending'
- For each pending order, run matchmaker engine
- Update order status to 'sent_to_merchant' if match found
- Keep order status as 'pending' with error note if no match

**Step 2:** Update matchmaker-logic.js
- Add GPS distance calculation function
- Query merchants within 5km radius using lat/lng
- Check if merchant has inventory for ordered items
- Return matched merchant or throw error

**Step 3:** Update merchant-dash.html
- Add Supabase real-time subscription for this merchant's orders
- Listen for changes to orders WHERE assigned_merchant_id = current_merchant
- Display new orders with "Accept" button
- Show processing steps: accepted → packing → ready → picked_up

### Next: File Updates
Will create enhanced versions of:
1. admin-dash.html (add polling + order display)
2. matchmaker-logic.js (GPS-based matching)
3. merchant-dash.html (real-time order listener)
