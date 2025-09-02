"use client";

import Image from "next/image";
import Link from "next/link";
import LogoHeader from "@/components/LogoHeader";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Free Tool Banner */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-lg font-semibold">🎯 NEW: Free Late-Delivery Checker</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-sm sm:text-base">Check 50 tracking numbers instantly</span>
            <Link 
              href="/free-check"
              className="ml-4 px-4 py-1 bg-white text-green-600 rounded-full text-sm font-semibold hover:bg-green-50 transition-colors"
            >
              Try Now →
            </Link>
          </div>
        </div>

        {/* Header */}
        <header className="text-center mb-8">
          <LogoHeader size="large" opacity={80} />
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Parcel Invoice Audit Platform
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Detect DIM weight errors, invalid surcharges, and billing mistakes automatically. Recover lost margin from
            UPS & FedEx invoices in days—not quarters.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Link
              href="/auth/signup?source=free-check"
              className="px-8 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-colors"
            >
              🚀 Free Late Delivery Check
            </Link>
            <Link
              href="/auth/signup?source=full-audit"
              className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
            >
              Full Invoice Audit
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-300 rounded-full font-semibold hover:bg-blue-50 transition-colors"
            >
              View Dashboard
            </Link>
          </div>
        </header>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          {/* Process Flow with 3 circles */}
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-white border-4 border-green-400 flex items-center justify-center">
                <span className="text-xl font-bold">1</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
            </div>
            
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-white border-4 border-green-400 flex items-center justify-center">
                <span className="text-xl font-bold">2</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
            </div>
            
            <div className="w-16 h-16 rounded-full bg-white border-4 border-blue-400 flex items-center justify-center">
              <span className="text-xl font-bold">3</span>
            </div>
          </div>

          <div className="flex justify-center gap-16 text-center mb-16">
            <div className="max-w-[100px]">
              <p className="font-semibold text-sm">CONNECT<br/>CARRIERS</p>
            </div>
            <div className="max-w-[100px]">
              <p className="font-semibold text-sm">AUDIT<br/>AUTOMATICALLY</p>
            </div>
            <div className="max-w-[100px]">
              <p className="font-semibold text-sm">RECOVER<br/>SAVINGS</p>
            </div>
          </div>
        </section>


        {/* Feature Screenshots in Shields */}
        <section className="mb-16">
          {/* Top row - 3 shields */}
          <div className="flex justify-center gap-8 flex-wrap mb-8">
            {/* Shield 1 - DIM Detection */}
            <div className="relative">
              <div className="w-80 h-96 bg-gradient-to-b from-blue-500 to-blue-700 rounded-t-3xl flex flex-col items-center"
                   style={{
                     clipPath: 'polygon(50% 0%, 100% 0, 100% 75%, 50% 100%, 0 75%, 0 0)',
                   }}>
                <div className="w-72 h-56 bg-white rounded-lg overflow-hidden shadow-lg mt-8">
                  <img 
                    src="/images/screenshots/dim-detection.png" 
                    alt="DIM Weight Detection"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-auto mb-16 text-center">
                  <p className="text-white font-semibold text-lg">DIM Weight Detection</p>
                </div>
              </div>
            </div>

            {/* Shield 2 - Invoice Analysis */}
            <div className="relative">
              <div className="w-80 h-96 bg-gradient-to-b from-blue-500 to-blue-700 rounded-t-3xl flex flex-col items-center"
                   style={{
                     clipPath: 'polygon(50% 0%, 100% 0, 100% 75%, 50% 100%, 0 75%, 0 0)',
                   }}>
                <div className="w-72 h-56 bg-white rounded-lg overflow-hidden shadow-lg mt-8">
                  <img 
                    src="/images/screenshots/invoice-comparison.png" 
                    alt="Invoice Analysis"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-auto mb-16 text-center">
                  <p className="text-white font-semibold text-lg">Invoice Analysis</p>
                </div>
              </div>
            </div>

            {/* Shield 3 - Recovery Tracking */}
            <div className="relative">
              <div className="w-80 h-96 bg-gradient-to-b from-blue-500 to-blue-700 rounded-t-3xl flex flex-col items-center"
                   style={{
                     clipPath: 'polygon(50% 0%, 100% 0, 100% 75%, 50% 100%, 0 75%, 0 0)',
                   }}>
                <div className="w-72 h-56 bg-white rounded-lg overflow-hidden shadow-lg mt-8">
                  <img 
                    src="/images/screenshots/dashboard-overview.png" 
                    alt="Real-time Dashboard"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-auto mb-16 text-center">
                  <p className="text-white font-semibold text-lg">Real-time Dashboard</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row - 2 shields centered */}
          <div className="flex justify-center gap-8 flex-wrap">
            {/* Shield 4 - ROI Calculator */}
            <div className="relative">
              <div className="w-80 h-96 bg-gradient-to-b from-blue-500 to-blue-700 rounded-t-3xl flex flex-col items-center"
                   style={{
                     clipPath: 'polygon(50% 0%, 100% 0, 100% 75%, 50% 100%, 0 75%, 0 0)',
                   }}>
                <div className="w-72 h-56 bg-white rounded-lg overflow-hidden shadow-lg mt-8">
                  <img 
                    src="/images/screenshots/roi-calculator.png" 
                    alt="ROI Calculator"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-auto mb-16 text-center">
                  <p className="text-white font-semibold text-lg">ROI Calculator</p>
                </div>
              </div>
            </div>

            {/* Shield 5 - Savings Chart */}
            <div className="relative">
              <div className="w-80 h-96 bg-gradient-to-b from-blue-500 to-blue-700 rounded-t-3xl flex flex-col items-center"
                   style={{
                     clipPath: 'polygon(50% 0%, 100% 0, 100% 75%, 50% 100%, 0 75%, 0 0)',
                   }}>
                <div className="w-72 h-56 bg-white rounded-lg overflow-hidden shadow-lg mt-8">
                  <img 
                    src="/images/screenshots/savings-chart.png" 
                    alt="Savings Chart"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-auto mb-16 text-center">
                  <p className="text-white font-semibold text-lg">Savings Chart</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Icons */}
        <section className="mb-16">
          {/* Top row - 3 icons */}
          <div className="flex justify-center gap-16 flex-wrap mb-8">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <img 
                  src="/images/icons/automation.png" 
                  alt="Automation" 
                  className="h-20 w-20 object-contain"
                />
              </div>
              <p className="font-semibold">Automated<br/>Processing</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <img 
                  src="/images/icons/alert-icon.png" 
                  alt="Alerts" 
                  className="h-20 w-20 object-contain"
                />
              </div>
              <p className="font-semibold">Real-time<br/>Alerts</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <img 
                  src="/images/icons/export.png" 
                  alt="Export" 
                  className="h-20 w-20 object-contain"
                />
              </div>
              <p className="font-semibold">Easy<br/>Export</p>
            </div>
          </div>
          
          {/* Bottom row - 3 more icons */}
          <div className="flex justify-center gap-16 flex-wrap">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="h-20 w-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">$</span>
                </div>
              </div>
              <p className="font-semibold">Cost<br/>Recovery</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="h-20 w-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">✓</span>
                </div>
              </div>
              <p className="font-semibold">Accuracy<br/>Guarantee</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="h-20 w-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">⚡</span>
                </div>
              </div>
              <p className="font-semibold">Fast<br/>Setup</p>
            </div>
          </div>
        </section>

        {/* Carrier Integration */}
        <section className="text-center mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            Seamless Carrier Integration
          </h2>
          
          <div className="flex justify-center mb-6">
            <img 
              src="/images/logos/carrier-integration.png" 
              alt="UPS, FedEx, USPS, DHL Integration" 
              className="w-full max-w-2xl h-auto object-contain"
            />
          </div>
          
          <p className="text-gray-600 text-sm mb-8">
            Connect with UPS, FedEx, DHL, and USPS in minutes. Read-only access ensures your data security.
          </p>
          
          {/* Security Badges */}
          <div className="flex justify-center mb-8">
            <img 
              src="/images/trust/security-badges.png" 
              alt="SOC 2 Type II, GDPR Compliant, Read-Only Access" 
              className="w-full max-w-md h-auto object-contain"
            />
          </div>
          
          {/* Customer Logos */}
          <div className="flex justify-center">
            <img 
              src="/images/customers/customer-logos.png" 
              alt="Customer Logos" 
              className="w-full max-w-md h-auto object-contain"
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-4 pb-4">
          <div className="flex items-center justify-center gap-4">
            <img 
              src="/images/logos/parcel-audit-logo.png" 
              alt="Parcel Audit Logo" 
              className="h-8 w-auto object-contain opacity-60"
            />
            <span className="text-xs text-gray-500">
              Powered by{" "}
              <a 
                href="https://spotcircuit.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                SpotCircuit
              </a>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}