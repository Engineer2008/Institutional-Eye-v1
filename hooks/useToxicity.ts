
import { useState, useEffect, useRef } from 'react';

interface Trade {
  p: number;
  q: number;
  m: boolean;
}

export const useToxicity = (incomingTrade: Trade | null, bucketSize: number = 10, windowSize: number = 15) => {
  const [toxicity, setToxicity] = useState(0);
  const buyVol = useRef(0);
  const sellVol = useRef(0);
  const currentBucketVol = useRef(0);
  const bucketImbalances = useRef<number[]>([]);

  useEffect(() => {
    if (!incomingTrade) return;

    const { q, m } = incomingTrade;
    if (m) sellVol.current += q;
    else buyVol.current += q;
    
    currentBucketVol.current += q;

    if (currentBucketVol.current >= bucketSize) {
      const imbalance = Math.abs(buyVol.current - sellVol.current);
      bucketImbalances.current.push(imbalance);
      
      if (bucketImbalances.current.length > windowSize) {
        bucketImbalances.current.shift();
      }

      const sumImbalance = bucketImbalances.current.reduce((a, b) => a + b, 0);
      const totalVolInWindow = bucketImbalances.current.length * bucketSize;
      const score = totalVolInWindow > 0 ? sumImbalance / totalVolInWindow : 0;
      
      setToxicity(score);

      buyVol.current = 0;
      sellVol.current = 0;
      currentBucketVol.current = 0;
    }
  }, [incomingTrade, bucketSize, windowSize]);

  return toxicity;
};
