import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  BookOpen, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  User,
  Brain,
  Globe,
  LogIn,
  LogOut,
  DollarSign,
  BarChart3,
  Smartphone
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from './AuthProvider';
import { Button } from './ui/Button';
import { UserProfileMenu } from './UserProfileMenu';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Game Theory', href: '/tutorials', icon: Brain },
  { name: 'Risk Assessment', href: '/risk-assessment', icon: TrendingUp },
  { name: 'Simulation', href: '/simulation', icon: Target },
  { name: 'Crisis Monitoring', href: '/crisis-monitoring', icon: AlertTriangle },
  { name: 'Economic Modeling', href: '/economic-modeling', icon: DollarSign },
  { name: 'Advanced Analytics', href: '/advanced-analytics', icon: BarChart3 },
  { name: 'Mobile Experience', href: '/mobile', icon: Smartphone },
  { name: 'Profile', href: '/profile', icon: User }
];

interface NavigationProps {
  onAuthClick?: () => void;
}

export function Navigation({ onAuthClick }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const { user, signOut } = useAuth();

  // Add scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={clsx(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isLandingPage && !scrolled
        ? 'bg-transparent backdrop-blur-sm' 
        : 'bg-neutral-900/95 backdrop-blur-lg border-b border-neutral-800 shadow-lg shadow-black/20'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Globe className="h-8 w-8 text-primary-400 group-hover:text-primary-300 transition-colors duration-200" />
              <motion.div 
                className="absolute inset-0 bg-primary-400/20 rounded-full blur-xl group-hover:bg-primary-300/30 transition-colors duration-200"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <span className="text-xl font-bold text-neutral-100 group-hover:text-neutral-50 transition-colors duration-200">
              GeoPolitik
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group',
                    isActive
                      ? 'text-primary-300 bg-primary-900/30'
                      : 'text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800/50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden xl:inline">{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary-900/30 rounded-lg border border-primary-600/30"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
            
            {/* User Profile Menu or Auth Button */}
            {user ? (
              <UserProfileMenu className="ml-2" />
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onAuthClick}
                className="ml-2"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800/50 transition-colors duration-200"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-800"
          >
            <div className="px-4 pt-2 pb-4 space-y-1 max-h-96 overflow-y-auto">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={clsx(
                      'flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200',
                      isActive
                        ? 'text-primary-300 bg-primary-900/30'
                        : 'text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800/50'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Auth Button */}
              {user ? (
                <button 
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800/50 transition-colors duration-200 w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button 
                  onClick={() => {
                    if (onAuthClick) onAuthClick();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800/50 transition-colors duration-200 w-full"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}