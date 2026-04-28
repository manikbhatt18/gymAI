"use client";

import { NeonAuthUIProvider } from "@neondatabase/neon-js/auth/react";
import { authClient } from '../lib/auth';
import AuthProvider from "../context/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NeonAuthUIProvider authClient={authClient} defaultTheme="dark">
      <AuthProvider>
        {children}
      </AuthProvider>
    </NeonAuthUIProvider>
  );
}
