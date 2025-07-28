import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TutorialPage } from '../pages/TutorialPage';
import { useGameTheory } from '../hooks/useGameTheory';

// Mock the hook
jest.mock('../hooks/useGameTheory');

const mockUseGameTheory = useGameTheory as jest.MockedFunction<typeof useGameTheory>;

describe('TutorialPage', () => {
  beforeEach(() => {
    mockUseGameTheory.mockReturnValue({
      getTutorial: jest.fn(),
      submitAnswer: jest.fn(),
      resetProgress: jest.fn(),
      loading: false,
      error: null,
    });
  });

  it('renders loading state', () => {
    mockUseGameTheory.mockReturnValue({
      getTutorial: jest.fn(),
      submitAnswer: jest.fn(),
      resetProgress: jest.fn(),
      loading: true,
      error: null,
    });

    render(<TutorialPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseGameTheory.mockReturnValue({
      getTutorial: jest.fn(),
      submitAnswer: jest.fn(),
      resetProgress: jest.fn(),
      loading: false,
      error: 'Failed to load tutorial',
    });

    render(<TutorialPage />);
    expect(screen.getByText(/error loading tutorial/i)).toBeInTheDocument();
    expect(screen.getByText(/retry/i)).toBeInTheDocument();
  });

  it('renders tutorial content when loaded', async () => {
    const mockTutorial = {
      concept: 'Prisoners Dilemma',
      explanation: 'A classic game theory scenario...',
      geopoliticalExample: 'Trade negotiations...',
      assessmentQuestion: {
        question: 'What is the optimal strategy?',
        options: ['Cooperate', 'Defect'],
        correctAnswer: 1,
      },
    };

    mockUseGameTheory.mockReturnValue({
      getTutorial: jest.fn().mockResolvedValue(mockTutorial),
      submitAnswer: jest.fn(),
      resetProgress: jest.fn(),
      loading: false,
      error: null,
    });

    render(<TutorialPage />);

    await waitFor(() => {
      expect(screen.getByText('Prisoners Dilemma')).toBeInTheDocument();
      expect(screen.getByText(/classic game theory scenario/i)).toBeInTheDocument();
    });
  });

  it('handles answer submission', async () => {
    const mockSubmitAnswer = jest.fn().mockResolvedValue(true);
    const mockTutorial = {
      concept: 'Test Concept',
      explanation: 'Test explanation',
      geopoliticalExample: 'Test example',
      assessmentQuestion: {
        question: 'Test question?',
        options: ['Option A', 'Option B'],
        correctAnswer: 0,
      },
    };

    mockUseGameTheory.mockReturnValue({
      getTutorial: jest.fn().mockResolvedValue(mockTutorial),
      submitAnswer: mockSubmitAnswer,
      resetProgress: jest.fn(),
      loading: false,
      error: null,
    });

    render(<TutorialPage />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Option A'));
      fireEvent.click(screen.getByText('Submit Answer'));
    });

    expect(mockSubmitAnswer).toHaveBeenCalledWith(0);
  });
});
