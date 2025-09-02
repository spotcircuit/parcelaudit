"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import LogoHeader from "@/components/LogoHeader";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleResend = async () => {
    setIsResending(true);
    setResendMessage("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setResendMessage("Verification email sent! Check your inbox.");
      } else {
        setResendMessage("Failed to resend. Please try again.");
      }
    } catch (error) {
      setResendMessage("Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <LogoHeader size="medium" opacity={80} />
        
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
          <p className="text-gray-600 mb-6">
            We've sent a verification link to:
            <br />
            <span className="font-semibold text-gray-900">{email}</span>
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              Please click the link in your email to verify your account and get started with your free audit.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Didn't receive the email? Check your spam folder or
            </p>
            
            <button
              onClick={handleResend}
              disabled={isResending}
              className="px-6 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isResending ? "Sending..." : "Resend Verification Email"}
            </button>

            {resendMessage && (
              <p className={`text-sm ${resendMessage.includes("sent") ? "text-green-600" : "text-red-600"}`}>
                {resendMessage}
              </p>
            )}
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-600">
              Wrong email?{" "}
              <Link href="/signup" className="text-blue-600 hover:underline">
                Go back to signup
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Having trouble? Contact us at{" "}
            <a href="mailto:support@parcelaudit.com" className="text-blue-600 hover:underline">
              support@parcelaudit.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}