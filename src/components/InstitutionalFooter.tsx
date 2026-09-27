import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Calculator, 
  FileCheck, 
  ExternalLink, 
  Cpu, 
  Github, 
  Sparkles,
  Info
} from 'lucide-react';
import { AboutPlatformModal } from './AboutPlatformModal';

interface InstitutionalFooterProps {
  onOpenUploadModal?: () => void;
}

export const InstitutionalFooter: React.FC<InstitutionalFooterProps> = ({ onOpenUploadModal }) => {
  const [modalTab, setModalTab] = useState<'about' | 'methodology' | 'compliance' | null>(null);

  return (
    <>
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Main Footer Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Left: Branding & Developer Credit */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1 sm:gap-3">
              <div>
                <span className="font-semibold text-slate-300">VanguardIPO Intelligence</span>
                <span className="hidden sm:inline mx-2 text-slate-700">·</span>
                <span className="text-slate-400">Institutional Fund Manager IPO Analytics</span>
              </div>
              <div className="text-slate-400">
                <span className="hidden sm:inline text-slate-700">·</span>
                <span>Developed by </span>
                <button
                  onClick={() => setModalTab('about')}
                  className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors cursor-pointer"
                  title="View developer profile & system specifications"
                >
                  Ammar Thaqif
                </button>
              </div>
            </div>

            {/* Center / Right: Interactive Institutional Modals */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-400">
              <button
                onClick={() => setModalTab('methodology')}
                className="hover:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5 text-indigo-400" />
                <span>Methodology & Formulae</span>
              </button>

              <span className="text-slate-700" aria-hidden="true">·</span>

              <button
                onClick={() => setModalTab('compliance')}
                className="hover:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Regulatory Disclosures</span>
              </button>

              <span className="text-slate-700" aria-hidden="true">·</span>

              <button
                onClick={() => setModalTab('about')}
                className="hover:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-blue-400" />
                <span>About Platform</span>
              </button>
            </div>

          </div>

          {/* Sub-Footer Row: Compliance & Confidentiality Notice */}
          <div className="pt-3 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span>SEC &amp; Bursa Malaysia Framework Aligned</span>
              <span className="text-slate-700" aria-hidden="true">·</span>
              <span>Publishable to GitHub Actions &amp; Vercel</span>
            </div>

            <div className="flex items-center gap-3">
              <span>Confidential Investment Committee Use</span>
              <span className="text-slate-700" aria-hidden="true">·</span>
              <span>© {new Date().getFullYear()} VanguardIPO Analytics</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Modal instance */}
      <AboutPlatformModal
        isOpen={modalTab !== null}
        onClose={() => setModalTab(null)}
        defaultTab={modalTab || 'about'}
      />
    </>
  );
};
