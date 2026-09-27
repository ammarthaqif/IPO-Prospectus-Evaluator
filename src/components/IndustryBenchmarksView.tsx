import React, { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle, 
  BarChart, 
  ShieldCheck, 
  ChevronRight, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight, 
  Info 
} from 'lucide-react';
import { ProspectusDossier, IndustryBenchmarkItem, PeerGroupData } from '../types';

interface IndustryBenchmarksViewProps {
  dossier: ProspectusDossier;
}

export const IndustryBenchmarksView: React.FC<IndustryBenchmarksViewProps> = ({ dossier }) => {
  const dossierBenchmarks = Array.isArray(dossier.benchmarks) ? dossier.benchmarks : [];

  // Available peer groups
  const peerGroups: PeerGroupData[] = (Array.isArray(dossier.peerGroups) && dossier.peerGroups.length > 0)
    ? dossier.peerGroups
    : [
        {
          id: 'primarySector',
          name: `${dossier.sector || 'Industry'} Public Peers`,
          description: `Direct listed comparables in ${dossier.sector || 'the sector'}`,
          benchmarks: dossierBenchmarks,
        },
      ];

  const [selectedPeerGroupId, setSelectedPeerGroupId] = useState<string>(peerGroups[0]?.id || 'primarySector');

  useEffect(() => {
    if (peerGroups[0]) {
      setSelectedPeerGroupId(peerGroups[0].id);
    }
  }, [dossier.id]);

  const activePeerGroup = peerGroups.find(p => p.id === selectedPeerGroupId) || peerGroups[0];
  const activeBenchmarks: IndustryBenchmarkItem[] = (Array.isArray(activePeerGroup?.benchmarks) && activePeerGroup.benchmarks.length > 0)
    ? activePeerGroup.benchmarks
    : dossierBenchmarks;

  // Quantitative breakdown
  const superiorItems = activeBenchmarks.filter(b => b.assessment === 'SUPERIOR');
  const vulnerableItems = activeBenchmarks.filter(b => b.assessment === 'VULNERABLE' || b.assessment === 'ELEVATED_RISK');
  const inLineItems = activeBenchmarks.filter(b => b.assessment === 'IN_LINE');

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              Comparative Analysis
            </span>
            <span className="text-xs text-slate-400 font-mono">Quartile Benchmark Model</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Industry Peer Performance Benchmarking
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluating {dossier.companyName} against public market peer medians and deciles
          </p>
        </div>

        {/* Peer Set Selector */}
        {peerGroups.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium">Peer Set:</label>
            <select
              value={selectedPeerGroupId}
              onChange={(e) => setSelectedPeerGroupId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
            >
              {peerGroups.map(pg => (
                <option key={pg.id} value={pg.id}>{pg.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Peer Description Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Active Peer Universe: <strong className="text-white">{activePeerGroup.name}</strong> — {activePeerGroup.description}</span>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Evaluated Indicators: {activeBenchmarks.length}
        </div>
      </div>

      {/* Executive Benchmark Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Superior Strengths */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 space-y-1.5">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            Top-Decile Strengths ({superiorItems.length})
          </div>
          <div className="text-xs text-slate-300 leading-relaxed space-y-1">
            {superiorItems.length > 0 ? (
              superiorItems.slice(0, 2).map((item, idx) => (
                <p key={idx}>
                  <strong>{item.metric} ({item.issuerValue} {item.unit}):</strong> {item.commentary}
                </p>
              ))
            ) : (
              <p>Key operating indicators demonstrate alignment with market medians across standard industry benchmarks.</p>
            )}
          </div>
        </div>

        {/* Operational Solidity */}
        <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-xl p-4 space-y-1.5">
          <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Operational & Balance Sheet Solidity
          </div>
          <div className="text-xs text-slate-300 leading-relaxed space-y-1">
            {inLineItems.length > 0 ? (
              inLineItems.slice(0, 2).map((item, idx) => (
                <p key={idx}>
                  <strong>{item.metric} ({item.issuerValue} {item.unit}):</strong> Peer median is {item.peerMedian} {item.unit}. {item.commentary}
                </p>
              ))
            ) : (
              <p>
                {dossier.fundamentalStrengths?.[1] || 'Balance sheet and working capital metrics maintain healthy liquidity buffers against execution risks.'}
              </p>
            )}
          </div>
        </div>

        {/* Vulnerabilities */}
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4 space-y-1.5">
          <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            Underperforming Vulnerabilities ({vulnerableItems.length})
          </div>
          <div className="text-xs text-slate-300 leading-relaxed space-y-1">
            {vulnerableItems.length > 0 ? (
              vulnerableItems.slice(0, 2).map((item, idx) => (
                <p key={idx}>
                  <strong>{item.metric} ({item.issuerValue} {item.unit}):</strong> Peer median is {item.peerMedian} {item.unit}. {item.commentary}
                </p>
              ))
            ) : (
              <p>
                {dossier.keyCaveats?.[0] || 'No severe quartile underperformance detected against primary benchmark peer universe.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Metric Benchmark Table & Quartile Visualizer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Comparative Benchmark Metrics & Quartile Positioning</h3>
            <p className="text-xs text-slate-400">Positioning against Lower Quartile (25th), Median (50th), and Upper Quartile (75th)</p>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {activeBenchmarks.map((item) => {
            const isSuperior = item.assessment === 'SUPERIOR';
            const isVulnerable = item.assessment === 'VULNERABLE' || item.assessment === 'ELEVATED_RISK';
            const delta = item.issuerValue - item.peerMedian;

            return (
              <div key={item.metric} className="p-4 sm:p-5 hover:bg-slate-800/20 transition-colors space-y-3">
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{item.metric}</span>
                      <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${
                        isSuperior 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : isVulnerable 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {item.assessment.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{item.commentary}</p>
                  </div>

                  {/* Quantitative Comparison Tag */}
                  <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase">Issuer</div>
                      <div className={`text-base font-bold ${isSuperior ? 'text-emerald-400' : isVulnerable ? 'text-rose-400' : 'text-white'}`}>
                        {item.issuerValue} {item.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase">Peer Median</div>
                      <div className="text-base text-slate-300 font-semibold">
                        {item.peerMedian} {item.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase">Spread</div>
                      <div className={`text-base font-semibold ${delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)} {item.unit}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Range Bar Graphic */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>Bottom Quartile: {item.bottomQuartile} {item.unit}</span>
                    <span>Median: {item.peerMedian} {item.unit}</span>
                    <span>Top Quartile: {item.topQuartile} {item.unit}</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 relative overflow-hidden flex items-center">
                    {/* Interquartile Range background */}
                    <div className="absolute inset-y-0 left-1/4 right-1/4 bg-slate-700/60 rounded" />
                    {/* Median indicator */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-400 z-10" />
                    {/* Issuer positioning bar */}
                    <div 
                      style={{ 
                        width: `${Math.min(96, Math.max(8, isSuperior ? 82 : isVulnerable ? 24 : 52))}%` 
                      }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSuperior ? 'bg-emerald-500' : isVulnerable ? 'bg-rose-500' : 'bg-indigo-500'
                      }`}
                    />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
