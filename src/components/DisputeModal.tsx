"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/Toast";

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: any;
  onGenerate: (errorId: string, customMessage: string) => void;
}

export default function DisputeModal({ isOpen, onClose, error, onGenerate }: DisputeModalProps) {
  const [disputeMessage, setDisputeMessage] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<'email' | 'csv' | 'html'>('email');
  const [accountNumber, setAccountNumber] = useState("");
  const { addToast } = useToast();
  
  useEffect(() => {
    if (error) {
      // Set default dispute message based on error type
      const defaultMessages: Record<string, string> = {
        'Dimensional Weight Error': `We are disputing a dimensional weight charge discrepancy on tracking number ${error.tracking_number}. The billed weight (${error.description}) appears to be incorrect based on actual package dimensions. Our calculations show the correct dimensional weight should result in a lower charge. Please review this shipment and credit our account for $${(Number(error.recovery_amount) || 0).toFixed(2)}.`,
        
        'Late Delivery Refund': `This shipment with tracking number ${error.tracking_number} did not meet the guaranteed delivery commitment. According to UPS service guarantee policy, we are entitled to a full refund of the shipping charges. Please process a credit of $${(Number(error.recovery_amount) || 0).toFixed(2)} to our account.`,
        
        'Invalid Address Correction': `An address correction fee was incorrectly applied to tracking number ${error.tracking_number}. The delivery address provided was complete and accurate at the time of shipping. This charge of $${(Number(error.recovery_amount) || 0).toFixed(2)} should be removed from our invoice.`,
        
        'Duplicate Charge': `We have identified a duplicate charge for tracking number ${error.tracking_number}. This shipment appears to have been billed twice on our invoice. Please remove the duplicate charge of $${(Number(error.recovery_amount) || 0).toFixed(2)} from our account.`,
        
        'Invalid Residential Surcharge': `A residential delivery surcharge was incorrectly applied to tracking number ${error.tracking_number}. The delivery address is a commercial location, not residential. Please remove this surcharge of $${(Number(error.recovery_amount) || 0).toFixed(2)}.`,
        
        'Peak Surcharge Off-Season': `A peak season surcharge was applied to tracking number ${error.tracking_number} outside of the designated UPS peak period. This charge of $${(Number(error.recovery_amount) || 0).toFixed(2)} is invalid and should be credited to our account.`
      };
      
      const defaultMessage = defaultMessages[error.error_type] || 
        `We are disputing a charge of $${(Number(error.recovery_amount) || 0).toFixed(2)} for tracking number ${error.tracking_number}. ${error.description}. Please review this charge and credit our account accordingly.`;
      
      setDisputeMessage(defaultMessage);
      
      // Load account number - first check invoice, then localStorage
      if (error.account_number) {
        setAccountNumber(error.account_number);
      } else {
        const savedAccount = localStorage.getItem('ups_account_number');
        if (savedAccount) {
          setAccountNumber(savedAccount);
        }
      }
    }
  }, [error]);

  const generateEmailFormat = () => {
    if (!error) return '';
    
    const emailText = `Subject: Billing Dispute - Invoice #${error.invoice_number || 'PENDING'} - Account #${accountNumber}

Account Number: ${accountNumber}
Invoice Number: ${error.invoice_number || 'PENDING'}
Invoice Date: ${error.invoice_date || new Date().toLocaleDateString()}

Tracking Number: ${error.tracking_number}
Service Type: ${error.carrier} ${error.service_type || 'Ground'}
Shipment Date: ${error.ship_date || error.created_at || new Date().toLocaleDateString()}

Dispute Type: ${error.error_type}
Disputed Amount: $${(Number(error.recovery_amount) || 0).toFixed(2)}

Explanation:
${disputeMessage}

Original Charge: $${(Number(error.original_charge) || Number(error.recovery_amount) || 0).toFixed(2)}
Correct Charge: $${(Number(error.corrected_charge) || 0).toFixed(2)}
Credit Requested: $${(Number(error.recovery_amount) || 0).toFixed(2)}

Please credit our account and provide written confirmation.

Thank you for your prompt attention to this matter.`;

    return emailText;
  };

  const generateCSVContent = () => {
    if (!error) return '';
    
    const csvHeader = 'Tracking_Number,Invoice_Number,Dispute_Type,Dispute_Amount,Reason';
    const csvRow = `${error.tracking_number},${error.invoice_number || 'PENDING'},${error.error_type.replace(/\s+/g, '_').toUpperCase()},${(Number(error.recovery_amount) || 0).toFixed(2)},"${disputeMessage.replace(/"/g, '""')}"`;
    
    return `${csvHeader}\n${csvRow}`;
  };

  const handleCopyEmail = () => {
    const emailText = generateEmailFormat();
    navigator.clipboard.writeText(emailText).then(() => {
      addToast('success', 'Dispute copied! Ready to paste into your email client.');
    }).catch(() => {
      addToast('error', 'Failed to copy. Please try again.');
    });
  };

  const handleDownloadCSV = () => {
    const csvContent = generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ups_dispute_${error?.tracking_number}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    addToast('success', 'CSV downloaded! Ready to upload to UPS BAT.');
  };

  const handleGenerateHTML = () => {
    if (error) {
      // Save account number for future use
      if (accountNumber) {
        localStorage.setItem('ups_account_number', accountNumber);
      }
      onGenerate(error.id, disputeMessage);
      onClose();
    }
  };

  if (!isOpen || !error) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Generate UPS Dispute
                </h2>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Format Selection Tabs */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex space-x-1 p-2">
                <button
                  onClick={() => setSelectedFormat('email')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    selectedFormat === 'email' 
                      ? 'bg-white text-green-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  📧 Email Format
                </button>
                <button
                  onClick={() => setSelectedFormat('csv')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    selectedFormat === 'csv' 
                      ? 'bg-white text-green-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  📊 UPS BAT (CSV)
                </button>
                <button
                  onClick={() => setSelectedFormat('html')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    selectedFormat === 'html' 
                      ? 'bg-white text-green-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  📄 Print/PDF
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Account Number Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UPS Account Number
                  <span className="ml-2 text-xs text-gray-500">(Found on your invoice header)</span>
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter your UPS account number (e.g., A1B2C3)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This is typically a 6-character code shown on your UPS invoice
                </p>
              </div>

              {/* Error Details Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Tracking:</span>
                    <span className="ml-2 font-medium">{error.tracking_number}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Error Type:</span>
                    <span className="ml-2 font-medium">{error.error_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Recovery:</span>
                    <span className="ml-2 font-medium text-green-600">
                      ${(Number(error.recovery_amount) || 0).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Invoice:</span>
                    <span className="ml-2 font-medium">{error.invoice_number || 'Pending'}</span>
                  </div>
                </div>
              </div>

              {/* Editable Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dispute Message
                  <span className="ml-2 text-xs text-gray-500">
                    (Edit to customize your dispute reason)
                  </span>
                </label>
                <textarea
                  value={disputeMessage}
                  onChange={(e) => setDisputeMessage(e.target.value)}
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Enter your dispute reason..."
                />
                <div className="mt-1 text-xs text-gray-500">
                  {disputeMessage.length} characters
                </div>
              </div>

              {/* Format Preview */}
              {selectedFormat === 'email' && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">📧 Email Preview:</h4>
                  <pre className="text-xs text-blue-800 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-blue-200">
                    {generateEmailFormat()}
                  </pre>
                </div>
              )}

              {selectedFormat === 'csv' && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-900 mb-2">📊 CSV Preview (UPS BAT Format):</h4>
                  <pre className="text-xs text-green-800 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-green-200">
                    {generateCSVContent()}
                  </pre>
                  <p className="mt-2 text-xs text-green-700">
                    This CSV can be uploaded directly to UPS Billing Analysis Tool for bulk dispute processing.
                  </p>
                </div>
              )}

              {selectedFormat === 'html' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">📄 Document Format:</h4>
                  <p className="text-sm text-gray-700">
                    Generates a formal dispute document in HTML format that can be printed or saved as PDF for your records.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    // Reset to default message
                    if (error) {
                      const defaultMessages: Record<string, string> = {
                        'Dimensional Weight Error': `We are disputing a dimensional weight charge discrepancy on tracking number ${error.tracking_number}. The billed weight (${error.description}) appears to be incorrect based on actual package dimensions. Our calculations show the correct dimensional weight should result in a lower charge. Please review this shipment and credit our account for $${(Number(error.recovery_amount) || 0).toFixed(2)}.`,
                      };
                      const defaultMessage = defaultMessages[error.error_type] || 
                        `We are disputing a charge of $${(Number(error.recovery_amount) || 0).toFixed(2)} for tracking number ${error.tracking_number}. ${error.description}. Please review this charge and credit our account accordingly.`;
                      setDisputeMessage(defaultMessage);
                    }
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Reset Message
                </button>
                <div className="space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  {selectedFormat === 'email' && (
                    <button
                      onClick={handleCopyEmail}
                      disabled={!accountNumber}
                      className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      📋 Copy for Email
                    </button>
                  )}
                  {selectedFormat === 'csv' && (
                    <button
                      onClick={handleDownloadCSV}
                      disabled={!accountNumber}
                      className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ⬇️ Download CSV
                    </button>
                  )}
                  {selectedFormat === 'html' && (
                    <button
                      onClick={handleGenerateHTML}
                      disabled={!accountNumber}
                      className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      📄 Generate Document
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}