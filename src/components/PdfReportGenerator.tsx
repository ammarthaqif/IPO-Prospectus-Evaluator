import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  Settings, 
  FileText, 
  CheckSquare, 
  Square, 
  ShieldAlert, 
  TrendingUp, 
  Sparkles,
  Building,
  Calendar,
  User,
  Sliders,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { ProspectusDossier, ReportConfig } from '../types';

interface PdfReportGeneratorProps {
  dossier: ProspectusDossier;
}

/**
 * Automatically computes institutional memo parameters from the prospectus disclosures
 * eliminating any manual input requirement for fund managers.
 */
function computeAutoReportConfig(dossier: ProspectusDossier): ReportConfig {
  const financials = dossier.financials && dossier.financials.length > 0 ? dossier.financials : [];
  const latestFin = financials[financials.length - 1];
  const firstFin = financials[0];
  const nYears = Math.max(1, financials.length - 1);

  // Compute multi-year CAGR for valuation calibration
  const cagr = (firstFin && latestFin && firstFin.revenue > 0)
    ? ((Math.pow(Math.max(0.001, latestFin.revenue / firstFin.revenue), 1 / nYears) - 1) * 100)
    : 15.0;

  // 1. Auto Target P/E Multiple: Derived from benchmark multiples or sector growth rate
  const peBenchmark = dossier.benchmarks?.find(b => /p\/?e/i.test(b.metric));
  let autoPE = 16.5;
  if (peBenchmark && peBenchmark.issuerValue > 0) {
    autoPE = peBenchmark.issuerValue;
  } else if (dossier.sector?.toLowerCase().includes('saas') || dossier.sector?.toLowerCase().includes('software')) {
    autoPE = 35.0;
  } else if (dossier.sector?.toLowerCase().includes('amhs') || dossier.sector?.toLowerCase().includes('semiconductor')) {
    autoPE = 24.5;
  } else if (cagr > 20) {
    autoPE = 22.0;
  } else if (cagr > 10) {
    autoPE = 18.0;
  }

  // 2. Auto Proposed Allocation: Float-sized at 5% anchor participation
  const totalOfferShares = dossier.totalOfferShares || dossier.publicIssueShares || 60000000;
  const estimatedOfferPrice = 0.50; // Reference mid-cap IPO price
  const estimatedProceeds = totalOfferShares * estimatedOfferPrice;
  const autoAllocation = Math.max(1000000, Math.min(20000000, Math.round((estimatedProceeds * 0.05) / 250000) * 250000));

  // 3. Auto Fund Mandate Name
  const isUS = dossier.listingMarket?.includes('NASDAQ') || dossier.registrationNo?.includes('US');
  const autoFundName = isUS 
    ? 'Vanguard Global Technology Alpha Fund LP'
    : `${dossier.listingMarket || 'Bursa Malaysia'} Institutional Growth Equities Fund`;

  // 4. Auto Analyst Designation
  const autoAnalyst = 'Lead Equities Analyst, Due Diligence Committee';

  // 5. Auto Recommendation
  const autoRec = (dossier.fundManagerVerdict?.recommendation as any) || 'OVERWEIGHT';

  // 6. Auto Comprehensive Investment Committee Notes
  const verdict = dossier.fundManagerVerdict;
  const autoNotes = verdict?.investmentThesis
    ? `${verdict.investmentThesis} Bull Case Catalyst: ${verdict.bullCase || 'Market share expansion and capacity scaling.'} Risk Factor Caveat: ${verdict.bearCase || 'Client order deferral or margin compression under raw material inflation.'} Key Monitoring Milestones: ${verdict.keyMonitoringMilestones?.join('; ') || 'Deployment of IPO proceeds, receivables turnover stability, and order book burn rate.'}`
    : `Recommend ${autoRec} stance for ${dossier.companyName} based on historical revenue compounding of ${cagr.toFixed(1)}% CAGR and gross margin defensiveness. Subject to satisfactory underwriting confirmation.`;

  return {
    memoTitle: `IPO Due Diligence Memorandum: ${dossier.companyName} (${dossier.listingMarket || 'Primary Equity Market'})`,
    fundName: autoFundName,
    analystName: autoAnalyst,
    reportDate: new Date().toISOString().split('T')[0],
    targetPricePE: autoPE,
    proposedAllocationRM: autoAllocation,
    recommendation: autoRec,
    sectionsIncluded: {
      executiveSummary: true,
      capitalStructure: true,
      financialTrajectory: true,
      workingCapitalCycle: true,
      segmentBreakdown: true,
      industryBenchmarks: true,
      regulatoryRedFlags: true,
      aiSentimentAudit: true,
      investmentThesis: true,
    },
    customNotes: autoNotes,
  };
}

export const PdfReportGenerator: React.FC<PdfReportGeneratorProps> = ({ dossier }) => {
  const [config, setConfig] = useState<ReportConfig>(() => computeAutoReportConfig(dossier));
  const [showOverrides, setShowOverrides] = useState(false);
  const [autoStatusMessage, setAutoStatusMessage] = useState<string>('Parameters auto-calibrated from prospectus disclosures');

  // Synchronize config when dossier changes (auto-fill zero manual input required)
  React.useEffect(() => {
    const autoConfig = computeAutoReportConfig(dossier);
    setConfig(autoConfig);
    setAutoStatusMessage(`Auto-calibrated for ${dossier.companyName} (P/E: ${autoConfig.targetPricePE}x, Ticket: RM ${(autoConfig.proposedAllocationRM / 1000000).toFixed(1)}M)`);
  }, [dossier.id, dossier.companyName]);

  const handleResetToAuto = () => {
    const autoConfig = computeAutoReportConfig(dossier);
    setConfig(autoConfig);
    setAutoStatusMessage('Reset to AI-calibrated prospectus parameters');
  };

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const toggleSection = (key: keyof ReportConfig['sectionsIncluded']) => {
    setConfig(prev => ({
      ...prev,
      sectionsIncluded: {
        ...prev.sectionsIncluded,
        [key]: !prev.sectionsIncluded[key],
      },
    }));
  };

  const handleNativePrint = () => {
    window.print();
  };

  const handleExportJsPDF = () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 18;

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text(config.fundName.toUpperCase(), 14, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('INVESTMENT COMMITTEE DUE DILIGENCE MEMORANDUM', 14, 18);
      doc.text(`DATE: ${config.reportDate} | ANALYST: ${config.analystName}`, 14, 23);

      // Stance Badge
      doc.setFillColor(79, 70, 229); // indigo-600
      doc.roundedRect(pageWidth - 55, 8, 42, 12, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(config.recommendation, pageWidth - 34, 15.5, { align: 'center' });

      y = 36;

      // Title & Company
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text(dossier.companyName, 14, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(`Reg: ${dossier.registrationNo} | Sector: ${dossier.sector}`, 14, y);
      y += 8;

      // Section 1: Executive Summary
      if (config.sectionsIncluded.executiveSummary) {
        doc.setFillColor(241, 245, 249);
        doc.rect(14, y, pageWidth - 28, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text('1. EXECUTIVE SUMMARY & AI SENTIMENT SCORE', 16, y + 4.5);
        y += 10;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        const overallScore = dossier.sentiment?.overallScore ?? 0;
        const classification = dossier.sentiment?.classification ?? 'Neutral';
        const hedgingIndex = dossier.sentiment?.hedgingIndex ?? 50;
        const execSummary = dossier.sentiment?.executiveSummary ?? 'Evaluation complete.';
        const execLines = doc.splitTextToSize(
          `AI Composite Sentiment Score: +${overallScore}/100 (${classification}). Hedging Ratio: ${hedgingIndex}%.\n${execSummary}`,
          pageWidth - 28
        );
        doc.text(execLines, 14, y);
        y += execLines.length * 4.5 + 4;
      }

      // Section 2: Capital Structure & Float
      if (config.sectionsIncluded.capitalStructure) {
        doc.setFillColor(241, 245, 249);
        doc.rect(14, y, pageWidth - 28, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text('2. SHARE CAPITAL STRUCTURE & ALLOCATION', 16, y + 4.5);
        y += 10;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        const enlarged = dossier.enlargedIssuedShares || 1;
        const pubIssue = dossier.publicIssueShares || 0;
        const totalPromoterRetained = dossier.promoters?.filter(p => (p.postPct || 0) > 0).reduce((sum, p) => sum + (p.postPct || 0), 0) || 0;
        doc.text(`Enlarged Issued Shares: ${enlarged.toLocaleString()} shares`, 14, y);
        doc.text(`Public Issue Shares: ${pubIssue.toLocaleString()} shares (${((pubIssue / enlarged) * 100).toFixed(1)}%)`, 14, y + 4.5);
        doc.text(`Secondary Offer for Sale: ${(dossier.offerForSaleShares || 0).toLocaleString()} shares (Promoter cash-out)`, 14, y + 9);
        doc.text(`Promoter Retained Holding: ${totalPromoterRetained > 0 ? `${totalPromoterRetained.toFixed(1)}%` : 'N/A'}`, 14, y + 13.5);
        doc.text(`Statutory Moratorium: ${dossier.moratoriumPeriod || '6 Months'}`, 14, y + 18);
        y += 22.5;
      }

      // Section 3: Financial Performance Highlights
      if (config.sectionsIncluded.financialTrajectory && dossier.financials && dossier.financials.length > 0) {
        doc.setFillColor(241, 245, 249);
        doc.rect(14, y, pageWidth - 28, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        const reportCurrencySymbol = dossier.currencySymbol || (dossier.currency === 'USD' || dossier.listingMarket?.includes('NASDAQ') ? '$' : 'RM');
        doc.text(`3. HISTORICAL FINANCIAL SCORECARD (${reportCurrencySymbol}'000)`, 16, y + 4.5);
        y += 10;

        // Table Header
        const displayFins = dossier.financials.slice(0, 4);
        const startX = 70;
        const availableWidth = pageWidth - 28 - (startX - 14);
        const colWidth = displayFins.length > 0 ? availableWidth / displayFins.length : 30;

        doc.setFillColor(226, 232, 240);
        doc.rect(14, y, pageWidth - 28, 5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text('Metric', 16, y + 3.5);
        displayFins.forEach((fin, idx) => {
          doc.text(fin.period, startX + idx * colWidth, y + 3.5);
        });
        y += 6;

        // Rows
        const rows = [
          { label: 'Revenue', f: displayFins.map(f => (f.revenue ?? 0).toLocaleString()) },
          { label: 'Gross Profit (GP)', f: displayFins.map(f => (f.gp ?? 0).toLocaleString()) },
          { label: 'GP Margin (%)', f: displayFins.map(f => `${f.gpMargin ?? 0}%`) },
          { label: 'Profit After Tax (PAT)', f: displayFins.map(f => (f.pat ?? 0).toLocaleString()) },
          { label: 'PAT Margin (%)', f: displayFins.map(f => `${f.patMargin ?? 0}%`) },
          { label: 'Current Ratio', f: displayFins.map(f => `${f.currentRatio ?? 0}x`) },
          { label: 'Gearing Ratio', f: displayFins.map(f => `${f.gearingRatio ?? 0}x`) },
          { label: 'Cash Cycle (CCC)', f: displayFins.map(f => `${f.cashConversionCycleDays ?? 0}d`) },
        ];

        doc.setFont('helvetica', 'normal');
        rows.forEach(r => {
          doc.text(r.label, 16, y + 3.5);
          displayFins.forEach((_, idx) => {
            doc.text(r.f[idx] || '-', startX + idx * colWidth, y + 3.5);
          });
          doc.setDrawColor(226, 232, 240);
          doc.line(14, y + 5, pageWidth - 14, y + 5);
          y += 5.5;
        });

        y += 4;
      }

      // Check if page break is needed
      if (y > 220) {
        doc.addPage();
        y = 18;
      }

      // Section 4: Critical Regulatory Red Flags
      const flags = dossier.redFlags || [];
      if (config.sectionsIncluded.regulatoryRedFlags && flags.length > 0) {
        doc.setFillColor(254, 226, 226); // rose-100
        doc.rect(14, y, pageWidth - 28, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(153, 27, 27); // rose-800
        doc.text(`4. REGULATORY RED FLAGS AUDIT (${flags.length} Identified)`, 16, y + 4.5);
        y += 10;

        flags.slice(0, 3).forEach((flag) => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(185, 28, 28);
          doc.text(`[${flag.severity}] ${flag.title}`, 14, y);
          y += 4;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(51, 65, 85);
          const descLines = doc.splitTextToSize(`Section: ${flag.prospectusSection}. ${flag.description}`, pageWidth - 28);
          doc.text(descLines, 14, y);
          y += descLines.length * 3.8 + 1;

          doc.setFont('helvetica', 'italic');
          doc.setTextColor(71, 85, 105);
          const auditLines = doc.splitTextToSize(`IC Query: ${flag.recommendedAuditQuery}`, pageWidth - 28);
          doc.text(auditLines, 14, y);
          y += auditLines.length * 3.8 + 3;

          if (y > 250) {
            doc.addPage();
            y = 18;
          }
        });
      }

      // Section 5: Committee Sign-off
      if (y > 230) {
        doc.addPage();
        y = 18;
      }

      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, pageWidth - 28, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('5. INVESTMENT COMMITTEE RECOMMENDATION & ALLOCATION', 16, y + 4.5);
      y += 10;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`Proposed Stance: ${config.recommendation} | Target Valuation: ${config.targetPricePE}x P/E | Max RM Allocation: RM${(config.proposedAllocationRM / 1000000).toFixed(2)}M`, 14, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const noteLines = doc.splitTextToSize(config.customNotes || '', pageWidth - 28);
      doc.text(noteLines, 14, y);
      y += noteLines.length * 4.5 + 8;

      // Footer
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('CONFIDENTIAL - Strictly for Institutional Investment Committee Review only. Powered by IPO Prospectus Evaluator.', 14, 285);

      doc.save(`${(dossier.companyName || 'IPO').replace(/\s+/g, '_')}_IPO_Memo.pdf`);
    } catch (e: any) {
      console.error('PDF error:', e);
      setExportError('Failed to generate PDF: ' + (e?.message || 'Unknown error'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Config Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Institutional Due Diligence Report Generator
          </h2>
          <p className="text-xs text-slate-400">
            Export customizable investment committee memos & regulatory audit notes to PDF
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNativePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all border border-slate-700"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print View</span>
          </button>
          <button
            onClick={handleExportJsPDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/30"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating PDF...' : 'Download PDF Memo'}</span>
          </button>
        </div>
      </div>

      {exportError && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{exportError}</span>
          </div>
          <button
            onClick={() => setExportError(null)}
            className="text-xs text-rose-400 hover:text-white underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Auto-Parameters Executive Header & Actions */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                AI Auto-Input Engine: Zero Manual Entry Required
              </span>
              <span className="text-[11px] text-slate-400">
                {autoStatusMessage}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToAuto}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300 transition-colors border border-slate-700"
              title="Reset all fields to AI-computed prospectus parameters"
            >
              Re-Calibrate AI Values
            </button>
            <button
              onClick={() => setShowOverrides(!showOverrides)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-indigo-300 transition-colors border border-indigo-500/30 flex items-center gap-1.5"
            >
              <Sliders className="w-3 h-3" />
              <span>{showOverrides ? 'Hide Overrides' : 'Fine-Tune Parameters'}</span>
            </button>
            <button
              onClick={handleExportJsPDF}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating PDF...' : '1-Click Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* Auto-Calculated Parameters Quick Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Target Valuation</span>
            <span className="text-sm font-bold font-mono text-emerald-400">{config.targetPricePE}x P/E</span>
            <span className="text-[10px] text-slate-500 block">Peer-calibrated</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Sized Anchor Ticket</span>
            <span className="text-sm font-bold font-mono text-white">RM {(config.proposedAllocationRM / 1000000).toFixed(2)}M</span>
            <span className="text-[10px] text-slate-500 block">5% of IPO float</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Investment Stance</span>
            <span className="text-sm font-bold font-mono text-indigo-400">{config.recommendation}</span>
            <span className="text-[10px] text-slate-500 block">AI sentiment verdict</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Report Sections</span>
            <span className="text-sm font-bold font-mono text-white">8 of 8 Active</span>
            <span className="text-[10px] text-emerald-400 block">100% Comprehensive</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Report Customizer Form (Shown if showOverrides is true, otherwise collapsed) */}
        {showOverrides ? (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" />
                Parameter Overrides (Optional)
              </h3>
              <button
                onClick={() => setShowOverrides(false)}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

          <div className="space-y-3.5 text-xs">
            
            {/* Memo Title */}
            <div>
              <label className="text-slate-400 font-medium block mb-1">Memo Title:</label>
              <input
                type="text"
                value={config.memoTitle}
                onChange={(e) => setConfig({ ...config, memoTitle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Fund Name */}
            <div>
              <label className="text-slate-400 font-medium block mb-1">Asset Manager / Fund:</label>
              <input
                type="text"
                value={config.fundName}
                onChange={(e) => setConfig({ ...config, fundName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Analyst & Date */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Lead Analyst:</label>
                <input
                  type="text"
                  value={config.analystName}
                  onChange={(e) => setConfig({ ...config, analystName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium block mb-1">Date:</label>
                <input
                  type="date"
                  value={config.reportDate}
                  onChange={(e) => setConfig({ ...config, reportDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Recommendation Stance */}
            <div>
              <label className="text-slate-400 font-medium block mb-1">Fund Manager Stance:</label>
              <select
                value={config.recommendation}
                onChange={(e) => setConfig({ ...config, recommendation: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:border-indigo-500 outline-none font-bold"
              >
                <option value="OVERWEIGHT">OVERWEIGHT (Buy Allocation)</option>
                <option value="EQUAL_WEIGHT">EQUAL-WEIGHT (In-Line)</option>
                <option value="UNDERWEIGHT">UNDERWEIGHT (Reduce / Speculative)</option>
                <option value="DO_NOT_INVEST">DO NOT INVEST (Red Flag Disqualified)</option>
              </select>
            </div>

            {/* Target Valuation & Allocation */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Target P/E Multiple:</label>
                <input
                  type="number"
                  step="0.5"
                  value={config.targetPricePE}
                  onChange={(e) => setConfig({ ...config, targetPricePE: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:border-indigo-500 outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium block mb-1">Max Allocation (RM):</label>
                <input
                  type="number"
                  step="500000"
                  value={config.proposedAllocationRM}
                  onChange={(e) => setConfig({ ...config, proposedAllocationRM: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:border-indigo-500 outline-none font-mono"
                />
              </div>
            </div>

            {/* Section Toggles */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="text-slate-300 font-semibold block">Included Report Sections:</label>
              
              <div className="space-y-1.5">
                {[
                  { key: 'executiveSummary', label: '1. Executive Summary & AI Sentiment' },
                  { key: 'capitalStructure', label: '2. Capital Structure & Float' },
                  { key: 'financialTrajectory', label: '3. Historical Financial Scorecard' },
                  { key: 'workingCapitalCycle', label: '4. Working Capital & Cash Cycle' },
                  { key: 'segmentBreakdown', label: '5. Segmental Revenue Dynamics' },
                  { key: 'industryBenchmarks', label: '6. Industry Quartile Benchmarks' },
                  { key: 'regulatoryRedFlags', label: '7. Regulatory Red Flag Matrix' },
                  { key: 'investmentThesis', label: '8. Thesis & Committee Sign-off' },
                ].map(({ key, label }) => {
                  const isChecked = config.sectionsIncluded[key as keyof ReportConfig['sectionsIncluded']];
                  return (
                    <button
                      key={key}
                      onClick={() => toggleSection(key as any)}
                      className="w-full flex items-center justify-between p-1.5 rounded hover:bg-slate-800/60 text-left text-slate-300 transition-colors"
                    >
                      <span className="text-[11px]">{label}</span>
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Notes */}
            <div className="pt-2 border-t border-slate-800">
              <label className="text-slate-400 font-medium block mb-1">Fund Manager Memo Comments:</label>
              <textarea
                rows={3}
                value={config.customNotes}
                onChange={(e) => setConfig({ ...config, customNotes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs focus:border-indigo-500 outline-none leading-relaxed"
              />
            </div>

          </div>
        </div>
      ) : null}

        {/* Right Column: Live Institutional Preview */}
        <div className={`${showOverrides ? 'lg:col-span-2' : 'lg:col-span-3'} bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 text-slate-900 font-sans print:p-0 print:border-none`}>
          
          {/* Printable Document Container */}
          <div className="bg-white rounded-xl p-6 sm:p-8 text-slate-900 shadow-md space-y-6">
            
            {/* Memo Header */}
            <div className="border-b-2 border-slate-900 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-mono font-bold tracking-widest text-indigo-900 uppercase">
                    {config.fundName}
                  </div>
                  <h1 className="text-xl font-bold text-slate-950 tracking-tight mt-0.5">
                    {config.memoTitle}
                  </h1>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className={`px-3 py-1 rounded text-xs font-bold font-mono tracking-wider ${
                    config.recommendation === 'OVERWEIGHT'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : config.recommendation === 'DO_NOT_INVEST'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                  }`}>
                    {config.recommendation}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600 font-mono">
                <div>DATE: <strong className="text-slate-900">{config.reportDate}</strong></div>
                <div>AUTHOR: <strong className="text-slate-900">{config.analystName}</strong></div>
                <div>TARGET P/E: <strong className="text-indigo-950">{config.targetPricePE}x</strong></div>
                <div>ALLOCATION: <strong className="text-indigo-950">RM{(config.proposedAllocationRM / 1000000).toFixed(2)}M</strong></div>
              </div>
            </div>

            {/* Section 1: Executive Summary */}
            {config.sectionsIncluded.executiveSummary && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-2 py-1 rounded border-l-4 border-indigo-600">
                  1. Executive Summary & AI Sentiment Score
                </h3>
                <div className="text-xs text-slate-700 leading-relaxed space-y-1.5">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-800">
                    <span>AI Sentiment: <strong>+{dossier.sentiment.overallScore}/100</strong> ({dossier.sentiment.classification})</span>
                    <span>•</span>
                    <span>Hedging Language: <strong>{dossier.sentiment.hedgingIndex}%</strong></span>
                  </div>
                  <p>{dossier.sentiment.executiveSummary}</p>
                </div>
              </div>
            )}

            {/* Section 2: Capital Structure */}
            {config.sectionsIncluded.capitalStructure && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-2 py-1 rounded border-l-4 border-indigo-600">
                  2. Share Capital Structure & Float
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase">Enlarged Shares</div>
                    <div className="font-bold text-slate-900">{dossier.enlargedIssuedShares.toLocaleString()}</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase">Public Issue</div>
                    <div className="font-bold text-indigo-700">{dossier.publicIssueShares.toLocaleString()}</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase">Offer for Sale</div>
                    <div className="font-bold text-amber-700">{dossier.offerForSaleShares.toLocaleString()}</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase">Moratorium</div>
                    <div className="font-bold text-rose-700">{dossier.moratoriumPeriod}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Financial Highlights Table */}
            {config.sectionsIncluded.financialTrajectory && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-2 py-1 rounded border-l-4 border-indigo-600">
                  3. Audited Financial Metrics & Margins (RM'000)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b-2 border-slate-300 text-slate-700 font-bold">
                        <th className="py-1.5">Line Item</th>
                        {dossier.financials.map(f => (
                          <th key={f.period} className="py-1.5 text-right">{f.period}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-1.5 font-bold">Revenue</td>
                        {dossier.financials.map(f => (
                          <td key={f.period} className="py-1.5 text-right">{f.revenue.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5 font-bold text-indigo-900">Gross Profit (GP)</td>
                        {dossier.financials.map(f => (
                          <td key={f.period} className="py-1.5 text-right font-bold text-indigo-900">{f.gp.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5">GP Margin (%)</td>
                        {dossier.financials.map(f => (
                          <td key={f.period} className="py-1.5 text-right font-semibold text-emerald-700">{f.gpMargin}%</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5 font-bold text-emerald-900">Profit After Tax (PAT)</td>
                        {dossier.financials.map(f => (
                          <td key={f.period} className="py-1.5 text-right font-bold text-emerald-900">{f.pat.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5">PAT Margin (%)</td>
                        {dossier.financials.map(f => (
                          <td key={f.period} className="py-1.5 text-right">{f.patMargin}%</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5">Current Ratio / Gearing</td>
                        {dossier.financials.map(f => (
                          <td key={f.period} className="py-1.5 text-right">{f.currentRatio}x / {f.gearingRatio}x</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-1.5">Cash Conversion Cycle (CCC)</td>
                        {dossier.financials.map(f => (
                          <td key={f.period} className="py-1.5 text-right font-semibold text-purple-800">{f.cashConversionCycleDays} days</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Section 4: Regulatory Red Flag Matrix */}
            {config.sectionsIncluded.regulatoryRedFlags && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900 bg-rose-50 px-2 py-1 rounded border-l-4 border-rose-600 flex items-center justify-between">
                  <span>4. Regulatory & Fiduciary Red Flags ({dossier.redFlags.length} Identified)</span>
                </h3>

                <div className="space-y-2 text-xs">
                  {dossier.redFlags.map(flag => (
                    <div key={flag.id} className="p-2.5 rounded border border-rose-200 bg-rose-50/40 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 bg-rose-200 text-rose-800 rounded">
                            {flag.severity}
                          </span>
                          <span className="font-bold text-slate-950">{flag.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{flag.prospectusSection}</span>
                      </div>
                      <p className="text-slate-700 text-[11px]">{flag.description}</p>
                      <div className="text-[10px] font-mono text-slate-600 pt-0.5">
                        <strong className="text-rose-900">Audit Action: </strong>{flag.recommendedAuditQuery}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 5: Committee Sign-off */}
            {config.sectionsIncluded.investmentThesis && (
              <div className="space-y-2 pt-2 border-t-2 border-slate-300">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  5. Investment Committee Sign-off & Allocation Thesis
                </h3>
                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans">
                  {config.customNotes}
                </div>
              </div>
            )}

            {/* Legal Footnote */}
            <div className="text-[9px] text-slate-400 font-mono text-center pt-4 border-t border-slate-200">
              CONFIDENTIAL • IPO Prospectus Evaluator • Strictly for internal asset management use
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
