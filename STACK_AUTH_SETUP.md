# Stack Auth / Neon Auth Setup Guide

## ✅ Completed Setup

I've successfully integrated Stack Auth (Neon Auth) into your Parcel Audit application. Here's what has been implemented:

### 1. Database Configuration
- ✅ Neon Auth is enabled on your database (project: orange-hall-17085884)
- ✅ User sync table created at `neon_auth.users_sync`
- ✅ Users will automatically sync between Stack Auth and your Neon database

### 2. Authentication Flow
- ✅ Stack Auth SDK installed and configured
- ✅ Signup page at `/auth/signup` with Stack Auth components
- ✅ Login page at `/auth/login` with Stack Auth components  
- ✅ Onboarding page at `/auth/onboarding` for collecting business info
- ✅ Auth handler at `/handler/[...stack]` for Stack Auth routes
- ✅ Middleware configured to protect routes and manage sessions

### 3. User Registration Flow
1. User signs up at `/auth/signup`
2. Stack Auth handles email verification automatically
3. After verification, user is redirected to `/auth/onboarding`
4. User enters business details (company, industry, shipments)
5. User is redirected to `/dashboard`

## 🔧 Required: Add Your Stack Auth Credentials

To complete the setup, you need to add your Stack Auth credentials from the Neon Console:

1. **Go to your Neon Console**: https://console.neon.tech
2. Navigate to your project: **parcelaudit**
3. Click on the **Auth** tab
4. Copy your Stack Auth credentials
5. Update `.env.local` with your actual values:

```env
# Replace these with your actual Stack Auth credentials
NEXT_PUBLIC_STACK_PROJECT_ID=YOUR_ACTUAL_PROJECT_ID
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=YOUR_ACTUAL_PUBLISHABLE_KEY  
STACK_SECRET_SERVER_KEY=YOUR_ACTUAL_SECRET_KEY
```

## 🚀 Testing the Authentication

1. Start your development server:
```bash
npm run dev
```

2. Test the signup flow:
   - Visit http://localhost:3000
   - Click any "Free Late Delivery Check" or "Full Invoice Audit" button
   - You'll be redirected to the Stack Auth signup page
   - Create an account with your email
   - Verify your email (check spam folder if needed)
   - Complete the onboarding form
   - Access the dashboard

3. Test the login flow:
   - Visit http://localhost:3000/auth/login
   - Sign in with your registered email
   - You'll be redirected to the dashboard

## 📊 User Data Access

Users are automatically synced to your Neon database. You can query them:

```sql
-- View all registered users
SELECT * FROM neon_auth.users_sync;

-- Get user details from JSON
SELECT 
  id,
  email,
  name,
  raw_json->>'displayName' as display_name,
  raw_json->'clientMetadata' as business_info,
  created_at
FROM neon_auth.users_sync;
```

## 🔒 Protected Routes

The following routes require authentication:
- `/dashboard` - Main dashboard
- `/free-check` - Late delivery checker
- `/upload` - Invoice upload
- `/api/late-check` - API endpoint

Unauthenticated users are redirected to `/auth/signup`.

## 📝 Additional Features

Stack Auth provides:
- Email/password authentication
- Magic link login
- OAuth providers (Google, GitHub, etc.)
- Session management
- User metadata storage
- Automatic email verification
- Password reset flows

## 🎨 Customization

You can customize the Stack Auth UI by:
1. Modifying the StackTheme in `/src/app/layout.tsx`
2. Using custom CSS with Stack Auth components
3. Building custom auth pages with Stack Auth hooks

## 📚 Resources

- [Neon Auth Documentation](https://neon.com/docs/neon-auth/quick-start/nextjs)
- [Stack Auth Documentation](https://docs.stack-auth.com)
- [Stack Auth Next.js Guide](https://docs.stack-auth.com/getting-started/nextjs)

## ⚠️ Important Notes

1. **Email Verification**: Stack Auth automatically handles email verification
2. **Session Management**: Sessions are managed by Stack Auth cookies
3. **User Sync**: Users are automatically synced to `neon_auth.users_sync`
4. **Onboarding**: Business information is stored in user metadata

## Need Help?

If you encounter any issues:
1. Check that your Stack Auth credentials are correctly set in `.env.local`
2. Ensure Neon Auth is enabled in your Neon Console
3. Check the browser console for any errors
4. Verify the database connection is working

The authentication system is now fully integrated and ready to use!