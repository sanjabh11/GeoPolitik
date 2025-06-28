import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Download, 
  Bell,
  Menu,
  X,
  Home,
  TrendingUp,
  AlertTriangle,
  User,
  Settings
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useMobileFeatures } from '../hooks/useMobileFeatures';

export default function MobileOptimized() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const {
    isOnline,
    offlineData,
    notificationsEnabled,
    installPrompt,
    isInstalled,
    loading,
    syncOfflineData,
    requestNotificationPermission,
    installPWA,
    downloadOfflineData
  } = useMobileFeatures();

  const mobileNavItems = [
    { name: 'Dashboard', icon: Home, href: '/dashboard' },
    { name: 'Risk Analysis', icon: TrendingUp, href: '/risk-assessment' },
    { name: 'Crisis Monitor', icon: AlertTriangle, href: '/crisis-monitoring' },
    { name: 'Profile', icon: User, href: '/profile' }
  ];

  return (
    <div className="min-h-screen pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-neutral-100 mb-2">
                Mobile Experience
              </h1>
              <p className="text-neutral-400">
                Optimized mobile workflows with offline capabilities and push notifications
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Wifi className="h-5 w-5 text-success-400" />
                ) : (
                  <WifiOff className="h-5 w-5 text-error-400" />
                )}
                <span className="text-sm text-neutral-300">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <Badge variant={isOnline ? 'success' : 'warning'}>
                {isOnline ? 'Connected' : 'Cached Data'}
              </Badge>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Mobile Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-neutral-100 mb-4 flex items-center">
                <Smartphone className="h-5 w-5 mr-2 text-primary-400" />
                Mobile Features
              </h2>
              <div className="space-y-4">
                {installPrompt && !isInstalled && (
                  <div className="p-4 bg-primary-900/20 border border-primary-700/50 rounded-lg">
                    <h3 className="font-medium text-primary-300 mb-2">Install App</h3>
                    <p className="text-sm text-neutral-400 mb-3">
                      Add GeoPolitik to your home screen for quick access
                    </p>
                    <Button onClick={installPWA} size="sm" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Install App
                    </Button>
                  </div>
                )}

                {isInstalled && (
                  <div className="p-4 bg-success-900/20 border border-success-700/50 rounded-lg">
                    <h3 className="font-medium text-success-300 mb-2">App Installed</h3>
                    <p className="text-sm text-neutral-400">
                      GeoPolitik is installed on your device
                    </p>
                  </div>
                )}

                <div className="p-4 bg-neutral-800/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-neutral-200">Push Notifications</h3>
                    <Badge variant={notificationsEnabled ? 'success' : 'default'} size="sm">
                      {notificationsEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-400 mb-3">
                    Get alerts for crisis events and risk updates
                  </p>
                  {!notificationsEnabled && (
                    <Button 
                      onClick={requestNotificationPermission} 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Enable Notifications
                    </Button>
                  )}
                </div>

                <div className="p-4 bg-neutral-800/20 rounded-lg">
                  <h3 className="font-medium text-neutral-200 mb-2">Offline Mode</h3>
                  <p className="text-sm text-neutral-400 mb-3">
                    Download content for offline access
                  </p>
                  <Button 
                    onClick={downloadOfflineData} 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    loading={loading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download for Offline
                  </Button>
                </div>
              </div>
            </Card>

            {/* Mobile Navigation Demo */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-100 mb-4">
                Mobile Navigation
              </h3>
              <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-neutral-200 font-medium">GeoPolitik</div>
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    {mobileMenuOpen ? (
                      <X className="h-5 w-5 text-neutral-300" />
                    ) : (
                      <Menu className="h-5 w-5 text-neutral-300" />
                    )}
                  </button>
                </div>
                
                <AnimatePresence>
                  {mobileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2"
                    >
                      {mobileNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.name}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                          >
                            <Icon className="h-5 w-5 text-neutral-400" />
                            <span className="text-neutral-300">{item.name}</span>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>

          {/* Offline Data Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-neutral-100 mb-4">
                Offline Capabilities
              </h2>
              
              {offlineData ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-neutral-800/20 rounded-lg">
                      <h3 className="font-medium text-neutral-200 mb-2">Last Sync</h3>
                      <p className="text-sm text-neutral-400">
                        {offlineData.lastSync ? new Date(offlineData.lastSync).toLocaleString() : 'Never'}
                      </p>
                    </div>
                    <div className="p-4 bg-neutral-800/20 rounded-lg">
                      <h3 className="font-medium text-neutral-200 mb-2">Cached Data</h3>
                      <p className="text-sm text-neutral-400">
                        {offlineData.cachedAssessments.length} assessments, {offlineData.cachedTutorials.length} tutorials
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-800/20 rounded-lg">
                    <h3 className="font-medium text-neutral-200 mb-3">Available Offline</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Game Theory Tutorials</span>
                        <Badge variant="success" size="sm">Available</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Risk Assessments</span>
                        <Badge variant="success" size="sm">Available</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">User Progress</span>
                        <Badge variant="success" size="sm">Synced</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Real-time Data</span>
                        <Badge variant={isOnline ? 'success' : 'warning'} size="sm">
                          {isOnline ? 'Live' : 'Cached'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {!isOnline && (
                    <div className="p-4 bg-warning-900/20 border border-warning-700/50 rounded-lg">
                      <h3 className="font-medium text-warning-300 mb-2">Offline Mode Active</h3>
                      <p className="text-sm text-neutral-400 mb-3">
                        You're currently offline. Some features may be limited to cached data.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-success-400 rounded-full"></div>
                          <span className="text-neutral-300">Tutorials and learning content</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-success-400 rounded-full"></div>
                          <span className="text-neutral-300">Cached risk assessments</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-warning-400 rounded-full"></div>
                          <span className="text-neutral-300">Limited real-time updates</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-error-400 rounded-full"></div>
                          <span className="text-neutral-300">No new crisis monitoring</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={syncOfflineData} 
                    disabled={!isOnline || loading}
                    loading={loading && isOnline}
                    className="w-full"
                  >
                    <Wifi className="h-4 w-4 mr-2" />
                    Sync Data
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <WifiOff className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-300 mb-2">
                    No Offline Data
                  </h3>
                  <p className="text-neutral-500 mb-4">
                    Download content to use the app offline
                  </p>
                  <Button onClick={downloadOfflineData} loading={loading}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Content
                  </Button>
                </div>
              )}
            </Card>

            {/* Mobile Workflow Demo */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-neutral-100 mb-4">
                Mobile-Optimized Workflows
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-neutral-800/20 rounded-lg">
                  <h3 className="font-medium text-neutral-200 mb-2">Quick Risk Check</h3>
                  <p className="text-sm text-neutral-400 mb-3">
                    Swipe-based interface for rapid risk assessment review
                  </p>
                  <div className="flex space-x-2">
                    <div className="flex-1 h-2 bg-primary-600 rounded"></div>
                    <div className="flex-1 h-2 bg-neutral-700 rounded"></div>
                    <div className="flex-1 h-2 bg-neutral-700 rounded"></div>
                  </div>
                </div>

                <div className="p-4 bg-neutral-800/20 rounded-lg">
                  <h3 className="font-medium text-neutral-200 mb-2">Voice Commands</h3>
                  <p className="text-sm text-neutral-400 mb-3">
                    "Show me Eastern Europe risk assessment"
                  </p>
                  <Badge variant="info" size="sm">Coming Soon</Badge>
                </div>

                <div className="p-4 bg-neutral-800/20 rounded-lg">
                  <h3 className="font-medium text-neutral-200 mb-2">Gesture Navigation</h3>
                  <p className="text-sm text-neutral-400 mb-3">
                    Swipe gestures for quick navigation between analyses
                  </p>
                  <div className="flex justify-center space-x-4 text-neutral-500">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-neutral-700 rounded-full mb-1"></div>
                      <div className="text-xs">Swipe Left</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-neutral-700 rounded-full mb-1"></div>
                      <div className="text-xs">Tap</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-neutral-700 rounded-full mb-1"></div>
                      <div className="text-xs">Swipe Right</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}