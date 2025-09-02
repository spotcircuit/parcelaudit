"use client";

export const dynamic = 'force-dynamic';

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import LogoHeader from "@/components/LogoHeader";
import { motion } from "framer-motion";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "uploading" | "processing" | "completed" | "error";
  progress: number;
  errorMessage?: string;
  invoiceCount?: number;
  totalAmount?: number;
}

export default function UploadPage() {
  // User auth disabled in demo mode
  const router = useRouter();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = async (fileList: File[]) => {
    // Filter for valid file types
    const validFiles = fileList.filter(file => {
      const validTypes = [
        'application/pdf',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ];
      return validTypes.includes(file.type) || 
             file.name.endsWith('.csv') || 
             file.name.endsWith('.xlsx') || 
             file.name.endsWith('.xls') ||
             file.name.endsWith('.pdf');
    });

    if (validFiles.length === 0) {
      alert("Please upload PDF, CSV, or Excel files only.");
      return;
    }

    // Create file objects
    const newFiles: UploadedFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading" as const,
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
    setIsProcessing(true);

    // Process each file
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const fileObj = newFiles[i];
      
      await uploadFile(file, fileObj.id);
    }
  };

  const uploadFile = async (file: File, fileId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user?.id || '');

    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 90; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress } : f
        ));
      }

      const response = await fetch('/api/comprehensive-audit', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setFiles(prev => prev.map(f => 
        f.id === fileId ? {
          ...f,
          status: "completed",
          progress: 100,
          invoiceCount: result.summary?.shipmentsAnalyzed || 1,
          totalAmount: result.summary?.totalRecovery || 0,
          errorsFound: result.summary?.errorsFound || 0
        } : f
      ));

    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileId ? {
          ...f,
          status: "error",
          errorMessage: error instanceof Error ? error.message : "Failed to upload file"
        } : f
      ));
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const startAudit = () => {
    const completedFiles = files.filter(f => f.status === "completed");
    if (completedFiles.length > 0) {
      router.push('/dashboard?audit=started');
    }
  };

  const completedCount = files.filter(f => f.status === "completed").length;
  const errorCount = files.filter(f => f.status === "error").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <LogoHeader size="small" opacity={100} />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Upload Invoices</h1>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
            transition-colors duration-200
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-500">Upload invoices</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                multiple
                accept=".pdf,.csv,.xlsx,.xls"
                onChange={handleFileSelect}
              />
            </label>
            {" "}or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PDF, CSV, XLS, XLSX up to 50MB each
          </p>
        </motion.div>

        {/* Supported Carriers */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Supported Carriers</h3>
          <div className="flex flex-wrap gap-2">
            {['UPS', 'FedEx', 'DHL', 'USPS', 'OnTrac', 'LaserShip'].map(carrier => (
              <span key={carrier} className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700">
                {carrier}
              </span>
            ))}
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Uploaded Files</h2>
              <div className="text-sm text-gray-500">
                {completedCount} completed, {errorCount} errors
              </div>
            </div>

            <div className="space-y-3">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8l4 4v10a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">{file.name}</span>
                        <span className="ml-2 text-xs text-gray-500">{formatFileSize(file.size)}</span>
                      </div>
                      
                      {file.status === "uploading" && (
                        <div className="mt-2">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                            <span className="ml-2 text-xs text-gray-500">{file.progress}%</span>
                          </div>
                        </div>
                      )}

                      {file.status === "processing" && (
                        <div className="mt-2 text-sm text-blue-600">Processing invoice data...</div>
                      )}

                      {file.status === "completed" && (
                        <div className="mt-2 text-sm text-green-600">
                          ✓ Processed {file.invoiceCount} invoice(s) - ${file.totalAmount?.toFixed(2)}
                        </div>
                      )}

                      {file.status === "error" && (
                        <div className="mt-2 text-sm text-red-600">
                          ✗ {file.errorMessage}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => removeFile(file.id)}
                      className="ml-4 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {completedCount > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 flex justify-center"
              >
                <button
                  onClick={startAudit}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Audit Analysis →
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">How it works</h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex">
              <span className="font-semibold mr-2">1.</span>
              Upload your carrier invoices in PDF, CSV, or Excel format
            </li>
            <li className="flex">
              <span className="font-semibold mr-2">2.</span>
              Our AI automatically extracts and analyzes all shipment data
            </li>
            <li className="flex">
              <span className="font-semibold mr-2">3.</span>
              We identify billing errors, surcharge mistakes, and DIM weight issues
            </li>
            <li className="flex">
              <span className="font-semibold mr-2">4.</span>
              Get a detailed report with recovery opportunities and dispute packets
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
}