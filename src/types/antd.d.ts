// Ant Design component types
declare module 'antd' {
  export * from 'antd/es';
}

// Custom theme types for Ant Design
declare module 'antd/lib/theme' {
  interface AliasToken {
    colorPrimary?: string;
    colorSuccess?: string;
    colorWarning?: string;
    colorError?: string;
    colorInfo?: string;
    colorTextBase?: string;
    colorBgBase?: string;
    borderRadius?: number;
  }
}