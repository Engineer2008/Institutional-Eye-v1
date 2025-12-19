
import { GoogleGenAI } from "@google/genai";
import { 
  InvestmentGoal, 
  SwarmMessage, 
  AgenticPlan, 
  AgenticAction,
  PortfolioHealthReport,
  MempoolToxicityReport,
  ArbOpportunity,
  CongruenceState,
  SwarmPersona,
  TradeIntent,
  AgentVote,
  ConsensusResult,
  AgentID,
  TradeLog,
  LogicGap,
  SwarmHealthState
} from "../types";
import { SWARM_CONFIG } from "../constants";

// v5.0 Logic: Agent reasoning based on Persona
export const agentReasoning = (plan: { conviction: number }, persona: SwarmPersona) => {
  if (persona === 'AGGRESSIVE_DEGEN') {
    return plan.conviction > 0.65; // High aggression
  }
  return plan.conviction > 0.90; // Standard Forensic caution
};

/**
 * v5.0 Perception Aggregator: Gathers cross-layer data
 */
export const aggregatePerception = async () => {
  return {
    volatility: 'HIGH',
    mempool: { status: 'STABLE' } as MempoolToxicityReport,
    portfolio: { score: '1.42', status: 'WARNING' } as PortfolioHealthReport,
    arbitrage: [] as ArbOpportunity[],
    congruence: { spreadPercent: 0.002 } as CongruenceState,
    timestamp: Date.now()
  };
};

/**
 * v5.0 Logic: Multi-Agent Interaction Loop
 */
export class AgenticSwarmEngine {
  private messages: SwarmMessage[] = [];
  private onUpdate: (msg: SwarmMessage) => void;
  private onConsensus: (res: ConsensusResult) => void;
  private onHealthUpdate: (health: SwarmHealthState) => void;
  
  private safetyStatus: 'OPTIMAL' | 'EMERGENCY_STOP' = 'OPTIMAL';
  private currentActualPnL: number = 0;
  private driftScore: number = 0;

  // Persistence for learned heuristics (Logic Gaps)
  private learnedHeuristics: Record<AgentID, string[]> = {
    'ANALYST': [],
    'SENTINEL': [],
    'NEGOTIATOR': [],
    'CORE_OS': [],
    'SCIENTIST': [],
    'SCAVENGER': []
  };

  constructor(
    onUpdate: (msg: SwarmMessage) => void, 
    onConsensus: (res: ConsensusResult) => void,
    onHealthUpdate: (health: SwarmHealthState) => void
  ) {
    this.onUpdate = onUpdate;
    this.onConsensus = onConsensus;
    this.onHealthUpdate = onHealthUpdate;
  }

  private log(agent: AgentID, content: string) {
    const msg = { agent, content, timestamp: Date.now() };
    this.messages.push(msg);
    this.onUpdate(msg);
  }

  /**
   * v5.0 Safety Logic: The Logic Kill-Switch
   */
  public monitorAgentHealth(state: Partial<SwarmHealthState>) {
    const { confidence = 0.5, actualPnL = 0, driftScore = 0 } = state;
    const MAX_DRIFT_THRESHOLD = 0.85;

    // 1. Check for Confidence-Performance Gap (Overfitting)
    if (confidence > 0.90 && actualPnL < -0.02) {
      return this.triggerEmergencyStop("OVERFITTING_DETECTED_CONFIDENCE_MISMATCH");
    }

    // 2. Check for Statistical Drift (Model Integrity)
    if (driftScore > MAX_DRIFT_THRESHOLD) {
      return this.triggerEmergencyStop("MODEL_DRIFT_EXCEEDS_SAFETY_LIMITS");
    }

    this.onHealthUpdate({ 
      confidence, 
      actualPnL, 
      driftScore, 
      status: 'OPTIMAL' 
    });
    return { status: 'OPTIMAL' };
  }

  private triggerEmergencyStop(reason: string) {
    this.safetyStatus = 'EMERGENCY_STOP';
    this.log('CORE_OS', `CRITICAL_SAFETY_VIOLATION: ${reason}`);
    this.log('CORE_OS', "ENGAGING_LOGIC_KILL_SWITCH. ALL_AUTONOMOUS_OPERATIONS_HALTED.");
    
    this.onHealthUpdate({ 
      confidence: 0, 
      actualPnL: this.currentActualPnL, 
      driftScore: this.driftScore, 
      status: 'EMERGENCY_STOP', 
      stopReason: reason 
    });

    return { status: 'EMERGENCY_STOP', reason };
  }

  /**
   * v5.0 Recursive Learning: Reflection & Correction
   */
  public async reflectOnExperience(tradeHistory: TradeLog[]) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    for (const log of tradeHistory) {
      this.currentActualPnL += log.pnlUSD / 10000; // Simulated PnL change
      
      if (log.outcome === 'LOSS') {
        this.log('CORE_OS', `Self-Correction Routine Initiated for Trade ID: ${log.id}`);
        
        const prompt = `
          Perform a Recursive Reasoning Reflection on a FAILED trade.
          AGENT: ${log.primaryAgent}
          CONTEXT_AT_TIME: ${JSON.stringify(log.context)}
          OUTCOME: LOSS of $${Math.abs(log.pnlUSD)}
          
          You must identify the 'Reasoning Flaw' (Logic Gap) that led to this loss.
          Return JSON only: 
          {
            "flaw": "Specific clinical description of the reasoning error",
            "heuristicUpdate": "A new instruction to prevent this error in future cycles"
          }
        `;

        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
          });

          const reflection: LogicGap = JSON.parse(response.text || '{}');
          
          if (reflection.flaw && reflection.heuristicUpdate) {
            this.learnedHeuristics[log.primaryAgent].push(reflection.heuristicUpdate);
            this.log('CORE_OS', `Agent ${log.primaryAgent} heuristic updated: ${reflection.heuristicUpdate}`);
          }
        } catch (err) {
          console.error('[RECURSIVE_LEARNING_FAIL]', err);
        }
      }
    }
  }

  /**
   * v5.0 Consensus Logic: The Swarm Vote
   */
  public async initiateConsensus(proposedTrade: TradeIntent): Promise<ConsensusResult> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.log('CORE_OS', "Initiating Decentralized Swarm Consensus...");

    const agents: { id: AgentID, weight: number, prompt: string }[] = [
      { id: 'SENTINEL', weight: 0.25, prompt: "You are the Sentinel Risk Agent. Audit this trade for liquidation risk and delta exposure." },
      { id: 'SCIENTIST', weight: 0.30, prompt: "You are the Scientist. Audit for statistical significance and variance anomalies." },
      { id: 'SCAVENGER', weight: 0.15, prompt: "You are the Scavenger. Audit for MEV rebates and gas efficiency." },
      { id: 'ANALYST', weight: 0.30, prompt: "You are the Analyst. Audit for order flow trend alignment." }
    ];

    const votePromises = agents.map(async (agent) => {
      const heuristics = this.learnedHeuristics[agent.id].join('; ');
      const systemContext = heuristics ? `LEARNED_LESSONS: ${heuristics}` : '';

      const resp = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `${agent.prompt}\n${systemContext}\nPROPOSED_TRADE: ${JSON.stringify(proposedTrade)}\nReturn JSON only: {"score": number (0-1.0), "reason": "string"}`,
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(resp.text || '{"score": 0.5, "reason": "System error"}');
      return { agent: agent.id, score: data.score, weight: agent.weight, reason: data.reason } as AgentVote;
    });

    const votes = await Promise.all(votePromises);

    const totalWeightedVote = votes.reduce((sum, v) => sum + (v.score * v.weight), 0);
    const hasVeto = votes.some(v => v.agent === 'SENTINEL' && v.score < 0.2);

    const result: ConsensusResult = {
      status: (totalWeightedVote >= 0.75 && !hasVeto) ? 'APPROVED' : 'REJECTED',
      executionPath: 'MEV_SHIELD',
      reason: hasVeto ? 'RISK_VETO' : totalWeightedVote < 0.75 ? 'INSUFFICIENT_QUORUM' : 'CONSENSUS_REACHED',
      votes,
      weightedScore: totalWeightedVote
    };

    votes.forEach(v => this.log(v.agent, `Vote: ${(v.score * 100).toFixed(0)}% // ${v.reason}`));
    this.onConsensus(result);
    return result;
  }

  public async startAgenticSwarm(goal: InvestmentGoal) {
    if (this.safetyStatus === 'EMERGENCY_STOP') {
      this.log('CORE_OS', "ABORT: Swarm is in EMERGENCY_STOP state. Manual reset required.");
      return null;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const persona = SWARM_CONFIG.currentPersona;
    
    this.log('CORE_OS', `Swarm Loop Initialized. Target: ${goal.targetSymbol} // Persona: ${persona}`);

    // 1. Perception
    this.log('CORE_OS', "Gathering sensory data...");
    const marketState = await aggregatePerception();
    
    // Safety Update
    this.driftScore += 0.05; // Simulate minor drift
    this.monitorAgentHealth({ 
      confidence: 0.85, 
      actualPnL: this.currentActualPnL, 
      driftScore: this.driftScore 
    });

    await new Promise(r => setTimeout(r, 1000));

    // 2. Reasoning (Analyst proposes)
    this.log('ANALYST', `Synthesizing strategy for ${goal.targetSymbol}...`);
    
    const prompt = `
      You are the Head Analyst. PERSONA: ${persona}. GOAL: ${JSON.stringify(goal)}. STATE: ${JSON.stringify(marketState)}.
      Propose a trade intent. JSON only: {"strategy": "string", "actions": [{"type": "MARKET_BUY", "payload": {"qty": number}}], "intent": {"symbol": "string", "action": "string", "quantity": number, "reasoning": "string"}}
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const plan = JSON.parse(response.text || '{}');
      this.log('ANALYST', `Proposed Intent: ${plan.strategy}`);

      // 3. Consensus Vote
      const consensus = await this.initiateConsensus(plan.intent);

      // 4. Execution & Simulated Outcome
      if (consensus.status === 'APPROVED') {
        this.log('NEGOTIATOR', `Consensus reached (${(consensus.weightedScore! * 100).toFixed(0)}%). Routing via MEV_SHIELD...`);
        
        await new Promise(r => setTimeout(r, 2000));
        
        // Final Safety Check before "Execution"
        const healthCheck = this.monitorAgentHealth({ 
          confidence: consensus.weightedScore, 
          actualPnL: this.currentActualPnL, 
          driftScore: this.driftScore 
        });

        if (healthCheck.status === 'EMERGENCY_STOP') return null;

        this.log('CORE_OS', "Cycle settled. Executing trade simulation...");
        
        const outcome: 'PROFIT' | 'LOSS' = Math.random() > 0.3 ? 'PROFIT' : 'LOSS';
        const log: TradeLog = {
          id: `T-${Date.now()}`,
          primaryAgent: 'ANALYST',
          outcome,
          context: marketState,
          pnlUSD: outcome === 'LOSS' ? -350.00 : 450.00,
          timestamp: Date.now()
        };

        if (outcome === 'LOSS') {
           this.log('CORE_OS', "WARNING: Outcome NEGATIVE. Engaging Recursive Learning.");
           await this.reflectOnExperience([log]);
        } else {
           this.log('CORE_OS', "Outcome POSITIVE. Reinforcing winning policy.");
        }

      } else {
        this.log('CORE_OS', `Trade aborted: ${consensus.reason}`);
      }

      return plan;
    } catch (err) {
      this.log('CORE_OS', "Swarm reasoning failure. Reverting to manual safety.");
      return null;
    }
  }

  public resetSafety() {
    this.safetyStatus = 'OPTIMAL';
    this.driftScore = 0;
    this.log('CORE_OS', "MANUAL_SAFETY_RESET: Systems primed for operation.");
    this.onHealthUpdate({ 
      confidence: 0.5, 
      actualPnL: this.currentActualPnL, 
      driftScore: 0, 
      status: 'OPTIMAL' 
    });
  }
}
