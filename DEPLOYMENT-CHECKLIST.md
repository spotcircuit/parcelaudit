# Shipping Audit Landing Page - Deployment Checklist

## ✅ Completed Setup

### Step 1: Project & Dependencies
- ✅ Next.js TypeScript project compiles successfully
- ✅ Installed @neondatabase/serverless
- ✅ Installed framer-motion
- ✅ Tailwind CSS configured and working

### Step 2: Files & Configuration
- ✅ Landing page at `/landing` with "use client"
- ✅ API route at `/api/signup`
- ✅ PRIMARY_CTA_HREF set to #signup
- ✅ Created .env.local with DATABASE_URL and NEXT_PUBLIC_GTM_ID

### Step 3: Database Setup
- ✅ SQL file created: `create-leads-table.sql`
- ✅ Test script created: `test-api.sh`

### Step 4: GTM/GA4 Integration
- ✅ GTM scripts added to layout.tsx
- ✅ GTM setup guide created
- ✅ DataLayer events configured:
  - cta_click
  - signup_submit
  - signup_success
  - keyword_alignment

## 📋 Next Steps for Deployment

### 1. Neon Database Setup
1. Go to https://neon.tech and create an account
2. Create a new database
3. Run the SQL from `create-leads-table.sql` in Neon console
4. Copy your connection string
5. Update DATABASE_URL in .env.local

### 2. Google Tag Manager Setup
1. Create GTM account at https://tagmanager.google.com
2. Follow the instructions in `GTM-SETUP-GUIDE.md`
3. Update NEXT_PUBLIC_GTM_ID in .env.local

### 3. Local Testing
```bash
# Start development server
npm run dev

# Test the landing page
# Visit: http://localhost:3000/landing

# Test keyword alignment
# Visit: http://localhost:3000/landing?kw=Carrier%20Invoice%20Audit

# Test API (in another terminal)
chmod +x test-api.sh
./test-api.sh
```

### 4. Vercel Deployment
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel:
# - DATABASE_URL
# - NEXT_PUBLIC_GTM_ID
```

### 5. Production Testing
1. Test all CTAs fire events in GTM Preview Mode
2. Verify signup form submits to database
3. Check GA4 DebugView for events
4. Test keyword alignment with ?kw= parameter

### 6. Google Ads Setup
1. Create conversion action in Google Ads
2. Link to GTM signup_success event
3. Import conversions from GA4

## 🔧 Optional: n8n Webhook Integration

Add this to your API route to send data to n8n:

```typescript
// After successful database insert
if (process.env.N8N_WEBHOOK_URL) {
  await fetch(process.env.N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, kw, utm, timestamp: new Date().toISOString() })
  });
}
```

## 📊 Key Features Implemented

- ✅ Single CTA throughout the page
- ✅ No navigation bar for focus
- ✅ High contrast design
- ✅ Dynamic keyword alignment via URL parameter
- ✅ ROI calculator
- ✅ GTM/GA4 tracking ready
- ✅ Neon database integration
- ✅ Edge runtime for performance
- ✅ TypeScript for type safety
- ✅ Responsive design with Tailwind CSS

## 🚀 Performance Notes

- Edge runtime API for fast responses
- Static generation for landing page
- Optimized bundle size (~156 KB)
- Framer Motion for smooth animations

## 📝 Environment Variables

Required for production:
```
DATABASE_URL=postgres://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require
NEXT_PUBLIC_GTM_ID=GTM-XXXXXX
```

Optional:
```
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/xxx
```