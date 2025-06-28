import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Upload, 
  Database, 
  Play, 
  Pause, 
  BarChart3, 
  CheckCircle,
  AlertCircle,
  FileText,
  Settings,
  Save,
  RefreshCw,
  Download,
  Layers
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../hooks/useToast';

interface ModelConfig {
  name: string;
  description: string;
  modelType: 'classification' | 'regression' | 'clustering' | 'reinforcement';
  parameters: Record<string, any>;
  datasetId: string;
  status: 'draft' | 'training' | 'trained' | 'failed';
  metrics?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

interface Dataset {
  id: string;
  name: string;
  description: string;
  recordCount: number;
  features: string[];
  createdAt: string;
}

export default function CustomModelTraining() {
  const [activeTab, setActiveTab] = useState<'datasets' | 'models' | 'training' | 'evaluation'>('datasets');
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  
  const { showToast } = useToast();

  // Mock datasets
  const datasets: Dataset[] = [
    {
      id: '1',
      name: 'Historical Conflict Data',
      description: 'Comprehensive dataset of global conflicts from 1945-2023 with 50+ features',
      recordCount: 12450,
      features: ['region', 'intensity', 'duration', 'casualties', 'economic_impact'],
      createdAt: '2023-10-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Economic Indicators',
      description: 'Global economic metrics including GDP, inflation, trade volumes, and more',
      recordCount: 8750,
      features: ['country', 'year', 'gdp_growth', 'inflation', 'unemployment'],
      createdAt: '2023-11-05T14:20:00Z'
    },
    {
      id: '3',
      name: 'Diplomatic Relations',
      description: 'Bilateral relationship scores and diplomatic event data',
      recordCount: 5280,
      features: ['country_a', 'country_b', 'relation_score', 'treaties', 'disputes'],
      createdAt: '2023-12-12T09:15:00Z'
    }
  ];

  // Mock models
  const models: ModelConfig[] = [
    {
      name: 'Conflict Prediction Model',
      description: 'Predicts likelihood of armed conflict based on historical patterns',
      modelType: 'classification',
      parameters: {
        algorithm: 'random_forest',
        features: 15,
        depth: 8
      },
      datasetId: '1',
      status: 'trained',
      metrics: {
        accuracy: 0.87,
        precision: 0.83,
        recall: 0.79,
        f1_score: 0.81
      },
      createdAt: '2024-01-10T11:20:00Z',
      updatedAt: '2024-01-12T15:45:00Z'
    },
    {
      name: 'Economic Impact Estimator',
      description: 'Estimates GDP impact of geopolitical events',
      modelType: 'regression',
      parameters: {
        algorithm: 'gradient_boosting',
        learning_rate: 0.01,
        n_estimators: 200
      },
      datasetId: '2',
      status: 'draft',
      createdAt: '2024-02-05T09:30:00Z',
      updatedAt: '2024-02-05T09:30:00Z'
    }
  ];

  const handleDatasetSelect = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setActiveTab('models');
  };

  const handleModelSelect = (model: ModelConfig) => {
    setSelectedModel(model);
    setActiveTab('training');
  };

  const handleStartTraining = () => {
    if (!selectedModel) return;
    
    setIsTraining(true);
    setTrainingProgress(0);
    
    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          
          // Update model status
          setSelectedModel(prev => {
            if (!prev) return null;
            return {
              ...prev,
              status: 'trained',
              metrics: {
                accuracy: 0.85,
                precision: 0.82,
                recall: 0.78,
                f1_score: 0.80
              },
              updatedAt: new Date().toISOString()
            };
          });
          
          showToast('success', 'Training Complete', 'Model has been successfully trained');
          setActiveTab('evaluation');
          return 100;
        }
        return prev + 5;
      });
    }, 500);
    
    showToast('info', 'Training Started', 'Model training is in progress');
  };

  const handleStopTraining = () => {
    setIsTraining(false);
    showToast('warning', 'Training Stopped', 'Model training has been interrupted');
  };

  const handleSaveModel = () => {
    showToast('success', 'Model Saved', 'Model configuration has been saved');
  };

  const handleDeployModel = () => {
    showToast('success', 'Model Deployed', 'Model is now available for predictions');
  };

  const getModelTypeColor = (type: string) => {
    switch (type) {
      case 'classification': return 'primary';
      case 'regression': return 'secondary';
      case 'clustering': return 'accent';
      case 'reinforcement': return 'warning';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trained': return 'success';
      case 'training': return 'warning';
      case 'draft': return 'info';
      case 'failed': return 'error';
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
                Custom Model Training
              </h1>
              <p className="text-neutral-400">
                Train specialized AI models on your organization's unique data
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Badge variant="warning">Enterprise Feature</Badge>
              <Badge variant="info">Beta</Badge>
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
              { id: 'datasets', label: 'Datasets', icon: Database },
              { id: 'models', label: 'Model Configuration', icon: Settings },
              { id: 'training', label: 'Training', icon: Play },
              { id: 'evaluation', label: 'Evaluation', icon: BarChart3 }
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

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {activeTab === 'datasets' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-neutral-100 flex items-center">
                    <Database className="h-5 w-5 mr-2 text-primary-400" />
                    Available Datasets
                  </h2>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Dataset
                  </Button>
                </div>

                <div className="space-y-4">
                  {datasets.map((dataset) => (
                    <div
                      key={dataset.id}
                      className="p-4 bg-neutral-800/20 rounded-lg border border-neutral-700/50 hover:border-neutral-600/50 transition-colors cursor-pointer"
                      onClick={() => handleDatasetSelect(dataset)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-neutral-200">{dataset.name}</h3>
                        <Badge variant="info" size="sm">{dataset.recordCount.toLocaleString()} records</Badge>
                      </div>
                      <p className="text-sm text-neutral-400 mb-3">{dataset.description}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {dataset.features.map((feature, index) => (
                          <Badge key={index} variant="default" size="sm">{feature}</Badge>
                        ))}
                      </div>
                      <div className="text-xs text-neutral-500">
                        Created: {new Date(dataset.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'models' && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-neutral-100 mb-4 flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-secondary-400" />
                    Model Templates
                  </h2>
                  <div className="space-y-3">
                    {models.map((model) => (
                      <div
                        key={model.name}
                        className="p-4 bg-neutral-800/20 rounded-lg border border-neutral-700/50 hover:border-neutral-600/50 transition-colors cursor-pointer"
                        onClick={() => handleModelSelect(model)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-neutral-200">{model.name}</h3>
                          <Badge variant={getStatusColor(model.status) as any} size="sm">
                            {model.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-400 mb-3">{model.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <Badge variant={getModelTypeColor(model.modelType) as any} size="sm">
                            {model.modelType}
                          </Badge>
                          <span className="text-neutral-500">
                            Updated: {new Date(model.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Model
                    </Button>
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-2">
                {selectedDataset ? (
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold text-neutral-100 mb-4">
                      Configure Model
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Model Name
                        </label>
                        <input
                          type="text"
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200"
                          placeholder="Enter model name"
                          defaultValue="Custom Prediction Model"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Description
                        </label>
                        <textarea
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200"
                          rows={3}
                          placeholder="Describe your model"
                          defaultValue={`Custom model based on ${selectedDataset.name} dataset`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Model Type
                        </label>
                        <select
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200"
                          defaultValue="classification"
                        >
                          <option value="classification">Classification</option>
                          <option value="regression">Regression</option>
                          <option value="clustering">Clustering</option>
                          <option value="reinforcement">Reinforcement Learning</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Selected Dataset
                        </label>
                        <div className="p-3 bg-neutral-800/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-300">{selectedDataset.name}</span>
                            <Badge variant="info" size="sm">{selectedDataset.recordCount.toLocaleString()} records</Badge>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Advanced Parameters
                        </label>
                        <div className="p-3 bg-neutral-800/20 rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-400">Algorithm</span>
                            <select
                              className="bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-sm text-neutral-200"
                              defaultValue="random_forest"
                            >
                              <option value="random_forest">Random Forest</option>
                              <option value="gradient_boosting">Gradient Boosting</option>
                              <option value="neural_network">Neural Network</option>
                              <option value="svm">Support Vector Machine</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-400">Feature Selection</span>
                            <select
                              className="bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-sm text-neutral-200"
                              defaultValue="auto"
                            >
                              <option value="auto">Automatic</option>
                              <option value="manual">Manual</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-400">Cross-Validation</span>
                            <select
                              className="bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-sm text-neutral-200"
                              defaultValue="5"
                            >
                              <option value="3">3-fold</option>
                              <option value="5">5-fold</option>
                              <option value="10">10-fold</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-neutral-700 flex justify-end space-x-3">
                        <Button variant="outline" onClick={handleSaveModel}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Configuration
                        </Button>
                        <Button onClick={() => setActiveTab('training')}>
                          <Play className="h-4 w-4 mr-2" />
                          Proceed to Training
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-12 text-center">
                    <Database className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-neutral-100 mb-2">
                      Select a Dataset
                    </h3>
                    <p className="text-neutral-400">
                      Choose a dataset from the list to configure your model
                    </p>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === 'training' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-100 flex items-center">
                  <Play className="h-5 w-5 mr-2 text-accent-400" />
                  Model Training
                </h2>
                <div className="flex items-center space-x-2">
                  {isTraining ? (
                    <Button variant="outline" onClick={handleStopTraining}>
                      <Pause className="h-4 w-4 mr-2" />
                      Stop Training
                    </Button>
                  ) : (
                    <Button onClick={handleStartTraining} disabled={!selectedModel}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Training
                    </Button>
                  )}
                </div>
              </div>

              {selectedModel ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium text-neutral-200">Model Configuration</h3>
                      <div className="p-4 bg-neutral-800/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-neutral-400">Name</span>
                          <span className="text-neutral-200">{selectedModel.name}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-neutral-400">Type</span>
                          <Badge variant={getModelTypeColor(selectedModel.modelType) as any}>
                            {selectedModel.modelType}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-neutral-400">Dataset</span>
                          <span className="text-neutral-200">
                            {datasets.find(d => d.id === selectedModel.datasetId)?.name || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">Status</span>
                          <Badge variant={getStatusColor(selectedModel.status) as any}>
                            {selectedModel.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-medium text-neutral-200">Training Parameters</h3>
                      <div className="p-4 bg-neutral-800/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-neutral-400">Algorithm</span>
                          <span className="text-neutral-200">{selectedModel.parameters.algorithm}</span>
                        </div>
                        {Object.entries(selectedModel.parameters).filter(([key]) => key !== 'algorithm').map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between mb-2">
                            <span className="text-neutral-400">{key.replace('_', ' ')}</span>
                            <span className="text-neutral-200">{value}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">Epochs</span>
                          <span className="text-neutral-200">100</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isTraining && (
                    <div className="space-y-4">
                      <h3 className="font-medium text-neutral-200">Training Progress</h3>
                      <div className="p-4 bg-neutral-800/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-neutral-400">Progress</span>
                          <span className="text-neutral-200">{trainingProgress}%</span>
                        </div>
                        <div className="w-full bg-neutral-700 rounded-full h-2 mb-4">
                          <div
                            className="bg-primary-500 h-2 rounded-full"
                            style={{ width: `${trainingProgress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-neutral-400">Current Epoch</span>
                          <span className="text-neutral-200">{Math.floor(trainingProgress / 100 * 100)}/100</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-neutral-400">Loss</span>
                          <span className="text-neutral-200">0.{Math.max(1, 99 - Math.floor(trainingProgress))}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">Accuracy</span>
                          <span className="text-neutral-200">{Math.min(99, Math.floor(trainingProgress))}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isTraining && selectedModel.status === 'trained' && (
                    <div className="flex items-center justify-center p-6 bg-success-900/20 border border-success-700/50 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-success-400 mr-3" />
                      <div>
                        <h3 className="font-medium text-success-300">Training Complete</h3>
                        <p className="text-neutral-400 text-sm">
                          Model has been successfully trained and is ready for evaluation
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-neutral-100 mb-2">
                    No Model Selected
                  </h3>
                  <p className="text-neutral-400 mb-6">
                    Configure a model before starting the training process
                  </p>
                  <Button onClick={() => setActiveTab('models')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Model
                  </Button>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'evaluation' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-100 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-warning-400" />
                  Model Evaluation
                </h2>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Re-evaluate
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                </div>
              </div>

              {selectedModel && selectedModel.status === 'trained' ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    {selectedModel.metrics && Object.entries(selectedModel.metrics).map(([key, value]) => (
                      <div key={key} className="text-center p-4 bg-neutral-800/20 rounded-lg">
                        <div className="text-2xl font-bold text-primary-300 mb-1">
                          {value.toFixed(2)}
                        </div>
                        <div className="text-sm text-neutral-400 capitalize">
                          {key.replace('_', ' ')}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-neutral-200">Performance Analysis</h3>
                    <div className="p-4 bg-neutral-800/20 rounded-lg">
                      <div className="h-64 w-full bg-neutral-900 rounded-lg flex items-center justify-center">
                        <div className="text-neutral-500">Performance visualization would appear here</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium text-neutral-200">Feature Importance</h3>
                      <div className="p-4 bg-neutral-800/20 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-300">region</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-neutral-700 rounded-full h-2">
                              <div className="bg-primary-500 h-2 rounded-full" style={{ width: '85%' }} />
                            </div>
                            <span className="text-neutral-400 text-sm">0.85</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-300">intensity</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-neutral-700 rounded-full h-2">
                              <div className="bg-primary-500 h-2 rounded-full" style={{ width: '72%' }} />
                            </div>
                            <span className="text-neutral-400 text-sm">0.72</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-300">economic_impact</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-neutral-700 rounded-full h-2">
                              <div className="bg-primary-500 h-2 rounded-full" style={{ width: '68%' }} />
                            </div>
                            <span className="text-neutral-400 text-sm">0.68</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-300">duration</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-neutral-700 rounded-full h-2">
                              <div className="bg-primary-500 h-2 rounded-full" style={{ width: '54%' }} />
                            </div>
                            <span className="text-neutral-400 text-sm">0.54</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-300">casualties</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-neutral-700 rounded-full h-2">
                              <div className="bg-primary-500 h-2 rounded-full" style={{ width: '47%' }} />
                            </div>
                            <span className="text-neutral-400 text-sm">0.47</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-medium text-neutral-200">Confusion Matrix</h3>
                      <div className="p-4 bg-neutral-800/20 rounded-lg">
                        <div className="h-48 w-full bg-neutral-900 rounded-lg flex items-center justify-center">
                          <div className="text-neutral-500">Confusion matrix visualization would appear here</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-700 flex justify-end space-x-3">
                    <Button variant="outline" onClick={() => setActiveTab('models')}>
                      <Settings className="h-4 w-4 mr-2" />
                      Adjust Model
                    </Button>
                    <Button onClick={handleDeployModel}>
                      <Layers className="h-4 w-4 mr-2" />
                      Deploy Model
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-neutral-100 mb-2">
                    No Trained Model
                  </h3>
                  <p className="text-neutral-400 mb-6">
                    Train a model first to see evaluation metrics
                  </p>
                  <Button onClick={() => setActiveTab('training')}>
                    <Play className="h-4 w-4 mr-2" />
                    Go to Training
                  </Button>
                </div>
              )}
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}