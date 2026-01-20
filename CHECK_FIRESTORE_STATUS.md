# ✅ Check if Firestore API is Enabled

## How to Verify:

1. **Go to this link:**
   ```
   https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=bloomnet-c79e1
   ```

2. **Check the button:**
   - If you see **"ENABLE"** button → API is NOT enabled yet
   - If you see **"MANAGE"** button → API IS enabled! ✅

3. **If it shows "MANAGE":**
   - The API is enabled
   - But it might still be activating (takes 3-5 minutes)
   - Wait a few more minutes, then refresh your page

## Common Issues:

### Issue 1: Billing Not Enabled
- Firestore requires billing to be enabled (even for free tier)
- Go to: https://console.cloud.google.com/billing
- Make sure billing is enabled for your project

### Issue 2: API Still Activating
- After clicking "ENABLE", it takes 3-5 minutes to fully activate
- Be patient and wait, then refresh

### Issue 3: Wrong Project
- Make sure you're in the "bloomnet-c79e1" project
- Check the project dropdown at the top

## Quick Test:

After enabling and waiting:
1. Refresh your BloomNet page
2. Open console (F12)
3. Look for "✅ Firebase initialized successfully!"
4. Try clicking "I'm a Donor" again

If you still see errors, check the console for the exact error message.


