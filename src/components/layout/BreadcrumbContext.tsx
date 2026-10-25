'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface BreadcrumbContextValue {
  extraLabel: string | null;
  setExtraLabel: (label: string | null) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [extraLabel, setExtraLabel] = useState<string | null>(null);
  const value = useMemo(() => ({ extraLabel, setExtraLabel }), [extraLabel]);

  return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>;
}

function useBreadcrumbContext(): BreadcrumbContextValue {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumbContext must be used within a BreadcrumbProvider');
  }
  return context;
}

export function useBreadcrumbExtra(): string | null {
  return useBreadcrumbContext().extraLabel;
}

/**
 * Lets a detail page (e.g. /bookings/[id]) supply the label of its dynamic
 * crumb once the entity has loaded. Clears itself on unmount or label change.
 */
export function usePageBreadcrumbLabel(label: string | null | undefined): void {
  const { setExtraLabel } = useBreadcrumbContext();

  useEffect(() => {
    setExtraLabel(label ?? null);
    return () => setExtraLabel(null);
  }, [label, setExtraLabel]);
}
