
import React, { useState, useCallback, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, ArrowDown, ArrowUp, Wifi, Zap, History, RefreshCcw, Info, Globe, Smartphone, Map as MapIcon } from 'lucide-react';
import { SpeedResult, WifiResult, TestPhase, AIAnalysis, AppView, MapMarker } from './types';
import { measurePing, measureDownload, measureUpload, measureWifiLink } from './services/speedTest';
import { analyzeResults, analyzeCoverage } from './services/geminiService';
import SpeedGauge from './components/SpeedGauge';
import MetricCard from './components/MetricCard';
import AIInsights from './components/AIInsights';
import CoverageMap from './components/CoverageMap';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('internet');
  const [phase, setPhase] = useState<TestPhase>('idle');
  
  // States for Internet Result
  const [currentResult, setCurrentResult] = useState<SpeedResult>({
    download: 0,
    upload: 0,
    ping: 0,
    jitter: 0,
    timestamp: Date.now()
  });

  // States for WiFi Result
  const [currentWifi, setCurrentWifi] = useState<WifiResult>({
    linkSpeed: 0,
    signalStrength: 0,
    channel: 0,
    localLatency: 0,
    timestamp: Date.now()
  });

  // States for Coverage
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [coverageData, setCoverageData] = useState<{ explanation: string; markers: MapMarker[] }>({
    explanation: "",
    markers: []
  });

  const [history, setHistory] = useState<SpeedResult[]>([]);
  const [liveData, setLiveData] = useState<{ time: number; speed: number }[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem('speed_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Get user location for coverage map
  useEffect(() => {
    if (view === 'coverage' && !userPos) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserPos(coords);
          analyzeCoverage(coords.lat, coords.lng).then(setCoverageData);
        },
        (err) => console.warn("Geolocation failed", err)
      );
    }
  }, [view, userPos]);

  const saveToHistory = useCallback((res: SpeedResult) => {
    const updated = [res, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('speed_history', JSON.stringify(updated));
  }, [history]);

  const startInternetTest = async () => {
    setPhase('ping');
    setLiveData([]);
    setAnalysis(null);
    const result: SpeedResult = { download: 0, upload: 0, ping: 0, jitter: 0, timestamp: Date.now() };

    const pData = await measurePing();
    result.ping = pData.ping;
    result.jitter = pData.jitter;
    setCurrentResult({ ...result });

    setPhase('download');
    const dlSpeed = await measureDownload((speed) => {
      setCurrentResult(prev => ({ ...prev, download: speed }));
      setLiveData(prev => [...prev, { time: Date.now(), speed }].slice(-30));
    });
    result.download = dlSpeed;

    setPhase('upload');
    setLiveData([]); 
    const ulSpeed = await measureUpload((speed) => {
      setCurrentResult(prev => ({ ...prev, upload: speed }));
      setLiveData(prev => [...prev, { time: Date.now(), speed }].slice(-30));
    });
    result.upload = ulSpeed;

    setPhase('complete');
    saveToHistory(result);

    setIsAnalyzing(true);
    const aiRes = await analyzeResults(result, 'internet');
    setAnalysis(aiRes);
    setIsAnalyzing(false);
  };

  const startWifiTest = async () => {
    setPhase('measuring-wifi');
    setAnalysis(null);
    setLiveData([]);

    const res = await measureWifiLink((val) => {
      setCurrentWifi(prev => ({ ...prev, linkSpeed: val }));
      setLiveData(prev => [...prev, { time: Date.now(), speed: val }].slice(-30));
    });

    setCurrentWifi(res);
    setPhase('complete');

    setIsAnalyzing(true);
    const aiRes = await analyzeResults(res, 'wifi');
    setAnalysis(aiRes);
    setIsAnalyzing(false);
  };

  const handleTestClick = () => {
    if (view === 'internet') {
      startInternetTest();
    } else {
      startWifiTest();
    }
  };

  return (
    <div className="min-h-screen pb-20 selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass px-6 py-4 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="text-white w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">SWIFTSENSE</span>
        </div>
        
        {/* Toggle Controls */}
        <div className="hidden lg:flex bg-slate-800 p-1 rounded-2xl border border-slate-700">
          <button 
            onClick={() => setView('internet')}
            className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${view === 'internet' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Globe className="w-4 h-4" /> Internet
          </button>
          <button 
            onClick={() => setView('wifi')}
            className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${view === 'wifi' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Smartphone className="w-4 h-4" /> WiFi System
          </button>
          <button 
            onClick={() => setView('coverage')}
            className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${view === 'coverage' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <MapIcon className="w-4 h-4" /> Coverage Map
          </button>
        </div>

        <div className="flex gap-4 items-center">
            <button className="text-slate-400 hover:text-white transition-colors p-2">
                <History className="w-5 h-5" />
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold border border-slate-700">
                Help
            </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 pt-12">
        {/* Mobile/Tablet View Toggler */}
        <div className="lg:hidden flex bg-slate-800 p-1 rounded-2xl border border-slate-700 mb-8 overflow-x-auto no-scrollbar">
            <button onClick={() => setView('internet')} className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex justify-center items-center gap-2 whitespace-nowrap ${view === 'internet' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
                <Globe className="w-4 h-4" /> Internet
            </button>
            <button onClick={() => setView('wifi')} className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex justify-center items-center gap-2 whitespace-nowrap ${view === 'wifi' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}>
                <Smartphone className="w-4 h-4" /> WiFi
            </button>
            <button onClick={() => setView('coverage')} className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex justify-center items-center gap-2 whitespace-nowrap ${view === 'coverage' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400'}`}>
                <MapIcon className="w-4 h-4" /> Map
            </button>
        </div>

        {view === 'coverage' ? (
          <CoverageMap 
            userPos={userPos} 
            markers={coverageData.markers} 
            explanation={coverageData.explanation} 
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Gauge & Primary Controls */}
            <div className="lg:col-span-8 space-y-8">
              <div className="glass p-10 rounded-[40px] flex flex-col items-center">
                <SpeedGauge 
                  value={view === 'internet' ? (phase === 'upload' ? currentResult.upload : currentResult.download) : currentWifi.linkSpeed} 
                  label={view === 'internet' ? (phase === 'upload' ? 'Upload' : 'Download') : 'Link Capacity'}
                  unit="Mbps"
                  isActive={phase !== 'idle' && phase !== 'complete'}
                  colorClass={view === 'wifi' ? 'stroke-emerald-500 shadow-emerald-500' : (phase === 'upload' ? 'stroke-purple-500 shadow-purple-500' : 'stroke-indigo-500 shadow-indigo-500')}
                />
                
                <div className="mt-12 w-full grid grid-cols-2 md:grid-cols-4 gap-4">
                  {view === 'internet' ? (
                      <>
                          <MetricCard icon={<ArrowDown className="w-5 h-5" />} label="Download" value={currentResult.download.toFixed(1)} unit="Mbps" />
                          <MetricCard icon={<ArrowUp className="w-5 h-5" />} label="Upload" value={currentResult.upload.toFixed(1)} unit="Mbps" />
                          <MetricCard icon={<Activity className="w-5 h-5" />} label="Ping" value={currentResult.ping} unit="ms" />
                          <MetricCard icon={<Wifi className="w-5 h-5" />} label="Jitter" value={currentResult.jitter} unit="ms" />
                      </>
                  ) : (
                      <>
                          <MetricCard icon={<Wifi className="w-5 h-5" />} label="Signal" value={currentWifi.signalStrength} unit="dBm" />
                          <MetricCard icon={<Activity className="w-5 h-5" />} label="Local Latency" value={currentWifi.localLatency} unit="ms" />
                          <MetricCard icon={<Zap className="w-5 h-5" />} label="Channel" value={currentWifi.channel} unit="Auto" />
                          <MetricCard icon={<Smartphone className="w-5 h-5" />} label="Link Cap" value={currentWifi.linkSpeed} unit="Mbps" />
                      </>
                  )}
                </div>

                <div className="mt-10">
                  <button
                    onClick={handleTestClick}
                    disabled={phase !== 'idle' && phase !== 'complete'}
                    className={`group relative px-12 py-5 rounded-full font-black text-xl transition-all duration-300 ${
                      phase === 'idle' || phase === 'complete' 
                      ? (view === 'internet' 
                          ? 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_50px_rgba(79,70,229,0.3)]' 
                          : 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)]')
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    } text-white hover:scale-105 active:scale-95`}
                  >
                    <span className="flex items-center gap-3">
                      {phase === 'idle' || phase === 'complete' ? <RefreshCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" /> : <div className="w-6 h-6 border-4 border-slate-600 border-t-white rounded-full animate-spin" />}
                      {phase === 'idle' || phase === 'complete' ? `TEST ${view.toUpperCase()}` : phase.replace('-', ' ').toUpperCase()}
                    </span>
                  </button>
                </div>
              </div>

              <AIInsights analysis={analysis} isLoading={isAnalyzing} />
            </div>

            {/* Right Column: Information & Spectrum */}
            <div className="lg:col-span-4 space-y-8">
              <div className="glass p-8 rounded-[40px] h-64 relative overflow-hidden">
                  <div className="absolute top-6 left-8 flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Real-time Spectrum</span>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={liveData}>
                      <defs>
                        <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={view === 'wifi' ? "#10b981" : "#6366f1"} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={view === 'wifi' ? "#10b981" : "#6366f1"} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                      <Area 
                        type="monotone" 
                        dataKey="speed" 
                        stroke={view === 'wifi' ? "#10b981" : "#6366f1"} 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorSpeed)" 
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

              <div className="glass p-8 rounded-[40px]">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Info className="w-5 h-5 text-indigo-400" />
                  System Details
                </h3>
                
                <div className="space-y-4">
                   <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                      <div className="text-xs font-bold text-slate-500 uppercase mb-2">Protocol</div>
                      <div className="text-sm font-semibold text-slate-200">WiFi 6 (802.11ax) Estimated</div>
                   </div>
                   <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                      <div className="text-xs font-bold text-slate-500 uppercase mb-2">Network Security</div>
                      <div className="text-sm font-semibold text-slate-200">WPA3 Personal (Estimated)</div>
                   </div>
                   <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                      <div className="text-xs font-bold text-slate-500 uppercase mb-2">Frequency Band</div>
                      <div className="text-sm font-semibold text-slate-200">5.0 GHz / 160 MHz Channel</div>
                   </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-700">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Diagnostic Log</h4>
                  <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                          <span className="text-slate-400">DNS Resolver</span>
                          <span className="text-slate-200">Google (8.8.8.8)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Local Gateway</span>
                          <span className="text-slate-200">192.168.1.1</span>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="glass px-6 py-3 rounded-2xl flex items-center gap-6 shadow-2xl border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${phase === 'complete' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-xs font-bold text-slate-300 uppercase">
                {phase === 'complete' ? 'Analysis Ready' : 'System Ready'}
            </span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <div className="text-xs font-medium text-slate-400">
            {view.toUpperCase()} MODE
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
