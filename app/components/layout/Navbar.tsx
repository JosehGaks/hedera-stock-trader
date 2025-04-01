'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../store/auth';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const { user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation links with active state
  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Stocks', href: '/stocks' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Markets', href: '/markets' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-white/80 backdrop-blur-md py-4'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center space-x-2">
              <img src="/logo.svg" alt="Hedera Stock Trader" className="h-8 w-8" onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjM2I4MmY2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9Imx1Y2lkZSBsdWNpZGUtdHJlbmRpbmctdXAiPjxwb2x5bGluZSBwb2ludHM9IjIzIDYgMTMuNSAxNS41IDguNSAxMC41IDEgMTgiLz48cG9seWxpbmUgcG9pbnRzPSIxNyA2IDIzIDYgMjMgMTIiLz48L3N2Zz4=';
              }}/>
              <span className="font-bold text-xl text-blue-600">HederaStocks</span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`${
                    isActive(link.href) 
                      ? 'text-blue-600 font-semibold' 
                      : 'text-gray-700 hover:text-blue-600'
                  } transition-colors`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/portfolio">
                  <div className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
                      <path d="M19 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
                      <path d="M16 14h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v6"/>
                      <path d="M9 14H7a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h3.93a2 2 0 0 1 1.66.9l.41.59"/>
                    </svg>
                    <span className="font-medium">My Portfolio</span>
                  </div>
                </Link>
                <div className="text-sm text-gray-600 font-medium border border-gray-200 px-3 py-1 rounded-full bg-gray-50">
                  {user.accountId.slice(0, 6)}...{user.accountId.slice(-4)}
                </div>
                <button 
                  onClick={() => useAuthStore.getState().setUser(null)}
                  className="text-xs text-gray-500 hover:text-red-600"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <Link href="/connect">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  Connect Wallet
                </button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`${
                    isActive(link.href) 
                      ? 'text-blue-600 font-semibold' 
                      : 'text-gray-700 hover:text-blue-600'
                  } transition-colors`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {user ? (
                <div className="flex flex-col space-y-3 pt-3 border-t border-gray-100">
                  <div className="text-sm text-gray-600 font-medium">
                    Connected: {user.accountId.slice(0, 6)}...{user.accountId.slice(-4)}
                  </div>
                  <button 
                    onClick={() => {
                      useAuthStore.getState().setUser(null);
                      setIsMenuOpen(false);
                    }}
                    className="text-red-600 text-sm"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              ) : (
                <Link href="/connect" onClick={() => setIsMenuOpen(false)}>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full mt-2">
                    Connect Wallet
                  </button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 