import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  ArrowLeft,
  BookOpen,
  Target,
  Users,
  TrendingUp,
  Play,
  Pause,
  RotateCcw,
  Lightbulb
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useGameTheory } from '../hooks/useGameTheory';

interface TutorialModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  completed: boolean;
  locked: boolean;
  progress: number;
}

const tutorialModules: TutorialModule[] = [
  {
    id: '1',
    title: 'Introduction to Game Theory',
    description: 'Basic concepts, Nash equilibrium, and strategic thinking fundamentals',
    difficulty: 'beginner',
    duration: '30 min',
    completed: false,
    locked: false,
    progress: 0
  },
  {
    id: '2',
    title: 'Zero-Sum Games',
    description: 'Competitive scenarios where one player\'s gain equals another\'s loss',
    difficulty: 'beginner',
    duration: '45 min',
    completed: false,
    locked: false,
    progress: 0
  },
  {
    id: '3',
    title: 'Prisoner\'s Dilemma',
    description: 'Classic cooperation vs. competition scenarios in geopolitics',
    difficulty: 'intermediate',
    duration: '35 min',
    completed: false,
    locked: false,
    progress: 0
  },
  {
    id: '4',
    title: 'Coalition Formation',
    description: 'Alliance building and strategic partnerships in international relations',
    difficulty: 'intermediate',
    duration: '50 min',
    completed: false,
    locked: false,
    progress: 0
  },
  {
    id: '5',
    title: 'Nuclear Deterrence Theory',
    description: 'MAD doctrine and strategic stability in superpower relations',
    difficulty: 'advanced',
    duration: '60 min',
    completed: false,
    locked: true,
    progress: 0
  },
  {
    id: '6',
    title: 'Economic Warfare',
    description: 'Trade wars, sanctions, and economic coercion strategies',
    difficulty: 'advanced',
    duration: '55 min',
    completed: false,
    locked: true,
    progress: 0
  }
];

export default function GameTheoryTutorial() {
  const [selectedModule, setSelectedModule] = useState<TutorialModule | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const {
    loading,
    error,
    currentTutorial,
    userProgress,
    generateTutorial,
    submitAnswer,
    resetProgress
  } = useGameTheory();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const handleModuleSelect = async (module: TutorialModule) => {
    if (!module.locked) {
      setSelectedModule(module);
      setCurrentStep(0);
      setShowFeedback(false);
      setUserAnswer(null);
      await generateTutorial(module.difficulty, module.title);
    }
  };

  const handleAnswerSubmit = async () => {
    if (userAnswer === null || !currentTutorial) return;

    const correct = await submitAnswer(selectedModule?.id || '', userAnswer);
    setIsCorrect(correct);
    setShowFeedback(true);
  };

  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1);
    setShowFeedback(false);
    setUserAnswer(null);
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
    setShowFeedback(false);
    setUserAnswer(null);
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
                Game Theory Mastery
              </h1>
              <p className="text-neutral-400">
                Learn strategic decision-making through AI-powered interactive scenarios
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <div className="text-sm text-neutral-400">
                Score: <span className="text-primary-400 font-bold">{userProgress.currentScore}</span>
              </div>
              <div className="text-sm text-neutral-400">
                Modules: <span className="text-secondary-400 font-bold">{userProgress.completedModules.length}</span>
              </div>
              <Button variant="outline" size="sm" onClick={resetProgress}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Progress
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Module List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-neutral-100 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-primary-400" />
                Learning Path
              </h2>
              <div className="space-y-3">
                {tutorialModules.map((module, index) => {
                  const isCompleted = userProgress.completedModules.some(completed => 
                    completed.includes(module.id)
                  );
                  
                  return (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        module.locked
                          ? 'border-neutral-700/30 bg-neutral-800/20 opacity-50 cursor-not-allowed'
                          : selectedModule?.id === module.id
                          ? 'border-primary-600/50 bg-primary-900/20'
                          : 'border-neutral-700/50 bg-neutral-800/20 hover:border-neutral-600/50 hover:bg-neutral-800/40'
                      }`}
                      onClick={() => handleModuleSelect(module)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-success-400" />
                          ) : module.locked ? (
                            <Circle className="h-5 w-5 text-neutral-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-primary-400" />
                          )}
                          <Badge variant={getDifficultyColor(module.difficulty) as any} size="sm">
                            {module.difficulty}
                          </Badge>
                        </div>
                        <span className="text-xs text-neutral-500">{module.duration}</span>
                      </div>
                      <h3 className="font-medium text-neutral-100 mb-1">{module.title}</h3>
                      <p className="text-sm text-neutral-400 mb-3">{module.description}</p>
                      {!module.locked && (
                        <div className="w-full bg-neutral-700 rounded-full h-2">
                          <motion.div
                            className="bg-primary-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${isCompleted ? 100 : module.progress}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </Card>

            {/* Progress Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-100 mb-4">Your Progress</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Modules Completed</span>
                  <span className="text-sm font-medium text-neutral-200">
                    {userProgress.completedModules.length}/{tutorialModules.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Current Score</span>
                  <span className="text-sm font-medium text-primary-400">
                    {userProgress.currentScore}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Time Invested</span>
                  <span className="text-sm font-medium text-neutral-200">
                    {userProgress.timeSpent} sessions
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <Card className="p-12 text-center">
                  <LoadingSpinner size="lg" />
                  <p className="text-neutral-400 mt-4">Generating AI-powered tutorial content...</p>
                </Card>
              ) : error ? (
                <Card className="p-12 text-center">
                  <div className="text-error-400 mb-4">⚠️ Error</div>
                  <p className="text-neutral-400">{error}</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => selectedModule && handleModuleSelect(selectedModule)}
                  >
                    Retry
                  </Button>
                </Card>
              ) : selectedModule && currentTutorial ? (
                <motion.div
                  key={selectedModule.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {/* Module Header */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-primary-600/20">
                          <Brain className="h-6 w-6 text-primary-400" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-neutral-100">
                            {selectedModule.title}
                          </h2>
                          <p className="text-neutral-400">{selectedModule.description}</p>
                        </div>
                      </div>
                      <Badge variant={getDifficultyColor(selectedModule.difficulty) as any}>
                        {selectedModule.difficulty}
                      </Badge>
                    </div>
                  </Card>

                  {/* Tutorial Content */}
                  <Card className="p-6">
                    <div className="space-y-6">
                      {/* Concept Explanation */}
                      <div>
                        <h3 className="text-xl font-semibold text-neutral-100 mb-3 flex items-center">
                          <Lightbulb className="h-5 w-5 mr-2 text-accent-400" />
                          Concept: {currentTutorial.concept}
                        </h3>
                        <p className="text-neutral-300 leading-relaxed">
                          {currentTutorial.explanation}
                        </p>
                      </div>

                      {/* Geopolitical Example */}
                      <div className="bg-secondary-900/20 border border-secondary-700/50 rounded-lg p-4">
                        <h4 className="font-medium text-secondary-300 mb-2">Real-World Example</h4>
                        <p className="text-neutral-300 text-sm">
                          {currentTutorial.geopoliticalExample}
                        </p>
                      </div>

                      {/* Interactive Element */}
                      {currentTutorial.interactiveElement && (
                        <div>
                          <h4 className="font-medium text-neutral-200 mb-3">Interactive Analysis</h4>
                          {currentTutorial.interactiveElement.type === 'scenario' && (
                            <div className="bg-neutral-800/20 rounded-lg p-4">
                              <div className="grid grid-cols-2 gap-4">
                                {currentTutorial.interactiveElement.data.players?.map((player: string, index: number) => (
                                  <div key={index} className="text-center p-3 bg-neutral-700/50 rounded">
                                    <div className="font-medium text-neutral-200">{player}</div>
                                    <div className="text-sm text-neutral-400 mt-1">
                                      Strategies: {currentTutorial.interactiveElement.data.strategies?.join(', ')}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {currentTutorial.interactiveElement.data.payoffs && (
                                <div className="mt-4">
                                  <div className="text-sm font-medium text-neutral-300 mb-2">Payoff Matrix:</div>
                                  <div className="grid grid-cols-2 gap-2 text-center text-sm">
                                    {currentTutorial.interactiveElement.data.payoffs.map((payoff: number[], index: number) => (
                                      <div key={index} className="bg-neutral-600/30 p-2 rounded">
                                        ({payoff.join(', ')})
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Assessment Question */}
                      <div className="border-t border-neutral-700 pt-6">
                        <h4 className="font-medium text-neutral-200 mb-4">Assessment Question</h4>
                        <p className="text-neutral-300 mb-4">
                          {currentTutorial.assessmentQuestion.question}
                        </p>
                        <div className="space-y-2">
                          {currentTutorial.assessmentQuestion.options.map((option, index) => (
                            <label 
                              key={index}
                              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                userAnswer === index 
                                  ? 'bg-primary-900/30 border border-primary-600/50' 
                                  : 'bg-neutral-800/20 hover:bg-neutral-800/40'
                              }`}
                            >
                              <input 
                                type="radio" 
                                name="answer" 
                                value={index}
                                checked={userAnswer === index}
                                onChange={() => setUserAnswer(index)}
                                className="text-primary-500" 
                              />
                              <span className="text-neutral-300">{option}</span>
                            </label>
                          ))}
                        </div>

                        {/* Feedback */}
                        <AnimatePresence>
                          {showFeedback && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className={`mt-4 p-4 rounded-lg ${
                                isCorrect 
                                  ? 'bg-success-900/20 border border-success-700/50' 
                                  : 'bg-error-900/20 border border-error-700/50'
                              }`}
                            >
                              <div className={`font-medium ${isCorrect ? 'text-success-300' : 'text-error-300'}`}>
                                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                              </div>
                              <div className="text-sm text-neutral-400 mt-1">
                                {isCorrect 
                                  ? 'Great job! You understand the concept well.' 
                                  : `The correct answer is: ${currentTutorial.assessmentQuestion.options[currentTutorial.assessmentQuestion.correctAnswer]}`
                                }
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="flex items-center justify-between mt-6">
                          <Button variant="outline" onClick={handlePreviousStep} disabled={currentStep === 0}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Previous
                          </Button>
                          
                          {!showFeedback ? (
                            <Button 
                              onClick={handleAnswerSubmit}
                              disabled={userAnswer === null}
                            >
                              Submit Answer
                            </Button>
                          ) : (
                            <Button onClick={handleNextStep}>
                              Next Step
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center h-96"
                >
                  <Card className="p-12 text-center">
                    <Brain className="h-16 w-16 text-primary-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-neutral-100 mb-2">
                      Select a Module to Begin
                    </h3>
                    <p className="text-neutral-400">
                      Choose a learning module from the left panel to start your AI-powered game theory journey
                    </p>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}