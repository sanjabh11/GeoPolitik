import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export function Card({ children, className, hover = false, gradient = false }: CardProps) {
  return (
    <motion.div
      className={clsx(
        'rounded-xl border transition-all duration-200',
        gradient 
          ? 'bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border-neutral-700/50'
          : 'bg-neutral-800/50 border-neutral-700/50',
        hover && 'hover:border-primary-600/50 hover:shadow-lg hover:shadow-primary-900/20',
        className
      )}
      whileHover={hover ? { y: -2, transition: { type: "spring", stiffness: 300, damping: 30 } } : undefined}
      layout
    >
      {children}
    </motion.div>
  );
}