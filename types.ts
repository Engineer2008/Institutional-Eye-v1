
export type MarketType = 'SPOT' | 'PERP';
export type ForensicStyle = 'TACTICAL' | 'CLINICAL' | 'RAW_DATA' | 'AXIOM_FOCUS' | 'ZEN_STREAM';
export type ForensicTheme = 'NEURAL_BLUE' | 'KINETIC_AMBER' | 'TERMINAL_GREEN' | 'SYNTH_PURPLE';

export interface TradeData {
  p: string; // Price
  q: string; // Quantity
  T: number; // Timestamp
  m: boolean; // Is Buyer the Market Maker?
}

export interface OrderBookData {
  b: [string, string][]; 
  a: [string, string][];
  u: number;
}

export type MarketRegime = 'ABSORPTION' | 'DISTRIBUTION' | 'ROTATION' | 'MANIPULATION' | 'NEUTRAL' | 'ACCUMULATION';
export type VolatilityState = 'LOW' | 'NORMAL' | 'HIGH' | 'EXPANSION' | 'EXTREME' | 'MEDIUM';

export interface GlobalStrategicState {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  liquidityIndex: number;
  cvd: number;           
  rotationBeta: number;  
  trend: 'UP' | 'DOWN' | 'SIDEWAYS';
  volatility: VolatilityState;
  lastUpdate: number;
}

export interface MarketSignal {
  id: string;
  symbol: string;
  type: 'HIDDEN_BUY' | 'HIDDEN_SELL';
  price: number;
  size: number;
  threshold: number;
  intensity: number;
  confidence: number;
  timestamp: number;
  time?: string;
}

export interface ForensicReport extends MarketSignal {
  interpretation: string;
  action: 'LONG_SCALP' | 'SHORT_SCALP' | 'WAIT';
  confidenceScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  intentSignature: 'RELOADING' | 'EXHAUSTION' | 'SPOOF_TRAP' | 'ABSORPTION' | 'MOMENTUM_BLOCK' | 'WASH_FLOW';
}

export interface ForensicData {
  id: string;
  symbol: string;
  type: 'DISPLACEMENT' | 'ABSORPTION' | 'ROTATION' | 'TWAP_DETECTION' | 'HIDDEN_BUY' | 'HIDDEN_SELL';
  price: number;
  size: number;
  intensity: number;
  timestamp: number;
  time: string;
  interpretation: string;
  action: 'LONG' | 'SHORT' | 'MONITOR' | 'WAIT';
  risk: 'LOW' | 'MED' | 'HIGH';
  spoofRisk: number;
  detectionLayer: 'L2_DEPTH' | 'CORRELATION' | 'TAPE_SIGNATURE' | 'AI_CORE';
  threshold: number;
  confidence: number;
  integrity: number;
  latencyMs?: number;
  traceId: string;
}

export interface WhaleSignal {
  id: string;
  time: string;
  type: 'INSTITUTIONAL' | 'ALGO' | 'ICEBERG' | 'WHALE';
  side: 'BUY' | 'SELL';
  price: number;
  valueUSD: number;
  isLiquidationLikely?: boolean;
}

export interface ChartPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  price: number; // Current/Close price for legacy compat
  cvd: number;
  rotationBeta: number;
  volume: number;
  macd?: number;
  macdSignal?: number;
  macdHist?: number;
  rsi?: number;
}

export interface IcebergSignal {
  id: string;
  type: 'HIDDEN_BUY' | 'HIDDEN_SELL';
  price: number;
  volAbsorbed: number;
  thresholdAtTime: number;
  timestamp: number;
}

export interface SmartSignal {
  id: string;
  time: string;
  type: string;
  confidence: number;
  note: string;
}

export type SystemStatus = 'LEARNING' | 'ACTIVE' | 'DEGRADED';

export interface ForensicZone {
  type: 'BUY' | 'SELL';
  priceStart: number;
  priceEnd: number;
  label: string;
  targets?: number[];
  invalidation?: number;
}

export interface ForensicWall {
  price: number;
  side: 'BID' | 'ASK';
  strength: number;
}

export interface DynamicMarketState {
  currentPrice: number;
  volatility: VolatilityState;
  regime: MarketRegime;
  adaptiveWhaleThreshold: number;
  avgTradeVol: number;
  status?: SystemStatus;
}

export interface IntelligenceReport {
  id: string;
  timestamp: number;
  structuralAnalysis: string;
  anomalies: string[];
  bias: 'BULLish' | 'BEARish' | 'NEUTRAL';
  liquidityDelta: number;
}

export interface ToxicityMetrics {
  score: number; // 0-1
  bucketVolume: number;
  imbalance: number;
}

export interface VolumeCluster {
  price: number;
  volume: number;
  hits: number;
  lastSeen: number;
}

export interface SweepSignal {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  levelsSwept: number;
  totalVolume: number;
  timestamp: number;
}

export interface GlobalLiquidityState {
  binanceDelta: number;
  coinbaseDelta: number;
  bybitDelta: number;
}

export type SubscriptionTier = 'FREE' | 'PRO' | 'ELITE';
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'PENDING';

export interface UserSubscription {
  telegramId: string;
  username: string;
  expiryDate: string; // ISO Date
  joinDate: string; // ISO Date
  tier: SubscriptionTier;
  status: SubscriptionStatus;
}

export interface PaymentRecord {
  transactionId: string;
  userId: string;
  amountUsdt: number;
  network: 'TRC20' | 'ERC20';
  status: 'CONFIRMED' | 'FAILED';
  timestamp: string;
}

export interface Transaction {
  hash: string;
  impact: number;
  isSell: boolean;
  value: number;
}

export interface MempoolToxicityReport {
  status: 'STABLE' | 'HIGH_ALERT';
  reason?: string;
  estimatedPriceImpact?: number;
}

export interface UserSettings {
  privacyLevel: 'STEALTH' | 'PUBLIC';
  maxSlippage: number;
}

export interface RoutingConfig {
  rpc: string;
  useMevShare: boolean;
  priorityFee: string;
  label: "STEALTH_EXECUTION" | "HIGH_SPEED_PUBLIC";
}

export interface ArbOpportunity {
  token: string;
  sourceChain: string;
  targetChain: string;
  sourcePrice: number;
  targetPrice: number;
  isProfitable: boolean;
  expectedROI: number;
  route: string;
  timestamp: number;
}

export interface Position {
  asset: string;
  collateralUSD: number;
  debtUSD: number;
}

export interface PortfolioHealthReport {
  status: 'STABLE' | 'WARNING' | 'DANGER';
  score: string;
  actionRequired: string;
}

export type SwarmPersona = 'FORENSIC_SCIENTIST' | 'AGGRESSIVE_DEGEN' | 'HEDGE_FUND_MANAGER';
export type AgentID = 'ANALYST' | 'SENTINEL' | 'NEGOTIATOR' | 'CORE_OS' | 'SCIENTIST' | 'SCAVENGER';

export interface SwarmConfig {
  currentPersona: SwarmPersona;
  overrides: {
    maxDrawdown: number;
    mevProtection: 'MAXIMUM' | 'MINIMUM' | 'ADAPTIVE';
    yieldPreference: 'LOW_RISK_STABLES' | 'HIGH_YIELD_DEFI' | 'DIRECTIONAL_BETA';
  }
}

export interface InvestmentGoal {
  strategy: 'SCALP' | 'ARBITRAGE' | 'HEDGE';
  riskTolerance: 'LOW' | 'MED' | 'HIGH';
  targetSymbol: string;
}

export interface SwarmMessage {
  agent: AgentID;
  content: string;
  timestamp: number;
}

export interface AgenticAction {
  type: 'MARKET_BUY' | 'LIMIT_LADDER' | 'BRIDGE' | 'REPAY' | 'WAIT';
  payload: any;
}

export interface AgenticPlan {
  strategy: string;
  actions: AgenticAction[];
  isSafe: boolean;
  riskReasoning?: string;
  conviction?: number;
}

export interface TradeIntent {
  symbol: string;
  action: string;
  quantity: number;
  reasoning: string;
  hash: string;
}

export interface AgentVote {
  agent: AgentID;
  score: number; // 0-1
  weight: number;
  reason: string;
}

export interface ConsensusResult {
  status: 'APPROVED' | 'REJECTED';
  executionPath?: 'MEV_SHIELD' | 'STANDARD_ROUTING';
  reason?: string;
  votes?: AgentVote[];
  weightedScore?: number;
}

export interface TradeLog {
  id: string;
  primaryAgent: AgentID;
  outcome: 'PROFIT' | 'LOSS';
  context: any; // Raw market state at time of trade
  pnlUSD: number;
  timestamp: number;
}

export interface LogicGap {
  flaw: string;
  heuristicUpdate: string;
}

export interface SwarmHealthState {
  confidence: number;
  actualPnL: number;
  driftScore: number;
  status: 'OPTIMAL' | 'EMERGENCY_STOP';
  stopReason?: string;
}

export interface GlobalIntent {
  id: string;
  asset: string;
  amount: number;
  type: 'SOLVENCY_BRIDGE' | 'LIQUIDITY_HARVEST' | 'ATOMIC_COMPOSITE';
  targetChains: string[];
  timestamp: number;
}

export interface IntentSettlementStatus {
  intentId: string;
  proofHash: string;
  chainStates: Record<string, 'PENDING' | 'VERIFIED' | 'SETTLED'>;
  finalityStatus: 'INITIATING' | 'EXECUTING' | 'SETTLED' | 'FAILED';
  latencyMs: number;
}

export interface PrivateID {
  id: string;
  isAccredited: boolean;
  isOnBlocklist: boolean;
  secretKey: string;
}

export interface ZKComplianceProof {
  proof: string;
  timestamp: number;
  status: 'VERIFIED' | 'FAILED';
}

export interface AuditorAccessGrant {
  portalUrl: string;
  instructions: string;
  viewKeyId: string;
  expiry: number;
}

export interface DAOProposal {
  id: string;
  title: string;
  description: string;
  category: 'LIQUIDITY' | 'SECURITY' | 'PARAMETER_UPDATE';
  timestamp: number;
}

export interface DAOImpactReport {
  score: number; // Impact Score (-1.0 to 1.0)
  reasoning: string;
  suggestedVote: 'FOR' | 'AGAINST' | 'ABSTAIN';
}

export interface GovernanceResult {
  status: 'VOTED' | 'ABSTAINED' | 'FAILED';
  reason?: string;
  voteCast?: 'FOR' | 'AGAINST';
  ballotHash?: string;
}

export interface PlanetaryState {
  planet: 'EARTH' | 'MARS' | 'LUNAR_BASE';
  blockHeight: number;
  merkleRoot: string;
  timestamp: number;
}

export interface InterstellarTransmission {
  id: string;
  destination: string;
  payload: string; // The stateProof
  status: 'PROVING' | 'TRANSMITTING' | 'RECONCILING' | 'SETTLED';
  eta: number; // Duration in seconds
  signalStrength: number; // 0-1
}

export interface FutureScenario {
  year: number;
  planetaryHealth: number; // 0-1
  civilizationalImpact: number; // 0-1
  narrative: string;
}

export interface CenturyImpactReport {
  id: string;
  scenarios: FutureScenario[];
  sustainablePath: FutureScenario | null;
  zkProof: string;
  finalityStatus: 'PROJECTING' | 'RECONCILING' | 'COMMITTED' | 'FAILED';
}

export interface CivilizationalIntent {
  id: string;
  jouleRequirement: number;
  action: string;
  targetNode: string;
  timestamp: number;
}

export interface InterstellarTradeResult {
  status: 'DISPATCHED' | 'SETTLED' | 'RELATIVISTIC_DELAY' | 'FAILED';
  energyProof: string;
  lightDistanceMs: number;
  timeDilationOffset: number;
  eta: number;
}

export interface RelativisticState {
  properTime: number;      // Δt
  dilatedTime: number;     // Δt'
  lorentzFactor: number;   // γ
  relativeVelocity: number; // v (m/s)
  cPercent: number;        // v/c
}

export interface CongruenceState {
  isCongruent: boolean;
  opportunity: 'ARBITRAGE_DETECTED' | 'SYNCHRONIZED';
  intensity: number;
  spreadPercent: number;
}

export interface CivilizationalGoal {
  id: string;
  name: string;
  targetCoordinates: string;
  jouleRequirement: number;
  ethicalJustification: string;
}

export interface StellarAllocationResult {
  status: 'BEAM_ACTIVE' | 'SETTLED' | 'ETHICAL_REJECTION' | 'FAILED';
  allocatedJoules: number;
  shellEfficiency: number;
  zkProof: string;
  target: string;
}

export interface GalacticIntent {
  id: string;
  sourceID: string;
  targetID: string;
  targetCoordinates: string;
  joules: number;
  reasoning: string;
}

export interface GalacticCouncilConsensus {
  approved: boolean;
  quorumTally: number; // 0-100
  clinicalNarrative: string;
  zkProof: string;
}

export interface GalacticDispatchResult {
  status: 'TRANSIT_LOCKED' | 'SWAP_COMPLETE' | 'CURVATURE_FAILURE' | 'REJECTED';
  transactionHash: string;
  manifoldProof: string;
  energyShift: number;
  latencyMicros: number;
}

export interface MultiverseState {
  intentID: string;
  desiredOutcome: string;
  probabilityFloor: number;
}

export interface StabilityProof {
  valid: boolean;
  proofHash: string;
  universalSkew: number;
}

export interface OmegaBridgeResult {
  status: 'COLLAPSED' | 'SYNCHRONIZING' | 'DIVERGENT' | 'FAILED';
  targetTimelineID: string;
  stabilityProof: StabilityProof;
  energyDelta: number;
}

export interface CivilizationalWill {
  id: string;
  constraints: string[];
  intentTarget: string;
}

export interface OmniAuthorityProof {
  authorized: boolean;
  metaHash: string;
  sovereigntyLevel: number; // 0-1.0
}

export interface OmniInstantiatorResult {
  status: 'REALITY_FORGED' | 'STABLE' | 'DEGRADED' | 'UNAUTHORIZED';
  axioms: string[];
  substrate: string;
  identityPreserved: boolean;
  omniHash: string;
}

export interface CivilizationalWisdom {
  projectLegacy: string;
  finalConvictionScore: number;
  institutionalMemory: string[];
}

export interface GenesisSeed {
  id: string;
  optimizedPhysics: Record<string, number>;
  heritageHash: string;
}

export interface GenesisResult {
  status: 'IGNITED' | 'NULL_POINT_LOCKED' | 'BIG_BANG_SETTLED' | 'FAILED';
  universeID: string;
  seed: GenesisSeed;
  entropyState: number;
}
