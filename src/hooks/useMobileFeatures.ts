import { useState, useEffect } from 'react';
import { useToast } from './useToast';

interface OfflineData {
  lastSync: string;
  cachedAssessments: any[];
  cachedTutorials: any[];
  userProgress: any;
}

export function useMobileFeatures() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  
  const { showToast } = useToast();

  useEffect(() => {
    // Online/offline detection
    const handleOnline = () => {
      setIsOnline(true);
      showToast('success', 'Back Online', 'Syncing data...');
      syncOfflineData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      showToast('warning', 'Offline Mode', 'Using cached data');
      loadOfflineData();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check if app is installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };
    
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });
    
    checkInstalled();

    // Check notification permission
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }

    // Load offline data on mount
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const loadOfflineData = () => {
    try {
      const cached = localStorage.getItem('offlineData');
      if (cached) {
        setOfflineData(JSON.parse(cached));
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const syncOfflineData = async () => {
    try {
      // Simulate data sync
      const syncData = {
        lastSync: new Date().toISOString(),
        cachedAssessments: [],
        cachedTutorials: [],
        userProgress: {}
      };
      
      localStorage.setItem('offlineData', JSON.stringify(syncData));
      setOfflineData(syncData);
      showToast('success', 'Sync Complete', 'All data updated');
      
      // Register for background sync if supported
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        try {
          await registration.sync.register('background-sync');
          console.log('Background sync registered');
        } catch (err) {
          console.error('Background sync registration failed:', err);
        }
      }
    } catch (error) {
      showToast('error', 'Sync Failed', 'Unable to sync data');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      
      if (permission === 'granted') {
        showToast('success', 'Notifications Enabled', 'You will receive push notifications');
        
        // Register service worker for push notifications
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.ready;
            console.log('Service Worker ready for push:', registration);
            
            // In a real app, we would subscribe to push here
            // const subscription = await registration.pushManager.subscribe({...});
          } catch (error) {
            console.error('Push registration failed:', error);
          }
        }
      } else {
        showToast('warning', 'Notifications Disabled', 'Enable in browser settings');
      }
    }
  };

  const installPWA = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        showToast('success', 'App Installed', 'GeoPolitik added to home screen');
        setIsInstalled(true);
      }
      
      setInstallPrompt(null);
    }
  };

  const downloadOfflineData = async () => {
    try {
      setLoading(true);
      
      // Simulate downloading data for offline use
      const dataToCache = {
        lastSync: new Date().toISOString(),
        cachedAssessments: [
          {
            region: 'Eastern Europe',
            riskScore: 78,
            confidenceInterval: [72, 84],
            primaryDrivers: [
              { factor: 'Military Tensions', weight: 0.35, trend: 'increasing' },
              { factor: 'Energy Security', weight: 0.28, trend: 'stable' },
              { factor: 'Economic Sanctions', weight: 0.22, trend: 'increasing' },
              { factor: 'Diplomatic Relations', weight: 0.15, trend: 'decreasing' }
            ]
          },
          {
            region: 'South China Sea',
            riskScore: 65,
            confidenceInterval: [60, 70],
            primaryDrivers: [
              { factor: 'Territorial Disputes', weight: 0.40, trend: 'stable' },
              { factor: 'Military Presence', weight: 0.30, trend: 'increasing' },
              { factor: 'Economic Interests', weight: 0.20, trend: 'stable' },
              { factor: 'International Law', weight: 0.10, trend: 'decreasing' }
            ]
          }
        ],
        cachedTutorials: [
          {
            concept: 'Nash Equilibrium',
            explanation: 'A Nash equilibrium is a solution concept where no player can unilaterally improve their payoff by changing their strategy.',
            geopoliticalExample: 'In nuclear deterrence, both superpowers choosing to maintain nuclear arsenals represents a Nash equilibrium.'
          },
          {
            concept: 'Prisoner\'s Dilemma',
            explanation: 'A game theory scenario where two rational actors might not cooperate even when it\'s in their best interests.',
            geopoliticalExample: 'Trade negotiations where countries might impose tariffs despite mutual benefits of free trade.'
          }
        ],
        userProgress: {
          completedModules: ['Nash Equilibrium', 'Game Theory Basics'],
          currentScore: 85,
          timeSpent: 120
        }
      };
      
      localStorage.setItem('offlineData', JSON.stringify(dataToCache));
      setOfflineData(dataToCache);
      
      // Cache key API endpoints and assets
      if ('caches' in window) {
        const cache = await caches.open('geopolitik-offline');
        await cache.addAll([
          '/',
          '/dashboard',
          '/tutorials',
          '/risk-assessment',
          '/crisis-monitoring',
          '/static/js/main.js',
          '/static/css/main.css',
          '/manifest.json'
        ]);
      }
      
      showToast('success', 'Data Downloaded', 'Content available offline');
    } catch (error) {
      showToast('error', 'Download Failed', 'Unable to cache data for offline use');
    } finally {
      setLoading(false);
    }
  };

  const [loading, setLoading] = useState(false);

  return {
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
  };
}