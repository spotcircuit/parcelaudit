'use client';

export const dynamic = 'force-dynamic';

export default function Handler() {
  // Stack Auth handler placeholder
  // This page requires Stack Auth environment variables to be configured
  // See .env.example for required variables
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Stack Auth Setup Required</h2>
          <p className="mt-2 text-gray-600">
            Please configure Stack Auth environment variables to enable authentication.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p>1. Create a project at https://app.stack-auth.com</p>
            <p>2. Add environment variables to .env.local</p>
            <p>3. Restart the application</p>
          </div>
        </div>
      </div>
    </div>
  );
}
