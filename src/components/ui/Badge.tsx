import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  className?: string;
  animate?: boolean;
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'sm', 
  className,
  animate = false
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    default: 'bg-neutral-700 text-neutral-200',
    success: 'bg-success-900/30 text-success-300 border border-success-700/50',
    warning: 'bg-warning-900/30 text-warning-300 border border-warning-700/50',
    error: 'bg-error-900/30 text-error-300 border border-error-700/50',
    info: 'bg-primary-900/30 text-primary-300 border border-primary-700/50'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  const BadgeComponent = animate ? motion.span : 'span';
  
  const animationProps = animate ? {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: "spring", stiffness: 500, damping: 30 }
  } : {};

  return (
    <BadgeComponent
      className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...animationProps}
    >
      {children}
    </BadgeComponent>
  );
}