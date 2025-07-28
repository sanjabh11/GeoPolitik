import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface ProgressBarProps {
  progress: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ProgressBar({ 
  progress, 
  className, 
  size = 'md', 
  showLabel = true 
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={clsx('w-full', className)}>
      <div className={clsx(
        'w-full bg-neutral-700 rounded-full',
        sizeClasses[size]
      )}>
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
      {showLabel && (
        <div className="mt-2 text-sm text-neutral-400 text-center">
          {Math.round(clampedProgress)}% Complete
        </div>
      )}
    </div>
  );
}
