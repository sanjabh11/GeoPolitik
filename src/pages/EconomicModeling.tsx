import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Users,
  Building,
  Globe,
  BarChart3,
  PieChart,
  Calculator,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { geminiService } from '../services/geminiService';
import { useToast } from '../hooks/useToast';

interface EconomicScenario {
  id: string;
  name: string;
  description: string;
  type: 'trade_war' | 'sanctions' | 'currency_crisis' | 'supply_shock' | 'policy_change';
  parameters: {
    affected_countries: string[];
    duration_months: number;
    intensity: 'low' | 'medium' | 'high';
    sectors: string[];
  };
}

interface EconomicImpact {
  gdpImpact: {
    primary: { value: number; confidence: [number, number] };
    secondary: { value: number; confidence: [number, number] };
    total: { value: number; confidence: [number, number] };
  };
  tradeFlows: {
    bilateral: { change: number; volume: number; sectors: string[] };
    multilateral: { change: number; volume: number; affected_countries: number };
  };
  employmentEffects: {
    manufacturing: { jobs: number; percentage: number };
    services: { jobs: number; percentage: number };
    agriculture: { jobs: number; percentage: number };
    net: { jobs: number; percentage: number };
  };
  welfareImpact: {
    consumer: { surplus: number; confidence: [number, number] };
    producer: { surplus: number; confidence: [number, number] };
    government: { revenue: number; expenditure: number };
  };
  fiscalImpact: {
    revenue: { change: number; sources: string[] };
    expenditure: { change: number; categories: string[] };
    deficit: { change: number; sustainability: string };
  };
  timeline: {
    immediate: string;
    short_term: string;
    medium_term: string;
    long_term: string;
  };
}

const predefinedScenarios: EconomicScenario[] = [
  {
    id: '1',
    name: 'US-China Trade War Escalation',
    description: 'Comprehensive tariff increases between the world\'s two largest economies',
    type: 'trade_war',
    parameters: {
      affected_countries: ['United States', 'China', 'Global'],
      duration_months: 24,
      intensity: 'high',
      sectors: ['Manufacturing', 'Technology', 'Agriculture']
    }
  },
  {
    id: '2',
    name: 'Russia Energy Sanctions',
    description: 'Complete embargo on Russian energy exports to Europe',
    type: 'sanctions',
    parameters: {
      affected_countries: ['Russia', 'European Union', 'Global'],
      duration_months: 18,
      intensity: 'high',
      sectors: ['Energy', 'Manufacturing', 'Transportation']
    }
  },
  {
    id: '3',
    name: 'Semiconductor Supply Chain Disruption',
    description: 'Major disruption in global semiconductor production and distribution',
    type: 'supply_shock',
    parameters: {
      affected_countries: ['Taiwan', 'South Korea', 'Global'],
      duration_months: 12,
      intensity: 'medium',
      sectors: ['Technology', 'Automotive', 'Electronics']
    }
  },
  {
    id: '4',
    name: 'European Central Bank Policy Shift',
    description: 'Aggressive monetary tightening in response to inflation',
    type: 'policy_change',
    parameters: {
      affected_countries: ['European Union', 'Global'],
      duration_months: 36,
      intensity: 'medium',
      sectors: ['Financial Services', 'Real Estate', 'Manufacturing']
    }
  }
];

export default function EconomicModeling() {
  const [selectedScenario, setSelectedScenario] = useState<EconomicScenario | null>(null);
  const [customScenario, setCustomScenario] = useState<Partial<EconomicScenario>>({
    name: '',
    description: '',
    type: 'trade_war',
    parameters: {
      affected_countries: [],
      duration_months: 12,
      intensity: 'medium',
      sectors: []
    }
  });
  const [economicImpact, setEconomicImpact] = useState<EconomicImpact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'predefined' | 'custom'>('predefined');
  
  const { showToast } = useToast();

  const runEconomicAnalysis = async (scenario: EconomicScenario) => {
    setLoading(true);
    setError(null);
    
    try {
      const impact = await geminiService.generateEconomicImpactAnalysis(scenario);
      setEconomicImpact(impact);
      showToast('success', 'Economic Analysis Complete', 'Comprehensive impact assessment generated');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      showToast('error', 'Analysis Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (value: number) => {
    if (value > 0) return 'text-success-400';
    if (value < -2) return 'text-error-400';
    if (value < 0) return 'text-warning-400';
    return 'text-neutral-400';
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
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
                Advanced Economic Modeling
              </h1>
              <p className="text-neutral-400">
                Comprehensive economic impact analysis with AI-powered predictions
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Analysis
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Scenario Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-100">
                  Economic Scenarios
                </h2>
                <div className="flex space-x-1 bg-neutral-800/50 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('predefined')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      activeTab === 'predefined'
                        ? 'bg-primary-600 text-white'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    Predefined
                  </button>
                  <button
                    onClick={() => setActiveTab('custom')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      activeTab === 'custom'
                        ? 'bg-primary-600 text-white'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {activeTab === 'predefined' ? (
                <div className="space-y-3">
                  {predefinedScenarios.map((scenario) => (
                    <motion.div
                      key={scenario.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedScenario?.id === scenario.id
                          ? 'border-primary-600/50 bg-primary-900/20'
                          : 'border-neutral-700/50 bg-neutral-800/20 hover:border-neutral-600/50'
                      }`}
                      onClick={() => setSelectedScenario(scenario)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-neutral-100">{scenario.name}</h3>
                        <Badge variant={getIntensityColor(scenario.parameters.intensity) as any} size="sm">
                          {scenario.parameters.intensity}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-400 mb-3">{scenario.description}</p>
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>{scenario.parameters.duration_months} months</span>
                        <span>{scenario.parameters.affected_countries.length} countries</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Scenario Name
                    </label>
                    <input
                      type="text"
                      value={customScenario.name}
                      onChange={(e) => setCustomScenario(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200"
                      placeholder="Enter scenario name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={customScenario.description}
                      onChange={(e) => setCustomScenario(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200"
                      rows={3}
                      placeholder="Describe the economic scenario"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Type
                    </label>
                    <select
                      value={customScenario.type}
                      onChange={(e) => setCustomScenario(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200"
                    >
                      <option value="trade_war">Trade War</option>
                      <option value="sanctions">Sanctions</option>
                      <option value="currency_crisis">Currency Crisis</option>
                      <option value="supply_shock">Supply Shock</option>
                      <option value="policy_change">Policy Change</option>
                    </select>
                  </div>
                  <Button
                    onClick={() => customScenario.name && setSelectedScenario(customScenario as EconomicScenario)}
                    disabled={!customScenario.name || !customScenario.description}
                    className="w-full"
                  >
                    Use Custom Scenario
                  </Button>
                </div>
              )}
            </Card>

            {selectedScenario && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-neutral-100 mb-4">
                  Run Analysis
                </h3>
                <div className="space-y-3">
                  <div className="text-sm text-neutral-400">
                    Selected: <span className="text-neutral-200">{selectedScenario.name}</span>
                  </div>
                  <Button
                    onClick={() => runEconomicAnalysis(selectedScenario)}
                    loading={loading}
                    className="w-full"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    {loading ? 'Analyzing...' : 'Run Economic Analysis'}
                  </Button>
                </div>
              </Card>
            )}
          </motion.div>

          {/* Analysis Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {loading && (
              <Card className="p-8">
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <h3 className="text-xl font-semibold text-neutral-100 mt-4 mb-2">
                    Running Economic Analysis
                  </h3>
                  <p className="text-neutral-400 mb-4">
                    Analyzing economic impacts across multiple dimensions...
                  </p>
                  <div className="space-y-2 text-sm text-neutral-500">
                    <div>• Calculating GDP impact with confidence intervals</div>
                    <div>• Analyzing trade flow changes</div>
                    <div>• Modeling employment effects by sector</div>
                    <div>• Computing welfare and fiscal implications</div>
                  </div>
                </div>
              </Card>
            )}

            {error && (
              <Card className="p-6 border-error-600/50 bg-error-900/20">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-error-400" />
                  <span className="text-error-300">{error}</span>
                </div>
              </Card>
            )}

            {economicImpact && !loading && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {/* GDP Impact */}
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold text-neutral-100 mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-primary-400" />
                      GDP Impact Analysis
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-neutral-800/20 rounded-lg">
                        <div className={`text-2xl font-bold mb-1 ${getImpactColor(economicImpact.gdpImpact.primary.value)}`}>
                          {economicImpact.gdpImpact.primary.value > 0 ? '+' : ''}{economicImpact.gdpImpact.primary.value}%
                        </div>
                        <div className="text-sm text-neutral-400">Primary Impact</div>
                        <div className="text-xs text-neutral-500 mt-1">
                          CI: [{economicImpact.gdpImpact.primary.confidence[0]}, {economicImpact.gdpImpact.primary.confidence[1]}]
                        </div>
                      </div>
                      <div className="text-center p-4 bg-neutral-800/20 rounded-lg">
                        <div className={`text-2xl font-bold mb-1 ${getImpactColor(economicImpact.gdpImpact.secondary.value)}`}>
                          {economicImpact.gdpImpact.secondary.value > 0 ? '+' : ''}{economicImpact.gdpImpact.secondary.value}%
                        </div>
                        <div className="text-sm text-neutral-400">Secondary Impact</div>
                        <div className="text-xs text-neutral-500 mt-1">
                          CI: [{economicImpact.gdpImpact.secondary.confidence[0]}, {economicImpact.gdpImpact.secondary.confidence[1]}]
                        </div>
                      </div>
                      <div className="text-center p-4 bg-neutral-800/20 rounded-lg">
                        <div className={`text-2xl font-bold mb-1 ${getImpactColor(economicImpact.gdpImpact.total.value)}`}>
                          {economicImpact.gdpImpact.total.value > 0 ? '+' : ''}{economicImpact.gdpImpact.total.value}%
                        </div>
                        <div className="text-sm text-neutral-400">Total Impact</div>
                        <div className="text-xs text-neutral-500 mt-1">
                          CI: [{economicImpact.gdpImpact.total.confidence[0]}, {economicImpact.gdpImpact.total.confidence[1]}]
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Trade Flows */}
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold text-neutral-100 mb-4 flex items-center">
                      <Globe className="h-5 w-5 mr-2 text-secondary-400" />
                      Trade Flow Analysis
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-neutral-200 mb-3">Bilateral Trade</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Volume Change</span>
                            <span className={`font-medium ${getImpactColor(economicImpact.tradeFlows.bilateral.change)}`}>
                              {economicImpact.tradeFlows.bilateral.change > 0 ? '+' : ''}{economicImpact.tradeFlows.bilateral.change}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Total Volume</span>
                            <span className="text-neutral-200">${economicImpact.tradeFlows.bilateral.volume}B</span>
                          </div>
                          <div className="mt-3">
                            <div className="text-sm text-neutral-400 mb-2">Affected Sectors</div>
                            <div className="flex flex-wrap gap-1">
                              {economicImpact.tradeFlows.bilateral.sectors.map((sector, index) => (
                                <Badge key={index} variant="info" size="sm">{sector}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-200 mb-3">Multilateral Trade</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Volume Change</span>
                            <span className={`font-medium ${getImpactColor(economicImpact.tradeFlows.multilateral.change)}`}>
                              {economicImpact.tradeFlows.multilateral.change > 0 ? '+' : ''}{economicImpact.tradeFlows.multilateral.change}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Total Volume</span>
                            <span className="text-neutral-200">${economicImpact.tradeFlows.multilateral.volume}B</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Affected Countries</span>
                            <span className="text-neutral-200">{economicImpact.tradeFlows.multilateral.affected_countries}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Employment Effects */}
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold text-neutral-100 mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-accent-400" />
                      Employment Impact
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(economicImpact.employmentEffects).map(([sector, data]) => (
                        <div key={sector} className="text-center p-4 bg-neutral-800/20 rounded-lg">
                          <div className={`text-lg font-bold mb-1 ${getImpactColor(data.jobs)}`}>
                            {data.jobs > 0 ? '+' : ''}{data.jobs.toLocaleString()}
                          </div>
                          <div className="text-sm text-neutral-400 capitalize">{sector.replace('_', ' ')}</div>
                          <div className={`text-xs mt-1 ${getImpactColor(data.percentage)}`}>
                            {data.percentage > 0 ? '+' : ''}{data.percentage}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Timeline Analysis */}
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold text-neutral-100 mb-4 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-warning-400" />
                      Timeline Analysis
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(economicImpact.timeline).map(([period, description]) => (
                        <div key={period} className="p-4 bg-neutral-800/20 rounded-lg">
                          <div className="font-medium text-neutral-200 mb-2 capitalize">
                            {period.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-neutral-400">{description}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              </AnimatePresence>
            )}

            {!economicImpact && !loading && !error && (
              <Card className="p-12 text-center">
                <DollarSign className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-neutral-100 mb-2">
                  Economic Impact Modeling
                </h3>
                <p className="text-neutral-400 mb-6">
                  Select a scenario and run analysis to see comprehensive economic impact predictions
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-neutral-500">
                  <div className="flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    GDP Analysis
                  </div>
                  <div className="flex items-center justify-center">
                    <Globe className="h-4 w-4 mr-2" />
                    Trade Flows
                  </div>
                  <div className="flex items-center justify-center">
                    <Users className="h-4 w-4 mr-2" />
                    Employment
                  </div>
                  <div className="flex items-center justify-center">
                    <Building className="h-4 w-4 mr-2" />
                    Fiscal Impact
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}