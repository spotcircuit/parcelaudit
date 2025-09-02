# ParcelAudit Deployment Guide

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/spotcircuit/parcelaudit)

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

### Required for Production

```bash
# Database (Neon)
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
DIRECT_DATABASE_URL=postgresql://username:password@host/database?sslmode=require
```

### Optional - For Full Features

```bash
# Stack Auth (for authentication)
NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_key
STACK_SECRET_SERVER_KEY=your_secret

# Google Places API (for address validation)
GOOGLE_PLACES_API_KEY=your_api_key
```

## Database Setup

1. Create a Neon database at https://neon.tech
2. Run the schema from `database-schema.sql`
3. Import DAS data (optional) from `scripts/`

## Build and Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

## Features Available Without Auth

- Invoice upload and parsing
- Audit error detection
- Dispute packet generation
- Export functionality

## Setting Up Authentication (Optional)

1. Go to https://app.stack-auth.com
2. Create a new project
3. Copy the environment variables to `.env.local`
4. Restart the application

## Deployment Checklist

- [ ] Database connected and schema created
- [ ] Environment variables configured
- [ ] Build successful (`npm run build`)
- [ ] DAS data imported (optional)
- [ ] Stack Auth configured (optional)
- [ ] Google Places API configured (optional)