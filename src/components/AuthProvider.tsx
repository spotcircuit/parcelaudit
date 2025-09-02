"use client";

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Dynamically import Stack components only when environment is configured
const StackAuthProvider = dynamic(
  () => import('@stackframe/stack').then(mod => {
    const { StackProvider, StackTheme } = mod;
    
    return function StackAuth({ children, app }: { children: ReactNode; app: any }) {
      return (
        <StackProvider app={app}>
          <StackTheme>
            {children}
          </StackTheme>
        </StackProvider>
      );
    };
  }),
  { 
    ssr: false,
    loading: () => <>{/* Loading auth... */}</>
  }
);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // Check if Stack Auth is configured
  const isStackConfigured = typeof window !== 'undefined' && 
    process.env.NEXT_PUBLIC_STACK_PROJECT_ID;

  if (isStackConfigured) {
    // Lazy load the stack app configuration
    const { stackApp } = require('@/stack-app');
    return <StackAuthProvider app={stackApp}>{children}</StackAuthProvider>;
  }

  // Stack Auth not configured, just pass through
  return <>{children}</>;
}