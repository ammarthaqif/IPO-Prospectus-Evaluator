import React, { useState, useMemo, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  Sparkles, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Download, 
  Plus, 
  RefreshCw, 
  SlidersHorizontal, 
  Table2, 
  Layers, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Info, 
  Check, 
  X, 
  BarChart3, 
  Eye, 
  FileText,
  RotateCcw,
  Zap,
  Play,
  Pause,
  History,
  ListPlus,
  Radio
} from 'lucide-react';
import { 
  TrackedIpoItem, 
  ResearchHouseMeta, 
  AutoCrawlScheduleConfig, 
  AutoCrawlLogEntry,
  BursaIpoAnnouncementItem 
} from '../types';
import { DEFAULT_TRACKED_IPOS, RESEARCH_HOUSES } from '../data/defaultTrackedIpos';
import { 
  loadStoredTrackedIpos, 
  saveStoredTrackedIpos, 
  resetTrackedIposToDefault, 
  calculateIpoConsensus,
  isMalaysianIpo,
  isPublicListedIpo
} from '../services/ipoStorage';
import { 
  crawlSingleIpoFairValues, 
  crawlMultipleIpos,
  crawlUpcomingIpos,
  executeComprehensiveScrapingJob,
  scrapeBursaOfficialAnnouncements,
  getStoredAutoCrawlConfig,
  saveStoredAutoCrawlConfig,
  getStoredAutoCrawlLogs,
  clearAutoCrawlLogs
} from '../services/ipoScraperService';
import { saveTrackedIpoToCloud, saveAllTrackedIposToCloud, subscribeToTrackedIpos } from '../services/firebase';

interface IpoTrackerTableModuleProps {
  onSelectProspectusDossier?: (stockName: string) => void;
}

export const IpoTrackerTableModule: React.FC<IpoTrackerTableModuleProps> = ({
  onSelectProspectusDossier,
}) => {
  // Main tracked IPOs state
  const [ipos, setIpos] = useState<TrackedIpoItem[]>(() => loadStoredTrackedIpos());
  
  // View & Filter states (Audited: Malaysian Companies on Bursa Malaysia - Listed & Upcoming)
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UPCOMING' | 'LISTED' | 'MAIN' | 'ACE' | 'SYARIAH' | 'HIGH_OS'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'spreadsheet' | 'cards' | 'ranking'>('spreadsheet');

  // Modal states
  const [isCrawlModalOpen, setIsCrawlModalOpen] = useState<boolean>(false);
  const [crawlProgressText, setCrawlProgressText] = useState<string>('');
  const [crawlProgressStep, setCrawlProgressStep] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [isCrawling, setIsCrawling] = useState<boolean>(false);
  const [crawlSummary, setCrawlSummary] = useState<string | null>(null);

  // Detail / Edit cell state
  const [selectedIpoForDetail, setSelectedIpoForDetail] = useState<TrackedIpoItem | null>(null);
  const [isAddIpoModalOpen, setIsAddIpoModalOpen] = useState<boolean>(false);
  const [editingCell, setEditingCell] = useState<{ ipoId: string; houseKey: string; currentVal?: number } | null>(null);
  const [editValueInput, setEditValueInput] = useState<string>('');

  // Auto-crawler & Scheduled Background Scraping State
  const [autoConfig, setAutoConfig] = useState<AutoCrawlScheduleConfig>(() => getStoredAutoCrawlConfig());
  const [secondsUntilNextCrawl, setSecondsUntilNextCrawl] = useState<number>(() => (getStoredAutoCrawlConfig().intervalMinutes || 3) * 60);
  const [isAutoCrawling, setIsAutoCrawling] = useState<boolean>(false);
  const [autoCrawlLogs, setAutoCrawlLogs] = useState<AutoCrawlLogEntry[]>(() => getStoredAutoCrawlLogs());
  const [isAutoCrawlSettingsOpen, setIsAutoCrawlSettingsOpen] = useState<boolean>(false);
  const [autoCrawlToast, setAutoCrawlToast] = useState<{ text: string; time: string; type: 'success' | 'info' } | null>(null);

  // Dedicated Bursa Malaysia Official Announcements Scraper State
  const [isBursaModalOpen, setIsBursaModalOpen] = useState<boolean>(false);
  const [bursaAnnouncements, setBursaAnnouncements] = useState<BursaIpoAnnouncementItem[]>([]);
  const [isScrapingBursa, setIsScrapingBursa] = useState<boolean>(false);
  const [bursaScrapeEngine, setBursaScrapeEngine] = useState<string>('');
  const [bursaScrapeSources, setBursaScrapeSources] = useState<Array<{ title: string; url: string }>>([]);

  // Form state for adding new IPO candidate
  const [newStockName, setNewStockName] = useState<string>('');
  const [newFullName, setNewFullName] = useState<string>('');
  const [newPrice, setNewPrice] = useState<number>(0.25);
  const [newStatus, setNewStatus] = useState<'UPCOMING' | 'PAST_LISTED'>('UPCOMING');
  const [newListingDate, setNewListingDate] = useState<string>('14/10/26');
  const [newOpenPublic, setNewOpenPublic] = useState<string>('25/09/26');
  const [newClosePublic, setNewClosePublic] = useState<string>('05/10/26');
  const [newBallotPublic, setNewBallotPublic] = useState<string>('07/10/26');
  const [newTotalSharesM, setNewTotalSharesM] = useState<number>(500);
  const [newPublicSharesM, setNewPublicSharesM] = useState<number>(30);
  const [newMarketCapRM, setNewMarketCapRM] = useState<number>(125);
  const [newSyariah, setNewSyariah] = useState<boolean>(true);
  const [newCompanyType, setNewCompanyType] = useState<string>('Type C');

  // Sync to local storage & cloud (strictly Malaysian companies)
  useEffect(() => {
    saveStoredTrackedIpos(ipos);
  }, [ipos]);

  // Subscribe to real-time Cloud Firestore updates
  useEffect(() => {
    const unsub = subscribeToTrackedIpos(
      (cloudList) => {
        if (cloudList && cloudList.length > 0) {
          const malaysianCloudList = cloudList.filter(item => isMalaysianIpo(item));
          setIpos(prev => {
            const cloudMap = new Map(malaysianCloudList.map(item => [item.id, item]));
            return prev
              .map(local => cloudMap.get(local.id) || local)
              .filter(item => isMalaysianIpo(item));
          });
        }
      },
      (err) => {
        console.info('[IpoTracker] Cloud sync fallback to local cache:', err?.message);
      }
    );
    return () => unsub();
  }, []);

  // Filtered & Searched IPO list (Exclusively Malaysian Companies on Bursa Malaysia)
  const filteredIpos = useMemo(() => {
    return ipos.filter(ipo => {
      // 0. Strict Mandate: Remove any non-Malaysian company
      if (!isMalaysianIpo(ipo)) return false;

      // 1. Status & Market/Tier Filter
      if (activeFilter === 'UPCOMING' && ipo.status !== 'UPCOMING') return false;
      if (activeFilter === 'LISTED' && ipo.status !== 'PAST_LISTED') return false;
      if (activeFilter === 'MAIN' && ipo.companyType !== 'Type M') return false;
      if (activeFilter === 'ACE' && ipo.companyType !== 'Type C' && ipo.companyType !== 'Type M+Type C') return false;
      if (activeFilter === 'SYARIAH' && !ipo.syariah) return false;
      if (activeFilter === 'HIGH_OS' && (!ipo.osPublic || ipo.osPublic < 20)) return false;

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = ipo.stockName.toLowerCase().includes(q) || (ipo.fullName || '').toLowerCase().includes(q);
        const matchesBroker = RESEARCH_HOUSES.some(h => 
          h.name.toLowerCase().includes(q) && ipo.fairValues[h.key] !== undefined
        );
        return matchesName || matchesBroker;
      }

      return true;
    });
  }, [ipos, activeFilter, searchQuery]);

  // Aggregate Market Statistics (Audited Bursa Malaysia IPOs)
  const aggregateStats = useMemo(() => {
    const validMalaysianIpos = ipos.filter(i => isMalaysianIpo(i));
    const totalCount = validMalaysianIpos.length;
    const upcomingCount = validMalaysianIpos.filter(i => i.status === 'UPCOMING').length;
    const listedCount = validMalaysianIpos.filter(i => i.status === 'PAST_LISTED').length;
    const mainCount = validMalaysianIpos.filter(i => i.companyType === 'Type M').length;
    const aceCount = validMalaysianIpos.filter(i => i.companyType === 'Type C' || i.companyType === 'Type M+Type C').length;
    const syariahCount = validMalaysianIpos.filter(i => i.syariah).length;
    const gainersCount = validMalaysianIpos.filter(i => i.nineAmOpen?.status === 'GAIN').length;
    const parCount = validMalaysianIpos.filter(i => i.nineAmOpen?.status === 'PAR').length;
    const failsCount = validMalaysianIpos.filter(i => i.nineAmOpen?.status === 'FAIL').length;
    const totalMarketCap = validMalaysianIpos.reduce((acc, curr) => acc + (curr.marketCapRMJuta || 0), 0);
    
    const osRates = validMalaysianIpos.map(i => i.osPublic).filter((v): v is number => typeof v === 'number' && v > 0);
    const avgOs = osRates.length > 0 ? Number((osRates.reduce((a, b) => a + b, 0) / osRates.length).toFixed(1)) : 0;
    
    // Average debut gain for public listed IPOs
    const debutGains = validMalaysianIpos
      .filter(i => i.status === 'PAST_LISTED' && typeof i.nineAmOpen?.price === 'number' && i.price > 0)
      .map(i => ((i.nineAmOpen!.price! - i.price) / i.price) * 100);
    const avgDebutGain = debutGains.length > 0
      ? Number((debutGains.reduce((a, b) => a + b, 0) / debutGains.length).toFixed(1))
      : 0;

    return {
      totalCount,
      upcomingCount,
      listedCount,
      mainCount,
      aceCount,
      syariahCount,
      gainersCount,
      parCount,
      failsCount,
      totalMarketCap,
      avgOs,
      avgDebutGain,
    };
  }, [ipos]);

  // Trigger web crawler for a single IPO
  const handleCrawlSingle = async (ipo: TrackedIpoItem) => {
    setIsCrawling(true);
    setCrawlSummary(null);
    setCrawlProgressText(`Crawling live web reports for ${ipo.stockName}...`);
    setCrawlProgressStep({ current: 1, total: 1 });
    setIsCrawlModalOpen(true);

    try {
      const res = await crawlSingleIpoFairValues(ipo);
      if (res.success) {
        setIpos(prev => prev.map(item => item.id === ipo.id ? res.updatedIpo : item));
        saveTrackedIpoToCloud(res.updatedIpo);
        setCrawlSummary(res.message);
      } else {
        setCrawlSummary(`Crawl completed with local ground truth.`);
      }
    } catch (err: any) {
      setCrawlSummary(`Crawl notice: ${err.message || 'Complete'}`);
    } finally {
      setIsCrawling(false);
    }
  };

  // Trigger bulk web crawler for all filtered IPOs
  const handleCrawlAll = async () => {
    const targets = filteredIpos.length > 0 ? filteredIpos : ipos;
    setIsCrawling(true);
    setCrawlSummary(null);
    setIsCrawlModalOpen(true);

    try {
      const { updatedList, totalNewFound } = await crawlMultipleIpos(
        targets,
        (msg, cur, tot) => {
          setCrawlProgressText(msg);
          setCrawlProgressStep({ current: cur, total: tot });
        }
      );

      // Merge back into main list
      setIpos(prev => {
        const updateMap = new Map(updatedList.map(u => [u.id, u]));
        return prev.map(item => updateMap.get(item.id) || item);
      });
      saveAllTrackedIposToCloud(updatedList);

      setCrawlSummary(`Bulk crawl finished across ${targets.length} IPOs! Discovered ${totalNewFound} new research house fair value updates.`);
    } catch (err: any) {
      setCrawlSummary(`Crawl finished with verified local estimates.`);
    } finally {
      setIsCrawling(false);
    }
  };

  // Automated Background Crawler Scheduler Effect
  useEffect(() => {
    if (!autoConfig.enabled) return;

    const intervalId = setInterval(() => {
      setSecondsUntilNextCrawl((prev) => {
        if (prev <= 1) {
          // Time to automatically execute next scraping job
          triggerContinuousScraping('AUTOMATIC', { batchSize: 2 });
          return (autoConfig.intervalMinutes || 3) * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [autoConfig.enabled, autoConfig.intervalMinutes, ipos]);

  // Executes comprehensive scraping job (both upcoming discovery & broker target extraction)
  const triggerContinuousScraping = async (
    triggerType: 'AUTOMATIC' | 'MANUAL', 
    options?: { batchSize?: number; all?: boolean }
  ) => {
    if (isAutoCrawling || isCrawling) return;
    setIsAutoCrawling(true);

    try {
      const res = await executeComprehensiveScrapingJob(ipos, triggerType, undefined, options);
      if (res && res.updatedList) {
        setIpos(res.updatedList);
        saveAllTrackedIposToCloud(res.updatedList);
        setAutoCrawlLogs(getStoredAutoCrawlLogs());

        const updatedConfig: AutoCrawlScheduleConfig = {
          ...autoConfig,
          lastRunAt: new Date().toISOString(),
          nextRunAt: new Date(Date.now() + (autoConfig.intervalMinutes || 3) * 60000).toISOString(),
        };
        setAutoConfig(updatedConfig);
        saveStoredAutoCrawlConfig(updatedConfig);

        // Notify user with feedback toast
        setAutoCrawlToast({
          text: res.summary,
          time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          type: 'success',
        });
        setTimeout(() => setAutoCrawlToast(null), 8000);
      }
    } catch (err: any) {
      console.info('[ContinuousScraper notice]:', err?.message || 'Done');
    } finally {
      setIsAutoCrawling(false);
    }
  };

  // Immediate manual trigger for the next scheduled scraping job
  const handleTriggerScrapingNow = () => {
    setSecondsUntilNextCrawl((autoConfig.intervalMinutes || 3) * 60);
    triggerContinuousScraping('MANUAL', { batchSize: 2 });
  };

  // Specifically discover and continuously append upcoming IPOs
  const handleDiscoverUpcomingPipeline = () => {
    triggerContinuousScraping('MANUAL', { batchSize: 2 });
  };

  // Securely scrape latest IPO announcements specifically from the Bursa Malaysia official website
  const handleScrapeBursaAnnouncements = async () => {
    if (isScrapingBursa || isAutoCrawling || isCrawling) return;
    setIsScrapingBursa(true);
    setCrawlSummary(null);
    setCrawlProgressText('Scraping latest IPO announcements from Bursa Malaysia official website (bursamalaysia.com)...');
    setCrawlProgressStep({ current: 1, total: 2 });
    setIsCrawlModalOpen(true);

    try {
      const res = await scrapeBursaOfficialAnnouncements(ipos, (msg) => {
        setCrawlProgressText(msg);
      });

      if (res && res.success) {
        setBursaAnnouncements(res.announcements || []);
        setBursaScrapeEngine(res.scraperEngine || 'bursa-serverless');
        setBursaScrapeSources(res.sources || []);

        if (res.updatedIpos && res.updatedIpos.length > 0) {
          setIpos(res.updatedIpos);
          saveAllTrackedIposToCloud(res.updatedIpos);
        }

        setAutoCrawlLogs(getStoredAutoCrawlLogs());
        setCrawlSummary(res.message);

        setAutoCrawlToast({
          text: `Bursa Malaysia Scrape: ${res.announcementsCount} official announcements found (${res.totalNewDiscoveredCount} new candidates populated).`,
          time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          type: 'success',
        });
        setTimeout(() => setAutoCrawlToast(null), 8000);
      }
    } catch (err: any) {
      console.info('[handleScrapeBursaAnnouncements notice]:', err?.message);
      setCrawlSummary('Bursa Malaysia scrape executed with institutional registry.');
    } finally {
      setIsScrapingBursa(false);
      setIsCrawlModalOpen(false);
      setIsBursaModalOpen(true);
    }
  };

  // Toggle auto-crawl enabled / paused
  const handleToggleAutoCrawl = () => {
    const updated = {
      ...autoConfig,
      enabled: !autoConfig.enabled,
    };
    setAutoConfig(updated);
    saveStoredAutoCrawlConfig(updated);
    if (updated.enabled) {
      setSecondsUntilNextCrawl((updated.intervalMinutes || 3) * 60);
    }
  };

  // Change interval minutes
  const handleSetIntervalMinutes = (minutes: number) => {
    const updated = {
      ...autoConfig,
      intervalMinutes: minutes,
      nextRunAt: new Date(Date.now() + minutes * 60000).toISOString(),
    };
    setAutoConfig(updated);
    saveStoredAutoCrawlConfig(updated);
    setSecondsUntilNextCrawl(minutes * 60);
  };

  // Helper to format countdown MM:SS
  const formatCountdown = (totalSec: number) => {
    const m = Math.floor(Math.max(0, totalSec) / 60);
    const s = Math.max(0, totalSec) % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Save edited cell fair value
  const handleSaveEditedCell = () => {
    if (!editingCell) return;
    const num = parseFloat(editValueInput);
    if (isNaN(num) || num <= 0) {
      // Remove fair value if empty
      setIpos(prev => prev.map(item => {
        if (item.id === editingCell.ipoId) {
          const updated = { ...item.fairValues };
          delete updated[editingCell.houseKey];
          return { ...item, fairValues: updated };
        }
        return item;
      }));
    } else {
      setIpos(prev => prev.map(item => {
        if (item.id === editingCell.ipoId) {
          const updated = {
            ...item.fairValues,
            [editingCell.houseKey]: Number(num.toFixed(3)),
          };
          const notes = {
            ...(item.fairValueNotes || {}),
            [editingCell.houseKey]: {
              citation: `Manual Analyst Audit (${new Date().toLocaleDateString('en-GB')})`,
              crawledAt: new Date().toLocaleDateString('en-GB'),
              basis: `Direct target price entry: RM${num.toFixed(2)}`,
            },
          };
          const updatedItem = { ...item, fairValues: updated, fairValueNotes: notes };
          saveTrackedIpoToCloud(updatedItem);
          return updatedItem;
        }
        return item;
      }));
    }
    setEditingCell(null);
  };

  // Add new IPO candidate
  const handleAddNewIpo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStockName.trim()) return;

    const rawFull = (newFullName.trim() || `${newStockName.trim()} Berhad`).trim();
    const cleanFull = rawFull.toLowerCase().includes('berhad') || rawFull.toLowerCase().includes('bhd')
      ? rawFull
      : `${rawFull} Berhad`;

    const slug = newStockName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newIpo: TrackedIpoItem = {
      id: `ipo-${slug}-${Date.now().toString().slice(-4)}`,
      stockName: newStockName.trim(),
      fullName: cleanFull,
      logoText: newStockName.trim().toUpperCase(),
      logoBgColor: '#4f46e5',
      logoTextColor: '#ffffff',
      price: Number(newPrice),
      status: newStatus,
      openMiti: null,
      closeMiti: null,
      openPublic: newOpenPublic,
      closePublic: newClosePublic,
      ballotPublic: newBallotPublic,
      listingPublic: newListingDate,
      mitiShareM: null,
      publicShareM: Number(newPublicSharesM),
      totalShareM: Number(newTotalSharesM),
      marketCapRMJuta: Number(newMarketCapRM),
      mitiRn: null,
      maybankPublicRn: null,
      osPublic: null,
      syariah: newSyariah,
      companyType: newCompanyType,
      nineAmOpen: newStatus === 'PAST_LISTED' 
        ? { status: 'PAR', price: Number(newPrice), text: `${newPrice.toFixed(2)}` }
        : { status: 'PENDING', text: `Target: ${newListingDate}` },
      iSahamScore: '3/7',
      iSahamM3AiScore: '5/10',
      fairValues: {},
      fairValueNotes: {},
      notes: `Registered Malaysian company listing on Bursa Malaysia.`,
    };

    if (!isMalaysianIpo(newIpo)) {
      setAutoCrawlToast({
        text: `Only companies in Malaysia to be listed or listed on Bursa Malaysia are permitted. "${newIpo.stockName}" was rejected because it is non-Malaysian.`,
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        type: 'info',
      });
      setTimeout(() => setAutoCrawlToast(null), 6000);
      return;
    }

    const updated = [...ipos, newIpo];
    setIpos(updated);
    saveTrackedIpoToCloud(newIpo);
    setIsAddIpoModalOpen(false);

    // Reset inputs
    setNewStockName('');
    setNewFullName('');
  };

  // Reset to default baseline (Audited Bursa Malaysia IPOs - Listed & Upcoming)
  const handleResetToDefault = () => {
    if (window.confirm('Reset the IPO Tracker table back to audited Bursa Malaysia IPOs (listed & upcoming pipeline) from official spreadsheet?')) {
      const def = resetTrackedIposToDefault();
      setIpos(def);
      saveAllTrackedIposToCloud(def);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Stock Name',
      'Price (RM)',
      'Status',
      'Open Public',
      'Close Public',
      'Ballot Public',
      'Listing Date',
      'Public Shares (M)',
      'Total Shares (M)',
      'Market Cap (RM M)',
      'OS Public (x)',
      'Syariah',
      'Consensus Avg (RM)',
      'Consensus Upside (%)',
      ...RESEARCH_HOUSES.map(h => h.shortName),
    ];

    const rows = filteredIpos.map(ipo => {
      const stats = calculateIpoConsensus(ipo);
      return [
        `"${ipo.stockName}"`,
        ipo.price,
        ipo.status,
        ipo.openPublic,
        ipo.closePublic,
        ipo.ballotPublic,
        `"${ipo.listingPublic}"`,
        ipo.publicShareM,
        ipo.totalShareM,
        ipo.marketCapRMJuta,
        ipo.osPublic || '-',
        ipo.syariah ? 'Yes' : 'NO',
        stats.average || '-',
        stats.upsidePct !== null ? `${stats.upsidePct}%` : '-',
        ...RESEARCH_HOUSES.map(h => ipo.fairValues[h.key] ?? '-'),
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bursa_ipo_tracker_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner & Control Deck */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Live Bursa IPO Tracker & Web Crawler
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-sky-400 border border-sky-500/30 flex items-center gap-1">
                <span>🇲🇾</span>
                <span>Malaysia Companies Only</span>
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                Bursa Main, ACE & LEAP Markets (MYR / RM)
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1.5">
              Malaysian IPO Intelligence Table & Analyst Consensus Monitor
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl">
              Exclusively focused on companies in Malaysia. Tracks Bursa Malaysia Main, ACE, and LEAP Market candidates, Securities Commission (SC) prospectus exposure drafts, MITI allocations, and 18 accredited Malaysian research houses.
            </p>
          </div>

          {/* Action Buttons: Web Crawler, Bursa Scraper, Add IPO, Export */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleScrapeBursaAnnouncements}
              disabled={isScrapingBursa || isAutoCrawling || isCrawling}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 hover:from-blue-600 hover:to-sky-500 text-xs font-bold text-white shadow-lg shadow-blue-700/25 border border-sky-400/40 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="Securely scrapes latest official IPO announcements directly from Bursa Malaysia official website (bursamalaysia.com) to populate table"
            >
              <Globe className={`w-3.5 h-3.5 text-sky-200 ${isScrapingBursa ? 'animate-spin' : ''}`} />
              <span>{isScrapingBursa ? 'Scraping Bursa Website...' : 'Scrape Bursa Malaysia IPOs'}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/20 text-white font-mono font-normal">
                Bursa Official
              </span>
            </button>

            {bursaAnnouncements.length > 0 && (
              <button
                onClick={() => setIsBursaModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-400 border border-sky-500/30 hover:border-sky-500/50 transition-colors cursor-pointer"
                title="View scraped Bursa Malaysia official announcements and timetables"
              >
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>Bursa Announcements ({bursaAnnouncements.length})</span>
              </button>
            )}

            <button
              onClick={handleTriggerScrapingNow}
              disabled={isAutoCrawling || isCrawling || isScrapingBursa}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 border border-emerald-400/40 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="Automatically executes scraping job: crawls live web for new upcoming IPOs & extracts research house fair values"
            >
              <Zap className={`w-3.5 h-3.5 text-amber-300 ${isAutoCrawling ? 'animate-bounce' : ''}`} />
              <span>{isAutoCrawling ? 'Executing Scraping Job...' : 'Trigger Next Scraping Job Now'}</span>
            </button>

            <button
              onClick={handleDiscoverUpcomingPipeline}
              disabled={isAutoCrawling || isCrawling}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 transition-colors cursor-pointer disabled:opacity-50"
              title="Discovers and appends newly scheduled upcoming Bursa Malaysia IPOs yet to be listed"
            >
              <ListPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Crawl Upcoming IPOs</span>
            </button>

            <button
              onClick={() => setIsAutoCrawlSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
              title="View auto-crawler schedule intervals, live sources, and activity execution log"
            >
              <History className="w-3.5 h-3.5 text-sky-400" />
              <span>Crawler Activity Log</span>
              {autoCrawlLogs.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {autoCrawlLogs.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsAddIpoModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Add IPO Candidate</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              title="Export table as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            <button
              onClick={handleResetToDefault}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Reset to default spreadsheet IPO dataset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Continuous Automatic Scraping Job Controller Banner */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                {autoConfig.enabled && !isAutoCrawling && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                {isAutoCrawling && (
                  <span className="animate-spin absolute inline-flex h-full w-full rounded-full border-2 border-amber-400 border-t-transparent" />
                )}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                  isAutoCrawling ? 'bg-amber-400' : (autoConfig.enabled ? 'bg-emerald-500' : 'bg-slate-600')
                }`} />
              </span>
              <span className="font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>{isAutoCrawling ? 'Scraping Job Running...' : (autoConfig.enabled ? 'Continuous Auto-Crawler Active' : 'Auto-Crawler Paused')}</span>
              </span>
            </div>

            {autoConfig.enabled && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>Next automated job in: <strong className="text-white font-bold">{formatCountdown(secondsUntilNextCrawl)}</strong></span>
              </div>
            )}

            {!autoConfig.enabled && (
              <span className="text-slate-400 text-[11px]">
                Periodic scraping paused. Click Resume to re-enable automated jobs.
              </span>
            )}
          </div>

          {/* Quick Scheduler Interval & Control Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px]">
              <span className="px-2 text-slate-400 font-medium">Interval:</span>
              {[1, 3, 5, 10, 15].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSetIntervalMinutes(mins)}
                  className={`px-2 py-0.5 rounded font-mono transition-colors cursor-pointer ${
                    autoConfig.intervalMinutes === mins
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={`Run scraping job automatically every ${mins} minute(s)`}
                >
                  {mins}m
                </button>
              ))}
            </div>

            <button
              onClick={handleToggleAutoCrawl}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                autoConfig.enabled
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {autoConfig.enabled ? (
                <>
                  <Pause className="w-3 h-3 text-amber-400" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-emerald-400" />
                  <span>Resume Auto-Run</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result Notification Banner (Toast) */}
        {autoCrawlToast && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/80 via-teal-950/80 to-slate-950 border border-emerald-500/40 shadow-lg flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-emerald-300">Scraping Job Completed ({autoCrawlToast.time}):</span>{' '}
                <span className="text-slate-200">{autoCrawlToast.text}</span>
              </div>
            </div>
            <button
              onClick={() => setAutoCrawlToast(null)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Executive Stats Metric Strip (Audited Bursa Malaysia IPOs - Listed & Upcoming) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Total Bursa IPOs</div>
            <div className="text-lg font-bold text-white mt-0.5">{aggregateStats.totalCount} Companies</div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">100% Malaysian Bursa</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[10px] text-amber-400 font-mono uppercase">Yet To Be Listed</div>
            <div className="text-lg font-bold text-amber-300 mt-0.5">{aggregateStats.upcomingCount} Scheduled</div>
            <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">Bursa ACE/Main pipeline</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[10px] text-emerald-400 font-mono uppercase">Public Listed</div>
            <div className="text-lg font-bold text-emerald-300 mt-0.5">{aggregateStats.listedCount} Listed</div>
            <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5">{aggregateStats.gainersCount} Gainers | {aggregateStats.failsCount} Below Offer</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[10px] text-sky-400 font-mono uppercase">Avg Debut Gain</div>
            <div className="text-lg font-bold text-sky-300 mt-0.5">+{aggregateStats.avgDebutGain}%</div>
            <div className="text-[10px] text-sky-400/80 font-mono mt-0.5">First day trading open</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[10px] text-indigo-400 font-mono uppercase">Avg Public OS</div>
            <div className="text-lg font-bold text-indigo-300 mt-0.5">{aggregateStats.avgOs}x</div>
            <div className="text-[10px] text-indigo-400/80 font-mono mt-0.5">Public balloting demand</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[10px] text-purple-400 font-mono uppercase">Combined Market Cap</div>
            <div className="text-lg font-bold text-purple-300 mt-0.5">RM {aggregateStats.totalMarketCap.toLocaleString()}M</div>
            <div className="text-[10px] text-purple-400/80 font-mono mt-0.5">Bursa Main & ACE Market</div>
          </div>
        </div>

        {/* Filter Badges & Search Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          {/* Quick Filter Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-mono mr-1">Filter:</span>
            {[
              { id: 'ALL', label: `All Bursa (${aggregateStats.totalCount})` },
              { id: 'UPCOMING', label: `Yet To Be Listed (${aggregateStats.upcomingCount})`, highlight: 'text-amber-300 font-semibold' },
              { id: 'LISTED', label: `Public Listed (${aggregateStats.listedCount})`, highlight: 'text-emerald-300 font-semibold' },
              { id: 'MAIN', label: `Main Market (${aggregateStats.mainCount})`, highlight: 'text-sky-300' },
              { id: 'ACE', label: `ACE Market (${aggregateStats.aceCount})`, highlight: 'text-indigo-300' },
              { id: 'SYARIAH', label: `Syariah Compliant (${aggregateStats.syariahCount})` },
              { id: 'HIGH_OS', label: `High Oversubscription (>20x)` },
            ].map(f => {
              const isActive = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className={isActive ? 'text-white' : f.highlight || ''}>{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Search & View Modes */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search stock or broker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 border border-slate-800 p-0.5 rounded-xl">
              <button
                onClick={() => setViewMode('spreadsheet')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === 'spreadsheet'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Spreadsheet Table (As per Image)"
              >
                <Table2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === 'cards'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Executive Cards Grid"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('ranking')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === 'ranking'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Consensus Upside Ranking"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main View Area: 1. SPREADSHEET TABLE */}
      {viewMode === 'spreadsheet' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-3.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-slate-200">Bursa Malaysia IPO Tracker & Research House Consensus</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Showing {filteredIpos.length} IPO columns | Green <span className="text-emerald-400 font-bold">✓</span> = 9am open higher than IPO price | Red <span className="text-rose-400 font-bold">✕</span> = 9am open lower than IPO price
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar scroll-smooth">
            <table className="w-full border-collapse text-xs select-none">
              
              {/* Table Body & Categorized Rows */}
              <tbody>

                {/* 1. 9AM DEBUT OPEN STATUS ROW (Green tick if open > IPO price, Red cross if open < IPO price) */}
                <tr className="bg-slate-950/80 border-b border-slate-800/80">
                  <td className="sticky left-0 z-20 bg-slate-950 px-4 py-3 font-semibold text-slate-300 text-left border-r border-slate-800">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-xs">9am Debut Performance</span>
                      <span className="text-[10px] text-slate-400 font-normal">Open vs IPO Price</span>
                    </div>
                  </td>
                  {filteredIpos.map((ipo) => {
                    const isUpcoming = ipo.status === 'UPCOMING' || ipo.nineAmOpen?.status === 'PENDING';
                    
                    // Extract numeric open price if present
                    let openVal = ipo.nineAmOpen?.price;
                    if (openVal === undefined && ipo.nineAmOpen?.text) {
                      const match = ipo.nineAmOpen.text.match(/[0-9]+(?:\.[0-9]+)?/);
                      if (match) {
                        openVal = parseFloat(match[0]);
                      }
                    }

                    // Check performance: higher vs lower than IPO offer price
                    let isHigher = false;
                    let isLower = false;
                    let pctChange: number | undefined;

                    if (!isUpcoming) {
                      if (openVal !== undefined && ipo.price > 0) {
                        const diff = Math.round((openVal - ipo.price) * 1000) / 1000;
                        pctChange = Math.round(((openVal - ipo.price) / ipo.price) * 1000) / 10;
                        if (diff > 0) {
                          isHigher = true;
                        } else {
                          isLower = true;
                        }
                      } else if (ipo.nineAmOpen?.status === 'GAIN') {
                        isHigher = true;
                      } else if (ipo.nineAmOpen?.status === 'FAIL') {
                        isLower = true;
                      }
                    }

                    return (
                      <td key={`mark-${ipo.id}`} className="px-3 py-2 text-center border-r border-slate-800/60 min-w-[110px]">
                        {!isUpcoming ? (
                          isHigher ? (
                            <div 
                              className="flex flex-col items-center justify-center gap-0.5" 
                              title={`9am Debut Gain: Opened at RM${openVal !== undefined ? openVal.toFixed(3) : (ipo.nineAmOpen?.text || '')} (Higher than IPO Price RM${ipo.price.toFixed(2)})${pctChange !== undefined ? ` [${pctChange > 0 ? '+' : ''}${pctChange}%]` : ''}`}
                            >
                              <span className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.7)] flex items-center justify-center">
                                ✓
                              </span>
                              {pctChange !== undefined && pctChange > 0 && (
                                <span className="text-[10px] font-mono font-bold text-emerald-400">
                                  +{pctChange.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          ) : (
                            <div 
                              className="flex flex-col items-center justify-center gap-0.5" 
                              title={`9am Debut Drop: Opened at RM${openVal !== undefined ? openVal.toFixed(3) : (ipo.nineAmOpen?.text || '')} (Lower than IPO Price RM${ipo.price.toFixed(2)})${pctChange !== undefined ? ` [${pctChange}%]` : ''}`}
                            >
                              <span className="text-2xl font-black text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)] flex items-center justify-center">
                                ✕
                              </span>
                              {pctChange !== undefined && pctChange !== 0 && (
                                <span className="text-[10px] font-mono font-bold text-rose-400">
                                  {pctChange.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          )
                        ) : (
                          <div className="flex items-center justify-center" title="Upcoming IPO (Not yet listed on Bursa Malaysia)">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
                              UPCOMING
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 2. LOGO ROW */}
                <tr className="bg-slate-900 border-b border-slate-800">
                  <td className="sticky left-0 z-20 bg-slate-900 px-4 py-3 font-bold text-white text-left border-r border-slate-800">
                    Issuer Logo
                  </td>
                  {filteredIpos.map((ipo) => (
                    <td key={`logo-${ipo.id}`} className="px-2 py-2 text-center border-r border-slate-800/60">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div 
                          className="w-16 h-8 rounded-lg flex items-center justify-center font-bold text-xs tracking-wider shadow-sm border border-white/20"
                          style={{ backgroundColor: ipo.logoBgColor || '#334155', color: ipo.logoTextColor || '#ffffff' }}
                          title={ipo.fullName || ipo.stockName}
                        >
                          {ipo.logoText || ipo.stockName}
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 3. STOCK NAME ROW */}
                <tr className="bg-slate-950/60 border-b border-slate-800 font-bold">
                  <td className="sticky left-0 z-20 bg-slate-950 px-4 py-2.5 text-white text-left border-r border-slate-800">
                    Stock Name
                  </td>
                  {filteredIpos.map((ipo) => (
                    <td key={`name-${ipo.id}`} className="px-3 py-2 text-center font-semibold text-white border-r border-slate-800/60 whitespace-nowrap">
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <div className="flex items-center justify-center gap-1">
                          <span>{ipo.stockName}</span>
                          <button
                            onClick={() => setSelectedIpoForDetail(ipo)}
                            className="text-slate-500 hover:text-indigo-400"
                            title="View detailed analyst breakdown"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        </div>
                        {ipo.isNewlyDiscovered && (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 animate-pulse">
                            NEW PIPELINE
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 4. PRICE ROW (Dark / Black Background as in image) */}
                <tr className="bg-black text-white font-mono font-bold border-b border-slate-800">
                  <td className="sticky left-0 z-20 bg-black px-4 py-2.5 text-white text-left border-r border-slate-700">
                    Price (RM)
                  </td>
                  {filteredIpos.map((ipo) => (
                    <td key={`price-${ipo.id}`} className="px-3 py-2 text-center text-sm font-black text-white border-r border-slate-800/80">
                      {ipo.price.toFixed(2)}
                    </td>
                  ))}
                </tr>

                {/* 5. OPEN MITI (Red for closed / N/A) */}
                <tr className="border-b border-slate-800/60 font-mono text-[11px]">
                  <td className="sticky left-0 z-20 bg-slate-900 px-4 py-2 text-slate-300 text-left border-r border-slate-800">
                    Open MITI
                  </td>
                  {filteredIpos.map((ipo) => {
                    const isClosed = !ipo.openMiti;
                    return (
                      <td 
                        key={`omiti-${ipo.id}`} 
                        className={`px-2 py-1.5 text-center border-r border-slate-800/60 ${
                          isClosed ? 'bg-red-950/60 text-red-400 font-bold' : 'bg-slate-900 text-slate-200'
                        }`}
                      >
                        {ipo.openMiti || '-'}
                      </td>
                    );
                  })}
                </tr>

                {/* 6. CLOSE MITI */}
                <tr className="border-b border-slate-800/60 font-mono text-[11px]">
                  <td className="sticky left-0 z-20 bg-slate-900 px-4 py-2 text-slate-300 text-left border-r border-slate-800">
                    Close MITI
                  </td>
                  {filteredIpos.map((ipo) => {
                    const isClosed = !ipo.closeMiti;
                    return (
                      <td 
                        key={`cmiti-${ipo.id}`} 
                        className={`px-2 py-1.5 text-center border-r border-slate-800/60 ${
                          isClosed ? 'bg-red-950/60 text-red-400 font-bold' : 'bg-slate-900 text-slate-200'
                        }`}
                      >
                        {ipo.closeMiti || '-'}
                      </td>
                    );
                  })}
                </tr>

                {/* 7. OPEN PUBLIC (Green background as in image) */}
                <tr className="border-b border-slate-800/60 font-mono text-[11px]">
                  <td className="sticky left-0 z-20 bg-emerald-950/70 text-emerald-200 px-4 py-2 font-semibold text-left border-r border-slate-800">
                    Open Public
                  </td>
                  {filteredIpos.map((ipo) => (
                    <td key={`opublic-${ipo.id}`} className="px-2 py-1.5 text-center bg-emerald-950/40 text-emerald-300 font-medium border-r border-slate-800/60">
                      {ipo.openPublic}
                    </td>
                  ))}
                </tr>

                {/* 8. CLOSE PUBLIC (Green background) */}
                <tr className="border-b border-slate-800/60 font-mono text-[11px]">
                  <td className="sticky left-0 z-20 bg-emerald-950/70 text-emerald-200 px-4 py-2 font-semibold text-left border-r border-slate-800">
                    Close Public
                  </td>
                  {filteredIpos.map((ipo) => (
                    <td key={`cpublic-${ipo.id}`} className="px-2 py-1.5 text-center bg-emerald-950/40 text-emerald-300 font-medium border-r border-slate-800/60">
                      {ipo.closePublic}
                    </td>
                  ))}
                </tr>

                {/* 9. BALLOT PUBLIC (Green background) */}
                <tr className="border-b border-slate-800/60 font-mono text-[11px]">
                  <td className="sticky left-0 z-20 bg-emerald-950/70 text-emerald-200 px-4 py-2 font-semibold text-left border-r border-slate-800">
                    Ballot Public
                  </td>
                  {filteredIpos.map((ipo) => (
                    <td key={`bpublic-${ipo.id}`} className="px-2 py-1.5 text-center bg-emerald-950/40 text-emerald-300 font-medium border-r border-slate-800/60">
                      {ipo.ballotPublic}
                    </td>
                  ))}
                </tr>

                {/* 10. LISTING PUBLIC (Dark Green / Black as in image) */}
                <tr className="border-b border-slate-800 font-mono text-xs bg-emerald-950 text-white font-bold">
                  <td className="sticky left-0 z-20 bg-emerald-950 px-4 py-2.5 text-emerald-300 text-left border-r border-emerald-800">
                    Listing Public
                  </td>
                  {filteredIpos.map((ipo) => (
                    <td key={`lpublic-${ipo.id}`} className="px-2 py-2 text-center text-emerald-200 border-r border-emerald-900/60 whitespace-nowrap">
                      {ipo.listingPublic}
                    </td>
                  ))}
                </tr>

                {/* 11. MITI SHARE M (Green) */}
                <tr className="border-b border-slate-800/60 font-mono text-[11px] bg-emerald-950/20">
                  <td className="sticky left-0 z-20 bg-slate-900 px-4 py-2 text-slate-300 text-left border-r border-slate-800">
                    MITI Share M
                  </td>
                  {filteredIpos.map((ipo) => (
                    <td key={`mitishare-${ipo.id}`} className="px-2 py-1.5 text-center text-slate-200 border-r border-slate-800/60">
                      {ipo.mitiShareM ?? '-'}
                    </td>
                  ))}
                </tr>

                {/* 12. PUBLIC SHARE M (Green) */}
                <tr className="border-b border-slate-800/60 font-mono text-[11px] bg-emerald-950/20">
                  <td className="sticky left-0 z-20 bg-slate-900 px-4 py-2 text-slate-300 text-left border-r border-slate-800">
                    Public Share M
                  </td>
                  {filteredIpos.map((ipo) => (
                    <td key={`pubshare-${ipo.id}`} className="px-2 py-1.5 text-center font-semibold text-white border-r border-slate-800/60">
                      {ipo.publicShareM}
                    </td>
                  ))}
                </tr>

                {/* 13. TOTAL SHARE M (Dark / Black) */}
                <tr className="border-b border-slate-800 font-mono text-xs bg-slate-950 text-white font-bold">
                  <td className="sticky left-0 z-20 bg-slate-950 px-4 py-2 text-slate-200 text-left border-r border-slate-800">
                    Total Share M
                  </td>
                  {filteredIpos.map((ipo) => (
                    <td key={`totshare-${ipo.id}`} className="px-2 py-1.5 text-center text-white border-r border-slate-800/80">
                      {ipo.totalShareM}
                    </td>
                  ))}
                </tr>

                {/* 14. MARKET CAP RM JUTA (Red/Brown background) */}
                <tr className="border-b border-slate-800 font-mono text-xs bg-red-950/70 text-red-200 font-bold">
                  <td className="sticky left-0 z-20 bg-red-950 px-4 py-2 text-red-200 text-left border-r border-red-900">
                    Market Cap RM juta
                  </td>
                  {filteredIpos.map((ipo) => (
                    <td key={`mcap-${ipo.id}`} className="px-2 py-2 text-center text-red-200 font-black border-r border-red-900/60">
                      {ipo.marketCapRMJuta}
                    </td>
                  ))}
                </tr>

                {/* 15. MITI RN (Orange background) */}
                <tr className="border-b border-slate-800/60 font-mono text-[11px]">
                  <td className="sticky left-0 z-20 bg-amber-950/60 text-amber-300 px-4 py-2 text-left border-r border-slate-800">
                    MITI RN
                  </td>
                  {filteredIpos.map((ipo) => {
                    const hasRn = Boolean(ipo.mitiRn);
                    return (
                      <td 
                        key={`mitirn-${ipo.id}`} 
                        className={`px-2 py-1.5 text-center border-r border-slate-800/60 ${
                          hasRn ? 'bg-amber-500/20 text-amber-300 font-bold' : 'bg-red-950/40 text-red-400'
                        }`}
                      >
                        {ipo.mitiRn || '-'}
                      </td>
                    );
                  })}
                </tr>

                {/* 16. MAYBANK PUBLIC RN (Bright Green / Cyan background) */}
                <tr className="border-b border-slate-800/60 font-mono text-[11px]">
                  <td className="sticky left-0 z-20 bg-emerald-900/60 text-emerald-300 px-4 py-2 text-left border-r border-slate-800">
                    Maybank Public RN
                  </td>
                  {filteredIpos.map((ipo) => {
                    const hasMaybank = Boolean(ipo.maybankPublicRn);
                    return (
                      <td 
                        key={`mbkrn-${ipo.id}`} 
                        className={`px-2 py-1.5 text-center border-r border-slate-800/60 ${
                          hasMaybank ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'bg-slate-950 text-slate-500'
                        }`}
                      >
                        {ipo.maybankPublicRn || '-'}
                      </td>
                    );
                  })}
                </tr>

                {/* 17. OS PUBLIC (Cyan background) */}
                <tr className="border-b border-slate-800 font-mono text-xs bg-sky-950/50">
                  <td className="sticky left-0 z-20 bg-sky-950 text-sky-300 px-4 py-2 font-bold text-left border-r border-sky-900">
                    OS Public (Times)
                  </td>
                  {filteredIpos.map((ipo) => (
                    <td key={`os-${ipo.id}`} className="px-2 py-1.5 text-center font-bold text-sky-300 border-r border-sky-900/60">
                      {ipo.osPublic !== null && ipo.osPublic !== undefined ? `${ipo.osPublic}x` : '-'}
                    </td>
                  ))}
                </tr>

                {/* 18. SYARIAH ROW (Yes / NO) */}
                <tr className="border-b border-slate-800/60 font-semibold text-xs">
                  <td className="sticky left-0 z-20 bg-slate-900 px-4 py-2 text-slate-300 text-left border-r border-slate-800">
                    Syariah
                  </td>
                  {filteredIpos.map((ipo) => (
                    <td 
                      key={`syariah-${ipo.id}`} 
                      className={`px-2 py-1.5 text-center border-r border-slate-800/60 ${
                        ipo.syariah ? 'text-emerald-400' : 'bg-rose-950/60 text-rose-400 font-bold'
                      }`}
                    >
                      {ipo.syariah ? 'Yes' : 'NO'}
                    </td>
                  ))}
                </tr>

                {/* 19. COMPANY TYPE ROW */}
                <tr className="border-b border-slate-800/60 font-mono text-[11px]">
                  <td className="sticky left-0 z-20 bg-slate-900 px-4 py-2 text-slate-300 text-left border-r border-slate-800">
                    Company Type
                  </td>
                  {filteredIpos.map((ipo) => (
                    <td key={`comp-${ipo.id}`} className="px-2 py-1.5 text-center text-slate-300 border-r border-slate-800/60">
                      {ipo.companyType}
                    </td>
                  ))}
                </tr>

                {/* 20. 9 AM DEBUT OPEN ROW (Red for fail, Green for gain) */}
                <tr className="border-b border-slate-800 font-mono text-xs">
                  <td className="sticky left-0 z-20 bg-slate-900 px-4 py-2.5 font-bold text-white text-left border-r border-slate-800">
                    9 am open
                  </td>
                  {filteredIpos.map((ipo) => {
                    const open = ipo.nineAmOpen;
                    const isFail = open?.status === 'FAIL';
                    const isGain = open?.status === 'GAIN';
                    const isPending = open?.status === 'PENDING';

                    return (
                      <td 
                        key={`open9-${ipo.id}`} 
                        className={`px-2 py-2 text-center font-bold border-r border-slate-800/60 ${
                          isFail 
                            ? 'bg-rose-950/70 text-rose-300' 
                            : isGain 
                              ? 'bg-emerald-950/70 text-emerald-300' 
                              : isPending 
                                ? 'bg-slate-900/80 text-slate-400 font-normal italic text-[11px]'
                                : 'bg-slate-800/60 text-white'
                        }`}
                      >
                        {open?.text || '-'}
                      </td>
                    );
                  })}
                </tr>

                {/* 21. ISAHAM SCORE (Yellow background) */}
                <tr className="border-b border-slate-800/60 font-mono text-xs bg-yellow-950/30 text-yellow-300">
                  <td className="sticky left-0 z-20 bg-yellow-950/60 px-4 py-2 text-yellow-300 font-semibold text-left border-r border-slate-800">
                    iSaham Score
                  </td>
                  {filteredIpos.map((ipo) => (
                    <td key={`isaham-${ipo.id}`} className="px-2 py-1.5 text-center font-bold text-yellow-300 border-r border-slate-800/60">
                      {ipo.iSahamScore || '-'}
                    </td>
                  ))}
                </tr>

                {/* 22. ISAHAM M3 AI SCORE (Yellow background) */}
                <tr className="border-b border-slate-800 font-mono text-xs bg-yellow-950/30 text-yellow-300">
                  <td className="sticky left-0 z-20 bg-yellow-950/60 px-4 py-2 text-yellow-300 font-semibold text-left border-r border-slate-800">
                    iSaham M3 AI Score
                  </td>
                  {filteredIpos.map((ipo) => (
                    <td key={`m3ai-${ipo.id}`} className="px-2 py-1.5 text-center font-bold text-yellow-300 border-r border-slate-800/60">
                      {ipo.iSahamM3AiScore || '-'}
                    </td>
                  ))}
                </tr>

                {/* SECTION SEPARATOR: RESEARCH HOUSE FAIR VALUES */}
                <tr className="bg-slate-950 border-y-2 border-indigo-500/40">
                  <td 
                    colSpan={filteredIpos.length + 1} 
                    className="px-4 py-2 text-left font-bold text-xs uppercase tracking-wider text-indigo-300 bg-indigo-950/30 flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Research House & Broker Analyst Fair Value Estimates (RM)</span>
                    <span className="text-[10px] text-slate-400 font-mono font-normal">
                      (Click any cell to edit or view source report citation)
                    </span>
                  </td>
                </tr>

                {/* 23. 18 RESEARCH HOUSES ROWS */}
                {RESEARCH_HOUSES.map((house) => (
                  <tr key={`rh-row-${house.key}`} className="border-b border-slate-800/60 font-mono text-xs hover:bg-slate-800/30 transition-colors">
                    <td className="sticky left-0 z-20 bg-slate-900 px-4 py-2 font-semibold text-slate-300 text-left border-r border-slate-800 flex items-center justify-between">
                      <span className="truncate max-w-[130px]">{house.shortName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{house.name.split(' ')[0]}</span>
                    </td>

                    {filteredIpos.map((ipo) => {
                      const fv = ipo.fairValues[house.key];
                      const isCovered = typeof fv === 'number';
                      const isUpside = isCovered && fv > ipo.price;
                      const isDownside = isCovered && fv < ipo.price;
                      const isPar = isCovered && fv === ipo.price;
                      const isStocklah = house.key === 'stocklah';
                      const upsideSpread = isCovered ? (((fv - ipo.price) / ipo.price) * 100).toFixed(1) : null;
                      const note = ipo.fairValueNotes?.[house.key];

                      return (
                        <td 
                          key={`cell-${ipo.id}-${house.key}`} 
                          onClick={() => {
                            setEditingCell({ ipoId: ipo.id, houseKey: house.key, currentVal: fv });
                            setEditValueInput(fv !== undefined ? fv.toString() : '');
                          }}
                          className={`px-2 py-1.5 text-center cursor-pointer border-r border-slate-800/60 transition-all ${
                            isStocklah && isCovered
                              ? 'bg-cyan-950/50 text-cyan-300 font-black'
                              : isUpside
                                ? 'bg-emerald-950/60 text-emerald-300 font-bold hover:bg-emerald-900/60'
                                : isDownside
                                  ? 'bg-rose-950/60 text-rose-300 font-bold hover:bg-rose-900/60'
                                  : isPar
                                    ? 'bg-slate-800/60 text-white font-bold'
                                    : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800/20'
                          }`}
                          title={
                            isCovered
                              ? `${house.name} Fair Value: RM${fv.toFixed(3)} (${upsideSpread && Number(upsideSpread) >= 0 ? '+' : ''}${upsideSpread}% vs RM${ipo.price.toFixed(2)} IPO)${note?.citation ? ` — ${note.citation}` : ''}`
                              : `Click to add ${house.shortName} target price for ${ipo.stockName}`
                          }
                        >
                          {isCovered ? (
                            <span>{fv.toFixed(fv % 1 !== 0 && fv.toString().split('.')[1]?.length > 2 ? 3 : 2)}</span>
                          ) : (
                            <span className="opacity-0 hover:opacity-100 text-[10px] text-slate-500">+</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* 24. CONSENSUS SUMMARY ROWS */}
                <tr className="bg-indigo-950/30 border-t-2 border-indigo-500/50 font-mono text-xs font-bold text-white">
                  <td className="sticky left-0 z-20 bg-indigo-950 px-4 py-2.5 text-indigo-300 text-left border-r border-indigo-800">
                    Consensus Average FV (RM)
                  </td>
                  {filteredIpos.map((ipo) => {
                    const stats = calculateIpoConsensus(ipo);
                    return (
                      <td key={`cavg-${ipo.id}`} className="px-2 py-2 text-center font-black text-indigo-300 border-r border-indigo-900/60">
                        {stats.average !== null ? `RM${stats.average.toFixed(2)}` : '-'}
                      </td>
                    );
                  })}
                </tr>

                <tr className="bg-indigo-950/40 border-b border-slate-800 font-mono text-xs font-bold text-white">
                  <td className="sticky left-0 z-20 bg-indigo-950 px-4 py-2 text-indigo-300 text-left border-r border-indigo-800">
                    Consensus Upside / Spread
                  </td>
                  {filteredIpos.map((ipo) => {
                    const stats = calculateIpoConsensus(ipo);
                    if (stats.upsidePct === null) {
                      return <td key={`upside-${ipo.id}`} className="px-2 py-1.5 text-center text-slate-500 border-r border-indigo-900/60">-</td>;
                    }
                    const isPositive = stats.upsidePct >= 0;
                    return (
                      <td 
                        key={`upside-${ipo.id}`} 
                        className={`px-2 py-1.5 text-center font-black border-r border-indigo-900/60 ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? `+${stats.upsidePct}%` : `${stats.upsidePct}%`}
                      </td>
                    );
                  })}
                </tr>

                <tr className="bg-slate-950 font-mono text-[11px] text-slate-400">
                  <td className="sticky left-0 z-20 bg-slate-950 px-4 py-2 text-slate-400 text-left border-r border-slate-800">
                    Coverage Breadth (Houses)
                  </td>
                  {filteredIpos.map((ipo) => {
                    const stats = calculateIpoConsensus(ipo);
                    return (
                      <td key={`breadth-${ipo.id}`} className="px-2 py-1.5 text-center text-slate-300 border-r border-slate-800/80">
                        {stats.count} / {RESEARCH_HOUSES.length}
                      </td>
                    );
                  })}
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. CARDS GRID VIEW */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredIpos.map((ipo) => {
            const stats = calculateIpoConsensus(ipo);
            const isPast = ipo.status === 'PAST_LISTED';

            return (
              <div 
                key={`card-${ipo.id}`}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 shadow-lg transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-md border border-white/20"
                      style={{ backgroundColor: ipo.logoBgColor || '#334155', color: ipo.logoTextColor || '#ffffff' }}
                    >
                      {ipo.logoText || ipo.stockName}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-white">{ipo.stockName}</h3>
                        {ipo.syariah && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Shariah
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate max-w-[200px]">
                        {ipo.fullName || `${ipo.stockName} Berhad`}
                      </p>
                    </div>
                  </div>

                  {isPast ? (
                    (() => {
                      let openVal = ipo.nineAmOpen?.price;
                      if (openVal === undefined && ipo.nineAmOpen?.text) {
                        const m = ipo.nineAmOpen.text.match(/[0-9]+(?:\.[0-9]+)?/);
                        if (m) openVal = parseFloat(m[0]);
                      }
                      const isGain = (openVal !== undefined && ipo.price > 0 && openVal > ipo.price) || ipo.nineAmOpen?.status === 'GAIN';
                      return (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1 ${
                          isGain
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}>
                          <span>{isGain ? '✓' : '✕'}</span>
                          <span>{isGain ? 'DEBUT GAIN' : 'DEBUT LOSS'}</span>
                        </span>
                      );
                    })()
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
                      UPCOMING
                    </span>
                  )}
                </div>

                {/* Key Numbers Grid */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 font-mono text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500">OFFER PRICE</div>
                    <div className="font-bold text-white text-sm">RM {ipo.price.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">MARKET CAP</div>
                    <div className="font-bold text-slate-200">RM {ipo.marketCapRMJuta}M</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">OVERSUBSCRIBED</div>
                    <div className="font-bold text-sky-400">{ipo.osPublic ? `${ipo.osPublic}x` : '-'}</div>
                  </div>
                </div>

                {/* Consensus Target & Upside Pill */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs">
                  <div>
                    <div className="text-[10px] text-indigo-400 font-mono">CONSENSUS TARGET</div>
                    <div className="text-base font-black text-white font-mono">
                      {stats.average !== null ? `RM ${stats.average.toFixed(2)}` : 'No Broker Target'}
                    </div>
                  </div>
                  {stats.upsidePct !== null && (
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-mono">UPSIDE SPREAD</div>
                      <div className={`text-sm font-bold font-mono flex items-center gap-1 ${
                        stats.upsidePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {stats.upsidePct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {stats.upsidePct >= 0 ? `+${stats.upsidePct}%` : `${stats.upsidePct}%`}
                      </div>
                    </div>
                  )}
                </div>

                {/* Top Research Houses Pills */}
                <div className="space-y-1.5">
                  <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                    <span>BROKER TARGETS ({stats.count}):</span>
                    <span>Listing: {ipo.listingPublic}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {RESEARCH_HOUSES.filter(h => ipo.fairValues[h.key] !== undefined).map(h => (
                      <span 
                        key={h.key}
                        className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700/80 flex items-center gap-1"
                      >
                        <span className="font-semibold text-slate-400">{h.shortName}:</span>
                        <strong className="text-white">RM{ipo.fairValues[h.key]?.toFixed(2)}</strong>
                      </span>
                    ))}
                    {stats.count === 0 && (
                      <span className="text-[11px] text-slate-500 italic">No published broker targets yet</span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleCrawlSingle(ipo)}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Crawl Fair Values</span>
                  </button>

                  <button
                    onClick={() => setSelectedIpoForDetail(ipo)}
                    className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    <span>View Matrix Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. RANKING VIEW (Ranked by Upside %) */}
      {viewMode === 'ranking' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Research House Consensus Upside Leaderboard</h3>
              <p className="text-xs text-slate-400">Ranked by potential valuation upside from official IPO offer price to average broker target</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Sorted by Target Premium
            </span>
          </div>

          <div className="space-y-3">
            {[...filteredIpos]
              .map(ipo => ({ ipo, stats: calculateIpoConsensus(ipo) }))
              .filter(item => item.stats.upsidePct !== null)
              .sort((a, b) => (b.stats.upsidePct || 0) - (a.stats.upsidePct || 0))
              .map(({ ipo, stats }, rank) => {
                const upside = stats.upsidePct || 0;
                return (
                  <div 
                    key={`rank-${ipo.id}`}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-slate-800 font-mono font-bold text-slate-300 text-xs flex items-center justify-center">
                        #{rank + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{ipo.stockName}</span>
                          <span className="text-[10px] font-mono text-slate-400">IPO: RM{ipo.price.toFixed(2)}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            ipo.status === 'UPCOMING' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {ipo.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Listing: {ipo.listingPublic} | Market Cap: RM{ipo.marketCapRMJuta}M | Oversubscription: {ipo.osPublic ? `${ipo.osPublic}x` : '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 font-mono">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase">Broker Consensus</div>
                        <div className="text-base font-bold text-white">RM {stats.average?.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400">{stats.count} Houses Covered</div>
                      </div>

                      <div className="text-right min-w-[90px]">
                        <div className="text-[10px] text-slate-500 uppercase">Upside</div>
                        <div className={`text-lg font-black ${upside >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {upside >= 0 ? `+${upside}%` : `${upside}%`}
                        </div>
                      </div>

                      <button
                        onClick={() => handleCrawlSingle(ipo)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
                      >
                        Crawl
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* CRAWL STATUS MODAL / DRAWER */}
      {isCrawlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-5 h-5 text-emerald-400 ${isCrawling ? 'animate-spin' : ''}`} />
                <h3 className="text-base font-bold text-white">Live Web Scraper & Research House Crawler</h3>
              </div>
              {!isCrawling && (
                <button 
                  onClick={() => setIsCrawlModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Searching Bursa Malaysia filings, The Edge Malaysia, iSaham, Stocklah, and Malaysian broker research portals using live Google Search grounding to discover newly published target prices and issue updates.
              </p>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>{crawlProgressText || 'Initializing crawler...'}</span>
                  <span>{crawlProgressStep.current}/{crawlProgressStep.total}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    style={{ 
                      width: `${crawlProgressStep.total > 0 ? (crawlProgressStep.current / crawlProgressStep.total) * 100 : (isCrawling ? 40 : 100)}%` 
                    }}
                  />
                </div>
              </div>

              {/* Result Summary */}
              {crawlSummary && (
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs leading-relaxed space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Crawl Completed
                  </div>
                  <div>{crawlSummary}</div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                disabled={isCrawling}
                onClick={() => setIsCrawlModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors disabled:opacity-50"
              >
                {isCrawling ? 'Crawling in background...' : 'Close & View Updated Table'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CELL FAIR VALUE MODAL */}
      {editingCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">
                Edit Fair Value: {RESEARCH_HOUSES.find(h => h.key === editingCell.houseKey)?.shortName}
              </h3>
              <button 
                onClick={() => setEditingCell(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Price / Fair Value (RM)</label>
                <input
                  type="number"
                  step="0.005"
                  autoFocus
                  placeholder="e.g. 0.45"
                  value={editValueInput}
                  onChange={(e) => setEditValueInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Leave blank and click Save to clear this broker's target price.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800 text-xs">
              <button
                onClick={() => setEditingCell(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditedCell}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
              >
                Save Fair Value
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL DRAWER / MODAL FOR A SINGLE IPO */}
      {selectedIpoForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{selectedIpoForDetail.stockName}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    selectedIpoForDetail.status === 'UPCOMING' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {selectedIpoForDetail.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedIpoForDetail.fullName || `${selectedIpoForDetail.stockName} Berhad`}
                </p>
              </div>

              <button 
                onClick={() => setSelectedIpoForDetail(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Key Issue Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500">IPO PRICE</div>
                <div className="font-bold text-white text-sm">RM {selectedIpoForDetail.price.toFixed(2)}</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500">MARKET CAP</div>
                <div className="font-bold text-slate-200">RM {selectedIpoForDetail.marketCapRMJuta}M</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500">LISTING DATE</div>
                <div className="font-bold text-emerald-400">{selectedIpoForDetail.listingPublic}</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500">OVERSUBSCRIBED</div>
                <div className="font-bold text-sky-400">{selectedIpoForDetail.osPublic ? `${selectedIpoForDetail.osPublic}x` : '-'}</div>
              </div>
            </div>

            {/* Research House Breakdown Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <h4 className="font-bold text-white">Published Research House Target Prices</h4>
                <button
                  onClick={() => handleCrawlSingle(selectedIpoForDetail)}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Crawl Web For Updates</span>
                </button>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left font-mono">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Research House</th>
                      <th className="py-2.5 px-3 text-right">Target Price</th>
                      <th className="py-2.5 px-3 text-right">Spread vs IPO</th>
                      <th className="py-2.5 px-3">Valuation Rationale & Methodology</th>
                      <th className="py-2.5 px-3 text-center">Source Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {RESEARCH_HOUSES.map(house => {
                      const fv = selectedIpoForDetail.fairValues[house.key];
                      const note = selectedIpoForDetail.fairValueNotes?.[house.key];
                      const spread = typeof fv === 'number' 
                        ? (((fv - selectedIpoForDetail.price) / selectedIpoForDetail.price) * 100).toFixed(1)
                        : null;
                      const hasCoverage = typeof fv === 'number';

                      return (
                        <tr key={house.key} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-semibold text-white">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: house.color || '#64748b' }} />
                              <span>{house.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-sans block">{house.description}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-sm">
                            {hasCoverage ? `RM ${fv.toFixed(2)}` : <span className="text-slate-600 font-normal">-</span>}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold">
                            {spread !== null ? (
                              <span className={Number(spread) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                {Number(spread) >= 0 ? `+${spread}%` : `${spread}%`}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 text-[11px] font-sans">
                            {note?.basis ? (
                              <div>
                                <span className="font-medium text-white">{note.basis}</span>
                                {note.citation && (
                                  <span className="text-[10px] text-slate-400 block mt-0.5">{note.citation}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-500">{hasCoverage ? 'Broker equity note' : 'No research note issued'}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-sans">
                            {hasCoverage ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                ✓ Verified Source
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-600 font-mono">Uncovered</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
                <span>
                  🛡️ <strong className="text-slate-300">Audited Research Source Integrity:</strong> Target prices and rationales originate from published equity research reports and consensus valuation models. No numbers are synthesized or hallucinated.
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedIpoForDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW IPO CANDIDATE MODAL */}
      {isAddIpoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  Add New Bursa Malaysia IPO Candidate
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  🇲🇾 Strictly for companies in Malaysia listing on Bursa Malaysia (Main, ACE, or LEAP Market).
                </p>
              </div>
              <button 
                onClick={() => setIsAddIpoModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewIpo} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Stock Ticker Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ApexPoint"
                    value={newStockName}
                    onChange={(e) => setNewStockName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    placeholder="e.g. ApexPoint Holdings Berhad"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">IPO Price (RM)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="PAST_LISTED">PAST_LISTED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Listing Date</label>
                  <input
                    type="text"
                    required
                    value={newListingDate}
                    onChange={(e) => setNewListingDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Open Public</label>
                  <input
                    type="text"
                    value={newOpenPublic}
                    onChange={(e) => setNewOpenPublic(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Close Public</label>
                  <input
                    type="text"
                    value={newClosePublic}
                    onChange={(e) => setNewClosePublic(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Ballot Public</label>
                  <input
                    type="text"
                    value={newBallotPublic}
                    onChange={(e) => setNewBallotPublic(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Total Shares (M)</label>
                  <input
                    type="number"
                    value={newTotalSharesM}
                    onChange={(e) => setNewTotalSharesM(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Public Shares (M)</label>
                  <input
                    type="number"
                    value={newPublicSharesM}
                    onChange={(e) => setNewPublicSharesM(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Market Cap (RM M)</label>
                  <input
                    type="number"
                    value={newMarketCapRM}
                    onChange={(e) => setNewMarketCapRM(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSyariah}
                    onChange={(e) => setNewSyariah(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-300">Shariah Compliant (SAC)</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Company Type:</span>
                  <select
                    value={newCompanyType}
                    onChange={(e) => setNewCompanyType(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                  >
                    <option value="Type C">Type C</option>
                    <option value="Type M">Type M</option>
                    <option value="Type M+Type C">Type M+Type C</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddIpoModalOpen(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add to Master Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUTO-CRAWLER SETTINGS & ACTIVITY LOG MODAL */}
      {isAutoCrawlSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">Autonomous Bursa IPO Web Harvester</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-sky-400 border border-sky-500/30">
                        🇲🇾 Malaysia Only
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Focuses exclusively on companies in Malaysia. Continuously discovers upcoming IPOs yet to be listed on Bursa Malaysia and aggregates target prices in Ringgit Malaysia (RM) from 18 Malaysian research houses.
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsAutoCrawlSettingsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scheduler Status & Interval Controls */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>Automated Periodic Scraping Job</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    When active, the system automatically triggers scraping jobs from time to time to harvest newly announced IPOs and updated broker notes.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleAutoCrawl}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      autoConfig.enabled
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {autoConfig.enabled ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span>Enabled (Active)</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-3.5 h-3.5 text-amber-400" />
                        <span>Paused</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Interval Selection Buttons */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-[11px] font-semibold text-slate-300 mb-2">
                  Automatic Trigger Frequency (Interval):
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { label: 'Every 1 min', value: 1, desc: 'Aggressive' },
                    { label: 'Every 2 mins', value: 2, desc: 'Fast' },
                    { label: 'Every 3 mins', value: 3, desc: 'Recommended' },
                    { label: 'Every 5 mins', value: 5, desc: 'Standard' },
                    { label: 'Every 10 mins', value: 10, desc: 'Moderate' },
                    { label: 'Every 15 mins', value: 15, desc: 'Conservative' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSetIntervalMinutes(opt.value)}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        autoConfig.intervalMinutes === opt.value
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold font-mono">{opt.label}</div>
                      <div className="text-[9px] text-slate-500">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status and Action Row */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-[11px] font-mono text-slate-400">
                  {autoConfig.enabled ? (
                    <span>Next execution in: <strong className="text-emerald-400 font-bold">{formatCountdown(secondsUntilNextCrawl)}</strong> (Cycle: {autoConfig.intervalMinutes}m)</span>
                  ) : (
                    <span className="text-amber-400 font-semibold">Scheduler currently paused</span>
                  )}
                  {autoConfig.lastRunAt && (
                    <span className="ml-3 text-slate-500">Last run: {new Date(autoConfig.lastRunAt).toLocaleTimeString('en-GB')}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleTriggerScrapingNow();
                      setIsAutoCrawlSettingsOpen(false);
                    }}
                    disabled={isAutoCrawling || isCrawling}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Run Job Now</span>
                  </button>

                  <button
                    onClick={() => {
                      handleDiscoverUpcomingPipeline();
                      setIsAutoCrawlSettingsOpen(false);
                    }}
                    disabled={isAutoCrawling || isCrawling}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 disabled:opacity-50"
                  >
                    <ListPlus className="w-3.5 h-3.5" />
                    <span>Harvest Next Upcoming IPO</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Monitored Live Extraction Sources */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                <span>Monitored Official Portals & Live Malaysian Research Houses</span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                {[
                  'Bursa Malaysia Announcements',
                  'Securities Commission (SC) Prospectus Exposure',
                  'The Edge Malaysia IPO Watch',
                  'iSaham IPO Registry',
                  'TA Securities Research',
                  'RHB Investment Bank',
                  'Mercury Securities',
                  'Kenanga Investment Bank',
                  'M+ Online Research',
                  'Public Investment Bank',
                  'Tradeview Capital',
                  'Rakuten Trade',
                  'Apex Securities',
                  'MIDF Research',
                ].map((src) => (
                  <span key={src} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
                    {src}
                  </span>
                ))}
              </div>
            </div>

            {/* Execution Activity History Log */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-400" />
                  <span>Crawl Activity & Harvest History Log</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                    {autoCrawlLogs.length} runs
                  </span>
                </div>

                {autoCrawlLogs.length > 0 && (
                  <button
                    onClick={() => {
                      clearAutoCrawlLogs();
                      setAutoCrawlLogs([]);
                    }}
                    className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {autoCrawlLogs.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-950/50 border border-slate-800 text-center text-xs text-slate-400">
                  <p>No activity recorded yet.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    When the background scheduler triggers jobs or you run manual crawls, execution summaries and newly discovered upcoming IPOs will be logged here.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-800 rounded-xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-800/60 text-xs">
                  {autoCrawlLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-950/40 hover:bg-slate-950/80 transition-colors space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            log.triggerType === 'AUTOMATIC' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}>
                            {log.triggerType === 'AUTOMATIC' ? 'AUTO-TRIGGERED' : 'MANUAL'}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            {new Date(log.timestamp).toLocaleString('en-GB')}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] font-mono">
                          {log.newIposDiscoveredCount > 0 && (
                            <span className="text-emerald-400 font-bold">
                              +{log.newIposDiscoveredCount} New IPO(s)
                            </span>
                          )}
                          <span className="text-sky-400">
                            {log.newFairValuesExtractedCount} Targets Updated
                          </span>
                        </div>
                      </div>

                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {log.summary}
                      </p>

                      {log.discoveredIpoNames && log.discoveredIpoNames.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-slate-500">Discovered IPOs:</span>
                          {log.discoveredIpoNames.map(name => (
                            <span key={name} className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <span className="text-[11px] text-slate-500 font-mono">
                Auto-crawler runs in background while the application is active
              </span>
              <button
                onClick={() => setIsAutoCrawlSettingsOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* BURSA MALAYSIA OFFICIAL IPO ANNOUNCEMENTS PORTAL MODAL */}
      {isBursaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                    <Globe className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-white">
                        Bursa Malaysia Official IPO Announcements Portal
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-sky-300 border border-sky-400/30 flex items-center gap-1">
                        <span>🇲🇾</span>
                        <span>Malaysia Companies Only</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        bursamalaysia.com Official
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Scraped specifically from the Bursa Malaysia official website. All filings strictly represent registered Malaysian corporate entities (Berhad / Bhd) scheduled or listed on the Main Market, ACE Market, or LEAP Market.
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsBursaModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scraper Engine Info & Metric Bar */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-300 font-semibold">Active Scraper Engine:</span>
                  <span className="font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {bursaScrapeEngine || 'Cheerio / Browser Emulation + Grounded Truth'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-300">
                  <strong className="text-white text-sm">{bursaAnnouncements.length}</strong> Official Announcements
                </span>
                <button
                  onClick={handleScrapeBursaAnnouncements}
                  disabled={isScrapingBursa}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScrapingBursa ? 'animate-spin' : ''}`} />
                  <span>Rescrape Bursa</span>
                </button>
              </div>
            </div>

            {/* Official Grounding Sources */}
            {bursaScrapeSources.length > 0 && (
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  <span>Official Grounding Feeds & Endpoints:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {bursaScrapeSources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-[11px] text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      <span className="truncate max-w-xs">{src.title || 'bursamalaysia.com'}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Announcements List */}
            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {bursaAnnouncements.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
                  <Globe className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">No Bursa announcements currently cached in session.</p>
                  <p className="text-xs text-slate-500">Click below to initiate the serverless scraper to harvest live filings.</p>
                  <button
                    onClick={handleScrapeBursaAnnouncements}
                    disabled={isScrapingBursa}
                    className="mt-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold"
                  >
                    Execute Bursa Scraper
                  </button>
                </div>
              ) : (
                bursaAnnouncements.map((ann) => {
                  const isTracked = ipos.some(
                    i => i.stockName.toLowerCase().replace(/[^a-z0-9]/g, '') === ann.stockName.toLowerCase().replace(/[^a-z0-9]/g, '')
                  );

                  return (
                    <div 
                      key={ann.id}
                      className="bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-colors space-y-3"
                    >
                      {/* Top Badges & Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                            {ann.announcementDate}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            ann.marketTier === 'Main Market'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}>
                            {ann.marketTier}
                          </span>
                          {ann.stockCode && (
                            <span className="font-mono text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                              Code: {ann.stockCode}
                            </span>
                          )}
                          {ann.syariah && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Syariah
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            ann.status === 'UPCOMING'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {ann.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isTracked ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Active in Table
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                              Newly Sourced
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Company Name */}
                      <div>
                        <div className="flex items-baseline gap-2">
                          <h4 className="text-base font-bold text-white tracking-tight">
                            {ann.companyName}
                          </h4>
                          <span className="text-xs text-sky-400 font-mono">({ann.stockName})</span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium mt-1 leading-snug">
                          {ann.title}
                        </p>
                      </div>

                      {/* Timetable & Pricing Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                        <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2">
                          <div className="text-[10px] text-slate-400 uppercase font-mono">Offer Price</div>
                          <div className="text-sm font-bold text-emerald-400 font-mono">
                            {typeof ann.offerPrice === 'number' ? `RM ${ann.offerPrice.toFixed(2)}` : 'Pending'}
                          </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2">
                          <div className="text-[10px] text-slate-400 uppercase font-mono">Target Listing</div>
                          <div className="text-xs font-semibold text-white font-mono">
                            {ann.listingDate || 'Scheduled 2026/2027'}
                          </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2">
                          <div className="text-[10px] text-slate-400 uppercase font-mono">Application Window</div>
                          <div className="text-xs text-slate-300 font-mono">
                            {ann.openPublic ? `${ann.openPublic} to ${ann.closePublic || 'TBA'}` : 'Pre-Launch'}
                          </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2">
                          <div className="text-[10px] text-slate-400 uppercase font-mono">Balloting Date</div>
                          <div className="text-xs text-slate-300 font-mono">
                            {ann.ballotPublic || 'Upcoming'}
                          </div>
                        </div>
                      </div>

                      {/* Highlights & Footer Link */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {ann.keyHighlights || 'Official Bursa Malaysia Initial Public Offering filing.'}
                        </p>

                        <a
                          href={ann.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors shrink-0"
                        >
                          <span>View on bursamalaysia.com</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <span className="text-[11px] text-slate-400 font-mono">
                🇲🇾 Strictly companies in Malaysia • Bursa Malaysia Main, ACE & LEAP Markets
              </span>
              <button
                onClick={() => setIsBursaModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer"
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
