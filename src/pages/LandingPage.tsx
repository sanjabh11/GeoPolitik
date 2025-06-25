import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Brain, 
  Globe, 
  TrendingUp, 
  Target, 
  Shield, 
  Users,
  BarChart3,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ResponsiveContainer } from '../components/ResponsiveContainer';

const features = [
  {
    icon: Brain,
    title: 'Interactive Game Theory',
    description: 'Master strategic decision-making through hands-on tutorials and real-world scenarios.',
    color: 'text-primary-400'
  },
  {
    icon: TrendingUp,
    title: 'Risk Assessment',
    description: 'Real-time geopolitical risk analysis with AI-powered predictions and confidence intervals.',
    color: 'text-secondary-400'
  },
  {
    icon: Target,
    title: 'Scenario Simulation',
    description: 'Run complex multi-actor simulations to evaluate strategic options and outcomes.',
    color: 'text-accent-400'
  },
  {
    icon: AlertTriangle,
    title: 'Crisis Monitoring',
    description: 'Early warning system for emerging crises with customizable alerts and notifications.',
    color: 'text-warning-400'
  },
  {
    icon: BarChart3,
    title: 'Economic Modeling',
    description: 'Comprehensive economic impact analysis for policy decisions and strategic planning.',
    color: 'text-success-400'
  },
  {
    icon: Users,
    title: 'Collaborative Analysis',
    description: 'Team-based strategy development with shared workspaces and expert consultation.',
    color: 'text-error-400'
  }
];

const stats = [
  { label: 'Prediction Accuracy', value: '87%' },
  { label: 'Global Regions Covered', value: '195' },
  { label: 'Active Users', value: '12.5K' },
  { label: 'Crisis Events Predicted', value: '2,847' }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 via-transparent to-secondary-900/20" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-secondary-600/10 rounded-full blur-3xl" />
        </div>
        
        <ResponsiveContainer>
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 mb-6">
                GeoPolitik
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-neutral-300 max-w-4xl mx-auto leading-relaxed">
                The world's most advanced platform combining game theory education with 
                real-time geopolitical prediction and strategic analysis
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link to="/dashboard">
                <Button size="lg" className="group">
                  Explore Platform
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
              <Link to="/tutorials">
                <Button variant="outline" size="lg">
                  Start Learning
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-neutral-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <ResponsiveContainer>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-100 mb-6">
              Advanced Intelligence Platform
            </h2>
            <p className="text-lg sm:text-xl text-neutral-400 max-w-3xl mx-auto">
              Harness the power of game theory, AI prediction, and real-time intelligence 
              to make strategic decisions with confidence
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card hover className="p-6 sm:p-8 h-full">
                    <div className="flex items-center mb-4">
                      <div className={`p-3 rounded-lg bg-neutral-800/50 ${feature.color} mr-4`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold text-neutral-100">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-neutral-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </ResponsiveContainer>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <ResponsiveContainer>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card gradient className="p-8 sm:p-12 lg:p-16">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 rounded-full bg-primary-600/20">
                    <Zap className="h-8 w-8 text-primary-400" />
                  </div>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-100 mb-6">
                  Ready to Transform Your Strategic Analysis?
                </h2>
                <p className="text-lg sm:text-xl text-neutral-300 mb-8 leading-relaxed">
                  Join thousands of analysts, policymakers, and researchers who rely on 
                  GeoPolitik for critical decision-making in an uncertain world.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/dashboard">
                    <Button size="lg" className="group">
                      Get Started Now
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </Button>
                  </Link>
                  <Link to="/risk-assessment">
                    <Button variant="outline" size="lg">
                      View Live Demo
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </ResponsiveContainer>
      </section>
    </div>
  );
}