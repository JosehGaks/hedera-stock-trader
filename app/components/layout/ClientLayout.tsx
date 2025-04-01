'use client';

import React from 'react';
import MainLayout from './MainLayout';
import { injectEnv } from '../../lib/env';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  // Inject environment variables into window object
  injectEnv();

  return <MainLayout>{children}</MainLayout>;
} 