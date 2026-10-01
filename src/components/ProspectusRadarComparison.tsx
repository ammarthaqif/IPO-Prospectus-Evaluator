import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  TrendingUp, 
  ShieldAlert, 
  Activity, 
  Clock, 
  ArrowRightLeft, 
  Check, 
  Sparkles, 
  Award, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  Info,
  Building2,
  ChevronDown
} from 'lucide-react';
import { ProspectusDossier } from '../types';

interface ProspectusRadarComparisonProps {
  currentDossier: ProspectusDossier;
  availableDossiers: ProspectusDossier[];
  onSelectDossier?: (dossier: ProspectusDossier) => void;
  onOpenUploadModal?: () => void;
}

interface RadarMetricDefinition {
  key: string;
  label: string;
  category: string;
  unit: string;
  description: string;
  extractValue: (d: ProspectusDossier) => { raw: number; display: string };
  normalizeScore: (raw: number) => number; // 0 to 100
  higherIsBetter: boolean;
}

export const ProspectusRadarComparison: React.FC<ProspectusRadarComparisonProps> = ({
  currentDossier,
  availableDossiers,
  onSelectDossier,
  onOpenUploadModal,
}) => {
  // Candidate dossier selection
  const otherDossiers = useMemo(() => {
    return availableDossiers.filter((d) => d.id !== currentDossier.id);
  }, [availableDossiers, currentDossier.id]);

  const [dossierAId, setDossierAId] = useState<string>(currentDossier.id);
  const [dossierBId, setDossierBId] = useState<string>(
    otherDossiers[0]?.id || currentDossier.id
  );

  // Sync if currentDossier changes externally
  React.useEffect(() => {
    setDossierAId(currentDossier.id);
    if (dossierBId === currentDossier.id && otherDossiers.length > 0) {
      setDossierBId(otherDossiers[0].id);
    }
  }, [currentDossier.id]);

  const dossierA = useMemo(() => {
    return availableDossiers.find((d) => d.id === dossierAId) || currentDossier;
  }, [availableDossiers, dossierAId, currentDossier]);

  const dossierB = useMemo(() => {
    return (
      availableDossiers.find((d) => d.id === dossierBId) ||
      otherDossiers[0] ||
      currentDossier
    );
  }, [availableDossiers, dossierBId, otherDossiers, currentDossier]);

  // Chart view visibility toggles
  const [showDossierA, setShowDossierA] = useState(true);
  const [showDossierB, setShowDossierB] = useState(true);
  const [hoveredAxis, setHoveredAxis] = useState<number | null>(null);

  // Swap Dossier A and B
  const handleSwap = () => {
    const temp = dossierAId;
    setDossierAId(dossierBId);
    setDossierBId(temp);
  };

  // 7 Core Institutional Radar Dimensions
  const radarMetrics: RadarMetricDefinition[] = useMemo(() => [
    {
      key: 'gpMargin',
      label: 'Gross Margin',
      category: 'Profitability',
      unit: '%',
      description: 'Pricing power, cost structure, and technical margin moat',
      higherIsBetter: true,
      extractValue: (d) => {
        const fin = d.financials?.[d.financials.length - 1];
        const val = fin?.gpMargin || 0;
        return { raw: val, display: `${val.toFixed(1)}%` };
      },
      normalizeScore: (val) => Math.min(100, Math.max(10, (val / 50) * 100)),
    },
    {
      key: 'patMargin',
      label: 'PAT Margin',
      category: 'Bottom-Line Conversion',
      unit: '%',
      description: 'Net profit conversion rate attributable to equity owners',
      higherIsBetter: true,
      extractValue: (d) => {
        const fin = d.financials?.[d.financials.length - 1];
        const val = fin?.patMargin || 0;
        return { raw: val, display: `${val.toFixed(1)}%` };
      },
      normalizeScore: (val) => Math.min(100, Math.max(10, (val / 25) * 100)),
    },
    {
      key: 'revenueScale',
      label: 'Revenue Scale',
      category: 'Top-Line Momentum',
      unit: "RM'000",
      description: 'Audited historical scale and commercial transaction throughput',
      higherIsBetter: true,
      extractValue: (d) => {
        const fin = d.financials?.[d.financials.length - 1];
        const val = fin?.revenue || 0;
        const cur = d.currencySymbol || 'RM';
        return {
          raw: val,
          display: val >= 1000 ? `${cur}${(val / 1000).toFixed(1)}M` : `${cur}${val.toLocaleString()}k`,
        };
      },
      normalizeScore: (val) => Math.min(100, Math.max(15, (val / 120000) * 100)),
    },
    {
      key: 'currentRatio',
      label: 'Liquidity (Current)',
      category: 'Short-term Solvency',
      unit: 'x',
      description: 'Short-term obligations coverage buffer (2.0x-3.0x is institutional tier)',
      higherIsBetter: true,
      extractValue: (d) => {
        const fin = d.financials?.[d.financials.length - 1];
        const val = fin?.currentRatio || 2.0;
        return { raw: val, display: `${val.toFixed(2)}x` };
      },
      normalizeScore: (val) => Math.min(100, Math.max(15, (val / 4.0) * 100)),
    },
    {
      key: 'solvencyHealth',
      label: 'Solvency (Gearing)',
      category: 'Capital Protection',
      unit: 'x',
      description: 'Debt-to-equity leverage (lower gearing yields superior safety score)',
      higherIsBetter: false, // Inverted: lower debt is better!
      extractValue: (d) => {
        const fin = d.financials?.[d.financials.length - 1];
        const val = fin?.gearingRatio !== undefined ? fin.gearingRatio : 0.2;
        return { raw: val, display: `${val.toFixed(2)}x` };
      },
      normalizeScore: (val) => {
        // 0 gearing = 100 score, 1.0 gearing = 20 score
        return Math.min(100, Math.max(10, (1 - Math.min(val, 0.9)) * 100));
      },
    },
    {
      key: 'cashCycleSpeed',
      label: 'Cash Cycle Speed',
      category: 'Working Capital',
      unit: 'days',
      description: 'Cash Conversion Cycle (CCC): faster capital turnover = higher rating',
      higherIsBetter: false, // Inverted: shorter CCC days is better!
      extractValue: (d) => {
        const fin = d.financials?.[d.financials.length - 1];
        const val = fin?.cashConversionCycleDays || 120;
        return { raw: val, display: `${val}d` };
      },
      normalizeScore: (val) => {
        // 60 days = 95 score, 180 days = 30 score
        return Math.min(100, Math.max(15, (1 - (val - 45) / 160) * 100));
      },
    },
    {
      key: 'convictionScore',
      label: 'Fund Stance Score',
      category: 'Institutional Stance',
      unit: '/10',
      description: 'AI sentiment & committee conviction score based on prospectus audit',
      higherIsBetter: true,
      extractValue: (d) => {
        const score = d.fundManagerVerdict?.convictionScore || (d.sentiment?.overallScore ? Math.round(d.sentiment.overallScore / 10) : 7);
        return { raw: score, display: `${score}/10` };
      },
      normalizeScore: (val) => Math.min(100, Math.max(20, (val / 10) * 100)),
    },
  ], []);

  // Compute Radar SVG Geometry
  const size = 380;
  const center = size / 2;
  const radius = size * 0.38;
  const numAxes = radarMetrics.length;
  const angleStep = (Math.PI * 2) / numAxes;

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (index: number, score: number) => {
    // Rotate so first axis points straight UP (-PI / 2)
    const angle = index * angleStep - Math.PI / 2;
    const r = (score / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Build polygon path points
  const pointsA = useMemo(() => {
    return radarMetrics.map((m, idx) => {
      const { raw } = m.extractValue(dossierA);
      const score = m.normalizeScore(raw);
      return getCoordinates(idx, score);
    });
  }, [radarMetrics, dossierA]);

  const pointsB = useMemo(() => {
    return radarMetrics.map((m, idx) => {
      const { raw } = m.extractValue(dossierB);
      const score = m.normalizeScore(raw);
      return getCoordinates(idx, score);
    });
  }, [radarMetrics, dossierB]);

  const polygonPathA = pointsA.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const polygonPathB = pointsB.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Compute Head-to-Head Wins
  const comparisonSummary = useMemo(() => {
    let winsA = 0;
    let winsB = 0;
    const details = radarMetrics.map((m) => {
      const valA = m.extractValue(dossierA);
      const valB = m.extractValue(dossierB);
      const scoreA = m.normalizeScore(valA.raw);
      const scoreB = m.normalizeScore(valB.raw);

      let winner: 'A' | 'B' | 'TIE' = 'TIE';
      if (Math.abs(scoreA - scoreB) > 2) {
        if (scoreA > scoreB) {
          winner = 'A';
          winsA++;
        } else {
          winner = 'B';
          winsB++;
        }
      }

      return {
        metric: m,
        valA,
        valB,
        scoreA,
        scoreB,
        winner,
      };
    });

    return { winsA, winsB, details };
  }, [radarMetrics, dossierA, dossierB]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-6 shadow-xl relative overflow-hidden">
      
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar & Dossier Selectors */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Scale className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Side-by-Side Prospectus Comparison & Radar Benchmark
            </h2>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
              Interactive
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compare financial ratios, margin moats, balance sheet buffers, and regulatory profiles across evaluated IPO issuers.
          </p>
        </div>

        {/* Dual Selector Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
          {/* Selector A */}
          <div className="relative flex-1 sm:flex-initial min-w-[200px]">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>Dossier A (Primary)</span>
            </div>
            <div className="relative">
              <select
                value={dossierAId}
                onChange={(e) => setDossierAId(e.target.value)}
                className="w-full appearance-none bg-slate-950 border border-indigo-500/40 hover:border-indigo-400 text-white rounded-xl px-3 py-2 pr-8 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer truncate shadow-sm"
              >
                {availableDossiers.map((d) => (
                  <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                    {d.companyName} ({d.listingMarket?.split(' ')[0] || 'IPO'})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-indigo-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={handleSwap}
            className="self-end mb-0.5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Swap Dossier A and B"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>

          {/* Selector B */}
          <div className="relative flex-1 sm:flex-initial min-w-[200px]">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Dossier B (Benchmark)</span>
            </div>
            <div className="relative">
              <select
                value={dossierBId}
                onChange={(e) => setDossierBId(e.target.value)}
                className="w-full appearance-none bg-slate-950 border border-cyan-500/40 hover:border-cyan-400 text-white rounded-xl px-3 py-2 pr-8 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer truncate shadow-sm"
              >
                {availableDossiers.map((d) => (
                  <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                    {d.companyName} ({d.listingMarket?.split(' ')[0] || 'IPO'})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Comparison Layout: Radar Chart on Left, KPI Breakdown on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (5 cols): Interactive Radar Canvas */}
        <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-between space-y-4">
          
          {/* Radar Legend and Toggle Chips */}
          <div className="w-full flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Dimension Overlay
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDossierA(!showDossierA)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  showDossierA
                    ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/50 shadow-sm'
                    : 'bg-slate-900/60 text-slate-500 border-slate-800 opacity-60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span className="truncate max-w-[100px]">{dossierA.companyName.split(' ')[0]}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDossierB(!showDossierB)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  showDossierB
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900/60 text-slate-500 border-slate-800 opacity-60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="truncate max-w-[100px]">{dossierB.companyName.split(' ')[0]}</span>
              </button>
            </div>
          </div>

          {/* SVG Radar Chart */}
          <div className="relative w-full aspect-square max-w-[360px] flex items-center justify-center">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full overflow-visible select-none"
            >
              {/* Concentric Reference Rings */}
              {gridLevels.map((level, lIdx) => {
                const ringPoints = radarMetrics.map((_, mIdx) => {
                  const angle = mIdx * angleStep - Math.PI / 2;
                  const r = level * radius;
                  return `${(center + r * Math.cos(angle)).toFixed(1)},${(center + r * Math.sin(angle)).toFixed(1)}`;
                }).join(' ');

                return (
                  <g key={lIdx}>
                    <polygon
                      points={ringPoints}
                      fill="none"
                      stroke="rgba(148, 163, 184, 0.12)"
                      strokeWidth="1"
                      strokeDasharray={lIdx < 4 ? '3 3' : 'none'}
                    />
                    {/* Level Label on first vertical spoke */}
                    <text
                      x={center + 5}
                      y={center - level * radius + 11}
                      fill="rgba(148, 163, 184, 0.35)"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {Math.round(level * 100)}%
                    </text>
                  </g>
                );
              })}

              {/* Spoke Rays from Center */}
              {radarMetrics.map((_, idx) => {
                const angle = idx * angleStep - Math.PI / 2;
                const outerX = center + radius * Math.cos(angle);
                const outerY = center + radius * Math.sin(angle);
                const isHovered = hoveredAxis === idx;

                return (
                  <line
                    key={idx}
                    x1={center}
                    y1={center}
                    x2={outerX}
                    y2={outerY}
                    stroke={isHovered ? 'rgba(99, 102, 241, 0.6)' : 'rgba(148, 163, 184, 0.18)'}
                    strokeWidth={isHovered ? '1.5' : '1'}
                    className="transition-colors"
                  />
                );
              })}

              {/* Polygon A Overlay (Indigo) */}
              {showDossierA && (
                <g className="transition-all duration-300">
                  <polygon
                    points={polygonPathA}
                    fill="rgba(99, 102, 241, 0.28)"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    className="filter drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                  />
                  {pointsA.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r={hoveredAxis === idx ? 5.5 : 4}
                      fill="#818cf8"
                      stroke="#1e1b4b"
                      strokeWidth="2"
                      className="cursor-pointer transition-transform"
                      onMouseEnter={() => setHoveredAxis(idx)}
                      onMouseLeave={() => setHoveredAxis(null)}
                    />
                  ))}
                </g>
              )}

              {/* Polygon B Overlay (Cyan) */}
              {showDossierB && (
                <g className="transition-all duration-300">
                  <polygon
                    points={polygonPathB}
                    fill="rgba(6, 182, 212, 0.22)"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    className="filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                  />
                  {pointsB.map((p, idx) => (
                    <rect
                      key={idx}
                      x={p.x - (hoveredAxis === idx ? 4.5 : 3.5)}
                      y={p.y - (hoveredAxis === idx ? 4.5 : 3.5)}
                      width={hoveredAxis === idx ? 9 : 7}
                      height={hoveredAxis === idx ? 9 : 7}
                      fill="#22d3ee"
                      stroke="#083344"
                      strokeWidth="2"
                      className="cursor-pointer transition-transform"
                      onMouseEnter={() => setHoveredAxis(idx)}
                      onMouseLeave={() => setHoveredAxis(null)}
                    />
                  ))}
                </g>
              )}

              {/* Dimension Axis Labels along Perimeter */}
              {radarMetrics.map((m, idx) => {
                const angle = idx * angleStep - Math.PI / 2;
                const labelRadius = radius + 22;
                const lx = center + labelRadius * Math.cos(angle);
                const ly = center + labelRadius * Math.sin(angle);
                const isHovered = hoveredAxis === idx;

                let textAnchor: 'middle' | 'start' | 'end' = 'middle';
                if (Math.cos(angle) > 0.3) textAnchor = 'start';
                else if (Math.cos(angle) < -0.3) textAnchor = 'end';

                return (
                  <g
                    key={m.key}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredAxis(idx)}
                    onMouseLeave={() => setHoveredAxis(null)}
                  >
                    <text
                      x={lx}
                      y={ly}
                      textAnchor={textAnchor}
                      dominantBaseline="central"
                      fontSize="10"
                      fontWeight={isHovered ? 'bold' : '600'}
                      fill={isHovered ? '#ffffff' : '#94a3b8'}
                      className="transition-colors"
                    >
                      {m.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Active Hover Dimension Tooltip Callout */}
          {hoveredAxis !== null ? (
            <div className="w-full p-2.5 rounded-xl bg-slate-900 border border-indigo-500/30 text-xs animate-in fade-in space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-400" />
                  {radarMetrics[hoveredAxis].label}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {radarMetrics[hoveredAxis].category}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {radarMetrics[hoveredAxis].description}
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] font-mono">
                <span className="text-indigo-300">
                  {dossierA.companyName.split(' ')[0]}:{' '}
                  <strong className="text-white">
                    {radarMetrics[hoveredAxis].extractValue(dossierA).display}
                  </strong>
                </span>
                <span className="text-cyan-300">
                  {dossierB.companyName.split(' ')[0]}:{' '}
                  <strong className="text-white">
                    {radarMetrics[hoveredAxis].extractValue(dossierB).display}
                  </strong>
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full text-center text-[11px] text-slate-500 italic">
              Hover over any axis point to inspect raw metric deltas
            </div>
          )}

          {/* Quick Head-to-Head Scoreboard */}
          <div className="w-full grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
            <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-center">
              <div className="text-[10px] uppercase font-mono text-indigo-400 font-bold truncate">
                {dossierA.companyName.split(' ')[0]} Advantages
              </div>
              <div className="text-lg font-bold text-indigo-300 font-mono">
                {comparisonSummary.winsA} / {radarMetrics.length}
              </div>
              <div className="text-[10px] text-slate-400">Dimensions Leading</div>
            </div>

            <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-center">
              <div className="text-[10px] uppercase font-mono text-cyan-400 font-bold truncate">
                {dossierB.companyName.split(' ')[0]} Advantages
              </div>
              <div className="text-lg font-bold text-cyan-300 font-mono">
                {comparisonSummary.winsB} / {radarMetrics.length}
              </div>
              <div className="text-[10px] text-slate-400">Dimensions Leading</div>
            </div>
          </div>

        </div>

        {/* Right Column (7 cols): Comparative Metric Matrix & Synthesis */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Executive Comparative Thesis */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Executive Comparative Synthesis</span>
              </div>
              {onSelectDossier && dossierB.id !== currentDossier.id && (
                <button
                  type="button"
                  onClick={() => onSelectDossier(dossierB)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  title="Make Dossier B your active workspace analysis"
                >
                  <Building2 className="w-3 h-3" />
                  <span>Switch Workspace to {dossierB.companyName.split(' ')[0]}</span>
                </button>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {dossierA.companyName} vs {dossierB.companyName}:{' '}
              {comparisonSummary.winsA >= comparisonSummary.winsB ? (
                <>
                  <strong className="text-indigo-300">{dossierA.companyName}</strong> leads in{' '}
                  <strong>{comparisonSummary.winsA}</strong> core dimensions, offering robust{' '}
                  {comparisonSummary.details.filter(d => d.winner === 'A').map(d => d.metric.label).slice(0, 2).join(' & ')} strength. Meanwhile,{' '}
                  <strong className="text-cyan-300">{dossierB.companyName}</strong> stands out in{' '}
                  {comparisonSummary.details.filter(d => d.winner === 'B').map(d => d.metric.label).join(', ') || 'defensive balance sheet profile'}.
                </>
              ) : (
                <>
                  <strong className="text-cyan-300">{dossierB.companyName}</strong> displays superior benchmark scores across{' '}
                  <strong>{comparisonSummary.winsB}</strong> dimensions, highlighted by stronger{' '}
                  {comparisonSummary.details.filter(d => d.winner === 'B').map(d => d.metric.label).slice(0, 2).join(' & ')}.
                </>
              )}
            </p>
          </div>

          {/* Granular Comparison Cards List */}
          <div className="space-y-2.5">
            {comparisonSummary.details.map((item, idx) => {
              const isHovered = hoveredAxis === idx;
              const isWinA = item.winner === 'A';
              const isWinB = item.winner === 'B';

              return (
                <div
                  key={item.metric.key}
                  onMouseEnter={() => setHoveredAxis(idx)}
                  onMouseLeave={() => setHoveredAxis(null)}
                  className={`p-3 rounded-xl transition-all border ${
                    isHovered
                      ? 'bg-slate-800/80 border-indigo-500/60 shadow-md ring-1 ring-indigo-500/20'
                      : 'bg-slate-950/70 hover:bg-slate-900/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    
                    {/* Metric Name & Category */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {item.metric.label}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                          {item.metric.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {item.metric.description}
                      </div>
                    </div>

                    {/* Side-by-Side Values and Advantage Badge */}
                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0 font-mono">
                      
                      {/* Dossier A Value */}
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border ${
                        isWinA
                          ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40 ring-1 ring-indigo-500/30'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}>
                        <span className="text-[10px] text-slate-500 mr-0.5">A:</span>
                        <span>{item.valA.display}</span>
                        {isWinA && <Award className="w-3 h-3 text-indigo-400 shrink-0" />}
                      </div>

                      <span className="text-slate-600 text-xs font-sans">vs</span>

                      {/* Dossier B Value */}
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border ${
                        isWinB
                          ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 ring-1 ring-cyan-500/30'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}>
                        <span className="text-[10px] text-slate-500 mr-0.5">B:</span>
                        <span>{item.valB.display}</span>
                        {isWinB && <Award className="w-3 h-3 text-cyan-400 shrink-0" />}
                      </div>

                    </div>

                  </div>

                  {/* Relative Score Bar Comparison */}
                  <div className="mt-2.5 grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span className="truncate max-w-[120px]">{dossierA.companyName.split(' ')[0]}</span>
                        <span className="text-indigo-400 font-semibold">{Math.round(item.scoreA)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, Math.max(5, item.scoreA))}%` }}
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span className="truncate max-w-[120px]">{dossierB.companyName.split(' ')[0]}</span>
                        <span className="text-cyan-400 font-semibold">{Math.round(item.scoreB)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, Math.max(5, item.scoreB))}%` }}
                          className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Quick Upload More Prospectuses Action Banner */}
          {onOpenUploadModal && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Want to benchmark a new company? Upload another IPO prospectus PDF to expand this comparison matrix.</span>
              </div>
              <button
                type="button"
                onClick={onOpenUploadModal}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs whitespace-nowrap cursor-pointer transition-all shadow-md shrink-0"
              >
                + Upload Another Prospectus
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
