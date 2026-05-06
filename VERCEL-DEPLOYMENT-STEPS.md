# 🚀 Deploy Manasatchi AI to Vercel

## ✅ Code Successfully Pushed to GitHub!

Your code is now at: https://github.com/Sharumathi-p/ProjectKALAM

## Next Steps: Deploy to Vercel

### Step 1: Go to Vercel

1. Open: https://vercel.com/new
2. Sign in with your GitHub account (if not already signed in)

### Step 2: Import Your Repository

1. Click **"Import Git Repository"**
2. Find **"Sharumathi-p/ProjectKALAM"** in the list
3. Click **"Import"**

### Step 3: Configure Project

Vercel will auto-detect the settings:
- **Framework Preset**: Vite ✅ (auto-detected)
- **Build Command**: `npm run build` ✅ (auto-detected)
- **Output Directory**: `dist` ✅ (auto-detected)

### Step 4: Add Environment Variables

**CRITICAL**: Click **"Environment Variables"** and add these:

```bash
# Supabase (Required)
VITE_SUPABASE_URL
Value: https://kwbueaynvjuvkfxzkiuf.supabase.co

VITE_SUPABASE_ANON_KEY
Value: your_supabase_anon_key_here

# Groq AI (Required)
VITE_GROQ_API_KEY
Value: your_groq_api_key_here

# ElevenLabs (Optional)
VITE_ELEVENLABS_API_KEY
Value: your_elevenlabs_api_key_here

# App Config
VITE_APP_NAME
Value: Manasatchi AI

VITE_APP_VERSION
Value: 1.0.0

VITE_ENABLE_VOICE_CLONING
Value: true

VITE_ENABLE_TRANSLATION
Value: true

VITE_ENABLE_SPEECH_TO_TEXT
Value: true
```

**How to add each variable:**
1. Enter the variable name (e.g., `VITE_SUPABASE_URL`)
2. Enter the value
3. Click **"Add"**
4. Repeat for all variables above

### Step 5: Deploy!

1. Click **"Deploy"** button
2. Wait 2-3 minutes for build to complete
3. You'll see "🎉 Congratulations!" when done

### Step 6: Get Your URL

After deployment:
1. Copy your Vercel URL (e.g., `https://project-kalam.vercel.app`)
2. Test the app by visiting the URL

### Step 7: Update Supabase Settings

**IMPORTANT**: Configure Supabase for your production URL:

1. Go to: https://app.supabase.com/project/kwbueaynvjuvkfxzkiuf/auth/url-configuration

2. Set **Site URL** to your Vercel URL:
   ```
   https://your-vercel-url.vercel.app
   ```

3. Add **Redirect URLs**:
   ```
   https://your-vercel-url.vercel.app/**
   https://your-vercel-url.vercel.app/dashboard
   ```

4. Click **"Save"**

### Step 8: Test Your Deployment

Visit your Vercel URL and test:
- ✅ Login page loads with cyan theme
- ✅ Registration works
- ✅ Login redirects to dashboard
- ✅ Chat interface works
- ✅ Voice features work

## Troubleshooting

### Build Fails

**Check the build logs in Vercel dashboard**:
- Look for TypeScript errors
- Check for missing dependencies
- Verify environment variables are set

**Common fixes:**
- Ensure all environment variables are added
- Check that variable names start with `VITE_`
- Redeploy after adding variables

### Authentication Not Working

1. Verify Supabase Site URL matches your Vercel domain
2. Check Redirect URLs include your Vercel domain
3. Test in incognito mode to rule out cache issues

### 404 on Page Refresh

This should be handled by `vercel.json`. If not:
1. Check that `vercel.json` exists in your repo
2. Verify the rewrites configuration
3. Redeploy

## Continuous Deployment

Now that your repo is connected to Vercel:
- ✅ Every push to `main` branch will auto-deploy
- ✅ Pull requests will create preview deployments
- ✅ You can rollback to previous deployments anytime

## Custom Domain (Optional)

To add a custom domain:
1. Go to Vercel dashboard → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Update Supabase URLs to use custom domain

## Monitoring

### Vercel Dashboard
- View deployment logs
- Monitor performance
- Check analytics
- View error logs

### Supabase Dashboard
- Monitor database usage
- Check authentication logs
- Review API usage

---

## Quick Reference

**GitHub Repo**: https://github.com/Sharumathi-p/ProjectKALAM
**Vercel Deploy**: https://vercel.com/new
**Supabase Config**: https://app.supabase.com/project/kwbueaynvjuvkfxzkiuf

---

**Ready to deploy!** 🚀

Just follow the steps above and your app will be live in minutes!
