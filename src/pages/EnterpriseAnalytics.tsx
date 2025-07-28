import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Globe, 
  DollarSign,
  Activity,
  FileText,
  Settings,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useEnterpriseAnalytics } from '../hooks/useEnterpriseAnalytics';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface EnterpriseMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
}

interface UsageReport {
  id: string;
  period: string;
  api_calls: number;
  active_users: number;
  regions_analyzed: number;
  cost: number;
  roi: number;
}

interface EnterpriseAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export default function EnterpriseAnalytics() {
  const [timeRange, setTimeRange] = useState<string>('30-days');
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'roi' | 'alerts'>('overview');

  const {
    loading,
    error,
    metrics,
    usageReports,
    roiData,
    alerts,
    loadEnterpriseData,
    generateUsageReport,
    calculateROI,
    exportEnterpriseData,
    refreshMetrics
  } = useEnterpriseAnalytics();

  useEffect(() => {
    loadEnterpriseData(timeRange, selectedMetric);
  }, [timeRange, selectedMetric]);

  const handleExportReport = async (format: 'pdf' | 'csv' | 'json') => {
    await exportEnterpriseData(format, timeRange);
  };

  const handleRefresh = async () => {
    await refreshMetrics();
  };

  const timeRanges = ['7-days', '30-days', '90-days', '1-year'];
  const metricCategories = ['all', 'api', 'users', 'regions', 'cost'];

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
                Enterprise Analytics Dashboard
              </h1>
              <p className="text-neutral-400">
                Comprehensive analytics and ROI tracking for enterprise systems
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Badge variant="success">Enterprise</Badge>
              <Badge variant="info">Real-time</Badge>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Time Range
                </label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-neutral-100 focus:ring-2 focus:ring-primary-500"
                >
                  {timeRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Metric Category
                </label>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-neutral-100 focus:ring-2 focus:ring-primary-500"
                >
                  {metricCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end space-x-2">
                <Button onClick={handleRefresh} loading={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={() => handleExportReport('pdf')} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-neutral-800/50 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'usage', label: 'Usage Reports', icon: FileText },
              { id: 'roi', label: 'ROI Analysis', icon: DollarSign },
              { id: 'alerts', label: 'System Alerts', icon: AlertTriangle }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid md:grid-cols-4 gap-6">
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary-900/20 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-primary-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-neutral-100">
                        {metrics.filter(m => m.name === 'api_calls')[0]?.value.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-neutral-400">API Calls</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-900/20 rounded-lg">
                      <Users className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-neutral-100">
                        {metrics.filter(m => m.name === 'active_users')[0]?.value.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-neutral-400">Active Users</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-900/20 rounded-lg">
                      <Globe className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-neutral-100">
                        {metrics.filter(m => m.name === 'regions_analyzed')[0]?.value || '0'}
                      </div>
                      <div className="text-sm text-neutral-400">Regions</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-900/20 rounded-lg">
                      <DollarSign className="h-6 w-6 text-purple-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-neutral-100">
                        ${metrics.filter(m => m.name === 'total_cost')[0]?.value.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-neutral-400">Total Cost</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Trend Chart */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-neutral-100">Usage Trends</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="success">+12.5%</Badge>
                    <span className="text-sm text-neutral-400">vs last period</span>
                  </div>
                </div>
                <div className="h-64 bg-neutral-800/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-primary-400 mx-auto mb-2" />
                    <p className="text-neutral-400">Usage trend visualization</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-neutral-100">Detailed Usage Reports</h3>
                  <Button onClick={() => handleExportReport('csv')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <LoadingSpinner size="lg" />
                    <p className="text-neutral-400 mt-4">Loading usage reports...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {usageReports.map((report: UsageReport) => (
                      <div key={report.id} className="p-4 bg-neutral-800/20 rounded-lg border border-neutral-700/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-neutral-100">{report.period}</h4>
                            <div className="grid md:grid-cols-4 gap-4 mt-2 text-sm">
                              <div>
                                <div className="text-neutral-400">API Calls</div>
                                <div className="text-neutral-100 font-medium">{report.api_calls.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-neutral-400">Active Users</div>
                                <div className="text-neutral-100 font-medium">{report.active_users}</div>
                              </div>
                              <div>
                                <div className="text-neutral-400">Regions</div>
                                <div className="text-neutral-100 font-medium">{report.regions_analyzed}</div>
                              </div>
                              <div>
                                <div className="text-neutral-400">Cost</div>
                                <div className="text-neutral-100 font-medium">${report.cost.toLocaleString()}</div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={report.roi >= 300 ? 'success' : report.roi >= 200 ? 'warning' : 'error'}>
                              ROI: {report.roi}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'roi' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-neutral-100">ROI Analysis</h3>
                  <Button onClick={() => handleExportReport('pdf')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-700/50">
                    <div className="text-3xl font-bold text-green-300 mb-2">287%</div>
                    <div className="text-neutral-400">Average ROI</div>
                  </div>
                  <div className="text-center p-4 bg-blue-900/20 rounded-lg border border-blue-700/50">
                    <div className="text-3xl font-bold text-blue-300 mb-2">$2.3M</div>
                    <div className="text-neutral-400">Cost Savings</div>
                  </div>
                  <div className="text-center p-4 bg-purple-900/20 rounded-lg border border-purple-700/50">
                    <div className="text-3xl font-bold text-purple-300 mb-2">94%</div>
                    <div className="text-neutral-400">Accuracy Rate</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-neutral-800/20 rounded-lg border border-neutral-700/50">
                    <h4 className="font-medium text-neutral-200 mb-3">ROI Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Risk Mitigation</span>
                        <span className="text-green-400">$1.2M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Decision Speed</span>
                        <span className="text-green-400">$800K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Accuracy Improvement</span>
                        <span className="text-green-400">$300K</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-neutral-100">System Alerts</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="success">12 Resolved</Badge>
                    <Badge variant="warning">3 Active</Badge>
                  </div>
                </div>

                {alerts.map((alert: EnterpriseAlert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border mb-3 ${
                    alert.severity === 'critical' ? 'bg-red-900/20 border-red-700/50' :
                    alert.severity === 'high' ? 'bg-orange-900/20 border-orange-700/50' :
                    alert.severity === 'medium' ? 'bg-yellow-900/20 border-yellow-700/50' :
                    'bg-green-900/20 border-green-700/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {alert.severity === 'critical' ? (
                          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                        )}
                        <span className="text-neutral-100">{alert.message}</span>
                      </div>
                      <Badge variant={alert.resolved ? 'success' : 'warning'}>
                        {alert.resolved ? 'Resolved' : 'Active'}
                      </Badge>
                    </div>
                    <div className="text-sm text-neutral-400 mt-2">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
