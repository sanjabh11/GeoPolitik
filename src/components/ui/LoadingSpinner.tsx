import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'secondary' | 'accent' | 'white';
}

export function LoadingSpinner({ 
  size = 'md', 
  className,
  color = 'primary'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
  
  const colorClasses = {
    primary: 'border-primary-600/30 border-t-primary-400',
    secondary: 'border-secondary-600/30 border-t-secondary-400',
    accent: 'border-accent-600/30 border-t-accent-400',
    white: 'border-white/30 border-t-white'
  };

  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <motion.div
        className={clsx(
          'border-2 rounded-full',
          colorClasses[color],
          sizeClasses[size]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  );
}