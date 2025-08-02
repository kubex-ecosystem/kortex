import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MCP Dashboard | Gobe Server Management",
  description: "Interface moderna para monitoramento e gestão do servidor MCP integrado ao Discord",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 min-h-screen`}>
        <Providers>
          <nav className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white px-8 py-4 shadow-lg">
            <div className="max-w-7xl mx-auto flex gap-6">
              <a href="/dashboard" className="hover:text-blue-200 transition-colors font-medium">Dashboard</a>
              <a href="/tasks" className="hover:text-blue-200 transition-colors font-medium">Aprovação de Tasks</a>
              <a href="/history" className="hover:text-blue-200 transition-colors font-medium">Histórico</a>
              <a href="/metrics" className="hover:text-blue-200 transition-colors font-medium">Métricas</a>
            </div>
          </nav>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
