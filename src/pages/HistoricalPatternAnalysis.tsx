import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  TrendingUp, 
  Calendar, 
  Filter, 
  Download,
  Eye,
  BarChart3,
  Globe,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useHistoricalAnalysis } from '../hooks/useHistoricalAnalysis';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface ConflictEvent {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  region: string;
  type: string;
  severity: number;
  factors: string[];
  outcome: string;
  lessons: string[];
}

interface Pattern {
  id: string;
  name: string;
  frequency: number;
  confidence: number;
  triggers: string[];
  outcomes: string[];
  timeline: number[];
}

export default function HistoricalPatternAnalysis() {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('5-years');
  const [activeTab, setActiveTab] = useState<'events' | 'patterns' | 'comparison'>('events');

  const {
    loading,
    error,
    events,
    patterns,
    comparisonData,
    loadHistoricalData,
    analyzePatterns,
    compareEvents,
    exportData
  } = useHistoricalAnalysis();

  useEffect(() => {
    loadHistoricalData(selectedRegion, selectedType, dateRange);
  }, [selectedRegion, selectedType, dateRange]);

  const handlePatternAnalysis = async () => {
    await analyzePatterns(selectedRegion, selectedType);
  };

  const handleComparison = async () => {
    await compareEvents(selectedRegion, selectedType);
  };

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    await exportData(format, selectedRegion, selectedType);
  };

  const regions = ['Global', 'Eastern Europe', 'South China Sea', 'Middle East', 'Africa', 'South America'];
  const conflictTypes = ['All', 'Military', 'Economic', 'Political', 'Cyber', 'Diplomatic'];
  const dateRanges = ['1-year', '5-years', '10-years', '20-years', '50-years'];

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
                Historical Pattern Analysis
              </h1>
              <p className="text-neutral-400">
                Analyze historical conflicts and extract predictive patterns
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Badge variant="info">AI-Powered</Badge>
              <Badge variant="success">Historical Data</Badge>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
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
                  Region
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-neutral-100 focus:ring-2 focus:ring-primary-500"
                >
                  {regions.map(region => (
                    <option key={region} value={region.toLowerCase().replace(' ', '-')}>{region}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Conflict Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-neutral-100 focus:ring-2 focus:ring-primary-500"
                >
                  {conflictTypes.map(type => (
                    <option key={type} value={type.toLowerCase()}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Time Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-neutral-100 focus:ring-2 focus:ring-primary-500"
                >
                  {dateRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end space-x-2">
                <Button onClick={handlePatternAnalysis} loading={loading}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analyze Patterns
                </Button>
                <Button onClick={handleComparison} variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Compare
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
              { id: 'events', label: 'Conflict Events', icon: History },
              { id: 'patterns', label: 'Pattern Analysis', icon: TrendingUp },
              { id: 'comparison', label: 'Event Comparison', icon: Eye }
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
          {activeTab === 'events' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-neutral-100 flex items-center">
                    <History className="h-5 w-5 mr-2 text-primary-400" />
                    Historical Conflict Events
                  </h2>
                  <Button onClick={() => handleExport('json')} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <LoadingSpinner size="lg" />
                    <p className="text-neutral-400 mt-4">Loading historical events...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event: ConflictEvent) => (
                      <div key={event.id} className="p-4 bg-neutral-800/20 rounded-lg border border-neutral-700/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-neutral-100 mb-2">{event.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-neutral-400 mb-2">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {event.start_date} - {event.end_date || 'Ongoing'}
                              </span>
                              <span className="flex items-center">
                                <Globe className="h-4 w-4 mr-1" />
                                {event.region}
                              </span>
                              <span className="flex items-center">
                                <Target className="h-4 w-4 mr-1" />
                                {event.type}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {event.factors.map((factor: string) => (
                                <Badge key={factor} variant="default" size="sm">
                                  {factor}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-sm text-neutral-400 mb-2">{event.outcome}</p>
                            <div className="text-sm text-neutral-500">
                              <strong>Lessons:</strong> {event.lessons.join(', ')}
                            </div>
                          </div>
                          <div className="ml-4">
                            <Badge 
                              variant={event.severity >= 8 ? 'error' : event.severity >= 5 ? 'warning' : 'success'}
                              size="sm"
                            >
                              Severity: {event.severity}/10
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

          {activeTab === 'patterns' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-neutral-100 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary-400" />
                    Predictive Patterns
                  </h2>
                  <Button onClick={() => handleExport('csv')} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Patterns
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <LoadingSpinner size="lg" />
                    <p className="text-neutral-400 mt-4">Analyzing patterns...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {patterns.map((pattern: Pattern) => (
                      <div key={pattern.id} className="p-4 bg-neutral-800/20 rounded-lg border border-neutral-700/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-neutral-100 mb-2">{pattern.name}</h3>
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-neutral-400 mb-1">Frequency</div>
                                <div className="text-neutral-100 font-medium">{pattern.frequency} occurrences</div>
                              </div>
                              <div>
                                <div className="text-neutral-400 mb-1">Confidence</div>
                                <div className="text-neutral-100 font-medium">{(pattern.confidence * 100).toFixed(1)}%</div>
                              </div>
                              <div>
                                <div className="text-neutral-400 mb-1">Timeline</div>
                                <div className="text-neutral-100 font-medium">{Math.max(...pattern.timeline)} days avg</div>
                              </div>
                            </div>
                            <div className="mt-3">
                              <div className="text-sm text-neutral-400 mb-2">
                                <strong>Triggers:</strong> {pattern.triggers.join(', ')}
                              </div>
                              <div className="text-sm text-neutral-400">
                                <strong>Outcomes:</strong> {pattern.outcomes.join(', ')}
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            <Badge 
                              variant={pattern.confidence >= 0.8 ? 'success' : pattern.confidence >= 0.6 ? 'warning' : 'error'}
                              size="sm"
                            >
                              {(pattern.confidence * 100).toFixed(0)}% Confidence
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

          {activeTab === 'comparison' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-neutral-100 flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-primary-400" />
                    Event Comparison Analysis
                  </h2>
                  <Button onClick={() => handleExport('pdf')} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <LoadingSpinner size="lg" />
                    <p className="text-neutral-400 mt-4">Generating comparison...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {comparisonData.map((comparison: any) => (
                      <div key={comparison.id} className="p-4 bg-neutral-800/20 rounded-lg border border-neutral-700/50">
                        <h3 className="font-medium text-neutral-100 mb-3">{comparison.title}</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-neutral-300 mb-2">Similarities</h4>
                            <div className="space-y-2">
                              {comparison.similarities.map((similarity: string, index: number) => (
                                <div key={index} className="flex items-center text-sm text-green-400">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {similarity}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-neutral-300 mb-2">Differences</h4>
                            <div className="space-y-2">
                              {comparison.differences.map((difference: string, index: number) => (
                                <div key={index} className="flex items-center text-sm text-yellow-400">
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  {difference}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-neutral-700">
                          <div className="text-sm text-neutral-400">
                            <strong>Predictive Insights:</strong> {comparison.insights}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
