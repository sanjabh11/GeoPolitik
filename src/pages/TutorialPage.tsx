import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { GameTree } from '../components/tutorial/GameTree';
import { useGameTheory } from '../hooks/useGameTheory';

interface TutorialPageProps {
  level?: 'basic' | 'intermediate' | 'advanced';
  topic?: string;
}

export function TutorialPage({ level = 'basic', topic = 'prisoners-dilemma' }: TutorialPageProps) {
  const { getTutorial, submitAnswer, resetProgress, loading, error } = useGameTheory();
  const [tutorial, setTutorial] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    loadTutorial();
  }, [level, topic]);

  const loadTutorial = async () => {
    const data = await getTutorial(level, topic);
    setTutorial(data);
  };

  const handleAnswerSubmit = async () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = await submitAnswer(selectedAnswer);
    setShowResult(true);
    
    if (isCorrect) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }, 2000);
    }
  };

  const gameTreeData = tutorial?.interactiveElement?.type === 'game_tree' 
    ? tutorial.interactiveElement.data 
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-4">Error Loading Tutorial</h2>
          <p className="text-neutral-400">{error}</p>
          <Button onClick={loadTutorial} className="mt-4">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{tutorial?.concept || 'Loading...'}</h1>
          <ProgressBar progress={((currentStep + 1) / 5) * 100} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tutorial Content */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Concept Explanation</h2>
              <p className="text-neutral-300 leading-relaxed">
                {tutorial?.explanation}
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Real-World Example</h2>
              <p className="text-neutral-300 leading-relaxed">
                {tutorial?.geopoliticalExample}
              </p>
            </Card>

            {/* Interactive Element */}
            {gameTreeData && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Interactive Game Tree</h2>
                <GameTree data={gameTreeData} width={500} height={300} />
              </Card>
            )}
          </div>

          {/* Assessment */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Assessment Question</h2>
              <p className="text-neutral-300 mb-4">
                {tutorial?.assessmentQuestion?.question}
              </p>

              <div className="space-y-3">
                {tutorial?.assessmentQuestion?.options?.map((option: string, index: number) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === index ? 'primary' : 'outline'}
                    onClick={() => setSelectedAnswer(index)}
                    className="w-full justify-start text-left"
                  >
                    <span className="mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Button>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  onClick={handleAnswerSubmit}
                  disabled={selectedAnswer === null || loading}
                  className="w-full"
                >
                  Submit Answer
                </Button>
                
                <Button
                  variant="outline"
                  onClick={resetProgress}
                  className="w-full"
                >
                  Reset Progress
                </Button>
              </div>

              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-lg bg-green-900/20 border border-green-600"
                >
                  <p className="text-green-400 font-medium">
                    {tutorial?.assessmentQuestion?.correctAnswer === selectedAnswer
                      ? '✅ Correct! Well done!'
                      : '❌ Not quite right. Try again!'}
                  </p>
                </motion.div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
