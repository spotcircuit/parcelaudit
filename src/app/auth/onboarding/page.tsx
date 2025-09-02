"use client";

import { useState } from "react";
import { useUser, useStackApp } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import LogoHeader from "@/components/LogoHeader";

export default function OnboardingPage() {
  const user = useUser({ or: "redirect" });
  const app = useStackApp();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    website: "",
    phone: "",
    industry: "",
    monthlyShipments: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update user metadata
      await user.update({
        clientMetadata: {
          ...user.clientMetadata,
          firstName: formData.firstName,
          lastName: formData.lastName,
          businessName: formData.businessName,
          website: formData.website,
          phone: formData.phone,
          industry: formData.industry,
          monthlyShipments: formData.monthlyShipments,
          onboardingCompleted: true
        },
        displayName: `${formData.firstName} ${formData.lastName}`
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error updating user:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <LogoHeader size="medium" opacity={80} />
        
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Parcel Audit!</h1>
            <p className="text-gray-600 mb-6">Let's get to know you better to personalize your experience.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an industry</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="retail">Retail</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="logistics">Logistics</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Shipments (Approximate)
                </label>
                <select
                  value={formData.monthlyShipments}
                  onChange={(e) => setFormData({...formData, monthlyShipments: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select range</option>
                  <option value="0-100">0-100</option>
                  <option value="101-500">101-500</option>
                  <option value="501-1000">501-1,000</option>
                  <option value="1001-5000">1,001-5,000</option>
                  <option value="5001-10000">5,001-10,000</option>
                  <option value="10000+">10,000+</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Complete Setup"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}