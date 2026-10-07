import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { 
  Layers, 
  TrendingUp, 
  Sparkles, 
  Eye, 
  ExternalLink, 
  Filter, 
  Maximize2, 
  Activity, 
  BarChart3, 
  DollarSign, 
  PieChart, 
  SlidersHorizontal, 
  X, 
  Info,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { TrackedIpoItem } from '../types';
import { loadStoredTrackedIpos } from '../services/ipoStorage';
import { 
  BURSA_SECTORS, 
  SectorDefinition, 
  getIpoSector, 
  getIpoEnrichedMetrics 
} from '../utils/ipoSectorData';
import { RESEARCH_HOUSES } from '../data/defaultTrackedIpos';

interface IpoSectorHeatmapProps {
  ipos?: TrackedIpoItem[];
  onSelectIpo?: (ipo: TrackedIpoItem) => void;
  onNavigateToTracker?: (stockName?: string) => void;
}

type SizeMetric = 'marketCap' | 'issueSize' | 'equal';
type ColorMetric = 'upside' | 'peMultiple' | 'oversubscription' | 'debut';

interface TreemapLeafData {
  name: string;
  ipo: TrackedIpoItem;
  sector: SectorDefinition;
  value: number;
  upsidePct: number;
  peMultiple: number;
  osPublic: number;
  price: number;
  marketCapRM: number;
  issueSizeRM: number;
  status: 'UPCOMING' | 'PAST_LISTED';
}

export const IpoSectorHeatmap: React.FC<IpoSectorHeatmapProps> = ({
  ipos: propIpos,
  onSelectIpo,
  onNavigateToTracker,
}) => {
  // Load IPOs from props or local storage
  const allIpos = useMemo(() => {
    return (propIpos && propIpos.length > 0) ? propIpos : loadStoredTrackedIpos();
  }, [propIpos]);

  // Controls & View States
  const [sizeMetric, setSizeMetric] = useState<SizeMetric>('marketCap');
  const [colorMetric, setColorMetric] = useState<ColorMetric>('upside');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UPCOMING' | 'PAST'>('ALL');
  const [selectedSectorId, setSelectedSectorId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredIpo, setHoveredIpo] = useState<{
    leaf: TreemapLeafData;
    x: number;
    y: number;
  } | null>(null);
  const [activeModalIpo, setActiveModalIpo] = useState<TrackedIpoItem | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 900, height: 500 });

  // Responsive resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(320, rect.width),
          height: Math.max(420, Math.min(580, rect.width * 0.55)),
        });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Filtered dataset
  const filteredIpos = useMemo(() => {
    return allIpos.filter((item) => {
      if (statusFilter === 'UPCOMING' && item.status !== 'UPCOMING') return false;
      if (statusFilter === 'PAST' && item.status !== 'PAST_LISTED') return false;

      const sector = getIpoSector(item);
      if (selectedSectorId !== 'ALL' && sector.id !== selectedSectorId) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.stockName.toLowerCase().includes(q) || (item.fullName || '').toLowerCase().includes(q);
        const matchesSector = sector.name.toLowerCase().includes(q);
        return matchesName || matchesSector;
      }

      return true;
    });
  }, [allIpos, statusFilter, selectedSectorId, searchQuery]);

  // Sector Aggregations & Distribution Stats
  const sectorSummaries = useMemo(() => {
    const map = new Map<string, {
      sector: SectorDefinition;
      ipos: TrackedIpoItem[];
      totalMarketCap: number;
      avgUpside: number;
      avgPE: number;
      maxOs: number;
      upcomingCount: number;
    }>();

    Object.values(BURSA_SECTORS).forEach((sec) => {
      map.set(sec.id, {
        sector: sec,
        ipos: [],
        totalMarketCap: 0,
        avgUpside: 0,
        avgPE: 0,
        maxOs: 0,
        upcomingCount: 0,
      });
    });

    allIpos.forEach((item) => {
      const sec = getIpoSector(item);
      const metrics = getIpoEnrichedMetrics(item);
      const entry = map.get(sec.id);
      if (entry) {
        entry.ipos.push(item);
        entry.totalMarketCap += item.marketCapRMJuta || 0;
        if (item.status === 'UPCOMING') entry.upcomingCount++;
        if (item.osPublic && item.osPublic > entry.maxOs) {
          entry.maxOs = item.osPublic;
        }
      }
    });

    // Compute averages
    map.forEach((entry) => {
      if (entry.ipos.length > 0) {
        const upsides = entry.ipos.map(i => getIpoEnrichedMetrics(i).upsidePct).filter(u => u !== 0);
        entry.avgUpside = upsides.length > 0 ? Number((upsides.reduce((a, b) => a + b, 0) / upsides.length).toFixed(1)) : 0;
        const pes = entry.ipos.map(i => getIpoEnrichedMetrics(i).peMultiple);
        entry.avgPE = Number((pes.reduce((a, b) => a + b, 0) / pes.length).toFixed(1));
      }
    });

    return Array.from(map.values()).filter(s => s.ipos.length > 0);
  }, [allIpos]);

  // Overall KPI metrics
  const kpis = useMemo(() => {
    const totalCap = allIpos.reduce((acc, curr) => acc + (curr.marketCapRMJuta || 0), 0);
    const upcomingList = allIpos.filter(i => i.status === 'UPCOMING');
    const pastList = allIpos.filter(i => i.status === 'PAST_LISTED');

    // Sector with highest capital
    const sortedByCap = [...sectorSummaries].sort((a, b) => b.totalMarketCap - a.totalMarketCap);
    const topCapSector = sortedByCap[0];

    // Sector with highest average upside
    const sortedByUpside = [...sectorSummaries].sort((a, b) => b.avgUpside - a.avgUpside);
    const topUpsideSector = sortedByUpside[0];

    // Peak demand
    let peakOs = 0;
    let peakOsStock = '';
    allIpos.forEach(i => {
      if (i.osPublic && i.osPublic > peakOs) {
        peakOs = i.osPublic;
        peakOsStock = i.stockName;
      }
    });

    return {
      totalCap,
      totalCount: allIpos.length,
      upcomingCount: upcomingList.length,
      pastCount: pastList.length,
      topCapSector,
      topUpsideSector,
      peakOs,
      peakOsStock,
    };
  }, [allIpos, sectorSummaries]);

  // Construct D3 Treemap layout
  const treemapLayout = useMemo(() => {
    if (filteredIpos.length === 0 || dimensions.width <= 0 || dimensions.height <= 0) {
      return null;
    }

    // Group items by sector
    const sectorGroups = d3.group(filteredIpos, (d) => getIpoSector(d).id);

    const hierarchyData = {
      name: 'root',
      children: Array.from(sectorGroups, ([sectorId, items]) => {
        const sectorDef = BURSA_SECTORS[sectorId] || BURSA_SECTORS.industrial;
        return {
          name: sectorDef.name,
          sector: sectorDef,
          children: items.map((ipo) => {
            const m = getIpoEnrichedMetrics(ipo);
            let val = 1;
            if (sizeMetric === 'marketCap') val = Math.max(20, ipo.marketCapRMJuta || 50);
            else if (sizeMetric === 'issueSize') val = Math.max(10, m.issueSizeRM || 20);
            else val = 100;

            return {
              name: ipo.stockName,
              ipo,
              sector: sectorDef,
              value: val,
              upsidePct: m.upsidePct,
              peMultiple: m.peMultiple,
              osPublic: ipo.osPublic || 0,
              price: ipo.price,
              marketCapRM: ipo.marketCapRMJuta,
              issueSizeRM: m.issueSizeRM,
              status: ipo.status,
            };
          }),
        };
      }),
    };

    const root = d3.hierarchy(hierarchyData)
      .sum((d: any) => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemap = d3.treemap<any>()
      .size([dimensions.width, dimensions.height])
      .paddingTop(26)
      .paddingRight(4)
      .paddingBottom(4)
      .paddingLeft(4)
      .paddingInner(3)
      .round(true);

    treemap(root);

    return root;
  }, [filteredIpos, sizeMetric, dimensions]);

  // D3 Color Resolvers based on selected colorMetric
  const getNodeColor = (leaf: TreemapLeafData) => {
    if (colorMetric === 'upside') {
      // Diverging green / teal / rose scale
      const u = leaf.upsidePct;
      if (u <= -10) return '#be123c'; // Rose-700
      if (u < 0) return '#e11d48'; // Rose-600
      if (u === 0) return '#334155'; // Slate-700 (parity)
      if (u < 15) return '#0f766e'; // Teal-700
      if (u < 30) return '#0d9488'; // Teal-600
      if (u < 45) return '#059669'; // Emerald-600
      return '#047857'; // Deep emerald
    }

    if (colorMetric === 'peMultiple') {
      // P/E multiple relative scale: blue (low) -> amber (medium) -> red (high)
      const pe = leaf.peMultiple;
      if (pe < 12) return '#1e40af'; // Blue-800
      if (pe < 16) return '#0284c7'; // Sky-600
      if (pe < 22) return '#d97706'; // Amber-600
      if (pe < 28) return '#ea580c'; // Orange-600
      return '#dc2626'; // Red-600
    }

    if (colorMetric === 'oversubscription') {
      // Retail demand heat: purple -> pink -> rose
      const os = leaf.osPublic;
      if (os <= 0) return '#334155';
      if (os < 15) return '#475569';
      if (os < 35) return '#6366f1'; // Indigo
      if (os < 75) return '#8b5cf6'; // Violet
      if (os < 150) return '#d946ef'; // Fuchsia
      return '#f43f5e'; // Bright rose flame
    }

    if (colorMetric === 'debut') {
      if (leaf.status === 'UPCOMING') return '#b45309'; // Amber pending
      const openVal = leaf.ipo.nineAmOpen?.price;
      if (openVal !== undefined && leaf.ipo.price > 0) {
        return openVal >= leaf.ipo.price ? '#059669' : '#e11d48';
      }
      if (leaf.ipo.nineAmOpen?.status === 'GAIN') return '#059669';
      if (leaf.ipo.nineAmOpen?.status === 'FAIL') return '#e11d48';
      return '#475569';
    }

    return leaf.sector.color;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5 animate-in fade-in duration-300">
      
      {/* Top Header Deck: Title, Description, and Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Interactive D3 Heatmap Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Bursa Malaysia Pipeline Distribution & Valuation Trends
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <span>IPO Sector Treemap & Valuation Heatmap</span>
            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {filteredIpos.length} Companies
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-3xl">
            Proportional visualization of capital distribution across Bursa Malaysia industry sectors. Tile size represents relative capital scale; color intensity reflects broker consensus upside and valuation heat.
          </p>
        </div>

        {/* Quick Link to Master Table */}
        <div className="flex items-center gap-2">
          {onNavigateToTracker && (
            <button
              onClick={() => onNavigateToTracker()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in IPO Master Sheet</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Intelligence Strip: Sector Insights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Dominant Capital Sector</div>
          <div className="text-sm sm:text-base font-bold text-white mt-0.5 truncate">
            {kpis.topCapSector?.sector.shortName || 'Industrial'}
          </div>
          <div className="text-[10px] text-indigo-400 font-mono mt-0.5">
            RM {kpis.topCapSector?.totalMarketCap}M ({kpis.topCapSector?.ipos.length} IPOs)
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[10px] text-emerald-400 uppercase font-mono">Highest Broker Upside</div>
          <div className="text-sm sm:text-base font-bold text-emerald-300 mt-0.5 truncate">
            {kpis.topUpsideSector?.sector.shortName || 'Renewable'}
          </div>
          <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5">
            Avg +{kpis.topUpsideSector?.avgUpside}% upside consensus
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[10px] text-pink-400 uppercase font-mono">Peak Retail Demand</div>
          <div className="text-sm sm:text-base font-bold text-pink-300 mt-0.5 truncate">
            {kpis.peakOsStock || 'Ecosys'} ({kpis.peakOs}x)
          </div>
          <div className="text-[10px] text-pink-400/80 font-mono mt-0.5">
            Highest public oversubscription
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[10px] text-amber-400 uppercase font-mono">Upcoming Pipeline</div>
          <div className="text-sm sm:text-base font-bold text-amber-300 mt-0.5">
            {kpis.upcomingCount} Scheduled Issues
          </div>
          <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">
            {kpis.pastCount} Past listed benchmarked
          </div>
        </div>
      </div>

      {/* Interactive Controls & Switchers Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
        
        {/* Left: Tile Sizing & Heatmap Coloring Dimensions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sizing Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl p-1">
            <span className="text-[11px] text-slate-400 font-medium px-1.5 flex items-center gap-1">
              <Maximize2 className="w-3 h-3 text-indigo-400" />
              <span>Tile Size:</span>
            </span>
            <button
              onClick={() => setSizeMetric('marketCap')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                sizeMetric === 'marketCap'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Market Cap
            </button>
            <button
              onClick={() => setSizeMetric('issueSize')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                sizeMetric === 'issueSize'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Issue Size
            </button>
            <button
              onClick={() => setSizeMetric('equal')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                sizeMetric === 'equal'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Equal
            </button>
          </div>

          {/* Color Scale Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl p-1">
            <span className="text-[11px] text-slate-400 font-medium px-1.5 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>Color Heat:</span>
            </span>
            <button
              onClick={() => setColorMetric('upside')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                colorMetric === 'upside'
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Consensus Upside (%)
            </button>
            <button
              onClick={() => setColorMetric('peMultiple')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                colorMetric === 'peMultiple'
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              P/E Valuation (x)
            </button>
            <button
              onClick={() => setColorMetric('oversubscription')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                colorMetric === 'oversubscription'
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Oversubscription (x)
            </button>
            <button
              onClick={() => setColorMetric('debut')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                colorMetric === 'debut'
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Debut Open ✓/✕
            </button>
          </div>
        </div>

        {/* Right: Pipeline Status Filter & Sector Isolation */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('UPCOMING')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                statusFilter === 'UPCOMING' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Upcoming ({kpis.upcomingCount})
            </button>
            <button
              onClick={() => setStatusFilter('PAST')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                statusFilter === 'PAST' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Past Listed ({kpis.pastCount})
            </button>
          </div>

          {/* Quick Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Filter ticker / sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-7 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-36 sm:w-44 font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1.5 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Sector Quick Filter Tags Pill Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-mono">
        <button
          onClick={() => setSelectedSectorId('ALL')}
          className={`px-3 py-1 rounded-lg border transition-all cursor-pointer flex-shrink-0 ${
            selectedSectorId === 'ALL'
              ? 'bg-white text-slate-900 border-white font-bold shadow-sm'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          All Sectors ({allIpos.length})
        </button>

        {Object.values(BURSA_SECTORS).map((sec) => {
          const count = allIpos.filter(i => getIpoSector(i).id === sec.id).length;
          if (count === 0) return null;
          const isSelected = selectedSectorId === sec.id;

          return (
            <button
              key={sec.id}
              onClick={() => setSelectedSectorId(isSelected ? 'ALL' : sec.id)}
              className={`px-3 py-1 rounded-lg border transition-all cursor-pointer flex-shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-slate-800 text-white font-bold shadow-sm'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
              style={{ borderColor: isSelected ? sec.color : undefined }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sec.color }} />
              <span>{sec.shortName}</span>
              <span className="text-[10px] text-slate-500">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Interactive D3 Treemap Visualization Container */}
      <div 
        ref={containerRef} 
        className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner select-none"
        style={{ minHeight: dimensions.height }}
      >
        {treemapLayout ? (
          <svg 
            width={dimensions.width} 
            height={dimensions.height}
            className="w-full h-full block"
          >
            {/* Sector Parent Headers & Boundaries */}
            {treemapLayout.children?.map((sectorNode: any, sIdx: number) => {
              const sectorDef: SectorDefinition = sectorNode.data.sector || BURSA_SECTORS.industrial;
              const sWidth = Math.max(0, sectorNode.x1 - sectorNode.x0);
              const sHeight = Math.max(0, sectorNode.y1 - sectorNode.y0);

              if (sWidth < 30 || sHeight < 30) return null;

              return (
                <g key={`sec-${sectorDef.id}-${sIdx}`} className="sector-group">
                  {/* Sector Header Background Banner */}
                  <rect
                    x={sectorNode.x0}
                    y={sectorNode.y0}
                    width={sWidth}
                    height={24}
                    fill="#0f172a"
                    stroke="#1e293b"
                    strokeWidth={1}
                  />

                  {/* Accent color strip on sector banner */}
                  <rect
                    x={sectorNode.x0}
                    y={sectorNode.y0}
                    width={3}
                    height={24}
                    fill={sectorDef.color}
                  />

                  {/* Sector Name & Count Label */}
                  {sWidth > 80 && (
                    <text
                      x={sectorNode.x0 + 8}
                      y={sectorNode.y0 + 16}
                      fill="#e2e8f0"
                      fontSize={11}
                      fontWeight="bold"
                      fontFamily="monospace"
                      className="pointer-events-none select-none tracking-tight"
                    >
                      {sWidth > 180 ? sectorDef.name : sectorDef.shortName}
                      <tspan fill="#64748b" dx={6} fontSize={10} fontWeight="normal">
                        ({sectorNode.children?.length || 0})
                      </tspan>
                    </text>
                  )}

                  {/* Sector Outer Box Outline */}
                  <rect
                    x={sectorNode.x0}
                    y={sectorNode.y0}
                    width={sWidth}
                    height={sHeight}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth={1}
                    className="pointer-events-none"
                  />
                </g>
              );
            })}

            {/* Individual IPO Leaf Nodes */}
            {treemapLayout.leaves().map((leafNode: any, idx: number) => {
              const d: TreemapLeafData = leafNode.data;
              const w = Math.max(0, leafNode.x1 - leafNode.x0);
              const h = Math.max(0, leafNode.y1 - leafNode.y0);

              if (w < 8 || h < 8) return null;

              const bgFill = getNodeColor(d);
              const isHovered = hoveredIpo?.leaf.ipo.id === d.ipo.id;
              const isUpcoming = d.status === 'UPCOMING';

              return (
                <g
                  key={`tile-${d.ipo.id}-${idx}`}
                  className="cursor-pointer transition-transform duration-150"
                  onClick={() => {
                    setActiveModalIpo(d.ipo);
                    if (onSelectIpo) onSelectIpo(d.ipo);
                  }}
                  onMouseEnter={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    setHoveredIpo({
                      leaf: d,
                      x: e.clientX - (rect?.left || 0),
                      y: e.clientY - (rect?.top || 0),
                    });
                  }}
                  onMouseMove={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    setHoveredIpo({
                      leaf: d,
                      x: e.clientX - (rect?.left || 0),
                      y: e.clientY - (rect?.top || 0),
                    });
                  }}
                  onMouseLeave={() => setHoveredIpo(null)}
                >
                  {/* Leaf Tile Rectangle */}
                  <rect
                    x={leafNode.x0}
                    y={leafNode.y0}
                    width={w}
                    height={h}
                    rx={6}
                    fill={bgFill}
                    stroke={isHovered ? '#ffffff' : (isUpcoming ? '#fbbf24' : '#0f172a')}
                    strokeWidth={isHovered ? 2 : (isUpcoming ? 1.5 : 1)}
                    className="transition-colors duration-150"
                    opacity={isHovered ? 1 : 0.9}
                  />

                  {/* Glowing border if Upcoming IPO */}
                  {isUpcoming && w > 45 && h > 35 && (
                    <rect
                      x={leafNode.x0 + 2}
                      y={leafNode.y0 + 2}
                      width={w - 4}
                      height={h - 4}
                      rx={4}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      opacity={0.6}
                      className="pointer-events-none"
                    />
                  )}

                  {/* Leaf Content Text */}
                  {w > 38 && h > 26 && (
                    <g className="pointer-events-none select-none">
                      {/* Stock Ticker Name */}
                      <text
                        x={leafNode.x0 + w / 2}
                        y={h > 48 ? leafNode.y0 + h / 2 - 8 : leafNode.y0 + h / 2 + 4}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={Math.min(14, Math.max(10, Math.min(w / 6, h / 3.5)))}
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        {d.ipo.stockName}
                      </text>

                      {/* Metric Indicator Line */}
                      {h > 46 && (
                        <text
                          x={leafNode.x0 + w / 2}
                          y={leafNode.y0 + h / 2 + 10}
                          textAnchor="middle"
                          fill="#f8fafc"
                          fontSize={Math.min(11, Math.max(9, Math.min(w / 8, h / 4.5)))}
                          fontFamily="monospace"
                          fontWeight="bold"
                          opacity={0.95}
                        >
                          {colorMetric === 'upside' && (
                            d.upsidePct !== 0 ? `${d.upsidePct > 0 ? '+' : ''}${d.upsidePct}%` : `RM${d.price.toFixed(2)}`
                          )}
                          {colorMetric === 'peMultiple' && `${d.peMultiple}x PE`}
                          {colorMetric === 'oversubscription' && (d.osPublic > 0 ? `${d.osPublic}x OS` : `RM${d.price.toFixed(2)}`)}
                          {colorMetric === 'debut' && (isUpcoming ? 'Upcoming' : `Open vs IPO`)}
                        </text>
                      )}

                      {/* Small Capital Size footer if tile is large enough */}
                      {w > 85 && h > 75 && (
                        <text
                          x={leafNode.x0 + w / 2}
                          y={leafNode.y0 + h - 8}
                          textAnchor="middle"
                          fill="#cbd5e1"
                          fontSize={9}
                          fontFamily="monospace"
                          opacity={0.8}
                        >
                          RM {d.marketCapRM}M
                        </text>
                      )}
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-slate-400 space-y-2">
            <Info className="w-8 h-8 text-slate-500" />
            <p className="text-sm font-medium">No IPO pipeline candidates match current filters.</p>
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setSelectedSectorId('ALL');
                setSearchQuery('');
              }}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Floating Tooltip Hover Card */}
        {hoveredIpo && (
          <div 
            className="absolute z-30 pointer-events-none bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 shadow-2xl space-y-2 w-64 text-xs font-sans transition-all duration-75"
            style={{
              left: Math.min(dimensions.width - 275, Math.max(10, hoveredIpo.x + 15)),
              top: Math.min(dimensions.height - 230, Math.max(10, hoveredIpo.y + 15)),
            }}
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-white text-sm tracking-tight">{hoveredIpo.leaf.ipo.stockName}</h4>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                    hoveredIpo.leaf.status === 'UPCOMING'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {hoveredIpo.leaf.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">{hoveredIpo.leaf.ipo.fullName || `${hoveredIpo.leaf.ipo.stockName} Berhad`}</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: hoveredIpo.leaf.sector.color }} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800/80">
                <span className="text-[9px] text-slate-500 uppercase block">IPO Price</span>
                <span className="font-bold text-white">RM {hoveredIpo.leaf.price.toFixed(2)}</span>
              </div>
              <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800/80">
                <span className="text-[9px] text-slate-500 uppercase block">Market Cap</span>
                <span className="font-bold text-slate-200">RM {hoveredIpo.leaf.marketCapRM}M</span>
              </div>
              <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800/80">
                <span className="text-[9px] text-slate-500 uppercase block">Broker Upside</span>
                <span className={`font-bold ${hoveredIpo.leaf.upsidePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {hoveredIpo.leaf.upsidePct !== 0 ? `${hoveredIpo.leaf.upsidePct > 0 ? '+' : ''}${hoveredIpo.leaf.upsidePct}%` : 'At Parity'}
                </span>
              </div>
              <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800/80">
                <span className="text-[9px] text-slate-500 uppercase block">P/E Multiple</span>
                <span className="font-bold text-sky-400">{hoveredIpo.leaf.peMultiple}x</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
              <span>Sector: <strong className="text-slate-300">{hoveredIpo.leaf.sector.shortName}</strong></span>
              {hoveredIpo.leaf.osPublic > 0 && (
                <span className="text-pink-400 font-bold">{hoveredIpo.leaf.osPublic}x Oversubscribed</span>
              )}
            </div>

            <div className="text-[9px] text-indigo-400 font-mono text-center pt-0.5">
              Click tile to view institutional dossier
            </div>
          </div>
        )}
      </div>

      {/* Heatmap Legend & Color Key */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-400 font-bold uppercase text-[10px]">
            {colorMetric === 'upside' && 'Valuation Spread Legend:'}
            {colorMetric === 'peMultiple' && 'P/E Valuation Multiple Heat:'}
            {colorMetric === 'oversubscription' && 'Retail Demand Heat:'}
            {colorMetric === 'debut' && 'Listing Debut Result:'}
          </span>

          {colorMetric === 'upside' && (
            <div className="flex items-center gap-2 text-[10px]">
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-600 inline-block" /><span>Discount (&lt;0%)</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-700 inline-block" /><span>Parity (0%)</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-teal-700 inline-block" /><span>+10% Upside</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-600 inline-block" /><span>+30% Upside</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-800 inline-block" /><span>+50%+ Top Pick</span></div>
            </div>
          )}

          {colorMetric === 'peMultiple' && (
            <div className="flex items-center gap-2 text-[10px]">
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-800 inline-block" /><span>&lt;12x Value</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-sky-600 inline-block" /><span>12-16x Market Median</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-600 inline-block" /><span>16-22x Growth</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-600 inline-block" /><span>28x+ Premium Tech</span></div>
            </div>
          )}

          {colorMetric === 'oversubscription' && (
            <div className="flex items-center gap-2 text-[10px]">
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-700 inline-block" /><span>Standard</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-600 inline-block" /><span>15x-35x Robust</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-violet-600 inline-block" /><span>35x-75x High</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-600 inline-block" /><span>150x+ Massive Rush</span></div>
            </div>
          )}

          {colorMetric === 'debut' && (
            <div className="flex items-center gap-2 text-[10px]">
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-600 inline-block" /><span>Gain ✓ (&gt; IPO Price)</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-600 inline-block" /><span>Drop ✕ (&lt; IPO Price)</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-600 inline-block" /><span>Upcoming (Pending Debut)</span></div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-[10px]">
          <span>Border:</span>
          <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded border border-dashed border-amber-400 inline-block" /> Upcoming Pipeline</span>
          <span className="flex items-center gap-1 text-slate-300"><span className="w-2 h-2 rounded border border-slate-700 inline-block" /> Past Listed</span>
        </div>
      </div>

      {/* QUICK INSPECTION MODAL FOR CLICKED IPO */}
      {activeModalIpo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{activeModalIpo.stockName}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    activeModalIpo.status === 'UPCOMING'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {activeModalIpo.status}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20">
                    {getIpoSector(activeModalIpo).name}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeModalIpo.fullName || `${activeModalIpo.stockName} Berhad`}
                </p>
              </div>

              <button
                onClick={() => setActiveModalIpo(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500">OFFER PRICE</div>
                <div className="font-bold text-white text-sm">RM {activeModalIpo.price.toFixed(2)}</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500">MARKET CAP</div>
                <div className="font-bold text-slate-200">RM {activeModalIpo.marketCapRMJuta}M</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500">LISTING DATE</div>
                <div className="font-bold text-emerald-400">{activeModalIpo.listingPublic}</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500">OVERSUBSCRIBED</div>
                <div className="font-bold text-pink-400">{activeModalIpo.osPublic ? `${activeModalIpo.osPublic}x` : 'Pending'}</div>
              </div>
            </div>

            {/* Research House Consensus Breakdown */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>Research House Target Prices</span>
                {getIpoEnrichedMetrics(activeModalIpo).upsidePct !== 0 && (
                  <span className={`font-mono ${getIpoEnrichedMetrics(activeModalIpo).upsidePct > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Consensus Upside: {getIpoEnrichedMetrics(activeModalIpo).upsidePct > 0 ? '+' : ''}{getIpoEnrichedMetrics(activeModalIpo).upsidePct}%
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                {Object.entries(activeModalIpo.fairValues).map(([houseKey, val]) => {
                  if (typeof val !== 'number') return null;
                  const houseMeta = RESEARCH_HOUSES.find(h => h.key === houseKey);
                  const spread = (((val - activeModalIpo.price) / activeModalIpo.price) * 100).toFixed(1);

                  return (
                    <div key={houseKey} className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex flex-col justify-between">
                      <div className="text-[10px] text-slate-400 truncate">{houseMeta?.name || houseKey.toUpperCase()}</div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="font-bold text-white text-sm">RM {val.toFixed(2)}</span>
                        <span className={`text-[10px] font-bold ${Number(spread) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {Number(spread) >= 0 ? `+${spread}%` : `${spread}%`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes if present */}
            {activeModalIpo.notes && (
              <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                {activeModalIpo.notes}
              </p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              {onNavigateToTracker && (
                <button
                  onClick={() => {
                    setActiveModalIpo(null);
                    onNavigateToTracker(activeModalIpo.stockName);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View in IPO Master Sheet</span>
                </button>
              )}

              <button
                onClick={() => setActiveModalIpo(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
