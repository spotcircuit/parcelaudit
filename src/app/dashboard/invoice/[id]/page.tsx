"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import LogoHeader from "@/components/LogoHeader";
import ErrorDetailsModal from "@/components/ErrorDetailsModal";
import DisputeModal from "@/components/DisputeModal";
import FormatSelectionModal from "@/components/FormatSelectionModal";

interface AuditError {
  id: string;
  tracking_number: string;
  carrier: string;
  error_type: string;
  description: string;
  recovery_amount: number;
  original_charge?: number;
  corrected_charge?: number;
  confidence_score?: number;
  status: string;
  detected_at: string;
}

interface InvoiceDetails {
  invoice_number: string;
  file_name: string;
  carrier: string;
  total_amount: number;
  uploaded_at: string;
  line_items_count: number;
}

export default function InvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  // User auth disabled in demo mode
  const uploadId = params.id as string;
  
  const [errors, setErrors] = useState<AuditError[]>([]);
  const [filteredErrors, setFilteredErrors] = useState<AuditError[]>([]);
  const [selectedErrorType, setSelectedErrorType] = useState<string>('all');
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<AuditError | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeError, setDisputeError] = useState<AuditError | null>(null);
  const [selectedErrors, setSelectedErrors] = useState<Set<string>>(new Set());
  const [showFormatModal, setShowFormatModal] = useState(false);
  
  const [stats, setStats] = useState({
    totalErrors: 0,
    totalRecovery: 0,
    disputedCount: 0,
    creditedCount: 0
  });

  useEffect(() => {
    if (uploadId) {
      fetchInvoiceDetails();
    }
  }, [uploadId]);

  // Filter errors when error type selection changes
  useEffect(() => {
    if (selectedErrorType === 'all') {
      setFilteredErrors(errors);
      // Select all errors when showing all
      setSelectedErrors(new Set(errors.map(e => e.id)));
    } else {
      const filtered = errors.filter(e => e.error_type === selectedErrorType);
      setFilteredErrors(filtered);
      // Select all filtered errors
      setSelectedErrors(new Set(filtered.map(e => e.id)));
    }
  }, [selectedErrorType, errors]);

  const fetchInvoiceDetails = async () => {
    setIsLoading(true);
    try {
      const userId = user?.id || "anonymous";
      
      // Fetch errors for this specific upload
      const response = await fetch(`/api/audit-results?userId=${userId}&uploadId=${uploadId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API response:', data); // Debug log
        
        // Map errors from camelCase to snake_case
        if (data.errors) {
          const mappedErrors = data.errors.map((error: any) => ({
            id: error.id,
            tracking_number: error.trackingNumber || error.tracking_number,
            carrier: error.carrier,
            error_type: error.errorType || error.error_type,
            description: error.description,
            original_charge: error.originalCharge || error.original_charge,
            corrected_charge: error.correctedCharge || error.corrected_charge,
            recovery_amount: error.recoveryAmount || error.recovery_amount,
            confidence_score: error.confidence || error.confidence_score,
            status: error.status,
            detected_at: error.detectedAt || error.detected_at
          }));
          
          setErrors(mappedErrors);
          setFilteredErrors(mappedErrors);
          
          // Select all errors by default
          setSelectedErrors(new Set(mappedErrors.map((e: any) => e.id)));
          
          // Extract invoice details from first error
          if (data.errors.length > 0) {
            const firstError = data.errors[0];
            setInvoiceDetails({
              invoice_number: firstError.invoice_number || `INV-${uploadId}`,
              file_name: firstError.file_name || 'Unknown',
              carrier: firstError.carrier || 'UPS',
              total_amount: firstError.invoice_total || 0,
              uploaded_at: firstError.detected_at,
              line_items_count: data.errors.length
            });
          }
        }
        
        // Set stats from summary
        if (data.summary) {
          setStats({
            totalErrors: data.summary.totalErrors || 0,
            totalRecovery: data.summary.totalRecovery || 0,
            disputedCount: data.summary.disputedCount || 0,
            creditedCount: data.summary.creditedCount || 0
          });
        }
      }
    } catch (error) {
      console.error("Error fetching invoice details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewError = (error: AuditError) => {
    setSelectedError({
      ...error,
      id: error.id,
      trackingNumber: error.tracking_number,
      carrier: error.carrier,
      errorType: error.error_type,
      description: error.description,
      recoveryAmount: error.recovery_amount,
      originalCharge: error.original_charge,
      correctedCharge: error.corrected_charge,
      confidenceScore: error.confidence_score,
      status: error.status,
      createdAt: new Date(error.detected_at).toLocaleDateString(),
      invoiceNumber: invoiceDetails?.invoice_number,
      fileName: invoiceDetails?.file_name
    } as any);
    setShowDetailsModal(true);
  };

  const handleGenerateDisputeWithMessage = (errorId: string, customMessage: string) => {
    // Generate dispute packet with custom message
    const encodedMessage = encodeURIComponent(customMessage);
    window.open(`/api/dispute-packet?errorIds=${errorId}&customMessage=${encodedMessage}`, '_blank');
  };

  const handleGenerateDispute = (errorId: string) => {
    // Open dispute modal from error details modal
    if (selectedError) {
      setDisputeError(selectedError);
      setShowDisputeModal(true);
      setShowDetailsModal(false); // Close the details modal
    }
  };

  const generateDisputePacket = () => {
    const selectedIds = Array.from(selectedErrors).join(',');
    if (selectedIds) {
      setShowFormatModal(true);
    } else {
      alert("Please select errors to include in the dispute packet");
    }
  };

  const handleFormatSelect = (format: 'pdf' | 'csv' | 'html') => {
    const selectedIds = Array.from(selectedErrors).join(',');
    window.open(`/api/dispute-packet?errorIds=${selectedIds}&format=${format}`, '_blank');
  };

  const getErrorTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Dimensional Weight Error': 'bg-blue-100 text-blue-800',
      'Late Delivery Refund': 'bg-red-100 text-red-800',
      'Invalid Address Correction': 'bg-yellow-100 text-yellow-800',
      'Duplicate Charge': 'bg-purple-100 text-purple-800',
      'Invalid Residential Surcharge': 'bg-orange-100 text-orange-800',
      'Peak Surcharge Off-Season': 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'identified': 'bg-gray-100 text-gray-800',
      'disputed': 'bg-blue-100 text-blue-800',
      'credited': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modals */}
      <ErrorDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        error={selectedError}
        onDispute={handleGenerateDispute}
      />
      
      <DisputeModal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        error={disputeError}
        onGenerate={handleGenerateDisputeWithMessage}
      />
      
      <FormatSelectionModal
        isOpen={showFormatModal}
        onClose={() => setShowFormatModal(false)}
        onSelect={handleFormatSelect}
        title="Export Dispute Packet"
        description="Select your preferred format for the dispute packet"
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-500 hover:text-gray-700 mr-2"
              >
                ← Back
              </button>
              <LogoHeader size="medium" opacity={100} />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Invoice Details
                </h1>
                {invoiceDetails && (
                  <p className="text-sm text-gray-600">
                    {invoiceDetails.invoice_number} • {invoiceDetails.file_name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={generateDisputePacket}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                📋 Generate Dispute Packet
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="text-sm text-gray-600 mb-1">Total Errors</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalErrors}</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="text-sm text-gray-600 mb-1">Total Recovery</div>
            <div className="text-3xl font-bold text-green-600">
              ${(Number(stats.totalRecovery) || 0).toFixed(2)}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="text-sm text-gray-600 mb-1">Disputed</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.disputedCount}</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="text-sm text-gray-600 mb-1">Credited</div>
            <div className="text-3xl font-bold text-green-600">{stats.creditedCount}</div>
          </motion.div>
        </div>

        {/* Errors Table with Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow"
        >
          <div className="px-6 py-2 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Audit Errors Found</h2>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Filter by type:</label>
              <select
                value={selectedErrorType}
                onChange={(e) => setSelectedErrorType(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types ({errors.length})</option>
                {Array.from(new Set(errors.map(e => e.error_type))).map(type => {
                  const count = errors.filter(e => e.error_type === type).length;
                  return (
                    <option key={type} value={type}>
                      {type} ({count})
                    </option>
                  );
                })}
              </select>
              <div className="text-sm text-gray-500">
                Showing {filteredErrors.length} of {errors.length} errors
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={filteredErrors.length > 0 && selectedErrors.size === filteredErrors.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedErrors(new Set(filteredErrors.map(e => e.id)));
                        } else {
                          setSelectedErrors(new Set());
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Error Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recovery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredErrors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      {selectedErrorType === 'all' 
                        ? "No errors found for this invoice" 
                        : `No "${selectedErrorType}" errors found`}
                    </td>
                  </tr>
                ) : (
                  filteredErrors.map((error) => (
                    <tr key={error.id} className="hover:bg-gray-50">
                      <td className="px-6 py-2">
                        <input
                          type="checkbox"
                          checked={selectedErrors.has(error.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedErrors);
                            if (e.target.checked) {
                              newSelected.add(error.id);
                            } else {
                              newSelected.delete(error.id);
                            }
                            setSelectedErrors(newSelected);
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {error.tracking_number}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getErrorTypeColor(error.error_type)}`}>
                          {error.error_type}
                        </span>
                      </td>
                      <td className="px-6 py-2 text-sm text-gray-500">
                        {error.description}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-green-600">
                        ${(Number(error.recovery_amount) || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                        {error.confidence_score ? `${error.confidence_score}%` : '-'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(error.status)}`}>
                          {error.status}
                        </span>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewError(error)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* UPS Dispute Process Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-50 rounded-lg shadow p-6 mt-8"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 UPS Dispute Process</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>1. Generate Dispute Packet:</strong> Select errors and click "Generate Dispute Packet" to create a formal dispute document.</p>
            <p><strong>2. Submit to UPS:</strong> Send the dispute packet to UPS Billing via:</p>
            <ul className="ml-6 list-disc">
              <li>UPS Billing Analysis Tool (BAT) - fastest response</li>
              <li>Email: uspbilling@ups.com</li>
              <li>Phone: 1-800-811-1648</li>
            </ul>
            <p><strong>3. Timeline:</strong> UPS typically responds within 15-30 days. Credits appear on next invoice.</p>
            <p><strong>4. Important:</strong> Disputes must be filed within 180 days of invoice date.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}