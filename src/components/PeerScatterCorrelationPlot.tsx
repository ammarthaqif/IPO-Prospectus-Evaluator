import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  SlidersHorizontal, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Building2, 
  Sparkles, 
  Crosshair, 
  Check, 
  X, 
  ArrowUpRight, 
  ArrowDownRight,
  Maximize2,
  RefreshCw,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import { ProspectusDossier, PeerCompanyMetric, PeerGroupData } from '../types';

export type PerformanceMetricKey = 
  | 'pe'
  | 'revenueGrowth'
  | 'gpMargin'
  | 'patMargin'
  | 'roe'
  | 'gearingRatio'
  | 'currentRatio'
  | 'cccDays'
  | 'pb'
  | 'marketCapRM';

interface MetricMeta {
  key: PerformanceMetricKey;
  label: string;
  shortLabel: string;
  unit: string;
  format: (v: number) => string;
  higherIsBetter: boolean;
  description: string;
}

export const METRIC_CATALOG: Record<PerformanceMetricKey, MetricMeta> = {
  pe: {
    key: 'pe',
    label: 'Price-to-Earnings Multiple (P/E)',
    shortLabel: 'P/E Multiple',
    unit: 'x',
    format: (v) => `${v.toFixed(1)}x`,
    higherIsBetter: false,
    description: 'Valuation multiple relative to net earnings. Lower values imply cheaper valuation entry multiples.',
  },
  revenueGrowth: {
    key: 'revenueGrowth',
    label: 'Revenue Growth YoY / CAGR',
    shortLabel: 'Rev Growth',
    unit: '%',
    format: (v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`,
    higherIsBetter: true,
    description: 'Annualized top-line revenue expansion velocity. Higher values indicate market share capture.',
  },
  gpMargin: {
    key: 'gpMargin',
    label: 'Gross Profit Margin (GP%)',
    shortLabel: 'GP Margin',
    unit: '%',
    format: (v) => `${v.toFixed(1)}%`,
    higherIsBetter: true,
    description: 'Pricing power and production cost efficiency before overhead allocations.',
  },
  patMargin: {
    key: 'patMargin',
    label: 'Net Profit Margin (PAT%)',
    shortLabel: 'PAT Margin',
    unit: '%',
    format: (v) => `${v.toFixed(1)}%`,
    higherIsBetter: true,
    description: 'Bottom-line net income conversion after taxes and finance costs.',
  },
  roe: {
    key: 'roe',
    label: 'Return on Equity (ROE%)',
    shortLabel: 'ROE',
    unit: '%',
    format: (v) => `${v.toFixed(1)}%`,
    higherIsBetter: true,
    description: 'Efficiency of generating profits from shareholders funds and equity capital.',
  },
  gearingRatio: {
    key: 'gearingRatio',
    label: 'Debt-to-Equity / Gearing Ratio',
    shortLabel: 'Gearing',
    unit: 'x',
    format: (v) => `${v.toFixed(2)}x`,
    higherIsBetter: false,
    description: 'Total debt divided by total equity. Lower gearing indicates stronger solvency buffer.',
  },
  currentRatio: {
    key: 'currentRatio',
    label: 'Current Ratio (Liquidity)',
    shortLabel: 'Current Ratio',
    unit: 'x',
    format: (v) => `${v.toFixed(2)}x`,
    higherIsBetter: true,
    description: 'Short-term debt servicing capability from liquid current assets.',
  },
  cccDays: {
    key: 'cccDays',
    label: 'Cash Conversion Cycle (CCC)',
    shortLabel: 'CCC Days',
    unit: 'days',
    format: (v) => `${Math.round(v)} days`,
    higherIsBetter: false,
    description: 'Days required to convert inventory and receivable investments back into cash.',
  },
  pb: {
    key: 'pb',
    label: 'Price-to-Book Ratio (P/B)',
    shortLabel: 'P/B Multiple',
    unit: 'x',
    format: (v) => `${v.toFixed(2)}x`,
    higherIsBetter: false,
    description: 'Market valuation divided by net asset book value.',
  },
  marketCapRM: {
    key: 'marketCapRM',
    label: 'Market Capitalization',
    shortLabel: 'Market Cap',
    unit: 'RM M',
    format: (v) => `RM ${Math.round(v).toLocaleString()}M`,
    higherIsBetter: true,
    description: 'Total public equity valuation in Ringgit Malaysia millions.',
  },
};

interface PresetCorrelation {
  id: string;
  name: string;
  xKey: PerformanceMetricKey;
  yKey: PerformanceMetricKey;
  tagline: string;
  rationale: string;
}

const PRESET_CORRELATIONS: PresetCorrelation[] = [
  {
    id: 'growth-valuation',
    name: 'Growth vs. Valuation (PEG)',
    xKey: 'revenueGrowth',
    yKey: 'pe',
    tagline: 'Revenue Growth (%) vs. P/E Multiple (x)',
    rationale: 'Benchmark whether higher top-line growth commands higher valuation multiples or whether the current IPO is priced at a discount to peer growth.',
  },
  {
    id: 'margin-valuation',
    name: 'Margin vs. Valuation',
    xKey: 'patMargin',
    yKey: 'pe',
    tagline: 'Net Margin (%) vs. P/E Multiple (x)',
    rationale: 'Examine pricing power: do companies with superior net profit margins enjoy multiple premiums in the public market?',
  },
  {
    id: 'quality-frontier',
    name: 'Profitability Frontier',
    xKey: 'gpMargin',
    yKey: 'roe',
    tagline: 'Gross Margin (%) vs. Return on Equity (%)',
    rationale: 'Assess competitive moat: does proprietary technology or operational leverage yield superior returns on equity?',
  },
  {
    id: 'leverage-liquidity',
    name: 'Balance Sheet Resilience',
    xKey: 'gearingRatio',
    yKey: 'currentRatio',
    tagline: 'Gearing (x) vs. Current Ratio (x)',
    rationale: 'Map financial risk profile: compare short-term solvency buffers and debt load against sector peers.',
  },
  {
    id: 'efficiency-margin',
    name: 'Working Capital vs. Margin',
    xKey: 'cccDays',
    yKey: 'gpMargin',
    tagline: 'Cash Conversion Cycle (days) vs. GP Margin (%)',
    rationale: 'Evaluate whether superior gross margins are accompanied by efficient working capital velocity.',
  },
];

interface PeerScatterCorrelationPlotProps {
  dossier: ProspectusDossier;
  activePeerGroup: PeerGroupData;
  onUpdatePeers?: (updatedPeers: PeerCompanyMetric[]) => void;
}

export const PeerScatterCorrelationPlot: React.FC<PeerScatterCorrelationPlotProps> = ({
  dossier,
  activePeerGroup,
  onUpdatePeers,
}) => {
  // Metric Selections
  const [selectedPreset, setSelectedPreset] = useState<string>('growth-valuation');
  const [xMetricKey, setXMetricKey] = useState<PerformanceMetricKey>('revenueGrowth');
  const [yMetricKey, setYMetricKey] = useState<PerformanceMetricKey>('pe');
  
  // Custom peer items state
  const initialPeers = useMemo<PeerCompanyMetric[]>(() => {
    return Array.isArray(activePeerGroup?.peers) && activePeerGroup.peers.length > 0
      ? activePeerGroup.peers
      : [];
  }, [activePeerGroup]);

  const [peerList, setPeerList] = useState<PeerCompanyMetric[]>(initialPeers);

  // Sync if activePeerGroup changes
  React.useEffect(() => {
    if (activePeerGroup?.peers && activePeerGroup.peers.length > 0) {
      setPeerList(activePeerGroup.peers);
    }
  }, [activePeerGroup]);

  // Selected Peers Filter for Scatter Plot
  const [selectedPeerIds, setSelectedPeerIds] = useState<Set<string>>(() => {
    return new Set(initialPeers.map(p => p.id));
  });

  // Keep all selected when peer list changes
  React.useEffect(() => {
    if (peerList.length > 0) {
      setSelectedPeerIds(prev => {
        const next = new Set<string>();
        peerList.forEach(p => {
          if (prev.has(p.id) || prev.size === 0) {
            next.add(p.id);
          }
        });
        return next.size > 0 ? next : new Set(peerList.map(p => p.id));
      });
    }
  }, [peerList]);

  // Active hover and click inspect states
  const [hoveredPeerId, setHoveredPeerId] = useState<string | null>(null);
  const [inspectedPeerId, setInspectedPeerId] = useState<string | null>(null);

  // Add custom peer modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newPeerName, setNewPeerName] = useState<string>('');
  const [newPeerTicker, setNewPeerTicker] = useState<string>('');
  const [newPeerMarket, setNewPeerMarket] = useState<string>('Bursa Main Market');
  const [newPeerPe, setNewPeerPe] = useState<number>(18.0);
  const [newPeerGrowth, setNewPeerGrowth] = useState<number>(15.0);
  const [newPeerGp, setNewPeerGp] = useState<number>(30.0);
  const [newPeerPat, setNewPeerPat] = useState<number>(15.0);
  const [newPeerRoe, setNewPeerRoe] = useState<number>(16.0);
  const [newPeerGearing, setNewPeerGearing] = useState<number>(0.2);
  const [newPeerCurrent, setNewPeerCurrent] = useState<number>(2.2);
  const [newPeerCcc, setNewPeerCcc] = useState<number>(95);
  const [newPeerMarketCap, setNewPeerMarketCap] = useState<number>(1500);

  // Current IPO Computed Metrics
  const currentIpo = useMemo<PeerCompanyMetric>(() => {
    const fin = dossier.financials || [];
    const latestFin = fin[fin.length - 1];
    const prevFin = fin.length > 1 ? fin[fin.length - 2] : null;

    // Revenue Growth
    let growth = 22.0;
    if (prevFin && latestFin && prevFin.revenue > 0) {
      growth = ((latestFin.revenue - prevFin.revenue) / prevFin.revenue) * 100;
    } else {
      const cagrBm = dossier.benchmarks?.find(b => 
        b.metric.toLowerCase().includes('cagr') || 
        b.metric.toLowerCase().includes('growth')
      );
      if (cagrBm) growth = cagrBm.issuerValue;
    }

    // P/E valuation
    let pe = dossier.listingPerformance?.peAtIpo;
    if (!pe && dossier.ipoPrice && latestFin?.pat && latestFin.pat > 0) {
      const shares = dossier.enlargedIssuedShares || 100_000_000;
      const totalPatRM = latestFin.pat * 1000;
      const mCapRM = dossier.ipoPrice * shares;
      pe = Number((mCapRM / totalPatRM).toFixed(1));
    }
    if (!pe) pe = 16.5;

    // GP Margin
    const gp = latestFin?.gpMargin ?? (dossier.benchmarks?.find(b => b.metric.toLowerCase().includes('gross'))?.issuerValue || 34.0);

    // PAT Margin
    const pat = latestFin?.patMargin ?? (dossier.benchmarks?.find(b => b.metric.toLowerCase().includes('net') || b.metric.toLowerCase().includes('pat'))?.issuerValue || 18.5);

    // ROE
    const roe = dossier.benchmarks?.find(b => b.metric.toLowerCase().includes('roe'))?.issuerValue || 20.0;

    // Gearing
    const gearing = latestFin?.gearingRatio ?? (dossier.benchmarks?.find(b => b.metric.toLowerCase().includes('gearing') || b.metric.toLowerCase().includes('debt'))?.issuerValue || 0.12);

    // Current Ratio
    const cr = latestFin?.currentRatio ?? (dossier.benchmarks?.find(b => b.metric.toLowerCase().includes('current'))?.issuerValue || 2.6);

    // CCC Days
    const ccc = latestFin?.cashConversionCycleDays ?? (dossier.benchmarks?.find(b => b.metric.toLowerCase().includes('conversion') || b.metric.toLowerCase().includes('ccc'))?.issuerValue || 88);

    // PB
    const pb = 2.4;

    // Market Cap (RM Millions)
    let mCap = 520;
    if (dossier.listingPerformance?.marketCapAtIpoRM) {
      mCap = Math.round(dossier.listingPerformance.marketCapAtIpoRM / 1000);
    } else if (dossier.ipoPrice && dossier.enlargedIssuedShares) {
      mCap = Math.round((dossier.ipoPrice * dossier.enlargedIssuedShares) / 1_000_000);
    }

    const tickerSymbol = `${dossier.companyName.split(' ')[0].toUpperCase()}.KL`;

    return {
      id: `current-ipo-${dossier.id}`,
      name: `${dossier.companyName} (IPO Issuer)`,
      ticker: tickerSymbol,
      market: dossier.listingMarket || 'Bursa Malaysia',
      pe: Number(pe.toFixed(1)),
      pb: Number(pb.toFixed(2)),
      revenueGrowth: Number(growth.toFixed(1)),
      gpMargin: Number(gp.toFixed(1)),
      patMargin: Number(pat.toFixed(1)),
      roe: Number(roe.toFixed(1)),
      currentRatio: Number(cr.toFixed(2)),
      gearingRatio: Number(gearing.toFixed(2)),
      cccDays: Math.round(ccc),
      marketCapRM: Math.round(mCap),
      notes: 'Current IPO Issuer evaluated statistics',
    };
  }, [dossier]);

  // Handle Preset Switching
  const handleSelectPreset = (preset: PresetCorrelation) => {
    setSelectedPreset(preset.id);
    setXMetricKey(preset.xKey);
    setYMetricKey(preset.yKey);
  };

  // Metadata for current X and Y metrics
  const xMeta = METRIC_CATALOG[xMetricKey];
  const yMeta = METRIC_CATALOG[yMetricKey];

  // Active Selected Peers
  const activeSelectedPeers = useMemo(() => {
    return peerList.filter(p => selectedPeerIds.has(p.id));
  }, [peerList, selectedPeerIds]);

  // Toggle peer checkbox
  const handleTogglePeer = (id: string) => {
    setSelectedPeerIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) { // keep at least 1 peer
          next.delete(id);
        }
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllPeers = () => {
    setSelectedPeerIds(new Set(peerList.map(p => p.id)));
  };

  const handleSelectMarket = (marketName: string) => {
    const filtered = peerList.filter(p => (p.market || '').toLowerCase().includes(marketName.toLowerCase()));
    if (filtered.length > 0) {
      setSelectedPeerIds(new Set(filtered.map(p => p.id)));
    }
  };

  // Add Custom Peer
  const handleAddCustomPeer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeerName.trim() || !newPeerTicker.trim()) return;

    const newPeer: PeerCompanyMetric = {
      id: `custom-peer-${Date.now()}`,
      name: newPeerName.trim(),
      ticker: newPeerTicker.trim().toUpperCase(),
      market: newPeerMarket,
      pe: Number(newPeerPe),
      pb: 2.1,
      revenueGrowth: Number(newPeerGrowth),
      gpMargin: Number(newPeerGp),
      patMargin: Number(newPeerPat),
      roe: Number(newPeerRoe),
      gearingRatio: Number(newPeerGearing),
      currentRatio: Number(newPeerCurrent),
      cccDays: Math.round(newPeerCcc),
      marketCapRM: Math.round(newPeerMarketCap),
      notes: 'Custom Analyst Peer Addition',
    };

    const updated = [...peerList, newPeer];
    setPeerList(updated);
    setSelectedPeerIds(prev => new Set([...prev, newPeer.id]));
    setInspectedPeerId(newPeer.id);
    setIsAddModalOpen(false);

    if (onUpdatePeers) {
      onUpdatePeers(updated);
    }

    // Reset inputs
    setNewPeerName('');
    setNewPeerTicker('');
  };

  // Remove Custom Peer
  const handleRemovePeer = (id: string) => {
    const updated = peerList.filter(p => p.id !== id);
    setPeerList(updated);
    setSelectedPeerIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next.size > 0 ? next : new Set(updated.map(p => p.id));
    });
    if (inspectedPeerId === id) setInspectedPeerId(null);
    if (onUpdatePeers) onUpdatePeers(updated);
  };

  // Statistical Regression Analysis & Correlations
  const stats = useMemo(() => {
    const points = activeSelectedPeers.map(p => ({
      x: Number(p[xMetricKey] ?? 0),
      y: Number(p[yMetricKey] ?? 0),
    }));

    if (points.length === 0) {
      return {
        n: 0,
        meanX: 0,
        meanY: 0,
        medianX: 0,
        medianY: 0,
        slope: 0,
        intercept: 0,
        r: 0,
        rSquared: 0,
        predictedIpoY: 0,
        ipoSpread: 0,
        ipoSpreadPct: 0,
        strength: 'No Data',
      };
    }

    const n = points.length;
    const sumX = points.reduce((acc, pt) => acc + pt.x, 0);
    const sumY = points.reduce((acc, pt) => acc + pt.y, 0);
    const meanX = sumX / n;
    const meanY = sumY / n;

    // Medians for Quadrant Crosshairs
    const sortedX = [...points.map(pt => pt.x)].sort((a, b) => a - b);
    const sortedY = [...points.map(pt => pt.y)].sort((a, b) => a - b);
    const medianX = sortedX[Math.floor(n / 2)];
    const medianY = sortedY[Math.floor(n / 2)];

    let ssXX = 0;
    let ssYY = 0;
    let ssXY = 0;

    points.forEach(pt => {
      const dx = pt.x - meanX;
      const dy = pt.y - meanY;
      ssXX += dx * dx;
      ssYY += dy * dy;
      ssXY += dx * dy;
    });

    const slope = ssXX !== 0 ? ssXY / ssXX : 0;
    const intercept = meanY - slope * meanX;

    const denom = Math.sqrt(ssXX * ssYY);
    const r = denom !== 0 ? ssXY / denom : 0;
    const rSquared = r * r;

    // Current IPO positioning relative to regression line
    const ipoX = Number(currentIpo[xMetricKey] ?? 0);
    const ipoY = Number(currentIpo[yMetricKey] ?? 0);
    const predictedIpoY = slope * ipoX + intercept;
    const ipoSpread = ipoY - predictedIpoY;
    const ipoSpreadPct = predictedIpoY !== 0 ? (ipoSpread / Math.abs(predictedIpoY)) * 100 : 0;

    let strength = 'Weak / Indeterminate';
    const absR = Math.abs(r);
    if (absR >= 0.75) strength = r > 0 ? 'Strong Positive Correlation' : 'Strong Inverse Correlation';
    else if (absR >= 0.45) strength = r > 0 ? 'Moderate Positive Correlation' : 'Moderate Inverse Correlation';
    else strength = 'Low / Neutral Correlation';

    return {
      n,
      meanX,
      meanY,
      medianX,
      medianY,
      slope,
      intercept,
      r,
      rSquared,
      predictedIpoY,
      ipoSpread,
      ipoSpreadPct,
      strength,
    };
  }, [activeSelectedPeers, currentIpo, xMetricKey, yMetricKey]);

  // Coordinate Bounds & Scales for SVG Scatter Plot
  const chartBounds = useMemo(() => {
    const all = [...activeSelectedPeers, currentIpo];
    const xVals = all.map(p => Number(p[xMetricKey] ?? 0));
    const yVals = all.map(p => Number(p[yMetricKey] ?? 0));

    let minX = Math.min(...xVals);
    let maxX = Math.max(...xVals);
    let minY = Math.min(...yVals);
    let maxY = Math.max(...yVals);

    // Add 15% visual padding
    const spanX = maxX - minX || 10;
    const spanY = maxY - minY || 10;

    minX = Math.floor(minX - spanX * 0.15);
    maxX = Math.ceil(maxX + spanX * 0.15);
    minY = Math.floor(minY - spanY * 0.15);
    maxY = Math.ceil(maxY + spanY * 0.15);

    // If metric typically non-negative, don't drop far below zero unless values are negative
    if (Math.min(...xVals) >= 0 && minX < 0) minX = 0;
    if (Math.min(...yVals) >= 0 && minY < 0) minY = 0;

    return { minX, maxX, minY, maxY };
  }, [activeSelectedPeers, currentIpo, xMetricKey, yMetricKey]);

  // SVG Dimensions & Margins
  const svgWidth = 720;
  const svgHeight = 360;
  const padding = { top: 30, right: 35, bottom: 45, left: 60 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Coordinate Transform Functions
  const scaleX = (val: number) => {
    const { minX, maxX } = chartBounds;
    if (maxX === minX) return padding.left + plotWidth / 2;
    return padding.left + ((val - minX) / (maxX - minX)) * plotWidth;
  };

  const scaleY = (val: number) => {
    const { minY, maxY } = chartBounds;
    if (maxY === minY) return padding.top + plotHeight / 2;
    return padding.top + plotHeight - ((val - minY) / (maxY - minY)) * plotHeight;
  };

  // Regression line SVG coordinates
  const regressionLineCoords = useMemo(() => {
    const { minX, maxX, minY, maxY } = chartBounds;
    if (stats.n < 2) return null;

    const yAtMinX = stats.slope * minX + stats.intercept;
    const yAtMaxX = stats.slope * maxX + stats.intercept;

    return {
      x1: scaleX(minX),
      y1: scaleY(Math.max(minY, Math.min(maxY, yAtMinX))),
      x2: scaleX(maxX),
      y2: scaleY(Math.max(minY, Math.min(maxY, yAtMaxX))),
    };
  }, [chartBounds, stats, scaleX, scaleY]);

  // Ticks Generation
  const xTicks = useMemo(() => {
    const { minX, maxX } = chartBounds;
    const count = 5;
    const step = (maxX - minX) / count;
    return Array.from({ length: count + 1 }, (_, i) => minX + i * step);
  }, [chartBounds]);

  const yTicks = useMemo(() => {
    const { minY, maxY } = chartBounds;
    const count = 5;
    const step = (maxY - minY) / count;
    return Array.from({ length: count + 1 }, (_, i) => minY + i * step);
  }, [chartBounds]);

  // Currently inspected item (either a peer or the IPO)
  const activeInspected = useMemo(() => {
    if (!inspectedPeerId) return currentIpo;
    if (inspectedPeerId === currentIpo.id) return currentIpo;
    return peerList.find(p => p.id === inspectedPeerId) || currentIpo;
  }, [inspectedPeerId, peerList, currentIpo]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-6">
      
      {/* Top Banner & Title */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5" />
                Cross-Peer Scatter Plot & Regression
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {activeSelectedPeers.length} Peers Selected vs. {dossier.companyName}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Peer Valuation & Operating Performance Correlation
            </h3>
            <p className="text-xs text-slate-400">
              Interactive multi-variable regression mapping the IPO's valuation multiples and operating metrics against listed Bursa Malaysia sector comparables.
            </p>
          </div>

          {/* Quick Preset Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
            {PRESET_CORRELATIONS.map(preset => {
              const isSelected = selectedPreset === preset.id;
              return (
                <button
                  key={`preset-btn-${preset.id}`}
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                  title={preset.rationale}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Axis Dropdowns & Filter Controls */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* X-Axis Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">X-Axis:</span>
              <select
                value={xMetricKey}
                onChange={(e) => {
                  setXMetricKey(e.target.value as PerformanceMetricKey);
                  setSelectedPreset('custom');
                }}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-medium focus:outline-none focus:border-indigo-500"
              >
                {Object.values(METRIC_CATALOG).map(m => (
                  <option key={`x-opt-${m.key}`} value={m.key}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Y-Axis Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Y-Axis:</span>
              <select
                value={yMetricKey}
                onChange={(e) => {
                  setYMetricKey(e.target.value as PerformanceMetricKey);
                  setSelectedPreset('custom');
                }}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-medium focus:outline-none focus:border-indigo-500"
              >
                {Object.values(METRIC_CATALOG).map(m => (
                  <option key={`y-opt-${m.key}`} value={m.key}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Peer Universe Quick Filters */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px] font-mono">Peer Filters:</span>
            <button
              onClick={handleSelectAllPeers}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition-colors"
            >
              All Peers ({peerList.length})
            </button>
            <button
              onClick={() => handleSelectMarket('Main Market')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition-colors"
            >
              Main Market
            </button>
            <button
              onClick={() => handleSelectMarket('ACE Market')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition-colors"
            >
              ACE Market
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 font-semibold text-[11px] transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add Peer
            </button>
          </div>
        </div>
      </div>

      {/* Main Plot Area & Analytics Side Panel */}
      <div className="px-5 grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Interactive Scatter Canvas (3 Cols) */}
        <div className="xl:col-span-3 space-y-3">
          
          <div className="relative bg-slate-950/80 border border-slate-800 rounded-xl p-3 overflow-hidden">
            
            {/* SVG Visualizer */}
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-auto select-none"
              style={{ maxHeight: '420px' }}
            >
              <defs>
                {/* Glow filter for Current IPO */}
                <filter id="glow-ipo" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                
                {/* Gradient for regression line */}
                <linearGradient id="regression-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Background Grid Lines & Ticks */}
              {xTicks.map((tick, idx) => {
                const x = scaleX(tick);
                return (
                  <g key={`x-tick-${idx}`}>
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={svgHeight - padding.bottom}
                      stroke="#1e293b"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={x}
                      y={svgHeight - padding.bottom + 16}
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {xMeta.format(tick)}
                    </text>
                  </g>
                );
              })}

              {yTicks.map((tick, idx) => {
                const y = scaleY(tick);
                return (
                  <g key={`y-tick-${idx}`}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={svgWidth - padding.right}
                      y2={y}
                      stroke="#1e293b"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3}
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {yMeta.format(tick)}
                    </text>
                  </g>
                );
              })}

              {/* Quadrant Median Crosshairs */}
              {stats.n > 1 && (
                <>
                  {/* Vertical Median X */}
                  <line
                    x1={scaleX(stats.medianX)}
                    y1={padding.top}
                    x2={scaleX(stats.medianX)}
                    y2={svgHeight - padding.bottom}
                    stroke="#475569"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                    opacity="0.6"
                  />
                  {/* Horizontal Median Y */}
                  <line
                    x1={padding.left}
                    y1={scaleY(stats.medianY)}
                    x2={svgWidth - padding.right}
                    y2={scaleY(stats.medianY)}
                    stroke="#475569"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                    opacity="0.6"
                  />
                  {/* Quadrant Watermark Badges */}
                  <text
                    x={svgWidth - padding.right - 10}
                    y={padding.top + 16}
                    fill="#475569"
                    fontSize="9"
                    fontFamily="sans-serif"
                    fontWeight="600"
                    textAnchor="end"
                    opacity="0.7"
                  >
                    High {xMeta.shortLabel} / High {yMeta.shortLabel}
                  </text>
                  <text
                    x={svgWidth - padding.right - 10}
                    y={svgHeight - padding.bottom - 10}
                    fill="#10b981"
                    fontSize="9"
                    fontFamily="sans-serif"
                    fontWeight="700"
                    textAnchor="end"
                    opacity="0.8"
                  >
                    ★ Value Re-rating Zone (High Growth / Low Multiple)
                  </text>
                </>
              )}

              {/* Linear Regression Trendline */}
              {regressionLineCoords && (
                <g>
                  <line
                    x1={regressionLineCoords.x1}
                    y1={regressionLineCoords.y1}
                    x2={regressionLineCoords.x2}
                    y2={regressionLineCoords.y2}
                    stroke="url(#regression-grad)"
                    strokeWidth="2"
                    strokeDasharray="5,3"
                  />
                  {/* Line label */}
                  <text
                    x={regressionLineCoords.x2 - 12}
                    y={regressionLineCoords.y2 - 6}
                    fill="#38bdf8"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    Peer Regression (R² = {stats.rSquared.toFixed(2)})
                  </text>
                </g>
              )}

              {/* Scatter Points: Selected Peer Companies */}
              {activeSelectedPeers.map((peer, idx) => {
                const xVal = Number(peer[xMetricKey] ?? 0);
                const yVal = Number(peer[yMetricKey] ?? 0);
                const cx = scaleX(xVal);
                const cy = scaleY(yVal);
                const isHovered = hoveredPeerId === peer.id;
                const isInspected = inspectedPeerId === peer.id;

                return (
                  <g 
                    key={`peer-scatter-dot-${peer.id}-${idx}`}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredPeerId(peer.id)}
                    onMouseLeave={() => setHoveredPeerId(null)}
                    onClick={() => setInspectedPeerId(peer.id)}
                  >
                    {/* Highlight ring on hover or inspect */}
                    {(isHovered || isInspected) && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isInspected ? 14 : 11}
                        fill="none"
                        stroke={isInspected ? '#38bdf8' : '#818cf8'}
                        strokeWidth="2"
                        strokeDasharray={isInspected ? 'none' : '2,2'}
                        opacity="0.9"
                      />
                    )}

                    {/* Point Circle */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isInspected ? 7 : isHovered ? 6 : 5}
                      fill={isInspected ? '#38bdf8' : isHovered ? '#818cf8' : '#6366f1'}
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />

                    {/* Ticker Label Tag */}
                    <text
                      x={cx}
                      y={cy - 9}
                      fill={isInspected ? '#38bdf8' : isHovered ? '#ffffff' : '#94a3b8'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight={isInspected || isHovered ? 'bold' : 'normal'}
                      textAnchor="middle"
                    >
                      {peer.ticker.replace('.KL', '')}
                    </text>
                  </g>
                );
              })}

              {/* Scatter Point: Current IPO (Luminous & Distinct) */}
              {(() => {
                const ipoX = Number(currentIpo[xMetricKey] ?? 0);
                const ipoY = Number(currentIpo[yMetricKey] ?? 0);
                const cx = scaleX(ipoX);
                const cy = scaleY(ipoY);
                const isHovered = hoveredPeerId === currentIpo.id;
                const isInspected = inspectedPeerId === currentIpo.id || inspectedPeerId === null;

                return (
                  <g 
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPeerId(currentIpo.id)}
                    onMouseLeave={() => setHoveredPeerId(null)}
                    onClick={() => setInspectedPeerId(currentIpo.id)}
                  >
                    {/* Outer animated halo ring */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="16"
                      fill="#10b981"
                      opacity="0.2"
                      className="animate-pulse"
                    />

                    {/* Mid Target Ring */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="10"
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="1.5"
                      opacity="0.8"
                    />

                    {/* Central Core */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="6.5"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                      filter="url(#glow-ipo)"
                    />

                    {/* Prominent Callout Banner */}
                    <g transform={`translate(${cx}, ${cy - 14})`}>
                      <rect
                        x="-48"
                        y="-16"
                        width="96"
                        height="16"
                        rx="4"
                        fill="#064e3b"
                        stroke="#10b981"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="-5"
                        fill="#34d399"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        ★ CURRENT IPO
                      </text>
                    </g>
                  </g>
                );
              })()}

              {/* Axis Titles */}
              <text
                x={padding.left + plotWidth / 2}
                y={svgHeight - 10}
                fill="#cbd5e1"
                fontSize="11"
                fontWeight="600"
                fontFamily="sans-serif"
                textAnchor="middle"
              >
                {xMeta.label} ({xMeta.unit})
              </text>

              <text
                x={-padding.top - plotHeight / 2}
                y={15}
                transform="rotate(-90)"
                fill="#cbd5e1"
                fontSize="11"
                fontWeight="600"
                fontFamily="sans-serif"
                textAnchor="middle"
              >
                {yMeta.label} ({yMeta.unit})
              </text>
            </svg>

            {/* Interactive Floating Hover Details Pill */}
            {hoveredPeerId && (() => {
              const item = hoveredPeerId === currentIpo.id 
                ? currentIpo 
                : peerList.find(p => p.id === hoveredPeerId);
              if (!item) return null;
              const xVal = Number(item[xMetricKey] ?? 0);
              const yVal = Number(item[yMetricKey] ?? 0);
              const isIpo = item.id === currentIpo.id;

              return (
                <div className="absolute top-4 right-4 bg-slate-900/95 border border-indigo-500/40 rounded-xl p-2.5 shadow-2xl backdrop-blur-md text-xs space-y-1 z-20 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    {isIpo ? (
                      <span className="text-emerald-400">★ {item.name}</span>
                    ) : (
                      <span>{item.name} ({item.ticker})</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] font-mono pt-1 text-slate-300">
                    <div>{xMeta.shortLabel}: <strong className="text-white">{xMeta.format(xVal)}</strong></div>
                    <div>{yMeta.shortLabel}: <strong className="text-white">{yMeta.format(yVal)}</strong></div>
                    <div>Market Cap: <span className="text-slate-400">{METRIC_CATALOG.marketCapRM.format(item.marketCapRM || 0)}</span></div>
                    <div>Exchange: <span className="text-slate-400">{item.market || 'Bursa'}</span></div>
                  </div>
                </div>
              );
            })()}

          </div>

          {/* Peer Selection Toggles Strip */}
          <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                Active Peer Comparables in Regression Model:
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Click peer pill to toggle inclusion / Click name to inspect
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {peerList.map(peer => {
                const isSelected = selectedPeerIds.has(peer.id);
                const isInspected = inspectedPeerId === peer.id;

                return (
                  <div
                    key={`peer-chip-${peer.id}`}
                    className={`group flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                      isSelected
                        ? isInspected
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sm'
                          : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600'
                        : 'bg-slate-900/60 text-slate-500 border-slate-800/80 opacity-60'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleTogglePeer(peer.id)}
                      className="p-0.5 hover:text-white"
                      title={isSelected ? 'Exclude from regression' : 'Include in regression'}
                    >
                      <div className={`w-3 h-3 rounded flex items-center justify-center border ${
                        isSelected ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-600'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </button>
                    
                    <span 
                      onClick={() => setInspectedPeerId(peer.id)}
                      className="cursor-pointer hover:text-white hover:underline truncate max-w-[140px]"
                      title={`${peer.name} (${peer.ticker})`}
                    >
                      {peer.ticker.replace('.KL', '')}
                    </span>

                    {/* Delete custom peer button */}
                    {peer.id.startsWith('custom-peer-') && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePeer(peer.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 ml-0.5"
                        title="Delete custom peer"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Statistical Insights & Focused Comparison Panel (1 Col) */}
        <div className="space-y-4">
          
          {/* Statistical Regression Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                Regression Statistics
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                N = {stats.n} Peers
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Pearson Correlation (r):</span>
                <span className="font-mono font-bold text-white">
                  {stats.r >= 0 ? `+${stats.r.toFixed(3)}` : stats.r.toFixed(3)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Determination (R²):</span>
                <span className="font-mono font-bold text-indigo-300">
                  {(stats.rSquared * 100).toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Regression Slope (m):</span>
                <span className="font-mono text-slate-300">
                  {stats.slope.toFixed(3)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                <strong className="text-indigo-300 block mb-0.5">{stats.strength}</strong>
                {stats.rSquared >= 0.3 ? (
                  <span>
                    Peers exhibit clear linear relationship: every 1 unit increase in {xMeta.shortLabel} is associated with a {stats.slope >= 0 ? `+${stats.slope.toFixed(2)}` : stats.slope.toFixed(2)} unit shift in {yMeta.shortLabel}.
                  </span>
                ) : (
                  <span>
                    Valuation dispersion is wide across sector comparables, reflecting heterogeneous business models and growth rates.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Current IPO Positioning Assessment */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                IPO Pricing Verdict
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Implied Valuation
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Actual IPO {yMeta.shortLabel}:</span>
                <span className="font-mono font-bold text-white">
                  {yMeta.format(Number(currentIpo[yMetricKey] ?? 0))}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Model Predicted {yMeta.shortLabel}:</span>
                <span className="font-mono font-semibold text-slate-300">
                  {yMeta.format(stats.predictedIpoY)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Spread to Trendline:</span>
                <span className={`font-mono font-bold ${
                  stats.ipoSpread <= 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {stats.ipoSpread >= 0 ? `+${stats.ipoSpread.toFixed(1)}` : stats.ipoSpread.toFixed(1)} {yMeta.unit} ({stats.ipoSpreadPct >= 0 ? `+${stats.ipoSpreadPct.toFixed(1)}%` : `${stats.ipoSpreadPct.toFixed(1)}%`})
                </span>
              </div>

              <div className={`p-2.5 rounded-lg border text-[11px] leading-relaxed ${
                stats.ipoSpread <= 0
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                  : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
              }`}>
                {stats.ipoSpread <= 0 ? (
                  <div>
                    <strong>★ Valuation Entry Discount:</strong> At {xMeta.format(Number(currentIpo[xMetricKey] ?? 0))}, {dossier.companyName} is priced {Math.abs(stats.ipoSpreadPct).toFixed(1)}% below peer regression fair value, offering multiple expansion upside.
                  </div>
                ) : (
                  <div>
                    <strong>Premium Pricing:</strong> At {xMeta.format(Number(currentIpo[xMetricKey] ?? 0))}, the IPO trades at a {stats.ipoSpreadPct.toFixed(1)}% premium to peer trendline, requiring high execution delivery.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Focused Peer Inspector Side-by-Side Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white truncate max-w-[180px]">
                {activeInspected.name}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {activeInspected.ticker}
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">P/E Multiple:</span>
                <span className="text-white font-semibold">{activeInspected.pe.toFixed(1)}x</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">Revenue Growth:</span>
                <span className="text-white font-semibold">{activeInspected.revenueGrowth.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">Gross Margin:</span>
                <span className="text-white font-semibold">{activeInspected.gpMargin.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">PAT Margin:</span>
                <span className="text-white font-semibold">{activeInspected.patMargin.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">ROE:</span>
                <span className="text-white font-semibold">{activeInspected.roe.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">Gearing:</span>
                <span className="text-white font-semibold">{activeInspected.gearingRatio.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Market Cap:</span>
                <span className="text-white font-semibold">RM {activeInspected.marketCapRM?.toLocaleString() || '-'}M</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Comprehensive Peer Matrix Table with Residual Distances */}
      <div className="border-t border-slate-800 bg-slate-950/30 p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-white">Full Peer Comparables Metric Matrix & Regression Residuals</h4>
            <p className="text-xs text-slate-400">Audited indicators across all active peers in the correlation dataset</p>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Green highlights indicate top-quartile performance
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Company</th>
                <th className="py-2.5 px-3">Ticker</th>
                <th className="py-2.5 px-3 text-right">P/E (x)</th>
                <th className="py-2.5 px-3 text-right">Rev Growth</th>
                <th className="py-2.5 px-3 text-right">GP Margin</th>
                <th className="py-2.5 px-3 text-right">PAT Margin</th>
                <th className="py-2.5 px-3 text-right">ROE (%)</th>
                <th className="py-2.5 px-3 text-right">Gearing</th>
                <th className="py-2.5 px-3 text-right">Market Cap</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              
              {/* Current IPO Row */}
              <tr className="bg-emerald-950/20 hover:bg-emerald-950/30 transition-colors font-semibold">
                <td className="py-2.5 px-3 text-emerald-400 flex items-center gap-1.5 font-sans">
                  <span>★</span> {currentIpo.name}
                </td>
                <td className="py-2.5 px-3 text-emerald-300 font-bold">{currentIpo.ticker}</td>
                <td className="py-2.5 px-3 text-right font-bold text-white">{currentIpo.pe.toFixed(1)}x</td>
                <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">+{currentIpo.revenueGrowth.toFixed(1)}%</td>
                <td className="py-2.5 px-3 text-right text-white">{currentIpo.gpMargin.toFixed(1)}%</td>
                <td className="py-2.5 px-3 text-right text-white">{currentIpo.patMargin.toFixed(1)}%</td>
                <td className="py-2.5 px-3 text-right text-emerald-400">{currentIpo.roe.toFixed(1)}%</td>
                <td className="py-2.5 px-3 text-right text-white">{currentIpo.gearingRatio.toFixed(2)}x</td>
                <td className="py-2.5 px-3 text-right text-white">RM {currentIpo.marketCapRM?.toLocaleString()}M</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    IPO ISSUER
                  </span>
                </td>
              </tr>

              {/* Peer Rows */}
              {peerList.map((p, idx) => {
                const isSelected = selectedPeerIds.has(p.id);
                const isInspected = inspectedPeerId === p.id;

                return (
                  <tr 
                    key={`matrix-row-${p.id}-${idx}`}
                    onClick={() => setInspectedPeerId(p.id)}
                    className={`cursor-pointer transition-colors ${
                      isInspected 
                        ? 'bg-sky-950/30' 
                        : isSelected 
                          ? 'hover:bg-slate-800/40' 
                          : 'opacity-50 hover:bg-slate-800/20'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-slate-200 font-sans truncate max-w-[180px]">
                      {p.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{p.ticker}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-white">{p.pe.toFixed(1)}x</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">+{p.revenueGrowth.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{p.gpMargin.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{p.patMargin.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{p.roe.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{p.gearingRatio.toFixed(2)}x</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">RM {p.marketCapRM?.toLocaleString() || '-'}M</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        isSelected 
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {isSelected ? 'INCLUDED' : 'EXCLUDED'}
                      </span>
                    </td>
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Peer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4">
            
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-400" />
                  Add Custom Peer Company
                </h3>
                <p className="text-xs text-slate-400">
                  Inject an ad-hoc listed peer into the regression and scatter plot universe
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomPeer} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Healthcare Berhad"
                    value={newPeerName}
                    onChange={(e) => setNewPeerName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Ticker Symbol</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. APEX.KL"
                    value={newPeerTicker}
                    onChange={(e) => setNewPeerTicker(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">P/E Multiple (x)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newPeerPe}
                    onChange={(e) => setNewPeerPe(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Rev Growth (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newPeerGrowth}
                    onChange={(e) => setNewPeerGrowth(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">GP Margin (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newPeerGp}
                    onChange={(e) => setNewPeerGp(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">PAT Margin (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newPeerPat}
                    onChange={(e) => setNewPeerPat(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">ROE (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newPeerRoe}
                    onChange={(e) => setNewPeerRoe(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Gearing (x)</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={newPeerGearing}
                    onChange={(e) => setNewPeerGearing(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Market Capitalization (RM M)</label>
                  <input
                    type="number"
                    step="10"
                    required
                    value={newPeerMarketCap}
                    onChange={(e) => setNewPeerMarketCap(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Market Tier</label>
                  <select
                    value={newPeerMarket}
                    onChange={(e) => setNewPeerMarket(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Bursa Main Market">Bursa Main Market</option>
                    <option value="Bursa ACE Market">Bursa ACE Market</option>
                    <option value="Regional / SGX">Regional / SGX</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add to Regression Model
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
