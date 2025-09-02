"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ErrorDetails {
  id: string;
  trackingNumber: string;
  carrier: string;
  errorType: string;
  description: string;
  recoveryAmount: number;
  originalCharge?: number;
  correctedCharge?: number;
  confidenceScore?: number;
  status: string;
  createdAt: string;
  invoiceNumber?: string;
  fileName?: string;
}

interface ErrorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: ErrorDetails | null;
  onDispute: (errorId: string) => void;
}

export default function ErrorDetailsModal({ 
  isOpen, 
  onClose, 
  error,
  onDispute 
}: ErrorDetailsModalProps) {

  if (!error) return null;

  // Explanations for why each error type is wrong
  const errorExplanations: Record<string, { title: string; explanation: string[]; impact: string }> = {
    'Dimensional Weight Error': {
      title: 'Why This Charge is Incorrect',
      explanation: [
        'The carrier calculated dimensional weight incorrectly by using wrong package measurements.',
        'Dimensional weight is calculated as (Length × Width × Height) / Dimensional Factor.',
        'The billed weight exceeds the actual dimensional weight calculation.',
        'This is a common billing error that carriers often correct when disputed.'
      ],
      impact: 'You are being overcharged for shipping based on inflated weight calculations.'
    },
    'Late Delivery Refund': {
      title: 'Why You Deserve a Refund',
      explanation: [
        'The carrier guaranteed delivery by a specific date/time but failed to meet it.',
        'Service guarantees are contractual obligations that entitle you to a full refund when not met.',
        'Weather and acts of God are typically the only valid exceptions.',
        'Carriers must honor their service guarantees or provide refunds.'
      ],
      impact: 'You paid premium rates for guaranteed service that was not delivered.'
    },
    'Invalid Address Correction': {
      title: 'Why This Fee is Invalid',
      explanation: [
        'Address correction fees should only apply when the shipper provides an incorrect address.',
        'If the address was complete and accurate, no correction fee should be charged.',
        'Carriers sometimes incorrectly apply these fees to commercial addresses.',
        'These fees are often removed when properly disputed.'
      ],
      impact: 'You are being charged for a service that was not needed or provided.'
    },
    'Duplicate Charge': {
      title: 'Why This is a Billing Error',
      explanation: [
        'The same shipment has been billed multiple times.',
        'This is a clear billing system error that requires immediate correction.',
        'Duplicate charges often occur during billing system updates or glitches.',
        'Carriers will quickly correct these when identified.'
      ],
      impact: 'You are being double-charged for a single shipment.'
    },
    'Invalid Residential Surcharge': {
      title: 'Why This Surcharge is Wrong',
      explanation: [
        'Residential surcharges only apply to home deliveries, not commercial addresses.',
        'The delivery address is clearly a business/commercial location.',
        'Carriers sometimes misclassify addresses in their systems.',
        'This surcharge should be removed for all commercial deliveries.'
      ],
      impact: 'You are paying residential fees for commercial deliveries.'
    },
    'Peak Surcharge Off-Season': {
      title: 'Why This Surcharge is Invalid',
      explanation: [
        'Peak surcharges only apply during designated peak seasons (typically holidays).',
        'This shipment occurred outside of any published peak periods.',
        'Carriers must announce peak periods in advance and cannot apply them retroactively.',
        'These surcharges are date-specific and easily verified.'
      ],
      impact: 'You are being charged holiday rates during regular shipping periods.'
    }
  };

  const errorInfo = errorExplanations[error.errorType] || {
    title: 'Why This Charge Should Be Reviewed',
    explanation: [
      'This charge appears to be incorrectly applied based on our audit.',
      'The amount charged exceeds what should have been billed.',
      'Billing errors like this are common and often corrected when disputed.'
    ],
    impact: 'You are being overcharged on this shipment.'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Audit Error Details
                    </h2>
                    <p className="text-sm text-blue-100 mt-1">
                      {error.trackingNumber} • {error.carrier}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white hover:text-gray-200"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Error Type Badge */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    {error.errorType}
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    ${(Number(error.recoveryAmount) || 0).toFixed(2)} Recovery
                  </span>
                </div>

                {/* Key Information Grid */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Invoice</p>
                    <p className="font-medium">{error.invoiceNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium capitalize">{error.status}</p>
                  </div>
                  {error.originalCharge && (
                    <div>
                      <p className="text-sm text-gray-600">Original Charge</p>
                      <p className="font-medium">${(Number(error.originalCharge) || 0).toFixed(2)}</p>
                    </div>
                  )}
                  {error.correctedCharge !== undefined && (
                    <div>
                      <p className="text-sm text-gray-600">Correct Charge</p>
                      <p className="font-medium">${(Number(error.correctedCharge) || 0).toFixed(2)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Confidence</p>
                    <p className="font-medium">{error.confidenceScore || 95}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Detection Date</p>
                    <p className="font-medium">{error.createdAt}</p>
                  </div>
                </div>

                {/* Error Description */}
                <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
                  <p className="text-sm font-medium text-yellow-800 mb-1">Error Description</p>
                  <p className="text-sm text-yellow-700">{error.description}</p>
                </div>

                {/* Why This is Wrong Section */}
                <div className="bg-blue-50 rounded-lg p-5">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {errorInfo.title}
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    {errorInfo.explanation.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                    <p className="text-sm font-medium text-blue-900">Financial Impact:</p>
                    <p className="text-sm text-blue-700 mt-1">{errorInfo.impact}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => onDispute(error.id)}
                    className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    Generate Dispute
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}