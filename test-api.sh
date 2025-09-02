#!/bin/bash

# Test the signup API endpoint
# Make sure your Next.js app is running first: npm run dev

echo "Testing signup API..."

curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "kw": "Carrier Invoice Audit",
    "source": "google_ads",
    "utm": {
      "utm_source": "google",
      "utm_medium": "cpc",
      "utm_campaign": "shipping_audit"
    }
  }' | jq

echo ""
echo "If you see { ok: true }, the API is working!"