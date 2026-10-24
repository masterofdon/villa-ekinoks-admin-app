import React from 'react';

interface StatusPageProps {
  code: string;
  title: string;
  description: string;
  reference?: string;
  // Fills the viewport when rendered outside the app shell
  fullScreen?: boolean;
  children?: React.ReactNode;
}

export const statusPrimaryActionClass =
  'inline-flex items-center justify-center rounded-lg bg-brand-olive px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90';

export const statusSecondaryActionClass =
  'inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50';

// Plain markup only (no antd, hooks or next/link) so it also works inside global-error
export default function StatusPage({ code, title, description, reference, fullScreen = false, children }: StatusPageProps) {
  return (
    <div
      className={`flex items-center justify-center px-4 ${fullScreen ? 'min-h-screen bg-gray-50' : 'min-h-[60vh]'}`}
    >
      <div className="max-w-md text-center">
        <p className="text-7xl font-bold tracking-tight text-brand-olive">{code}</p>
        <h1 className="mt-4 text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-3 text-gray-600">{description}</p>
        {reference && <p className="mt-2 text-xs text-gray-400">Reference: {reference}</p>}
        {children && <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{children}</div>}
      </div>
    </div>
  );
}
