# 🔥 Firebase Setup Guide for BloomNet

## Step 1: Get Your Firebase Config

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Make sure you're logged in with your Google account

2. **Select Your Project**
   - Click on your "BloomNet" project (or create one if you haven't)

3. **Get Web App Config**
   - Click the ⚙️ **Settings** icon (gear icon) → **Project Settings**
   - Scroll down to the **"Your apps"** section
   - If you don't have a web app yet:
     - Click the **Web icon** (`</>`) 
     - Register your app (name it "BloomNet Web")
     - Click **Register app**
   - You'll see a code snippet that looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "bloomnet-xxxxx.firebaseapp.com",
     projectId: "bloomnet-xxxxx",
     storageBucket: "bloomnet-xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

4. **Copy the Config**
   - Copy the entire `firebaseConfig` object

5. **Paste in Your Code**
   - Open `index.html` in your editor
   - Find lines 153-160 (the firebaseConfig object)
   - Replace the placeholder values with your actual config
   - Save the file

## Step 2: Enable Authentication

1. **Go to Authentication**
   - In Firebase Console, click **Build** → **Authentication**
   - Click **Get started**

2. **Enable Google Sign-In**
   - Click on **Sign-in method** tab
   - Click on **Google**
   - Toggle **Enable**
   - Enter a project support email
   - Click **Save**

## Step 3: Enable Firestore Database

1. **Go to Firestore Database**
   - In Firebase Console, click **Build** → **Firestore Database**
   - Click **Create database**

2. **Choose Mode**
   - Select **Start in test mode** (for hackathon/demo)
   - Click **Next**

3. **Choose Location**
   - Select a location close to you (e.g., `asia-south1` for India)
   - Click **Enable**

## Step 4: Add Authorized Domain (if needed)

If you're testing on `localhost` or a custom domain:

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add your domain (localhost is usually already there)
3. If deploying, add your production domain

## Step 5: Test It!

1. **Refresh your page**
2. **Click "Sign In with Google"**
3. **It should work!** 🎉

## Troubleshooting

- **"Firebase is not configured"**: Make sure you pasted the config correctly in index.html
- **"Unauthorized domain"**: Add your domain in Firebase Console → Authentication → Settings
- **"Permission denied"**: Make sure Firestore is in test mode or update security rules
- **Still not working?**: Check browser console (F12) for error messages

## Quick Checklist

- [ ] Firebase config pasted in index.html
- [ ] Google Authentication enabled
- [ ] Firestore Database created (test mode)
- [ ] Page refreshed
- [ ] Browser console checked for errors

---

**Need Help?** Check the browser console (F12) for detailed error messages!

