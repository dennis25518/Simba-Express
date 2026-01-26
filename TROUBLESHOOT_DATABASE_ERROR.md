# 🔍 Troubleshooting "Kosa katika kuhifadhi habari" Error

## What This Error Means
This error occurs when the registration form successfully creates an auth user but **fails to save the profile information to the database**.

---

## 🧪 Diagnostic Steps

### Step 1: Check Browser Console for Details
```
1. Open app in browser
2. Press F12 to open Developer Tools
3. Go to "Console" tab
4. Try registering again
5. Look for error message with details
6. Copy the error message
```

You should now see more detailed error information including:
- Error message
- Error code (e.g., "42P01" for missing table)
- Additional hints

---

## Common Causes & Solutions

### ❌ **Cause 1: Missing `user_profiles` Table**

**Error message**: "relation 'public.user_profiles' does not exist"

**Solution**: Create the table in Supabase
```sql
CREATE TABLE public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  fullname VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  location VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  profile_picture_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**How to run SQL in Supabase**:
1. Go to Supabase Dashboard
2. Click your project
3. Click "SQL Editor" (left sidebar)
4. Click "New query"
5. Copy the SQL above
6. Click "Run"
7. Should see "Completed"

---

### ❌ **Cause 2: RLS Policies Blocking Insert**

**Error message**: "new row violates row level security policy"

**Solution**: Disable RLS temporarily (or create proper policy)

**Option A: Disable RLS (Quick Fix)**
```
1. Supabase Dashboard → Your Project
2. Click "Authentication" (left sidebar)
3. Click "Policies" 
4. Find table: "user_profiles"
5. Toggle "Enable RLS" OFF
6. Click "Save"
```

**Option B: Create Proper RLS Policy (Better)**
```sql
-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

---

### ❌ **Cause 3: Wrong Column Names**

**Error message**: "column 'fullname' does not exist"

**Solution**: Check table structure matches code

**Code expects these columns**:
```
user_id
fullname
phone
email
location
latitude
longitude
profile_picture_url
created_at
```

**To check your table**:
1. Supabase Dashboard
2. Click "Tables" (left sidebar)
3. Click "user_profiles"
4. Check columns match above list

---

### ❌ **Cause 4: Wrong Data Types**

**Error message**: "value too long for type character varying(20)"

**Solution**: Verify column types

**Correct types**:
```
user_id → UUID
fullname → TEXT or VARCHAR(255)
phone → TEXT or VARCHAR(20)
email → TEXT or VARCHAR(255)
location → TEXT or VARCHAR(255)
latitude → NUMERIC/DECIMAL
longitude → NUMERIC/DECIMAL
profile_picture_url → TEXT or VARCHAR(500)
created_at → TIMESTAMP
```

---

### ❌ **Cause 5: Foreign Key Constraint**

**Error message**: "insert or update on table 'user_profiles' violates foreign key"

**Solution**: Ensure auth user exists

This usually means:
- User created in auth BUT profile save failed on first try
- Try registering with different email
- OR check if user_id references auth.users correctly

---

### ❌ **Cause 6: Supabase Credentials Wrong**

**Error message**: "Invalid API key"

**Solution**: Check credentials in index.html

```
Lines 509-510 in index.html:
const SUPABASE_URL = 'https://[YOUR_PROJECT].supabase.co';
const SUPABASE_ANON_KEY = 'sb_...[YOUR_KEY]...';
```

**To get correct credentials**:
1. Go to Supabase Dashboard
2. Click your project
3. Click "Settings" (left sidebar)
4. Click "API"
5. Copy URL and anon key
6. Update index.html lines 509-510

---

## 🔧 Quick Fix Checklist

Try these in order:

- [ ] **Step 1**: Check browser console (F12) for detailed error
- [ ] **Step 2**: Verify `user_profiles` table exists
- [ ] **Step 3**: Check table has all required columns
- [ ] **Step 4**: Disable RLS on `user_profiles` table
- [ ] **Step 5**: Verify Supabase credentials in index.html
- [ ] **Step 6**: Try registering with a different email

---

## 🧪 Test Query in Supabase

To verify your table works, run this in SQL Editor:

```sql
-- Check if table exists
SELECT * FROM public.user_profiles LIMIT 1;

-- Check column names
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles';

-- Try inserting test data
INSERT INTO public.user_profiles (
  user_id,
  fullname,
  phone,
  email,
  location,
  latitude,
  longitude,
  profile_picture_url,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Test User',
  '+255123456789',
  'test@example.com',
  'Dar es Salaam',
  -6.7924,
  39.2083,
  null,
  NOW()
);
```

If insert works, your table is correct!

---

## 📊 Most Likely Culprit

Based on common issues:

**70% chance**: Missing or disabled RLS policy
**20% chance**: Missing `user_profiles` table
**7% chance**: Wrong column names/types
**3% chance**: Supabase credentials

---

## 🔍 Advanced Debugging

### Enable Full Error Logging

Add this to see exactly what's being sent:

```javascript
// Before registerUser() insert, add:
console.log('Attempting to insert:', {
    user_id: data.user.id,
    fullname: fullname,
    phone: phone,
    email: email,
    location: location,
    latitude: latitude || null,
    longitude: longitude || null,
    profile_picture_url: profilePictureUrl,
    created_at: new Date()
});
```

---

## 📞 Still Stuck?

### Information to Collect

Before asking for help, gather:
1. Exact error message from browser console (F12)
2. Screenshot of Supabase table structure
3. Screenshot of RLS policies
4. Your Supabase project URL (first part only, e.g., `cmsqvcqddnefquxzchxy`)

---

## ✅ Success Indicator

When fixed, you should see:
```
✅ "Mjumbe akusanywa kwa mafanikio! Tafadhali kagua barua pepe yako kwa ujumbe wa kubaini."
(Registration successful! Please check your email for verification)
```

---

## 🎯 Next Steps After Fix

Once registration works:
1. Create `profile_pictures` storage bucket
2. Test profile picture upload
3. Verify picture displays in navbar
4. Configure email confirmation redirect (optional)

---

**Need help?** Check the detailed error message in browser console (F12) first!
