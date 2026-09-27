import React, { useState } from 'react';
import { 
  X, 
  User, 
  Code2, 
  ShieldCheck, 
  BookOpen, 
  Calculator, 
  ExternalLink, 
  Cpu, 
  CheckCircle2, 
  Mail, 
  Github, 
  FileText,
  Building2,
  Workflow
} from 'lucide-react';

interface AboutPlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'about' | 'methodology' | 'compliance';
}

export const AboutPlatformModal: React.FC<AboutPlatformModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'about',
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'methodology' | 'compliance'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 shrink-0 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                VanguardIPO Intelligence Platform
              </h2>
              <p className="text-xs text-slate-400">
                Institutional Due Diligence & Multimodal Prospectus Analytics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 px-5 pt-2 gap-4 shrink-0 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('about')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'about'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Developer & Platform</span>
          </button>
          <button
            onClick={() => setActiveTab('methodology')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'methodology'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Methodology & Formulae</span>
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'compliance'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Regulatory & Disclosures</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm text-slate-300">
          {activeTab === 'about' && (
            <div className="space-y-5">
              {/* Developer Attribution Card */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-blue-500 to-indigo-400 flex items-center justify-center font-bold text-white text-lg shadow-inner">
                    AT
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white text-base">Ammar Thaqif</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Lead Engineer
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      <span>ammarthaqif.ar@gmail.com</span>
                    </p>
                  </div>
                </div>
                <div className="text-right sm:border-l sm:border-slate-700/80 sm:pl-4">
                  <span className="text-[11px] text-slate-400 block font-mono">Role</span>
                  <span className="text-xs font-medium text-slate-200">Architecture & Institutional OCR</span>
                </div>
              </div>

              {/* Platform Mission */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Platform Purpose & Architecture
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <strong>VanguardIPO</strong> was engineered specifically for institutional fund managers, investment committee members, and private equity equity research teams. It automates the extraction and synthesis of statutory Initial Public Offering (IPO) prospectuses across Bursa Malaysia, SEC Form S-1, and international exchanges.
                </p>
              </div>

              {/* Technical Stack & Deployment Readiness */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                    <Workflow className="w-4 h-4" />
                    <span>Publishing & Deployment</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    Pre-configured with <strong className="text-slate-300">GitHub Actions CI</strong> (<code className="text-[11px] text-indigo-300 font-mono">.github/workflows/ci.yml</code>) and native <strong className="text-slate-300">Vercel Serverless</strong> (<code className="text-[11px] text-indigo-300 font-mono">vercel.json</code>).
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
                    <Cpu className="w-4 h-4" />
                    <span>Multimodal OCR Engine</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    Combines high-res PDF image parsing via <strong className="text-slate-300">Gemini 3.8 Flash</strong> with resilient heuristic financial data extraction.
                  </p>
                </div>
              </div>

              {/* Key Features List */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Capabilities Overview
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Multi-part prospectus PDF parsing</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Peer quartile benchmark calculations</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Automated regulatory red flag detection</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Audit-ready PDF memorandum export</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'methodology' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-white text-sm">Institutional Financial Metrics & Calculation Methods</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mathematical standards applied across all evaluated prospectus dossiers:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Cash Conversion Cycle (CCC)</span>
                    <span className="font-mono text-indigo-400 text-[11px]">Days Sales + Days Inv - Days Pay</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Calculated as <code className="text-slate-300 font-mono">DSO + DIO - DPO</code>. Reflects working capital velocity and operational efficiency from raw procurement to client cash collection.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Compound Annual Growth Rate (CAGR)</span>
                    <span className="font-mono text-indigo-400 text-[11px]">((V_end / V_start)^(1 / n) - 1) * 100</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Computed across multi-year audited historical periods (typically FYE 2021 to FYE 2024) to isolate true secular growth from single-period lumpiness.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Linguistic Hedging Ratio & Transparency Score</span>
                    <span className="font-mono text-indigo-400 text-[11px]">Hedging Tokens / Disclosure Tokens</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Quantifies cautionary linguistic hedging markers (e.g., <em>subject to, conditional upon, unpredictable fluctuation, cannot assure</em>) within statutory Section 3 Risk Factors. Lower hedging reflects higher transparency.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Peer Group Quartile Benchmarking</span>
                    <span className="font-mono text-indigo-400 text-[11px]">Q1 (25th) · Q2 Median · Q3 (75th)</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Compares candidate metrics against direct Bursa / SEC industry listed peer cohorts. Highlights outperformers in Gross Margin, Net Margin, and Current Ratio.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-white text-sm">Regulatory Disclosure & Compliance Framework</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Alignment with Securities Commission (SC) Malaysia and US SEC statutory disclosure guidelines.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Statutory Prospectus Coverage</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Evaluated prospectuses are analyzed against key listing mandates including <strong>Section 6 Moratorium Covenants</strong> (promoter lock-in periods), <strong>Utilisation of Proceeds</strong> milestones, <strong>Audited Historical Track Record</strong>, and <strong>Substantial Shareholder Dilution</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1.5 leading-relaxed">
                <span className="font-semibold block text-amber-200">Institutional Use Disclaimer</span>
                <p>
                  This system is intended exclusively for accredited institutional fund managers, investment committee members, and qualified financial analysts. All generated ratings, red flag summaries, and valuation quartiles are analytical assessments synthesized from document disclosures and do not constitute an offer, solicitation, or personal investment advice.
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-slate-800 pt-3">
                <span>Compliance Version: 2026.1-INST</span>
                <span>Audit Trail: Enforced</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 px-5 py-3.5 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Developed by <strong className="text-slate-200">Ammar Thaqif</strong></span>
            <span>·</span>
            <span className="font-mono text-[11px]">ammarthaqif.ar@gmail.com</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
