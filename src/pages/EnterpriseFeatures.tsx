import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  Shield, 
  Users, 
  Settings, 
  Briefcase,
  Globe,
  PieChart,
  BarChart3,
  Layers,
  Code,
  Puzzle,
  Zap,
  CheckCircle,
  Lock
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../components/AuthProvider';
import { useToast } from '../hooks/useToast';

interface EnterpriseFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'available' | 'coming_soon' | 'beta';
  enterprise_only: boolean;
}

export default function EnterpriseFeatures() {
  const [activeTab, setActiveTab] = useState<'features' | 'sso' | 'branding' | 'api'>('features');
  const { user } = useAuth();
  const { showToast } = useToast();

  const enterpriseFeatures: EnterpriseFeature[] = [
    {
      id: '1',
      name: 'Single Sign-On (SSO)',
      description: 'Enterprise-grade authentication with SAML, OIDC, and Active Directory integration',
      icon: Shield,
      status: 'available',
      enterprise_only: true
    },
    {
      id: '2',
      name: 'Advanced Analytics',
      description: 'Comprehensive usage metrics, performance tracking, and ROI measurement',
      icon: BarChart3,
      status: 'available',
      enterprise_only: true
    },
    {
      id: '3',
      name: 'Custom Branding',
      description: 'White-label solution with custom colors, logos, and domain names',
      icon: Briefcase,
      status: 'available',
      enterprise_only: true
    },
    {
      id: '4',
      name: 'API Marketplace',
      description: 'Third-party integrations and plugin ecosystem for extended functionality',
      icon: Puzzle,
      status: 'beta',
      enterprise_only: true
    },
    {
      id: '5',
      name: 'Team Management',
      description: 'Advanced user roles, permissions, and organizational hierarchy',
      icon: Users,
      status: 'available',
      enterprise_only: true
    },
    {
      id: '6',
      name: 'Custom Model Training',
      description: 'Train specialized AI models on your organization\'s unique data',
      icon: Zap,
      status: 'coming_soon',
      enterprise_only: true
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return <Badge variant="success">Available</Badge>;
      case 'beta': return <Badge variant="warning">Beta</Badge>;
      case 'coming_soon': return <Badge variant="info">Coming Soon</Badge>;
      default: return <Badge variant="default">Unknown</Badge>;
    }
  };

  const handleUpgradeClick = () => {
    showToast('info', 'Enterprise Upgrade', 'Contact sales@geopolitik.app for enterprise pricing');
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
                Enterprise Features
              </h1>
              <p className="text-neutral-400">
                Advanced capabilities for organizations and teams
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button onClick={handleUpgradeClick}>
                <Building className="h-4 w-4 mr-2" />
                Upgrade to Enterprise
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
              { id: 'features', label: 'Features Overview', icon: Layers },
              { id: 'sso', label: 'Single Sign-On', icon: Shield },
              { id: 'branding', label: 'Custom Branding', icon: Briefcase },
              { id: 'api', label: 'API Marketplace', icon: Code }
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
          {activeTab === 'features' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enterpriseFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.id} className="p-6" hover>
                    <div className="flex items-center mb-4">
                      <div className="p-3 rounded-lg bg-neutral-800/50 text-primary-400 mr-4">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-100">
                          {feature.name}
                        </h3>
                        <div className="mt-1">
                          {getStatusBadge(feature.status)}
                        </div>
                      </div>
                    </div>
                    <p className="text-neutral-400 mb-4">
                      {feature.description}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={handleUpgradeClick}
                    >
                      Learn More
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}

          {activeTab === 'sso' && (
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-lg bg-neutral-800/50 text-primary-400 mr-4">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-100">
                    Single Sign-On Integration
                  </h2>
                  <div className="mt-1">
                    <Badge variant="success">Enterprise Feature</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-neutral-400">
                  Streamline authentication and enhance security with enterprise-grade SSO integration. Connect your existing identity provider for seamless access management.
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-neutral-800/20 rounded-lg text-center">
                    <div className="mx-auto w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center mb-3">
                      <span className="text-neutral-300 font-medium">A</span>
                    </div>
                    <div className="font-medium text-neutral-200 mb-1">SAML 2.0</div>
                    <div className="text-xs text-neutral-500">Industry standard</div>
                  </div>
                  <div className="p-4 bg-neutral-800/20 rounded-lg text-center">
                    <div className="mx-auto w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center mb-3">
                      <span className="text-neutral-300 font-medium">O</span>
                    </div>
                    <div className="font-medium text-neutral-200 mb-1">OIDC</div>
                    <div className="text-xs text-neutral-500">Modern protocol</div>
                  </div>
                  <div className="p-4 bg-neutral-800/20 rounded-lg text-center">
                    <div className="mx-auto w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center mb-3">
                      <span className="text-neutral-300 font-medium">AD</span>
                    </div>
                    <div className="font-medium text-neutral-200 mb-1">Active Directory</div>
                    <div className="text-xs text-neutral-500">Microsoft integration</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-success-400" />
                    <span className="text-neutral-300">Centralized user management</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-success-400" />
                    <span className="text-neutral-300">Automatic user provisioning</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-success-400" />
                    <span className="text-neutral-300">Role-based access control</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-success-400" />
                    <span className="text-neutral-300">Multi-factor authentication</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-700">
                  <Button onClick={handleUpgradeClick} className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Configure SSO
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'branding' && (
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-lg bg-neutral-800/50 text-primary-400 mr-4">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-100">
                    Custom Branding
                  </h2>
                  <div className="mt-1">
                    <Badge variant="success">Enterprise Feature</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-neutral-400">
                  Create a seamless experience for your team with custom branding options. Apply your organization's visual identity to the platform.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-neutral-200">Brand Elements</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-neutral-800/20 rounded-lg">
                        <span className="text-neutral-300">Logo</span>
                        <Button variant="outline" size="sm" onClick={handleUpgradeClick}>
                          Upload
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-neutral-800/20 rounded-lg">
                        <span className="text-neutral-300">Color Scheme</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-primary-500"></div>
                          <div className="w-6 h-6 rounded-full bg-secondary-500"></div>
                          <div className="w-6 h-6 rounded-full bg-accent-500"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-neutral-800/20 rounded-lg">
                        <span className="text-neutral-300">Custom Domain</span>
                        <Badge variant="info">Available</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-neutral-200">White-Label Options</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-neutral-800/20 rounded-lg">
                        <span className="text-neutral-300">Remove GeoPolitik Branding</span>
                        <Badge variant="success">Included</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-neutral-800/20 rounded-lg">
                        <span className="text-neutral-300">Custom Email Templates</span>
                        <Badge variant="success">Included</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-neutral-800/20 rounded-lg">
                        <span className="text-neutral-300">Custom PDF Reports</span>
                        <Badge variant="success">Included</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-700">
                  <Button onClick={handleUpgradeClick} className="w-full">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Configure Branding
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'api' && (
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-lg bg-neutral-800/50 text-primary-400 mr-4">
                  <Code className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-100">
                    API Marketplace
                  </h2>
                  <div className="mt-1">
                    <Badge variant="warning">Beta Feature</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-neutral-400">
                  Extend platform capabilities with third-party integrations and custom plugins. Connect to your existing tools and data sources.
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-neutral-800/20 rounded-lg border border-neutral-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-neutral-200">Data Connectors</h3>
                      <Badge variant="success" size="sm">Available</Badge>
                    </div>
                    <p className="text-sm text-neutral-500 mb-3">
                      Connect to external data sources and APIs
                    </p>
                    <div className="space-y-1 text-xs text-neutral-400">
                      <div>• Bloomberg</div>
                      <div>• Reuters</div>
                      <div>• World Bank</div>
                      <div>• Custom APIs</div>
                    </div>
                  </div>
                  <div className="p-4 bg-neutral-800/20 rounded-lg border border-neutral-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-neutral-200">Integrations</h3>
                      <Badge variant="success" size="sm">Available</Badge>
                    </div>
                    <p className="text-sm text-neutral-500 mb-3">
                      Connect with your existing tools
                    </p>
                    <div className="space-y-1 text-xs text-neutral-400">
                      <div>• Slack</div>
                      <div>• Microsoft Teams</div>
                      <div>• Jira</div>
                      <div>• Salesforce</div>
                    </div>
                  </div>
                  <div className="p-4 bg-neutral-800/20 rounded-lg border border-neutral-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-neutral-200">Custom Plugins</h3>
                      <Badge variant="warning" size="sm">Beta</Badge>
                    </div>
                    <p className="text-sm text-neutral-500 mb-3">
                      Develop custom functionality
                    </p>
                    <div className="space-y-1 text-xs text-neutral-400">
                      <div>• Custom Visualizations</div>
                      <div>• Specialized Models</div>
                      <div>• Workflow Automation</div>
                      <div>• Data Processors</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-neutral-800/20 rounded-lg">
                  <h3 className="font-medium text-neutral-200 mb-3">API Documentation</h3>
                  <div className="bg-neutral-900 rounded p-3 font-mono text-xs text-neutral-300 mb-3 overflow-x-auto">
                    <pre>GET /api/v1/risk-assessment?region=eastern-europe&factors=military,economic</pre>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleUpgradeClick}>
                    <Code className="h-4 w-4 mr-2" />
                    View Full Documentation
                  </Button>
                </div>

                <div className="pt-4 border-t border-neutral-700">
                  <Button onClick={handleUpgradeClick} className="w-full">
                    <Code className="h-4 w-4 mr-2" />
                    Access API Marketplace
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}