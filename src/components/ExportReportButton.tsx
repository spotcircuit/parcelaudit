"use client";

import { useState } from "react";

interface ExportReportButtonProps {
  uploadId: string;
  userId: string;
}

export default function ExportReportButton({ uploadId, userId }: ExportReportButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'csv' | 'html'>('pdf');

  const exportReport = (format: string) => {
    window.open(`/api/export-report?uploadId=${uploadId}&userId=${userId}&format=${format}`, '_blank');
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <div className="flex">
        <button
          onClick={() => exportReport(selectedFormat)}
          className="px-4 py-2 bg-blue-600 text-white rounded-l-lg hover:bg-blue-700"
        >
          Export as {selectedFormat.toUpperCase()}
        </button>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="px-2 py-2 bg-blue-600 text-white rounded-r-lg border-l border-blue-700 hover:bg-blue-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                exportReport('pdf');
              }}
              className={`block w-full text-left px-4 py-2 text-sm ${
                selectedFormat === 'pdf' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              📄 PDF Report
            </button>
            <button
              onClick={() => {
                setSelectedFormat('csv');
                exportReport('csv');
              }}
              className={`block w-full text-left px-4 py-2 text-sm ${
                selectedFormat === 'csv' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              📊 CSV Export
            </button>
            <button
              onClick={() => {
                setSelectedFormat('html');
                exportReport('html');
              }}
              className={`block w-full text-left px-4 py-2 text-sm ${
                selectedFormat === 'html' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
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