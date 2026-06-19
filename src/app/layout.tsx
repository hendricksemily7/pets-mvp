import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./components/NavBar";
import { ToastProvider } from "./components/Toast";

export const metadata: Metadata = {
  title: "Hendricks Pets",
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
        <ToastProvider>
          <NavBar />
          <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
