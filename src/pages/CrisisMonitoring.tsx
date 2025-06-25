import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Globe, 
  Clock, 
  TrendingUp,
  Filter,
  Bell,
  RefreshCw,
  Eye,
  MapPin,
  Play,
  Pause,
  Settings,
  BellRing
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useCrisisMonitoring } from '../hooks/useCrisisMonitoring';

const monitoringRegions = [
  'Eastern Europe',
  'South China Sea',
  'Middle East',
  'Central Africa',
  'Korean Peninsula',
  'Latin America',
  'South Asia',
  'Arctic Region'
];

const crisisCategories = [
  'political',
  'military', 
  'economic',
  'environmental',
  'social',
  'cyber'
];

const severityLevels = [
  { value: 'medium', label: 'Medium & Above', color: 'info' },
  { value: 'high', label: 'High & Critical', color: 'warning' },
  { value: 'critical', label: 'Critical Only', color: 'error' }
];

export default function CrisisMonitoring() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [monitoringConfig, setMonitoringConfig] = useState({
    regions: ['Eastern Europe', 'South China Sea'],
    severity: 'medium' as 'medium' | 'high' | 'critical',
    categories: ['political', 'military'],
    keywords: ['conflict', 'tension', 'crisis']
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const {
    loading,
    error,
    crisisEvents,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    acknowledgeAlert,
    requestNotificationPermission
  } = useCrisisMonitoring();

  useEffect(() => {
    // Check notification permission on mount
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  const handleStartMonitoring = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      setNotificationsEnabled(granted);
    }
    await startMonitoring(monitoringConfig);
  };

  const handleStopMonitoring = () => {
    stopMonitoring();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'military': return <AlertTriangle className="h-4 w-4" />;
      case 'political': return <Globe className="h-4 w-4" />;
      case 'economic': return <TrendingUp className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleRegionToggle = (region: string) => {
    setMonitoringConfig(prev => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region]
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setMonitoringConfig(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

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
                AI Crisis Monitoring Center
              </h1>
              <p className="text-neutral-400">
                Real-time detection and analysis of emerging geopolitical crises with AI-powered insights
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <div className="flex items-center space-x-2">
                <BellRing className={`h-5 w-5 ${alerts.length > 0 ? 'text-error-400' : 'text-neutral-500'}`} />
                <span className="text-sm text-neutral-300">
                  {alerts.length} active alerts
                </span>
              </div>
              <Badge variant={isMonitoring ? 'success' : 'default'}>
                {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Monitoring Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-100 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-primary-400" />
                Monitoring Configuration
              </h2>
              <div className="flex items-center space-x-3">
                {isMonitoring ? (
                  <Button variant="outline" onClick={handleStopMonitoring}>
                    <Pause className="h-4 w-4 mr-2" />
                    Stop Monitoring
                  </Button>
                ) : (
                  <Button onClick={handleStartMonitoring} loading={loading}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Monitoring
                  </Button>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-neutral-200 mb-3">Regions to Monitor</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {monitoringRegions.map(region => (
                    <label key={region} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={monitoringConfig.regions.includes(region)}
                        onChange={() => handleRegionToggle(region)}
                        className="rounded"
                      />
                      <span className="text-sm text-neutral-300">{region}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-neutral-200 mb-3">Crisis Categories</h3>
                <div className="space-y-2">
                  {crisisCategories.map(category => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={monitoringConfig.categories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="rounded"
                      />
                      <span className="text-sm text-neutral-300 capitalize">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-neutral-200 mb-3">Alert Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-neutral-400 mb-2 block">Minimum Severity</label>
                    <select
                      value={monitoringConfig.severity}
                      onChange={(e) => setMonitoringConfig(prev => ({ 
                        ...prev, 
                        severity: e.target.value as any 
                      }))}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200"
                    >
                      {severityLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={notificationsEnabled}
                      onChange={(e) => setNotificationsEnabled(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-neutral-300">Browser Notifications</span>
                  </label>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <Card className="p-4 border-error-600/50 bg-error-900/20">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-error-400" />
                <span className="text-error-300">{error}</span>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Active Alerts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center">
                <Bell className="h-4 w-4 mr-2 text-warning-400" />
                Active Alerts
              </h3>
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-8 w-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">No active alerts</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 rounded-lg border border-warning-600/50 bg-warning-900/20"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <Badge variant={getSeverityColor(alert.severity) as any} size="sm">
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="text-xs text-neutral-400 hover:text-neutral-200"
                        >
                          Dismiss
                        </button>
                      </div>
                      <h4 className="font-medium text-neutral-100 text-sm mb-1">
                        {alert.title}
                      </h4>
                      <p className="text-xs text-neutral-400 mb-2">{alert.description}</p>
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>{alert.region}</span>
                        <span>{alert.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Crisis Events List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-100">
                  Detected Crisis Events
                </h2>
                <div className="flex items-center space-x-2">
                  {loading && <LoadingSpinner size="sm" />}
                  <span className="text-sm text-neutral-400">
                    {crisisEvents.length} events detected
                  </span>
                </div>
              </div>

              {crisisEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Globe className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-300 mb-2">
                    No Crisis Events Detected
                  </h3>
                  <p className="text-sm text-neutral-500">
                    {isMonitoring 
                      ? 'AI monitoring is active. Events will appear here as they are detected.'
                      : 'Start monitoring to begin detecting crisis events.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {crisisEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedEvent?.id === event.id
                          ? 'border-primary-600/50 bg-primary-900/20'
                          : 'border-neutral-700/50 bg-neutral-800/20 hover:border-neutral-600/50'
                      }`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(event.category)}
                          <h3 className="font-semibold text-neutral-100">{event.title}</h3>
                          <Badge variant={getSeverityColor(event.severity) as any}>
                            {event.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-sm text-neutral-400 mb-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {event.region}
                          </div>
                          <div className="flex items-center text-xs text-neutral-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {event.timestamp}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-neutral-400 mb-3">{event.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-xs text-neutral-500">
                            Confidence: <span className="text-neutral-300">{event.confidence}%</span>
                          </div>
                          <div className="text-xs text-neutral-500">
                            Sources: <span className="text-neutral-300">{event.sources}</span>
                          </div>
                        </div>
                        <div className="text-xs text-neutral-500">
                          Escalation Risk: 
                          <span className={`ml-1 ${
                            event.escalation_probability > 70 ? 'text-error-400' :
                            event.escalation_probability > 50 ? 'text-warning-400' : 'text-success-400'
                          }`}>
                            {event.escalation_probability}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Event Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {selectedEvent ? (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-100">
                    Event Analysis
                  </h3>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Full Report
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="text-center p-4 bg-neutral-800/20 rounded-lg">
                    <div className="text-2xl font-bold text-neutral-100 mb-1">
                      {selectedEvent.escalation_probability}%
                    </div>
                    <div className="text-sm text-neutral-400">Escalation Risk</div>
                    <Badge 
                      variant={
                        selectedEvent.escalation_probability > 70 ? 'error' :
                        selectedEvent.escalation_probability > 50 ? 'warning' : 'success'
                      } 
                      className="mt-2"
                    >
                      {selectedEvent.escalation_probability > 70 ? 'High Risk' :
                       selectedEvent.escalation_probability > 50 ? 'Medium Risk' : 'Low Risk'}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-medium text-neutral-200 mb-3">Key Trends</h4>
                    <div className="space-y-3">
                      {selectedEvent.trends?.map((trend: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-neutral-300">{trend.metric}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${
                              trend.direction === 'up' ? 'text-error-400' :
                              trend.direction === 'down' ? 'text-success-400' : 'text-neutral-400'
                            }`}>
                              {trend.change > 0 ? '+' : ''}{trend.change}%
                            </span>
                            {trend.direction === 'up' && <TrendingUp className="h-3 w-3 text-error-400" />}
                            {trend.direction === 'down' && <TrendingUp className="h-3 w-3 text-success-400 rotate-180" />}
                          </div>
                        </div>
                      )) || (
                        <div className="text-sm text-neutral-500">No trend data available</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-neutral-200 mb-2">Intelligence Sources</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-400">Verified Sources</span>
                      <span className="text-sm font-medium text-neutral-200">
                        {selectedEvent.sources}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-400">Confidence Level</span>
                      <span className="text-sm font-medium text-neutral-200">
                        {selectedEvent.confidence}%
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-700">
                    <h4 className="font-medium text-neutral-200 mb-2">Event Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Region</span>
                        <span className="text-neutral-200">{selectedEvent.region}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Category</span>
                        <span className="text-neutral-200 capitalize">{selectedEvent.category}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">First Detected</span>
                        <span className="text-neutral-200">{selectedEvent.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-300 mb-2">
                  Select an Event
                </h3>
                <p className="text-sm text-neutral-500">
                  Click on a crisis event to view detailed AI analysis and risk metrics
                </p>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}