# Complete Setup Guide

This guide will walk you through setting up the Task Management Application from scratch.

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed ([Download](https://nodejs.org/))
- npm (comes with Node.js)
- A Supabase account (free tier works - [Sign up](https://supabase.com))
- Git (for cloning the repository)

---

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd project
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React and React DOM
- TypeScript
- Vite
- TailwindCSS
- Supabase client library
- Lucide React icons

---

## Step 3: Set Up Supabase

### 3.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub, Google, or email
4. Click "New Project"
5. Fill in:
   - **Project Name**: task-management-app (or your choice)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Select closest to your location
6. Click "Create new project"
7. Wait 2-3 minutes for setup to complete

### 3.2 Get API Credentials

1. In your Supabase project dashboard, click "Settings" (gear icon)
2. Click "API" in the left sidebar
3. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Project API keys**:
     - `anon` `public` key (this is safe to use in client)
     - `service_role` `secret` key (never expose this!)

### 3.3 Create Environment File

1. In your project root directory, create a file named `.env`
2. Add the following (replace with your actual values):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**:
- Never commit `.env` to version control (it's already in `.gitignore`)
- Use the `anon` key, NOT the `service_role` key

---

## Step 4: Set Up Database

### 4.1 Run Database Migration

1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Open the `database/schema.sql` file from this project
5. Copy the entire contents
6. Paste into the SQL Editor
7. Click "Run" (or press Cmd/Ctrl + Enter)

You should see: "Success. No rows returned"

### 4.2 Verify Database Setup

1. Click "Table Editor" in the left sidebar
2. You should see two tables:
   - `profiles` (0 rows)
   - `tasks` (0 rows)
3. Click on each table to verify columns are created

### 4.3 Verify RLS is Enabled

1. In Table Editor, click on `profiles` table
2. Look for a shield icon or "RLS" indicator
3. It should show "Row Level Security is enabled"
4. Repeat for `tasks` table

---

## Step 5: Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.4.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

## Step 6: Test the Application

### 6.1 Sign Up

1. Open http://localhost:5173 in your browser
2. Click "Sign up" link
3. Fill in:
   - Full Name: Test User
   - Email: test@example.com
   - Password: password123
4. Click "Create Account"

**Expected Result**: You should be redirected to the dashboard

### 6.2 Verify Database

1. Go back to Supabase Dashboard
2. Click "Authentication" > "Users"
3. You should see your new user
4. Click "Table Editor" > "profiles"
5. You should see one row with your user data

### 6.3 Create a Task

1. In the dashboard, click "New Task"
2. Fill in:
   - Title: My First Task
   - Description: Testing the application
   - Status: Pending
   - Priority: High
3. Click "Create Task"

**Expected Result**: Task appears in the list

### 6.4 Test Search and Filters

1. Create 2-3 more tasks with different statuses/priorities
2. Try searching for a task by title
3. Use status filter dropdown
4. Use priority filter dropdown
5. Try multiple filters together

### 6.5 Test CRUD Operations

1. Click the edit icon on a task
2. Change the title and status
3. Click "Update Task"
4. Verify changes are saved
5. Click the delete icon on a task
6. Confirm deletion
7. Verify task is removed

### 6.6 Test Profile Update

1. In the dashboard header, click "Edit Profile"
2. Change your full name
3. Click "Save"
4. Verify name is updated

### 6.7 Test Sign Out

1. Click "Sign Out" button
2. Verify you're redirected to login page
3. Sign in again with your credentials

---

## Step 7: Build for Production

When you're ready to deploy:

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

**Expected Output**:
```
✓ 1549 modules transformed.
dist/index.html                   0.48 kB
dist/assets/index-sBzqiQXZ.css   15.69 kB │ gzip:  3.73 kB
dist/assets/index-DUY74Fo0.js   296.45 kB │ gzip: 86.04 kB
✓ built in 3.72s
```

---

## Common Issues and Solutions

### Issue 1: "Missing Supabase environment variables"

**Cause**: `.env` file not found or incorrect variable names

**Solution**:
1. Verify `.env` file exists in project root
2. Check variable names start with `VITE_`
3. Restart dev server after creating `.env`

### Issue 2: "Failed to fetch" or network errors

**Cause**: Incorrect Supabase URL or API key

**Solution**:
1. Double-check URL in `.env` matches your Supabase project
2. Verify you're using the `anon` key, not `service_role` key
3. Check Supabase project is not paused

### Issue 3: "Database error" when signing up

**Cause**: Database migration not run or RLS policies missing

**Solution**:
1. Go to Supabase SQL Editor
2. Re-run the `database/schema.sql` script
3. Verify both tables exist with RLS enabled

### Issue 4: Can't see tasks after creating them

**Cause**: RLS policies not working or user_id mismatch

**Solution**:
1. Check browser console for errors
2. Verify RLS policies are enabled
3. Try signing out and signing in again

### Issue 5: Build fails with TypeScript errors

**Cause**: Type checking errors in code

**Solution**:
```bash
# Check for type errors
npm run typecheck

# Clear cache and rebuild
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### Issue 6: Styles not loading in development

**Cause**: TailwindCSS not configured properly

**Solution**:
1. Verify `tailwind.config.js` exists
2. Check `postcss.config.js` is present
3. Restart dev server

---

## Deployment to Vercel

### Prerequisites
- GitHub account
- Push your code to GitHub

### Steps

1. **Push to GitHub**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Configure:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add Environment Variables:
     - `VITE_SUPABASE_URL`: Your Supabase URL
     - `VITE_SUPABASE_ANON_KEY`: Your anon key
   - Click "Deploy"

3. **Access Your App**:
   - Wait for deployment to complete
   - Click the generated URL
   - Test the application

---

## Deployment to Netlify

### Steps

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Build the Project**:
```bash
npm run build
```

3. **Deploy**:
```bash
netlify deploy --prod --dir=dist
```

4. **Set Environment Variables**:
   - Go to Netlify dashboard
   - Site settings > Environment variables
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Redeploy

---

## Testing Checklist

Before considering setup complete, test:

- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] Create a task
- [ ] Edit a task
- [ ] Delete a task
- [ ] Search for tasks
- [ ] Filter by status
- [ ] Filter by priority
- [ ] Update profile
- [ ] Sign out
- [ ] Sign in again
- [ ] Verify tasks persist
- [ ] Test on mobile device
- [ ] Test in different browsers

---

## Next Steps

After successful setup:

1. **Read Documentation**:
   - `README.md` - Overview and usage
   - `API_DOCUMENTATION.md` - API details
   - `SCALABILITY.md` - Production optimization

2. **Customize**:
   - Update branding and colors
   - Add more task fields
   - Implement additional features

3. **Deploy**:
   - Choose hosting platform
   - Set up custom domain
   - Enable monitoring

4. **Monitor**:
   - Check Supabase dashboard for usage
   - Monitor error logs
   - Track performance metrics

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **TailwindCSS Docs**: https://tailwindcss.com/docs
- **TypeScript Docs**: https://www.typescriptlang.org/docs

---

## Security Checklist

Before deploying to production:

- [ ] Environment variables not committed to Git
- [ ] Using `anon` key, not `service_role` key
- [ ] RLS enabled on all tables
- [ ] RLS policies tested and working
- [ ] HTTPS enabled (automatic with Vercel/Netlify)
- [ ] Input validation working
- [ ] Error messages don't expose sensitive info
- [ ] Regular backups enabled in Supabase

---

**Congratulations!** Your Task Management Application is now set up and ready to use!

For questions or issues, refer to the troubleshooting section above or check the documentation files.
