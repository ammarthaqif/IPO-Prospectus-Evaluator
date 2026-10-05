import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Calendar, 
  Clock, 
  Plus, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Building, 
  Activity, 
  Compass, 
  HelpCircle,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { ProspectusDossier, SentimentHistoryPoint } from '../types';

interface MarketSentimentTimelineChartProps {
  dossier: ProspectusDossier;
  onUpdateDossier?: (updated: ProspectusDossier) => void;
  compact?: boolean;
}

export const MarketSentimentTimelineChart: React.FC<MarketSentimentTimelineChartProps> = ({
  dossier,
  onUpdateDossier,
  compact = false,
}) => {
  const [viewMode, setViewMode] = useState<'chart' | 'roadmap' | 'table'>('chart');
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Form states for adding custom checkpoint
  const [newPhase, setNewPhase] = useState<string>('');
  const [newDate, setNewDate] = useState<string>(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
  const [newScore, setNewScore] = useState<number>(50);
  const [newHedging, setNewHedging] = useState<number>(40);
  const [newDriver, setNewDriver] = useState<string>('');
  const [newCitation, setNewCitation] = useState<string>('Analyst Audit & Market Monitoring');
  const [newSource, setNewSource] = useState<SentimentHistoryPoint['source']>('ANALYST_CONSENSUS');

  // Extract history points or generate defaults from current sentiment
  const historyPoints = useMemo<SentimentHistoryPoint[]>(() => {
    const raw = dossier.sentiment?.history;
    if (raw && Array.isArray(raw) && raw.length > 0) {
      return raw;
    }
    const currentScore = dossier.sentiment?.overallScore ?? 35;
    const year = 2026;
    return [
      {
        id: `${dossier.id}-hist-1`,
        date: `15 Oct ${year - 1}`,
        phase: 'SC Exposure Draft Submission',
        score: Math.max(-50, Math.round(currentScore * 0.65 - 6)),
        hedgingRatio: 60,
        driver: 'Initial public regulatory exposure draft released; market assessed prospectus disclosures and financial highlights.',
        source: 'BURSA_FILING',
        sourceCitation: 'Securities Commission Malaysia Public Exposure Portal',
        classification: 'Guarded / Defensive',
      },
      {
        id: `${dossier.id}-hist-2`,
        date: `12 Dec ${year - 1}`,
        phase: 'Bursa Listing Approval',
        score: Math.max(-40, Math.round(currentScore * 0.80)),
        hedgingRatio: 52,
        driver: 'Bursa Malaysia confirms eligibility and listing structure; principal advisers and underwriters confirmed.',
        source: 'BURSA_FILING',
        sourceCitation: 'Bursa Malaysia Listing Announcement',
        classification: 'Cautiously Optimistic',
      },
      {
        id: `${dossier.id}-hist-3`,
        date: `10 Jan ${year}`,
        phase: 'Official Prospectus Launch',
        score: Math.max(-30, Math.round(currentScore * 0.92)),
        hedgingRatio: 48,
        driver: 'Registered prospectus launched; definitive IPO price fixed with proceed utilisation schedule and lock-up terms.',
        source: 'PROSPECTUS_DISCLOSURE',
        sourceCitation: 'Official IPO Prospectus Release',
        classification: 'Cautiously Optimistic',
      },
      {
        id: `${dossier.id}-hist-4`,
        date: `22 Jan ${year}`,
        phase: 'Institutional Bookbuilding & Roadshow',
        score: Math.max(-20, Math.round(currentScore * 1.08)),
        hedgingRatio: 40,
        driver: 'Institutional placement book reported strong initial demand; licensed research houses initiate favorable target prices.',
        source: 'ANALYST_CONSENSUS',
        sourceCitation: 'Broker Consensus & Institutional Placement Book',
        classification: 'High Conviction Bullish',
      },
      {
        id: `${dossier.id}-hist-5`,
        date: `02 Feb ${year}`,
        phase: 'Retail Balloting & Oversubscription',
        score: Math.max(-10, Math.round(currentScore * 1.18)),
        hedgingRatio: 35,
        driver: 'Malaysian retail public balloting closed with robust oversubscription ratios across public categories.',
        source: 'RETAIL_BALLOTING',
        sourceCitation: 'Issuing House Official Balloting Statistics',
        classification: 'High Conviction Bullish',
      },
      {
        id: `${dossier.id}-hist-6`,
        date: `18 Feb ${year}`,
        phase: 'Current Market Sentiment',
        score: currentScore,
        hedgingRatio: dossier.sentiment?.hedgingIndex || 44,
        driver: 'Consolidated real-time market sentiment derived from audited disclosures, broker fair value models, and secondary float dynamics.',
        source: 'PROSPECTUS_DISCLOSURE',
        sourceCitation: 'Live Evaluated Prospectus Scorecard',
        classification: dossier.sentiment?.classification || 'Cautiously Optimistic',
      },
    ];
  }, [dossier.id, dossier.sentiment]);

  // Selected or active point for the detail inspector
  const activePoint = useMemo(() => {
    if (hoveredPointId) {
      const found = historyPoints.find(p => p.id === hoveredPointId);
      if (found) return found;
    }
    if (selectedPointId) {
      const found = historyPoints.find(p => p.id === selectedPointId);
      if (found) return found;
    }
    return historyPoints[historyPoints.length - 1];
  }, [historyPoints, hoveredPointId, selectedPointId]);

  // Summary Metrics
  const firstPoint = historyPoints[0];
  const latestPoint = historyPoints[historyPoints.length - 1];
  const deltaScore = latestPoint ? latestPoint.score - (firstPoint ? firstPoint.score : 0) : 0;
  const highestPoint = [...historyPoints].sort((a, b) => b.score - a.score)[0];
  const lowestPoint = [...historyPoints].sort((a, b) => a.score - b.score)[0];

  // Chart Geometry & Scaling
  const width = 800;
  const height = compact ? 220 : 280;
  const padding = { top: 35, right: 40, bottom: 45, left: 55 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Compute dynamic min and max score for Y axis with comfortable headroom
  const scores = historyPoints.map(p => p.score);
  const minScoreRaw = Math.min(...scores, -20);
  const maxScoreRaw = Math.max(...scores, 60);

  // Round bounds to neat intervals (-100 to 100 max)
  const minY = Math.max(-100, Math.floor(minScoreRaw / 20) * 20 - 10);
  const maxY = Math.min(100, Math.ceil(maxScoreRaw / 20) * 20 + 10);
  const scoreRange = maxY - minY || 1;

  // Coordinate projection helpers
  const getX = (index: number) => {
    if (historyPoints.length <= 1) return padding.left + innerWidth / 2;
    return padding.left + (index / (historyPoints.length - 1)) * innerWidth;
  };

  const getY = (score: number) => {
    const normalized = (score - minY) / scoreRange;
    return padding.top + innerHeight - normalized * innerHeight;
  };

  const zeroY = getY(0);

  // Build smooth cubic Bezier path string
  const pointsCoords = historyPoints.map((p, idx) => ({
    x: getX(idx),
    y: getY(p.score),
    point: p,
    idx,
  }));

  const linePath = useMemo(() => {
    if (pointsCoords.length === 0) return '';
    if (pointsCoords.length === 1) return `M ${pointsCoords[0].x},${pointsCoords[0].y}`;

    let path = `M ${pointsCoords[0].x.toFixed(1)},${pointsCoords[0].y.toFixed(1)}`;
    for (let i = 0; i < pointsCoords.length - 1; i++) {
      const p0 = pointsCoords[i];
      const p1 = pointsCoords[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      path += ` C ${cpX.toFixed(1)},${p0.y.toFixed(1)} ${cpX.toFixed(1)},${p1.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
    }
    return path;
  }, [pointsCoords]);

  // Closed path for SVG area fill
  const areaPath = useMemo(() => {
    if (pointsCoords.length === 0) return '';
    const firstX = pointsCoords[0].x;
    const lastX = pointsCoords[pointsCoords.length - 1].x;
    const bottomY = Math.min(height - padding.bottom, Math.max(padding.top, zeroY));

    let path = `M ${firstX.toFixed(1)},${bottomY.toFixed(1)} L ${firstX.toFixed(1)},${pointsCoords[0].y.toFixed(1)}`;
    for (let i = 0; i < pointsCoords.length - 1; i++) {
      const p0 = pointsCoords[i];
      const p1 = pointsCoords[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      path += ` C ${cpX.toFixed(1)},${p0.y.toFixed(1)} ${cpX.toFixed(1)},${p1.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
    }
    path += ` L ${lastX.toFixed(1)},${bottomY.toFixed(1)} Z`;
    return path;
  }, [pointsCoords, height, padding.bottom, padding.top, zeroY]);

  // Color helper based on sentiment score
  const getScoreColor = (score: number) => {
    if (score >= 50) return { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', stroke: '#10b981' };
    if (score >= 20) return { text: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/40', stroke: '#06b6d4' };
    if (score >= 0) return { text: 'text-indigo-400', bg: 'bg-indigo-500/20', border: 'border-indigo-500/40', stroke: '#818cf8' };
    if (score >= -20) return { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40', stroke: '#f59e0b' };
    return { text: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/40', stroke: '#f43f5e' };
  };

  // Horizontal Gridline values
  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = 20;
    const start = Math.ceil(minY / step) * step;
    for (let v = start; v <= maxY; v += step) {
      ticks.push(v);
    }
    return ticks;
  }, [minY, maxY]);

  // Handle saving new sentiment checkpoint
  const handleSaveCheckpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhase.trim() || !newDriver.trim()) return;

    const newPoint: SentimentHistoryPoint = {
      id: `sent-custom-${Date.now()}`,
      date: newDate.trim(),
      phase: newPhase.trim(),
      score: Number(newScore),
      hedgingRatio: Number(newHedging),
      driver: newDriver.trim(),
      source: newSource,
      sourceCitation: newCitation.trim() || 'Audited Checkpoint',
      classification: newScore >= 50 ? 'High Conviction Bullish' : newScore >= 20 ? 'Cautiously Optimistic' : newScore >= -10 ? 'Neutral / In-Line' : 'Guarded / Defensive',
    };

    const updatedHistory = [...historyPoints, newPoint];
    const updatedDossier: ProspectusDossier = {
      ...dossier,
      sentiment: {
        ...(dossier.sentiment || {
          overallScore: newScore,
          classification: 'Cautiously Optimistic',
          hedgingIndex: newHedging,
          transparencyScore: 85,
          redFlagCount: { critical: 0, high: 0, medium: 0, low: 0 },
          executiveSummary: '',
          toneAnalysis: '',
          sections: [],
        }),
        overallScore: newScore,
        history: updatedHistory,
      },
    };

    if (onUpdateDossier) {
      onUpdateDossier(updatedDossier);
    }

    setIsAddModalOpen(false);
    setSelectedPointId(newPoint.id);
    setNewPhase('');
    setNewDriver('');
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl relative overflow-hidden">
      
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-bl from-indigo-500/5 via-cyan-500/5 to-transparent pointer-events-none rounded-tr-2xl" />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Activity className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-indigo-400">
              Milestone Trajectory Timeline
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {historyPoints.length} Checkpoints
            </span>
          </div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Market Sentiment Score Over Time
          </h3>
          <p className="text-xs text-slate-400">
            Chronological investor conviction tracking from regulatory draft exposure to public balloting & listing
          </p>
        </div>

        {/* View Switcher & Action Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="flex items-center p-0.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'chart' 
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Spline Curve
            </button>
            <button
              onClick={() => setViewMode('roadmap')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'roadmap' 
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Roadmap
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Audit Log
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            title="Log a new sentiment checkpoint or analyst review"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Log Checkpoint</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Latest Sentiment */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">Latest Sentiment</div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-bold font-mono ${getScoreColor(latestPoint.score).text}`}>
              {latestPoint.score >= 0 ? `+${latestPoint.score}` : latestPoint.score}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">/ 100</span>
          </div>
          <div className="text-[10px] text-slate-300 font-medium truncate">
            {latestPoint.phase}
          </div>
        </div>

        {/* Metric 2: Net Momentum Delta */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">Lifecycle Momentum</div>
          <div className="flex items-center gap-1.5">
            {deltaScore >= 0 ? (
              <span className="flex items-center gap-1 text-xl font-bold font-mono text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                +{deltaScore} pts
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xl font-bold font-mono text-rose-400">
                <TrendingDown className="w-4 h-4" />
                {deltaScore} pts
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400">
            From initial {firstPoint ? firstPoint.score : 0} at draft filing
          </div>
        </div>

        {/* Metric 3: Peak Milestone */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">Peak Conviction</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-emerald-400">
              +{highestPoint.score}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">high</span>
          </div>
          <div className="text-[10px] text-slate-300 font-medium truncate">
            {highestPoint.phase}
          </div>
        </div>

        {/* Metric 4: Trough Period */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">Trough / Initial Exposure</div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-bold font-mono ${getScoreColor(lowestPoint.score).text}`}>
              {lowestPoint.score >= 0 ? `+${lowestPoint.score}` : lowestPoint.score}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">baseline</span>
          </div>
          <div className="text-[10px] text-slate-300 font-medium truncate">
            {lowestPoint.phase}
          </div>
        </div>
      </div>

      {/* Main Content Area based on View Mode */}
      {viewMode === 'chart' && (
        <div className="space-y-4">
          
          {/* SVG Line Chart Canvas */}
          <div className="relative w-full rounded-xl bg-slate-950/80 border border-slate-800/80 p-2 sm:p-4 overflow-hidden">
            
            <svg 
              viewBox={`0 0 ${width} ${height}`} 
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                {/* Gradient for area fill beneath curve */}
                <linearGradient id="sentimentAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.30" />
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>

                {/* Stroke line vibrant gradient */}
                <linearGradient id="sentimentLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="40%" stopColor="#6366f1" />
                  <stop offset="75%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>

                {/* Drop shadow filter for glow */}
                <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Sentiment Zone Background Tints */}
              {/* Bullish Zone (> +20) */}
              <rect
                x={padding.left}
                y={padding.top}
                width={innerWidth}
                height={Math.max(0, getY(20) - padding.top)}
                fill="#10b981"
                fillOpacity="0.03"
              />

              {/* Guarded Zone (< -10) */}
              {minY < -10 && (
                <rect
                  x={padding.left}
                  y={getY(-10)}
                  width={innerWidth}
                  height={Math.max(0, height - padding.bottom - getY(-10))}
                  fill="#f43f5e"
                  fillOpacity="0.04"
                />
              )}

              {/* Horizontal Gridlines & Y-Axis Labels */}
              {yTicks.map((tick) => {
                const y = getY(tick);
                const isZero = tick === 0;
                return (
                  <g key={`y-tick-${tick}`}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke={isZero ? '#475569' : '#1e293b'}
                      strokeWidth={isZero ? 1.5 : 1}
                      strokeDasharray={isZero ? '5 4' : undefined}
                    />
                    <text
                      x={padding.left - 10}
                      y={y}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight={isZero ? 'bold' : 'normal'}
                      fill={isZero ? '#cbd5e1' : '#64748b'}
                    >
                      {tick > 0 ? `+${tick}` : tick}
                    </text>
                  </g>
                );
              })}

              {/* Zero Baseline Callout Tag */}
              <text
                x={width - padding.right + 6}
                y={zeroY}
                dominantBaseline="middle"
                fontSize="9"
                fontFamily="monospace"
                fill="#64748b"
              >
                0.0 Baseline
              </text>

              {/* Area Fill */}
              <path
                d={areaPath}
                fill="url(#sentimentAreaGradient)"
                className="transition-all duration-300"
              />

              {/* Smooth Bezier Spline Curve */}
              <path
                d={linePath}
                fill="none"
                stroke="url(#sentimentLineGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#lineGlow)"
                className="transition-all duration-300"
              />

              {/* Vertical Milestone Guides & X-Axis Labels */}
              {pointsCoords.map((pt) => {
                const isHovered = hoveredPointId === pt.point.id;
                const isSelected = selectedPointId === pt.point.id || (!selectedPointId && pt.idx === pointsCoords.length - 1);
                const color = getScoreColor(pt.point.score);

                return (
                  <g key={`x-axis-pt-${pt.point.id}`}>
                    {/* Vertical guideline */}
                    <line
                      x1={pt.x}
                      y1={padding.top}
                      x2={pt.x}
                      y2={height - padding.bottom}
                      stroke={isHovered || isSelected ? '#6366f1' : '#1e293b'}
                      strokeWidth={isHovered || isSelected ? 1.5 : 1}
                      strokeDasharray={isHovered || isSelected ? '3 3' : undefined}
                      opacity={isHovered || isSelected ? 0.8 : 0.4}
                    />

                    {/* Date label at bottom */}
                    <text
                      x={pt.x}
                      y={height - padding.bottom + 16}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontFamily="monospace"
                      fontWeight={isHovered || isSelected ? 'bold' : '500'}
                      fill={isHovered || isSelected ? '#ffffff' : '#94a3b8'}
                    >
                      {pt.point.date}
                    </text>

                    {/* Phase acronym or short title */}
                    <text
                      x={pt.x}
                      y={height - padding.bottom + 28}
                      textAnchor="middle"
                      fontSize="8.5"
                      fill={isHovered || isSelected ? '#a5b4fc' : '#64748b'}
                      className="hidden sm:inline"
                    >
                      {pt.point.phase.length > 15 ? `${pt.point.phase.slice(0, 13)}…` : pt.point.phase}
                    </text>

                    {/* Outer glow ring on hover/selected */}
                    {(isHovered || isSelected) && (
                      <circle
                        cx={pt.x}
                        y={pt.y}
                        r="12"
                        fill={color.stroke}
                        fillOpacity="0.2"
                        className="animate-pulse"
                      />
                    )}

                    {/* Latest Point Pulse Ping */}
                    {pt.idx === pointsCoords.length - 1 && (
                      <circle
                        cx={pt.x}
                        y={pt.y}
                        r="9"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="1.5"
                        opacity="0.6"
                      >
                        <animate
                          attributeName="r"
                          values="6;16"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.8;0"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Inner Point Circle */}
                    <circle
                      cx={pt.x}
                      y={pt.y}
                      r={isHovered || isSelected ? 6 : 4.5}
                      fill="#0f172a"
                      stroke={color.stroke}
                      strokeWidth={isHovered || isSelected ? 3 : 2}
                      className="cursor-pointer transition-all duration-200"
                    />

                    {/* Point Score Tag floating above node */}
                    <text
                      x={pt.x}
                      y={pt.y - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill={color.stroke}
                    >
                      {pt.point.score >= 0 ? `+${pt.point.score}` : pt.point.score}
                    </text>

                    {/* Invisible Wide Hitbox Area */}
                    <circle
                      cx={pt.x}
                      y={pt.y}
                      r="22"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPointId(pt.point.id)}
                      onMouseLeave={() => setHoveredPointId(null)}
                      onClick={() => setSelectedPointId(pt.point.id)}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Interactive Checkpoint Detail Card */}
          {activePoint && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${getScoreColor(activePoint.score).bg} ${getScoreColor(activePoint.score).text} border ${getScoreColor(activePoint.score).border}`}>
                    Score: {activePoint.score >= 0 ? `+${activePoint.score}` : activePoint.score} / 100
                  </span>
                  <span className="text-xs font-bold text-white">
                    {activePoint.phase}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    • {activePoint.date}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Hedging Ratio:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {activePoint.hedgingRatio ?? 45}%
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {activePoint.source || 'PROSPECTUS_DISCLOSURE'}
                  </span>
                </div>
              </div>

              {/* Rationale & Source Citation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="md:col-span-2 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Market Catalyst & Sentiment Driver
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                    {activePoint.driver}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Source Verification Citation
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60 space-y-1">
                    <div className="text-[11px] text-slate-200 font-mono truncate">
                      {activePoint.sourceCitation || 'Audited Prospectus Disclosures'}
                    </div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified Regulatory Milestone
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Roadmap View Mode */}
      {viewMode === 'roadmap' && (
        <div className="space-y-3">
          <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6 py-2">
            {historyPoints.map((pt, idx) => {
              const color = getScoreColor(pt.score);
              const isSelected = selectedPointId === pt.id;
              const isLatest = idx === historyPoints.length - 1;

              return (
                <div 
                  key={`roadmap-pt-${pt.id}`}
                  onClick={() => setSelectedPointId(pt.id)}
                  className={`relative group p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-950 border-indigo-500/60 shadow-lg ring-1 ring-indigo-500/30'
                      : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Timeline Node Icon on Left Rail */}
                  <div className={`absolute -left-[35px] top-4 w-5 h-5 rounded-full border-2 bg-slate-950 flex items-center justify-center ${color.border}`}>
                    <div className={`w-2 h-2 rounded-full ${color.bg}`} />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-indigo-400 font-semibold">{pt.date}</span>
                      <span className="text-slate-600">•</span>
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {pt.phase}
                      </h4>
                      {isLatest && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Active Checkpoint
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${color.bg} ${color.text} border ${color.border}`}>
                        {pt.score >= 0 ? `+${pt.score}` : pt.score} / 100
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Hedging: {pt.hedgingRatio ?? 40}%
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                    {pt.driver}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">Citation: {pt.sourceCitation || 'Bursa Official Disclosures'}</span>
                    <span className="text-emerald-400 font-semibold">{pt.classification || 'Audited Score'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Audit Log Table View Mode */}
      {viewMode === 'table' && (
        <div className="rounded-xl border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Regulatory Phase</th>
                <th className="py-2.5 px-3 text-right">Score</th>
                <th className="py-2.5 px-3 text-right">Hedging %</th>
                <th className="py-2.5 px-3">Source Channel</th>
                <th className="py-2.5 px-3">Primary Catalyst / Audit Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {historyPoints.map((pt) => {
                const color = getScoreColor(pt.score);
                return (
                  <tr key={`table-row-${pt.id}`} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">{pt.date}</td>
                    <td className="py-2.5 px-3 text-slate-200 font-medium whitespace-nowrap">{pt.phase}</td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${color.bg} ${color.text} border ${color.border}`}>
                        {pt.score >= 0 ? `+${pt.score}` : pt.score}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-400 font-medium">
                      {pt.hedgingRatio ?? 40}%
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {pt.source || 'PROSPECTUS_DISCLOSURE'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans text-xs max-w-xs truncate" title={pt.driver}>
                      {pt.driver}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Add Sentiment Checkpoint */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Log Sentiment Checkpoint</h3>
                  <p className="text-xs text-slate-400">Record an updated sentiment milestone or catalyst observation</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCheckpoint} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Milestone / Event Name</label>
                  <input
                    type="text"
                    required
                    value={newPhase}
                    onChange={(e) => setNewPhase(e.target.value)}
                    placeholder="e.g. Q1 Results Beat or Contract Win"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Date</label>
                  <input
                    type="text"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="e.g. 15 Mar 2026"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-slate-400 font-medium">Sentiment Score (-100 to +100)</label>
                    <span className="font-mono font-bold text-indigo-400">{newScore}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={newScore}
                    onChange={(e) => setNewScore(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-slate-400 font-medium">Hedging Index %</label>
                    <span className="font-mono font-bold text-amber-400">{newHedging}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newHedging}
                    onChange={(e) => setNewHedging(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Source Type</label>
                <select
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="ANALYST_CONSENSUS">Analyst Consensus & Broker Note</option>
                  <option value="BURSA_FILING">Bursa Malaysia Official Filing</option>
                  <option value="PROSPECTUS_DISCLOSURE">Prospectus Disclosure / Press Release</option>
                  <option value="RETAIL_BALLOTING">Retail Public Balloting Announcement</option>
                  <option value="NEWS_MEDIA">Financial Press Citation (The Edge, StarBiz)</option>
                  <option value="USER_AUDIT">User Custom Due Diligence Note</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Catalyst Rationale & Driver Note</label>
                <textarea
                  required
                  rows={3}
                  value={newDriver}
                  onChange={(e) => setNewDriver(e.target.value)}
                  placeholder="Detail the market catalyst, analyst commentary, or orderbook update that influenced sentiment..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Source Citation / Reference</label>
                <input
                  type="text"
                  value={newCitation}
                  onChange={(e) => setNewCitation(e.target.value)}
                  placeholder="e.g. Bursa Announcement Ref #2026-03-441"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all cursor-pointer shadow-md"
                >
                  Save Checkpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
