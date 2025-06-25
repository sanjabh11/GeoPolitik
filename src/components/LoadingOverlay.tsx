import React from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({ message = 'Loading...', fullScreen = false }: LoadingOverlayProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex flex-col items-center justify-center bg-neutral-950/80 backdrop-blur-sm z-50 ${
        fullScreen ? 'fixed inset-0' : 'absolute inset-0 rounded-lg'
      }`}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <LoadingSpinner size="lg" />
      </motion.div>
      
      <motion.p 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-4 text-neutral-300 font-medium"
      >
        {message}
      </motion.p>
    </motion.div>
  );
}