'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme } from 'antd';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            // Customize your theme tokens here
            colorPrimary: '#1890ff',
            borderRadius: 8,
          },
          algorithm: theme.defaultAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </QueryClientProvider>
  );
}