# 🔧 Troubleshooting "Failed to Fetch" Error

## Problem
Your deployed app shows "Failed to fetch" error on the Sign In page.

---

## ✅ Solution Checklist

### 1. **Check Environment Variables in Vercel** (MOST COMMON ISSUE)

1. Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Verify ALL these variables exist:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
VITE_APP_NAME=Manasatchi AI
VITE_APP_VERSION=1.0.0
VITE_ENABLE_VOICE_CLONING=true
VITE_ENABLE_TRANSLATION=true
VITE_ENABLE_SPEECH_TO_TEXT=true
```

**Get your actual values from**: `ideation-portal/ENVIRONMENT-VARIABLES-SECURE.txt` (NOT committed to git)

⚠️ **CRITICAL**: After adding variables, you MUST click **"Redeploy"** in Vercel dashboard!

**How to Redeploy:**
1. Go to Deployments tab
2. Click the "..." menu on latest deployment
3. Click "Redeploy"
4. Wait 2-3 minutes for build to complete

---

### 2. **Configure Supabase URL Settings** (REQUIRED)

Your Supabase project needs to know which domains are allowed to access it:

1. Go to: https://app.supabase.com/project/kwbueaynvjuvkfxzkiuf/auth/url-configuration

2. **Set Site URL** to your Vercel deployment URL:
   ```
   https://your-app-name.vercel.app
   ```
   Replace `your-app-name` with your actual Vercel app name

3. **Add Redirect URLs** (click "Add URL" for each):
   ```
   https://your-app-name.vercel.app/**
   https://your-app-name.vercel.app/dashboard
   https://your-app-name.vercel.app/login
   https://your-app-name.vercel.app/register
   ```

4. Click **Save**

---

### 3. **Check Browser Console for Detailed Errors**

1. Open your deployed site
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Try to sign in again
5. Look for error messages like:
   - `CORS error` → Check Supabase URL configuration (Step 2)
   - `Failed to fetch` → Check environment variables (Step 1)
   - `undefined` for VITE_SUPABASE_URL → Environment variables not loaded (redeploy)

---

### 4. **Use the Diagnostic Tool**

The updated Login page now includes a diagnostic tool in the bottom-right corner that shows:
- ✅/❌ Environment Variables status
- ✅/❌ Supabase Connection status

This will help identify the exact issue.

---

## 🔍 Common Issues & Solutions

### Issue 1: "Environment variables not loading"
**Symptom**: Diagnostic shows environment variables missing
**Solution**: 
1. Double-check variable names start with `VITE_` (case-sensitive)
2. Redeploy after adding variables
3. Clear browser cache and try again

### Issue 2: "CORS error from Supabase"
**Symptom**: Console shows CORS policy error
**Solution**:
1. Add your Vercel URL to Supabase Site URL settings (Step 2 above)
2. Make sure URL includes `https://` prefix
3. Add wildcard path `/**` to redirect URLs

### Issue 3: "Invalid login credentials" but credentials are correct
**Symptom**: Login works locally but not in production
**Solution**:
1. Check if user was created in the same Supabase project
2. Verify you're using production Supabase URL, not a local/dev one
3. Try creating a new account in production

### Issue 4: "Page is blank or shows loading forever"
**Symptom**: Nothing appears or infinite loading
**Solution**:
1. Check Vercel deployment logs for build errors
2. Verify `vercel.json` exists in root directory
3. Check that `dist` folder is being generated during build

---

## 🚀 Quick Fix Steps (In Order)

1. **Add all environment variables to Vercel** ✅
2. **Redeploy from Vercel dashboard** ✅
3. **Configure Supabase Site URL** ✅
4. **Clear browser cache** ✅
5. **Test login again** ✅

---

## 📞 Still Not Working?

If you've tried all the steps above and still see the error:

1. **Check Vercel Build Logs**:
   - Go to Vercel → Deployments → Latest deployment
   - Click "View Build Logs"
   - Look for any errors during build

2. **Check Supabase Project Status**:
   - Go to: https://app.supabase.com/project/kwbueaynvjuvkfxzkiuf
   - Check if project is paused or has any issues

3. **Test Supabase Directly**:
   - Open browser console on your site
   - Run: `fetch('https://kwbueaynvjuvkfxzkiuf.supabase.co')`
   - If this fails, there's a network/DNS issue

4. **Check Network Tab**:
   - Open DevTools → Network tab
   - Try to sign in
   - Look for failed requests to Supabase
   - Check the request URL and response

---

## ✅ Verification Checklist

After applying fixes, verify:

- [ ] All environment variables are set in Vercel
- [ ] Vercel app has been redeployed after adding variables
- [ ] Supabase Site URL matches Vercel deployment URL
- [ ] Redirect URLs are configured in Supabase
- [ ] Browser cache is cleared
- [ ] Diagnostic tool shows all green checkmarks
- [ ] Console shows no errors
- [ ] Login page loads without "Failed to fetch" error

---

## 📝 Environment Variables Reference

**⚠️ IMPORTANT**: Get your actual API keys from `ENVIRONMENT-VARIABLES-SECURE.txt` file (NOT committed to git)

Copy these variable names into Vercel and fill in your actual values:

```bash
# === REQUIRED ===
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key

# === OPTIONAL ===
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key

# === APP CONFIG ===
VITE_APP_NAME=Manasatchi AI
VITE_APP_VERSION=1.0.0
VITE_ENABLE_VOICE_CLONING=true
VITE_ENABLE_TRANSLATION=true
VITE_ENABLE_SPEECH_TO_TEXT=true
```

---

**Last Updated**: Current session
**Status**: Diagnostic tool added, improved error messages implemented
