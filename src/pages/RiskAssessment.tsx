import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Activity,
  RefreshCw,
  Filter,
  Download,
  MapPin,
  Clock,
  BarChart3
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useRiskAssessment } from '../hooks/useRiskAssessment';

const globalRegions = [
  'Eastern Europe',
  'South China Sea', 
  'Middle East',
  'Central Africa',
  'Korean Peninsula',
  'Latin America',
  'South Asia',
  'Arctic Region'
];

const riskFactors = [
  'Military Tensions',
  'Economic Instability', 
  'Political Transitions',
  'Social Unrest',
  'Cyber Threats',
  'Climate Change',
  'Energy Security',
  'Trade Disputes'
];

export default function RiskAssessment() {
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['Eastern Europe', 'South China Sea']);
  const [selectedFactors, setSelectedFactors] = useState<string[]>(['Military Tensions', 'Economic Instability']);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const {
    loading,
    error,
    assessments,
    lastUpdate,
    generateRiskAssessment,
    refreshAssessment,
    subscribeToUpdates
  } = useRiskAssessment();

  useEffect(() => {
    // Initial load
    generateRiskAssessment(selectedRegions, selectedFactors);
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const unsubscribe = subscribeToUpdates((updatedAssessment) => {
        console.log('Real-time update received:', updatedAssessment);
      });
      return unsubscribe;
    }
  }, [autoRefresh]);

  const handleRefresh = () => {
    generateRiskAssessment(selectedRegions, selectedFactors);
  };

  const handleRegionToggle = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const handleFactorToggle = (factor: string) => {
    setSelectedFactors(prev =>
      prev.includes(factor)
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    );
  };

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'Critical', color: 'error' };
    if (score >= 60) return { level: 'High', color: 'warning' };
    if (score >= 40) return { level: 'Medium', color: 'info' };
    return { level: 'Low', color: 'success' };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-error-400" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-success-400" />;
      default: return <Activity className="h-4 w-4 text-neutral-400" />;
    }
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
                AI-Powered Risk Assessment
              </h1>
              <p className="text-neutral-400">
                Real-time geopolitical risk analysis with machine learning insights
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              {lastUpdate && (
                <div className="text-sm text-neutral-400">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
              <Button
                variant="outline"
                onClick={handleRefresh}
                loading={loading}
                className="flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Configuration Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-100 mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-primary-400" />
                  Select Regions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {globalRegions.map(region => (
                    <button
                      key={region}
                      onClick={() => handleRegionToggle(region)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedRegions.includes(region)
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-100 mb-3 flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2 text-secondary-400" />
                  Risk Factors
                </h3>
                <div className="flex flex-wrap gap-2">
                  {riskFactors.map(factor => (
                    <button
                      key={factor}
                      onClick={() => handleFactorToggle(factor)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedFactors.includes(factor)
                          ? 'bg-secondary-600 text-white'
                          : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                      }`}
                    >
                      {factor}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-neutral-300">Auto-refresh</span>
                </label>
              </div>
              <Button 
                onClick={() => generateRiskAssessment(selectedRegions, selectedFactors)}
                disabled={selectedRegions.length === 0}
              >
                Generate Assessment
              </Button>
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Regional Risk List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-100 flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-primary-400" />
                  Regional Risk Analysis
                </h2>
                <Badge variant="info">
                  {assessments.length} regions analyzed
                </Badge>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                  <span className="ml-3 text-neutral-400">Analyzing geopolitical risks...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {assessments.map((assessment, index) => {
                    const riskLevel = getRiskLevel(assessment.riskScore);
                    const isSelected = selectedAssessment?.region === assessment.region;
                    
                    return (
                      <motion.div
                        key={assessment.region}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'border-primary-600/50 bg-primary-900/20'
                            : 'border-neutral-700/50 bg-neutral-800/20 hover:border-neutral-600/50 hover:bg-neutral-800/40'
                        }`}
                        onClick={() => setSelectedAssessment(assessment)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-neutral-100">{assessment.region}</h3>
                            <Badge variant={riskLevel.color as any}>
                              {riskLevel.level}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              <span className="text-2xl font-bold text-neutral-100">
                                {assessment.riskScore}
                              </span>
                              <div className="text-xs text-neutral-500">
                                ±{Math.abs(assessment.confidenceInterval[1] - assessment.confidenceInterval[0])}
                              </div>
                            </div>
                            <div className="text-xs text-neutral-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(assessment.lastUpdated).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {assessment.primaryDrivers.slice(0, 3).map((driver: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                {getTrendIcon(driver.trend)}
                                <span className="text-neutral-300">{driver.factor}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-neutral-700 rounded-full h-1">
                                  <div
                                    className="bg-primary-500 h-1 rounded-full"
                                    style={{ width: `${driver.weight * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs text-neutral-400 w-8">
                                  {Math.round(driver.weight * 100)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {assessment.scenarios && (
                          <div className="mt-3 pt-3 border-t border-neutral-700">
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="text-center">
                                <div className="text-success-400 font-medium">
                                  {Math.round(assessment.scenarios.best.probability * 100)}%
                                </div>
                                <div className="text-neutral-500">Best Case</div>
                              </div>
                              <div className="text-center">
                                <div className="text-warning-400 font-medium">
                                  {Math.round(assessment.scenarios.mostLikely.probability * 100)}%
                                </div>
                                <div className="text-neutral-500">Most Likely</div>
                              </div>
                              <div className="text-center">
                                <div className="text-error-400 font-medium">
                                  {Math.round(assessment.scenarios.worst.probability * 100)}%
                                </div>
                                <div className="text-neutral-500">Worst Case</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Detailed Analysis */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {selectedAssessment ? (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold text-neutral-100 mb-4">
                    {selectedAssessment.region} Deep Dive
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-neutral-800/20 rounded-lg">
                      <div className="text-3xl font-bold text-neutral-100 mb-1">
                        {selectedAssessment.riskScore}
                      </div>
                      <div className="text-sm text-neutral-400">Risk Score</div>
                      <div className="text-xs text-neutral-500 mt-1">
                        Confidence: {selectedAssessment.confidenceInterval[0]}-{selectedAssessment.confidenceInterval[1]}
                      </div>
                      <Badge variant={getRiskLevel(selectedAssessment.riskScore).color as any} className="mt-2">
                        {getRiskLevel(selectedAssessment.riskScore).level} Risk
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-medium text-neutral-200 mb-3">Risk Drivers</h4>
                      <div className="space-y-3">
                        {selectedAssessment.primaryDrivers.map((driver: any, index: number) => (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {getTrendIcon(driver.trend)}
                                <span className="text-sm text-neutral-300">{driver.factor}</span>
                              </div>
                              <span className="text-xs text-neutral-400">
                                {Math.round(driver.weight * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-neutral-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  driver.trend === 'increasing' ? 'bg-error-500' : 
                                  driver.trend === 'decreasing' ? 'bg-success-500' : 'bg-neutral-500'
                                }`}
                                style={{ width: `${driver.weight * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedAssessment.scenarios && (
                      <div>
                        <h4 className="font-medium text-neutral-200 mb-3">Scenario Analysis</h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-success-900/20 border border-success-700/50 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-success-300">Best Case</span>
                              <span className="text-xs text-success-400">
                                {Math.round(selectedAssessment.scenarios.best.probability * 100)}%
                              </span>
                            </div>
                            <p className="text-xs text-neutral-400">
                              {selectedAssessment.scenarios.best.description}
                            </p>
                          </div>
                          <div className="p-3 bg-warning-900/20 border border-warning-700/50 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-warning-300">Most Likely</span>
                              <span className="text-xs text-warning-400">
                                {Math.round(selectedAssessment.scenarios.mostLikely.probability * 100)}%
                              </span>
                            </div>
                            <p className="text-xs text-neutral-400">
                              {selectedAssessment.scenarios.mostLikely.description}
                            </p>
                          </div>
                          <div className="p-3 bg-error-900/20 border border-error-700/50 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-error-300">Worst Case</span>
                              <span className="text-xs text-error-400">
                                {Math.round(selectedAssessment.scenarios.worst.probability * 100)}%
                              </span>
                            </div>
                            <p className="text-xs text-neutral-400">
                              {selectedAssessment.scenarios.worst.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-6">
                  <h4 className="font-medium text-neutral-200 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => refreshAssessment(selectedAssessment.region)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh This Region
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export Analysis
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Set Alert Threshold
                    </Button>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-6 text-center">
                <Globe className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-300 mb-2">
                  Select a Region
                </h3>
                <p className="text-sm text-neutral-500">
                  Click on a region to view detailed AI-powered risk analysis and scenario projections
                </p>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}