# Deployment Guide
## Deploy to Vercel (Free Hosting)

Once you've tested your app locally, you can deploy it to Vercel for free. Your app will be live on the internet with a URL like `your-app.vercel.app`.

---

## Prerequisites

- ✅ App working locally
- ✅ Code pushed to GitHub
- ✅ Supabase project created
- ✅ OpenAI API key ready

---

## Step 1: Push Code to GitHub (5 min)

### 1.1 Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click "+" → "New repository"
3. Name: `voice-assistant`
4. Make it **Private** (recommended)
5. Don't initialize with README (you already have one)
6. Click "Create repository"

### 1.2 Push Your Code

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Voice Assistant MVP"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/voice-assistant.git

# Push
git branch -M main
git push -u origin main
```

**Note**: Replace `YOUR_USERNAME` with your GitHub username.

---

## Step 2: Deploy to Vercel (5 min)

### 2.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub" (easiest)
4. Authorize Vercel to access your repositories

### 2.2 Import Project

1. Click "Add New..." → "Project"
2. Find your `voice-assistant` repository
3. Click "Import"

### 2.3 Configure Project

**Framework Preset**: Vite (should auto-detect)

**Root Directory**: `./` (leave as is)

**Build Command**: `npm run build` (should be pre-filled)

**Output Directory**: `dist` (should be pre-filled)

**Install Command**: `npm install` (should be pre-filled)

### 2.4 Add Environment Variables

Click "Environment Variables" and add these:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | Your Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_OPENAI_API_KEY` | Your OpenAI API key |
| `VITE_APP_NAME` | Voice Assistant |
| `VITE_APP_VERSION` | 0.1.0 |
| `VITE_ENABLE_VOICE_CLONING` | false |
| `VITE_ENABLE_TRANSLATION` | false |
| `VITE_ENABLE_SPEECH_TO_TEXT` | false |

**Important**: Copy these from your `.env.local` file!

### 2.5 Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. You'll see "Congratulations!" when done
4. Click "Visit" to see your live app!

---

## Step 3: Configure Supabase for Production (2 min)

### 3.1 Add Vercel URL to Supabase

1. Go to your Supabase dashboard
2. Settings → API → URL Configuration
3. Add your Vercel URL to "Site URL": `https://your-app.vercel.app`
4. Add to "Redirect URLs": `https://your-app.vercel.app/**`

This allows authentication to work on your deployed site.

---

## Step 4: Test Your Deployed App (2 min)

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try signing up with a new account
3. Test login/logout
4. Check profile and settings pages
5. Everything should work just like locally!

---

## Automatic Deployments

**Good news**: Every time you push to GitHub, Vercel automatically deploys!

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push

# Vercel automatically builds and deploys!
# Check deployment status at vercel.com
```

---

## Custom Domain (Optional)

Want `yourname.com` instead of `your-app.vercel.app`?

1. Buy a domain (Namecheap, Google Domains, etc.)
2. In Vercel: Settings → Domains
3. Add your domain
4. Follow DNS configuration instructions
5. Wait 24-48 hours for DNS propagation

**Cost**: ~$10-15/year for domain

---

## Monitoring & Analytics

### View Deployment Logs

1. Go to [vercel.com](https://vercel.com)
2. Click your project
3. Click "Deployments"
4. Click any deployment to see logs

### View Runtime Logs

1. Click "Logs" tab in your project
2. See real-time errors and requests
3. Filter by error level

### Analytics (Free)

Vercel provides free analytics:
- Page views
- Unique visitors
- Top pages
- Performance metrics

Enable in: Settings → Analytics

---

## Environment Management

### Development vs Production

You can have different environment variables for each:

1. Vercel dashboard → Settings → Environment Variables
2. Choose environment: Production, Preview, or Development
3. Add different values for each

**Example**:
- **Production**: Use production OpenAI key with higher limits
- **Preview**: Use development key for testing
- **Development**: Local `.env.local` file

---

## Troubleshooting

### Build Fails

**Check build logs**:
1. Vercel dashboard → Deployments
2. Click failed deployment
3. Read error messages

**Common issues**:
- Missing environment variables
- TypeScript errors
- Import path issues

**Solution**: Fix locally first, then push again.

### App Loads But Login Fails

**Check**:
1. Supabase URL is correct in Vercel env vars
2. Vercel URL is added to Supabase redirect URLs
3. Browser console for errors (F12)

### Environment Variables Not Working

**Remember**:
- Must start with `VITE_` prefix
- Must redeploy after changing env vars
- Check spelling carefully

**To redeploy**:
1. Vercel dashboard → Deployments
2. Click "..." on latest deployment
3. Click "Redeploy"

---

## Cost Breakdown

### Free Tier Includes:
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ 100GB bandwidth/month
- ✅ Serverless functions
- ✅ Preview deployments
- ✅ Analytics

### You Only Pay For:
- OpenAI API usage (~$5-10/month for testing)
- Custom domain (optional, ~$10-15/year)

**Total monthly cost**: $5-10 for 100-500 users!

---

## Security Best Practices

### Environment Variables
- ✅ Never commit `.env.local` to Git
- ✅ Use Vercel's environment variables feature
- ✅ Rotate API keys periodically

### Supabase
- ✅ Enable Row Level Security (already done in migration)
- ✅ Use anon key for frontend (not service key!)
- ✅ Restrict redirect URLs to your domains only

### OpenAI
- ✅ Set usage limits in OpenAI dashboard
- ✅ Monitor usage regularly
- ✅ Use separate keys for dev/prod

---

## Scaling Up

When you get more users:

### Vercel Pro ($20/month)
- More bandwidth
- Better analytics
- Team collaboration
- Password protection

### Supabase Pro ($25/month)
- 8GB database (vs 500MB free)
- 100GB bandwidth
- Daily backups
- Better support

### OpenAI
- Pay as you go scales automatically
- Consider GPT-3.5 for cost savings
- Implement caching to reduce API calls

---

## Next Steps

Now that you're deployed:

1. **Share with friends**: Get early feedback
2. **Monitor usage**: Check Vercel and Supabase dashboards
3. **Iterate**: Add features based on feedback
4. **Week 3-4**: Continue building (see [week-3-4.md](week-3-4.md))

---

## Getting Help

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Discord**: [vercel.com/discord](https://vercel.com/discord)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

---

**Congratulations!** 🎉 Your app is live on the internet!
