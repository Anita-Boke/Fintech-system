// src/components/AuthProvider.tsx
"use client";
import { SessionProvider } from "next-auth/react";
import { useEffect } from 'react';
import { initializeStorage } from '@/lib/services/storageService';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initializeStorage();
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}