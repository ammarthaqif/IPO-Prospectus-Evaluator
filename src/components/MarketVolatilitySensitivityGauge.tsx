import React, { useState } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Percent, 
  Clock, 
  Scale, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  Info,
  DollarSign,
  Layers,
  Sparkles
} from 'lucide-react';
import { ProspectusDossier, FinancialYearData } from '../types';

interface MarketVolatilitySensitivityGaugeProps {
  dossier: ProspectusDossier;
}

export type StressScenarioKey = 'baseline' | 'inflation' | 'recession' | 'rateHike' | 'liquidityCrunch';

interface StressScenarioConfig {
  id: StressScenarioKey;
  name: string;
  tagline: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  revImpactPct: number;
  gpMarginDeltaBps: number;
  rateHikeBps: number;
  dsoStretchDays: number;
}

const STRESS_SCENARIOS: StressScenarioConfig[] = [
  {
    id: 'baseline',
    name: 'Prospectus Baseline',
    tagline: 'Stated Disclosures (Audited)',
    description: 'Current historical disclosures and operating margins under ordinary market trading conditions.',
    icon: ShieldCheck,
    revImpactPct: 0,
    gpMarginDeltaBps: 0,
    rateHikeBps: 0,
    dsoStretchDays: 0,
  },
  {
    id: 'inflation',
    name: 'Cost Inflation Shock',
    tagline: '+15% Input / COGS Spike',
    description: 'Surge in raw material, freight, and sub-assembly costs assuming only 40% immediate client pass-through.',
    icon: TrendingUp,
    revImpactPct: 0,
    gpMarginDeltaBps: -480, // -4.8% GP margin compression
    rateHikeBps: 0,
    dsoStretchDays: 0,
  },
  {
    id: 'recession',
    name: 'Demand Contraction',
    tagline: '-20% Client Capex Shock',
    description: 'Cyclical customer spending freeze or equipment deployment delays dampening top-line throughput.',
    icon: TrendingDown,
    revImpactPct: -20,
    gpMarginDeltaBps: -250, // Operating deleveraging
    rateHikeBps: 0,
    dsoStretchDays: 0,
  },
  {
    id: 'rateHike',
    name: 'Monetary Rate Shock',
    tagline: '+250 bps Borrowing Hike',
    description: 'Central bank policy tightening driving debt-servicing costs higher across floating facilities.',
    icon: Percent,
    revImpactPct: 0,
    gpMarginDeltaBps: 0,
    rateHikeBps: 250,
    dsoStretchDays: 0,
  },
  {
    id: 'liquidityCrunch',
    name: 'Credit & DSO Stretch',
    tagline: '+35 Days Payment Delay',
    description: 'Enterprise clients lengthening billing cycles and milestone sign-offs, trapping operating cash.',
    icon: Clock,
    revImpactPct: 0,
    gpMarginDeltaBps: 0,
    rateHikeBps: 0,
    dsoStretchDays: 35,
  },
];

export const MarketVolatilitySensitivityGauge: React.FC<MarketVolatilitySensitivityGaugeProps> = ({ dossier }) => {
  const [selectedScenario, setSelectedScenario] = useState<StressScenarioKey>('baseline');

  const financials = dossier.financials && dossier.financials.length > 0 ? dossier.financials : [];
  const latestFin: FinancialYearData = financials[financials.length - 1] || {
    period: 'FY 2024',
    revenue: 60000,
    costOfSales: -40000,
    gp: 20000,
    pbt: 10000,
    pat: 7500,
    gpMargin: 33.3,
    pbtMargin: 16.7,
    patMargin: 12.5,
    currentRatio: 2.2,
    gearingRatio: 0.12,
    receivablesTurnoverDays: 85,
    payablesTurnoverDays: 60,
    inventoryTurnoverDays: 75,
    cashConversionCycleDays: 100,
    isAudited: true,
  };

  const currency = dossier.currencySymbol || (dossier.listingMarket?.includes('NASDAQ') || dossier.registrationNo?.includes('US') ? '$' : 'RM');

  // Compute Base Sensitivity Pillar Scores (0 = low sensitivity/defensive, 100 = high sensitivity/vulnerable)
  
  // 1. Margin Buffer Score (Higher GP margin provides shock absorber)
  const marginScore = latestFin.gpMargin >= 50 ? 15 
    : latestFin.gpMargin >= 38 ? 28 
    : latestFin.gpMargin >= 28 ? 44 
    : latestFin.gpMargin >= 18 ? 68 
    : 88;

  // 2. Gearing & Leverage Score (Low debt = impervious to rate hikes)
  const gearingScore = latestFin.gearingRatio <= 0.1 ? 12 
    : latestFin.gearingRatio <= 0.25 ? 25 
    : latestFin.gearingRatio <= 0.5 ? 50 
    : latestFin.gearingRatio <= 0.8 ? 74 
    : 92;

  // 3. Liquidity & Working Capital Drag Score
  const cccVal = latestFin.cashConversionCycleDays || 90;
  let liquidityScore = cccVal <= 60 ? 20 
    : cccVal <= 100 ? 38 
    : cccVal <= 140 ? 62 
    : 82;
  if (latestFin.currentRatio >= 2.0) liquidityScore = Math.max(10, liquidityScore - 12);
  else if (latestFin.currentRatio < 1.3) liquidityScore = Math.min(95, liquidityScore + 15);

  // 4. Sector & Business Model Nature
  const sectorLower = (dossier.sector + ' ' + (dossier.subSector || '')).toLowerCase();
  let sectorScore = 45;
  if (sectorLower.includes('software') || sectorLower.includes('saas') || sectorLower.includes('cloud')) {
    sectorScore = 20; // High recurring revenue
  } else if (sectorLower.includes('amhs') || sectorLower.includes('automation') || sectorLower.includes('semiconductor equipment')) {
    sectorScore = 38; // Mission-critical high-barrier capex with maintenance
  } else if (sectorLower.includes('medical') || sectorLower.includes('healthcare') || sectorLower.includes('staple')) {
    sectorScore = 22; // Inelastic demand
  } else if (sectorLower.includes('construction') || sectorLower.includes('property') || sectorLower.includes('mining')) {
    sectorScore = 80; // High cyclicality
  } else if (sectorLower.includes('retail') || sectorLower.includes('consumer discretionary')) {
    sectorScore = 65; // Consumer elastic
  }

  // 5. Pricing Power Trend (GP margin trend across audited history)
  const firstFin = financials[0] || latestFin;
  const marginExpansion = latestFin.gpMargin - firstFin.gpMargin;
  const pricingPowerScore = marginExpansion >= 3.0 ? 22 
    : marginExpansion >= 0 ? 38 
    : marginExpansion >= -3.0 ? 60 
    : 82;

  // Base composite score (weighted out of 100)
  const baseCompositeScore = Math.round(
    marginScore * 0.25 + 
    gearingScore * 0.25 + 
    liquidityScore * 0.20 + 
    sectorScore * 0.15 + 
    pricingPowerScore * 0.15
  );

  // Active Scenario Modifiers
  const activeScenarioConfig = STRESS_SCENARIOS.find(s => s.id === selectedScenario) || STRESS_SCENARIOS[0];

  let scenarioDelta = 0;
  if (selectedScenario === 'inflation') scenarioDelta = 14;
  else if (selectedScenario === 'recession') scenarioDelta = 22;
  else if (selectedScenario === 'rateHike') {
    // If gearing is very low, interest rate hike has almost 0 penalty
    scenarioDelta = latestFin.gearingRatio <= 0.15 ? 4 : Math.round(latestFin.gearingRatio * 30);
  } else if (selectedScenario === 'liquidityCrunch') {
    scenarioDelta = cccVal > 110 ? 18 : 10;
  }

  const effectiveScore = Math.min(98, Math.max(12, baseCompositeScore + scenarioDelta));

  // Determine Sensitivity Tier & Colors
  let tierClassification = 'DEFENSIVE RESILIENCE';
  let tierDescription = 'Low Volatility Sensitivity · Business model exhibits robust structural pricing power, conservative leverage, and defensive cash margins.';
  let dialColor = '#10b981'; // Emerald
  let dialBgClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

  if (effectiveScore > 65) {
    tierClassification = 'ELEVATED CYCLICAL SENSITIVITY';
    tierDescription = 'High Volatility Beta · Sensitive to macro capex freezes, working capital delays, or cost inflation pressures.';
    dialColor = '#f43f5e'; // Rose
    dialBgClass = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  } else if (effectiveScore > 38) {
    tierClassification = 'BALANCED MACRO SENSITIVITY';
    tierDescription = 'Moderate Volatility Sensitivity · Balanced operating margins absorb baseline economic swings with moderate working capital dependence.';
    dialColor = '#f59e0b'; // Amber
    dialBgClass = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  }

  // Calculate Stressed Projections under the chosen scenario
  const baseRevenue = latestFin.revenue;
  const stressedRevenue = Math.round(baseRevenue * (1 + activeScenarioConfig.revImpactPct / 100));
  
  const baseGpMargin = latestFin.gpMargin;
  const stressedGpMargin = Math.max(5, baseGpMargin + (activeScenarioConfig.gpMarginDeltaBps / 100));
  const stressedGp = Math.round(stressedRevenue * (stressedGpMargin / 100));

  // Approximate fixed operating expenses: (GP - PBT)
  const baseOpex = Math.max(0, latestFin.gp - latestFin.pbt);
  const stressedPbt = Math.round(stressedGp - baseOpex);

  // Interest shock cost if gearing > 0
  const estimatedDebt = Math.round(latestFin.revenue * (latestFin.gearingRatio || 0.1) * 0.4);
  const additionalInterestCost = Math.round((estimatedDebt * activeScenarioConfig.rateHikeBps) / 10000);
  const finalStressedPbt = stressedPbt - additionalInterestCost;
  const stressedPat = Math.round(finalStressedPbt * 0.76); // ~24% statutory corporate tax rate

  // Working capital cash drag under liquidity crunch
  const dailyRev = baseRevenue / 365;
  const lockedCashWorkingCapital = Math.round(dailyRev * activeScenarioConfig.dsoStretchDays);

  // Breakeven drop calculation: How far can revenue drop before PBT reaches 0?
  const breakevenDropPct = baseOpex > 0 && baseGpMargin > 0 
    ? Math.min(90, Math.max(5, ((latestFin.pbt / (baseRevenue * (baseGpMargin / 100))) * 100)))
    : 35.0;

  // SVG Gauge Math (180 degree semi-circle: 180° to 0°)
  // Radius = 88, Center = (120, 115)
  // Arc length = PI * 88 ~= 276.46
  const gaugeRadius = 88;
  const arcLength = Math.PI * gaugeRadius;
  const gaugePercent = effectiveScore / 100;
  const strokeDashoffset = arcLength * (1 - gaugePercent);

  // Needle angle: score 0 -> 180° (left), score 100 -> 0° (right)
  const needleAngleDeg = 180 - gaugePercent * 180;
  const needleAngleRad = (needleAngleDeg * Math.PI) / 180;
  const needleLength = 68;
  const needleTipX = 120 + needleLength * Math.cos(needleAngleRad);
  const needleTipY = 115 - needleLength * Math.sin(needleAngleRad);

  return (
    <div className="space-y-6">
      
      {/* Header section with explanatory guidance */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Market Volatility Sensitivity Gauge</h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Stress Simulator
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Quantitative economic shock simulation evaluating how {dossier.companyName}'s disclosures and margins react to macro headwinds
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Baseline Shock Absorption</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                Breakeven Cushion: -{breakevenDropPct.toFixed(1)}% Rev
              </span>
            </div>
          </div>
        </div>

        {/* Top Interactive Scenario Selector */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Simulate Fluctuating Economic Conditions:
            </span>
            <span className="text-[11px] text-indigo-400 font-mono">
              Live Scenario: {activeScenarioConfig.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {STRESS_SCENARIOS.map((sc) => {
              const IconComp = sc.icon;
              const isSelected = selectedScenario === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenario(sc.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <IconComp className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <div className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {sc.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                      {sc.tagline}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Visual Display: Dial Gauge + Stress Test Impact Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 Cols): Precision Semi-Circular Gauge Component */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Sensitivity Index
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${dialBgClass}`}>
              {tierClassification}
            </span>
          </div>

          {/* SVG Gauge Graphic */}
          <div className="relative flex flex-col items-center justify-center pt-2">
            <svg viewBox="0 0 240 145" className="w-full max-w-[280px] overflow-visible">
              <defs>
                {/* Arc Gradient: Emerald (defensive) -> Amber (moderate) -> Rose (vulnerable) */}
                <linearGradient id="volatilityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="35%" stopColor="#34d399" />
                  <stop offset="65%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>

                {/* Needle drop glow filter */}
                <filter id="gaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.5" />
                </filter>
              </defs>

              {/* Background Arc Track */}
              <path
                d="M 32 115 A 88 88 0 0 1 208 115"
                fill="none"
                stroke="#1e293b"
                strokeWidth="14"
                strokeLinecap="round"
              />

              {/* Active Measured Arc Track */}
              <path
                d="M 32 115 A 88 88 0 0 1 208 115"
                fill="none"
                stroke="url(#volatilityGradient)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={arcLength}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700 ease-out"
              />

              {/* Calibrated Tick Marks */}
              {/* 0% Mark */}
              <line x1="32" y1="115" x2="22" y2="115" stroke="#64748b" strokeWidth="2" />
              {/* 25% Mark */}
              <line x1="57.7" y1="52.7" x2="50.6" y2="45.6" stroke="#64748b" strokeWidth="2" />
              {/* 50% Mark (Apex) */}
              <line x1="120" y1="27" x2="120" y2="17" stroke="#64748b" strokeWidth="2" />
              {/* 75% Mark */}
              <line x1="182.3" y1="52.7" x2="189.4" y2="45.6" stroke="#64748b" strokeWidth="2" />
              {/* 100% Mark */}
              <line x1="208" y1="115" x2="218" y2="115" stroke="#64748b" strokeWidth="2" />

              {/* Needle Indicator */}
              <line
                x1="120"
                y1="115"
                x2={needleTipX}
                y2={needleTipY}
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinecap="round"
                filter="url(#gaugeShadow)"
                className="transition-all duration-700 ease-out"
              />

              {/* Center Hub */}
              <circle cx="120" cy="115" r="9" fill="#0f172a" stroke="#ffffff" strokeWidth="3" />
              <circle cx="120" cy="115" r="4" fill={dialColor} />

              {/* Bottom Scale Labels */}
              <text x="32" y="136" textAnchor="middle" className="text-[10px] fill-slate-400 font-mono font-semibold">0</text>
              <text x="120" y="136" textAnchor="middle" className="text-[10px] fill-slate-400 font-mono font-semibold">50</text>
              <text x="208" y="136" textAnchor="middle" className="text-[10px] fill-slate-400 font-mono font-semibold">100</text>
            </svg>

            {/* Central Numerical Readout Below Gauge */}
            <div className="text-center -mt-1 space-y-1">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                  {effectiveScore}
                </span>
                <span className="text-sm font-mono text-slate-400">/ 100</span>
              </div>
              <div className="text-[11px] font-medium text-slate-300">
                {selectedScenario === 'baseline' ? (
                  <span className="text-emerald-400">Prospectus Base Volatility Beta</span>
                ) : (
                  <span className="text-amber-400">
                    Stressed Score (+{scenarioDelta} pts vs Baseline)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Qualitative interpretation */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 space-y-1">
            <span className="font-semibold text-white block">Fund Manager Due Diligence Assessment:</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {tierDescription}
            </p>
          </div>
        </div>

        {/* Right Column (7 Cols): Dynamic Stress Impact Projection & Metrics */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white">Financial Statement Stress Projection</h4>
              <p className="text-xs text-slate-400">
                Modeled impact of <span className="text-indigo-400 font-semibold">{activeScenarioConfig.name}</span> on audited income statement
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Evaluated Period: {latestFin.period}
            </span>
          </div>

          {/* Metric Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Revenue Impact */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Projected Revenue</div>
              <div className="text-lg font-bold font-mono text-white">
                {currency}{stressedRevenue.toLocaleString()}k
              </div>
              <div className="text-[11px] font-mono flex items-center gap-1">
                {activeScenarioConfig.revImpactPct !== 0 ? (
                  <span className="text-rose-400 font-semibold">
                    {activeScenarioConfig.revImpactPct}% ({currency}{(stressedRevenue - baseRevenue).toLocaleString()}k)
                  </span>
                ) : (
                  <span className="text-emerald-400">Stable ({currency}{baseRevenue.toLocaleString()}k)</span>
                )}
              </div>
            </div>

            {/* Gross Profit Margin */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Stressed Gross Margin</div>
              <div className="text-lg font-bold font-mono text-white">
                {stressedGpMargin.toFixed(1)}%
              </div>
              <div className="text-[11px] font-mono flex items-center gap-1">
                {activeScenarioConfig.gpMarginDeltaBps !== 0 ? (
                  <span className="text-rose-400 font-semibold">
                    {activeScenarioConfig.gpMarginDeltaBps} bps vs Base ({baseGpMargin.toFixed(1)}%)
                  </span>
                ) : (
                  <span className="text-emerald-400">Unimpaired ({baseGpMargin.toFixed(1)}%)</span>
                )}
              </div>
            </div>

            {/* Net Profit After Tax */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Modeled PAT Impact</div>
              <div className="text-lg font-bold font-mono text-white">
                {currency}{Math.max(0, stressedPat).toLocaleString()}k
              </div>
              <div className="text-[11px] font-mono flex items-center gap-1">
                {stressedPat < latestFin.pat ? (
                  <span className="text-rose-400 font-semibold">
                    -{Math.round(((latestFin.pat - stressedPat) / latestFin.pat) * 100)}% ({currency}{(stressedPat - latestFin.pat).toLocaleString()}k)
                  </span>
                ) : (
                  <span className="text-emerald-400">Normal PAT</span>
                )}
              </div>
            </div>

          </div>

          {/* Scenario-Specific Contextual Findings */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Info className="w-4 h-4 text-indigo-400" />
              <span>Scenario Transmission Channel:</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans">
              {selectedScenario === 'baseline' && (
                `Under prospectus stated conditions, ${dossier.companyName} maintains a gross margin of ${baseGpMargin.toFixed(1)}% and an annualized gearing ratio of ${(latestFin.gearingRatio || 0.1).toFixed(2)}x. Operating profit provides an absorption buffer of ${breakevenDropPct.toFixed(1)}% before touching fixed operational loss territory.`
              )}
              {selectedScenario === 'inflation' && (
                `A 15% shock in component costs and direct logistics compresses gross margins by ${Math.abs(activeScenarioConfig.gpMarginDeltaBps)} bps to ${stressedGpMargin.toFixed(1)}%. Review prospectus note disclosures regarding contractual indexing, cost-plus frameworks, and forward procurement buffers.`
              )}
              {selectedScenario === 'recession' && (
                `A 20% contraction in client orders would test fixed cost overheads (estimated at ${currency}${baseOpex.toLocaleString()}k). Net profit after tax contracts to ${currency}${stressedPat.toLocaleString()}k, but the business maintains positive operating cash flow due to healthy initial margin cushions.`
              )}
              {selectedScenario === 'rateHike' && (
                `With a low gearing ratio of ${(latestFin.gearingRatio || 0.12).toFixed(2)}x, ${dossier.companyName} is strongly insulated from interest rate hikes. An aggressive 250 bps rate hike creates only ~${currency}${additionalInterestCost.toLocaleString()}k in additional annual borrowing charges.`
              )}
              {selectedScenario === 'liquidityCrunch' && (
                `Lengthening the cash collection cycle by +35 days expands receivables days from ${latestFin.receivablesTurnoverDays}d to ${latestFin.receivablesTurnoverDays + 35}d, temporarily absorbing ~${currency}${lockedCashWorkingCapital.toLocaleString()}k in cash. Pre-IPO liquid reserves and current ratio of ${latestFin.currentRatio}x provide ample bridge liquidity.`
              )}
            </p>
          </div>

          {/* Breakeven Safety Margin Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Operating Breakeven Revenue Cushion</span>
              <span className="text-emerald-400 font-mono font-bold">
                {breakevenDropPct.toFixed(1)}% Top-line Contraction Tolerated
              </span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                style={{ width: `${Math.min(100, breakevenDropPct * 2)}%` }}
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              />
            </div>
            <span className="text-[10px] text-slate-500 block">
              Percentage drop in historical revenue required to reduce operating profit to zero
            </span>
          </div>

        </div>

      </div>

      {/* 5-Pillar Macro Sensitivity Breakdown */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Underlying Business Model Sensitivity Pillars
          </h4>
          <p className="text-xs text-slate-400">
            Deconstruction of operational vulnerability across key macroeconomic risk vectors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Pillar 1: Margin & Cost Cushion */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Gross Margin Cushion</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${marginScore <= 35 ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                {marginScore <= 35 ? 'Defensive' : 'Moderate'}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white">{latestFin.gpMargin.toFixed(1)}%</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Provides direct absorption capacity against raw material price shocks and freight volatility.
            </p>
          </div>

          {/* Pillar 2: Balance Sheet Leverage */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Interest Rate & Debt Risk</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${gearingScore <= 30 ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                {gearingScore <= 30 ? 'Low Exposure' : 'Leveraged'}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white">{(latestFin.gearingRatio || 0.1).toFixed(2)}x Gearing</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Low bank borrowings shield earnings from monetary tightening and high base lending rates.
            </p>
          </div>

          {/* Pillar 3: Working Capital & Liquidity */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Working Capital Flexibility</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${liquidityScore <= 45 ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                {latestFin.currentRatio >= 1.8 ? 'Resilient' : 'Watchlist'}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white">{latestFin.currentRatio.toFixed(2)}x Ratio</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Current assets cover short-term liabilities by {latestFin.currentRatio.toFixed(2)}x with a {cccVal}-day cash conversion cycle.
            </p>
          </div>

          {/* Pillar 4: Demand Cyclicality */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Top-Line Cyclicality</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${sectorScore <= 40 ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                {sectorScore <= 40 ? 'Essential Capex' : 'Cyclical'}
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-200 truncate">{dossier.sector || 'Industrial Technology'}</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Mission-critical installations create multi-year customer lock-in and sticky maintenance contracts.
            </p>
          </div>

          {/* Pillar 5: Pricing Power Track Record */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Historical Pricing Power</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${pricingPowerScore <= 40 ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                {marginExpansion >= 0 ? 'Expanding' : 'Compressing'}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {marginExpansion >= 0 ? '+' : ''}{(marginExpansion * 100).toFixed(0)} bps
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Historical gross margin movement from {firstFin.gpMargin.toFixed(1)}% to {latestFin.gpMargin.toFixed(1)}%.
            </p>
          </div>

          {/* Pillar 6: Stated Mitigating Safeguards */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Contractual Safeguards</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded text-indigo-400 bg-indigo-500/10">
                Prospectus Notes
              </span>
            </div>
            <div className="text-xs font-semibold text-emerald-300">Milestone Progress Billings</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Advance customer deposits and stage-gate engineering milestones minimize working capital write-off risks.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
