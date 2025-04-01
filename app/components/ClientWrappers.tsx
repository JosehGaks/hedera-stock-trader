'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import TextColorFix from './TextColorFix';

// Dynamically import components with error handling
const Navbar = dynamic(() => import('./Navbar'), { 
  ssr: false,
  loading: () => <div className="h-16 bg-white shadow"></div>
});
const EnvInjector = dynamic(() => import('./EnvInjector'), { ssr: false });
const HashConnectLoader = dynamic(() => import('./HashConnectLoader'), { ssr: false });
const HashConnectScript = dynamic(() => import('./HashConnectScript'), { ssr: false });

export default function ClientWrappers() {
  return (
    <>
      <TextColorFix />
      <EnvInjector />
      <HashConnectScript />
      <HashConnectLoader />
      <Navbar />
    </>
  );
} 