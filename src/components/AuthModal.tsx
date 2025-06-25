import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { useAuth } from './AuthProvider';
import { useToast } from '../hooks/useToast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const { showToast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) throw new Error(error);
        showToast('success', 'Signed in successfully');
        onClose();
      } else {
        const { error } = await signUp(email, password);
        if (error) throw new Error(error);
        setShowEmailConfirmation(true);
        showToast('success', 'Account created successfully', 'Please check your email for verification');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError(null);
    setShowEmailConfirmation(false);
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl w-full max-w-md p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-100">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </h2>
            <motion.button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-neutral-800 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="h-5 w-5 text-neutral-400" />
            </motion.button>
          </div>
          
          {showEmailConfirmation && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-green-900/20 border border-green-700/50 rounded-lg flex items-start"
            >
              <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-300 text-sm font-medium mb-1">Check your email</p>
                <p className="text-green-300/80 text-sm">
                  We've sent a confirmation link to <strong>{email}</strong>. 
                  Please click the link to verify your account before signing in.
                </p>
              </div>
            </motion.div>
          )}
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-error-900/20 border border-error-700/50 rounded-lg flex items-start"
            >
              <AlertCircle className="h-5 w-5 text-error-400 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-error-300 text-sm">{error}</span>
            </motion.div>
          )}
          
          {!showEmailConfirmation && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-neutral-500" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-neutral-200"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-500" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-neutral-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                loading={loading}
              >
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              {mode === 'signin' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}