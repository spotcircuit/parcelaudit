"use client";

import { SignUp } from "@stackframe/stack";
import LogoHeader from "@/components/LogoHeader";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <LogoHeader size="medium" opacity={80} />
        
        <div className="max-w-md mx-auto mt-8">
          <SignUp 
            fullPage={false}
            redirectUrl="/dashboard"
            afterSignUp="/auth/onboarding"
          />
        </div>
      </div>
    </div>
  );
}