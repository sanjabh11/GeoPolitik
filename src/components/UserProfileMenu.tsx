import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, Award, Bell, Shield, HelpCircle } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { Menu } from '@headlessui/react';
import { Link } from 'react-router-dom';

interface UserProfileMenuProps {
  className?: string;
}

export function UserProfileMenu({ className }: UserProfileMenuProps) {
  const { user, signOut, getUserProfile } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  
  useEffect(() => {
    if (user) {
      getUserProfile().then(data => {
        setProfile(data);
      });
    }
  }, [user]);
  
  if (!user) return null;
  
  return (
    <div className={className}>
      <Menu as="div" className="relative">
        <Menu.Button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-800/50 transition-colors">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center"
          >
            <User className="h-4 w-4 text-white" />
          </motion.div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-neutral-200">
              {profile?.role === 'student' ? 'Student' : 
               profile?.role === 'analyst' ? 'Analyst' : 
               profile?.role === 'researcher' ? 'Researcher' : 
               'User'}
            </div>
            <div className="text-xs text-neutral-400">
              {user.email}
            </div>
          </div>
        </Menu.Button>
        
        <AnimatePresence>
          <Menu.Items as={motion.div}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg overflow-hidden z-50"
          >
            <div className="p-3 border-b border-neutral-800">
              <div className="font-medium text-neutral-200">{user.email}</div>
              <div className="text-xs text-neutral-400">
                {profile?.role === 'student' ? 'Student Account' : 
                 profile?.role === 'analyst' ? 'Analyst Account' : 
                 profile?.role === 'researcher' ? 'Researcher Account' : 
                 'User Account'}
              </div>
            </div>
            
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/profile"
                    className={`flex items-center w-full px-4 py-2 text-sm ${
                      active ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-300'
                    }`}
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile Settings
                  </Link>
                )}
              </Menu.Item>
              
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`flex items-center w-full px-4 py-2 text-sm ${
                      active ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-300'
                    }`}
                  >
                    <Award className="h-4 w-4 mr-3" />
                    Achievements
                  </button>
                )}
              </Menu.Item>
              
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`flex items-center w-full px-4 py-2 text-sm ${
                      active ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-300'
                    }`}
                  >
                    <Bell className="h-4 w-4 mr-3" />
                    Notification Settings
                  </button>
                )}
              </Menu.Item>
              
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`flex items-center w-full px-4 py-2 text-sm ${
                      active ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-300'
                    }`}
                  >
                    <Shield className="h-4 w-4 mr-3" />
                    Privacy & Security
                  </button>
                )}
              </Menu.Item>
              
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`flex items-center w-full px-4 py-2 text-sm ${
                      active ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-300'
                    }`}
                  >
                    <HelpCircle className="h-4 w-4 mr-3" />
                    Help & Support
                  </button>
                )}
              </Menu.Item>
            </div>
            
            <div className="py-1 border-t border-neutral-800">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => signOut()}
                    className={`flex items-center w-full px-4 py-2 text-sm ${
                      active ? 'bg-neutral-800 text-error-400' : 'text-error-500'
                    }`}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </AnimatePresence>
      </Menu>
    </div>
  );
}