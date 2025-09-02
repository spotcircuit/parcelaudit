"use client";

import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackApp } from "@/stack-app";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <StackProvider app={stackApp}>
      <StackTheme>
        {children}
      </StackTheme>
    </StackProvider>
  );
}