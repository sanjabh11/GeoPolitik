import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { RateLimiter } from './utils/rate-limiter';
import { WebhookManager } from './utils/webhook-manager';

export interface GeoPolitikConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  rateLimit?: {
    maxRequests?: number;
    windowMs?: number;
  };
}

export interface RiskAssessmentParams {
  region: string;
  factors?: string[];
  timeframe?: string;
}

export interface RiskAssessmentResponse {
  region: string;
  risk_score: number;
  confidence: number;
  factors: string[];
  predictions: any[];
  last_updated: string;
}

export interface GameTheoryParams {
  scenario: string;
  actors: string[];
  parameters?: Record<string, any>;
}

export interface GameTheoryResponse {
  nash_equilibrium: any[];
  payoff_matrix: any;
  strategic_insights: string[];
}

export interface HistoricalPatternParams {
  region?: string;
  type?: string;
  timeframe?: string;
}

export interface HistoricalPatternResponse {
  patterns: any[];
  events: any[];
  confidence_scores: Record<string, number>;
}

export class GeoPolitikSDK {
  private client: AxiosInstance;
  private rateLimiter: RateLimiter;
  private webhookManager: WebhookManager;

  constructor(config: GeoPolitikConfig) {
    this.client = axios.create({
      baseURL: config.baseURL || 'https://api.geopolitik.app/v1',
      timeout: config.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    this.rateLimiter = new RateLimiter(config.rateLimit);
    this.webhookManager = new WebhookManager(this.client);

    // Add request interceptor for rate limiting
    this.client.interceptors.request.use(async (config) => {
      await this.rateLimiter.checkLimit();
      return config;
    });

    // Add response interceptor for rate limit headers
    this.client.interceptors.response.use((response) => {
      const rateLimitHeaders = {
        limit: response.headers['x-ratelimit-limit'],
        remaining: response.headers['x-ratelimit-remaining'],
        reset: response.headers['x-ratelimit-reset'],
      };
      
      // Store rate limit info
      this.rateLimiter.updateLimit(rateLimitHeaders);
      
      return response;
    });
  }

  /**
   * Get risk assessment for a specific region
   */
  async getRiskAssessment(params: RiskAssessmentParams): Promise<RiskAssessmentResponse> {
    try {
      const response: AxiosResponse<RiskAssessmentResponse> = await this.client.get('/risk-assessment', {
        params,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Analyze game theory scenarios
   */
  async analyzeGameTheory(params: GameTheoryParams): Promise<GameTheoryResponse> {
    try {
      const response: AxiosResponse<GameTheoryResponse> = await this.client.post('/game-theory/analyze', params);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get historical conflict patterns
   */
  async getHistoricalPatterns(params: HistoricalPatternParams): Promise<HistoricalPatternResponse> {
    try {
      const response: AxiosResponse<HistoricalPatternResponse> = await this.client.get('/historical-patterns', {
        params,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Subscribe to webhook events
   */
  async subscribeToWebhook(webhookUrl: string, events: string[], secret?: string): Promise<any> {
    return this.webhookManager.subscribe(webhookUrl, events, secret);
  }

  /**
   * Unsubscribe from webhook events
   */
  async unsubscribeFromWebhook(webhookId: string): Promise<any> {
    return this.webhookManager.unsubscribe(webhookId);
  }

  /**
   * Get webhook status
   */
  async getWebhookStatus(webhookId: string): Promise<any> {
    return this.webhookManager.getStatus(webhookId);
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'API request failed';
      
      switch (status) {
        case 400:
          return new Error(`Bad Request: ${message}`);
        case 401:
          return new Error('Unauthorized: Invalid API key');
        case 429:
          return new Error('Rate limit exceeded');
        case 500:
          return new Error('Internal server error');
        default:
          return new Error(`API Error: ${message}`);
      }
    } else if (error.request) {
      return new Error('Network error: Unable to reach API');
    } else {
      return new Error(`Request error: ${error.message}`);
    }
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus() {
    return this.rateLimiter.getStatus();
  }
}

// Default export
export default GeoPolitikSDK;

// Named exports for TypeScript
export {
  GeoPolitikSDK,
  type GeoPolitikConfig,
  type RiskAssessmentParams,
  type RiskAssessmentResponse,
  type GameTheoryParams,
  type GameTheoryResponse,
  type HistoricalPatternParams,
  type HistoricalPatternResponse,
};
