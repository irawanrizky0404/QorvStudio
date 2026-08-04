import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';

import '@/styles/global.css';

import { Toaster } from '@/components/ui/toaster';

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

/**
 * Second root layout. The admin panel shares the colour and type of the public
 * site and nothing else - no locale provider, no smooth scroll, no marketing
 * chrome. It is English-only by decision, so there is no dictionary here.
 */
export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s / QORV Admin' },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <html lang="en" className={`${grotesk.variable} ${jakarta.variable}`}>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
