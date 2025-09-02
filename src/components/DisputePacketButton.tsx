"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";

interface DisputePacketButtonProps {
  selectedInvoices: Set<string>;
  invoices: any[];
  userId: string;
}

export default function DisputePacketButton({ selectedInvoices, invoices, userId }: DisputePacketButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'csv' | 'html'>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const { addToast } = useToast();

  const generateDisputePacket = async (format: string) => {
    const count = selectedInvoices.size;
    if (count === 0) {
      addToast('error', 'Please select at least one invoice to generate dispute packet');
      return;
    }
    
    setIsGenerating(true);
    setShowMenu(false);
    
    // Get the upload IDs for selected invoices
    const selectedInvoiceData = invoices.filter(inv => selectedInvoices.has(inv.id));
    
    // Collect all error IDs from all selected invoices
    try {
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
        window.open(`/api/dispute-packet?errorIds=${errorIdsString}&format=${format}`, '_blank');
        addToast('success', `Generating ${format.toUpperCase()} dispute packet for ${allErrorIds.length} errors from ${count} invoice(s)`);
      } else {
        addToast('error', 'No errors found for selected invoices');
      }
    } catch (error) {
      console.error('Error generating dispute packet:', error);
      addToast('error', 'Failed to generate dispute packet');
    } finally {
      setIsGenerating(false);
    }
  };

  if (selectedInvoices.size === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="flex">
        <button
          onClick={() => generateDisputePacket(selectedFormat)}
          disabled={isGenerating}
          className="px-4 py-2 bg-purple-600 text-white rounded-l-lg hover:bg-purple-700 text-sm disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : `📋 Generate Dispute (${selectedFormat.toUpperCase()})`}
        </button>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="px-2 py-2 bg-purple-600 text-white rounded-r-lg border-l border-purple-700 hover:bg-purple-700 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={() => {
                setSelectedFormat('pdf');
                generateDisputePacket('pdf');
              }}
              className={`block w-full text-left px-4 py-2 text-sm ${
                selectedFormat === 'pdf' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              📄 PDF Document
            </button>
            <button
              onClick={() => {
                setSelectedFormat('csv');
                generateDisputePacket('csv');
              }}
              className={`block w-full text-left px-4 py-2 text-sm ${
                selectedFormat === 'csv' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              📊 CSV Export
            </button>
            <button
              onClick={() => {
                setSelectedFormat('html');
                generateDisputePacket('html');
              }}
              className={`block w-full text-left px-4 py-2 text-sm ${
                selectedFormat === 'html' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              🌐 HTML Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}