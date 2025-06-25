import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: () => void;
}

export function Toast({ 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow exit animation to complete
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-success-400" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-error-400" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-warning-400" />;
      case 'info': return <Info className="h-5 w-5 text-primary-400" />;
    }
  };
  
  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-success-900/20 border-success-700/50';
      case 'error': return 'bg-error-900/20 border-error-700/50';
      case 'warning': return 'bg-warning-900/20 border-warning-700/50';
      case 'info': return 'bg-primary-900/20 border-primary-700/50';
    }
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={clsx(
            'w-full max-w-sm rounded-lg border shadow-lg',
            getBgColor()
          )}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getIcon()}
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-neutral-100">{title}</p>
                {message && (
                  <p className="mt-1 text-sm text-neutral-400">{message}</p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <motion.button
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                  }}
                  className="bg-transparent rounded-md inline-flex text-neutral-400 hover:text-neutral-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ToastContainerProps {
  children: React.ReactNode;
}

export function ToastContainer({ children }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-full max-w-sm pointer-events-none">
      <div className="pointer-events-auto">
        {children}
      </div>
    </div>
  );
}