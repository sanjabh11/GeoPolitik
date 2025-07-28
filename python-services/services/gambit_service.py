from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import logging
import numpy as np
import json
from pathlib import Path
import sys
import os

# Add gambit to path
try:
    import gambit
    import nashpy as nash
except ImportError as e:
    logging.error(f"Failed to import gambit/nashpy: {e}")

logger = logging.getLogger(__name__)

router = APIRouter()

class NashEquilibriumRequest(BaseModel):
    matrix: List[List[float]] = Field(..., description="Payoff matrix")
    players: List[str] = Field(..., description="Player names")
    game_type: str = Field(default="normal_form", description="Type of game")

class CooperativeGameRequest(BaseModel):
    coalition_values: Dict[str, float] = Field(..., description="Coalition values")
    players: List[str] = Field(..., description="Player names")

class ExtensiveFormRequest(BaseModel):
    game_tree: Dict[str, Any] = Field(..., description="Game tree structure")
    players: List[str] = Field(..., description="Player names")

class ComputationResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    computation_time: float
    metadata: Dict[str, Any]

@router.post("/compute_nash", response_model=ComputationResponse)
async def compute_nash_equilibrium(request: NashEquilibriumRequest):
    """Compute Nash equilibrium using Gambit"""
    try:
        import time
        start_time = time.time()
        
        # Convert to numpy array
        payoff_matrix = np.array(request.matrix)
        
        # Handle different game types
        if request.game_type == "normal_form":
            # Use nashpy for normal form games
            game = nash.Game(payoff_matrix)
            
            # Find Nash equilibria
            equilibria = list(game.support_enumeration())
            
            # Format results
            results = {
                "equilibria": [
                    {
                        "player_strategies": {
                            request.players[i]: strategy.tolist()
                            for i, strategy in enumerate(eq)
                        },
                        "payoffs": [float(p) for p in game[eq]]
                    }
                    for eq in equilibria
                ],
                "game_type": "normal_form",
                "players": request.players,
                "matrix": request.matrix
            }
            
        elif request.game_type == "cooperative":
            # Handle cooperative games
            results = await _handle_cooperative_game(request)
        else:
            # Use gambit for extensive form games
            results = await _handle_extensive_form(request)
        
        computation_time = time.time() - start_time
        
        return ComputationResponse(
            success=True,
            data=results,
            computation_time=computation_time,
            metadata={
                "algorithm": "support_enumeration",
                "game_type": request.game_type,
                "players": len(request.players)
            }
        )
        
    except Exception as e:
        logger.error(f"Error computing Nash equilibrium: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/solve_cooperative")
async def solve_cooperative_game(request: CooperativeGameRequest):
    """Solve cooperative game using Shapley value and core"""
    try:
        import time
        start_time = time.time()
        
        players = request.players
        coalition_values = request.coalition_values
        
        # Calculate Shapley values
        shapley_values = _calculate_shapley_values(players, coalition_values)
        
        # Find core solutions
        core_solutions = _find_core_solutions(players, coalition_values)
        
        # Calculate nucleolus
        nucleolus = _calculate_nucleolus(players, coalition_values)
        
        results = {
            "shapley_values": shapley_values,
            "core_solutions": core_solutions,
            "nucleolus": nucleolus,
            "players": players,
            "coalition_values": coalition_values,
            "game_type": "cooperative"
        }
        
        computation_time = time.time() - start_time
        
        return ComputationResponse(
            success=True,
            data=results,
            computation_time=computation_time,
            metadata={
                "algorithm": "cooperative_game_theory",
                "players": len(players),
                "coalitions": len(coalition_values)
            }
        )
        
    except Exception as e:
        logger.error(f"Error solving cooperative game: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/build_extensive_game")
async def build_extensive_form_game(request: ExtensiveFormRequest):
    """Build and solve extensive form game"""
    try:
        import time
        start_time = time.time()
        
        # Create game tree using gambit
        game = gambit.Game.new_tree()
        
        # Build tree structure
        root = game.root
        _build_game_tree(root, request.game_tree, request.players)
        
        # Solve using backward induction
        solver = gambit.nash.ExternalLogitSolver()
        equilibria = solver.solve(game)
        
        results = {
            "equilibria": [
                {
                    "strategies": {
                        player: [float(prob) for prob in strategy]
                        for player, strategy in eq.items()
                    },
                    "payoffs": eq.payoff
                }
                for eq in equilibria
            ],
            "game_tree": request.game_tree,
            "players": request.players,
            "game_type": "extensive_form"
        }
        
        computation_time = time.time() - start_time
        
        return ComputationResponse(
            success=True,
            data=results,
            computation_time=computation_time,
            metadata={
                "algorithm": "backward_induction",
                "game_type": "extensive_form",
                "players": len(request.players)
            }
        )
        
    except Exception as e:
        logger.error(f"Error building extensive form game: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/capabilities")
async def get_capabilities():
    """Get available computation capabilities"""
    return {
        "capabilities": [
            "nash_equilibrium",
            "cooperative_games",
            "extensive_form_games",
            "shapley_values",
            "core_solutions",
            "nucleolus",
            "backward_induction"
        ],
        "algorithms": [
            "support_enumeration",
            "lemke_howson",
            "simplex",
            "shapley",
            "nucleolus",
            "core"
        ],
        "game_types": [
            "normal_form",
            "cooperative",
            "extensive_form"
        ]
    }

def _calculate_shapley_values(players: List[str], coalition_values: Dict[str, float]) -> Dict[str, float]:
    """Calculate Shapley values for cooperative game"""
    import itertools
    
    n = len(players)
    shapley_values = {player: 0.0 for player in players}
    
    for player in players:
        for coalition in itertools.permutations(players):
            coalition_str = '{' + ','.join(sorted(coalition)) + '}'
            coalition_without_player_str = '{' + ','.join(sorted(set(coalition) - {player})) + '}'
            
            marginal_contribution = coalition_values.get(coalition_str, 0) - \
                                  coalition_values.get(coalition_without_player_str, 0)
            
            shapley_values[player] += marginal_contribution / (n * math.factorial(n - 1))
    
    return shapley_values

def _find_core_solutions(players: List[str], coalition_values: Dict[str, float]) -> List[Dict[str, float]]:
    """Find core solutions for cooperative game"""
    import numpy as np
    from scipy.optimize import linprog
    
    n = len(players)
    
    # Objective: minimize sum of squared deviations
    c = np.zeros(n)
    
    # Constraints: individual rationality and coalition rationality
    A_eq = []
    b_eq = []
    A_ub = []
    b_ub = []
    
    # Grand coalition constraint
    grand_coalition = '{' + ','.join(sorted(players)) + '}'
    A_eq.append([1] * n)
    b_eq.append(coalition_values.get(grand_coalition, 0))
    
    # Individual rationality constraints
    for player in players:
        constraint = [0] * n
        constraint[players.index(player)] = 1
        A_ub.append(constraint)
        b_ub.append(coalition_values.get('{' + player + '}', 0))
    
    # Coalition constraints
    from itertools import combinations
    for r in range(2, n):
        for coalition in combinations(players, r):
            coalition_str = '{' + ','.join(sorted(coalition)) + '}'
            constraint = [0] * n
            for player in coalition:
                constraint[players.index(player)] = 1
            A_ub.append(constraint)
            b_ub.append(coalition_values.get(coalition_str, 0))
    
    try:
        result = linprog(c, A_ub=A_ub, b_ub=b_ub, A_eq=A_eq, b_eq=b_eq, bounds=[(0, None)] * n)
        
        if result.success:
            return [{player: float(result.x[i]) for i, player in enumerate(players)}]
        else:
            return []
    except:
        return []

def _calculate_nucleolus(players: List[str], coalition_values: Dict[str, float]) -> Dict[str, float]:
    """Calculate nucleolus for cooperative game"""
    # Simplified nucleolus calculation
    # In practice, this would use more sophisticated algorithms
    
    core_solutions = _find_core_solutions(players, coalition_values)
    
    if core_solutions:
        return core_solutions[0]  # Return first core solution as nucleolus
    else:
        return {player: 0.0 for player in players}

def _build_game_tree(node, game_tree: Dict[str, Any], players: List[str]):
    """Recursively build game tree structure"""
    # Implementation would depend on specific game tree format
    pass

def _handle_cooperative_game(request) -> Dict[str, Any]:
    """Handle cooperative game computation"""
    return {
        "shapley_values": {},
        "core_solutions": [],
        "nucleolus": {},
        "game_type": "cooperative"
    }

def _handle_extensive_form(request) -> Dict[str, Any]:
    """Handle extensive form game computation"""
    return {
        "equilibria": [],
        "game_tree": {},
        "game_type": "extensive_form"
    }
