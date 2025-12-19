
import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
  Area,
  Cell
} from 'recharts';
import { ChartPoint, ForensicZone, ForensicWall, CongruenceState } from '../types';
import { Activity, Compass, Zap, Target, Clock, BarChart3, Crosshair, RefreshCw, Network, AlertCircle, List, Eye, EyeOff, ShieldX } from 'lucide-react';
import { checkCrossExchangeCongruence } from '../services/CrossExchangeEngine';

interface MarketChartProps {
  data: ChartPoint[];
  currentPrice: number;
  zones?: ForensicZone[];
  walls?: ForensicWall[];
  congruence?: CongruenceState;
  refPrice?: number;
  symbol?: string;
  onSymbolChange?: (symbol: string) => void;
}

// v2.2 Advanced Candlestick Shape Renderer
const CandleShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!payload || height === undefined) return null;
  
  const { open, close, high, low } = payload;
  const isUp = close >= open;
  const color = isUp ? '#10B981' : '#EF4444';
  
  // Coordinate calculation logic for proper candlestick positioning
  const ratio = Math.abs(height) / Math.abs(open - close || 0.0001);
  const wickX = x + width / 2;
  
  const top = Math.max(open, close);
  const bottom = Math.min(open, close);
  
  const bodyHeight = Math.max(1, Math.abs(open - close) * ratio);
  const bodyY = y; // Recharts maps the 'close' value to Y for the bar.

  // Determine the Y offsets for high/low based on the ratio
  const highY = bodyY - (high - top) * ratio;
  const lowY = bodyY + (bottom - low) * ratio;

  return (
    <g className="recharts-candlestick">
      <line 
        x1={wickX} 
        y1={highY} 
        x2={wickX} 
        y2={lowY} 
        stroke={color} 
        strokeWidth={1} 
      />
      <rect 
        x={x} 
        y={isUp ? bodyY : bodyY - bodyHeight} 
        width={width} 
        height={bodyHeight} 
        fill={color} 
        stroke={color}
        strokeWidth={0.5}
      />
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const data: ChartPoint = payload[0].payload;
  const isUp = data.close >= data.open;

  return (
    <div className="bg-black/95 border border-ai-border/80 p-4 rounded shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl font-mono min-w-[220px] animate-in fade-in zoom-in-95 duration-200 z-[100] ring-1 ring-white/10">
      <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-2">
         <div className="flex items-center gap-2">
            <Clock size={12} className="text-ai-accent" />
            <span className="text-[10px] text-white font-bold">{new Date(data.time).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
         </div>
         <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${isUp ? 'bg-buy/10 text-buy border-buy/20' : 'bg-sell/10 text-sell border-sell/20'}`}>
            {isUp ? 'BULL' : 'BEAR'}
         </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3 text-[10px]">
         <div className="flex justify-between">
            <span className="text-gray-600">O:</span>
            <span className="text-white tabular-nums">${data.open.toLocaleString()}</span>
         </div>
         <div className="flex justify-between">
            <span className="text-gray-600">C:</span>
            <span className="text-white tabular-nums font-black">${data.close.toLocaleString()}</span>
         </div>
         <div className="flex justify-between">
            <span className="text-emerald-500/80">H:</span>
            <span className="text-white tabular-nums">${data.high.toLocaleString()}</span>
         </div>
         <div className="flex justify-between">
            <span className="text-rose-500/80">L:</span>
            <span className="text-white tabular-nums">${data.low.toLocaleString()}</span>
         </div>
      </div>

      <div className="space-y-1.5 border-t border-white/5 pt-3">
         <div className="flex justify-between items-center text-[9px]">
            <span className="text-gray-500 font-bold uppercase flex items-center gap-1.5"><BarChart3 size={10} className="text-blue-500"/> CVD</span>
            <span className={`font-black tabular-nums ${data.cvd > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {data.cvd > 0 ? '+' : ''}{data.cvd.toFixed(2)}
            </span>
         </div>
         <div className="flex justify-between items-center text-[9px]">
            <span className="text-gray-500 font-bold uppercase flex items-center gap-1.5"><Zap size={10} className="text-amber-500"/> RSI</span>
            <span className="text-white font-black tabular-nums">{data.rsi?.toFixed(2) || 'N/A'}</span>
         </div>
      </div>
    </div>
  );
};

const MarketChart: React.FC<MarketChartProps> = ({ 
  data, 
  currentPrice, 
  walls = [], 
  zones = [],
  refPrice,
  congruence,
  symbol = 'BTCUSDT',
  onSymbolChange
}) => {
  const [crosshairPrice, setCrosshairPrice] = useState<number | null>(null);
  const [legendVisible, setLegendVisible] = useState(true);

  const liveCongruence = useMemo(() => {
    if (congruence) return congruence;
    if (refPrice && refPrice > 0 && currentPrice > 0) {
      return checkCrossExchangeCongruence(currentPrice, refPrice);
    }
    return null;
  }, [congruence, currentPrice, refPrice]);

  const boundaries = useMemo(() => {
    const allPrices = data.flatMap(d => [d.open, d.high, d.low, d.close]);
    const wallPrices = walls.map(w => w.price);
    const zoneLevels = zones.flatMap(z => [z.priceStart, z.priceEnd, ...(z.targets || []), z.invalidation || 0]).filter(p => p > 0);
    
    if (refPrice && refPrice > 0) allPrices.push(refPrice);
    allPrices.push(...wallPrices);
    allPrices.push(...zoneLevels);
    
    const minP = Math.min(...allPrices);
    const maxP = Math.max(...allPrices);
    const range = maxP - minP;
    const padding = range * 0.2 || currentPrice * 0.002;
    return { min: minP - padding, max: maxP + padding };
  }, [data, walls, zones, refPrice, currentPrice]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-[#020408] border border-ai-border rounded-lg h-full flex flex-col items-center justify-center font-mono min-h-[400px]">
        <RefreshCw size={32} className="text-ai-accent opacity-20 animate-spin mb-4" />
        <span className="text-[10px] text-gray-700 font-black tracking-[0.5em] uppercase text-center">Awaiting Pulse</span>
      </div>
    );
  }

  const handleQuickSwap = () => {
    const nextSymbol = symbol === 'BTCUSDT' ? 'ETHUSDT' : 'BTCUSDT';
    if (onSymbolChange) onSymbolChange(nextSymbol);
  };

  return (
    <div className="bg-[#020408] border border-ai-border rounded-xl p-5 shadow-2xl h-full flex flex-col font-mono overflow-hidden relative group">
      <style>{`
        @keyframes wall-halo-buy { 0% { opacity: 0.05; stroke-width: 8; } 50% { opacity: 0.2; stroke-width: 24; } 100% { opacity: 0.05; stroke-width: 8; } }
        @keyframes wall-halo-sell { 0% { opacity: 0.05; stroke-width: 8; } 50% { opacity: 0.2; stroke-width: 24; } 100% { opacity: 0.05; stroke-width: 8; } }
        .pulse-buy { animation: wall-halo-buy 3s infinite ease-in-out; filter: blur(6px); }
        .pulse-sell { animation: wall-halo-sell 3s infinite ease-in-out; filter: blur(6px); }
      `}</style>

      {/* HEADER HUD */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0 relative z-20">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
              <Activity size={16} className="text-ai-accent animate-pulse" /> DEEP_FIELD_SYNC
            </h3>
            <span className="text-[8px] text-gray-700 mt-0.5 uppercase tracking-widest tabular-nums">DATA_STREAM: {data.length} PKTS</span>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleQuickSwap}
              className="px-2 py-1 bg-ai-accent/10 border border-ai-accent/30 rounded text-[9px] font-black text-ai-accent hover:bg-ai-accent hover:text-white transition-all flex items-center gap-1.5 uppercase"
            >
              <RefreshCw size={10} />
            </button>
            <button 
              onClick={() => setLegendVisible(!legendVisible)}
              className={`px-2 py-1 border rounded text-[9px] font-black transition-all flex items-center gap-1.5 uppercase ${legendVisible ? 'bg-ai-accent text-white border-ai-accent' : 'bg-white/5 text-gray-500 border-white/10 hover:text-white'}`}
            >
              {legendVisible ? <Eye size={10} /> : <EyeOff size={10} />}
            </button>
          </div>
        </div>
        
        {crosshairPrice && (
          <div className="px-3 py-1 bg-ai-accent/10 border border-ai-accent/30 rounded text-[10px] text-ai-accent font-black animate-in fade-in tabular-nums">
             INDEX: ${crosshairPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        )}
      </div>

      <div className="flex-1 w-full relative z-10 min-h-0 min-w-0 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <ComposedChart 
            data={data} 
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            onMouseMove={(e: any) => {
              if (e && e.activePayload) setCrosshairPrice(e.activePayload[0].payload.close);
              else setCrosshairPrice(null);
            }}
            onMouseLeave={() => setCrosshairPrice(null)}
          >
            <CartesianGrid stroke="#151923" strokeDasharray="3 3" vertical={false} opacity={0.2} />
            <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} hide />
            
            <YAxis 
              yAxisId="price" 
              orientation="right" 
              domain={[boundaries.min, boundaries.max]} 
              tick={{fill: '#475569', fontSize: 8, fontWeight: 'black'}} 
              axisLine={false} 
              tickLine={false} 
              width={60} 
              tickFormatter={(val) => val.toLocaleString()} 
            />
            
            <YAxis yAxisId="indicators" hide domain={[0, 100]} />
            <YAxis yAxisId="cvd" hide />
            <YAxis yAxisId="macd" hide domain={['auto', 'auto']} />

            {legendVisible && (
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle"
                wrapperStyle={{ 
                  paddingBottom: '20px', 
                  fontSize: '9px', 
                  fontWeight: 'black', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}
              />
            )}

            {/* STRATEGIC ZONES (ENTRIES, TARGETS, STOPS) */}
            {zones.map((zone, idx) => {
              const zoneColor = zone.type === 'BUY' ? '#10B981' : '#EF4444';
              return (
                <React.Fragment key={`zone-${idx}`}>
                  {/* Entry Line */}
                  <ReferenceLine
                    yAxisId="price"
                    y={zone.priceStart}
                    stroke={zoneColor}
                    strokeWidth={2}
                    label={{
                      position: 'left',
                      value: `ENTRY [${zone.type}]`,
                      fill: zoneColor,
                      fontSize: 8,
                      fontWeight: 'black',
                      dx: 60
                    }}
                  />
                  {/* Stop Loss Line */}
                  {zone.invalidation && (
                    <ReferenceLine
                      yAxisId="price"
                      y={zone.invalidation}
                      stroke="#EF4444"
                      strokeDasharray="3 3"
                      strokeWidth={1}
                      label={{
                        position: 'left',
                        value: 'INVALID',
                        fill: '#EF4444',
                        fontSize: 7,
                        fontWeight: 'black',
                        dx: 40
                      }}
                    />
                  )}
                  {/* Target Lines */}
                  {zone.targets?.map((target, tIdx) => (
                    <ReferenceLine
                      key={`target-${idx}-${tIdx}`}
                      yAxisId="price"
                      y={target}
                      stroke="#3B82F6"
                      strokeDasharray="4 2"
                      strokeWidth={1.5}
                      label={{
                        position: 'right',
                        value: `TP_${tIdx + 1}`,
                        fill: '#3B82F6',
                        fontSize: 7,
                        fontWeight: 'black',
                        dx: -40
                      }}
                    />
                  ))}
                </React.Fragment>
              );
            })}

            {/* DOMINANT LIQUIDITY WALL PULSATION */}
            {walls.map((wall, i) => {
               const wallColor = wall.side === 'BID' ? '#10B981' : '#EF4444';
               const strengthClass = wall.side === 'BID' ? 'pulse-buy' : 'pulse-sell';
               const baseOpacity = Math.max(0.1, Math.min(0.5, wall.strength / 15));
               
               return (
                  <React.Fragment key={`wall-${i}`}>
                    <ReferenceLine
                       yAxisId="price"
                       y={wall.price}
                       stroke={wallColor}
                       className={strengthClass}
                       strokeWidth={16}
                       opacity={baseOpacity}
                    />
                    <ReferenceLine
                       yAxisId="price"
                       y={wall.price}
                       stroke={wallColor}
                       strokeWidth={2}
                       strokeDasharray="5 5"
                       label={{
                         position: wall.side === 'BID' ? 'bottom' : 'top',
                         value: `DOMINANT_${wall.side}_ZONE [${wall.strength.toFixed(1)} BTC]`,
                         fill: wallColor,
                         fontSize: 7,
                         fontWeight: 'black',
                         dx: -80
                       }}
                    />
                  </React.Fragment>
               );
            })}

            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '5 5' }}
              position={{ y: 20 }}
              isAnimationActive={false}
            />

            {/* Price Candlesticks */}
            <Bar 
              name="Price"
              yAxisId="price" 
              dataKey="close" 
              isAnimationActive={false} 
              shape={<CandleShape />}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.close >= entry.open ? '#10B981' : '#EF4444'} />
              ))}
            </Bar>
            
            {/* CVD Line */}
            <Line 
              name="CVD"
              yAxisId="cvd" 
              type="stepAfter" 
              dataKey="cvd" 
              stroke="#3B82F6" 
              strokeWidth={1.5} 
              dot={false} 
              isAnimationActive={false} 
              opacity={0.8} 
            />

            {/* Rotation Beta */}
            <Line 
              name="Rotation Beta"
              yAxisId="indicators" 
              type="monotone" 
              dataKey="rotationBeta" 
              stroke="#F59E0B" 
              strokeWidth={1.5} 
              dot={false} 
              isAnimationActive={false} 
              opacity={0.6} 
            />

            {/* MACD Line */}
            <Line 
              name="MACD"
              yAxisId="macd" 
              type="monotone" 
              dataKey="macd" 
              stroke="#EC4899" 
              strokeWidth={1.5} 
              dot={false} 
              isAnimationActive={false} 
              opacity={0.7} 
            />

            {/* RSI Line */}
            <Line 
              name="RSI"
              yAxisId="indicators" 
              type="monotone" 
              dataKey="rsi" 
              stroke="#8B5CF6" 
              strokeWidth={1.5} 
              dot={false} 
              isAnimationActive={false} 
              opacity={0.7} 
            />

            <ReferenceLine yAxisId="price" y={currentPrice} stroke="#3B82F6" strokeDasharray="2 2" opacity={0.3} />

            {refPrice && refPrice > 0 && (
              <ReferenceLine 
                yAxisId="price" 
                y={refPrice} 
                stroke="#64748b" 
                strokeDasharray="3 3" 
                opacity={0.4}
                label={{
                  position: 'left',
                  value: `CB_INDEX`,
                  fill: '#64748b',
                  fontSize: 7,
                  fontWeight: 'black',
                  dx: 40
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex justify-between items-center text-[8px] text-gray-700 font-black tracking-widest border-t border-ai-border pt-3 relative z-20">
          <div className="flex gap-5">
              <span className="flex items-center gap-1.5 uppercase"><Target size={10} className="text-ai-accent" /> FIELD_ANALYSIS: ACTIVE</span>
              <span className="flex items-center gap-1.5 uppercase"><Compass size={10} /> WALL_COUNT: {walls.length}</span>
          </div>
          <span className="text-emerald-500 flex items-center gap-1.5 animate-pulse uppercase"><Zap size={10}/> OPTICAL_FEED_LOCKED</span>
      </div>
    </div>
  );
};

export default MarketChart;
