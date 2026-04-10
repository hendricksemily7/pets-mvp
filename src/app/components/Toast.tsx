'use client';

import { useEffect, useState } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

let addToastFn: ((message: string, type: 'success' | 'error') => void) | null = null;

export function toast(message: string, type: 'success' | 'error' = 'error') {
  if (addToastFn) {
    addToastFn(message, type);
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToastFn = (message: string, type: 'success' | 'error') => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };
    return () => {
      addToastFn = null;
    };
  }, []);

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white animate-fade-in ${
              t.type === 'error' ? 'bg-red-600' : 'bg-green-600'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
}
