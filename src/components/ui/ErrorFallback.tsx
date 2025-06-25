import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[50vh] flex items-center justify-center p-4"
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 max-w-md w-full">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="p-3 bg-error-900/30 rounded-full">
            <AlertTriangle className="h-10 w-10 text-error-400" />
          </div>
        </motion.div>
        
        <h2 className="text-xl font-bold text-neutral-100 mb-3 text-center">
          Something went wrong
        </h2>
        
        <div className="bg-neutral-800/50 rounded-lg p-3 mb-6 overflow-auto max-h-32">
          <p className="text-error-300 text-sm font-mono">
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={resetErrorBoundary}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
          >
            <Home className="h-4 w-4 mr-2" />
            Return to Home
          </Button>
        </div>
      </div>
    </motion.div>
  );
}