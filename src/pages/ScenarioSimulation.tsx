import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings,
  Users,
  TrendingUp,
  Brain,
  ArrowRight,
  BarChart3,
  Zap
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useScenarioSimulation } from '../hooks/useScenarioSimulation';

interface Actor {
  id: string;
  name: string;
  color: string;
  capabilities: {
    military: number;
    economic: number;
    diplomatic: number;
  };
  preferences: {
    riskTolerance: number;
    timeHorizon: 'short' | 'medium' | 'long';
  };
}

interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  type: 'trade_war' | 'military_conflict' | 'diplomatic_crisis' | 'alliance_formation';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
}

const scenarios: SimulationScenario[] = [
  {
    id: '1',
    title: 'Trade War Escalation',
    description: 'Two major economies engage in reciprocal tariff impositions with global implications',
    type: 'trade_war',
    difficulty: 'intermediate',
    estimatedTime: '15-20 min'
  },
  {
    id: '2',
    title: 'Nuclear Deterrence',
    description: 'Strategic stability analysis between nuclear powers with MAD doctrine considerations',
    type: 'military_conflict',
    difficulty: 'advanced',
    estimatedTime: '25-30 min'  
  },
  {
    id: '3',
    title: 'Alliance Formation',
    description: 'Multiple nations negotiate security partnerships with coalition game theory',
    type: 'alliance_formation',
    difficulty: 'intermediate',
    estimatedTime: '20-25 min'
  },
  {
    id: '4',
    title: 'Diplomatic Crisis',
    description: 'International incident requiring multilateral response and crisis management',
    type: 'diplomatic_crisis',
    difficulty: 'beginner',
    estimatedTime: '10-15 min'
  }
];

const defaultActors: Actor[] = [
  {
    id: '1',
    name: 'Nation Alpha',
    color: 'bg-primary-500',
    capabilities: { military: 85, economic: 90, diplomatic: 75 },
    preferences: { riskTolerance: 0.6, timeHorizon: 'medium' }
  },
  {
    id: '2',
    name: 'Nation Beta',
    color: 'bg-secondary-500',
    capabilities: { military: 75, economic: 85, diplomatic: 80 },
    preferences: { riskTolerance: 0.4, timeHorizon: 'long' }
  },
  {
    id: '3',
    name: 'Nation Gamma',
    color: 'bg-accent-500',
    capabilities: { military: 60, economic: 70, diplomatic: 90 },
    preferences: { riskTolerance: 0.8, timeHorizon: 'short' }
  }
];

export default function ScenarioSimulation() {
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(null);
  const [actors, setActors] = useState<Actor[]>(defaultActors);
  const [simulationStep, setSimulationStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const {
    loading,
    error,
    currentSimulation,
    simulationHistory,
    runSimulation,
    loadSimulationHistory,
    clearHistory
  } = useScenarioSimulation();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trade_war': return <TrendingUp className="h-4 w-4" />;
      case 'military_conflict': return <Target className="h-4 w-4" />;
      case 'alliance_formation': return <Users className="h-4 w-4" />;
      case 'diplomatic_crisis': return <Brain className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const handleRunSimulation = async () => {
    if (!selectedScenario) return;

    const config = {
      actors,
      scenario: {
        type: selectedScenario.type,
        parameters: {
          title: selectedScenario.title,
          difficulty: selectedScenario.difficulty
        }
      },
      simulationSettings: {
        iterations: 1000,
        timeSteps: 10
      }
    };

    try {
      await runSimulation(config);
      setShowResults(true);
    } catch (err) {
      console.error('Simulation failed:', err);
    }
  };

  const resetSimulation = () => {
    setSimulationStep(0);
    setShowResults(false);
    setActors(defaultActors);
  };

  const updateActorCapability = (actorId: string, capability: string, value: number) => {
    setActors(prev => prev.map(actor => 
      actor.id === actorId 
        ? { ...actor, capabilities: { ...actor.capabilities, [capability]: value } }
        : actor
    ));
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
                AI Strategic Simulation Lab
              </h1>
              <p className="text-neutral-400">
                Model complex multi-actor scenarios with game-theoretic AI analysis
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Badge variant="info">
                {simulationHistory.length} simulations run
              </Badge>
              <Button variant="outline" size="sm" onClick={loadSimulationHistory}>
                View History
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Scenario Selection & Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-neutral-100 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-primary-400" />
                Select Scenario
              </h2>
              <div className="space-y-3">
                {scenarios.map((scenario) => (
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
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(scenario.type)}
                        <Badge variant={getDifficultyColor(scenario.difficulty) as any} size="sm">
                          {scenario.difficulty}
                        </Badge>
                      </div>
                      <span className="text-xs text-neutral-500">{scenario.estimatedTime}</span>
                    </div>
                    <h3 className="font-medium text-neutral-100 mb-1">{scenario.title}</h3>
                    <p className="text-sm text-neutral-400">{scenario.description}</p>
                  </motion.div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center">
                <Settings className="h-4 w-4 mr-2 text-secondary-400" />
                Simulation Controls
              </h3>
              <div className="space-y-3">
                <Button
                  onClick={handleRunSimulation}
                  disabled={!selectedScenario || loading}
                  className="w-full"
                  loading={loading}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {loading ? 'Running AI Analysis...' : 'Start Simulation'}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetSimulation}
                  className="w-full"
                  disabled={loading}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Configuration
                </Button>
                {simulationHistory.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearHistory}
                    className="w-full text-error-400 border-error-600/50 hover:bg-error-900/20"
                    size="sm"
                  >
                    Clear History
                  </Button>
                )}
              </div>
            </Card>

            {error && (
              <Card className="p-4 border-error-600/50 bg-error-900/20">
                <div className="text-error-300 text-sm">{error}</div>
              </Card>
            )}
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Actors Configuration */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-neutral-100 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-secondary-400" />
                Actor Configuration
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {actors.map((actor, index) => (
                  <motion.div
                    key={actor.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-neutral-800/20 border border-neutral-700/50"
                  >
                    <div className="flex items-center mb-3">
                      <div className={`w-3 h-3 rounded-full ${actor.color} mr-2`} />
                      <h3 className="font-medium text-neutral-100">{actor.name}</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {Object.entries(actor.capabilities).map(([capability, value]) => (
                        <div key={capability}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-neutral-400 capitalize">{capability}</span>
                            <span className="text-neutral-200">{value}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={value}
                            onChange={(e) => updateActorCapability(actor.id, capability, parseInt(e.target.value))}
                            className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-neutral-700">
                      <div className="text-xs text-neutral-500 mb-1">Risk Tolerance</div>
                      <div className="text-sm font-medium text-neutral-200">
                        {Math.round(actor.preferences.riskTolerance * 100)}%
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        Time Horizon: <span className="text-neutral-300 capitalize">{actor.preferences.timeHorizon}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Simulation Results */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="p-8">
                    <div className="text-center">
                      <LoadingSpinner size="lg" />
                      <h3 className="text-xl font-semibold text-neutral-100 mt-4 mb-2">
                        AI Analysis in Progress
                      </h3>
                      <p className="text-neutral-400 mb-4">
                        Running game-theoretic simulation with {actors.length} actors...
                      </p>
                      <div className="space-y-2 text-sm text-neutral-500">
                        <div>• Calculating Nash equilibria</div>
                        <div>• Analyzing strategic stability</div>
                        <div>• Generating payoff matrices</div>
                        <div>• Computing optimal strategies</div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {showResults && currentSimulation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold text-neutral-100 mb-4 flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-accent-400" />
                      AI Simulation Results
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Key Metrics */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="text-center p-4 bg-primary-900/20 rounded-lg border border-primary-700/50">
                          <div className="text-lg font-semibold text-neutral-100 mb-1">
                            Nash Equilibrium
                          </div>
                          <div className="text-primary-300">{currentSimulation.nashEquilibrium}</div>
                        </div>
                        <div className="text-center p-4 bg-secondary-900/20 rounded-lg border border-secondary-700/50">
                          <div className="text-lg font-semibold text-neutral-100 mb-1">
                            Stability Index
                          </div>
                          <div className="text-secondary-300">
                            {(currentSimulation.stability * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      {/* Expected Payoffs */}
                      <div>
                        <h4 className="font-medium text-neutral-200 mb-3 flex items-center">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Expected Payoffs
                        </h4>
                        <div className="space-y-2">
                          {currentSimulation.expectedPayoffs.map((actor: any) => {
                            const actorConfig = actors.find(a => a.id === actor.id);
                            return (
                              <div key={actor.id} className="flex items-center justify-between p-3 bg-neutral-800/20 rounded-lg">
                                <div className="flex items-center">
                                  <div className={`w-3 h-3 rounded-full ${actorConfig?.color || 'bg-neutral-500'} mr-3`} />
                                  <span className="text-neutral-300">{actor.name}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <div className="w-24 bg-neutral-700 rounded-full h-2">
                                    <div
                                      className="bg-primary-500 h-2 rounded-full"
                                      style={{ width: `${Math.min(100, actor.payoff)}%` }}
                                    />
                                  </div>
                                  <span className="font-mono text-neutral-100 w-12 text-right">
                                    {actor.payoff.toFixed(1)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Strategic Recommendations */}
                      <div>
                        <h4 className="font-medium text-neutral-200 mb-3 flex items-center">
                          <Zap className="h-4 w-4 mr-2" />
                          AI Strategic Recommendations
                        </h4>
                        <div className="space-y-2">
                          {currentSimulation.recommendations.map((rec: string, index: number) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-neutral-800/20 rounded-lg">
                              <ArrowRight className="h-4 w-4 text-accent-400 mt-0.5 flex-shrink-0" />
                              <span className="text-neutral-300 text-sm">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Advanced Analysis */}
                      {currentSimulation.detailedAnalysis && (
                        <div>
                          <h4 className="font-medium text-neutral-200 mb-3">Advanced Analysis</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-3 bg-neutral-800/20 rounded-lg">
                              <div className="text-sm font-medium text-neutral-300 mb-2">
                                Equilibrium Probabilities
                              </div>
                              <div className="space-y-1">
                                {currentSimulation.detailedAnalysis.equilibriumProbabilities.map((prob: number, index: number) => (
                                  <div key={index} className="flex justify-between text-xs">
                                    <span className="text-neutral-400">Actor {index + 1}</span>
                                    <span className="text-neutral-300">{(prob * 100).toFixed(1)}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="p-3 bg-neutral-800/20 rounded-lg">
                              <div className="text-sm font-medium text-neutral-300 mb-2">
                                Sensitivity Analysis
                              </div>
                              <div className="space-y-1">
                                {Object.entries(currentSimulation.detailedAnalysis.sensitivityAnalysis).map(([key, value]) => (
                                  <div key={key} className="flex justify-between text-xs">
                                    <span className="text-neutral-400 capitalize">
                                      {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <span className="text-neutral-300">{((value as number) * 100).toFixed(1)}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scenario Details */}
            {selectedScenario && !loading && !showResults && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-neutral-100 mb-4">
                  {selectedScenario.title}
                </h3>
                <div className="space-y-4">
                  <p className="text-neutral-400">{selectedScenario.description}</p>
                  <div className="flex items-center space-x-4">
                    <Badge variant={getDifficultyColor(selectedScenario.difficulty) as any}>
                      {selectedScenario.difficulty.charAt(0).toUpperCase() + selectedScenario.difficulty.slice(1)}
                    </Badge>
                    <span className="text-sm text-neutral-500">
                      Estimated time: {selectedScenario.estimatedTime}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-neutral-700">
                    <h4 className="font-medium text-neutral-200 mb-2">Simulation Parameters</h4>
                    <div className="text-sm text-neutral-400 space-y-1">
                      <div>• Game-theoretic modeling with {actors.length} strategic actors</div>
                      <div>• Nash equilibrium calculation using advanced algorithms</div>
                      <div>• Monte Carlo simulation with 1,000 iterations</div>
                      <div>• Multi-dimensional payoff analysis</div>
                      <div>• AI-powered strategic recommendations</div>
                    </div>
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