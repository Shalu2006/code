# 🔥 CRITICAL: Enable Firestore API

## The Error You're Seeing:
```
Cloud Firestore API has not been used in project bloomnet-c79e1 before or it is disabled.
```

## ✅ QUICK FIX (2 minutes):

### Step 1: Enable Firestore API
1. **Click this link** (or copy-paste it):
   ```
   https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=bloomnet-c79e1
   ```

2. **Or manually:**
   - Go to: https://console.cloud.google.com/
   - Make sure you're in the **"bloomnet-c79e1"** project (check top dropdown)
   - Go to **"APIs & Services"** → **"Library"**
   - Search for **"Cloud Firestore API"**
   - Click on it
   - Click **"Enable"** button

### Step 2: Wait a Few Minutes
- After enabling, wait 2-3 minutes for it to propagate
- The API needs to activate across Google's systems

### Step 3: Refresh Your Page
- Press **Ctrl + R** or **F5**
- Try clicking "I'm a Donor" again

## ✅ That's It!

After enabling the Firestore API, everything should work!

---

**Note:** This is different from creating the Firestore Database. You need BOTH:
1. ✅ Firestore Database created (you probably did this)
2. ❌ Firestore API enabled (this is what's missing!)


