"use client";

import { NeonAuthUIProvider } from "@neondatabase/neon-js/auth/react";
import { authClient } from '../lib/auth';
import AuthProvider from "../context/AuthContext";
import { ChatSpotter } from "../components/chat/ChatSpotter";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NeonAuthUIProvider authClient={authClient} defaultTheme="dark">
      <AuthProvider>
        {children}
        <ChatSpotter />
      </AuthProvider>
    </NeonAuthUIProvider>
  );
}
