import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings, 
  Award, 
  Target,
  TrendingUp,
  Clock,
  Brain,
  Globe,
  Bell,
  Shield,
  LogOut
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../components/AuthProvider';
import { useToast } from '../hooks/useToast';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  earned: boolean;
  progress: number;
  maxProgress: number;
}

interface LearningStats {
  modulesCompleted: number;
  totalModules: number;
  hoursLearned: number;
  averageScore: number;
  streak: number;
}

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'Game Theory Novice',
    description: 'Complete your first tutorial module',
    icon: Brain,
    earned: true,
    progress: 1,
    maxProgress: 1
  },
  {
    id: '2',
    title: 'Strategic Thinker',
    description: 'Complete 5 scenario simulations',
    icon: Target,
    earned: false,
    progress: 3,
    maxProgress: 5
  },
  {
    id: '3',
    title: 'Risk Analyst',
    description: 'Analyze 10 geopolitical risk assessments',
    icon: TrendingUp,
    earned: false,
    progress: 7,
    maxProgress: 10
  },
  {
    id: '4',
    title: 'Crisis Expert',
    description: 'Successfully predict 3 crisis escalations',
    icon: Globe,
    earned: false,
    progress: 1,
    maxProgress: 3
  }
];

const learningStats: LearningStats = {
  modulesCompleted: 8,
  totalModules: 15,
  hoursLearned: 24.5,
  averageScore: 87,
  streak: 12
};

const recentActivity = [
  {
    id: '1',
    type: 'simulation',
    title: 'Completed Trade War Simulation',
    timestamp: '2 hours ago',
    score: 94
  },
  {
    id: '2', 
    type: 'tutorial',
    title: 'Finished Nash Equilibrium Module',
    timestamp: '1 day ago',
    score: 89
  },
  {
    id: '3',
    type: 'analysis',
    title: 'Eastern Europe Risk Assessment',
    timestamp: '2 days ago',
    score: 91
  },
  {
    id: '4',
    type: 'crisis',
    title: 'Predicted Border Crisis Escalation',
    timestamp: '3 days ago',
    score: 76
  }
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'settings'>('overview');
  const [userProfile, setUserProfile] = useState<any>(null);
  const { user, signOut, getUserProfile } = useAuth();
  const { showToast } = useToast();
  
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const profile = await getUserProfile();
        setUserProfile(profile);
      }
    };
    
    loadProfile();
  }, [user]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'simulation': return <Target className="h-4 w-4 text-primary-400" />;
      case 'tutorial': return  <Brain className="h-4 w-4 text-secondary-400" />;
      case 'analysis': return <TrendingUp className="h-4 w-4 text-accent-400" />;
      case 'crisis': return <Globe className="h-4 w-4 text-warning-400" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success-400';
    if (score >= 80) return 'text-warning-400';
    if (score >= 70) return 'text-accent-400';
    return 'text-error-400';
  };
  
  const handleSignOut = async () => {
    await signOut();
    showToast('info', 'Signed out successfully');
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-16 pb-8 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <User className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-100 mb-4">
            Sign In Required
          </h2>
          <p className="text-neutral-400 mb-6">
            Please sign in to view your profile and track your progress.
          </p>
          <Button onClick={() => showToast('info', 'Please use the Sign In button in the navigation')}>
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

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
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-neutral-100">
                  {userProfile?.full_name || user.email}
                </h1>
                <p className="text-neutral-400">
                  {userProfile?.role === 'student' ? 'Student' : 
                   userProfile?.role === 'analyst' ? 'Analyst' : 
                   userProfile?.role === 'researcher' ? 'Researcher' : 
                   'User'} • {user.email}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="info">Advanced User</Badge>
                  <Badge variant="success">{learningStats.streak} Day Streak</Badge>
                </div>
              </div>
            </div>
            <div className="mt-4 lg:mt-0 flex space-x-3">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                className="text-error-400 border-error-600/50 hover:bg-error-900/20"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
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
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'achievements', label: 'Achievements', icon: Award },
              { id: 'settings', label: 'Settings', icon: Settings }
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
                  <span>{tab.label}</span>
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
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Learning Statistics */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-neutral-100 mb-6">
                    Learning Progress
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-primary-900/20 rounded-lg border border-primary-700/50">
                      <div className="text-3xl font-bold text-primary-300 mb-1">
                        {learningStats.modulesCompleted}/{learningStats.totalModules}
                      </div>
                      <div className="text-sm text-neutral-400">Modules Completed</div>
                      <div className="w-full bg-neutral-700 rounded-full h-2 mt-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${(learningStats.modulesCompleted / learningStats.totalModules) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-center p-4 bg-secondary-900/20 rounded-lg border border-secondary-700/50">
                      <div className="text-3xl font-bold text-secondary-300 mb-1">
                        {learningStats.hoursLearned}h
                      </div>
                      <div className="text-sm text-neutral-400">Time Invested</div>
                    </div>
                    <div className="text-center p-4 bg-accent-900/20 rounded-lg border border-accent-700/50">
                      <div className="text-3xl font-bold text-accent-300 mb-1">
                        {learningStats.averageScore}%
                      </div>
                      <div className="text-sm text-neutral-400">Average Score</div>
                    </div>
                    <div className="text-center p-4 bg-success-900/20 rounded-lg border border-success-700/50">
                      <div className="text-3xl font-bold text-success-300 mb-1">
                        {learningStats.streak}
                      </div>
                      <div className="text-sm text-neutral-400">Day Streak</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold text-neutral-100 mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 bg-neutral-800/20 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getActivityIcon(activity.type)}
                          <div>
                            <div className="font-medium text-neutral-200">
                              {activity.title}
                            </div>
                            <div className="text-sm text-neutral-500">
                              {activity.timestamp}
                            </div>
                          </div>
                        </div>
                        <div className={`font-bold ${getScoreColor(activity.score)}`}>
                          {activity.score}%
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-neutral-100 mb-4">
                    Quick Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-400">Simulations Run</span>
                      <span className="font-medium text-neutral-200">47</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-400">Risk Assessments</span>
                      <span className="font-medium text-neutral-200">23</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-400">Crisis Predictions</span>
                      <span className="font-medium text-neutral-200">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-400">Accuracy Rate</span>
                      <span className="font-medium text-success-400">87%</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-neutral-100 mb-4">
                    Specializations
                  </h3>
                  <div className="space-y-2">
                    <Badge variant="info" className="mr-2 mb-2">Game Theory</Badge>
                    <Badge variant="warning" className="mr-2 mb-2">Risk Analysis</Badge>
                    <Badge variant="success" className="mr-2 mb-2">Crisis Management</Badge>
                    <Badge variant="error" className="mr-2 mb-2">Economic Modeling</Badge>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className={`p-6 ${achievement.earned ? 'border-success-600/50' : 'border-neutral-700/50'}`}>
                      <div className="text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                          achievement.earned 
                            ? 'bg-success-600/20 text-success-400' 
                            : 'bg-neutral-700/50 text-neutral-500'
                        }`}>
                          <Icon className="h-8 w-8" />
                        </div>
                        <h3 className="font-semibold text-neutral-100 mb-2">
                          {achievement.title}
                        </h3>
                        <p className="text-sm text-neutral-400 mb-4">
                          {achievement.description}
                        </p>
                        {achievement.earned ? (
                          <Badge variant="success">Earned</Badge>
                        ) : (
                          <div>
                            <div className="w-full bg-neutral-700 rounded-full h-2 mb-2">
                              <div
                                className="bg-primary-500 h-2 rounded-full"
                                style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                              />
                            </div>
                            <div className="text-xs text-neutral-500">
                              {achievement.progress}/{achievement.maxProgress}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-primary-400" />
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-neutral-200">Crisis Alerts</div>
                      <div className="text-sm text-neutral-400">Receive notifications for high-severity events</div>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-neutral-200">Learning Reminders</div>
                      <div className="text-sm text-neutral-400">Daily study session reminders</div>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-neutral-200">Weekly Reports</div>
                      <div className="text-sm text-neutral-400">Summary of your progress and achievements</div>
                    </div>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-secondary-400" />
                  Privacy & Security
                </h3>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Two-Factor Authentication
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Download Data
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-error-400 border-error-600/50 hover:bg-error-900/20"
                    onClick={handleSignOut}
                  >
                    Sign Out
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