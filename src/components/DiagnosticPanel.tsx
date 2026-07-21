import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore, DiagnosticLog } from '../store/index';
import { 
  X, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Info, 
  Cpu, 
  RefreshCw, 
  Globe, 
  SlidersHorizontal,
  HelpCircle
} from 'lucide-react';

interface DiagnosticPanelProps {
  onClose: () => void;
}

export function DiagnosticPanel({ onClose }: DiagnosticPanelProps) {
  const { diagnosticLogs, clearDiagnosticLogs } = useStore();
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'logs' | 'troubleshoot'>('logs');

  const filteredLogs = diagnosticLogs.filter(log => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'success' && log.status && log.status >= 200 && log.status < 300) ||
      (filter === 'failed' && (!log.status || log.status >= 400 || log.errorMessage));
    
    const matchesSearch = 
      log.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.errorMessage && log.errorMessage.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const handleCopyLog = (log: DiagnosticLog, id: string) => {
    const formatted = JSON.stringify(log, null, 2);
    navigator.clipboard.writeText(formatted);
    setCopiedLogId(id);
    setTimeout(() => setCopiedLogId(null), 2000);
  };

  const toggleExpand = (id: string) => {
    if (expandedLogId === id) {
      setExpandedLogId(null);
    } else {
      setExpandedLogId(id);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-x-0 top-0 max-h-[85%] bg-slate-950/95 backdrop-blur-2xl border-b border-indigo-500/20 shadow-2xl flex flex-col z-50 rounded-b-3xl overflow-hidden font-sans"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-slate-100 uppercase">System Diagnostics & Telemetry</h2>
            <p className="text-[10px] text-slate-400 font-mono">Real-time LLM Gateway Connection Logs</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(activeTab === 'logs' ? 'troubleshoot' : 'logs')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800/40 hover:bg-slate-800 text-xs text-slate-300 font-medium transition-colors"
          >
            {activeTab === 'logs' ? (
              <>
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                Troubleshoot
              </>
            ) : (
              <>
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                Connection Logs
              </>
            )}
          </button>
          
          {diagnosticLogs.length > 0 && activeTab === 'logs' && (
            <button
              onClick={clearDiagnosticLogs}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors border border-transparent hover:border-red-500/20"
              title="Clear all logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activeTab === 'logs' ? (
        <>
          {/* Filters Bar */}
          <div className="px-5 py-3 border-b border-white/5 bg-slate-900/20 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/5 w-full sm:w-auto">
              {(['all', 'success', 'failed'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all ${
                    filter === type
                      ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 shadow-sm'
                      : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          {/* Logs List Container */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2 min-h-[180px] max-h-[380px] scrollbar-thin">
            {filteredLogs.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Info className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-slate-400 text-xs font-mono">No telemetry records found matching filters.</p>
                <p className="text-slate-500 text-[10px] mt-1">Make an API request to generate connection telemetry.</p>
              </div>
            ) : (
              filteredLogs.map((log, index) => {
                const logId = `${log.timestamp}-${index}`;
                const isExpanded = expandedLogId === logId;
                const isSuccess = log.status && log.status >= 200 && log.status < 300;
                
                return (
                  <div 
                    key={logId} 
                    className={`border rounded-xl overflow-hidden transition-colors ${
                      isExpanded 
                        ? 'bg-slate-900/60 border-indigo-500/30 shadow-indigo-950/20' 
                        : isSuccess
                          ? 'bg-slate-900/20 border-white/5 hover:bg-slate-900/40 hover:border-white/10'
                          : 'bg-red-500/5 border-red-500/10 hover:bg-red-500/10 hover:border-red-500/25'
                    }`}
                  >
                    {/* Log Row Header */}
                    <div 
                      onClick={() => toggleExpand(logId)}
                      className="px-4 py-3 flex items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3 truncate min-w-0 flex-1">
                        {/* Status Icon */}
                        {isSuccess ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        )}

                        <div className="truncate flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold font-mono text-indigo-300 tracking-wider shrink-0 uppercase">
                            {log.provider}
                          </span>
                          <span className="text-xs font-mono text-slate-300 truncate font-medium">
                            {log.endpoint}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-slate-400 text-[10px] font-mono">
                        <span>{log.timestamp}</span>
                        {log.status ? (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isSuccess ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {log.status} {log.statusText}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 font-bold">
                            ERR
                          </span>
                        )}
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    {/* Expandable Details Panel */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-white/5 bg-slate-950/40 font-mono text-xs text-slate-300 space-y-3">
                        {log.errorMessage && (
                          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl space-y-1">
                            <div className="flex items-center gap-1 text-red-400 font-semibold text-xs">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>CONNECTION FAILURE REPORT</span>
                            </div>
                            <p className="text-[11px] leading-relaxed break-all whitespace-pre-wrap">
                              {log.errorMessage}
                            </p>
                          </div>
                        )}

                        {/* Split views */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Request side */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Outbound Headers</span>
                              <button 
                                onClick={() => handleCopyLog(log, logId)}
                                className="text-slate-500 hover:text-slate-300 p-1"
                                title="Copy full telemetry JSON"
                              >
                                {copiedLogId === logId ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                            <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg max-h-[120px] overflow-y-auto text-[10px] leading-relaxed scrollbar-thin">
                              {Object.entries(log.headers).map(([k, v]) => (
                                <div key={k} className="flex gap-2">
                                  <span className="text-indigo-400 shrink-0 font-semibold">{k}:</span>
                                  <span className="text-slate-300 break-all">{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Response Headers side */}
                          <div className="space-y-2">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Inbound Response Headers</span>
                            <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg max-h-[120px] overflow-y-auto text-[10px] leading-relaxed scrollbar-thin">
                              {log.responseHeaders && Object.keys(log.responseHeaders).length > 0 ? (
                                Object.entries(log.responseHeaders).map(([k, v]) => (
                                  <div key={k} className="flex gap-2">
                                    <span className="text-emerald-400 shrink-0 font-semibold">{k}:</span>
                                    <span className="text-slate-300 break-all">{v}</span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-slate-500 italic">No response headers recorded</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Payload Info */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Payload Summary</span>
                          <div className="p-2 bg-black/30 border border-white/5 rounded-lg flex flex-wrap gap-x-4 gap-y-1 text-[10px]">
                            <div><span className="text-slate-500">model:</span> <span className="text-slate-300">{log.payload?.model}</span></div>
                            <div><span className="text-slate-500">stream:</span> <span className="text-slate-300">true</span></div>
                            <div><span className="text-slate-500">messages:</span> <span className="text-slate-300">{log.payload?.messagesCount}</span></div>
                          </div>
                        </div>

                        {/* Dynamic Quick Troubleshooter helper */}
                        <div className="pt-2">
                          <TroubleshootTip log={log} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* Troubleshoot Tab */
        <div className="p-5 overflow-y-auto max-h-[420px] space-y-4 scrollbar-thin font-mono text-xs">
          <div className="flex items-center gap-2 text-indigo-400 font-bold border-b border-indigo-500/20 pb-2">
            <Cpu className="w-4 h-4" />
            <span>EXTERNAL BASE URL TROUBLESHOOTING GUIDE</span>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
              <h4 className="text-slate-200 font-bold mb-1 text-xs uppercase text-indigo-300">1. CORS / Mixed Content Block (Direct Fetch vs Proxy)</h4>
              <p className="text-slate-400 leading-relaxed text-[11px] mb-2">
                Browsers enforce strict CORS policies. If you connect to external providers like <span className="text-indigo-400">DeepSeek</span> or <span className="text-indigo-400">OpenRouter</span> directly, the browser might block the call.
              </p>
              <div className="p-2 bg-black/40 rounded border border-white/5 text-slate-400 text-[10px]">
                <strong className="text-indigo-300">Solution:</strong> We automatically proxy remote base URLs through our Express server backend via <code className="text-slate-200 bg-white/5 px-1 py-0.5 rounded">/api/chat-proxy</code> to bypass CORS. Make sure the backend server remains active.
              </div>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
              <h4 className="text-slate-200 font-bold mb-1 text-xs uppercase text-indigo-300">2. Localhost & 127.0.0.1 Connections</h4>
              <p className="text-slate-400 leading-relaxed text-[11px] mb-2">
                If you are running a local model server (Ollama, LM Studio) on your own machine:
              </p>
              <div className="p-2 bg-black/40 rounded border border-white/5 text-slate-400 text-[10px] space-y-1">
                <div>• <strong className="text-emerald-400">Direct Connection:</strong> We bypass the proxy for local URLs containing <code className="text-slate-200 bg-white/5 px-1 rounded">localhost</code> or <code className="text-slate-200 bg-white/5 px-1 rounded">127.0.0.1</code>, because the cloud server cannot access your private network.</div>
                <div>• <strong className="text-rose-400">Ollama Setup:</strong> Make sure to set environment variables on your terminal to allow requests from any source:</div>
                <code className="block bg-slate-950 p-1.5 rounded mt-1.5 text-slate-300 select-all">OLLAMA_ORIGINS="*" ollama serve</code>
              </div>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
              <h4 className="text-slate-200 font-bold mb-1 text-xs uppercase text-indigo-300">3. Custom Provider Endpoints</h4>
              <p className="text-slate-400 leading-relaxed text-[11px] mb-2">
                Custom base URLs usually require standard route suffixes:
              </p>
              <div className="p-2 bg-black/40 rounded border border-white/5 text-slate-400 text-[10px]">
                We automatically append <code className="text-slate-200">/chat/completions</code> to your custom endpoint if it's missing. Verify if your server requires a different suffix or exactly matches the route format.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/5 bg-slate-900/40 text-[10px] text-slate-500 font-mono flex justify-between items-center">
        <span>DevAgent Diagnostics Engine v1.0.0</span>
        <span className="flex items-center gap-1">
          <Globe className="w-3 h-3 text-slate-400" />
          Active Proxy Tunnel Enabled
        </span>
      </div>
    </motion.div>
  );
}

function TroubleshootTip({ log }: { log: DiagnosticLog }) {
  if (log.status && log.status >= 200 && log.status < 300) {
    return (
      <div className="flex items-start gap-1.5 p-2 bg-emerald-500/5 border border-emerald-500/15 text-emerald-400/90 rounded-lg text-[10px]">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
        <span>This connection succeeded! The API credentials and endpoint format are verified and functioning correctly.</span>
      </div>
    );
  }

  let title = "Possible Connection Issue Detected";
  let description = "Check your configuration.";

  if (log.errorMessage && log.errorMessage.includes('Failed to fetch')) {
    title = "CORS or Network Block (TypeError: Failed to fetch)";
    description = "The client failed to make the fetch request. This is usually caused by an invalid/inactive server URL, or a CORS block on a direct non-proxied localhost request. Ensure Ollama/LM Studio is running and has CORS origins set to '*' or allowed.";
  } else if (log.status === 401) {
    title = "401 Unauthorized (Invalid API Key)";
    description = "The provider rejected the API Key. Check that you pasted the correct key for this provider and didn't leave any extra spaces or quotes.";
  } else if (log.status === 404) {
    title = "404 Not Found (Endpoint Route Misalignment)";
    description = "The model or chat endpoint path does not exist on the target server. Ensure you have typed the base URL correctly and selected a model that actually exists on that provider.";
  } else if (log.status === 403) {
    title = "403 Forbidden (Origin or Rate Limit)";
    description = "The server rejected the request. This can be caused by Cloudflare blocks, insufficient credit balances, or regional access constraints.";
  } else if (log.status === 429) {
    title = "429 Too Many Requests (Rate Limiting)";
    description = "Your API Key is being rate-limited. Please wait a bit before resending, or switch to a different provider.";
  } else if (log.errorMessage) {
    title = "Server Failure/Invalid Response";
    description = log.errorMessage;
  }

  return (
    <div className="flex items-start gap-1.5 p-2.5 bg-indigo-500/5 border border-indigo-500/15 text-indigo-300 rounded-lg text-[10px] leading-normal">
      <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
      <div>
        <strong className="text-indigo-200 block mb-0.5 font-bold">{title}</strong>
        <span>{description}</span>
      </div>
    </div>
  );
}
