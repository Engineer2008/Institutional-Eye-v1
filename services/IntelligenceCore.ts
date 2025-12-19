
import { GoogleGenAI } from "@google/genai";
import { ForensicData, IntelligenceReport, GlobalStrategicState } from "../types";

export class IntelligenceCore {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("CRITICAL: API_KEY is missing from environment.");
    this.ai = new GoogleGenAI({ apiKey });
  }

  public async generateStrategicBriefing(
    symbol: string,
    history: ForensicData[],
    marketData: GlobalStrategicState[]
  ): Promise<IntelligenceReport> {
    const prompt = `
      Perform a clinical forensic market structural audit.
      TARGET_ASSET: ${symbol}
      TAPE_FORENSICS: ${JSON.stringify(history.slice(0, 10))}
      GLOBAL_MATRIX: ${JSON.stringify(marketData.slice(0, 5))}
      
      STRICT CONSTRAINTS:
      - USE COLD, CLINICAL TECHNICAL LANGUAGE.
      - DO NOT PROVIDE INVESTMENT ADVICE.
      - IDENTIFY SPECIFIC STRUCTURAL ANOMALIES (LIQUIDITY VOIDS, DELTA DIVERGENCE, ROTATION BETA SKEW).
      - AUDIT FOR MANIPULATION SIGNATURES IN RECENT DATA.
      - OUTPUT STRICT JSON ONLY. NO MARKDOWN.
      
      JSON_SCHEMA:
      {
        "structuralAnalysis": "Forensic technical audit summary",
        "anomalies": ["Detection 1", "Detection 2"],
        "bias": "BULLISH" | "BEARISH" | "NEUTRAL",
        "liquidityDelta": number (Net % liquidity shift detected)
      }
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 } 
        }
      });

      const data = JSON.parse(response.text || '{}');
      return {
        id: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        timestamp: Date.now(),
        structuralAnalysis: data.structuralAnalysis || "Analysis inconclusive due to data packet fragmentation.",
        anomalies: Array.isArray(data.anomalies) ? data.anomalies : ["System Syncing..."],
        bias: data.bias || "NEUTRAL",
        liquidityDelta: typeof data.liquidityDelta === 'number' ? data.liquidityDelta : 0
      };
    } catch (e) {
      return {
        id: 'FAIL',
        timestamp: Date.now(),
        structuralAnalysis: "System Desync: Forensic logic packet collision.",
        anomalies: ["Transport layer integrity compromised."],
        bias: "NEUTRAL",
        liquidityDelta: 0
      };
    }
  }
}
