# 🔧 Fix "Domain Not Authorized" Error

## The Problem:
You're seeing "Domain Not Authorized!" because `127.0.0.1` (your local IP) is not in Firebase's authorized domains list.

## ✅ Quick Fix (1 minute):

### Step 1: Go to Firebase Console
1. Open: **https://console.firebase.google.com/**
2. Click on your **"BloomNet"** project

### Step 2: Add Authorized Domain
1. Click **"Build"** → **"Authentication"** (left sidebar)
2. Click **"Settings"** tab (at the top)
3. Scroll down to **"Authorized domains"** section
4. You'll see domains like:
   - `localhost` (already there)
   - `your-project.firebaseapp.com`
   - `your-project.web.app`
5. Click **"Add domain"** button
6. Type: **`127.0.0.1`**
7. Click **"Add"** or **"Done"**

### Step 3: Also Add Port (if needed)
If you're using a specific port like `5500`, you might also need to add:
- `127.0.0.1:5500` (though usually just `127.0.0.1` is enough)

### Step 4: Refresh Your Page
- Press **Ctrl + R** or **F5**
- Try "Sign In with Google" again

## ✅ That's It!

After adding `127.0.0.1` to authorized domains, the login should work!

---

**Note:** `localhost` is usually already authorized, but `127.0.0.1` needs to be added manually for local development.

