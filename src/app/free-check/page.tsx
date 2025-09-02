"use client";

import { useState } from "react";
import Link from "next/link";
import LogoHeader from "@/components/LogoHeader";

interface TrackingItem {
  tracking: string;
  carrier: "UPS" | "FedEx" | "";
  shipDate?: string;
  service?: string;
}

interface CheckResult {
  tracking: string;
  carrier: string;
  service: string;
  scheduled: string;
  delivered: string;
  status: "Eligible" | "Late" | "On-time" | "Checking";
  claimBy?: string;
  estimatedRefund?: number;
}

export default function FreeCheckPage() {
  const [trackingNumbers, setTrackingNumbers] = useState("");
  const [selectedCarrier, setSelectedCarrier] = useState<"UPS" | "FedEx" | "">("");
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    eligible: 0,
    estimatedValue: 0
  });
  const [checkId, setCheckId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleCheck = async () => {
    setIsChecking(true);
    
    // Parse tracking numbers
    const lines = trackingNumbers.trim().split('\n').filter(line => line.trim());
    const items: TrackingItem[] = lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      return {
        tracking: parts[0],
        carrier: (parts[1] as "UPS" | "FedEx") || selectedCarrier,
        shipDate: parts[2],
        service: parts[3]
      };
    });

    try {
      const response = await fetch('/api/late-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, email: email || undefined })
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data.rows);
        setSummary(data.summary);
        setCheckId(data.id);
        setShowResults(true);
        
        // Track in GTM
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({
            event: 'audit_complete',
            eligible_count: data.summary.eligible,
            amount_found: data.summary.estimatedValue
          });
        }
      }
    } catch (error) {
      console.error('Check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleDemoMode = async () => {
    setTrackingNumbers(`1Z999AA10123456784, UPS
794644792985, FedEx
1Z999AA10123456785, UPS
794644792986, FedEx
1Z999AA10123456786, UPS`);
    setSelectedCarrier("");
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setTrackingNumbers(text);
      };
      reader.readAsText(file);
    }
  };

  const downloadCSV = () => {
    if (!checkId) return;
    window.open(`/api/late-check/${checkId}/csv`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-8">
          <LogoHeader size="large" opacity={80} />
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Free Late-Delivery Checker
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Check up to 50 tracking numbers for late deliveries. Get instant results and claim your refunds within 15 days.
          </p>
        </header>

        {!showResults ? (
          <div className="max-w-3xl mx-auto">
            {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter Tracking Numbers
                </label>
                <textarea
                  value={trackingNumbers}
                  onChange={(e) => setTrackingNumbers(e.target.value)}
                  placeholder="Enter tracking numbers (one per line)&#10;Or format: tracking, carrier, ship date, service&#10;Example: 1Z999AA10123456784, UPS, 2024-01-10, Ground"
                  className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-500">
                    {trackingNumbers.split('\n').filter(l => l.trim()).length}/50 tracking numbers
                  </span>
                  <button
                    onClick={handleDemoMode}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Try with sample data
                  </button>
                </div>
              </div>

              {/* Carrier Selection */}
              <div className="mb-6 flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Default Carrier (optional)
                  </label>
                  <select
                    value={selectedCarrier}
                    onChange={(e) => setSelectedCarrier(e.target.value as "UPS" | "FedEx" | "")}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Auto-detect</option>
                    <option value="UPS">UPS</option>
                    <option value="FedEx">FedEx</option>
                  </select>
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Or Upload CSV
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="w-full p-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              {/* Email (optional) */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email (optional - get results link)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Check Button */}
              <button
                onClick={handleCheck}
                disabled={isChecking || !trackingNumbers.trim()}
                className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isChecking ? "Checking..." : "Check Late Deliveries →"}
              </button>
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="font-semibold mb-1">Instant Results</h3>
                <p className="text-sm text-gray-600">Get results in seconds</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">💰</div>
                <h3 className="font-semibold mb-1">Claim Refunds</h3>
                <p className="text-sm text-gray-600">File within 15 days</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">🔒</div>
                <h3 className="font-semibold mb-1">100% Free</h3>
                <p className="text-sm text-gray-600">No credit card required</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Results Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{summary.total}</div>
                  <div className="text-sm text-gray-600">Checked</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">{summary.eligible}</div>
                  <div className="text-sm text-gray-600">Eligible for Refund</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    ${summary.estimatedValue.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Estimated Recovery</div>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carrier</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivered</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claim By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {results.map((result, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono">
                          {result.tracking.substring(0, 4)}****{result.tracking.slice(-4)}
                        </td>
                        <td className="px-4 py-3 text-sm">{result.carrier}</td>
                        <td className="px-4 py-3 text-sm">{result.service}</td>
                        <td className="px-4 py-3 text-sm">{new Date(result.scheduled).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm">{new Date(result.delivered).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            result.status === 'Eligible' 
                              ? 'bg-green-100 text-green-800'
                              : result.status === 'Late'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {result.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {result.claimBy && new Date(result.claimBy).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🎯 Get Full Claim Pack
                </h3>
                <p className="text-gray-600 mb-4">
                  Download complete tracking details, formatted claim templates, and carrier-ready dispute documentation.
                </p>
                <Link
                  href={`/auth/signup?source=late-check&eligible=${summary.eligible}`}
                  className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                >
                  Unlock Full Export →
                </Link>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  📊 Find More Savings
                </h3>
                <p className="text-gray-600 mb-4">
                  Upload your full invoice to detect weight mismatches, invalid surcharges, and duplicate billing.
                </p>
                <Link
                  href="/upload"
                  className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                >
                  Full Invoice Audit →
                </Link>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={downloadCSV}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Download Preview CSV
              </button>
              <button
                onClick={() => {
                  setShowResults(false);
                  setTrackingNumbers("");
                  setResults([]);
                }}
                className="px-6 py-2 text-gray-600 hover:text-gray-900"
              >
                Check More Trackings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}