import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Novellia Pets",
  description: "Pet medical records management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        {/* Header */}
        <nav className="bg-[#2D4D3A] text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <a href="/" className="text-xl font-bold text-slate-50 hover:text-slate-300 transition-colors">
                  Novellia Pets
                </a>
                <div className="hidden sm:flex space-x-1">
                  <a href="/" className="text-white hover:text-slate-300 px-4 py-2 text-sm font-medium transition-colors">
                    Dashboard
                  </a>
                  <a href="/pets" className="text-white hover:text-slate-300 px-4 py-2 text-sm font-medium transition-colors">
                    Pets
                  </a>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
