
import { RelativisticState } from '../types';

/**
 * v7.5 Physics Engine: Relativistic Time Dilation
 * Formula: Δt' = Δt / sqrt(1 - v²/c²)
 */
export class RelativisticEngine {
  private static readonly C = 299792458; // Speed of light in m/s

  /**
   * Calculates time dilation based on proper time and relative velocity.
   * @param properTime Proper time interval (Δt) in seconds
   * @param velocity Relative velocity (v) in m/s
   */
  public static calculateDilation(properTime: number, velocity: number): RelativisticState {
    const v = Math.min(velocity, this.C - 1); // Avoid division by zero/imaginary numbers
    const vSquared = Math.pow(v, 2);
    const cSquared = Math.pow(this.C, 2);
    
    // Calculate Lorentz Factor (γ)
    const lorentzFactor = 1 / Math.sqrt(1 - (vSquared / cSquared));
    
    // Proper Time * γ = Dilated Time (Δt')
    const dilatedTime = properTime * lorentzFactor;

    return {
      properTime,
      dilatedTime,
      lorentzFactor,
      relativeVelocity: v,
      cPercent: (v / this.C) * 100
    };
  }

  /**
   * Simulates current network "Velocity" based on market volatility.
   * Used to visualize theoretical dilation of transaction finality.
   */
  public static getMarketVelocity(volatility: number): number {
    // Maps 0-1 volatility to 0-99% light speed for simulation
    return volatility * this.C * 0.999;
  }
}
