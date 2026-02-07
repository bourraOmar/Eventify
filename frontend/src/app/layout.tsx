import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ConfirmationDialogProvider } from '@/contexts/ConfirmationDialogContext';
import { Navbar } from '@/components/common/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Eventify - Event Registration',
  description: 'Book your next event seamlessly',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <ConfirmationDialogProvider>
            <AuthProvider>
              <Navbar />
              <main>{children}</main>
            </AuthProvider>
          </ConfirmationDialogProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
