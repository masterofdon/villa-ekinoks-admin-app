import React from 'react';
import './globals.css';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import Providers from '@/components/providers/Providers';

export const metadata = {
  title: 'Villa Ekinoks Admin',
  description: 'Admin dashboard for villa management',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <Providers>
            {children}
          </Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}