import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, MessageSquare, FileText, Baseline as Timeline, BarChart3, TrendingUp, Search, Download, Zap, Target, Globe, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAdvancedAnalytics } from '../hooks/useAdvancedAnalytics';

export default function AdvancedAnalytics() {
  const [activeTab, setActiveTab] = useState<'nlquery' | 'reports' | 'timeline' | 'ensemble'>('nlquery');
  const [nlQuery, setNlQuery] = useState('');
  
  const {
    loading,
    error,
    queryHistory,
    reports,
    timelinePrediction,
    currentResponse,
    processNaturalLanguageQuery,
    generateAutomatedReport,
    generatePredictiveTimeline,
    generateEnsemblePrediction,
    loadQueryHistory,
    loadReports
  } = useAdvancedAnalytics();

  useEffect(() => {
    // Load saved data on component mount
    loadQueryHistory();
    loadReports();
  }, []);

  const handleNLQuery = async () => {
    if (!nlQuery.trim()) return;
    await processNaturalLanguageQuery(nlQuery);
    setNlQuery('');
  };

  const handleGenerateReport = async (type: string) => {
    const mockData = {
      regions: ['Eastern Europe', 'South China Sea'],
      timeframe: 'Q1 2024',
      factors: ['Military Tensions', 'Economic Sanctions']
    };
    
    await generateAutomatedReport(type, mockData, 'Q1 2024');
  };

  const handleGenerateTimeline = async () => {
    const scenario = {
      type: 'geopolitical_crisis',
      region: 'Eastern Europe',
      factors: ['Military Buildup', 'Diplomatic Tensions']
    };
    
    await generatePredictiveTimeline(scenario, '12 months');
  };

  const handleEnsembleAnalysis = async () => {
    const models = ['Game Theory Model', 'Statistical Model', 'Machine Learning Model', 'Expert System'];
    const data = {
      region: 'Global',
      indicators: ['Political Stability', 'Economic Growth', 'Military Activity']
    };
    
    await generateEnsemblePrediction(models, data);
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
                Advanced AI Analytics
              </h1>
              <p className="text-neutral-400">
                Natural language querying, automated reports, and predictive timeline analysis
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Badge variant="info">AI-Powered</Badge>
              <Badge variant="success">Real-time</Badge>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-neutral-800/50 rounded-lg p-1">
            {[
              { id: 'nlquery', label: 'Natural Language Query', icon: MessageSquare },
              { id: 'reports', label: 'Automated Reports', icon: FileText },
              { id: 'timeline', label: 'Predictive Timeline', icon: Timeline },
              { id: 'ensemble', label: 'Ensemble Models', icon: Brain }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <Card className="p-4 border-error-600/50 bg-error-900/20">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-error-400" />
                <span className="text-error-300">{error}</span>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {activeTab === 'nlquery' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Query Input */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-neutral-100 mb-4 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-primary-400" />
                    Ask Anything
                  </h2>
                  <div className="space-y-4">
                    <textarea
                      value={nlQuery}
                      onChange={(e) => setNlQuery(e.target.value)}
                      placeholder="Ask about geopolitical risks, economic impacts, or strategic scenarios..."
                      className="w-full h-32 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200 resize-none"
                    />
                    <Button
                      onClick={handleNLQuery}
                      disabled={!nlQuery.trim() || loading}
                      loading={loading}
                      className="w-full"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Analyze Query
                    </Button>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium text-neutral-200 mb-3">Example Queries</h3>
                    <div className="space-y-2">
                      {[
                        "What are the economic risks of a trade war between US and China?",
                        "Analyze the military situation in Eastern Europe",
                        "What would happen if oil prices doubled?",
                        "Compare nuclear deterrence strategies"
                      ].map((example, index) => (
                        <button
                          key={index}
                          onClick={() => setNlQuery(example)}
                          className="text-left w-full p-2 text-sm text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 rounded transition-colors"
                        >
                          "{example}"
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Query History */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-neutral-100 mb-4">Recent Queries</h3>
                  <div className="space-y-3">
                    {queryHistory.map((query) => (
                      <div
                        key={query.id}
                        className="p-3 bg-neutral-800/20 rounded-lg cursor-pointer hover:bg-neutral-800/40 transition-colors"
                        onClick={() => setCurrentResponse(query.response)}
                      >
                        <div className="text-sm text-neutral-300 mb-1">"{query.query}"</div>
                        <div className="text-xs text-neutral-500">
                          {new Date(query.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Query Results */}
              <div className="lg:col-span-2">
                {loading ? (
                  <Card className="p-8">
                    <div className="text-center">
                      <LoadingSpinner size="lg" />
                      <h3 className="text-xl font-semibold text-neutral-100 mt-4 mb-2">
                        Processing Query
                      </h3>
                      <p className="text-neutral-400">
                        AI is analyzing your question and generating insights...
                      </p>
                    </div>
                  </Card>
                ) : currentResponse ? (
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold text-neutral-100 mb-4">Analysis Results</h3>
                    <div className="space-y-4">
                      {currentResponse.type === 'ensemble_prediction' ? (
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-primary-900/20 rounded-lg border border-primary-700/50">
                              <div className="text-2xl font-bold text-primary-300 mb-1">
                                {(currentResponse.data.ensemble_prediction.value * 100).toFixed(1)}%
                              </div>
                              <div className="text-sm text-neutral-400">Ensemble Prediction</div>
                              <div className="text-xs text-neutral-500 mt-1">
                                CI: [{(currentResponse.data.ensemble_prediction.confidence[0] * 100).toFixed(1)}%, {(currentResponse.data.ensemble_prediction.confidence[1] * 100).toFixed(1)}%]
                              </div>
                            </div>
                            <div className="text-center p-4 bg-secondary-900/20 rounded-lg border border-secondary-700/50">
                              <div className="text-2xl font-bold text-secondary-300 mb-1">
                                {(currentResponse.data.consensus_level * 100).toFixed(1)}%
                              </div>
                              <div className="text-sm text-neutral-400">Model Consensus</div>
                              <div className="text-xs text-neutral-500 mt-1">
                                Uncertainty: ±{(currentResponse.data.uncertainty * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-neutral-200 mb-3">Model Contributions</h4>
                            <div className="space-y-2">
                              {Object.entries(currentResponse.data.model_weights).map(([model, weight]: [string, any]) => (
                                <div key={model} className="flex items-center justify-between">
                                  <span className="text-neutral-300">{model}</span>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-24 bg-neutral-700 rounded-full h-2">
                                      <div
                                        className="bg-primary-500 h-2 rounded-full"
                                        style={{ width: `${weight * 100}%` }}
                                      />
                                    </div>
                                    <span className="text-neutral-400 text-sm w-12 text-right">
                                      {(weight * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="prose prose-invert max-w-none">
                          <div className="bg-neutral-800/20 rounded-lg p-4">
                            <div className="text-neutral-300">
                              {currentResponse.response || JSON.stringify(currentResponse, null, 2)}
                            </div>
                          </div>
                          {currentResponse.suggestions && (
                            <div className="mt-4">
                              <h4 className="font-medium text-neutral-200 mb-2">Follow-up Suggestions</h4>
                              <div className="space-y-1">
                                {currentResponse.suggestions.map((suggestion: string, index: number) => (
                                  <button
                                    key={index}
                                    onClick={() => setNlQuery(suggestion)}
                                    className="block text-left text-sm text-primary-400 hover:text-primary-300 transition-colors"
                                  >
                                    • {suggestion}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                ) : (
                  <Card className="p-12 text-center">
                    <MessageSquare className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-neutral-100 mb-2">
                      Natural Language Analysis
                    </h3>
                    <p className="text-neutral-400">
                      Ask questions in plain English and get AI-powered geopolitical insights
                    </p>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-neutral-100 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-secondary-400" />
                    Generate Reports
                  </h2>
                  <div className="space-y-3">
                    {[
                      { type: 'risk_assessment', label: 'Risk Assessment Report', icon: TrendingUp },
                      { type: 'economic_analysis', label: 'Economic Analysis Report', icon: BarChart3 },
                      { type: 'crisis_report', label: 'Crisis Situation Report', icon: AlertCircle },
                      { type: 'strategic_overview', label: 'Strategic Overview', icon: Target }
                    ].map((reportType) => {
                      const Icon = reportType.icon;
                      return (
                        <Button
                          key={reportType.type}
                          variant="outline"
                          onClick={() => handleGenerateReport(reportType.type)}
                          disabled={loading}
                          className="w-full justify-start"
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {reportType.label}
                        </Button>
                      );
                    })}
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-2">
                {loading ? (
                  <Card className="p-8">
                    <div className="text-center">
                      <LoadingSpinner size="lg" />
                      <h3 className="text-xl font-semibold text-neutral-100 mt-4 mb-2">
                        Generating Report
                      </h3>
                      <p className="text-neutral-400">
                        Creating comprehensive analysis report...
                      </p>
                    </div>
                  </Card>
                ) : reports.length > 0 ? (
                  <div className="space-y-6">
                    {reports.map((report) => (
                      <Card key={report.id} className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-neutral-100">{report.title}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant="info" size="sm">{report.type.replace('_', ' ')}</Badge>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {report.sections.map((section, index) => (
                            <div key={index}>
                              <h4 className="font-medium text-neutral-200 mb-2">{section.title}</h4>
                              <p className="text-neutral-400 text-sm">{section.content}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-neutral-700">
                          <div className="text-xs text-neutral-500">
                            Generated: {new Date(report.generated_at).toLocaleString()}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <FileText className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-neutral-100 mb-2">
                      Automated Reports
                    </h3>
                    <p className="text-neutral-400">
                      Generate comprehensive analysis reports with AI-powered insights
                    </p>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-neutral-100 flex items-center">
                    <Timeline className="h-5 w-5 mr-2 text-accent-400" />
                    Predictive Timeline Analysis
                  </h2>
                  <Button onClick={handleGenerateTimeline} loading={loading}>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Timeline
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <LoadingSpinner size="lg" />
                    <p className="text-neutral-400 mt-4">Generating predictive timeline...</p>
                  </div>
                ) : timelinePrediction ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium text-neutral-200">Timeline Predictions</h3>
                      {timelinePrediction.timeline.map((item, index) => (
                        <div key={index} className="flex items-start space-x-4 p-4 bg-neutral-800/20 rounded-lg">
                          <div className="flex-shrink-0 w-24 text-sm text-neutral-400">{item.date}</div>
                          <div className="flex-1">
                            <div className="font-medium text-neutral-200 mb-1">{item.event}</div>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-neutral-400">
                                Probability: <span className="text-primary-400">{(item.probability * 100).toFixed(1)}%</span>
                              </span>
                              <span className="text-neutral-400">
                                Confidence: <span className="text-secondary-400">{(item.confidence * 100).toFixed(1)}%</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-neutral-200 mb-3">Critical Decision Points</h4>
                        <div className="space-y-2">
                          {timelinePrediction.critical_points.map((point, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Target className="h-4 w-4 text-warning-400" />
                              <span className="text-neutral-300 text-sm">{point}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-200 mb-3">Risk Factors</h4>
                        <div className="space-y-2">
                          {timelinePrediction.risk_factors.map((factor, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <AlertCircle className="h-4 w-4 text-error-400" />
                              <span className="text-neutral-300 text-sm">{factor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Timeline className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-neutral-100 mb-2">
                      Predictive Timeline
                    </h3>
                    <p className="text-neutral-400">
                      Generate AI-powered timeline predictions for geopolitical scenarios
                    </p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'ensemble' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-neutral-100 flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-primary-400" />
                    Ensemble Model Analysis
                  </h2>
                  <Button onClick={handleEnsembleAnalysis} loading={loading}>
                    <Brain className="h-4 w-4 mr-2" />
                    Run Ensemble Analysis
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <LoadingSpinner size="lg" />
                    <p className="text-neutral-400 mt-4">Running ensemble model analysis...</p>
                  </div>
                ) : currentResponse?.type === 'ensemble_prediction' ? (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="text-center p-6 bg-primary-900/20 rounded-lg border border-primary-700/50">
                        <div className="text-3xl font-bold text-primary-300 mb-2">
                          {(currentResponse.data.ensemble_prediction.value * 100).toFixed(1)}%
                        </div>
                        <div className="text-neutral-400 mb-2">Ensemble Prediction</div>
                        <div className="text-sm text-neutral-500">
                          Confidence Interval: [{(currentResponse.data.ensemble_prediction.confidence[0] * 100).toFixed(1)}%, {(currentResponse.data.ensemble_prediction.confidence[1] * 100).toFixed(1)}%]
                        </div>
                      </div>
                      <div className="text-center p-6 bg-secondary-900/20 rounded-lg border border-secondary-700/50">
                        <div className="text-3xl font-bold text-secondary-300 mb-2">
                          {(currentResponse.data.consensus_level * 100).toFixed(1)}%
                        </div>
                        <div className="text-neutral-400 mb-2">Model Consensus</div>
                        <div className="text-sm text-neutral-500">
                          Uncertainty: ±{(currentResponse.data.uncertainty * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-neutral-200 mb-4">Model Contributions</h3>
                      <div className="space-y-3">
                        {Object.entries(currentResponse.data.model_weights).map(([model, weight]: [string, any]) => (
                          <div key={model} className="flex items-center justify-between p-3 bg-neutral-800/20 rounded-lg">
                            <span className="text-neutral-300">{model}</span>
                            <div className="flex items-center space-x-3">
                              <div className="w-32 bg-neutral-700 rounded-full h-2">
                                <div
                                  className="bg-primary-500 h-2 rounded-full"
                                  style={{ width: `${weight * 100}%` }}
                                />
                              </div>
                              <span className="text-neutral-400 text-sm w-12 text-right">
                                {(weight * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Brain className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-neutral-100 mb-2">
                      Ensemble Modeling
                    </h3>
                    <p className="text-neutral-400">
                      Combine multiple AI models for more accurate predictions
                    </p>
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