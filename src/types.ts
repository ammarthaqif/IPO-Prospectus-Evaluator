export interface FinancialYearData {
  period: string;
  revenue: number; // in RM'000
  costOfSales: number;
  gp: number;
  pbt: number;
  pat: number;
  gpMargin: number; // in %
  pbtMargin: number;
  patMargin: number;
  currentRatio: number; // times
  gearingRatio: number; // times
  receivablesTurnoverDays: number;
  payablesTurnoverDays: number;
  inventoryTurnoverDays: number;
  cashConversionCycleDays: number;
  isAudited: boolean;
  notes?: string;
}

export interface SegmentRevenueData {
  segment: string;
  subSegment?: string;
  fy2022: number;
  fy2022Pct: number;
  fy2023: number;
  fy2023Pct: number;
  fy2024: number;
  fy2024Pct: number;
  fpe2025: number;
  fpe2025Pct: number;
}

export type RedFlagSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type RedFlagCategory = 
  | 'GOVERNANCE_RELATED_PARTY'
  | 'SUPPLIER_CONCENTRATION'
  | 'CONTRACTUAL_STABILITY'
  | 'CAPITAL_STRUCTURE'
  | 'DILUTION_FLOAT'
  | 'WORKING_CAPITAL'
  | 'MORATORIUM'
  | 'REGULATORY_COMPLIANCE';

export interface RegulatoryRedFlag {
  id: string;
  severity: RedFlagSeverity;
  category: RedFlagCategory;
  title: string;
  description: string;
  prospectusSection: string;
  evidenceExcerpt: string;
  regulatoryRiskImplication: string;
  mitigatingFactors?: string;
  recommendedAuditQuery: string;
}

export interface IndustryBenchmarkItem {
  metric: string;
  unit: string;
  issuerValue: number;
  peerMedian: number;
  topQuartile: number;
  bottomQuartile: number;
  assessment: 'SUPERIOR' | 'IN_LINE' | 'VULNERABLE' | 'ELEVATED_RISK';
  commentary: string;
}

export interface SectionSentiment {
  sectionName: string;
  prospectusReference: string;
  score: number; // -100 to +100
  sentiment: 'Bullish' | 'Cautious' | 'Highly Defensive' | 'Neutral';
  hedgingRatio: number; // 0 to 100%
  keyFinding: string;
}

export interface AISentimentReport {
  overallScore: number; // -100 to +100
  classification: 'High Conviction Bullish' | 'Cautiously Optimistic' | 'Neutral / In-Line' | 'Guarded / Defensive' | 'High Risk / Distressed';
  hedgingIndex: number; // %
  transparencyScore: number; // out of 100
  redFlagCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  executiveSummary: string;
  toneAnalysis: string;
  sections: SectionSentiment[];
}

export interface ProceedItem {
  purpose: string;
  amountRM: number; // RM'000 or estimated
  percentage: number;
  timeframe: string;
}

export interface DividendRecord {
  period: string;
  amountRM: number; // in RM'000
  payoutPctPAT?: number;
  type: string;
  description?: string;
}

export interface FundManagerVerdict {
  recommendation: 'OVERWEIGHT' | 'EQUAL_WEIGHT' | 'UNDERWEIGHT' | 'DO_NOT_INVEST';
  convictionScore: number; // 1-10
  investmentThesis: string;
  bullCase: string;
  bearCase: string;
  keyMonitoringMilestones: string[];
}

export interface ProspectusSectionItem {
  id: string;
  title: string;
  pageRange?: string;
  summary?: string;
  riskLevel?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface PeerGroupData {
  id: string;
  name: string;
  description: string;
  benchmarks: IndustryBenchmarkItem[];
}

export interface ProspectusDossier {
  id: string;
  companyName: string;
  registrationNo: string;
  sector: string;
  subSector: string;
  listingMarket: string;
  publicIssueShares: number;
  offerForSaleShares: number;
  totalOfferShares: number;
  enlargedIssuedShares: number;
  moratoriumPeriod: string;
  promoters: Array<{
    name: string;
    designation: string;
    preShares: number;
    prePct: number;
    postShares: number;
    postPct: number;
  }>;
  directors: Array<{
    name: string;
    designation: string;
  }>;
  proceeds: ProceedItem[];
  financials: FinancialYearData[];
  segmentRevenue: SegmentRevenueData[];
  benchmarks: IndustryBenchmarkItem[];
  redFlags: RegulatoryRedFlag[];
  sentiment: AISentimentReport;
  rawProspectusText: string;
  currency?: string;
  currencySymbol?: string;

  // Extended dynamic fields
  fundManagerVerdict?: FundManagerVerdict;
  dividends?: {
    history: DividendRecord[];
    dividendPolicy: string;
    carveoutsOrRestructuring?: string;
    carveoutTitle?: string;
    carveoutAuditAction?: string;
  };
  fundamentalStrengths?: string[];
  keyCaveats?: string[];
  sections?: ProspectusSectionItem[];
  peerGroups?: PeerGroupData[];
}

export interface ReportConfig {
  memoTitle: string;
  fundName: string;
  analystName: string;
  reportDate: string;
  targetPricePE: number;
  proposedAllocationRM: number;
  recommendation: 'OVERWEIGHT' | 'EQUAL_WEIGHT' | 'UNDERWEIGHT' | 'DO_NOT_INVEST';
  sectionsIncluded: {
    executiveSummary: boolean;
    capitalStructure: boolean;
    financialTrajectory: boolean;
    workingCapitalCycle: boolean;
    segmentBreakdown: boolean;
    industryBenchmarks: boolean;
    regulatoryRedFlags: boolean;
    aiSentimentAudit: boolean;
    investmentThesis: boolean;
  };
  customNotes: string;
}
