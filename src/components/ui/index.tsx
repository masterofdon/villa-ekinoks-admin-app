import React from 'react';
import styles from './index.module.css';

export { AuthImage } from './AuthImage';
export { 
  ImagePreloader, 
  PropertyGalleryPreloader, 
  CacheStatsDisplay, 
  CacheClearButton 
} from './ImageCacheUtils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  const baseClasses = styles.base;
  
  return (
    <input
      className={`${baseClasses} ${className}`}
      {...props}
    />
  );
};

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = ({ className = '', ...props }) => {
  return (
    <label
      className={`${styles.label} ${className}`}
      {...props}
    />
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`${styles.div} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`${styles.div2} ${className}`}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`${styles.div3} ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <h3 className={`${styles.h3} ${className}`}>
      {children}
    </h3>
  );
};