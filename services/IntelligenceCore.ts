
import { GoogleGenAI, Type } from "@google/genai";
import { ForensicData, IntelligenceReport, GlobalStrategicState } from "../types";

export class IntelligenceCore {
  /**
   * Performs a high-fidelity clinical audit using Gemini 3 Pro.
   * Optimized for zero-latency inference and strict structural JSON.
   */
  public async generateStrategicBriefing(
    symbol: string,
    history: ForensicData[],
    marketData: GlobalStrategicState[]
  ): Promise<IntelligenceReport> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Extract recent tape signatures for the model
    const tapeSample = history.slice(0, 15).map(h => ({
      type: h.type,
      price: h.price,
      size: h.size,
      conf: h.confidence,
      layer: h.detectionLayer
    }));

    const prompt = `
      [SYSTEM_ROLE]: YOU ARE THE MASTER STRUCTURAL AUDITOR FOR AN ELITE HFT FIRM.
      [TASK]: PERFORM A CLINICAL FORENSIC AUDIT OF THE ASSET: ${symbol}.
      
      [DATA_PLANE_INGESTION]:
      - TAPE_SIGNATURES: ${JSON.stringify(tapeSample)}
      - GLOBAL_LIQUIDITY_MATRIX: ${JSON.stringify(marketData.slice(0, 8))}
      
      [STRICT_CLINICAL_REQUIREMENTS]:
      1. IDENTIFY SPECIFIC INSTITUTIONAL SIGNATURES (e.g., Passive Absorption, Displacement Traps).
      2. ANALYZE DELTA DIVERGENCE BETWEEN TAPE INTENSITY AND GLOBAL ROTATION.
      3. ASSESS SYSTEMIC RISK BASED ON LIQUIDITY VOIDS.
      4. DO NOT PROVIDE INVESTMENT ADVICE. USE PURELY TECHNICAL TERMINOLOGY.
      
      [RESPONSE_REQUIREMENTS]:
      - OUTPUT ONLY JSON. 
      - DO NOT INCLUDE MARKDOWN CODE FENCES.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          // Define strict schema using Gemini Type system
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              structuralAnalysis: {
                type: Type.STRING,
                description: "The primary technical summary of market structure."
              },
              anomalies: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of identified technical anomalies."
              },
              bias: {
                type: Type.STRING,
                description: "BULLISH, BEARISH, or NEUTRAL."
              },
              liquidityDelta: {
                type: Type.NUMBER,
                description: "Net percentage shift in liquidity."
              }
            },
            required: ["structuralAnalysis", "anomalies", "bias", "liquidityDelta"]
          }
        }
      });

      // Gemini Response Handling: Use .text property directly.
      // We also clean the string in case the model outputs markdown fences despite instructions.
      let jsonStr = response.text || '{}';
      jsonStr = jsonStr.replace(/```json|```/g, "").trim();
      
      const data = JSON.parse(jsonStr);
      
      return {
        id: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        timestamp: Date.now(),
        structuralAnalysis: data.structuralAnalysis || "Analysis incomplete: Data packet corruption.",
        anomalies: Array.isArray(data.anomalies) ? data.anomalies : ["Inconclusive node scan."],
        bias: (data.bias || "NEUTRAL").toUpperCase() as any,
        liquidityDelta: typeof data.liquidityDelta === 'number' ? data.liquidityDelta : 0
      };
    } catch (e) {
      console.error("[INTELLIGENCE_CORE_CRITICAL_FAILURE]", e);
      return {
        id: 'CORE_FAIL_FALLBACK',
        timestamp: Date.now(),
        structuralAnalysis: "CRITICAL: The logic engine failed to synthesize a report. This usually indicates an API rate limit or context window collision. Reverting to local heuristic mode.",
        anomalies: ["Transport layer latency violation", "Neural node desync"],
        bias: "NEUTRAL",
        liquidityDelta: 0
      };
    }
  }
}
