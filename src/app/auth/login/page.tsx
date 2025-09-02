"use client";

import LogoHeader from "@/components/LogoHeader";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <LogoHeader size="medium" opacity={80} />
        
        <div className="max-w-md mx-auto mt-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Login</h2>
            <p className="text-gray-600 mb-4">
              Authentication is currently disabled. The app is in demo mode.
            </p>
            <a 
              href="/dashboard" 
              className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Continue to Dashboard (Demo)
            </a>
            <p className="mt-4 text-sm text-gray-500">
              To enable authentication, configure Stack Auth environment variables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}