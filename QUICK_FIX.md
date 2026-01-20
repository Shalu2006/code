# 🚨 QUICK FIX - Authentication Error

## The Error You're Seeing:
**"Login failed: Firebase: Error (auth/configuration-not-found)"**

This means **Firebase Authentication is not enabled** in your Firebase Console.

## ✅ Fix It in 2 Minutes:

### Step 1: Enable Authentication
1. Go to: **https://console.firebase.google.com/**
2. Click on your **"BloomNet"** project (or search for `bloomnet-c79e1`)
3. In the left sidebar, click **"Build"** → **"Authentication"**
4. Click **"Get started"** button (if you see it)
5. Click on the **"Sign-in method"** tab at the top
6. Find **"Google"** in the list and click on it
7. Toggle the **"Enable"** switch to **ON** ✅
8. Enter a **Project support email** (your email is fine)
9. Click **"Save"**

### Step 2: Enable Firestore (if not done)
1. In Firebase Console, click **"Build"** → **"Firestore Database"**
2. Click **"Create database"** (if you haven't)
3. Select **"Start in test mode"**
4. Choose a location (e.g., `asia-south1` for India)
5. Click **"Enable"**

### Step 3: Refresh Your Page
- Press **Ctrl + R** or **F5** to refresh
- Try clicking **"Sign In with Google"** again

## ✅ That's It!

After enabling Authentication, the login should work perfectly!

---

**Still not working?**
- Check browser console (F12) for any other errors
- Make sure you're using the correct Firebase project
- Try clearing browser cache (Ctrl + Shift + Delete)

