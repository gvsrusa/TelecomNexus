import type { Metadata } from 'next';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Customer Portal - TelecomNexus',
  description: 'Manage your account, plans, and support tickets',
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
