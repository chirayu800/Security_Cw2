# 🔧 Login Issue Fix Guide

## Problem
After registering a new user, when trying to login with correct credentials, you're getting a brute force error message showing "9 attempts remaining" instead of successfully logging in.

## Root Cause
The issue is likely caused by:
1. **Email Encryption**: When you register, the email gets encrypted. The login might be failing to find the user due to encryption key issues.
2. **Frontend Brute Force Counter**: The frontend tracks failed attempts in localStorage. If login fails (even once), it shows the warning.

## Quick Fix

### Step 1: Clear Browser localStorage
1. Open browser Developer Tools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click on **Local Storage** → Your website URL
4. Delete the `loginLockout` key
5. Try logging in again

### Step 2: Check Encryption Key
Make sure you have `ENCRYPTION_KEY` set in your `.env` file:

```env
ENCRYPTION_KEY=your-32-plus-character-encryption-key-here
```

**Generate a key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Check Backend Console
When you try to login, check your backend console. You should see:
```
=== LOGIN ATTEMPT ===
Email: your@email.com
User found: Yes/No
Password correct: true/false
```

This will help identify if:
- User is being found
- Password comparison is working

## Debugging Steps

### 1. Check if User Exists in Database
- Open MongoDB Compass or Atlas
- Check if the user was created
- Verify the email field (it should be encrypted if encryption is working)

### 2. Test Login API Directly
Use Postman or curl to test:

```bash
POST http://localhost:4000/api/user/login
Content-Type: application/json

{
  "email": "your@email.com",
  "password": "yourpassword"
}
```

Check the response - if it returns `success: false`, check the error message.

### 3. Check Browser Console
Open browser console (F12) and check for:
- Network errors
- JavaScript errors
- API response errors

## Common Issues & Solutions

### Issue 1: "User not found"
**Cause**: Email encryption key mismatch or user not in database

**Solution**:
- Verify user exists in database
- Check `ENCRYPTION_KEY` is set correctly
- Try registering again

### Issue 2: "Invalid email or password" (but password is correct)
**Cause**: Password hash mismatch or encryption issue

**Solution**:
- Check backend console logs
- Verify password was hashed correctly during registration
- Try resetting password

### Issue 3: Frontend shows "attempts remaining"
**Cause**: Previous failed login attempts stored in localStorage

**Solution**:
- Clear `loginLockout` from localStorage
- Or clear all browser data for the site

## Temporary Workaround

If you need to login immediately:

1. **Clear localStorage:**
   ```javascript
   // In browser console (F12)
   localStorage.removeItem('loginLockout');
   ```

2. **Or disable encryption temporarily:**
   - Comment out encryption hooks in `backend/models/userModel.js`
   - Restart server
   - Try login
   - Re-enable encryption after testing

## Permanent Fix

The code has been updated to:
1. ✅ Clear lockout data on successful registration
2. ✅ Add better error logging
3. ✅ Improve encryption/decryption handling
4. ✅ Better error messages

**After the fix:**
- Registration should work and clear any lockout
- Login should work with correct credentials
- Failed attempts will only count actual failures

## Test After Fix

1. **Clear browser data** (or use incognito)
2. **Register a new user**
3. **Login immediately** with the same credentials
4. **Should redirect to dashboard** ✅

If it still doesn't work, check:
- Backend console for error messages
- Browser console for errors
- Network tab for API responses
