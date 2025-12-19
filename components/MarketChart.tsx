
import React from 'react';
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
  ReferenceArea,
  Area
} from 'recharts';
import { ChartPoint, ForensicZone, ForensicWall } from '../types';
import { Activity, Compass, TrendingUp, Layers, Zap } from 'lucide-react';

interface MarketChartProps {
  data: ChartPoint[];
  currentPrice: number;
  zones?: ForensicZone[];
  walls?: ForensicWall[];
}

const MarketChart: React.FC<MarketChartProps> = ({ data, currentPrice, zones = [], walls = [] }) => {
  // Logic to prevent chart collapsing on empty data
  if (data.length === 0) {
    return (
      <div className="bg-[#020408] border border-ai-border rounded-lg h-full flex flex-col items-center justify-center font-mono">
        <Zap size={48} className="text-ai-accent opacity-20 animate-pulse mb-4" />
        <span className="text-[10px] text-gray-700 font-black tracking-[0.5em] uppercase">Synchronizing Stream...</span>
      </div>
    );
  }

  // Calculate dynamic vertical bounds
  const prices = data.map(d => d.price);
  const wallPrices = walls.map(w => w.price);
  const minPrice = Math.min(...prices, ...wallPrices) * 0.9997;
  const maxPrice = Math.max(...prices, ...wallPrices) * 1.0003;

  return (
    <div className="bg-[#020408] border border-ai-border rounded-lg p-5 shadow-2xl h-full flex flex-col font-mono overflow-hidden relative group">
      {/* HUD Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0 relative z-20">
        <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
          <Activity size={16} className="text-ai-accent" /> STRAT_MATRIX_OS
        </h3>
        <div className="flex items-center gap-6 text-[8px] font-black tracking-widest uppercase">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3B82F6]"></span> 
            <span className="text-gray-400">PRICE</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_#EAB308]"></span> 
            <span className="text-gray-400">CVD_DELTA</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-500">
            <span className="w-2 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10B981]"></span> 
            ROTATION_BETA
          </span>
        </div>
      </div>
      
      {/* Chart Canvas */}
      <div className="flex-1 w-full -ml-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCvd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EAB308" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#EAB308" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorBeta" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#151923" strokeDasharray="4 4" vertical={false} opacity={0.5} />
            
            <XAxis 
              dataKey="time" 
              type="number" 
              domain={['dataMin', 'dataMax']} 
              tick={false} 
              axisLine={false}
            />
            
            <YAxis 
              yAxisId="price" 
              orientation="right" 
              domain={[minPrice, maxPrice]} 
              tick={{fill: '#475569', fontSize: 8, fontWeight: 'bold'}}
              axisLine={false}
              tickLine={false}
              width={50}
              tickFormatter={(val) => val.toLocaleString()}
            />
            
            <YAxis yAxisId="cvd" hide />
            <YAxis yAxisId="beta" hide domain={[0, 2]} />

            {/* STRATEGIC OVERLAYS: Forensic Zones */}
            {zones.map((zone, i) => (
              <ReferenceArea
                key={i}
                yAxisId="price"
                y1={zone.priceStart}
                y2={zone.priceEnd}
                fill={zone.type === 'BUY' ? '#10B981' : '#EF4444'}
                fillOpacity={0.06}
                stroke="none"
              />
            ))}

            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(2, 4, 8, 0.9)', 
                borderColor: '#2A2F3E', 
                borderRadius: '4px',
                fontSize: '9px',
                fontFamily: 'monospace',
                borderWidth: '1px'
              }}
              labelStyle={{ display: 'none' }}
              cursor={{ stroke: '#2A2F3E', strokeWidth: 1 }}
            />

            <Bar yAxisId="cvd" dataKey="cvd" fill="url(#colorCvd)" barSize={4} isAnimationActive={false} />
            <Area yAxisId="beta" type="monotone" dataKey="rotationBeta" stroke="#10B981" strokeWidth={0.5} fill="url(#colorBeta)" isAnimationActive={false} />
            <Line yAxisId="price" type="stepAfter" dataKey="price" stroke="#3B82F6" strokeWidth={1.5} dot={false} isAnimationActive={false} />

            <ReferenceLine yAxisId="price" y={currentPrice} stroke="#3B82F6" strokeDasharray="3 3" opacity={0.2} />

            {/* STRATEGIC MARKERS: L2 Walls */}
            {walls.map((wall, i) => (
              <ReferenceLine
                key={i}
                yAxisId="price"
                y={wall.price}
                stroke={wall.side === 'BID' ? '#10B981' : '#EF4444'}
                strokeDasharray="5 5"
                opacity={0.7}
                label={{
                  position: 'insideRight',
                  value: `${wall.side}_WALL`,
                  fill: wall.side === 'BID' ? '#10B981' : '#EF4444',
                  fontSize: 7,
                  fontWeight: 'black',
                  offset: 10
                }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Forensic Telemetry Bar */}
      <div className="mt-4 flex justify-between items-center text-[8px] text-gray-700 font-black tracking-widest border-t border-ai-border pt-3">
          <div className="flex gap-5">
              <span className="flex items-center gap-1.5"><Compass size={10} /> ZONES_MAPPED: {zones.length}</span>
              <span className="flex items-center gap-1.5"><Layers size={10} /> WALLS_SYNCED: {walls.length}</span>
          </div>
          <span className="text-ai-accent flex items-center gap-1.5"><Zap size={10}/> TCP_STREAMS_ACCELERATED_L3</span>
      </div>
    </div>
  );
};

export default MarketChart;
