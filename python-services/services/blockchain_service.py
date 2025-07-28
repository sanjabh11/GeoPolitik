"""
Blockchain Integration Service
Decentralized game theory applications, smart contracts, and blockchain-based game mechanics
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Query, Body
import uuid
import json
import logging
from datetime import datetime
from enum import Enum
import asyncio
import hashlib
from decimal import Decimal

logger = logging.getLogger(__name__)

class BlockchainType(str, Enum):
    ETHEREUM = "ethereum"
    POLYGON = "polygon"
    BINANCE_SMART_CHAIN = "binance_smart_chain"
    AVALANCHE = "avalanche"
    SOLANA = "solana"
    NEAR = "near"

class SmartContractType(str, Enum):
    GAME_THEORY = "game_theory"
    NASH_EQUILIBRIUM = "nash_equilibrium"
    COALITION_DYNAMICS = "coalition_dynamics"
    AUCTION_MECHANISM = "auction_mechanism"
    VOTING_SYSTEM = "voting_system"
    PREDICTION_MARKET = "prediction_market"

class TransactionStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    FAILED = "failed"
    MINED = "mined"

class BlockchainRequest(BaseModel):
    user_id: str
    blockchain_type: BlockchainType
    smart_contract_type: SmartContractType
    game_parameters: Dict[str, Any]
    participants: List[str]
    stake_amount: Optional[float] = 0.0
    timeout_blocks: Optional[int] = 100

class SmartContract(BaseModel):
    id: str
    address: str
    contract_type: SmartContractType
    blockchain_type: BlockchainType
    game_parameters: Dict[str, Any]
    participants: List[str]
    stake_amount: float
    status: str
    transaction_hash: Optional[str] = None
    created_at: str
    deployed_at: Optional[str] = None
    last_interaction: Optional[str] = None

class BlockchainTransaction(BaseModel):
    id: str
    contract_id: str
    transaction_hash: str
    from_address: str
    to_address: str
    amount: float
    gas_used: Optional[int] = None
    gas_price: Optional[float] = None
    status: TransactionStatus
    block_number: Optional[int] = None
    timestamp: str

class GameState(BaseModel):
    contract_id: str
    current_state: Dict[str, Any]
    player_moves: Dict[str, Any]
    equilibrium_state: Optional[Dict[str, Any]] = None
    final_payoffs: Optional[Dict[str, float]] = None
    is_complete: bool
    winner: Optional[str] = None

class BlockchainService:
    def __init__(self):
        self.contracts: Dict[str, SmartContract] = {}
        self.transactions: Dict[str, BlockchainTransaction] = {}
        self.game_states: Dict[str, GameState] = {}
        self.supported_blockchains = {
            BlockchainType.ETHEREUM: {
                "chain_id": 1,
                "rpc_url": "https://mainnet.infura.io/v3/YOUR_PROJECT_ID",
                "gas_token": "ETH",
                "avg_gas_price": 20  # gwei
            },
            BlockchainType.POLYGON: {
                "chain_id": 137,
                "rpc_url": "https://polygon-rpc.com",
                "gas_token": "MATIC",
                "avg_gas_price": 30  # gwei
            },
            BlockchainType.BINANCE_SMART_CHAIN: {
                "chain_id": 56,
                "rpc_url": "https://bsc-dataseed.binance.org",
                "gas_token": "BNB",
                "avg_gas_price": 5  # gwei
            },
            BlockchainType.AVALANCHE: {
                "chain_id": 43114,
                "rpc_url": "https://api.avax.network/ext/bc/C/rpc",
                "gas_token": "AVAX",
                "avg_gas_price": 25  # nAVAX
            },
            BlockchainType.SOLANA: {
                "chain_id": "mainnet-beta",
                "rpc_url": "https://api.mainnet-beta.solana.com",
                "gas_token": "SOL",
                "avg_gas_price": 0.00025  # SOL
            },
            BlockchainType.NEAR: {
                "chain_id": "mainnet",
                "rpc_url": "https://rpc.mainnet.near.org",
                "gas_token": "NEAR",
                "avg_gas_price": 0.0001  # NEAR
            }
        }

    async def deploy_smart_contract(self, request: BlockchainRequest) -> SmartContract:
        """Deploy a new smart contract for game theory applications"""
        
        contract_id = str(uuid.uuid4())
        
        # Generate contract address (mock)
        contract_address = self._generate_contract_address(
            request.blockchain_type, 
            request.smart_contract_type
        )
        
        contract = SmartContract(
            id=contract_id,
            address=contract_address,
            contract_type=request.smart_contract_type,
            blockchain_type=request.blockchain_type,
            game_parameters=request.game_parameters,
            participants=request.participants,
            stake_amount=request.stake_amount,
            status="deploying",
            created_at=datetime.utcnow().isoformat()
        )
        
        self.contracts[contract_id] = contract
        
        # Simulate deployment process
        asyncio.create_task(self._deploy_contract_async(contract_id))
        
        return contract

    async def _deploy_contract_async(self, contract_id: str):
        """Simulate async contract deployment"""
        
        if contract_id not in self.contracts:
            return
        
        contract = self.contracts[contract_id]
        contract.status = "deploying"
        
        try:
            # Simulate deployment time
            await asyncio.sleep(2)
            
            # Generate mock transaction hash
            transaction_hash = self._generate_transaction_hash(contract_id)
            contract.transaction_hash = transaction_hash
            contract.deployed_at = datetime.utcnow().isoformat()
            contract.status = "deployed"
            
            # Initialize game state
            await self._initialize_game_state(contract_id)
            
        except Exception as e:
            contract.status = "failed"
            logger.error(f"Contract deployment failed: {e}")

    def _generate_contract_address(self, blockchain_type: BlockchainType, contract_type: SmartContractType) -> str:
        """Generate mock contract address"""
        
        prefixes = {
            BlockchainType.ETHEREUM: "0x",
            BlockchainType.POLYGON: "0x",
            BlockchainType.BINANCE_SMART_CHAIN: "0x",
            BlockchainType.AVALANCHE: "0x",
            BlockchainType.SOLANA: "",
            BlockchainType.NEAR: ""
        }
        
        prefix = prefixes.get(blockchain_type, "0x")
        random_hash = hashlib.sha256(f"{blockchain_type}_{contract_type}_{datetime.utcnow()}".encode()).hexdigest()[:40]
        
        return f"{prefix}{random_hash}"

    def _generate_transaction_hash(self, contract_id: str) -> str:
        """Generate mock transaction hash"""
        return hashlib.sha256(f"tx_{contract_id}_{datetime.utcnow()}".encode()).hexdigest()

    async def _initialize_game_state(self, contract_id: str):
        """Initialize game state for smart contract"""
        
        if contract_id not in self.contracts:
            return
        
        contract = self.contracts[contract_id]
        
        game_state = GameState(
            contract_id=contract_id,
            current_state={"phase": "initialization", "round": 0},
            player_moves={player: None for player in contract.participants},
            is_complete=False
        )
        
        self.game_states[contract_id] = game_state

    async def submit_move(self, contract_id: str, player_address: str, move: Dict[str, Any]) -> BlockchainTransaction:
        """Submit a move to the smart contract"""
        
        if contract_id not in self.contracts:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        contract = self.contracts[contract_id]
        
        if contract.status != "deployed":
            raise HTTPException(status_code=400, detail="Contract not deployed")
        
        transaction_id = str(uuid.uuid4())
        transaction_hash = self._generate_transaction_hash(f"move_{contract_id}_{player_address}")
        
        transaction = BlockchainTransaction(
            id=transaction_id,
            contract_id=contract_id,
            transaction_hash=transaction_hash,
            from_address=player_address,
            to_address=contract.address,
            amount=0.0,  # Move submission doesn't require payment
            status=TransactionStatus.PENDING,
            timestamp=datetime.utcnow().isoformat()
        )
        
        self.transactions[transaction_id] = transaction
        
        # Update game state
        if contract_id in self.game_states:
            game_state = self.game_states[contract_id]
            game_state.player_moves[player_address] = move
            game_state.current_state["last_move"] = player_address
            
            # Check if game is complete
            await self._check_game_completion(contract_id)
        
        # Simulate transaction confirmation
        asyncio.create_task(self._confirm_transaction(transaction_id))
        
        return transaction

    async def _check_game_completion(self, contract_id: str):
        """Check if game is complete and calculate final payoffs"""
        
        if contract_id not in self.game_states:
            return
        
        game_state = self.game_states[contract_id]
        contract = self.contracts[contract_id]
        
        # Mock game completion logic
        all_moves_submitted = all(move is not None for move in game_state.player_moves.values())
        
        if all_moves_submitted or len(game_state.player_moves) >= len(contract.participants):
            game_state.is_complete = True
            game_state.final_payoffs = await self._calculate_payoffs(contract_id)
            game_state.equilibrium_state = await self._determine_equilibrium(contract_id)

    async def _calculate_payoffs(self, contract_id: str) -> Dict[str, float]:
        """Calculate final payoffs based on game outcome"""
        
        contract = self.contracts[contract_id]
        game_state = self.game_states[contract_id]
        
        # Mock payoff calculation based on game theory
        payoffs = {}
        total_stake = contract.stake_amount
        
        for player in contract.participants:
            # Simulate game outcome
            performance = np.random.uniform(0, 1)
            payoff = total_stake * performance * np.random.uniform(0.5, 1.5)
            payoffs[player] = payoff
        
        return payoffs

    async def _determine_equilibrium(self, contract_id: str) -> Dict[str, Any]:
        """Determine Nash equilibrium or other game equilibrium"""
        
        # Mock equilibrium determination
        return {
            "type": "nash_equilibrium",
            "strategies": {player: f"strategy_{i}" for i, player in enumerate(self.contracts[contract_id].participants)},
            "stability": np.random.uniform(0.7, 1.0),
            "efficiency": np.random.uniform(0.6, 1.0)
        }

    async def _confirm_transaction(self, transaction_id: str):
        """Simulate transaction confirmation"""
        
        await asyncio.sleep(1)  # Simulate blockchain confirmation time
        
        if transaction_id in self.transactions:
            transaction = self.transactions[transaction_id]
            transaction.status = TransactionStatus.CONFIRMED
            transaction.block_number = np.random.randint(1000000, 9999999)

    async def get_contract_state(self, contract_id: str) -> GameState:
        """Get current state of smart contract game"""
        
        if contract_id not in self.game_states:
            raise HTTPException(status_code=404, detail="Game state not found")
        
        return self.game_states[contract_id]

    async def get_contract_details(self, contract_id: str) -> SmartContract:
        """Get smart contract details"""
        
        if contract_id not in self.contracts:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        return self.contracts[contract_id]

    async def list_contracts(self, user_id: Optional[str] = None, blockchain_type: Optional[BlockchainType] = None) -> List[SmartContract]:
        """List smart contracts"""
        
        contracts = list(self.contracts.values())
        
        if user_id:
            contracts = [c for c in contracts if user_id in c.participants]
        
        if blockchain_type:
            contracts = [c for c in contracts if c.blockchain_type == blockchain_type]
        
        return contracts

    async def get_transactions(self, contract_id: Optional[str] = None, limit: int = 50) -> List[BlockchainTransaction]:
        """Get blockchain transactions"""
        
        transactions = list(self.transactions.values())
        
        if contract_id:
            transactions = [t for t in transactions if t.contract_id == contract_id]
        
        return transactions[:limit]

    async def get_blockchain_analytics(self, blockchain_type: Optional[BlockchainType] = None) -> Dict[str, Any]:
        """Get blockchain analytics and statistics"""
        
        contracts = list(self.contracts.values())
        transactions = list(self.transactions.values())
        
        if blockchain_type:
            contracts = [c for c in contracts if c.blockchain_type == blockchain_type]
            transactions = [t for t in transactions if t.contract_id in [c.id for c in contracts]]
        
        return {
            "total_contracts": len(contracts),
            "total_transactions": len(transactions),
            "total_value_locked": sum(c.stake_amount for c in contracts),
            "active_contracts": len([c for c in contracts if c.status == "deployed"]),
            "success_rate": len([t for t in transactions if t.status == TransactionStatus.CONFIRMED]) / max(len(transactions), 1),
            "blockchain_distribution": {
                bt.value: len([c for c in contracts if c.blockchain_type == bt]) 
                for bt in BlockchainType
            },
            "contract_type_distribution": {
                ct.value: len([c for c in contracts if c.contract_type == ct])
                for ct in SmartContractType
            }
        }

    async def estimate_gas_cost(self, blockchain_type: BlockchainType, operation: str) -> Dict[str, float]:
        """Estimate gas cost for blockchain operations"""
        
        gas_estimates = {
            BlockchainType.ETHEREUM: {
                "deploy_contract": 3000000,
                "submit_move": 50000,
                "claim_reward": 80000
            },
            BlockchainType.POLYGON: {
                "deploy_contract": 2000000,
                "submit_move": 30000,
                "claim_reward": 50000
            },
            BlockchainType.BINANCE_SMART_CHAIN: {
                "deploy_contract": 2500000,
                "submit_move": 40000,
                "claim_reward": 60000
            },
            BlockchainType.AVALANCHE: {
                "deploy_contract": 2200000,
                "submit_move": 35000,
                "claim_reward": 55000
            },
            BlockchainType.SOLANA: {
                "deploy_contract": 1500000,
                "submit_move": 25000,
                "claim_reward": 40000
            },
            BlockchainType.NEAR: {
                "deploy_contract": 1800000,
                "submit_move": 30000,
                "claim_reward": 45000
            }
        }
        
        blockchain_info = self.supported_blockchains.get(blockchain_type, {})
        avg_gas_price = blockchain_info.get("avg_gas_price", 20)
        
        gas_used = gas_estimates.get(blockchain_type, {}).get(operation, 100000)
        estimated_cost = (gas_used * avg_gas_price) / 1e9  # Convert to native token
        
        return {
            "estimated_gas": gas_used,
            "estimated_cost": estimated_cost,
            "blockchain": blockchain_type.value,
            "gas_token": blockchain_info.get("gas_token", "UNKNOWN")
        }

# FastAPI router
router = APIRouter(prefix="/blockchain", tags=["blockchain"])
service = BlockchainService()

@router.post("/contracts", response_model=SmartContract)
async def deploy_smart_contract(request: BlockchainRequest):
    """Deploy a new smart contract"""
    return await service.deploy_smart_contract(request)

@router.get("/contracts/{contract_id}", response_model=SmartContract)
async def get_contract_details(contract_id: str):
    """Get smart contract details"""
    return await service.get_contract_details(contract_id)

@router.get("/contracts")
async def list_contracts(
    user_id: Optional[str] = Query(None),
    blockchain_type: Optional[BlockchainType] = Query(None)
):
    """List smart contracts"""
    return await service.list_contracts(user_id, blockchain_type)

@router.post("/contracts/{contract_id}/moves")
async def submit_move(
    contract_id: str,
    player_address: str = Query(...),
    move: Dict[str, Any] = Body(...)
):
    """Submit a move to smart contract"""
    return await service.submit_move(contract_id, player_address, move)

@router.get("/contracts/{contract_id}/state", response_model=GameState)
async def get_contract_state(contract_id: str):
    """Get current state of smart contract game"""
    return await service.get_contract_state(contract_id)

@router.get("/transactions")
async def get_transactions(
    contract_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100)
):
    """Get blockchain transactions"""
    return await service.get_transactions(contract_id, limit)

@router.get("/analytics")
async def get_blockchain_analytics(
    blockchain_type: Optional[BlockchainType] = Query(None)
):
    """Get blockchain analytics and statistics"""
    return await service.get_blockchain_analytics(blockchain_type)

@router.get("/gas-estimate")
async def estimate_gas_cost(
    blockchain_type: BlockchainType = Query(...),
    operation: str = Query(...)
):
    """Estimate gas cost for blockchain operations"""
    return await service.estimate_gas_cost(blockchain_type, operation)

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
