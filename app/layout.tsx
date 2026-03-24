import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Layout } from '@/components/layout/layout';
import { AuthProvider } from '@/lib/auth/auth-context';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        {/* 全局样式：修复点击失效，但不影响悬浮窗 */}
        <style dangerouslySetInnerHTML={{ __html: `
          button, a, [role="button"], input, select, textarea {
            pointer-events: auto !important;
            cursor: pointer !important;
          }
          .sidebar, .dropdown { z-index: 9999 !important; }
        `}} />

        <AuthProvider>
          <Layout>
            {children}
          </Layout>
        </AuthProvider>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#363636', color: '#fff' },
            success: { duration: 3000, iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { duration: 4000, iconTheme: { primary: '#ef4444', secondary: '#fff' } }
          }}
        />
      </body>
    </html>
  );
}