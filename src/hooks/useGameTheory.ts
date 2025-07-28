import { useState, useEffect } from 'react'
import { geminiService } from '../services/geminiService'
import { dataService } from '../services/dataService'

import { useSupabaseEdgeFunctions } from './useSupabaseEdgeFunctions'
import { useAuth } from '../components/AuthProvider'
import { useToast } from './useToast'

interface TutorialContent {
  concept: string
  explanation: string
  geopoliticalExample: string
  interactiveElement: {
    type: 'scenario' | 'calculation' | 'game_tree'
    data: any
  }
  assessmentQuestion: {
    question: string
    options: string[]
    correctAnswer: number
  }
}

interface UserProgress {
  completedModules: string[]
  currentScore: number
  timeSpent: number
}

export function useGameTheory() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTutorial, setCurrentTutorial] = useState<TutorialContent | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completedModules: [],
    currentScore: 0,
    timeSpent: 0
  })
  
  const { user } = useAuth()
  const { getGameTheoryTutorial } = useSupabaseEdgeFunctions()
  const { showToast } = useToast()

  useEffect(() => {
    // Load user progress from localStorage
    const savedProgress = localStorage.getItem('gameTheoryProgress')
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress))
    }

    // Check for logged in user
    const loadUserProgress = async () => {
      if (user) {
        // If logged in, try to get progress from database
        try {
          const { data } = await dataService.getUserLearningProgress(user.id)
          if (data && data.length > 0) {
            // Merge with local progress
            const dbProgress = data.reduce((acc: any, item: any) => {
              if (item.module_id && !acc.completedModules.includes(item.module_id)) {
                acc.completedModules.push(item.module_id)
              }
              if (item.performance_data?.score) {
                acc.currentScore += item.performance_data.score
              }
              acc.timeSpent += 1
              return acc
            }, { ...userProgress })
            
            setUserProgress(dbProgress)
            localStorage.setItem('gameTheoryProgress', JSON.stringify(dbProgress))
          }
        } catch (err) {
          console.error('Failed to load user progress:', err)
        }
      }
    }
    
    loadUserProgress()
  }, [user])

  const generateTutorial = async (level: string, topic: string) => {
    setLoading(true)
    setError(null)

    try {
      // Try to use edge function first
      const { data: edgeData, error: edgeError } = await getGameTheoryTutorial(level, topic, userProgress)
      
      let tutorial
      if (edgeData && !edgeError) {
        tutorial = edgeData
      } else {
        // Fallback to client-side generation
        console.warn('Edge function failed, using client-side fallback:', edgeError)
        tutorial = await geminiService.generateGameTheoryTutorial(level, topic, userProgress)
      }
      
      // Save progress
      const updatedProgress = {
        ...userProgress,
        timeSpent: userProgress.timeSpent + 1
      }
      setUserProgress(updatedProgress)
      localStorage.setItem('gameTheoryProgress', JSON.stringify(updatedProgress))

      // Save to database if user is logged in
      if (user) {
        await dataService.saveLearningProgress(user.id, `${level}_${topic}`, {
          tutorial,
          timestamp: new Date().toISOString(),
          completionPercentage: 0 // Will be updated when completed
        })
      }
      // Ensure the tutorial is a parsed object before setting state
      const tutorialObject = typeof tutorial === 'string' ? JSON.parse(tutorial) : tutorial;
      return tutorialObject; // Return the tutorial object

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate tutorial'
      setError(errorMessage)
      showToast('error', 'Tutorial Generation Failed', errorMessage)
      return null; // Return null on error
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateTutorial = async (level: string, topic: string) => {
    const tutorial = await generateTutorial(level, topic);
    if (tutorial) {
      setCurrentTutorial(tutorial);
    }
  }

  const clearTutorial = () => {
    setCurrentTutorial(null);
  }

  const submitAnswer = async (questionId: string, answer: number): Promise<boolean> => {
    if (!currentTutorial || !currentTutorial.assessmentQuestion) return false

    const isCorrect = answer === currentTutorial.assessmentQuestion.correctAnswer
    
    if (isCorrect) {
      const moduleId = `${questionId}_${Date.now()}`
      const updatedProgress = {
        ...userProgress,
        completedModules: [...userProgress.completedModules, moduleId],
        currentScore: userProgress.currentScore + (isCorrect ? 10 : 0)
      }
      setUserProgress(updatedProgress)
      localStorage.setItem('gameTheoryProgress', JSON.stringify(updatedProgress))
      
      // Update database if user is logged in
      if (user) {
        try {
          await dataService.saveLearningProgress(user.id, moduleId, {
            completionPercentage: 100,
            score: isCorrect ? 10 : 0,
            timestamp: new Date().toISOString()
          });
        } catch (error: any) {
          if (error.code === '23505') {
            // Duplicate key - update existing instead
            console.log('Learning progress already exists, updating...');
          } else {
            console.error('Error saving learning progress:', error);
          }
        }
      }
      
      showToast('success', 'Correct Answer!', 'You earned 10 points')
    } else {
      showToast('warning', 'Incorrect Answer', 'Try again or review the material')
    }

    return isCorrect
  }

  const resetProgress = () => {
    const emptyProgress = { completedModules: [], currentScore: 0, timeSpent: 0 }
    setUserProgress(emptyProgress)
    localStorage.setItem('gameTheoryProgress', JSON.stringify(emptyProgress))
    
    // Clear database progress if user is logged in
    if (user) {
      // This would require a custom API endpoint to clear all progress
      console.log('Database progress reset would be triggered here')
    }
    
    showToast('info', 'Progress Reset', 'Your learning progress has been reset')
  }

  return {
    loading,
    error,
    currentTutorial,
    userProgress,
    generateTutorial: handleGenerateTutorial,
    submitAnswer,
    resetProgress,
    clearTutorial
  }
}