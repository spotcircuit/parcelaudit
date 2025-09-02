"use client";

import { useState } from "react";
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [disputeText, setDisputeText] = useState("");

  const generateDisputePacket = () => {
    if (!error) return;
    
    setIsGenerating(true);
    
    // Generate dispute text based on error type
    const disputeTemplates: Record<string, string> = {
      'Dimensional Weight Error': `
Dear ${error.carrier} Billing Department,

RE: Billing Dispute - Tracking Number ${error.trackingNumber}

We are disputing a dimensional weight charge on the above shipment. Our analysis indicates:

Original Billed Amount: $${(Number(error.originalCharge) || Number(error.recoveryAmount) || 0).toFixed(2)}
Correct Amount: $${(Number(error.correctedCharge) || 0).toFixed(2)}
Overcharge Amount: $${(Number(error.recoveryAmount) || 0).toFixed(2)}

Error Details: ${error.description}

The package dimensions were incorrectly measured, resulting in an inflated dimensional weight calculation. We request an immediate review and credit for the overcharge.

Please credit our account for $${(Number(error.recoveryAmount) || 0).toFixed(2)} and provide confirmation.

Thank you for your prompt attention to this matter.
      `,
      'Late Delivery Refund': `
Dear ${error.carrier} Customer Service,

RE: Service Guarantee Refund Request - Tracking Number ${error.trackingNumber}

This shipment did not meet the guaranteed delivery commitment. Per your service guarantee policy, we are entitled to a full refund.

Service Type: ${error.carrier === 'UPS' ? 'Next Day Air' : 'Priority Overnight'}
Shipment Charge: $${(Number(error.originalCharge) || Number(error.recoveryAmount) || 0).toFixed(2)}
Refund Due: $${(Number(error.recoveryAmount) || 0).toFixed(2)}

Error Details: ${error.description}

Please process the refund within 7 business days and provide confirmation.

Thank you for your attention to this matter.
      `,
      'Invalid Address Correction': `
Dear ${error.carrier} Billing Department,

RE: Invalid Address Correction Fee - Tracking Number ${error.trackingNumber}

We are disputing an address correction fee of $${(Number(error.recoveryAmount) || 0).toFixed(2)} charged on this shipment.

The delivery address provided was complete and accurate. No correction was necessary or requested. This fee was applied in error.

Please remove this charge and credit our account for $${(Number(error.recoveryAmount) || 0).toFixed(2)}.

Thank you for correcting this billing error.
      `,
      'Invalid Residential Surcharge': `
Dear ${error.carrier} Billing Department,

RE: Invalid Residential Surcharge - Tracking Number ${error.trackingNumber}

A residential delivery surcharge of $${(Number(error.recoveryAmount) || 0).toFixed(2)} was incorrectly applied to this shipment.

The delivery address is a commercial location, not a residential address. This surcharge should not have been applied.

Please remove this charge and credit our account for $${(Number(error.recoveryAmount) || 0).toFixed(2)}.

Thank you for your prompt correction.
      `
    };

    const template = disputeTemplates[error.errorType] || `
Dear ${error.carrier} Billing Department,

RE: Billing Dispute - Tracking Number ${error.trackingNumber}

We are disputing a charge on the above shipment.

Error Type: ${error.errorType}
Disputed Amount: $${(Number(error.recoveryAmount) || 0).toFixed(2)}
Error Details: ${error.description}

Please review this charge and credit our account for $${(Number(error.recoveryAmount) || 0).toFixed(2)}.

Thank you for your attention to this matter.
    `;

    setTimeout(() => {
      setDisputeText(template.trim());
      setIsGenerating(false);
    }, 1000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(disputeText);
    // You could add a toast notification here
  };

  const downloadDispute = () => {
    const blob = new Blob([disputeText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dispute_${error?.trackingNumber}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!error) return null;

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
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Error Details
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Tracking: {error.trackingNumber}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-4">
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column - Error Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Error Information</h3>
                      <dl className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Type:</dt>
                          <dd className="text-sm font-medium text-gray-900">{error.errorType}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Carrier:</dt>
                          <dd className="text-sm font-medium text-gray-900">{error.carrier}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Status:</dt>
                          <dd className="text-sm font-medium text-gray-900">{error.status}</dd>
                        </div>
                        {error.invoiceNumber && (
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Invoice:</dt>
                            <dd className="text-sm font-medium text-gray-900">{error.invoiceNumber}</dd>
                          </div>
                        )}
                        {error.fileName && (
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">File:</dt>
                            <dd className="text-sm font-medium text-gray-900">{error.fileName}</dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Financial Impact</h3>
                      <dl className="mt-2 space-y-2">
                        {error.originalCharge && (
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Original Charge:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              ${(Number(error.originalCharge) || 0).toFixed(2)}
                            </dd>
                          </div>
                        )}
                        {error.correctedCharge !== undefined && (
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Correct Charge:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              ${(Number(error.correctedCharge) || 0).toFixed(2)}
                            </dd>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Recovery Amount:</dt>
                          <dd className="text-sm font-medium text-green-600">
                            ${(Number(error.recoveryAmount) || 0).toFixed(2)}
                          </dd>
                        </div>
                        {error.confidenceScore && (
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-600">Confidence Score:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {error.confidenceScore}%
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="mt-2 text-sm text-gray-700">
                        {error.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Column - Dispute Generation */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-500">Dispute Documentation</h3>
                      {!disputeText && (
                        <button
                          onClick={generateDisputePacket}
                          disabled={isGenerating}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isGenerating ? 'Generating...' : 'Generate Dispute'}
                        </button>
                      )}
                    </div>

                    {disputeText && (
                      <>
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                            {disputeText}
                          </pre>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={copyToClipboard}
                            className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                          >
                            Copy to Clipboard
                          </button>
                          <button
                            onClick={downloadDispute}
                            className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Download
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      onDispute(error.id);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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