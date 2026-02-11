import type { Metadata } from 'next';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Billing Console - TelecomNexus',
  description: 'Invoices, Usage Analytics, and Payment History',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
