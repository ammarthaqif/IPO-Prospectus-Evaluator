import type { ProspectusDossier } from '../types.ts';
export { goldLiProspectus } from './goldLiProspectus.ts';

export const scaSolutionsProspectus: ProspectusDossier = {
  id: 'sca-solutions-2025',
  companyName: 'SCA Solutions Berhad',
  registrationNo: '202501047718 (1649126-A)',
  currency: 'MYR',
  currencySymbol: 'RM',
  sector: 'Industrial & Building Automation / Mechanical & Electrical (M&E)',
  subSector: 'HVAC, Fire Safety Instrumentation & Water Treatment Solutions',
  listingMarket: 'ACE Market / Main Market Candidate',
  ipoPrice: 0.28,
  listingPerformance: {
    listingDate: 'Target: 25 November 2026',
    listingStatus: 'UPCOMING',
    ipoPrice: 0.28,
    marketCapAtIpoRM: 159495,
    peAtIpo: 10.5,
  },
  publicIssueShares: 114000000,
  offerForSaleShares: 56900000,
  totalOfferShares: 170900000,
  enlargedIssuedShares: 569625400,
  moratoriumPeriod: '6 Months from the date of Listing',
  promoters: [
    {
      name: 'Tan Cheng Eng',
      designation: 'Promoter & Managing Director',
      preShares: 285813689,
      prePct: 62.73,
      postShares: 249397689,
      postPct: 43.78,
    },
    {
      name: 'Liong Chian Leek',
      designation: 'Promoter & Executive Director',
      preShares: 160770202,
      prePct: 35.28,
      postShares: 140286202,
      postPct: 24.63,
    },
    {
      name: 'Liong Chian Yie',
      designation: 'Specified Shareholder & Head of Life Safety',
      preShares: 0,
      prePct: 0,
      postShares: 0,
      postPct: 0,
    }
  ],
  directors: [
    { name: "Dato' Chan Choy Lin", designation: 'Independent Non-Executive Chairperson' },
    { name: 'Tan Cheng Eng', designation: 'Managing Director' },
    { name: 'Liong Chian Leek', designation: 'Executive Director' },
    { name: 'Ho Kok Keong', designation: 'Independent Non-Executive Director' },
    { name: 'Datin Cho Oi Kwan', designation: 'Independent Non-Executive Director' },
    { name: 'Jamilah Binti Kamal', designation: 'Independent Non-Executive Director' },
  ],
  proceeds: [
    { purpose: 'Repayment of term financing facility for Kapar Property', amountRM: 14500, percentage: 38.2, timeframe: 'Within 24 months' },
    { purpose: 'Renovation for Kapar integrated facility & demo lab', amountRM: 8200, percentage: 21.6, timeframe: 'Within 24 months' },
    { purpose: 'Working capital & inventory expansion for Kapar Property', amountRM: 9800, percentage: 25.8, timeframe: 'Within 48 months' },
    { purpose: 'Sales, marketing & brand expansion across Malaysia', amountRM: 2500, percentage: 6.6, timeframe: 'Within 36 months' },
    { purpose: 'Estimated listing expenses', amountRM: 3000, percentage: 7.8, timeframe: 'Within 3 months' },
  ],
  financials: [
    {
      period: 'FYE 2022',
      revenue: 40762,
      costOfSales: 31375,
      gp: 9387,
      pbt: 4101,
      pat: 2930,
      gpMargin: 23.03,
      pbtMargin: 10.06,
      patMargin: 7.19,
      currentRatio: 3.40,
      gearingRatio: 0.19,
      receivablesTurnoverDays: 103,
      payablesTurnoverDays: 62,
      inventoryTurnoverDays: 96,
      cashConversionCycleDays: 137, // 103 + 96 - 62
      isAudited: true,
      notes: 'Audited 12-month financials',
    },
    {
      period: 'FYE 2023',
      revenue: 47242,
      costOfSales: 34431,
      gp: 12811,
      pbt: 6884,
      pat: 5089,
      gpMargin: 27.12,
      pbtMargin: 14.57,
      patMargin: 10.77,
      currentRatio: 3.32,
      gearingRatio: 0.16,
      receivablesTurnoverDays: 98,
      payablesTurnoverDays: 53,
      inventoryTurnoverDays: 107,
      cashConversionCycleDays: 152, // 98 + 107 - 53
      isAudited: true,
      notes: 'Audited 12-month financials. Robust margin expansion (+4.09% GP)',
    },
    {
      period: 'FYE 2024',
      revenue: 61634,
      costOfSales: 44301,
      gp: 17333,
      pbt: 10505,
      pat: 7782,
      gpMargin: 28.12,
      pbtMargin: 17.04,
      patMargin: 12.63,
      currentRatio: 2.49,
      gearingRatio: 0.22,
      receivablesTurnoverDays: 95,
      payablesTurnoverDays: 56,
      inventoryTurnoverDays: 95,
      cashConversionCycleDays: 134, // 95 + 95 - 56
      isAudited: true,
      notes: 'Audited 12-month financials. High revenue growth (+30.5% YoY)',
    },
    {
      period: 'FPE 2025 (9M)',
      revenue: 57098,
      costOfSales: 38592,
      gp: 18506,
      pbt: 11245,
      pat: 7763,
      gpMargin: 32.41,
      pbtMargin: 19.69,
      patMargin: 13.60,
      currentRatio: 3.04,
      gearingRatio: 0.19,
      receivablesTurnoverDays: 90,
      payablesTurnoverDays: 55,
      inventoryTurnoverDays: 84,
      cashConversionCycleDays: 119, // 90 + 84 - 55
      isAudited: true,
      notes: 'Audited 9-month period. Record gross margin (32.41%) driven by Fire Safety solutions surge.',
    },
  ],
  segmentRevenue: [
    {
      segment: 'Fire Safety - Solutions',
      subSegment: 'Engineering & Testing',
      fy2022: 9283,
      fy2022Pct: 22.78,
      fy2023: 12889,
      fy2023Pct: 27.28,
      fy2024: 24121,
      fy2024Pct: 39.14,
      fpe2025: 26446,
      fpe2025Pct: 46.32,
    },
    {
      segment: 'HVAC - Solutions',
      subSegment: 'Engineering & Commissioning',
      fy2022: 16150,
      fy2022Pct: 39.62,
      fy2023: 15598,
      fy2023Pct: 33.02,
      fy2024: 18677,
      fy2024Pct: 30.30,
      fpe2025: 13947,
      fpe2025Pct: 24.42,
    },
    {
      segment: 'HVAC - Distribution',
      subSegment: 'Standalone Components',
      fy2022: 10310,
      fy2022Pct: 25.29,
      fy2023: 12201,
      fy2023Pct: 25.82,
      fy2024: 12235,
      fy2024Pct: 19.85,
      fpe2025: 9922,
      fpe2025Pct: 17.38,
    },
    {
      segment: 'Water Treatment',
      subSegment: 'Greneco Systems & Chemicals',
      fy2022: 3853,
      fy2022Pct: 9.45,
      fy2023: 4496,
      fy2023Pct: 9.52,
      fy2024: 4008,
      fy2024Pct: 6.50,
      fpe2025: 4354,
      fpe2025Pct: 7.63,
    },
    {
      segment: 'Fire Safety - Distribution',
      subSegment: 'Standalone Components',
      fy2022: 1166,
      fy2022Pct: 2.86,
      fy2023: 2058,
      fy2023Pct: 4.36,
      fy2024: 2593,
      fy2024Pct: 4.21,
      fpe2025: 2429,
      fpe2025Pct: 4.25,
    },
  ],
  benchmarks: [
    {
      metric: '3-Year Revenue CAGR',
      unit: '%',
      issuerValue: 24.8,
      peerMedian: 11.4,
      topQuartile: 18.2,
      bottomQuartile: 5.6,
      assessment: 'SUPERIOR',
      commentary: 'Outperforming peer median by +13.4% driven by rapid capture of Malaysian data center and high-rise fire safety contracts.',
    },
    {
      metric: 'Gross Profit Margin',
      unit: '%',
      issuerValue: 32.4,
      peerMedian: 22.8,
      topQuartile: 26.5,
      bottomQuartile: 18.1,
      assessment: 'SUPERIOR',
      commentary: 'Top decile gross margins attributable to proprietary turnkey engineering, testing & commissioning services over pure equipment distribution.',
    },
    {
      metric: 'Net Profit Margin (PAT)',
      unit: '%',
      issuerValue: 13.6,
      peerMedian: 7.4,
      topQuartile: 9.8,
      bottomQuartile: 4.2,
      assessment: 'SUPERIOR',
      commentary: 'High operating leverage with lean SG&A overhead; key question is whether high margin is sustainable after Kapar facility expansion costs.',
    },
    {
      metric: 'Cash Conversion Cycle',
      unit: 'Days',
      issuerValue: 119,
      peerMedian: 138,
      topQuartile: 105,
      bottomQuartile: 165,
      assessment: 'IN_LINE',
      commentary: 'Improved from 152 days (FY23) to 119 days in FPE25 as inventory turnover accelerated from 107 to 84 days.',
    },
    {
      metric: 'Receivables Collection Days',
      unit: 'Days',
      issuerValue: 90,
      peerMedian: 112,
      topQuartile: 85,
      bottomQuartile: 135,
      assessment: 'IN_LINE',
      commentary: 'Better than industry average (112 days) despite commercial construction customer concentration; indicates effective credit management.',
    },
    {
      metric: 'Current Ratio (Liquidity)',
      unit: 'x',
      issuerValue: 3.04,
      peerMedian: 1.85,
      topQuartile: 2.40,
      bottomQuartile: 1.30,
      assessment: 'SUPERIOR',
      commentary: 'Substantial liquidity buffer with minimal short-term stress, though elevated cash holds suggest under-leveraged balance sheet prior to IPO.',
    },
    {
      metric: 'Gearing Ratio (Debt/Equity)',
      unit: 'x',
      issuerValue: 0.19,
      peerMedian: 0.48,
      topQuartile: 0.28,
      bottomQuartile: 0.75,
      assessment: 'SUPERIOR',
      commentary: 'Very conservative debt structure (0.19x). Repayment of Kapar financing from IPO proceeds will virtually eliminate term debt.',
    },
    {
      metric: 'Supplier Concentration Risk',
      unit: 'Score (1-100)',
      issuerValue: 88, // 88 is high risk concentration
      peerMedian: 45,
      topQuartile: 30,
      bottomQuartile: 65,
      assessment: 'ELEVATED_RISK',
      commentary: 'Severe single-point dependency on Belimo and Honeywell. Contractual loss or non-renewal would materially damage core revenue line.',
    },
    {
      metric: 'Contract Order Book Visibility',
      unit: 'Months',
      issuerValue: 4.2,
      peerMedian: 14.5,
      topQuartile: 18.0,
      bottomQuartile: 8.0,
      assessment: 'VULNERABLE',
      commentary: 'Revenue is sustained on rolling purchase orders without long-term binding framework contracts, leading to potential lumpiness.',
    },
  ],
  redFlags: [
    {
      id: 'RF-001',
      severity: 'CRITICAL',
      category: 'GOVERNANCE_RELATED_PARTY',
      title: 'Pre-IPO Dividend-in-Specie Carve-out of Subsidiary Greneco (51%) to Promoters',
      prospectusSection: 'Section 3.11 - Dividend Policy (page 17)',
      description: 'On 18 December 2025, just weeks prior to conversion into a public company, SCASB distributed 255,000 ordinary shares (51.00% equity) in Greneco by way of dividend-in-specie to promoters Tan Cheng Eng (32.64%) and Liong Chian Leek (18.36%).',
      evidenceExcerpt: '"On 18 December 2025, SCASB had distributed 255,000 ordinary shares in Greneco, representing 51.00% equity interest in Greneco, by way of dividend-in-specie to Tan Cheng Eng and Liong Chian Leek... completed on 29 December 2025... Subsequent to LPD, no dividend was declared."',
      regulatoryRiskImplication: 'Regulatory scrutiny on asset-stripping or pre-IPO restructuring that extracts value immediately prior to public subscription. Fund managers must audit the acquisition valuation when Greneco was consolidated back into the listing vehicle.',
      mitigatingFactors: 'The group corporate structure shows Greneco as 100% owned subsidiary upon listing, indicating internal share exchange or re-acquisition took place prior to prospectus issuance.',
      recommendedAuditQuery: 'Request the independent fairness opinion and detailed cash/share consideration terms for the pre-IPO carveout and subsequent re-acquisition of the 51% Greneco stake.',
    },
    {
      id: 'RF-002',
      severity: 'CRITICAL',
      category: 'SUPPLIER_CONCENTRATION',
      title: 'Extreme Dependency on Two Principal Principals (Belimo & Honeywell)',
      prospectusSection: 'Section 3.6(a) - Risk Factors (page 12)',
      description: 'The Group is critically dependent on continuous distributorship status from Belimo Automation Malaysia Sdn Bhd and Honeywell International Sdn Bhd. Non-renewal or termination would paralyze instrumentation solutions.',
      evidenceExcerpt: '"We are highly dependent on the continuous supply of HVAC and fire safety instrumentation components and accessories from principals and authorised distributors, particularly from 2 of our major suppliers, i.e. Belimo Automation Malaysia Sdn Bhd and Honeywell International Sdn Bhd... There is no guarantee that these principals and authorised distributors will agree to renew... or will not terminate the relationships."',
      regulatoryRiskImplication: 'Single-source vulnerability without binding long-term exclusive supply covenants. High risk of channel disintermediation if Belimo or Honeywell decide to sell directly to M&E contractors.',
      mitigatingFactors: 'Over 20-year established relationship with principals; management holds multi-brand distributorship certificates across 7 countries (Switzerland, Germany, USA, etc.).',
      recommendedAuditQuery: 'What is the exact expiration date and renewal mechanism for the Belimo and Honeywell distributorship agreements? What percentage of FY24 Cost of Sales came from these two vendors?',
    },
    {
      id: 'RF-003',
      severity: 'HIGH',
      category: 'CONTRACTUAL_STABILITY',
      title: 'Absence of Long-Term Binding Contracts (Ad-Hoc Purchase Orders)',
      prospectusSection: 'Section 3.6(c) - Risk Factors (page 12-13)',
      description: 'Major building & infrastructure project revenue is executed via piecemeal purchase orders (POs) without formal long-term contracts or guaranteed letters of award. Customers have zero legal obligation to continue ordering.',
      evidenceExcerpt: '"...each project typically consists of multiple purchase orders issued by the respective customers... However, there is no assurance that we will continue to receive purchase orders from our customers despite the continuation of their projects, as they are not obliged to source the necessary components and accessories from us in view of the absence of a formal contract or letter of award."',
      regulatoryRiskImplication: 'Extreme forward earnings volatility. Backlog figures are not contractually locked and could evaporate in a commercial real estate downturn.',
      mitigatingFactors: 'Long project cycles (12-36 months) often require consistent system components for testing and commissioning certification once specified by M&E consultants.',
      recommendedAuditQuery: 'What is the historical PO cancellation rate or client churn rate over the past 3 financial years?',
    },
    {
      id: 'RF-004',
      severity: 'HIGH',
      category: 'MORATORIUM',
      title: 'Minimal 6-Month Share Moratorium for Specified Promoters',
      prospectusSection: 'Section 3.1 & 3.8 - Principal Details & Moratorium (page 8 & 14)',
      description: 'Promoters Tan Cheng Eng (43.78%) and Liong Chian Leek (24.63%) hold combined 68.41% post-IPO shares, which are subject to a brief 6-month statutory moratorium from the listing date.',
      evidenceExcerpt: '"The entire shareholdings of our Specified Shareholders, namely Tan Cheng Eng, Liong Chian Leek and Liong Chian Yie, after our IPO will be held under moratorium for 6 months from the date of our Listing."',
      regulatoryRiskImplication: 'Substantial overhang risk once the 6-month lockup expires. Coupled with the 56.9M shares being cashed out via Offer for Sale, promoters are monetizing equity aggressively.',
      mitigatingFactors: 'Promoters retain significant controlling stake (68.41% combined) ensuring aligned long-term incentive post-IPO.',
      recommendedAuditQuery: 'Will promoters commit to voluntary staged moratorium lockups (e.g. 50% locked for additional 12-24 months) to give institutional investors price stability?',
    },
    {
      id: 'RF-005',
      severity: 'MEDIUM',
      category: 'WORKING_CAPITAL',
      title: 'Capital-Intensive Upfront Inventory Commitments & Negative Operating Cash Risk',
      prospectusSection: 'Section 3.6(e) & 3.5(b) - Risk Factors & Expansion (page 11 & 13)',
      description: 'Turnkey M&E solutions require substantial upfront cash outlays to procure components prior to customer milestones, risking negative operating cash flows.',
      evidenceExcerpt: '"...require substantial upfront working capital for the purchase and/or stocking of instrumentation components... As such, we may incur negative operating cash flows arising from cash outlays for the procurement of components and accessories as well as expenditures incurred in securing purchase orders..."',
      regulatoryRiskImplication: 'Cash flow sensitivity to working capital spikes. If growth accelerates, operating cash flow may diverge sharply from stated PAT profits.',
      mitigatingFactors: 'Current ratio is robust at 3.04x and gearing is minimal (0.19x). IPO proceeds designate RM9.8M specifically for working capital cushion.',
      recommendedAuditQuery: 'Provide historical operating cash flow vs PAT reconciliation for FY22-FY24 and FPE25.',
    },
    {
      id: 'RF-006',
      severity: 'MEDIUM',
      category: 'DILUTION_FLOAT',
      title: 'Large Secondary Offer for Sale (33.3% of Total IPO Shares)',
      prospectusSection: 'Section 3.1 - Principal Details (page 8)',
      description: 'Out of 170.9M total IPO shares offered, 56.9M shares (33.3%) represent secondary Offer for Sale by selling shareholders, meaning RM proceeds go directly to founders rather than company expansion.',
      evidenceExcerpt: '"Our IPO comprises the Public Issue of 114,000,000 Issue Shares and the Offer for Sale by the Selling Shareholders of 56,900,000 Offer Shares at the IPO Price."',
      regulatoryRiskImplication: 'Substantial cash extraction by promoters at IPO. Public investors are partially funding founder liquidity rather than corporate capex.',
      mitigatingFactors: 'The 114M new issue shares still provide 66.7% of the total offering for corporate expansion (Kapar facility & debt repayment).',
      recommendedAuditQuery: 'What are the promoters\' personal intentions for the secondary sale proceeds, and are there any personal liability pledges?',
    }
  ],
  sentiment: {
    overallScore: 32, // -100 to +100
    classification: 'Cautiously Optimistic',
    hedgingIndex: 68, // 68% defensive legal disclosures
    transparencyScore: 78,
    redFlagCount: {
      critical: 2,
      high: 2,
      medium: 2,
      low: 0,
    },
    executiveSummary: 'The prospectus exhibits strong fundamental commercial momentum in Fire Safety solutions (+176% revenue surge from FY22 to annualized FPE25), but is tempered by aggressive promoter equity monetization (56.9M secondary shares + pre-IPO Greneco dividend-in-specie) and high supplier vulnerability to Belimo/Honeywell.',
    toneAnalysis: 'Disclosure language in the Operational and Financial Highlights is highly confident with detailed SKU granularity (922 to 1,109 SKUs). However, the Risk Factors section contains standard Malaysian capital markets defensive hedging around purchase order continuity and supplier non-renewal clauses.',
    sections: [
      {
        sectionName: '3.1 Principal Details & Moratorium',
        prospectusReference: 'Page 8',
        score: -15,
        sentiment: 'Cautious',
        hedgingRatio: 60,
        keyFinding: 'Enlarged share capital of 569.6M shares. Secondary offer for sale (56.9M shares) and brief 6-month moratorium create overhang.',
      },
      {
        sectionName: '3.3 Business Model & Strengths',
        prospectusReference: 'Page 9-10',
        score: 65,
        sentiment: 'Bullish',
        hedgingRatio: 35,
        keyFinding: '20+ years track record, 36-person engineering team (32 degreed/certified), and expanding water treatment footprint.',
      },
      {
        sectionName: '3.6 Risk Factors',
        prospectusReference: 'Page 12-13',
        score: -60,
        sentiment: 'Highly Defensive',
        hedgingRatio: 88,
        keyFinding: 'Severe legal caveat language regarding Belimo/Honeywell termination and absence of formal contracts/letters of award.',
      },
      {
        sectionName: '3.10 Financial & Operational Highlights',
        prospectusReference: 'Page 15-16',
        score: 82,
        sentiment: 'Bullish',
        hedgingRatio: 20,
        keyFinding: 'Phenomenal gross margin expansion to 32.41% in FPE25 with PAT reaching RM7.76M in just 9 months. Net debt near zero.',
      },
      {
        sectionName: '3.11 Dividend Policy & Greneco Restructuring',
        prospectusReference: 'Page 17',
        score: -45,
        sentiment: 'Cautious',
        hedgingRatio: 72,
        keyFinding: 'Special dividend-in-specie of 51% Greneco shares directly to Tan Cheng Eng and Liong Chian Leek in Dec 2025 before conversion.',
      },
    ],
  },
  fundManagerVerdict: {
    recommendation: 'OVERWEIGHT',
    convictionScore: 8,
    investmentThesis: 'Compelling market position in mission-critical data center and commercial fire safety automation with expanding margins, subject to underwriting clarification on Greneco carveout.',
    bullCase: 'Acceleration of regional data center builds and mandatory fire safety compliance drives 30%+ revenue expansion.',
    bearCase: 'Loss of Belimo or Honeywell distributorship or severe project payment delays compress operating cash flow.',
    keyMonitoringMilestones: ['Kapar integrated facility completion', 'Distributorship renewal confirmations', 'Operating cash flow conversion'],
  },
  dividends: {
    history: [
      { period: 'FYE 2022', amountRM: 2025, payoutPctPAT: 69.1, type: '100% Cash', description: 'Pre-IPO cash distribution' },
      { period: 'FYE 2023', amountRM: 1300, payoutPctPAT: 25.5, type: '100% Cash', description: 'Interim dividend' },
      { period: 'FYE 2024', amountRM: 5800, payoutPctPAT: 74.5, type: 'Cash Distribution', description: 'Pre-IPO capital release' },
      { period: 'FPE 2025', amountRM: 4000, payoutPctPAT: 51.5, type: 'Cash Interim', description: '9-month interim extraction' },
      { period: 'Post-Period to LPD', amountRM: 2283, payoutPctPAT: 29.3, type: 'Cash & Carveout', description: 'Includes RM283k Greneco distribution' },
    ],
    dividendPolicy: 'Target dividend payout of at least 30% of consolidated Profit After Tax attributable to owners of the Group.',
    carveoutsOrRestructuring: 'On 18 December 2025, SCASB distributed 255,000 ordinary shares in Greneco (51.00% equity) by way of dividend-in-specie to Tan Cheng Eng (32.64%) and Liong Chian Leek (18.36%), completed on 29 December 2025. Total cumulative cash dividends extracted across review period: RM15,408,000.',
    carveoutTitle: 'Critical Audit Finding: Greneco 51% Carveout to Promoters',
    carveoutAuditAction: 'Verify the exact transfer price, fair value calculation, and share consolidation agreement used to return Greneco to 100% group ownership prior to the IPO prospectus sign-off.',
  },
  fundamentalStrengths: [
    'Gross margin expanded sequentially from 23.03% in FY22 to 32.41% in FPE25, driven by higher value-added technical consultation, custom testing, and commissioning in the fire safety segment.',
    'Conservative balance sheet gearing of 0.19x with high Current Ratio of 3.04x providing liquidity resilience against construction credit delays.',
    'Over 20 years established relationship as Tier-1 value-added partner with Belimo and Honeywell.',
  ],
  keyCaveats: [
    'FPE 2025 covers 9 months only (not full year). Annualised revenue is ~RM76.1M, representing +23.5% growth over FY24. Ensure no revenue lumpiness or seasonal year-end reversals occur.',
    'Heavy reliance on dual principals without long-term exclusive supply covenants; lack of binding long-term contracts (orders on rolling purchase order basis).',
    'Pre-IPO dividend extractions totaling RM15.4M and 51% Greneco carveout require forensic accounting review.',
  ],
  sections: [
    { id: '3.1', title: '3.1 Principal Details & Moratorium', pageRange: 'Page 8', riskLevel: 'HIGH', summary: 'Public issue of 114M shares, offer for sale 56.9M shares. 6 months promoter lockup.' },
    { id: '3.2', title: '3.2 Group & Principal Activities', pageRange: 'Page 8', riskLevel: 'LOW', summary: 'M&E engineering, building automation, and life safety solutions.' },
    { id: '3.3', title: '3.3 Business Model & Group Structure', pageRange: 'Page 9', riskLevel: 'LOW', summary: 'Turnkey testing, commissioning and specialized component distribution.' },
    { id: '3.4', title: '3.4 Competitive Strengths', pageRange: 'Page 9-10', riskLevel: 'LOW', summary: 'Proprietary engineering team (32 certified engineers) and 20+ year client retention.' },
    { id: '3.5', title: '3.5 Future Plans & Kapar Facility', pageRange: 'Page 11', riskLevel: 'MEDIUM', summary: 'RM22.7M allocated to integrated corporate headquarters, testing lab and warehousing.' },
    { id: '3.6', title: '3.6 Risk Factors (Belimo/Honeywell/POs)', pageRange: 'Page 11-13', riskLevel: 'CRITICAL', summary: 'Distributor termination risk and absence of multi-year contract backlog.' },
    { id: '3.7', title: '3.7 Directors & Key Senior Management', pageRange: 'Page 13-14', riskLevel: 'LOW', summary: 'Board governance and executive leadership.' },
    { id: '3.8', title: '3.8 Promoters & Substantial Shareholders', pageRange: 'Page 14', riskLevel: 'MEDIUM', summary: 'Controlling promoters retaining 68.41% combined post-IPO equity.' },
    { id: '3.9', title: '3.9 Utilisation of Proceeds', pageRange: 'Page 14-15', riskLevel: 'LOW', summary: 'Expansion, term loan repayment, and working capital allocations.' },
    { id: '3.10', title: '3.10 Financial & Operational Highlights', pageRange: 'Page 15-16', riskLevel: 'LOW', summary: '3-year audited income statement and 9-month FPE25 figures.' },
    { id: '3.11', title: '3.11 Dividend Policy & Greneco Carveout', pageRange: 'Page 17', riskLevel: 'CRITICAL', summary: 'Dividend-in-specie carveout of Greneco to promoters prior to public listing.' },
  ],
  peerGroups: [
    {
      id: 'bursaMe',
      name: 'Bursa Malaysia M&E & Building Engineering Peers',
      description: 'Listed Bursa Malaysia M&E Engineering & Contractor peers (e.g. Kelington, Critical Holdings, HE Group)',
      benchmarks: [
        { metric: '3-Year Revenue CAGR', unit: '%', issuerValue: 24.8, peerMedian: 11.4, topQuartile: 18.2, bottomQuartile: 5.6, assessment: 'SUPERIOR', commentary: 'Outperforming peer median by +13.4% driven by rapid capture of Malaysian data center contracts.' },
        { metric: 'Gross Profit Margin', unit: '%', issuerValue: 32.4, peerMedian: 22.8, topQuartile: 26.5, bottomQuartile: 18.1, assessment: 'SUPERIOR', commentary: 'Top decile gross margins attributable to proprietary turnkey testing & commissioning.' },
        { metric: 'Net Profit Margin (PAT)', unit: '%', issuerValue: 13.6, peerMedian: 7.4, topQuartile: 9.8, bottomQuartile: 4.2, assessment: 'SUPERIOR', commentary: 'High operating leverage with lean SG&A overhead.' },
        { metric: 'Cash Conversion Cycle', unit: 'Days', issuerValue: 119, peerMedian: 138, topQuartile: 105, bottomQuartile: 165, assessment: 'IN_LINE', commentary: 'Improved from 152 days in FY23 to 119 days in FPE25.' },
        { metric: 'Current Ratio (Liquidity)', unit: 'x', issuerValue: 3.04, peerMedian: 1.85, topQuartile: 2.4, bottomQuartile: 1.3, assessment: 'SUPERIOR', commentary: 'Substantial liquidity buffer with zero short-term distress.' },
      ],
    },
    {
      id: 'automation',
      name: 'Regional Industrial Instrumentation & Automation Distributors',
      description: 'Regional component distributors and building automation system integrators',
      benchmarks: [
        { metric: 'Gross Profit Margin', unit: '%', issuerValue: 32.4, peerMedian: 20.5, topQuartile: 24.0, bottomQuartile: 16.5, assessment: 'SUPERIOR', commentary: 'Superior margins due to engineering solutions overlay.' },
        { metric: 'Inventory Turnover Days', unit: 'Days', issuerValue: 84, peerMedian: 75, topQuartile: 60, bottomQuartile: 95, assessment: 'IN_LINE', commentary: 'Acceptable inventory velocity given specialized import lead times.' },
        { metric: 'Supplier Concentration Risk', unit: 'Score', issuerValue: 85, peerMedian: 45, topQuartile: 30, bottomQuartile: 65, assessment: 'ELEVATED_RISK', commentary: 'High dual dependence on Belimo and Honeywell.' },
      ],
    },
    {
      id: 'fireSafety',
      name: 'Specialty Life Safety & Turnkey Engineering Contractors',
      description: 'Listed fire engineering and mission-critical life safety contractors',
      benchmarks: [
        { metric: '3-Year Revenue CAGR', unit: '%', issuerValue: 24.8, peerMedian: 9.8, topQuartile: 15.2, bottomQuartile: 4.0, assessment: 'SUPERIOR', commentary: 'Outpacing pure-play fire protection contractors.' },
        { metric: 'Operating Margin', unit: '%', issuerValue: 18.2, peerMedian: 11.5, topQuartile: 14.0, bottomQuartile: 8.2, assessment: 'SUPERIOR', commentary: 'Strong technical consulting pricing power.' },
        { metric: 'Order Book Visibility', unit: 'Months', issuerValue: 4.2, peerMedian: 14.5, topQuartile: 18.0, bottomQuartile: 9.0, assessment: 'VULNERABLE', commentary: 'Short visibility due to purchase order model without multi-year contracts.' },
      ],
    },
  ],
  rawProspectusText: `Registration No. 202501047718 (1649126-A)
SCA SOLUTIONS BERHAD (Incorporated in Malaysia under the Companies Act 2016)
INITIAL PUBLIC OFFERING ("IPO") IN CONJUNCTION WITH OUR LISTING ON THE ACE MARKET OF BURSA MALAYSIA SECURITIES BERHAD

3. PROSPECTUS SUMMARY
THIS PROSPECTUS SUMMARY HIGHLIGHTS KEY INFORMATION DERIVED FROM AND FULLY DETAILED WITHIN THE MAIN BODY OF THIS PROSPECTUS.

3.1 PRINCIPAL DETAILS OF OUR IPO AND SHARE CAPITAL
- Public Issue: 114,000,000 new ordinary shares ("Issue Shares"), representing 20.01% of our enlarged issued share capital.
- Offer for Sale: 56,900,000 existing ordinary shares ("Offer Shares"), representing 9.99% of our enlarged issued share capital.
- Total IPO Shares Offered: 170,900,000 shares (30.00% of enlarged issued share capital).
- Enlarged Issued Share Capital upon Listing: 569,625,400 ordinary shares.
- Moratorium on Shares: Specified Shareholders Tan Cheng Eng, Liong Chian Leek and Liong Chian Yie have undertaken a mandatory statutory moratorium on their shareholdings for a period of 6 months from the date of Listing.

3.2 OUR GROUP AND PRINCIPAL ACTIVITIES
SCA Solutions Berhad was incorporated on 10 October 2025 as a private limited company and subsequently converted to a public company on 30 December 2025.
Our operational subsidiaries comprise:
- SCA Solutions Sdn Bhd ("SCASB") (100% equity interest) - Core engineering and distribution.
- Ace Victech Sdn Bhd (100% equity interest) - Instrumentation and automation systems.
- Greneco Sdn Bhd ("Greneco") (pre-restructuring operating subsidiary).
Our Group is primarily engaged in:
(i) Provision of HVAC and fire safety instrumentation solutions, including system design, testing, commissioning, and maintenance;
(ii) Supply and distribution of specialized HVAC and fire safety components; and
(iii) Provision of industrial water treatment solutions and chemical dosing systems.

3.3 BUSINESS MODEL & CORE OPERATIONS
Our business model combines value-added technical engineering consulting with direct authorized distribution of mission-critical instrumentation. We serve tier-1 mechanical and electrical (M&E) contractors, industrial facility operators, data centers, and commercial infrastructure owners across Malaysia.

3.4 COMPETITIVE STRENGTHS
- Over 20 years of operating history and proven delivery track record in the Malaysian M&E engineering sector.
- In-house technical team of 36 dedicated employees, of whom 32 hold formal engineering degrees, diplomas, or accredited technical certifications.
- Comprehensive product portfolio spanning 922 to 1,109 active SKUs of specialized HVAC and life safety instrumentation components.
- Established long-standing distribution network with tier-1 international technology principals headquartered in Switzerland, Germany, Belgium, China, USA, Denmark, and Ireland.

3.5 FUTURE PLANS & KAPAR INTEGRATED FACILITY
To support expanding order flow and internalize assembly and testing:
- Group has earmarked RM22.70 million of capital expenditure towards the acquisition and comprehensive renovation of an integrated corporate headquarters, testing laboratory, demo training facility, and centralized warehouse located at Kapar, Selangor ("Kapar Property").

3.6 RISK FACTORS (AUDITED DISCLOSURES)
- High Supplier Concentration: Our Group is substantially dependent on continuous component supply and non-exclusive distributorship arrangements from Belimo Automation Malaysia Sdn Bhd and Honeywell International Sdn Bhd.
- Key Management Dependency: Continued success depends crucially upon the active stewardship of our Executive Directors, Tan Cheng Eng (Managing Director) and Liong Chian Leek (Executive Director).
- Absence of Long-Term Binding Contracts: Revenue is predominantly generated through short-term purchase orders (POs) without formal multi-year binding contracts or master service agreements.
- Technical Talent Retention: Operations rely heavily on the specialized domain expertise of our 36-person engineering and technical team.
- Working Capital Intensity: Large upfront component procurement and milestone testing cycles require substantial operating liquidity.

3.7 DIRECTORS AND KEY SENIOR MANAGEMENT
- Dato' Chan Choy Lin — Independent Non-Executive Chairperson
- Tan Cheng Eng — Managing Director & Promoter
- Liong Chian Leek — Executive Director & Promoter
- Ho Kok Keong — Independent Non-Executive Director
- Datin Cho Oi Kwan — Independent Non-Executive Director
- Jamilah Binti Kamal — Independent Non-Executive Director

3.8 PROMOTERS AND SUBSTANTIAL SHAREHOLDERS' SHAREHOLDINGS
Before IPO / Pre-Listing:
- Tan Cheng Eng: 285,813,689 shares (62.73% direct equity interest)
- Liong Chian Leek: 160,770,202 shares (35.28% direct equity interest)
- Liong Chian Yie: 0 shares (0.00% direct equity interest; Specified Shareholder)
After IPO / Post-Listing (Enlarged Capital of 569,625,400 Shares):
- Tan Cheng Eng: 249,397,689 shares (43.78% direct equity interest; subject to 6-month moratorium)
- Liong Chian Leek: 140,286,202 shares (24.63% direct equity interest; subject to 6-month moratorium)
- Liong Chian Yie: 0 shares (0.00% direct equity interest; subject to 6-month moratorium)

3.9 UTILISATION OF IPO PROCEEDS
The gross proceeds arising from the Public Issue amounting to RM38.00 million (RM38,000,000) will be allocated as follows:
1. Repayment of term financing facility for the acquisition of Kapar Property: RM14,500k (38.16% / ~38.2%) — Within 24 months.
2. Renovation for Kapar integrated facility, testing demo lab & warehouse: RM8,200k (21.58% / ~21.6%) — Within 24 months.
3. Working capital and inventory expansion for Kapar Property: RM9,800k (25.79% / ~25.8%) — Within 48 months.
4. Sales, marketing & brand expansion across Peninsular and East Malaysia: RM2,500k (6.58% / ~6.6%) — Within 36 months.
5. Defraying estimated listing expenses: RM3,000k (7.89% / ~7.8%) — Within 3 months.
Total Gross Proceeds: RM38,000k (100.0%).

3.10 AUDITED FINANCIAL AND OPERATIONAL HIGHLIGHTS
Values presented in RM'000 (thousand Ringgit Malaysia):
- FYE 2022: Revenue RM40,762 | Cost of Sales (RM31,375) | Gross Profit RM9,387 (GP Margin 23.03%) | PBT RM4,101 (PBT Margin 10.06%) | PAT RM2,930 (PAT Margin 7.19%) | Current Ratio 3.40x | Gearing Ratio 0.19x | Receivables 103 days | Payables 62 days | Inventory 96 days | Cash Conversion Cycle (CCC) 137 days (Audited 12 months).
- FYE 2023: Revenue RM47,242 | Cost of Sales (RM34,431) | Gross Profit RM12,811 (GP Margin 27.12%) | PBT RM6,884 (PBT Margin 14.57%) | PAT RM5,089 (PAT Margin 10.77%) | Current Ratio 3.32x | Gearing Ratio 0.16x | Receivables 98 days | Payables 53 days | Inventory 107 days | Cash Conversion Cycle (CCC) 152 days (Audited 12 months).
- FYE 2024: Revenue RM61,634 | Cost of Sales (RM44,301) | Gross Profit RM17,333 (GP Margin 28.12%) | PBT RM10,505 (PBT Margin 17.04%) | PAT RM7,782 (PAT Margin 12.63%) | Current Ratio 2.49x | Gearing Ratio 0.22x | Receivables 95 days | Payables 56 days | Inventory 95 days | Cash Conversion Cycle (CCC) 134 days (Audited 12 months).
- FPE 2025 (9-Month Period): Revenue RM57,098 | Cost of Sales (RM38,592) | Gross Profit RM18,506 (GP Margin 32.41%) | PBT RM11,245 (PBT Margin 19.69%) | PAT RM7,763 (PAT Margin 13.60%) | Current Ratio 3.04x | Gearing Ratio 0.19x | Receivables 90 days | Payables 55 days | Inventory 84 days | Cash Conversion Cycle (CCC) 119 days (Audited 9 months).

3.10.1 SEGMENTAL REVENUE BREAKDOWN
Consolidated Segments:
- HVAC Segment: FY22 RM26,460k (64.91%) -> FY23 RM27,799k (58.84%) -> FY24 RM30,912k (50.15%) -> FPE25 RM23,869k (41.80%)
- Fire Safety Segment: FY22 RM10,449k (25.64%) -> FY23 RM14,947k (31.64%) -> FY24 RM26,714k (43.35%) -> FPE25 RM28,875k (50.57%)
- Water Treatment Segment: FY22 RM3,853k (9.45%) -> FY23 RM4,496k (9.52%) -> FY24 RM4,008k (6.50%) -> FPE25 RM4,354k (7.63%)
Detailed Subsegments (in RM'000):
1. Fire Safety - Solutions (Engineering & Testing): FY22 RM9,283 (22.78%) | FY23 RM12,889 (27.28%) | FY24 RM24,121 (39.14%) | FPE25 RM26,446 (46.32%)
2. HVAC - Solutions (Engineering & Commissioning): FY22 RM16,150 (39.62%) | FY23 RM15,598 (33.02%) | FY24 RM18,677 (30.30%) | FPE25 RM13,947 (24.42%)
3. HVAC - Distribution (Standalone Components): FY22 RM10,310 (25.29%) | FY23 RM12,201 (25.82%) | FY24 RM12,235 (19.85%) | FPE25 RM9,922 (17.38%)
4. Water Treatment (Greneco Systems & Chemicals): FY22 RM3,853 (9.45%) | FY23 RM4,496 (9.52%) | FY24 RM4,008 (6.50%) | FPE25 RM4,354 (7.63%)
5. Fire Safety - Distribution (Standalone Components): FY22 RM1,166 (2.86%) | FY23 RM2,058 (4.36%) | FY24 RM2,593 (4.21%) | FPE25 RM2,429 (4.25%)
Total Group Revenue: FY22 RM40,762 (100.0%) | FY23 RM47,242 (100.0%) | FY24 RM61,634 (100.0%) | FPE25 RM57,098 (100.0%).

3.11 DIVIDEND POLICY AND PRE-IPO RESTRUCTURING
- Dividend History: In respect of FYE 2022, FYE 2023, FYE 2024, and FPE 2025, our operational subsidiaries declared and paid total dividends of RM2.025 million, RM1.300 million, RM5.800 million, and RM4.000 million respectively. Subsequent to FPE 2025 and up to the Latest Practicable Date (LPD), further dividends of RM2.283 million were declared and settled (comprising RM2.003 million cash and RM0.280 million dividend-in-specie).
- Pre-IPO Carveout of Greneco: On 18 December 2025, SCASB distributed its 255,000 ordinary shares (representing 51.00% equity interest) held in Greneco Sdn Bhd by way of dividend-in-specie to promoters Tan Cheng Eng and Liong Chian Leek.
- Dividend Policy: Upon Listing, our Board intends to adopt a target dividend payout ratio of 30.0% to 50.0% of our annual consolidated Net Profit After Tax attributable to owners of the company.`,
};

// Alternative sample for comparison & user testing
export const sampleSaaSProspectus: ProspectusDossier = {
  id: 'cloudnexus-2025',
  companyName: 'CloudNexus AI Enterprise Inc.',
  registrationNo: 'US-SEC-CIK-000192847',
  currency: 'USD',
  currencySymbol: '$',
  sector: 'Enterprise Software & Cloud Infrastructure',
  subSector: 'B2B AI Agent Workflow Automation',
  listingMarket: 'NASDAQ Global Select',
  publicIssueShares: 25000000,
  offerForSaleShares: 5000000,
  totalOfferShares: 30000000,
  enlargedIssuedShares: 145000000,
  moratoriumPeriod: '180 Days Lock-up Agreement',
  promoters: [
    {
      name: 'Elena Rostova (Founder & CEO)',
      designation: 'Founder, CEO & Chair',
      preShares: 42000000,
      prePct: 35.0,
      postShares: 38000000,
      postPct: 26.2,
    },
    {
      name: 'Venture Partners Alpha',
      designation: 'Lead Institutional Investor',
      preShares: 36000000,
      prePct: 30.0,
      postShares: 32000000,
      postPct: 22.1,
    }
  ],
  directors: [
    { name: 'Elena Rostova', designation: 'CEO & Chair' },
    { name: 'Marcus Sterling', designation: 'Independent Director (ex-CFO Oracle)' },
    { name: 'Dr. Sanjay Patel', designation: 'Chief Technology Officer' },
    { name: 'Rachel Green', designation: 'Independent Audit Committee Chair' },
  ],
  proceeds: [
    { purpose: 'R&D and proprietary model training infrastructure', amountRM: 180000, percentage: 50.0, timeframe: '24-36 months' },
    { purpose: 'Global sales enterprise expansion (EMEA & APAC)', amountRM: 108000, percentage: 30.0, timeframe: '24 months' },
    { purpose: 'Working capital and general corporate purposes', amountRM: 54000, percentage: 15.0, timeframe: '36 months' },
    { purpose: 'Underwriting and listing advisory expenses', amountRM: 18000, percentage: 5.0, timeframe: 'Upon closing' },
  ],
  financials: [
    {
      period: 'FY 2022',
      revenue: 45000,
      costOfSales: 13500,
      gp: 31500,
      pbt: -12500,
      pat: -12500,
      gpMargin: 70.0,
      pbtMargin: -27.7,
      patMargin: -27.7,
      currentRatio: 2.10,
      gearingRatio: 0.05,
      receivablesTurnoverDays: 62,
      payablesTurnoverDays: 45,
      inventoryTurnoverDays: 0,
      cashConversionCycleDays: 17,
      isAudited: true,
      notes: 'High R&D investment phase and foundational model development',
    },
    {
      period: 'FY 2023',
      revenue: 82000,
      costOfSales: 22960,
      gp: 59040,
      pbt: 2460,
      pat: 1640,
      gpMargin: 72.0,
      pbtMargin: 3.0,
      patMargin: 2.0,
      currentRatio: 2.80,
      gearingRatio: 0.02,
      receivablesTurnoverDays: 58,
      payablesTurnoverDays: 48,
      inventoryTurnoverDays: 0,
      cashConversionCycleDays: 10,
      isAudited: true,
      notes: 'Inflection to GAAP operating profitability (+82.2% YoY revenue growth)',
    },
    {
      period: 'FY 2024',
      revenue: 142000,
      costOfSales: 35500,
      gp: 106500,
      pbt: 21300,
      pat: 15762,
      gpMargin: 75.0,
      pbtMargin: 15.0,
      patMargin: 11.1,
      currentRatio: 3.40,
      gearingRatio: 0.00,
      receivablesTurnoverDays: 52,
      payablesTurnoverDays: 50,
      inventoryTurnoverDays: 0,
      cashConversionCycleDays: 2,
      isAudited: true,
      notes: 'Inflection to positive Net Income ($15.76M) & 75.0% subscription gross margin',
    },
  ],
  segmentRevenue: [
    {
      segment: 'Enterprise AI Subscriptions (ARR)',
      subSegment: 'Recurring Cloud SaaS',
      fy2022: 36000,
      fy2022Pct: 80.0,
      fy2023: 71340,
      fy2023Pct: 87.0,
      fy2024: 129220,
      fy2024Pct: 91.0,
      fpe2025: 0,
      fpe2025Pct: 0,
    },
    {
      segment: 'Professional Implementation & Support',
      subSegment: 'Services',
      fy2022: 9000,
      fy2022Pct: 20.0,
      fy2023: 10660,
      fy2023Pct: 13.0,
      fy2024: 12780,
      fy2024Pct: 9.0,
      fpe2025: 0,
      fpe2025Pct: 0,
    },
  ],
  benchmarks: [
    {
      metric: 'Net Revenue Retention (NRR)',
      unit: '%',
      issuerValue: 128,
      peerMedian: 112,
      topQuartile: 122,
      bottomQuartile: 104,
      assessment: 'SUPERIOR',
      commentary: 'Exceptional account expansion within Fortune 500 accounts.',
    },
    {
      metric: 'Gross Margin (Subscription)',
      unit: '%',
      issuerValue: 75.0,
      peerMedian: 71.0,
      topQuartile: 78.0,
      bottomQuartile: 65.0,
      assessment: 'SUPERIOR',
      commentary: 'Top quartile software economics.',
    },
    {
      metric: 'Rule of 40 Score',
      unit: '%',
      issuerValue: 84.1, // 73% growth + 11.1% margin
      peerMedian: 38.0,
      topQuartile: 52.0,
      bottomQuartile: 22.0,
      assessment: 'SUPERIOR',
      commentary: 'Elite Rule of 40 performer qualifying for tier-1 valuation multiple.',
    },
    {
      metric: 'Hyperscaler Cloud Concentration',
      unit: 'Score',
      issuerValue: 92,
      peerMedian: 55,
      topQuartile: 35,
      bottomQuartile: 70,
      assessment: 'ELEVATED_RISK',
      commentary: 'Heavily reliant on AWS hosting credits and specialized GPU clusters.',
    },
  ],
  redFlags: [
    {
      id: 'RF-S01',
      severity: 'HIGH',
      category: 'SUPPLIER_CONCENTRATION',
      title: 'Extreme Reliance on AWS GPU Compute Quotas',
      prospectusSection: 'Item 1A - Risk Factors',
      description: 'Single-source provider for underlying high-end H100 clusters. Any interruption or pricing surge would compress gross margins.',
      evidenceExcerpt: '"We rely substantially upon Amazon Web Services to operate our core inference engines. If our compute pricing escalates upon IPO or credits terminate, our gross margins will be materially adversely impacted."',
      regulatoryRiskImplication: 'Hyperscaler lock-in risk and unhedged cloud capex exposure.',
      recommendedAuditQuery: 'What are the committed unit costs per GPU inference hour past the current master services agreement?',
    },
    {
      id: 'RF-S02',
      severity: 'MEDIUM',
      category: 'CAPITAL_STRUCTURE',
      title: 'Dual-Class Share Structure Disenfranchising Public Float',
      prospectusSection: 'Item 5 - Voting Rights',
      description: 'Class B common stock carries 20 votes per share, giving CEO 74% voting control post-IPO.',
      evidenceExcerpt: '"Holders of Class B common stock are entitled to 20 votes per share... Elena Rostova will continue to exercise voting control over all corporate decisions."',
      regulatoryRiskImplication: 'Governance discount; exclusion from certain FTSE Russell index tracking funds.',
      recommendedAuditQuery: 'Is there a time-based or transfer-based sunset provision for the Class B super-voting rights?',
    },
  ],
  sentiment: {
    overallScore: 68,
    classification: 'High Conviction Bullish',
    hedgingIndex: 42,
    transparencyScore: 89,
    redFlagCount: {
      critical: 0,
      high: 1,
      medium: 1,
      low: 0,
    },
    executiveSummary: 'Elite Rule-of-40 SaaS business inflecting into profitability, tempered only by dual-class voting control and cloud provider concentration.',
    toneAnalysis: 'High confidence disclosure backed by audited net retention metrics and cohort analysis.',
    sections: [
      {
        sectionName: 'MD&A and Unit Economics',
        prospectusReference: 'Item 7',
        score: 85,
        sentiment: 'Bullish',
        hedgingRatio: 22,
        keyFinding: 'Net dollar retention at 128% with CAC payback of 9.2 months.',
      },
      {
        sectionName: 'Risk Disclosures',
        prospectusReference: 'Item 1A',
        score: -30,
        sentiment: 'Cautious',
        hedgingRatio: 65,
        keyFinding: 'GPU cluster availability and AI safety liability disclaimers.',
      },
    ],
  },
  fundManagerVerdict: {
    recommendation: 'OVERWEIGHT',
    convictionScore: 9,
    investmentThesis: 'Elite Rule-of-40 SaaS economics with 128% net dollar retention and positive GAAP profitability inflecting in FY24.',
    bullCase: 'Expansion of generative AI enterprise contracts accelerates annual recurring revenue (ARR) past $250M with margin expansion.',
    bearCase: 'Hyperscaler GPU quota restrictions or pricing increases compress subscription gross margins below 70%.',
    keyMonitoringMilestones: ['Net dollar retention persistence', 'Gross margin after hyperscaler credit burn', 'Enterprise logo adds >$100k ARR'],
  },
  dividends: {
    history: [],
    dividendPolicy: 'The company intends to retain all available funds and future earnings to support operations and finance growth. No cash dividends are anticipated in the foreseeable future.',
    carveoutsOrRestructuring: 'Reincorporation from Delaware LLC to C-Corporation prior to IPO with conversion of convertible preferred seed notes into common shares.',
    carveoutTitle: 'Preferred Equity Conversion & Reincorporation',
    carveoutAuditAction: 'Verify elimination of liquidation preferences and antidilution ratchets upon automatic conversion of Series A-D Preferred Stock.',
  },
  fundamentalStrengths: [
    'Subscription gross margins of 75.0% with strong operating leverage driving net income margin to 11.1%.',
    'Net Dollar Retention rate of 128% and CAC payback period of 9.2 months reflect top-decile product-market fit.',
    'Net cash position of $142M with zero debt obligations.',
  ],
  keyCaveats: [
    'Founder super-voting stock (20:1) results in 74% voting control, excluding minority shareholders from strategic governance.',
    'Significant reliance on single-source cloud compute (AWS GPU infrastructure) creates vulnerability to capacity rationing.',
    'Intensifying competition from legacy enterprise incumbents embedding native AI workflows.',
  ],
  sections: [
    { id: 'item1', title: 'Item 1. Business & Technology Architecture', pageRange: 'Pages 1-32', riskLevel: 'LOW', summary: 'AI enterprise platform overview, cohort metrics, and enterprise customer expansion.' },
    { id: 'item1a', title: 'Item 1A. Risk Factors & Compute Quotas', pageRange: 'Pages 33-58', riskLevel: 'HIGH', summary: 'AWS infrastructure concentration, AI model accuracy, and regulatory liability.' },
    { id: 'item5', title: 'Item 5. Market for Registrant Common Equity & Voting', pageRange: 'Pages 59-64', riskLevel: 'MEDIUM', summary: 'Dual-class stock structure and founder super-voting shares.' },
    { id: 'item6', title: 'Item 6. Use of Proceeds & Capital Allocation', pageRange: 'Pages 64-65', riskLevel: 'LOW', summary: '$360.0M total proceeds deployed across R&D compute (50%), global sales (30%), working capital (15%), and offering expenses (5%).' },
    { id: 'item7', title: 'Item 7. MD&A and Unit Economics', pageRange: 'Pages 65-98', riskLevel: 'LOW', summary: 'Detailed ARR walk, NRR, churn analysis, and cohort unit economics.' },
    { id: 'item8', title: 'Item 8. Financial Statements & Supplementary Data', pageRange: 'Pages 99-135', riskLevel: 'LOW', summary: '3-year audited GAAP financial statements.' },
  ],
  peerGroups: [
    {
      id: 'highGrowthSaas',
      name: 'B2B Enterprise Cloud & AI Software Peers',
      description: 'US-listed high-growth enterprise software peers (e.g. Snowflake, Datadog, Palantir, CrowdStrike)',
      benchmarks: [
        { metric: 'Revenue YoY Growth', unit: '%', issuerValue: 73.0, peerMedian: 28.5, topQuartile: 38.0, bottomQuartile: 18.0, assessment: 'SUPERIOR', commentary: 'Hypergrowth top quartile trajectory.' },
        { metric: 'Subscription Gross Margin', unit: '%', issuerValue: 75.0, peerMedian: 71.0, topQuartile: 78.0, bottomQuartile: 65.0, assessment: 'SUPERIOR', commentary: 'Strong cloud software margin discipline.' },
        { metric: 'Rule of 40 Score', unit: '%', issuerValue: 84.1, peerMedian: 38.0, topQuartile: 52.0, bottomQuartile: 22.0, assessment: 'SUPERIOR', commentary: 'Elite Rule-of-40 score (73% growth + 11.1% margin).' },
        { metric: 'Net Dollar Retention', unit: '%', issuerValue: 128, peerMedian: 114, topQuartile: 122, bottomQuartile: 104, assessment: 'SUPERIOR', commentary: 'Top-tier land-and-expand execution.' },
      ],
    },
  ],
  rawProspectusText: `UNITED STATES SECURITIES AND EXCHANGE COMMISSION
Washington, D.C. 20549
FORM S-1 REGISTRATION STATEMENT UNDER THE SECURITIES ACT OF 1933
CIK Number: US-SEC-CIK-000192847

CLOUDNEXUS AI ENTERPRISE INC.
(Exact name of registrant as specified in its charter)

PROSPECTUS SUMMARY
This summary highlights selected information contained elsewhere in this prospectus and does not contain all of the information you should consider before investing in our Class A common stock.

ITEM 1. THE OFFERING & SHARE CAPITAL
- Class A Common Stock Offered by Registrant: 25,000,000 shares.
- Class A Common Stock Offered by Selling Stockholders: 5,000,000 shares.
- Total Offering: 30,000,000 shares of Class A common stock.
- Enlarged Common Stock Outstanding After This Offering: 145,000,000 shares (including 40,000,000 shares of Class B common stock).
- Proposed Listing Market: The NASDAQ Global Select Market under the ticker symbol "CNAI".
- Lock-Up Agreements: Our officers, directors, and substantially all existing stockholders have entered into 180-day market standoff lock-up agreements with the underwriters.

ITEM 1A. RISK FACTORS
- Compute Provider Dependency: We rely substantially on Amazon Web Services (AWS) to host our core proprietary generative AI agent models and inference workloads. If AWS compute pricing escalates or specialized GPU allocations are curtailed, our subscription gross margins will be severely compromised.
- Dual-Class Super-Voting Structure: Our Class B common stock carries 20 votes per share, compared to 1 vote per share for Class A common stock. Upon completion of this offering, Elena Rostova, our Founder, CEO, and Chair of the Board, will beneficially hold approximately 74% of the combined voting power of our outstanding capital stock.
- Intense Competitive Dynamics: Legacy hyperscalers and incumbent enterprise software providers may introduce bundled AI copilot solutions that compress our average revenue per customer (ARPU).

ITEM 5. DIRECTORS, EXECUTIVE OFFICERS & PRINCIPAL STOCKHOLDERS
Executive Officers & Directors:
- Elena Rostova — Founder, Chief Executive Officer & Chair of the Board
- Marcus Sterling — Lead Independent Director (Former CFO, Oracle Corporation)
- Dr. Sanjay Patel — Chief Technology Officer
- Rachel Green — Independent Audit Committee Chair
Pre-IPO Equity Ownership:
- Elena Rostova (Founder & CEO): 42,000,000 shares (35.0% beneficial ownership)
- Venture Partners Alpha: 36,000,000 shares (30.0% beneficial ownership)
Post-IPO Equity Ownership (Enlarged Float of 145,000,000 Shares):
- Elena Rostova: 38,000,000 shares (26.2% equity ownership, controlling 74.0% total voting power)
- Venture Partners Alpha: 32,000,000 shares (22.1% equity ownership)

ITEM 6. USE OF PROCEEDS
We estimate net proceeds from the sale of 25,000,000 shares of Class A common stock in this offering to be approximately $360.0 million ($360,000k). We intend to deploy these net proceeds as follows:
1. Research, development, and proprietary AI model training compute infrastructure: $180,000k (50.0%) — Over the next 24 to 36 months.
2. Global enterprise sales and marketing expansion (EMEA & APAC direct sales channels): $108,000k (30.0%) — Over the next 24 months.
3. Working capital, operating expenses, and general corporate purposes: $54,000k (15.0%) — Over the next 36 months.
4. Underwriting discounts, commissions, and estimated offering advisory expenses: $18,000k (5.0%) — Upon closing.
Total Allocated Capital: $360,000k (100.0%).

ITEM 7. MANAGEMENT'S DISCUSSION AND ANALYSIS (MD&A) & UNIT ECONOMICS
Key Business & Cohort Metrics:
- Annual Recurring Revenue (ARR): Reached $154.2 million as of December 31, 2024.
- Net Dollar Retention Rate (NDR): 128% for enterprise clients trailing twelve months.
- Customer Acquisition Cost (CAC) Payback: 9.2 months across enterprise customer tier.
- Rule of 40 Score: 84.1% (73.0% YoY revenue growth rate + 11.1% GAAP net income margin).

ITEM 8. AUDITED CONSOLIDATED GAAP FINANCIAL STATEMENTS
Figures presented in thousands of U.S. Dollars ($'000):
- Fiscal Year 2022 (FY22): Revenue $45,000 | Cost of Revenue ($13,500) | Gross Profit $31,500 (Gross Margin 70.0%) | Operating Loss ($12,500) | Net Loss ($12,500) (Net Margin -27.7%) | Current Ratio 2.10x | Debt-to-Equity / Gearing 0.05x | DSO 62 days | DPO 45 days | DIO 0 days | Cash Conversion Cycle (CCC) 17 days.
- Fiscal Year 2023 (FY23): Revenue $82,000 | Cost of Revenue ($22,960) | Gross Profit $59,040 (Gross Margin 72.0%) | Operating Income $2,460 | Net Income $1,640 (Net Margin 2.0%) | Current Ratio 2.80x | Debt-to-Equity / Gearing 0.02x | DSO 58 days | DPO 48 days | DIO 0 days | Cash Conversion Cycle (CCC) 10 days.
- Fiscal Year 2024 (FY24): Revenue $142,000 | Cost of Revenue ($35,500) | Gross Profit $106,500 (Gross Margin 75.0%) | Operating Income $21,300 | Net Income $15,762 (Net Margin 11.1%) | Current Ratio 3.40x | Debt-to-Equity / Gearing 0.00x (Zero debt) | DSO 52 days | DPO 50 days | DIO 0 days | Cash Conversion Cycle (CCC) 2 days.

DIVIDEND POLICY & CAPITAL RESTRUCTURING
- Dividend Policy: We currently intend to retain all available funds and future earnings to support operations and finance growth. We do not anticipate paying cash dividends in the foreseeable future.
- Corporate Reorganization: Conversion from Delaware LLC into a Delaware C-Corporation with automatic conversion of all Series A, B, C, and D convertible preferred stock into Class A and Class B common stock.`,
};

export const stratusGlobalProspectus: ProspectusDossier = {
  id: 'stratus-global-2026',
  companyName: 'Stratus Global Holdings Berhad',
  registrationNo: '202501019963 (1621376-M)',
  currency: 'MYR',
  currencySymbol: 'RM',
  sector: 'Technology / Semiconductor & Cleanroom Automation',
  subSector: 'Cleanroom Automated Material Handling Systems (AMHS) for Semiconductor Fab & OSAT',
  listingMarket: 'Main Market of Bursa Malaysia Securities Berhad',
  ipoPrice: 0.78,
  listingPerformance: {
    listingDate: '12 June 2026',
    listingStatus: 'LISTED',
    ipoPrice: 0.78,
    openingPrice: 1.12,
    closingPrice: 1.06,
    day1High: 1.18,
    day1Low: 0.99,
    day1Volume: 124300000,
    firstDayGainPct: 35.90,
    firstDayOpeningGainPct: 43.59,
    intradaySpreadPct: 19.19,
    marketCapAtIpoRM: 702000,
    peAtIpo: 16.3,
  },
  publicIssueShares: 356250000,
  offerForSaleShares: 0,
  totalOfferShares: 356250000,
  enlargedIssuedShares: 1250000000,
  moratoriumPeriod: 'Statutory 6-Month 100% Lock-Up on Promoters\' Retained Shares from Listing Date under Bursa Malaysia Main Market Listing Requirements',
  promoters: [
    {
      name: 'Ryo Narisawa',
      designation: 'Founder, Executive Director & Group Chief Executive Officer',
      preShares: 625625000,
      prePct: 70.0,
      postShares: 625625000,
      postPct: 50.05,
    },
    {
      name: 'Tan Chan Chin',
      designation: 'Executive Director & Group Chief Operating Officer',
      preShares: 268125000,
      prePct: 30.0,
      postShares: 268125000,
      postPct: 21.45,
    },
  ],
  directors: [
    { name: "Dato' Dr. Shamsuddin Bin Mohd", designation: 'Independent Non-Executive Chairman' },
    { name: 'Ryo Narisawa', designation: 'Executive Director & Group Chief Executive Officer' },
    { name: 'Tan Chan Chin', designation: 'Executive Director & Group Chief Operating Officer' },
    { name: 'Khoo Lay Tuan', designation: 'Independent Non-Executive Director (Audit Committee Chair)' },
    { name: 'Lee Chin Guan', designation: 'Independent Non-Executive Director' },
    { name: 'Faridah Binti Ahmad', designation: 'Independent Non-Executive Director' },
  ],
  proceeds: [
    {
      purpose: 'Expansion of manufacturing facilities (New Penang AMHS manufacturing plant)',
      amountRM: 122600,
      percentage: 43.02,
      timeframe: 'Within 24 months',
    },
    {
      purpose: 'Working capital & operational scale buffer',
      amountRM: 82400,
      percentage: 28.91,
      timeframe: 'Within 24 months',
    },
    {
      purpose: 'Research & Development (R&D) for next-gen 300mm wafer FOUP & sub-fab overhead transport (OHT)',
      amountRM: 45000,
      percentage: 15.79,
      timeframe: 'Within 36 months',
    },
    {
      purpose: 'Overseas business & regional technical service center expansion (Taiwan, Europe, USA)',
      amountRM: 20000,
      percentage: 7.02,
      timeframe: 'Within 24 months',
    },
    {
      purpose: 'Estimated underwriting, advisory & listing expenses',
      amountRM: 15000,
      percentage: 5.26,
      timeframe: 'Within 1 month',
    },
  ],
  financials: [
    {
      period: 'FYE 2023',
      revenue: 136250,
      costOfSales: -88560,
      gp: 47690,
      pbt: 39510,
      pat: 31180,
      gpMargin: 35.0,
      pbtMargin: 29.0,
      patMargin: 22.88,
      currentRatio: 2.45,
      gearingRatio: 0.08,
      receivablesTurnoverDays: 88,
      payablesTurnoverDays: 52,
      inventoryTurnoverDays: 68,
      cashConversionCycleDays: 104,
      isAudited: true,
      notes: 'Audited income statement and financial indicators',
    },
    {
      period: 'FYE 2024',
      revenue: 184320,
      costOfSales: -116120,
      gp: 68200,
      pbt: 67400,
      pat: 54210,
      gpMargin: 37.0,
      pbtMargin: 36.57,
      patMargin: 29.41,
      currentRatio: 2.82,
      gearingRatio: 0.05,
      receivablesTurnoverDays: 84,
      payablesTurnoverDays: 49,
      inventoryTurnoverDays: 62,
      cashConversionCycleDays: 97,
      isAudited: true,
      notes: 'Strong operating leverage and volume ramp across Malaysian and regional semiconductor fabs',
    },
    {
      period: 'FYE 2025',
      revenue: 220480,
      costOfSales: -136700,
      gp: 83780,
      pbt: 82680,
      pat: 66140,
      gpMargin: 38.0,
      pbtMargin: 37.50,
      patMargin: 29.99,
      currentRatio: 3.15,
      gearingRatio: 0.02,
      receivablesTurnoverDays: 79,
      payablesTurnoverDays: 46,
      inventoryTurnoverDays: 58,
      cashConversionCycleDays: 91,
      isAudited: true,
      notes: 'Peak net profit margin of 30.0% driven by proprietary cleanroom OHT deployments',
    },
    {
      period: 'FYE 2026',
      revenue: 197150,
      costOfSales: -124200,
      gp: 72950,
      pbt: 63880,
      pat: 51260,
      gpMargin: 37.0,
      pbtMargin: 32.40,
      patMargin: 26.00,
      currentRatio: 3.40,
      gearingRatio: 0.01,
      receivablesTurnoverDays: 82,
      payablesTurnoverDays: 48,
      inventoryTurnoverDays: 65,
      cashConversionCycleDays: 99,
      isAudited: true,
      notes: 'Audited full financial year highlights; high net margin maintained at 26.0%',
    },
    {
      period: '1Q FY2027 (Ended 30 June 2026)',
      revenue: 34840,
      costOfSales: -21600,
      gp: 13240,
      pbt: 12460,
      pat: 9550,
      gpMargin: 38.0,
      pbtMargin: 35.76,
      patMargin: 27.41,
      currentRatio: 3.52,
      gearingRatio: 0.01,
      receivablesTurnoverDays: 80,
      payablesTurnoverDays: 45,
      inventoryTurnoverDays: 60,
      cashConversionCycleDays: 95,
      isAudited: true,
      notes: 'Unaudited quarterly results disclosed in prospectus confirming robust run-rate',
    },
  ],
  segmentRevenue: [
    {
      segment: 'Turnkey Cleanroom AMHS Integration & System Installation',
      subSegment: 'End-to-End Fab Material Handling Solutions',
      fy2022: 52000,
      fy2022Pct: 54.7,
      fy2023: 78900,
      fy2023Pct: 57.9,
      fy2024: 112400,
      fy2024Pct: 61.0,
      fpe2025: 122200,
      fpe2025Pct: 62.0,
    },
    {
      segment: 'Proprietary AMHS Hardware & Robotic Subsystems (OHT, Stockers, AGVs)',
      subSegment: 'Cleanroom Overhead Transport & Automated Storage',
      fy2022: 28500,
      fy2022Pct: 30.0,
      fy2023: 38150,
      fy2023Pct: 28.0,
      fy2024: 49760,
      fy2024Pct: 27.0,
      fpe2025: 51260,
      fpe2025Pct: 26.0,
    },
    {
      segment: 'Recurring Maintenance, Calibration & Software Licensing',
      subSegment: 'Post-Commissioning AMC & Fleet Management Software',
      fy2022: 14500,
      fy2022Pct: 15.3,
      fy2023: 19200,
      fy2023Pct: 14.1,
      fy2024: 22160,
      fy2024Pct: 12.0,
      fpe2025: 23690,
      fpe2025Pct: 12.0,
    },
  ],
  benchmarks: [
    {
      metric: 'Revenue 3Y CAGR',
      unit: '%',
      issuerValue: 24.1,
      peerMedian: 12.8,
      topQuartile: 19.5,
      bottomQuartile: 6.2,
      assessment: 'SUPERIOR',
      commentary: 'Stratus Global demonstrates compounding growth outperforming Bursa Technology and ASEAN automation peer universes.',
    },
    {
      metric: 'Gross Profit Margin',
      unit: '%',
      issuerValue: 37.0,
      peerMedian: 22.4,
      topQuartile: 28.5,
      bottomQuartile: 16.0,
      assessment: 'SUPERIOR',
      commentary: 'Proprietary AMHS robotic designs and in-house cleanroom software enable premium gross margin extraction above sector peers.',
    },
    {
      metric: 'Net Margin (PAT)',
      unit: '%',
      issuerValue: 26.0,
      peerMedian: 11.2,
      topQuartile: 15.5,
      bottomQuartile: 7.0,
      assessment: 'SUPERIOR',
      commentary: 'Consistently generates net profit margins between 26% and 30%, more than double typical assembly automation peers (11-15%).',
    },
    {
      metric: 'Cash Conversion Cycle',
      unit: 'Days',
      issuerValue: 99,
      peerMedian: 125,
      topQuartile: 85,
      bottomQuartile: 155,
      assessment: 'SUPERIOR',
      commentary: 'Disciplined progress billing and inventory turnover align working capital tightly with cleanroom installation milestones.',
    },
    {
      metric: 'Current Ratio (Liquidity)',
      unit: 'x',
      issuerValue: 3.40,
      peerMedian: 1.95,
      topQuartile: 2.60,
      bottomQuartile: 1.30,
      assessment: 'SUPERIOR',
      commentary: 'Exceptionally pristine balance sheet with 3.4x liquidity buffer and negligible gearing (0.01x) prior to RM285m IPO proceeds injection.',
    },
  ],
  redFlags: [
    {
      id: 'RF-SG-01',
      severity: 'HIGH',
      category: 'SUPPLIER_CONCENTRATION',
      title: 'Customer Concentration — Top 3 Semiconductor Multinationals Contribute ~58% of Total Revenue',
      description: 'The Group exhibits revenue concentration with three major semiconductor multinational corporations accounting for over half of total revenue.',
      prospectusSection: 'Section 2.1 — Risk Factors Relating to Our Business and Operations',
      evidenceExcerpt: 'For FYE 2026, our top 3 major customers collectively accounted for 57.8% of our total revenue. Any reduction, cancellation, or deferment of orders by these major customers would adversely affect our financial performance.',
      regulatoryRiskImplication: 'High revenue dependency on key global semiconductor tier-1 IDMs and OSAT players exposes revenue to individual client capex pauses.',
      mitigatingFactors: 'Deep 15+ year relationship with key clients, bespoke software integration, and qualification lead times make switching costs extremely high.',
      recommendedAuditQuery: 'Inquire with the board on the current unbilled order book distribution across non-top-3 clients and projected order pipeline for FY2027.',
    },
    {
      id: 'RF-SG-02',
      severity: 'HIGH',
      category: 'CONTRACTUAL_STABILITY',
      title: 'Absence of Long-Term Purchase Contracts — Business Awarded on Milestone PO Basis',
      description: 'Engagements are contracted primarily through project-specific purchase orders rather than long-term recurring master volume commitments.',
      prospectusSection: 'Section 2.2 — Commercial Contractual Terms',
      evidenceExcerpt: 'Our contracts with semiconductor customers are generally secured on a purchase order basis or specific project-by-project contract without long-term volume commitments.',
      regulatoryRiskImplication: 'Revenue visibility depends on recurrent quarterly purchase orders and continuous fab capacity expansion programs.',
      mitigatingFactors: 'Semi fab AMHS systems require continuous spare parts, software maintenance, and line reconfigurations that provide recurring income streams.',
      recommendedAuditQuery: 'Confirm the percentage of annual revenue derived from recurring maintenance and software service agreements versus greenfield fab installations.',
    },
    {
      id: 'RF-SG-03',
      severity: 'MEDIUM',
      category: 'SUPPLIER_CONCENTRATION',
      title: 'Component Procurement Concentration — Precision Servomotors & Cleanroom Sensors Sourced from Japan & Germany',
      description: 'Critical high-precision servomotors and optical sensors are sourced from single-country specialist tier-1 suppliers.',
      prospectusSection: 'Section 2.4 — Supply Chain & Raw Material Sourcing',
      evidenceExcerpt: 'We rely on specialized overseas suppliers for ultra-high-precision optical sensors, brushless servo drives, and robotic controllers utilized in our cleanroom AMHS transport modules.',
      regulatoryRiskImplication: 'Vulnerability to foreign currency fluctuations (JPY, EUR, USD) and potential lead time delays during global supply chain bottlenecks.',
      mitigatingFactors: 'Maintains dual-sourcing framework for critical sub-assemblies and maintains buffer inventory of long-lead robotic controllers.',
      recommendedAuditQuery: 'Examine supplier lead-time covenants and hedging policies in place for JPY and EUR component procurement.',
    },
    {
      id: 'RF-SG-04',
      severity: 'MEDIUM',
      category: 'WORKING_CAPITAL',
      title: 'Working Capital Timing Mismatches Due to Rigorous Cleanroom Site Acceptance Tests (SAT)',
      description: 'Milestone billing retention terms and cleanroom commissioning tests create working capital timing lags between shipment and final payment.',
      prospectusSection: 'Section 6.4 — Liquidity and Capital Resources',
      evidenceExcerpt: 'Final milestone progress billings (typically 10% to 15% retention sum) are only certified upon successful completion of client Site Acceptance Testing within high-grade cleanroom environments.',
      regulatoryRiskImplication: 'Extended commissioning testing schedules can defer revenue recognition and final cash milestone collection.',
      mitigatingFactors: 'Historical collection record indicates zero bad debt write-offs from major semiconductor blue-chip accounts.',
      recommendedAuditQuery: 'Review historical aging of retention sums and verification procedures for milestone certifications.',
    },
  ],
  sentiment: {
    overallScore: 68,
    classification: 'High Conviction Bullish',
    hedgingIndex: 42,
    transparencyScore: 88,
    redFlagCount: {
      critical: 0,
      high: 2,
      medium: 2,
      low: 0,
    },
    executiveSummary: 'Strong fundamental profile backed by industry-leading 26% to 30% net profit margins, zero net debt, and strategic leadership in cleanroom AMHS for global semiconductor fabs.',
    toneAnalysis: 'Institutional and confident disclosure tone. High transparency regarding customer concentration and technical qualification barriers.',
    sections: [
      {
        sectionName: 'Business Model & Market Opportunity',
        prospectusReference: 'Section 4 — Information on Our Group',
        score: 82,
        sentiment: 'Bullish',
        hedgingRatio: 28,
        keyFinding: 'Comprehensive cleanroom automated material handling capabilities spanning hardware, robotics, and proprietary control software.',
      },
      {
        sectionName: 'Financial Performance & Scorecard',
        prospectusReference: 'Section 6 — Financial Information',
        score: 78,
        sentiment: 'Bullish',
        hedgingRatio: 32,
        keyFinding: 'Demonstrated revenue scaling with exceptional net margin (26-30%) and zero bank borrowings prior to IPO.',
      },
      {
        sectionName: 'Risk Factors & Disclosures',
        prospectusReference: 'Section 2 — Risk Factors',
        score: -28,
        sentiment: 'Cautious',
        hedgingRatio: 64,
        keyFinding: 'Standard risk disclosures detailing reliance on top semiconductor multinationals and purchase-order contracting cycles.',
      },
    ],
  },
  fundManagerVerdict: {
    recommendation: 'OVERWEIGHT',
    convictionScore: 9,
    investmentThesis: 'Stratus Global Holdings Berhad represents a high-moat proxy to global semiconductor wafer fab automation capex. Boasting industry-leading 26-30% net profit margins, pristine debt-free balance sheet, and a 71.5% promoter lock-up, the company is prime for long-term compound growth.',
    bullCase: 'Accelerated adoption of 300mm wafer sub-fab OHT automation in Europe and Southeast Asia drives revenue beyond RM280m and expands margins towards 32%.',
    bearCase: 'Extended cyclical downturn in consumer electronics and automotive semiconductor capex delays customer fab buildouts and lengthens site acceptance tests.',
    keyMonitoringMilestones: [
      'Construction progress and commissioning of the new Penang manufacturing plant (RM122.6m allocation)',
      'Replenishment rate of top 3 client purchase orders and quarterly book-to-bill ratio',
      'Commercial milestone trials for next-gen 300mm FOUP overhead transport (OHT) systems',
    ],
  },
  dividends: {
    history: [
      { period: 'FYE 2023', amountRM: 9354, payoutPctPAT: 30.0, type: 'Cash Dividend', description: 'Audited operational cash dividend' },
      { period: 'FYE 2024', amountRM: 16263, payoutPctPAT: 30.0, type: 'Cash Dividend', description: 'Operational cash dividend' },
      { period: 'FYE 2025', amountRM: 23149, payoutPctPAT: 35.0, type: 'Interim Dividend', description: 'Pre-IPO cash distribution' },
      { period: 'FYE 2026', amountRM: 15378, payoutPctPAT: 30.0, type: 'Final Dividend', description: 'Pre-listing final operational dividend' },
    ],
    dividendPolicy: 'The Board intends to adopt a dividend policy to distribute at least 30.0% of annual consolidated Net Profit After Tax attributable to owners of the company.',
    carveoutsOrRestructuring: 'Pre-IPO corporate restructuring completed to consolidate 100% equity of operating subsidiaries (Stratus Automation Sdn Bhd and Stratus Technologies Penang) under the listing holding entity.',
    carveoutTitle: 'Internal Corporate Reorganization & Group Consolidation',
    carveoutAuditAction: 'Audited financial statements confirm complete elimination of inter-company balances and full stamp duty exemption clearances obtained.',
  },
  fundamentalStrengths: [
    'Elite net profit margin profile (26.0% to 30.0%) significantly exceeds industry peer medians (11.2%).',
    'Net cash balance sheet with 3.4x current ratio liquidity buffer and virtually zero interest-bearing debt.',
    'Proven track record in high-barrier cleanroom Class 1/10 semiconductor automated material handling systems.',
    'Strong founder alignment with Ryo Narisawa and Tan Chan Chin retaining 71.50% combined equity post-IPO under strict moratorium.',
  ],
  keyCaveats: [
    'Monitor customer concentration closely: top 3 global semiconductor accounts represent 57.8% of revenue.',
    'Verify procurement lead times for specialized German and Japanese servo drive components.',
    'Track construction milestones for the new Penang manufacturing facility financed with RM122.6m of IPO proceeds.',
  ],
  sections: [
    { id: '1', title: '1. Executive Summary & Details of the IPO', pageRange: 'Pages 1-28', riskLevel: 'LOW', summary: 'IPO structure, issue price of RM0.80, enlarged share capital of 1.25 billion shares, and market capitalization of RM1.0 billion.' },
    { id: '2', title: '2. Risk Factors & Operational Disclosures', pageRange: 'Pages 29-64', riskLevel: 'HIGH', summary: 'Customer concentration, purchase order contracting, supply chain dependencies, and semiconductor capex cyclicality.' },
    { id: '3', title: '3. Promoters, Substantial Shareholders & Key Management', pageRange: 'Pages 65-112', riskLevel: 'LOW', summary: 'Founder Ryo Narisawa (50.05% post-IPO) and COO Tan Chan Chin (21.45% post-IPO) retaining 71.5% under statutory moratorium.' },
    { id: '4', title: '4. Business Model & Core Operations', pageRange: 'Pages 113-188', riskLevel: 'LOW', summary: 'Turnkey cleanroom AMHS integration, proprietary robotic subsystems (OHT, stockers, AGVs), and recurring software licensing.' },
    { id: '5', title: '5. Utilisation of IPO Proceeds', pageRange: 'Pages 189-210', riskLevel: 'LOW', summary: 'RM285.0m raised: RM122.6m new Penang plant, RM82.4m working capital, RM45m R&D, RM20m overseas expansion, RM15m listing fees.' },
    { id: '6', title: '6. Financial Information & MD&A', pageRange: 'Pages 211-310', riskLevel: 'LOW', summary: 'Audited income statements (FY23-FY26), margin expansion, working capital cycle (99 days CCC), and balance sheet liquidity.' },
    { id: '7', title: '7. Accountants\' Report & Historical Statements', pageRange: 'Pages 311-420', riskLevel: 'LOW', summary: 'Reporting accountants unqualified audit opinion and consolidated financial disclosures.' },
    { id: '8', title: '8. Governance, Dividends & Additional Disclosures', pageRange: 'Pages 421-450', riskLevel: 'MEDIUM', summary: '30% dividend payout policy, corporate restructuring, and statutory material litigation clearance.' },
  ],
  peerGroups: [
    {
      id: 'semiEquipmentPeers',
      name: 'Semiconductor Automation & Equipment Listed Peers',
      description: 'Public market comparables in automated material handling, test handlers, and semiconductor cleanroom equipment',
      benchmarks: [
        { metric: 'Revenue 3Y CAGR', unit: '%', issuerValue: 24.1, peerMedian: 12.8, topQuartile: 19.5, bottomQuartile: 6.2, assessment: 'SUPERIOR', commentary: 'High revenue compounding outperforming peer median.' },
        { metric: 'Gross Profit Margin', unit: '%', issuerValue: 37.0, peerMedian: 22.4, topQuartile: 28.5, bottomQuartile: 16.0, assessment: 'SUPERIOR', commentary: 'Proprietary cleanroom automation architecture commands premium margins.' },
        { metric: 'Net Margin (PAT)', unit: '%', issuerValue: 26.0, peerMedian: 11.2, topQuartile: 15.5, bottomQuartile: 7.0, assessment: 'SUPERIOR', commentary: 'Industry-leading net margin profile.' },
        { metric: 'Current Ratio (Liquidity)', unit: 'x', issuerValue: 3.40, peerMedian: 1.95, topQuartile: 2.60, bottomQuartile: 1.30, assessment: 'SUPERIOR', commentary: 'Debt-free balance sheet with robust liquidity buffer.' },
      ],
    },
  ],
  rawProspectusText: `BURSA MALAYSIA SECURITIES BERHAD — INITIAL PUBLIC OFFERING PROSPECTUS (PART 1 & PART 2)
STRATUS GLOBAL HOLDINGS BERHAD (Registration No. 202501019963 / 1621376-M)
(Incorporated in Malaysia under the Companies Act 2016)

INITIAL PUBLIC OFFERING IN CONJUNCTION WITH THE LISTING OF STRATUS GLOBAL HOLDINGS BERHAD ON THE MAIN MARKET OF BURSA MALAYSIA SECURITIES BERHAD COMPRISING:
(I) PUBLIC ISSUE OF 356,250,000 NEW ORDINARY SHARES AT AN ISSUE PRICE OF RM0.80 PER SHARE, PAYABLE IN FULL UPON APPLICATION; AND
(II) ENLARGED ISSUED SHARE CAPITAL OF 1,250,000,000 ORDINARY SHARES UPON LISTING (MARKET CAPITALISATION: RM1,000,000,000 / RM1.0 BILLION).

PRINCIPAL ADVISER, SPONSOR, UNDERWRITER AND PLACEMENT AGENT:
UOB KAY HIAN SECURITIES (M) SDN BHD

PART 1: DETAILS OF THE OFFERING, CAPITAL STRUCTURE, PROMOTERS, USE OF PROCEEDS & RISK DISCLOSURES

SECTION 1: DETAILS OF THE INITIAL PUBLIC OFFERING
1.1 Share Capital & Public Offering Parameters
- Existing Issued Ordinary Shares: 893,750,000 Shares
- Public Issue Shares to be issued: 356,250,000 new Shares (28.50% of enlarged issued share capital)
- Offer for Sale: Nil (0 Shares)
- Enlarged Issued Ordinary Share Capital upon Listing: 1,250,000,000 Shares
- Issue Price: RM0.80 per Issue Share
- Total Gross Proceeds to be raised: RM285,000,000 (RM285.0 Million)
- Implied Market Capitalisation upon Listing: RM1,000,000,000 (RM1.0 Billion)
- Listing Market: Main Market of Bursa Malaysia Securities Berhad

1.2 Allocation of Public Issue Shares:
- 25,000,000 Issue Shares (2.0%) made available for application by the Malaysian Public;
- 30,000,000 Issue Shares (2.4%) reserved for eligible Directors, employees, and persons who have contributed to the success of our Group (Pink Form Allocation);
- 145,000,000 Issue Shares (11.6%) made available by way of private placement to identified institutional and selected investors;
- 156,250,000 Issue Shares (12.5%) made available by way of private placement to identified Bumiputera investors approved by the Ministry of Investment, Trade and Industry (MITI).

SECTION 2: PROMOTERS AND SUBSTANTIAL SHAREHOLDERS
2.1 Shareholdings Before and After the IPO:
- Ryo Narisawa (Founder, Executive Director & Group Chief Executive Officer):
  Pre-IPO Holding: 625,625,000 ordinary shares (70.0% of pre-IPO capital)
  Post-IPO Holding: 625,625,000 ordinary shares (50.05% of enlarged share capital)
- Tan Chan Chin (Executive Director & Group Chief Operating Officer):
  Pre-IPO Holding: 268,125,000 ordinary shares (30.0% of pre-IPO capital)
  Post-IPO Holding: 268,125,000 ordinary shares (21.45% of enlarged share capital)
- Total Promoter Retained Holding: 893,750,000 ordinary shares (71.50% of enlarged share capital).
- Moratorium on Shares: Pursuant to Paragraph 5.29 of the Main Market Listing Requirements, our Promoters (Ryo Narisawa and Tan Chan Chin) have agreed to a statutory moratorium under which they will not sell, transfer, or assign their entire shareholding of 893,750,000 Shares (71.50%) for a period of 6 months from the date of listing, followed by structured progressive moratorium rules.

SECTION 3: UTILISATION OF PROCEEDS (TOTAL: RM285,000,000)
Our Group intends to utilize the gross proceeds of RM285.00 million from the Public Issue in the following manner:
1. Construction and development of a new integrated manufacturing plant and test fab in Penang: RM122,600k (43.02%) — Timeframe: Within 24 months.
2. Working capital requirements to finance raw inventory buffers and automated component assembly: RM82,400k (28.91%) — Timeframe: Within 24 months.
3. Research & Development (R&D) investments into next-generation 300mm FOUP overhead transport (OHT) and cleanroom AGVs: RM45,000k (15.79%) — Timeframe: Within 36 months.
4. Overseas business expansion and establishment of regional service hubs in Taiwan, Europe, and the United States: RM20,000k (7.02%) — Timeframe: Within 24 months.
5. Estimated underwriting, professional advisory, and listing expenses: RM15,000k (5.26%) — Timeframe: Within 1 month.
Total Gross Proceeds: RM285,000k (100.00%).

SECTION 4: KEY RISK FACTORS
- Risk 1: Customer Concentration — For FYE 2026, our top 3 major customers accounted for 57.8% of our total revenue. Termination or material reduction in capital spending by these clients would adversely impact group earnings.
- Risk 2: Project-Based & Purchase Order Contracts — Orders are executed based on periodic purchase orders rather than multi-year take-or-pay commitments.
- Risk 3: Specialized Component Sourcing — Crucial cleanroom optical sensors, precision brushless servomotors, and structural aerospace alloys are sourced from specialized vendors in Japan and Germany.
- Risk 4: Site Acceptance Testing Milestones — Cleanroom site acceptance tests (SAT) by client engineering teams take 30 to 60 days post-delivery, deferring the release of 10-15% project retention payments.

PART 2: FINANCIAL INFORMATION, MULTI-PERIOD AUDITED STATEMENTS & ACCOUNTANTS' REPORT

SECTION 5: AUDITED CONSOLIDATED STATEMENTS OF PROFIT OR LOSS AND OTHER COMPREHENSIVE INCOME
Figures presented in thousands of Ringgit Malaysia (RM'000):
- Financial Year Ended 31 March 2023 (FYE 2023):
  Revenue: RM136,250 | Cost of Sales: (RM88,560) | Gross Profit: RM47,690 (Gross Margin: 35.00%) | Profit Before Tax (PBT): RM39,510 (PBT Margin: 29.00%) | Profit After Tax (PAT): RM31,180 (Net Margin: 22.88%) | Current Ratio: 2.45x | Gearing Ratio: 0.08x | Trade Receivables Turnover: 88 days | Trade Payables Turnover: 52 days | Inventory Turnover: 68 days | Cash Conversion Cycle (CCC): 104 days.
- Financial Year Ended 31 March 2024 (FYE 2024):
  Revenue: RM184,320 | Cost of Sales: (RM116,120) | Gross Profit: RM68,200 (Gross Margin: 37.00%) | Profit Before Tax (PBT): RM67,400 (PBT Margin: 36.57%) | Profit After Tax (PAT): RM54,210 (Net Margin: 29.41%) | Current Ratio: 2.82x | Gearing Ratio: 0.05x | Trade Receivables Turnover: 84 days | Trade Payables Turnover: 49 days | Inventory Turnover: 62 days | Cash Conversion Cycle (CCC): 97 days.
- Financial Year Ended 31 March 2025 (FYE 2025):
  Revenue: RM220,480 | Cost of Sales: (RM136,700) | Gross Profit: RM83,780 (Gross Margin: 38.00%) | Profit Before Tax (PBT): RM82,680 (PBT Margin: 37.50%) | Profit After Tax (PAT): RM66,140 (Net Margin: 29.99%) | Current Ratio: 3.15x | Gearing Ratio: 0.02x | Trade Receivables Turnover: 79 days | Trade Payables Turnover: 46 days | Inventory Turnover: 58 days | Cash Conversion Cycle (CCC): 91 days.
- Financial Year Ended 31 March 2026 (FYE 2026):
  Revenue: RM197,150 | Cost of Sales: (RM124,200) | Gross Profit: RM72,950 (Gross Margin: 37.00%) | Profit Before Tax (PBT): RM63,880 (PBT Margin: 32.40%) | Profit After Tax (PAT): RM51,260 (Net Margin: 26.00%) | Current Ratio: 3.40x | Gearing Ratio: 0.01x | Trade Receivables Turnover: 82 days | Trade Payables Turnover: 48 days | Inventory Turnover: 65 days | Cash Conversion Cycle (CCC): 99 days.
- Unaudited 3-Month Period Ended 30 June 2026 (1Q FY2027):
  Revenue: RM34,840 | Cost of Sales: (RM21,600) | Gross Profit: RM13,240 (Gross Margin: 38.00%) | Profit Before Tax (PBT): RM12,460 (PBT Margin: 35.76%) | Profit After Tax (PAT): RM9,550 (Net Margin: 27.41%) | Current Ratio: 3.52x | Gearing Ratio: 0.01x | Trade Receivables Turnover: 80 days | Trade Payables Turnover: 45 days | Inventory Turnover: 60 days | Cash Conversion Cycle (CCC): 95 days.

SECTION 6: REVENUE BREAKDOWN BY BUSINESS SEGMENTS
- Turnkey Cleanroom AMHS Integration & System Installation:
  FYE 2023: RM78,900k (57.9%) | FYE 2024: RM112,400k (61.0%) | FYE 2025: RM138,900k (63.0%) | FYE 2026: RM122,200k (62.0%)
- Proprietary AMHS Hardware & Robotic Subsystems (OHT, Stockers, AGVs):
  FYE 2023: RM38,150k (28.0%) | FYE 2024: RM49,760k (27.0%) | FYE 2025: RM57,320k (26.0%) | FYE 2026: RM51,260k (26.0%)
- Recurring Maintenance, Calibration & Software Licensing:
  FYE 2023: RM19,200k (14.1%) | FYE 2024: RM22,160k (12.0%) | FYE 2025: RM24,260k (11.0%) | FYE 2026: RM23,690k (12.0%)

SECTION 7: DIVIDEND POLICY & HISTORICAL PAYOUTS
- Dividend Policy: Target dividend payout ratio of at least 30.0% of annual consolidated Net Profit After Tax attributable to owners.
- Historical Dividends Declared and Paid:
  FYE 2023: RM9,354k (30.0% of PAT)
  FYE 2024: RM16,263k (30.0% of PAT)
  FYE 2025: RM23,149k (35.0% of PAT)
  FYE 2026: RM15,378k (30.0% of PAT)
- Corporate Reorganization: Pre-IPO equity consolidation to acquire 100% equity in operating subsidiaries Stratus Automation Sdn Bhd and Stratus Technologies (Penang) Sdn Bhd with all inter-company loans cleared.`,
};

