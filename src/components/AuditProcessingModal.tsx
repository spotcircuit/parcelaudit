"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AuditProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function AuditProcessingModal({ 
  isOpen, 
  onClose,
  onComplete 
}: AuditProcessingModalProps) {
  const [status, setStatus] = useState<"processing" | "complete">("processing");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStatus("processing");
      setProgress(0);
      
      // Simulate processing progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStatus("complete");
            return 100;
          }
          return prev + 20;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={status === "complete" ? onClose : undefined}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4"
        >
          {status === "processing" ? (
            <>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 mb-4">
                  <svg className="animate-spin text-blue-600" viewBox="0 0 24 24">
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                      fill="none"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Analyzing Your Invoice
                </h2>
                <p className="text-gray-600 mb-6">
                  Our AI is scanning for billing errors, surcharges, and DIM weight discrepancies...
                </p>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <motion.div
                    className="bg-blue-600 h-3 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <p className="text-sm text-gray-500">
                  {progress < 30 && "Reading invoice data..."}
                  {progress >= 30 && progress < 60 && "Checking for DIM weight errors..."}
                  {progress >= 60 && progress < 90 && "Analyzing surcharges..."}
                  {progress >= 90 && "Finalizing audit results..."}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 mb-4 text-green-500">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Audit Complete!
                </h2>
                <p className="text-gray-600 mb-6">
                  We've identified potential savings in your invoice. View the detailed results below.
                </p>

                <button
                  onClick={() => {
                    onComplete();
                    onClose();
                  }}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Results
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}