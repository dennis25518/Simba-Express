# Profile Picture Setup Guide

## Overview
Your Simba Express app now includes a complete profile picture feature that:
- ✅ Lets users upload profile pictures during registration
- ✅ Stores pictures in Supabase Storage
- ✅ Displays profile pictures in the navbar (replacing the 👤 icon)
- ✅ Shows profile picture in the user menu dropdown
- ✅ Loads profile pictures automatically on login/session check

## What's Been Done

### 1. **Database Table** (`user_profiles`)
Already created with this field:
```sql
profile_picture_url VARCHAR(500) -- Stores the public URL
```

### 2. **Registration Form**
Updated to include:
```html
<input type="file" id="reg-photo" accept="image/*" class="form-input">
```

### 3. **Code Functions Added**

#### `loadUserProfile()` 
- Fetches user profile from database
- Extracts profile picture URL
- Updates navbar icon with user's profile image
- Runs automatically on:
  - Page load (via `checkUserSession()`)
  - After login (via `loginUser()`)

#### `registerUser()`
- Now handles file upload
- Uploads image to Supabase Storage bucket: `profile_pictures`
- Saves the public URL to database
- Falls back gracefully if upload fails

#### `updateUserUI()`
- Displays profile picture in user menu dropdown
- Shows profile image in navbar button
- Falls back to 👤 icon if no picture available

## Required Supabase Configuration

### Step 1: Create Storage Bucket
1. Go to **Supabase Dashboard** → Your Project
2. Click **Storage** (left sidebar)
3. Click **Create a new bucket**
4. Name it: `profile_pictures`
5. **Public bucket**: Toggle **ON** (make it public so images display)
6. Click **Create bucket**

### Step 2: Enable RLS Policy (Optional)
If you want to restrict uploads to authenticated users:
1. Click on `profile_pictures` bucket
2. Go to **Policies** tab
3. Click **New Policy**
4. Choose **New Policy** → **For inserts**
   - Allow authenticated users to insert
   - Authenticated user ID = uid
5. Click **Save Policy**

### Step 3: Test Profile Picture Upload

#### Method A: Direct Registration
1. Open your app
2. Click **Jisajili** (Register)
3. Fill all fields including:
   - Jina Kamili (Full Name)
   - Nambari ya Simu (Phone)
   - Barua Pepe (Email)
   - Nenosiri (Password)
   - Mahali (Location) - Use "Get Location" button
   - **Picha ya Wasifu** - Upload a JPG/PNG image
4. Click **Register**
5. Confirm email via link
6. Login
7. **Check navbar** - Profile picture should now display ✅

#### Method B: Check via Supabase Console
1. Go to **Supabase Dashboard** → **Storage**
2. Click `profile_pictures` bucket
3. You should see uploaded images:
   ```
   {user_id}-{timestamp}.jpg
   ```

## Troubleshooting

### Profile Picture Not Showing

**Problem**: Image doesn't appear after registration
**Solutions**:
1. Check if `profile_pictures` bucket exists and is **PUBLIC**
2. Check browser console for errors (F12)
3. Verify profile picture URL in database:
   - Go to **Supabase** → **SQL Editor**
   - Run: `SELECT email, profile_picture_url FROM user_profiles;`
   - URL should look like: `https://[project].supabase.co/storage/v1/object/public/profile_pictures/...`

**Problem**: "Upload failed" message
**Solutions**:
1. File size - keep images under 5MB
2. File type - use JPG, PNG, or WebP
3. Bucket permissions - ensure bucket is PUBLIC

### Profile Picture Not Loading on Login

**Problem**: Picture shows during registration but disappears on login
**Solutions**:
1. Check if user_profiles table has the correct `profile_picture_url` entry
2. Verify Storage bucket URL format is correct
3. Check browser Network tab (F12) for 404 errors

## Features & UX

### Navbar Display
- **Logged Out**: Shows 👤 icon
- **Logged In Without Picture**: Shows 👤 icon
- **Logged In With Picture**: Shows circular profile image
  - Size: 32px diameter
  - Border: Red (#dc2626) 2px border
  - Shape: Rounded circle
  - Format: JPEG/PNG/WebP

### User Menu Dropdown
- Shows larger profile picture (48px) at top of menu
- Shows user email
- Shows "Wasifu" (Profile) button
- Shows "Toka" (Logout) button

### Email Confirmation
- After registration, user gets confirmation email
- Clicking link redirects to `email-confirmed.html`
- Shows success animation with countdown
- Auto-redirects to homepage after 3 seconds

## File Locations

### Main App
- **index.html** - Core application with all profile features
  - Line 596-618: `checkUserSession()` function
  - Line 616-640: `loadUserProfile()` function
  - Line 660-805: `registerUser()` with file upload
  - Line 807-838: `loginUser()` with profile loading
  - Line 662-697: `updateUserUI()` with profile picture display

### Email Confirmation Page
- **email-confirmed.html** - Redirect page after email verification
  - Shows success message
  - Counts down 3 seconds
  - Auto-redirects to homepage

## Database Schema

### user_profiles Table
```sql
user_id             UUID PRIMARY KEY
fullname            VARCHAR(255)
phone               VARCHAR(20)
email               VARCHAR(255)
location            VARCHAR(255)
latitude            DECIMAL(10, 8)
longitude           DECIMAL(11, 8)
profile_picture_url VARCHAR(500)  -- Image URL from Storage
created_at          TIMESTAMP
```

## Future Enhancements

Potential features to add later:
- [ ] Profile picture update/change functionality
- [ ] Image compression before upload
- [ ] Profile view page (showing user details)
- [ ] Multiple picture uploads
- [ ] Image filters/cropping
- [ ] Automatic image optimization

## Support

If you encounter issues:
1. Check Supabase Console for errors
2. Check browser console (F12) for JavaScript errors
3. Verify all Supabase credentials in index.html (lines 509-510)
4. Ensure email-confirmed.html is in root directory
5. Test with a simple JPG image (not corrupted)

---

**Version**: 1.0  
**Last Updated**: 2024  
**Status**: Ready for Production ✅
