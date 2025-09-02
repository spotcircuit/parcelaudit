"use client";

export const dynamic = 'force-dynamic';

import LogoHeader from "@/components/LogoHeader";
import Link from "next/link";

export default function AuthSetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <LogoHeader size="medium" opacity={80} />
        
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            🔐 Authentication Setup Required
          </h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="font-semibold text-blue-900 mb-3">To enable authentication:</h2>
            <ol className="space-y-2 text-sm text-blue-800">
              <li>
                <strong>1. Go to Neon Console:</strong>
                <br />
                <a 
                  href="https://console.neon.tech" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://console.neon.tech
                </a>
              </li>
              <li>
                <strong>2. Open your project:</strong> parcelaudit
              </li>
              <li>
                <strong>3. Click the "Auth" tab</strong>
              </li>
              <li>
                <strong>4. Click "Enable Neon Auth"</strong> if not already enabled
              </li>
              <li>
                <strong>5. Copy your credentials</strong> (Project ID, Keys)
              </li>
              <li>
                <strong>6. Update .env.local:</strong>
                <pre className="mt-2 p-2 bg-white rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_STACK_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=<your-key>
STACK_SECRET_SERVER_KEY=<your-secret>`}
                </pre>
              </li>
              <li>
                <strong>7. Restart your dev server</strong>
              </li>
            </ol>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-900">
              <strong>✨ Once configured:</strong>
              <br />
              • Users will receive email verification
              <br />
              • Secure sessions will be managed automatically
              <br />
              • All auth features will be enabled
            </p>
          </div>
          
          <Link
            href="/"
            className="block w-full text-center py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}