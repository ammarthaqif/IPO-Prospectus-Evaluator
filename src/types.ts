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

export interface SentimentHistoryPoint {
  id: string;
  date: string; // e.g. '15 Oct 2025' or '2025-10-15'
  phase: string; // e.g. 'Draft Exposure', 'SC Approval', 'Prospectus Launch', 'Roadshow', 'Balloting', 'Listing'
  score: number; // -100 to +100
  hedgingRatio?: number; // % (0-100)
  driver: string; // Key catalyst, announcement, or sentiment driver
  source?: 'PROSPECTUS_DISCLOSURE' | 'ANALYST_CONSENSUS' | 'RETAIL_BALLOTING' | 'NEWS_MEDIA' | 'BURSA_FILING' | 'USER_AUDIT';
  sourceCitation?: string;
  classification?: string;
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
  history?: SentimentHistoryPoint[];
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

export interface PeerCompanyMetric {
  id: string;
  name: string;
  ticker: string;
  market?: string;
  pe: number; // P/E valuation multiple (x)
  pb?: number; // Price to Book multiple (x)
  revenueGrowth: number; // % (CAGR or YoY)
  gpMargin: number; // Gross Profit Margin (%)
  patMargin: number; // Net Profit Margin (%)
  roe: number; // Return on Equity (%)
  currentRatio: number; // Current Ratio (x)
  gearingRatio: number; // Gearing / Debt-to-Equity (x)
  cccDays: number; // Cash Conversion Cycle (days)
  marketCapRM?: number; // in RM Millions
  notes?: string;
}

export interface PeerGroupData {
  id: string;
  name: string;
  description: string;
  benchmarks: IndustryBenchmarkItem[];
  peers?: PeerCompanyMetric[];
}

export type ShariahStatus = 'SHARIAH_COMPLIANT' | 'NON_SHARIAH_COMPLIANT' | 'PENDING_SAC_REVIEW';

export interface ShariahComplianceInfo {
  status: ShariahStatus;
  isCompliant: boolean;
  screeningAuthority: string; // e.g. "Shariah Advisory Council (SAC) of the Securities Commission Malaysia"
  sacScreeningDate?: string;
  businessActivityBenchmark: string; // e.g. "Conventional & Non-Permissible Activities < 5% / 20% benchmark"
  financialRatioBenchmark: string; // e.g. "Cash & Debt to Total Assets < 33% threshold"
  notes?: string;
  lastAuditedDate?: string;
}

export type AnalystRecommendation = 'SUBSCRIBE' | 'OVERWEIGHT' | 'BUY' | 'NEUTRAL' | 'AVOID';

export type AnalystSourceType = 
  | 'OFFICIAL_BROKER_REPORT' 
  | 'PRINCIPAL_ADVISER_MANDATE' 
  | 'FINANCIAL_PRESS_CITATION' 
  | 'BURSA_SECTOR_COMPS' 
  | 'PROSPECTUS_CALIBRATED_MODEL';

export interface AnalystSourceVerification {
  isVerified: boolean;
  sourceType: AnalystSourceType;
  sourceName: string; // e.g. "Business Today / Malacca Securities Research"
  sourceUrl?: string; // external or internal portal URL
  publicationDate: string;
  verificationBadge: string; // e.g. "Verified Broker Report", "Principal Adviser Mandate", "Bursa Comps"
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'CALIBRATED';
  citationSnippet?: string; // quote or summary from the actual publication or filing
  methodologyDetails?: string; // detailed valuation method explanation
}

export interface AnalystFairValue {
  id: string;
  firm: string; // e.g. "Apex Securities", "PublicInvest Research", "Mercury Securities", "TA Securities", "Malacca Securities", "Rakuten Trade", "Kenanga Research"
  analystName?: string;
  analystRole?: string;
  fairValue: number; // in RM (e.g. 0.44)
  upsidePct: number; // in % vs IPO price (e.g. +25.7%)
  recommendation: AnalystRecommendation;
  targetPE?: number; // e.g. 11.2x
  targetBasis: string; // e.g. "11.2x FY25F EPS", "DCF with WACC 8.5%"
  valuationMethodology?: string; // "Target P/E Multiple", "Discounted Cash Flow (DCF)", "Price-to-Book (P/B)", "EV/EBITDA"
  reportDate: string;
  keyThesis: string;
  catalysts?: string[]; // Specific upside catalysts
  risks?: string[]; // Specific contrarian risks/concerns
  sourceVerification?: AnalystSourceVerification;
}

export interface AnalystConsensus {
  averageFairValue: number;
  medianFairValue: number;
  highestFairValue: number;
  lowestFairValue: number;
  averageUpsidePct: number;
  totalAnalysts: number;
  subscribeCount: number;
  neutralCount: number;
  avoidCount: number;
  consensusRating: 'STRONG_SUBSCRIBE' | 'MODERATE_SUBSCRIBE' | 'NEUTRAL' | 'AVOID';
  verifiedBrokerCount?: number;
  sourceBreakdown?: {
    officialBrokerReports: number;
    adviserMandates: number;
    bursaPeerComps: number;
    calibratedModels: number;
  };
}

export interface WebIpoPriceSource {
  isWebSourced: boolean;
  price: number;
  currency: string;
  sourceName?: string;
  sourceUrl?: string;
  verifiedDate?: string;
  searchSnippet?: string;
  bursaStockCode?: string;
}

export interface ListingPerformance {
  listingDate?: string; // e.g. "28 March 2026"
  listingStatus: 'UPCOMING' | 'LISTED';
  ipoPrice: number; // in RM (e.g. 0.35)
  openingPrice?: number; // Debut open price (e.g. 0.46)
  closingPrice?: number; // Day 1 close price (e.g. 0.435)
  day1High?: number; // Day 1 intraday high (e.g. 0.49)
  day1Low?: number; // Day 1 intraday low (e.g. 0.42)
  day1Volume?: number; // Day 1 shares traded (e.g. 68450000)
  firstDayGainPct?: number; // ((closingPrice - ipoPrice) / ipoPrice) * 100
  firstDayOpeningGainPct?: number; // ((openingPrice - ipoPrice) / ipoPrice) * 100
  intradaySpreadPct?: number;
  marketCapAtIpoRM?: number; // in RM'000
  peAtIpo?: number;
  webPriceSource?: WebIpoPriceSource;
  updatedAt?: string;
  updatedBy?: string;
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
  sourceFileName?: string;
  evaluatedAt?: string;
  isCustomUpload?: boolean;
  isCloudShared?: boolean;
  uploaderEmail?: string;
  cloudSharedAt?: string;
  normalizedCompanyName?: string;
  normalizedRegistrationNo?: string;

  // Shariah Compliance, IPO Pricing & Expert Analyst Coverage
  ipoPrice?: number;
  webPriceSource?: WebIpoPriceSource;
  shariahCompliance?: ShariahComplianceInfo;
  analystCoverage?: AnalystFairValue[];
  analystConsensus?: AnalystConsensus;
  listingPerformance?: ListingPerformance;

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

// ==========================================
// Malaysian Bursa IPO Tracker & Crawled Fair Values
// ==========================================

export interface ResearchHouseMeta {
  key: string;
  name: string;
  shortName: string;
  description: string;
  color: string;
  badgeBg: string;
}

export interface ResearchHouseFairValue {
  houseKey: string;
  houseName: string;
  fairValue?: number;
  rating?: string;
  reportDate?: string;
  sourceCitation?: string;
  sourceUrl?: string;
}

export interface TrackedIpoItem {
  id: string;
  stockName: string;
  fullName?: string;
  logoUrl?: string;
  logoText?: string;
  logoBgColor?: string;
  logoTextColor?: string;
  
  // Pricing & Status
  price: number; // IPO offer price in RM
  status: 'PAST_LISTED' | 'UPCOMING';
  
  // Dates
  openMiti?: string | null;
  closeMiti?: string | null;
  openPublic: string;
  closePublic: string;
  ballotPublic: string;
  listingPublic: string;
  
  // Shares & Market Cap
  mitiShareM?: number | null;
  publicShareM: number;
  totalShareM: number;
  marketCapRMJuta: number;
  
  // Application Registration Numbers & Oversubscription
  mitiRn?: number | string | null;
  maybankPublicRn?: number | string | null;
  osPublic?: number | null; // Oversubscription times (x)
  
  // Classification
  syariah: boolean;
  companyType: string;
  sector?: string;
  peMultiple?: number;
  
  // Debut Open (9 am debut)
  nineAmOpen?: {
    status: 'FAIL' | 'GAIN' | 'PAR' | 'PENDING';
    price?: number;
    text: string;
  };
  
  // Community / AI Scores
  iSahamScore?: string | null;
  iSahamM3AiScore?: string | null;
  
  // Research House Fair Values Map (keyed by houseKey, e.g. ta: 0.39)
  fairValues: {
    [houseKey: string]: number | undefined;
  };
  
  // Detailed metadata / citations per research house
  fairValueNotes?: {
    [houseKey: string]: {
      citation?: string;
      sourceUrl?: string;
      crawledAt?: string;
      basis?: string;
    };
  };

  lastCrawledAt?: string;
  sourceUrl?: string;
  notes?: string;
  isNewlyDiscovered?: boolean;
  discoveredAt?: string;
}

export interface AutoCrawlScheduleConfig {
  enabled: boolean;
  intervalMinutes: number; // e.g. 3, 5, 10, 15, 30, 60
  lastRunAt?: string;
  nextRunAt?: string;
}

export interface AutoCrawlLogEntry {
  id: string;
  timestamp: string;
  triggerType: 'AUTOMATIC' | 'MANUAL';
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  summary: string;
  newIposDiscoveredCount: number;
  newFairValuesExtractedCount: number;
  discoveredIpoNames?: string[];
  sourcesCount: number;
}

