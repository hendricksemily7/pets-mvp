'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#2D4D3A] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-slate-50 hover:text-slate-300 transition-colors">
              Hendricks Pets
            </Link>
            {/* Desktop nav links */}
            <div className="hidden sm:flex space-x-1">
              <Link href="/" className="text-white hover:text-slate-300 px-4 py-2 text-sm font-medium transition-colors">
                Dashboard
              </Link>
              <Link href="/pets" className="text-white hover:text-slate-300 px-4 py-2 text-sm font-medium transition-colors">
                Pets
              </Link>
            </div>
          </div>

          {/* Hamburger button - mobile only */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-[#3D5D4A] transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? (
                // X icon
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Hamburger icon
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden border-t border-[#3D5D4A]">
          <div className="px-4 py-3 space-y-1">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[#3D5D4A] transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/pets"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[#3D5D4A] transition-colors"
            >
              Pets
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
