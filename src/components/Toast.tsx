"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface ToastProps {
  messages: ToastMessage[];
  removeMessage: (id: string) => void;
}

export function Toast({ messages, removeMessage }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {messages.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => removeMessage(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.duration, onRemove]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  }[toast.type];

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  }[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px] max-w-md`}
    >
      <span className="text-xl font-bold">{icon}</span>
      <p className="flex-1">{toast.message}</p>
      <button
        onClick={onRemove}
        className="text-white/80 hover:text-white text-xl leading-none"
      >
        ×
      </button>
    </motion.div>
  );
}

// Toast hook
export function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], message: string, duration?: number) => {
    const id = Date.now().toString();
    setMessages(prev => [...prev, { id, type, message, duration }]);
  };

  const removeToast = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  return { messages, addToast, removeToast };
}