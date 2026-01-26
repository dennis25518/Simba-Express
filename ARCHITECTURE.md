# 🏗️ System Architecture & Flow Diagrams

## Overall Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SIMBA EXPRESS FRONTEND                   │
│                     (Your Website - HTML)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ (HTTPS)
                              │
                ┌─────────────┴──────────────┐
                │                            │
         ┌──────▼────────┐          ┌────────▼──────┐
         │   SUPABASE    │          │   WHATSAPP    │
         │   BACKEND     │          │   (LEGACY)    │
         │   (Database)  │          │   (Optional)  │
         └──────────────┘          └───────────────┘
```

---

## Authentication Flow

### Step 1: User Registration

```
User Enters:
├── Fullname
├── Phone
├── Email
├── Password
├── Location
├── GPS (optional)
└── Photo (optional)

                ↓

         Frontend Validates
         All Fields Required

                ↓

    supabaseClient.auth.signUp({
       email: email,
       password: password
    })

                ↓

    ┌──────────────────────┐
    │ SUPABASE AUTH SERVER │
    │ (Hashes password)    │
    └──────────────────────┘

                ↓

    Saves to user_profiles table:
    {
       user_id: (auto generated),
       fullname: user input,
       phone: user input,
       email: user input,
       location: user input,
       latitude: GPS data,
       longitude: GPS data
    }

                ↓

    User Receives Confirmation Email

                ↓

    Redirects to Login Modal
```

### Step 2: User Login

```
User Enters:
├── Email
└── Password

        ↓

supabaseClient.auth.signInWithPassword({
   email: email,
   password: password
})

        ↓

┌──────────────────────────┐
│ SUPABASE AUTH SERVER     │
│ (Verifies Credentials)   │
└──────────────────────────┘

        ↓

  Password Correct?
   │           │
   YES         NO
   │           │
   ▼           ▼
CREATE JWT  ERROR
TOKEN       MESSAGE

        ↓

currentUser = user object
Session stored in browser

        ↓

Update UI:
├── Show User Email in Menu
├── Show Profile Button
└── Show Logout Button
```

### Step 3: Session Check (On Page Load)

```
Browser Opens Website
       ↓
checkUserSession()
       ↓
supabaseClient.auth.getSession()
       ↓
   ┌───────────────────┐
   │ Session exists?   │
   └───────────────────┘
    │                 │
   YES                NO
    │                 │
    ▼                 ▼
  Set         Show Login
  currentUser Buttons
    │                 │
    └────────┬────────┘
             │
      Render Products
             │
         Ready to Use
```

---

## Checkout Flow

### Flow A: Registered User

```
┌─────────────────────────────────┐
│ User Is Logged In               │
│ (currentUser != null)           │
└─────────────────────────────────┘
           │
           ├─ Add Items to Cart
           │
           └─ Click "Tazama Oda"
                 │
                 ▼
         ┌──────────────────┐
         │  CART MODAL      │
         │  Shows Items     │
         │  Subtotal        │
         │  Delivery Fee    │
         │  TOTAL           │
         └──────────────────┘
                 │
                 ├─ [✅ Thibitisha Oda]
                 │     (SUPABASE BUTTON)
                 │
                 └─ submitOrderToSupabase()
                       │
                       ▼
               ┌────────────────────┐
               │ Collect Order Data │
               │ ├─ user_id         │
               │ ├─ order_items     │
               │ ├─ subtotal        │
               │ ├─ delivery_fee    │
               │ └─ total_amount    │
               └────────────────────┘
                       │
                       ▼
      supabaseClient.from('orders').insert()
                       │
                       ▼
         ┌──────────────────────────┐
         │   SUPABASE INSERTS       │
         │   Order into database    │
         └──────────────────────────┘
                       │
                       ▼
              Success Notification
                "✅ Oda Imepokelewa!"
                       │
                       ▼
              Clear Cart & Close Modal
```

### Flow B: Guest User

```
┌─────────────────────────────────┐
│ User Not Logged In              │
│ (currentUser == null)           │
└─────────────────────────────────┘
           │
           ├─ Add Items to Cart
           │
           └─ Click "Tazama Oda"
                 │
                 ▼
         ┌──────────────────┐
         │  CART MODAL      │
         │  Option 1:       │
         │ [🔓 Login/Jisajili]
         │  Option 2:       │
         │ [Manual Entry]   │
         │ - Phone          │
         │ - Name           │
         │ - Location       │
         └──────────────────┘
                 │
       ┌─────────┴──────────┐
       │                    │
   [Login]         [WhatsApp]
       │                    │
       ▼                    ▼
  Go to Login         sendWhatsApp()
  Modal                   │
                          ▼
                  window.location.href =
                 `https://wa.me/...?text=${msg}`
                          │
                          ▼
                   Opens WhatsApp
                   with Message
```

---

## Database Schema Diagram

### user_profiles Table

```
┌──────────────────────────────────────────┐
│           USER_PROFILES TABLE            │
├──────────────────────────────────────────┤
│ id          | BIGSERIAL (Primary Key)    │
│ user_id     | UUID (FK to auth.users)    │
│ fullname    | TEXT                       │
│ phone       | TEXT                       │
│ email       | TEXT                       │
│ location    | TEXT                       │
│ latitude    | DECIMAL(10,8)              │
│ longitude   | DECIMAL(11,8)              │
│ created_at  | TIMESTAMP                  │
│ updated_at  | TIMESTAMP                  │
└──────────────────────────────────────────┘

Example Record:
{
  "id": 1,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "fullname": "Juma Ahmed",
  "phone": "255754123456",
  "email": "juma@example.com",
  "location": "Kariakoo, Dar",
  "latitude": -6.792439,
  "longitude": 39.208328,
  "created_at": "2024-01-26T10:30:00Z"
}
```

### orders Table

```
┌──────────────────────────────────────────────┐
│            ORDERS TABLE                      │
├──────────────────────────────────────────────┤
│ id              | BIGSERIAL (Primary Key)    │
│ user_id         | UUID (FK to auth.users)    │
│ user_email      | TEXT                       │
│ order_items     | JSONB (Array)              │
│ subtotal        | BIGINT                     │
│ delivery_fee    | BIGINT                     │
│ total_amount    | BIGINT                     │
│ order_status    | TEXT (pending/confirmed)   │
│ created_at      | TIMESTAMP                  │
│ updated_at      | TIMESTAMP                  │
└──────────────────────────────────────────────┘

Example Record:
{
  "id": 1,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_email": "juma@example.com",
  "order_items": [
    {
      "product_id": "Az-01",
      "product_name": "Azam Cola",
      "quantity": 2,
      "unit_price": 9400,
      "total_price": 18800
    }
  ],
  "subtotal": 18800,
  "delivery_fee": 5000,
  "total_amount": 23800,
  "order_status": "pending",
  "created_at": "2024-01-26T14:45:30Z"
}
```

---

## State Management

### Global Variables

```javascript
currentUser = {
  id: "uuid",
  email: "user@example.com",
  created_at: "timestamp"
} // OR null if not logged in

cart = [
  {
    id: "product-id",
    name: "Product Name",
    price: 10000,
    qty: 2,
    // ... other product fields
  }
] // Array of items

expandedSections = {
  nafaka: false,
  vinywaji: false,
  mengineyo: false
} // For expand/collapse sections
```

---

## Component Interaction Diagram

```
┌─────────────────────────────────────────────┐
│         NAVBAR (Header)                     │
│  [LOGO]  [BUTTONS]  [👤 USER ICON]         │
└─────────────────────────────────────────────┘
                  │
         ┌────────┴─────────┐
         │                  │
    [User Menu]    [Modals Container]
         │          │
         │      ┌───┼──────────────┐
         │      │   │              │
         │      │   ▼              ▼
         │      │ Register Modal   Login Modal
         │      │ [Form]          [Form]
         │      │                 
         │      └────┬────────────┘
         │           │
         ▼           ▼
    ┌─────────────────────────────────┐
    │     PRODUCTS SECTION            │
    │  [Search] [Categories]          │
    │  [Product Grid]                 │
    │  [Expand Buttons]               │
    └─────────────────────────────────┘
         │
         └─→ Click Product
             │
             ▼
         ┌──────────────┐
         │ Product Modal│
         │ [Image]      │
         │ [Details]    │
         │ [+/-] [Add]  │
         └──────────────┘
             │
             └─→ Add to Cart
                 │
                 ▼
         ┌──────────────────┐
         │ CART TRIGGER     │
         │ [Tazama Oda]     │
         │ Badge with count │
         └──────────────────┘
             │
             └─→ Click
                 │
                 ▼
         ┌──────────────────────┐
         │   CART MODAL         │
         │ [Items List]         │
         │ [Order Summary]      │
         │ [Checkout Options]   │
         │ Supabase / WhatsApp  │
         └──────────────────────┘
```

---

## API Flow Diagram

```
Frontend (JavaScript)
        │
        ├─ supabaseClient.auth.signUp()
        │  ↓
        │  ┌────────────────────────────┐
        │  │ Supabase Auth API          │
        │  │ (Create user, hash password)
        │  └────────────────────────────┘
        │  ↓
        │  JWT Token Returned
        │
        ├─ supabaseClient.from('user_profiles').insert()
        │  ↓
        │  ┌────────────────────────────┐
        │  │ Supabase Realtime API      │
        │  │ (Insert user profile)      │
        │  └────────────────────────────┘
        │  ↓
        │  Row Inserted
        │
        └─ supabaseClient.from('orders').insert()
           ↓
           ┌────────────────────────────┐
           │ Supabase Realtime API      │
           │ (Insert order)             │
           └────────────────────────────┘
           ↓
           Row Inserted + Returned
```

---

## GPS Location Flow

```
User Clicks "📍 Pata Mahali Yangu"
        │
        ▼
navigator.geolocation.getCurrentPosition()
        │
        ├─ If Allowed
        │  ↓
        │  Browser requests device location
        │  ↓
        │  Device sends GPS coordinates
        │  ↓
        │  ✅ Latitude & Longitude received
        │  ↓
        │  Store in input fields
        │  ├─ #reg-latitude
        │  └─ #reg-longitude
        │  ↓
        │  Display: "✅ Mahali pimwa: -6.7924, 39.2083"
        │
        └─ If Denied/Error
           ↓
           Show error message:
           "❌ Mahali haisupporti simu yako."
```

---

## Error Handling Flow

```
Any Operation
        │
        ├─ Try to Execute
        │
        ├─ Check for Errors
        │
        ├─ If Error:
        │  ├─ Log to console (for debugging)
        │  ├─ Show user-friendly message
        │  └─ Suggest solution
        │
        └─ If Success:
           └─ Update UI & show confirmation
```

Example:
```javascript
try {
  const { data, error } = await supabaseClient.auth.signUp()
  
  if (error) {
    // Error occurred
    alert('Hitilafu: ' + error.message)
    console.error(error)
    return  // Stop execution
  }
  
  // Success - continue
  alert('Mjumbe akusanywa kwa mafanikio!')
  
} catch (error) {
  // Unexpected error
  console.error('Unexpected error:', error)
  alert('Kosa lisilo linatarajiwa')
}
```

---

## Mobile Responsiveness

```
Desktop (≥1024px)        Tablet (768-1023px)      Mobile (<768px)
┌─────────────────┐     ┌─────────────────┐     ┌────────────┐
│ [LOGO] [BTNS] │     │ [LOGO] [BTNS] │     │[LOGO][👤]  │
│ [👤]           │     │ [👤]           │     │ Hamburger │
└─────────────────┘     └─────────────────┘     └────────────┘
     │                       │                       │
     ▼                       ▼                       ▼
Products: 5 cols        Products: 3 cols        Products: 2 cols
     │                       │                       │
     ▼                       ▼                       ▼
Forms: Full width       Forms: 85% width        Forms: 90% width
     │                       │                       │
     ▼                       ▼                       ▼
All responsive touchpoints adjusted for device
```

---

This diagram set helps visualize how all components work together!
