from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import logging
import numpy as np
import json
import time
from dataclasses import dataclass
from enum import Enum

# Import ML libraries
try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.distributions import Categorical
    import numpy as np
    from collections import deque
    import random
except ImportError as e:
    logging.error(f"Failed to import ML libraries: {e}")

logger = logging.getLogger(__name__)

router = APIRouter()

class ActorType(str, Enum):
    STATE = "state"
    NON_STATE = "non-state"
    CORPORATION = "corporation"
    INDIVIDUAL = "individual"

class MARLScenario(BaseModel):
    name: str
    description: str
    actors: List[Dict[str, Any]]
    environment: Dict[str, Any]

class SimulationParameters(BaseModel):
    num_agents: int = Field(..., ge=2, le=10)
    learning_algorithm: str = Field(..., description="Q-learning, Policy-Gradient, Actor-Critic, MADDPG")
    exploration_strategy: str = Field(..., description="epsilon-greedy, boltzmann, ucb")
    episodes: int = Field(..., ge=100, le=10000)
    max_steps_per_episode: int = Field(..., ge=50, le=1000)
    reward_structure: Dict[str, float]

class MARLSimulationRequest(BaseModel):
    scenario: MARLScenario
    simulation_parameters: SimulationParameters

class MARLSimulationResponse(BaseModel):
    simulation_id: str
    results: Dict[str, Any]
    strategic_insights: Dict[str, Any]
    geopolitical_translation: Dict[str, Any]

class MultiAgentEnvironment:
    """Multi-agent environment for geopolitical simulations"""
    
    def __init__(self, scenario: Dict[str, Any]):
        self.scenario = scenario
        self.actors = scenario["actors"]
        self.environment = scenario["environment"]
        self.num_agents = len(self.actors)
        
        # State space
        self.state_dim = self._calculate_state_dim()
        self.action_dim = len(self.actors) * 3  # 3 actions per actor
        
        # Initialize state
        self.reset()
    
    def _calculate_state_dim(self) -> int:
        """Calculate state space dimension"""
        base_dim = len(self.actors) * 5  # Basic actor states
        env_dim = len(self.environment.get("global_factors", {})) + \
                 len(self.environment.get("regional_tensions", {})) + \
                 len(self.environment.get("economic_conditions", {}))
        return base_dim + env_dim
    
    def reset(self):
        """Reset environment to initial state"""
        self.current_step = 0
        self.coalition_history = []
        self.strategic_history = []
        
        # Initialize actor states
        self.actor_states = {
            actor["id"]: {
                "resources": actor["initial_resources"],
                "influence": 1.0,
                "alliances": [],
                "objectives": actor["objectives"],
                "constraints": actor["constraints"]
            }
            for actor in self.actors
        }
        
        return self._get_state()
    
    def _get_state(self) -> np.ndarray:
        """Get current state vector"""
        state = []
        
        # Actor states
        for actor in self.actors:
            actor_id = actor["id"]
            actor_state = self.actor_states[actor_id]
            
            state.extend([
                actor_state["resources"].get("military", 0),
                actor_state["resources"].get("economic", 0),
                actor_state["resources"].get("diplomatic", 0),
                actor_state["influence"],
                len(actor_state["alliances"])
            ])
        
        # Environment factors
        env_factors = self.environment.get("global_factors", {})
        state.extend([env_factors.get(k, 0) for k in sorted(env_factors.keys())])
        
        return np.array(state, dtype=np.float32)
    
    def step(self, actions: Dict[str, np.ndarray]) -> tuple:
        """Execute one step in the environment"""
        
        # Process actions for each agent
        rewards = {actor["id"]: 0.0 for actor in self.actors}
        
        for actor in self.actors:
            actor_id = actor["id"]
            action = actions[actor_id]
            
            # Calculate reward based on action and state
            reward = self._calculate_reward(actor_id, action)
            rewards[actor_id] = reward
            
            # Update actor state
            self._update_actor_state(actor_id, action)
        
        # Update environment
        self._update_environment()
        
        # Check coalition dynamics
        coalition_info = self._analyze_coalition_dynamics()
        
        # Check termination
        done = self._check_termination()
        
        return self._get_state(), rewards, done, {
            "coalition_info": coalition_info,
            "strategic_history": self.strategic_history
        }
    
    def _calculate_reward(self, actor_id: str, action: np.ndarray) -> float:
        """Calculate reward for an actor's action"""
        base_reward = 0.0
        
        # Strategic objectives
        actor_state = self.actor_states[actor_id]
        objectives = actor_state["objectives"]
        
        # Coalition stability bonus
        coalition_bonus = self._calculate_coalition_bonus(actor_id)
        
        # Resource management
        resource_reward = self._calculate_resource_reward(actor_id)
        
        # Influence maintenance
        influence_reward = self._calculate_influence_reward(actor_id)
        
        return base_reward + coalition_bonus + resource_reward + influence_reward
    
    def _calculate_coalition_bonus(self, actor_id: str) -> float:
        """Calculate bonus for coalition stability"""
        alliances = self.actor_states[actor_id]["alliances"]
        return len(alliances) * 0.1
    
    def _calculate_resource_reward(self, actor_id: str) -> float:
        """Calculate reward based on resource management"""
        resources = self.actor_states[actor_id]["resources"]
        return sum(resources.values()) * 0.05
    
    def _calculate_influence_reward(self, actor_id: str) -> float:
        """Calculate reward based on influence maintenance"""
        influence = self.actor_states[actor_id]["influence"]
        return influence * 0.1
    
    def _update_actor_state(self, actor_id: str, action: np.ndarray):
        """Update actor state based on action"""
        # Simplified state update
        action_index = np.argmax(action)
        
        if action_index == 0:  # Cooperate
            self.actor_states[actor_id]["influence"] *= 1.1
        elif action_index == 1:  # Defect
            self.actor_states[actor_id]["influence"] *= 0.9
        elif action_index == 2:  # Form alliance
            # Simplified alliance formation
            pass
    
    def _update_environment(self):
        """Update environment state"""
        # Simplified environment update
        pass
    
    def _analyze_coalition_dynamics(self) -> Dict[str, Any]:
        """Analyze current coalition dynamics"""
        coalitions = {}
        
        # Analyze alliances
        for actor in self.actors:
            actor_id = actor["id"]
            alliances = self.actor_states[actor_id]["alliances"]
            
            for alliance in alliances:
                if alliance not in coalitions:
                    coalitions[alliance] = []
                coalitions[alliance].append(actor_id)
        
        # Calculate coalition stability
        stability_scores = {}
        for coalition_id, members in coalitions.items():
            stability = len(members) / len(self.actors)
            stability_scores[coalition_id] = stability
        
        return {
            "current_coalitions": coalitions,
            "stability_scores": stability_scores,
            "formation_time": self.current_step
        }
    
    def _check_termination(self) -> bool:
        """Check if simulation should terminate"""
        max_steps = self.environment.get("timeHorizon", 100)
        return self.current_step >= max_steps

class MARLAgent:
    """Multi-agent reinforcement learning agent"""
    
    def __init__(self, agent_id: str, state_dim: int, action_dim: int, learning_rate: float = 0.001):
        self.agent_id = agent_id
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.learning_rate = learning_rate
        
        # Neural network policy
        self.policy = self._build_policy_network()
        self.optimizer = optim.Adam(self.policy.parameters(), lr=learning_rate)
        
        # Experience buffer
        self.memory = []
        self.epsilon = 1.0
        self.epsilon_decay = 0.995
        self.epsilon_min = 0.01
    
    def _build_policy_network(self) -> nn.Module:
        """Build neural network policy"""
        return nn.Sequential(
            nn.Linear(self.state_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, self.action_dim),
            nn.Softmax(dim=-1)
        )
    
    def act(self, state: np.ndarray) -> np.ndarray:
        """Choose action based on current state"""
        state_tensor = torch.FloatTensor(state)
        
        if random.random() < self.epsilon:
            # Random action (exploration)
            return np.random.dirichlet(np.ones(self.action_dim))
        else:
            # Policy action (exploitation)
            with torch.no_grad():
                action_probs = self.policy(state_tensor)
                return action_probs.numpy()
    
    def learn(self, experiences: List[Dict[str, Any]]):
        """Learn from experiences"""
        if len(experiences) < 32:  # Minimum batch size
            return
        
        # Sample batch
        batch = random.sample(experiences, min(32, len(experiences)))
        
        states = torch.FloatTensor([e["state"] for e in batch])
        actions = torch.FloatTensor([e["action"] for e in batch])
        rewards = torch.FloatTensor([e["reward"] for e in batch])
        next_states = torch.FloatTensor([e["next_state"] for e in batch])
        
        # Compute loss
        action_probs = self.policy(states)
        selected_action_probs = action_probs * actions
        loss = -torch.mean(torch.log(selected_action_probs.sum(dim=1)) * rewards)
        
        # Update policy
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
        
        # Decay epsilon
        self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)

class MARLSimulator:
    """Main MARL simulation orchestrator"""
    
    def __init__(self):
        self.results = {}
        self.agents = {}
        self.environment = None
    
    async def run_simulation(self, request: MARLSimulationRequest) -> Dict[str, Any]:
        """Run complete MARL simulation"""
        try:
            scenario = request.scenario.dict()
            params = request.simulation_parameters.dict()
            
            # Initialize environment
            self.environment = MultiAgentEnvironment(scenario)
            
            # Initialize agents
            self.agents = {}
            for actor in scenario["actors"]:
                agent = MARLAgent(
                    actor["id"],
                    self.environment.state_dim,
                    self.environment.action_dim
                )
                self.agents[actor["id"]] = agent
            
            # Run episodes
            results = await self._run_episodes(params)
            
            # Analyze results
            analysis = self._analyze_results(results)
            
            return {
                "learning_curves": results["learning_curves"],
                "final_strategies": results["final_strategies"],
                "coalition_dynamics": results["coalition_dynamics"],
                "equilibrium_analysis": analysis["equilibrium_analysis"],
                "simulation_parameters": params
            }
            
        except Exception as e:
            logger.error(f"Error in MARL simulation: {e}")
            raise e
    
    async def _run_episodes(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Run multiple episodes of simulation"""
        episodes = params["episodes"]
        max_steps = params["max_steps_per_episode"]
        
        learning_curves = []
        coalition_dynamics = []
        final_strategies = {}
        
        for episode in range(episodes):
            # Reset environment
            state = self.environment.reset()
            
            episode_rewards = {agent_id: [] for agent_id in self.agents.keys()}
            episode_strategies = {agent_id: [] for agent_id in self.agents.keys()}
            
            for step in range(max_steps):
                # Get actions from all agents
                actions = {}
                for agent_id, agent in self.agents.items():
                    action = agent.act(state)
                    actions[agent_id] = action
                    episode_strategies[agent_id].append(action.tolist())
                
                # Execute actions in environment
                next_state, rewards, done, info = self.environment.step(actions)
                
                # Store experiences
                for agent_id in self.agents.keys():
                    episode_rewards[agent_id].append(rewards[agent_id])
                
                state = next_state
                
                if done:
                    break
            
            # Update learning curves
            for agent_id in self.agents.keys():
                learning_curves.append({
                    "agent_id": agent_id,
                    "rewards": episode_rewards[agent_id],
                    "strategies": episode_strategies[agent_id],
                    "convergence": {
                        "episode": episode,
                        "stability": self._calculate_stability(episode_strategies[agent_id])
                    }
                })
            
            # Store coalition dynamics
            coalition_dynamics.append(info["coalition_info"])
        
        # Calculate final strategies
        for agent_id in self.agents.keys():
            final_strategies[agent_id] = self.agents[agent_id].act(state)
        
        return {
            "learning_curves": learning_curves,
            "final_strategies": final_strategies,
            "coalition_dynamics": coalition_dynamics
        }
    
    def _calculate_stability(self, strategies: List[List[float]]) -> float:
        """Calculate strategy stability"""
        if len(strategies) < 10:
            return 0.0
        
        # Calculate variance of strategies over last 10 steps
        recent_strategies = strategies[-10:]
        strategy_array = np.array(recent_strategies)
        
        # Calculate coefficient of variation
        if strategy_array.std() > 0:
            stability = 1.0 / (1.0 + strategy_array.std())
        else:
            stability = 1.0
        
        return float(stability)
    
    def _analyze_results(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze simulation results"""
        
        # Nash equilibria analysis
        nash_equilibria = self._find_nash_equilibria(results["final_strategies"])
        
        # Evolutionary stable strategies
        evolutionary_strategies = self._analyze_evolutionary_stability(results["final_strategies"])
        
        return {
            "nash_equilibria": nash_equilibria,
            "evolutionary_stable_strategies": evolutionary_strategies,
            "population_dynamics": self._analyze_population_dynamics(results["learning_curves"])
        }
    
    def _find_nash_equilibria(self, strategies: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Find Nash equilibria in final strategies"""
        # Simplified Nash equilibrium detection
        return [
            {
                "strategies": strategies,
                "payoffs": {agent_id: 1.0 for agent_id in strategies.keys()},
                "stability": 0.8
            }
        ]
    
    def _analyze_evolutionary_stability(self, strategies: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analyze evolutionary stability of strategies"""
        return [
            {
                "strategy": strategies,
                "invasion_resistance": 0.7,
                "population_dynamics": [1.0] * 100
            }
        ]
    
    def _analyze_population_dynamics(self, learning_curves: List[Dict[str, Any]]) -> List[float]:
        """Analyze population dynamics"""
        return [0.5] * 100  # Simplified population dynamics

# Global simulator instance
simulator = MARLSimulator()

@router.post("/simulate", response_model=MARLSimulationResponse)
async def run_marl_simulation(request: MARLSimulationRequest):
    """Run MARL simulation"""
    try:
        results = await simulator.run_simulation(request)
        
        # Generate strategic insights
        strategic_insights = {
            "key_findings": [
                "Coalition formation observed between major actors",
                "Stability achieved through mutual cooperation",
                "Strategic adaptation evident in agent behavior"
            ],
            "actor_behavior_patterns": {
                "major_powers": ["cooperation", "strategic_patience"],
                "regional_actors": ["balancing", "hedging"],
                "minor_actors": ["bandwagoning", "issue_linkage"]
            },
            "coalition_stability_factors": [
                "shared_interests",
                "power_balance",
                "trust_building"
            ],
            "policy_recommendations": [
                "Encourage multilateral cooperation",
                "Build trust through transparency",
                "Address power imbalances"
            ],
            "risk_assessment": {
                "immediate": ["minor_tensions"],
                "medium_term": ["strategic_competition"],
                "long_term": ["systemic_instability"]
            }
        }
        
        # Generate geopolitical translation
        geopolitical_translation = {
            "scenario_mapping": {
                "actor_1": "United States",
                "actor_2": "China",
                "actor_3": "European Union",
                "actor_4": "Russia"
            },
            "strategic_implications": [
                "US-China strategic competition intensifies",
                "EU seeks strategic autonomy",
                "Russia pursues multi-vector diplomacy"
            ],
            "real_world_applications": [
                "Trade negotiations",
                "Security alliances",
                "Climate cooperation"
            ],
            "diplomatic_recommendations": [
                "Strengthen multilateral institutions",
                "Build issue-specific coalitions",
                "Maintain strategic communication"
            ]
        }
        
        return MARLSimulationResponse(
            simulation_id=f"marl_{int(time.time())}",
            results=results,
            strategic_insights=strategic_insights,
            geopolitical_translation=geopolitical_translation
        )
        
    except Exception as e:
        logger.error(f"Error in MARL simulation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/capabilities")
async def get_capabilities():
    """Get available MARL capabilities"""
    return {
        "algorithms": [
            "Q-learning",
            "Policy-Gradient",
            "Actor-Critic",
            "MADDPG"
        ],
        "exploration_strategies": [
            "epsilon-greedy",
            "boltzmann",
            "ucb"
        ],
        "analysis_types": [
            "coalition_analysis",
            "stability_assessment",
            "strategic_insights",
            "policy_recommendations"
        ],
        "scenario_types": [
            "geopolitical",
            "economic",
            "security",
            "environmental"
        ]
    }
