# Complete Setup Guide
## Voice Assistant - Solo Developer Edition

This guide will walk you through setting up your development environment from scratch. Follow each step carefully.

---

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **Git** installed ([Download](https://git-scm.com/))
- **Code Editor** (VS Code recommended: [Download](https://code.visualstudio.com/))
- **Modern Web Browser** (Chrome, Firefox, or Edge)

---

## Step 1: Project Setup (5 minutes)

### 1.1 Clone or Download the Project

If you have the code in a Git repository:
```bash
git clone <your-repo-url>
cd voice-assistant
```

If you're starting fresh, create a new directory:
```bash
mkdir voice-assistant
cd voice-assistant
# Copy all the project files into this directory
```

### 1.2 Install Dependencies

```bash
npm install
```

This will install all required packages (React, Supabase, Material-UI, etc.)

**Expected output**: You should see a progress bar and "added XXX packages" message.

---

## Step 2: Supabase Setup (10 minutes)

Supabase is your free backend (database, authentication, storage).

### 2.1 Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

### 2.2 Create New Project

1. Click "New Project"
2. Fill in the details:
   - **Name**: `voice-assistant` (or any name you like)
   - **Database Password**: Create a strong password (save it somewhere safe!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (default)
3. Click "Create new project"
4. Wait 2-3 minutes for project to be created

### 2.3 Get API Keys

1. Once project is ready, go to **Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. You'll see two important values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
4. **Keep this tab open** - you'll need these values next

### 2.4 Run Database Migration

1. In Supabase dashboard, click **SQL Editor** in sidebar
2. Click **New Query**
3. Open the file `supabase/migrations/001_initial_schema.sql` from your project
4. Copy ALL the SQL code
5. Paste it into the Supabase SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

**What this does**: Creates all database tables (user_profiles, user_preferences, conversations, messages)

### 2.5 Verify Tables Created

1. Click **Table Editor** in sidebar
2. You should see these tables:
   - `user_profiles`
   - `user_preferences`
   - `conversations`
   - `messages`

If you see these tables, you're good to go! ✅

---

## Step 3: OpenAI API Setup (5 minutes)

OpenAI powers the AI conversations.

### 3.1 Create OpenAI Account

1. Go to [platform.openai.com](https://platform.openai.com)
2. Click "Sign up" (or "Log in" if you have an account)
3. Complete registration

### 3.2 Add Payment Method

1. Go to **Settings** → **Billing**
2. Click "Add payment method"
3. Add a credit/debit card
4. **Set a usage limit**: Click "Usage limits" and set to $5-10/month (for safety)

**Cost**: ~$0.002 per conversation. $5 = ~2,500 conversations!

### 3.3 Get API Key

1. Go to **API Keys** in the left menu
2. Click "Create new secret key"
3. Give it a name: "Voice Assistant Dev"
4. Click "Create secret key"
5. **COPY THE KEY IMMEDIATELY** - you can't see it again!
6. Save it somewhere safe (you'll need it in next step)

---

## Step 4: Environment Variables (2 minutes)

### 4.1 Create .env.local File

1. In your project root, copy the example file:
```bash
cp .env.example .env.local
```

Or create a new file named `.env.local` manually.

### 4.2 Fill in Your API Keys

Open `.env.local` and replace the placeholder values:

```env
# Supabase (from Step 2.3)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your_actual_key_here

# OpenAI (from Step 3.3)
VITE_OPENAI_API_KEY=sk-...your_actual_key_here

# Optional (leave empty for now)
VITE_ELEVENLABS_API_KEY=
VITE_DEEPL_API_KEY=

# Feature Flags (leave as is)
VITE_APP_NAME=Voice Assistant
VITE_APP_VERSION=0.1.0
VITE_ENABLE_VOICE_CLONING=false
VITE_ENABLE_TRANSLATION=false
VITE_ENABLE_SPEECH_TO_TEXT=false
```

**Important**: 
- Replace `xxxxx` with your actual Supabase project ID
- Replace the keys with your actual keys
- Don't share this file with anyone!
- Don't commit it to Git (it's already in .gitignore)

---

## Step 5: Run the Application (1 minute)

### 5.1 Start Development Server

```bash
npm run dev
```

**Expected output**:
```
VITE v5.0.0  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### 5.2 Open in Browser

1. Open your browser
2. Go to `http://localhost:3000`
3. You should see the **Login** page!

---

## Step 6: Test the Application (5 minutes)

### 6.1 Create Your First Account

1. Click "Don't have an account? Sign Up"
2. Fill in:
   - **Full Name**: Your name
   - **Email**: Your email
   - **Password**: At least 6 characters
   - **Confirm Password**: Same password
3. Click "Sign Up"
4. You should be redirected to the **Dashboard**!

### 6.2 Check Supabase

1. Go back to Supabase dashboard
2. Click **Authentication** in sidebar
3. You should see your new user!
4. Click **Table Editor** → **user_profiles**
5. You should see your profile row!

### 6.3 Test Navigation

Try clicking around:
- ✅ Dashboard (should show welcome message)
- ✅ Profile (should show your email)
- ✅ Settings (should show language preferences)
- ✅ Chat (placeholder for now)
- ✅ Sign Out (should return to login)

If everything works, **congratulations!** 🎉 Your setup is complete!

---

## Troubleshooting

### Problem: "npm install" fails

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and try again
rm -rf node_modules
npm install
```

### Problem: "Missing Supabase environment variables"

**Solution**:
- Make sure `.env.local` file exists in project root
- Check that variable names start with `VITE_`
- Restart the dev server after changing .env.local

### Problem: "Failed to sign up" error

**Solution**:
- Check Supabase dashboard → SQL Editor
- Make sure migration ran successfully
- Check that tables exist in Table Editor
- Try running the migration again

### Problem: Can't see user in Supabase after signup

**Solution**:
- Check Supabase → Authentication → Users
- Check email for verification link (if email confirmation is enabled)
- Check Supabase → Logs for errors

### Problem: Page shows "Loading..." forever

**Solution**:
- Open browser console (F12)
- Check for errors
- Verify Supabase URL and key are correct
- Check internet connection

---

## Next Steps

Now that your setup is complete, you're ready to start building!

### Week 1-2 Tasks (Current Phase)
- [x] Project setup ✅
- [x] Supabase configuration ✅
- [x] Registration page ✅
- [x] Login page ✅
- [x] Protected routes ✅
- [ ] Deploy to Vercel (optional)

### Week 3-4 Tasks (Next Phase)
- [ ] Complete profile form functionality
- [ ] Add avatar upload
- [ ] Enhance settings page
- [ ] Add more preferences

See [Week 3-4 Guide](week-3-4.md) for detailed instructions.

---

## Development Tips

### Hot Reload
The dev server automatically reloads when you save files. No need to restart!

### Browser DevTools
Press **F12** to open developer tools:
- **Console**: See errors and logs
- **Network**: See API requests
- **Application**: See local storage and cookies

### VS Code Extensions (Recommended)
- **ES7+ React/Redux/React-Native snippets**: Fast React code
- **Prettier**: Auto-format code
- **ESLint**: Catch errors early
- **Supabase**: Supabase integration

### Useful Commands
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Format code
npm run format
```

---

## Getting Help

### Resources
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **React Docs**: [react.dev](https://react.dev)
- **Material-UI Docs**: [mui.com](https://mui.com)
- **OpenAI Docs**: [platform.openai.com/docs](https://platform.openai.com/docs)

### Communities
- **Supabase Discord**: [discord.supabase.com](https://discord.supabase.com)
- **React Discord**: [discord.gg/react](https://discord.gg/react)
- **Stack Overflow**: Tag questions with `supabase`, `react`, `typescript`

### AI Help
- Use ChatGPT or Claude to help debug errors
- Copy error messages and ask for solutions
- Ask for code explanations

---

## Security Reminders

- ✅ Never commit `.env.local` to Git
- ✅ Never share your API keys publicly
- ✅ Set usage limits on OpenAI account
- ✅ Use strong passwords
- ✅ Enable 2FA on Supabase and OpenAI accounts

---

**You're all set!** 🚀 Happy coding!
