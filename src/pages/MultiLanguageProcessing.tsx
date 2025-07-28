import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Languages, 
  Brain, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  MessageCircle,
  Volume2,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useMultiLanguageProcessing } from '../hooks/useMultiLanguageProcessing';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface Language {
  code: string;
  name: string;
  native: string;
  flag: string;
  confidence: number;
}

interface Translation {
  id: string;
  original: string;
  translated: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  credibility: number;
  timestamp: string;
}

interface SourceAnalysis {
  id: string;
  source: string;
  language: string;
  credibility: number;
  bias: string;
  reliability: number;
  timestamp: string;
}

export default function MultiLanguageProcessing() {
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [targetLanguage, setTargetLanguage] = useState<string>('en');
  const [activeTab, setActiveTab] = useState<'translation' | 'analysis' | 'credibility'>('translation');
  const [inputText, setInputText] = useState<string>('');

  const {
    loading,
    error,
    translations,
    sourceAnalysis,
    languages,
    processTranslation,
    analyzeSources,
    assessCredibility,
    exportData
  } = useMultiLanguageProcessing();

  const supportedLanguages: Language[] = [
    { code: 'en', name: 'English', native: 'English', flag: '🇺🇸', confidence: 0.95 },
    { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸', confidence: 0.92 },
    { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', confidence: 0.94 },
    { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪', confidence: 0.93 },
    { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳', confidence: 0.91 },
    { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', confidence: 0.89 },
    { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺', confidence: 0.90 },
    { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵', confidence: 0.88 },
    { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷', confidence: 0.87 },
    { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹', confidence: 0.91 }
  ];

  const handleTranslation = async () => {
    if (!inputText.trim()) return;
    await processTranslation(inputText, targetLanguage);
  };

  const handleSourceAnalysis = async () => {
    await analyzeSources(selectedSource);
  };

  const handleCredibilityAssessment = async () => {
    await assessCredibility(selectedSource);
  };

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    await exportData(format, selectedSource);
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
                Multi-Language Intelligence
              </h1>
              <p className="text-neutral-400">
                Advanced translation and source credibility analysis across 10+ languages
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Badge variant="info">AI Translation</Badge>
              <Badge variant="success">Credibility Analysis</Badge>
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
              { id: 'translation', label: 'Translation', icon: Languages },
              { id: 'analysis', label: 'Source Analysis', icon: Brain },
              { id: 'credibility', label: 'Credibility Assessment', icon: Shield }
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
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {activeTab === 'translation' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-neutral-100 flex items-center">
                    <Languages className="h-5 w-5 mr-2 text-primary-400" />
                    AI-Powered Translation
                  </h2>
                  <Button onClick={handleTranslation} loading={loading}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Translate
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Source Text
                    </label>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Enter text to translate..."
                      className="w-full h-32 bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-neutral-100 focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Target Language
                    </label>
                    <select
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-neutral-100 focus:ring-2 focus:ring-primary-500"
                    >
                      {supportedLanguages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name} ({lang.native})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {translations.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="font-medium text-neutral-200">Translation Results</h3>
                    {translations.map((translation: Translation) => (
                      <div key={translation.id} className="p-4 bg-neutral-800/20 rounded-lg border border-neutral-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-neutral-300">
                            {translation.sourceLanguage} → {translation.targetLanguage}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Badge variant={translation.confidence >= 0.9 ? 'success' : 'warning'} size="sm">
                              {(translation.confidence * 100).toFixed(0)}% Confidence
                            </Badge>
                            <Badge variant={translation.credibility >= 0.8 ? 'success' : 'warning'} size="sm">
                              Credibility: {(translation.credibility * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                        <div className="text-neutral-100 mb-2">{translation.translated}</div>
                        <div className="text-sm text-neutral-500">
                          Translated: {new Date(translation.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-neutral-100 flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-primary-400" />
                    Source Intelligence Analysis
                  </h2>
                  <Button onClick={handleSourceAnalysis} loading={loading}>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze Sources
                  </Button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Source Filter
                  </label>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-neutral-100 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Sources</option>
                    <option value="news">News Outlets</option>
                    <option value="social">Social Media</option>
                    <option value="government">Government</option>
                    <option value="academic">Academic</option>
                    <option value="think-tank">Think Tanks</option>
                  </select>
                </div>

                {sourceAnalysis.length > 0 && (
                  <div className="space-y-4">
                    {sourceAnalysis.map((analysis: SourceAnalysis) => (
                      <div key={analysis.id} className="p-4 bg-neutral-800/20 rounded-lg border border-neutral-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-neutral-100">{analysis.source}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant={analysis.credibility >= 0.8 ? 'success' : analysis.credibility >= 0.6 ? 'warning' : 'error'}>
                              {(analysis.credibility * 100).toFixed(0)}% Credibility
                            </Badge>
                            <Badge variant={analysis.bias === 'neutral' ? 'success' : 'warning'}>
                              {analysis.bias}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-neutral-400 mb-1">Language</div>
                            <div className="text-neutral-100">{analysis.language}</div>
                          </div>
                          <div>
                            <div className="text-neutral-400 mb-1">Reliability</div>
                            <div className="text-neutral-100">{analysis.reliability}/10</div>
                          </div>
                          <div>
                            <div className="text-neutral-400 mb-1">Last Updated</div>
                            <div className="text-neutral-100">{new Date(analysis.timestamp).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'credibility' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-neutral-100 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-primary-400" />
                    Credibility Assessment Engine
                  </h2>
                  <Button onClick={handleCredibilityAssessment} loading={loading}>
                    <Shield className="h-4 w-4 mr-2" />
                    Assess Credibility
                  </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-700/50">
                    <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-300 mb-1">{languages.filter(l => l.confidence >= 0.9).length}</div>
                    <div className="text-neutral-400">High Confidence</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-900/20 rounded-lg border border-yellow-700/50">
                    <AlertTriangle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-300 mb-1">{translations.filter(t => t.credibility < 0.8).length}</div>
                    <div className="text-neutral-400">Low Credibility</div>
                  </div>
                  <div className="text-center p-4 bg-blue-900/20 rounded-lg border border-blue-700/50">
                    <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-300 mb-1">{(translations.reduce((sum, t) => sum + t.credibility, 0) / translations.length * 100).toFixed(1)}%</div>
                    <div className="text-neutral-400">Avg Credibility</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-neutral-800/20 rounded-lg border border-neutral-700/50">
                    <h3 className="font-medium text-neutral-200 mb-3">Credibility Factors</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Source Authority</span>
                        <Badge variant="success">High</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Cross-Verification</span>
                        <Badge variant="success">Verified</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Language Consistency</span>
                        <Badge variant="warning">Medium</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Bias Detection</span>
                        <Badge variant="success">Neutral</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-800/20 rounded-lg border border-neutral-700/50">
                    <h3 className="font-medium text-neutral-200 mb-3">Quality Metrics</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-neutral-400 mb-1">Translation Accuracy</div>
                        <div className="text-neutral-100 font-medium">94.2%</div>
                      </div>
                      <div>
                        <div className="text-neutral-400 mb-1">Source Reliability</div>
                        <div className="text-neutral-100 font-medium">87.6%</div>
                      </div>
                      <div>
                        <div className="text-neutral-400 mb-1">Cultural Context</div>
                        <div className="text-neutral-100 font-medium">91.3%</div>
                      </div>
                      <div>
                        <div className="text-neutral-400 mb-1">Bias Correction</div>
                        <div className="text-neutral-100 font-medium">96.8%</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={() => handleExport('pdf')} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Credibility Report
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
