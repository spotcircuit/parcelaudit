"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FormatSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (format: 'pdf' | 'csv' | 'html') => void;
  title: string;
  description?: string;
}

export default function FormatSelectionModal({ 
  isOpen, 
  onClose, 
  onSelect,
  title,
  description = "Select your preferred format"
}: FormatSelectionModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'csv' | 'html'>('pdf');

  const handleConfirm = () => {
    onSelect(selectedFormat);
    onClose();
  };

  if (!isOpen) return null;

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
            className="relative bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {description}
              </p>
            </div>

            {/* Format Options */}
            <div className="px-6 py-4 space-y-3">
              <label 
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedFormat === 'pdf' 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={selectedFormat === 'pdf'}
                  onChange={(e) => setSelectedFormat('pdf')}
                  className="mr-3 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">📄</span>
                    <div>
                      <div className="font-medium text-gray-900">PDF Document</div>
                      <div className="text-sm text-gray-500">Professional format for printing or email</div>
                    </div>
                  </div>
                </div>
              </label>

              <label 
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedFormat === 'csv' 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={selectedFormat === 'csv'}
                  onChange={(e) => setSelectedFormat('csv')}
                  className="mr-3 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">📊</span>
                    <div>
                      <div className="font-medium text-gray-900">CSV File</div>
                      <div className="text-sm text-gray-500">For UPS Billing Analysis Tool (BAT)</div>
                    </div>
                  </div>
                </div>
              </label>

              <label 
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedFormat === 'html' 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value="html"
                  checked={selectedFormat === 'html'}
                  onChange={(e) => setSelectedFormat('html')}
                  className="mr-3 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">🌐</span>
                    <div>
                      <div className="font-medium text-gray-900">HTML Report</div>
                      <div className="text-sm text-gray-500">Interactive web format with full details</div>
                    </div>
                  </div>
                </div>
              </label>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 rounded-b-lg">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
              >
                Generate {selectedFormat.toUpperCase()}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}