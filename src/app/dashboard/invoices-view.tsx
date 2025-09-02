"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import LogoHeader from "@/components/LogoHeader";
import { Toast, useToast } from "@/components/Toast";
import FormatSelectionModal from "@/components/FormatSelectionModal";

interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  carrier: string;
  total_amount: number;
  line_items_count: number;
  status: string;
  upload_id: number;
  file_name: string;
  uploaded_at: string;
  error_count: number;
  total_recovery: number;
  disputed_count: number;
  credited_count: number;
}

interface InvoiceStats {
  total_invoices: number;
  total_audited: number;
  total_errors: number;
  total_recovery: number;
  pending_disputes: number;
  credited_amount: number;
}

export default function InvoicesView() {
  const router = useRouter();
  // User auth disabled in demo mode
  const { messages, addToast, removeToast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats>({
    total_invoices: 0,
    total_audited: 0,
    total_errors: 0,
    total_recovery: 0,
    pending_disputes: 0,
    credited_amount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoices, setSelectedInvoices] = useState<Set<number>>(new Set());
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [pendingErrorIds, setPendingErrorIds] = useState<string>("");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const userId = user?.id || "anonymous";
      // Add timestamp to prevent caching
      const response = await fetch(`/api/invoices?userId=${userId}&t=${Date.now()}`, {
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Raw invoice data from API:', data.invoices);
        setInvoices(data.invoices || []);
        
        if (data.stats) {
          setStats({
            total_invoices: parseInt(data.stats.total_invoices) || 0,
            total_audited: parseFloat(data.stats.total_audited) || 0,
            total_errors: parseInt(data.stats.total_errors) || 0,
            total_recovery: parseFloat(data.stats.total_recovery) || 0,
            pending_disputes: parseInt(data.stats.pending_disputes) || 0,
            credited_amount: parseFloat(data.stats.credited_amount) || 0
          });
        }
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      addToast('error', 'Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const viewInvoiceDetails = (invoiceId: number, uploadId: number) => {
    router.push(`/dashboard/invoice/${uploadId}`);
  };

  const deleteInvoice = async (invoiceId: number, uploadId: number) => {
    if (confirm('Are you sure you want to delete this invoice and all its audit data?')) {
      try {
        console.log('Deleting invoice - invoiceId:', invoiceId, 'uploadId:', uploadId);
        const response = await fetch(`/api/invoices/${uploadId}`, {
          method: 'DELETE',
        });
        
        const result = await response.json();
        
        if (response.ok) {
          console.log('Delete result:', result);
          addToast('success', 'Invoice deleted successfully');
          await fetchInvoices(); // Refresh the list
        } else {
          console.error('Delete failed:', result);
          addToast('error', `Failed to delete invoice: ${result.error || result.details || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting invoice:', error);
        addToast('error', 'Failed to delete invoice. Please try again.');
      }
    }
  };

  const generateDisputePacket = async () => {
    const count = selectedInvoices.size;
    if (count === 0) {
      addToast('error', 'Please select at least one invoice to generate dispute packet');
      return;
    }
    
    // Get the upload IDs for selected invoices
    const selectedInvoiceData = invoices.filter(inv => selectedInvoices.has(inv.id));
    
    // Collect all error IDs from all selected invoices
    try {
      const userId = user?.id || "anonymous";
      const allErrorIds: string[] = [];
      
      // Fetch errors for each selected invoice
      for (const invoice of selectedInvoiceData) {
        const response = await fetch(`/api/audit-results?userId=${userId}&uploadId=${invoice.upload_id}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.errors && data.errors.length > 0) {
            const errorIds = data.errors.map((e: any) => e.id);
            allErrorIds.push(...errorIds);
          }
        }
      }
      
      if (allErrorIds.length > 0) {
        const errorIdsString = allErrorIds.join(',');
        setPendingErrorIds(errorIdsString);
        setShowFormatModal(true);
      } else {
        addToast('error', 'No errors found for selected invoices');
      }
    } catch (error) {
      console.error('Error generating dispute packet:', error);
      addToast('error', 'Failed to generate dispute packet');
    }
  };

  const deleteSelected = async () => {
    const count = selectedInvoices.size;
    if (count === 0) return;
    
    if (confirm(`Are you sure you want to delete ${count} invoice${count > 1 ? 's' : ''} and all associated audit data?`)) {
      try {
        // Get the upload IDs for selected invoices
        const selectedInvoiceData = invoices.filter(inv => selectedInvoices.has(inv.id));
        const uploadIds = selectedInvoiceData.map(inv => inv.upload_id);
        
        console.log('Deleting invoices with upload IDs:', uploadIds);
        
        const response = await fetch('/api/invoices/bulk-delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uploadIds })
        });
        
        const result = await response.json();
        
        if (response.ok) {
          console.log('Bulk delete result:', result);
          addToast('success', `Successfully deleted ${result.deleted || count} invoice${result.deleted !== 1 ? 's' : ''}`);
          setSelectedInvoices(new Set()); // Clear selection
          await fetchInvoices(); // Refresh the list
        } else {
          console.error('Bulk delete failed:', result);
          addToast('error', `Failed to delete invoices: ${result.error || result.details || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting invoices:', error);
        addToast('error', 'Failed to delete invoices. Please try again.');
      }
    }
  };

  const handleFormatSelect = (format: 'pdf' | 'csv' | 'html') => {
    if (pendingErrorIds) {
      window.open(`/api/dispute-packet?errorIds=${pendingErrorIds}&format=${format}`, '_blank');
      addToast('success', `Generating ${format.toUpperCase()} dispute packet`);
      setPendingErrorIds("");
    }
  };


  const getStatusColor = (status: string) => {
    switch(status) {
      case 'audit_complete': return 'bg-green-100 text-green-800';
      case 'pending_audit': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCarrierLogo = (carrier: string) => {
    const logos: Record<string, string> = {
      'UPS': '🟫',
      'FedEx': '🟪',
      'DHL': '🟨',
      'USPS': '🟦'
    };
    return logos[carrier] || '📦';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast messages={messages} removeMessage={removeToast} />
      
      {/* Format Selection Modal */}
      <FormatSelectionModal
        isOpen={showFormatModal}
        onClose={() => setShowFormatModal(false)}
        onSelect={handleFormatSelect}
        title="Select Dispute Packet Format"
        description="Choose how you want to export your dispute packet"
      />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center space-x-2">
              <LogoHeader size="medium" opacity={100} />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Invoice Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/upload')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload New Invoice
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="text-sm text-gray-600 mb-1">Total Invoices</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total_invoices}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="text-sm text-gray-600 mb-1">Total Audited</div>
            <div className="text-2xl font-bold text-gray-900">
              ${stats.total_audited.toLocaleString()}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="text-sm text-gray-600 mb-1">Errors Found</div>
            <div className="text-2xl font-bold text-orange-600">{stats.total_errors}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="text-sm text-gray-600 mb-1">Total Recovery</div>
            <div className="text-2xl font-bold text-green-600">
              ${stats.total_recovery.toLocaleString()}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending_disputes}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="text-sm text-gray-600 mb-1">Credited</div>
            <div className="text-2xl font-bold text-green-600">
              ${stats.credited_amount.toLocaleString()}
            </div>
          </motion.div>
        </div>

        {/* Invoices Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow"
        >
          <div className="px-6 py-2 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Your Invoices</h2>
              {selectedInvoices.size > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedInvoices.size} selected
                  </span>
                  <button
                    onClick={generateDisputePacket}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    📋 Generate Dispute Packet
                  </button>
                  <button
                    onClick={deleteSelected}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedInvoices(new Set(invoices.map(i => i.id)));
                        } else {
                          setSelectedInvoices(new Set());
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Carrier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shipments
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Errors
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recovery
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                      Loading invoices...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                      No invoices found. Upload your first invoice to get started.
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice, index) => {
                    // Log first invoice to debug
                    if (index === 0) {
                      console.log('First invoice in map:', invoice);
                    }
                    return (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.has(invoice.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedInvoices);
                            if (e.target.checked) {
                              newSelected.add(invoice.id);
                            } else {
                              newSelected.delete(invoice.id);
                            }
                            setSelectedInvoices(newSelected);
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getCarrierLogo(invoice.carrier)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {invoice.invoice_number || `Invoice #${invoice.id}`}
                            </div>
                            <div className="text-xs text-gray-500">{invoice.file_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {new Date(invoice.invoice_date || invoice.uploaded_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {invoice.carrier}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${parseFloat(invoice.total_amount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {invoice.line_items_count || 0}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {parseInt(invoice.error_count) > 0 ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            {parseInt(invoice.error_count)} errors
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {parseFloat(invoice.total_recovery) > 0 ? (
                          <span className="text-sm font-medium text-green-600">
                            ${parseFloat(invoice.total_recovery || 0).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status === 'audit_complete' ? 'Audited' : 
                           invoice.status === 'pending_audit' ? 'Pending' : invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => viewInvoiceDetails(invoice.id, invoice.upload_id)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            View
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => deleteInvoice(invoice.id, invoice.upload_id)}
                            className="text-red-600 hover:text-red-900"
                            data-id={invoice.id}
                            data-upload-id={invoice.upload_id}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => router.push('/upload')}
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload New Invoice
          </button>
          <button className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Analytics
          </button>
        </div>
      </main>
    </div>
  );
}
