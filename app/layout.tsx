import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppShell from '@/src/features/c00-p0-foundation/AppShell';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0E0E0F',
};

export const metadata: Metadata = {
  title: 'VolsLift',
  description: 'Fast workout logger',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VolsLift',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
