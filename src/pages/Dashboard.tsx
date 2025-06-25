import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Activity,
  Globe,
  Users,
  Target,
  Brain,
  RefreshCw
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { ResponsiveContainer } from '../components/ResponsiveContainer';
import { useAuth } from '../components/AuthProvider';
import { LoadingOverlay } from '../components/LoadingOverlay';

interface DashboardMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface RiskAlert {
  id: string;
  region: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
}

const dashboardMetrics: DashboardMetric[] = [
  {
    id: '1',
    title: 'Global Risk Index',
    value: '67',
    change: -3.2,
    changeLabel: 'vs last week',
    icon: Globe,
    color: 'text-primary-400'
  },
  {
    id: '2',
    title: 'Active Simulations',
    value: '24',
    change: 12.5,
    changeLabel: 'this month',
    icon: Target,
    color: 'text-secondary-400'
  },
  {
    id: '3',
    title: 'Learning Progress',
    value: '78%',
    change: 5.8,
    changeLabel: 'completion rate',
    icon: Brain,
    color: 'text-accent-400'
  },
  {
    id: '4',
    title: 'Alert Accuracy',
    value: '89%',
    change: 2.1,
    changeLabel: 'prediction rate',
    icon: Activity,
    color: 'text-success-400'
  }
];

const riskAlerts: RiskAlert[] = [
  {
    id: '1',
    region: 'Eastern Europe',
    level: 'high',
    title: 'Escalating Tensions',
    description: 'Military buildup detected along contested borders with 73% confidence',
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    region: 'South China Sea',
    level: 'medium',
    title: 'Naval Activity Increase',
    description: 'Unusual patrol patterns suggesting strategic positioning',
    timestamp: '5 hours ago'
  },
  {
    id: '3',
    region: 'Middle East',
    level: 'medium',
    title: 'Economic Sanctions Impact',
    description: 'Trade flow disruptions affecting regional stability indicators',
    timestamp: '1 day ago'
  }
];

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Simulate data loading
    const loadingTimer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => {
      clearInterval(timer);
      clearTimeout(loadingTimer);
    };
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return <LoadingOverlay message="Loading dashboard data..." fullScreen />;
  }

  return (
    <div className="min-h-screen pt-16 pb-8">
      <ResponsiveContainer>
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-neutral-100 mb-2">
                Strategic Intelligence Dashboard
              </h1>
              <p className="text-neutral-400">
                Real-time geopolitical analysis and risk assessment
              </p>
            </div>
            <div className="mt-4 lg:mt-0 text-right">
              <div className="text-sm text-neutral-400">Last Updated</div>
              <div className="text-lg font-mono text-neutral-200">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {dashboardMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card hover className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-neutral-800/50 ${metric.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className={`flex items-center text-sm ${
                      metric.change >= 0 ? 'text-success-400' : 'text-error-400'
                    }`}>
                      {metric.change >= 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(metric.change)}%
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-neutral-100 mb-1">
                    {metric.value}
                  </div>
                  <div className="text-sm text-neutral-400">{metric.title}</div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {metric.changeLabel}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Risk Alerts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-100 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-warning-400" />
                  Active Risk Alerts
                </h2>
                <Link to="/crisis-monitoring">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {riskAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="p-4 rounded-lg border border-neutral-700/50 bg-neutral-800/20 hover:bg-neutral-800/40 transition-colors duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2">
                      <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                        <Badge variant={getLevelColor(alert.level) as any}>
                          {alert.level.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-neutral-400">{alert.region}</span>
                      </div>
                      <span className="text-xs text-neutral-500">{alert.timestamp}</span>
                    </div>
                    <h3 className="font-medium text-neutral-100 mb-1">{alert.title}</h3>
                    <p className="text-sm text-neutral-400">{alert.description}</p>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-neutral-100 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link to="/simulation" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    New Simulation
                  </Button>
                </Link>
                <Link to="/risk-assessment" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Risk Analysis
                  </Button>
                </Link>
                <Link to="/tutorials" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Brain className="h-4 w-4 mr-2" />
                    Continue Learning
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-neutral-100 mb-4">
                System Status
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">AI Models</span>
                  <Badge variant="success">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Data Feeds</span>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Predictions</span>
                  <Badge variant="success">87% Accuracy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Response Time</span>
                  <Badge variant="info">1.2s avg</Badge>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </ResponsiveContainer>
    </div>
  );
}