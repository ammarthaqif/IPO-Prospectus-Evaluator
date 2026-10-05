import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  Send, 
  Bot, 
  User, 
  HelpCircle, 
  FileText, 
  Search, 
  Filter, 
  Sliders, 
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { ProspectusDossier, RegulatoryRedFlag, RedFlagSeverity, RedFlagCategory } from '../types';
import { MarketSentimentTimelineChart } from './MarketSentimentTimelineChart';

interface AiSentimentRedFlagsViewProps {
  dossier: ProspectusDossier;
  onUpdateDossier?: (updated: ProspectusDossier) => void;
}

export const AiSentimentRedFlagsView: React.FC<AiSentimentRedFlagsViewProps> = ({
  dossier,
  onUpdateDossier,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const redFlags = Array.isArray(dossier.redFlags) ? dossier.redFlags : [];
  const sentiment = dossier.sentiment || {
    overallScore: 25,
    classification: 'Cautiously Optimistic',
    hedgingIndex: 50,
    transparencyScore: 80,
    redFlagCount: { critical: 0, high: 0, medium: 0, low: 0 },
    executiveSummary: 'Automated regulatory audit complete.',
    toneAnalysis: '',
    sections: [],
  };
  const sentimentSections = Array.isArray(sentiment.sections) ? sentiment.sections : [];

  const [expandedFlagId, setExpandedFlagId] = useState<string | null>(redFlags[0]?.id || null);

  // AI Chat States
  const [chatQuestion, setChatQuestion] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `Hello. I have completed the automated regulatory and sentiment audit of the prospectus summary for ${dossier.companyName}. I have identified ${redFlags.length} key structural and governance issues${redFlags[0] ? ` including: ${redFlags[0].title}` : ''}. How would you like to interrogate the disclosures?`,
      time: 'Just now',
    },
  ]);

  // Synchronize state when dossier changes
  React.useEffect(() => {
    setExpandedFlagId(redFlags[0]?.id || null);
    setChatHistory([
      {
        sender: 'ai',
        text: `Hello. I have completed the automated regulatory and sentiment audit of the prospectus summary for ${dossier.companyName}. I have identified ${redFlags.length} key structural and governance issues${redFlags[0] ? ` including: ${redFlags[0].title}` : ''}. How would you like to interrogate the disclosures?`,
        time: 'Just now',
      },
    ]);
  }, [dossier.id]);

  // Dynamic Suggested Prompts tailored to the current prospectus
  const suggestedQueries = (redFlags && redFlags.length > 0)
    ? [
        redFlags[0]?.recommendedAuditQuery || `What are the primary operational risks disclosed by ${dossier.companyName}?`,
        redFlags[1]?.recommendedAuditQuery || `How does ${dossier.companyName} manage customer and supplier concentration?`,
        `Is the ${dossier.moratoriumPeriod || '6-month lockup'} adequate for institutional investors?`,
        `Evaluate the sustainability of gross margins and proceed deployment.`,
      ]
    : [
        `What are the principal risk factors disclosed in the prospectus?`,
        `Is the ${dossier.moratoriumPeriod || '6-month moratorium'} sufficient to prevent share overhang?`,
        `Explain the planned utilisation of IPO proceeds.`,
        `Evaluate the sustainability of gross margins.`,
      ];

  const handleAskQuestion = async (queryToAsk?: string) => {
    const question = queryToAsk || chatQuestion;
    if (!question.trim() || isChatLoading) return;

    const userMsg = {
      sender: 'user' as const,
      text: question,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory(prev => [...prev, userMsg]);
    setChatQuestion('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/ai-chat-prospectus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          companyName: dossier.companyName,
          prospectusContext: dossier.rawProspectusText,
        }),
      });

      const text = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          !response.ok
            ? `Inquiry error (${response.status}): ${response.statusText || 'Server error'}`
            : 'Received unexpected response format.'
        );
      }

      if (data && data.success && data.answer) {
        setChatHistory(prev => [
          ...prev,
          {
            sender: 'ai',
            text: data.answer,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error(data.message || 'No answer generated');
      }
    } catch (err: any) {
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Analysis error: ${err.message || 'Unable to complete AI evaluation. Ensure server environment is ready.'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Filtered red flags
  const filteredFlags = redFlags.filter(flag => {
    if (selectedSeverity !== 'ALL' && flag.severity !== selectedSeverity) return false;
    if (selectedCategory !== 'ALL' && flag.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Sentiment & Red Flag Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sentiment Gauge Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Prospectus Sentiment Polarities
            </h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              NLP Engine
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-[11px] text-slate-400">Composite Sentiment Score</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                +{sentiment.overallScore}
                <span className="text-xs text-slate-500 font-normal"> / 100</span>
              </div>
              <div className="text-xs font-medium text-emerald-300">
                {sentiment.classification}
              </div>
            </div>
            
            {/* Hedging index */}
            <div className="text-right border-l border-slate-800 pl-4">
              <div className="text-[11px] text-slate-400">Hedging Ratio</div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
                {sentiment.hedgingIndex}%
              </div>
              <div className="text-[11px] text-slate-400">Defensive Language</div>
            </div>
          </div>

          {/* Tone Analysis Description */}
          <p className="text-xs text-slate-300 leading-relaxed">
            {sentiment.toneAnalysis || sentiment.executiveSummary}
          </p>
        </div>

        {/* Section Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Disclosure Sentiment by Section
            </span>
            <span className="text-xs text-slate-400 font-normal">{sentimentSections.length} Prospectus Sections Analyzed</span>
          </h3>

          <div className="space-y-2.5">
            {sentimentSections.map((sec, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{sec.sectionName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({sec.prospectusReference})</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">{sec.keyFinding}</div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <div className={`font-mono font-bold text-xs ${
                      sec.score > 30 ? 'text-emerald-400' : sec.score < -20 ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {sec.score > 0 ? `+${sec.score}` : sec.score}
                    </div>
                    <div className="text-[10px] text-slate-500">{sec.sentiment}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Market Sentiment Score Over Time - Interactive Timeline Line Chart */}
      <MarketSentimentTimelineChart 
        dossier={dossier} 
        onUpdateDossier={onUpdateDossier} 
      />

      {/* Main Red Flag Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Automated Regulatory & Governance Red Flag Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Flags verified against statutory prospectus disclosure guidelines and fiduciary risk criteria
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Only</option>
              <option value="MEDIUM">Medium Only</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Categories</option>
              <option value="GOVERNANCE_RELATED_PARTY">Governance / Related-Party</option>
              <option value="SUPPLIER_CONCENTRATION">Supplier Concentration</option>
              <option value="CONTRACTUAL_STABILITY">Contractual Stability</option>
              <option value="MORATORIUM">Moratorium & Lock-up</option>
              <option value="WORKING_CAPITAL">Working Capital</option>
              <option value="DILUTION_FLOAT">Dilution & Secondary Float</option>
            </select>
          </div>
        </div>

        {/* Red Flag Accordion Items */}
        <div className="space-y-3">
          {filteredFlags.map((flag, idx) => {
            const isExpanded = expandedFlagId === flag.id;
            const isCritical = flag.severity === 'CRITICAL';
            const isHigh = flag.severity === 'HIGH';

            return (
              <div 
                key={`redflag-item-${flag.id || idx}-${idx}`}
                className={`rounded-xl border transition-all ${
                  isCritical 
                    ? 'bg-rose-950/15 border-rose-500/40 hover:border-rose-500/70' 
                    : isHigh 
                      ? 'bg-amber-950/15 border-amber-500/40 hover:border-amber-500/70' 
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header row */}
                <div 
                  onClick={() => setExpandedFlagId(isExpanded ? null : flag.id)}
                  className="p-4 flex items-start justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                      isCritical 
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                        : isHigh 
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    }`}>
                      {flag.severity}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white">{flag.title}</h4>
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded">
                          {flag.prospectusSection}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-1">{flag.description}</p>
                    </div>
                  </div>

                  <div className="text-slate-400 hover:text-white shrink-0 mt-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 space-y-3.5 border-t border-slate-800/80 text-xs">
                    
                    {/* Exact Prospectus Evidence Quote */}
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <div className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        Exact Prospectus Excerpt:
                      </div>
                      <p className="font-mono text-slate-300 text-[11px] leading-relaxed italic bg-slate-950 p-2.5 rounded border border-slate-800/80">
                        {flag.evidenceExcerpt}
                      </p>
                    </div>

                    {/* Regulatory Risk Implication */}
                    <div className="space-y-1">
                      <span className="font-bold text-rose-400">Regulatory & Institutional Risk:</span>
                      <p className="text-slate-300 leading-relaxed">{flag.regulatoryRiskImplication}</p>
                    </div>

                    {/* Mitigating Factors if any */}
                    {flag.mitigatingFactors && (
                      <div className="space-y-1">
                        <span className="font-bold text-emerald-400">Issuer Mitigating Factors:</span>
                        <p className="text-slate-300 leading-relaxed">{flag.mitigatingFactors}</p>
                      </div>
                    )}

                    {/* Recommended Audit Question */}
                    <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30 space-y-1">
                      <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                        Recommended Investment Committee / Underwriter Audit Query:
                      </span>
                      <p className="text-slate-200 font-medium leading-relaxed">{flag.recommendedAuditQuery}</p>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive AI Due Diligence Terminal */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Live AI Prospectus Analyst</h3>
              <p className="text-xs text-slate-400">Institutional due diligence interrogation powered by Gemini 3.8 Flash</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        </div>

        {/* Suggested Quick Queries */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px]">Quick Audits:</span>
          {suggestQueries(suggestedQueries, handleAskQuestion)}
        </div>

        {/* Chat Stream Window */}
        <div className="h-64 overflow-y-auto space-y-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          {chatHistory.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex gap-3 text-xs leading-relaxed ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-6 h-6 rounded-md bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div 
                className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-xl whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}
              >
                {msg.text}
                <div className={`text-[9px] mt-1 ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-500'}`}>
                  {msg.time}
                </div>
              </div>
              {msg.sender === 'user' && (
                <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isChatLoading && (
            <div className="flex items-center gap-2 text-xs text-indigo-400 p-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing prospectus disclosures and SEC/Bursa guidelines...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={chatQuestion}
            onChange={(e) => setChatQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
            placeholder="Ask the AI Analyst any due diligence or regulatory question..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleAskQuestion()}
            disabled={!chatQuestion.trim() || isChatLoading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Audit</span>
          </button>
        </div>

      </div>

    </div>
  );
};

// Helper for quick query buttons
function suggestQueries(queries: string[], onAsk: (q: string) => void) {
  return queries.map((q, idx) => (
    <button
      key={idx}
      onClick={() => onAsk(q)}
      className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-[11px]"
    >
      {q}
    </button>
  ));
}
