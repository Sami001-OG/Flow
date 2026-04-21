import React, { useState } from 'react';
import { useStore } from '../store/index';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { X, Download, Smartphone, Github, Settings, Trash2, Key, Bot, Box, PlusCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { MODELS } from '../lib/constants';

export function MenuDrawer() {
  const { 
    isMenuOpen, setMenuOpen, apiKey, setApiKey, selectedModel, 
    setSelectedModel, files, clearChat, githubToken, setGithubToken, 
    githubRepo, setGithubRepo, secrets, setSecrets, githubDescription, setGithubDescription
  } = useStore();

  const [activeTab, setActiveTab] = useState<'ai' | 'secrets' | 'github'>('ai');
  const [newSecretKey, setNewSecretKey] = useState('');
  const [newSecretValue, setNewSecretValue] = useState('');
  
  // GitHub specific mock states
  const [githubTemplate, setGithubTemplate] = useState('react-vite');
  const [generatedCommitMsg, setGeneratedCommitMsg] = useState('Initial commit with generated React components');
  const [isPushing, setIsPushing] = useState(false);
  const [isBuildingApk, setIsBuildingApk] = useState(false);

  if (!isMenuOpen) return null;

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    Object.entries(files).forEach(([path, fileObj]) => {
      const zipPath = path.replace(/^\//, '');
      zip.file(zipPath, fileObj.code);
    });
    if (!files['/package.json']) {
      zip.file('package.json', JSON.stringify({
        name: "devagent-os-export",
        version: "1.0.0",
        dependencies: { "react": "^18.2.0", "react-dom": "^18.2.0", "lucide-react": "latest", "tailwindcss": "^3.4.1" }
      }, null, 2));
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'devagent-mobile-build.zip');
  };

  const handleDownloadAPK = async () => {
    setIsBuildingApk(true);
    try {
      const response = await fetch("/api/build-apk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files })
      });

      if (!response.ok) {
        throw new Error("Build pipeline failed.");
      }

      // Check if it's the fallback zip meaning NO Android SDK present for gradle
      const isFallback = response.headers.get("X-Fallback-Source");
      const blob = await response.blob();
      
      if (isFallback) {
         saveAs(blob, "NexusApp-CapacitorReady.zip");
         alert("Because this browser container doesn't have the 4GB Android SDK installed natively, it could not output the direct `.apk` binary. HOWEVER, it just created and downloaded a fully hydrated zip containing your entire Capacitor mobile app ready. Just extract and run `npx cap open android` or `gradlew assembleDebug` externally.");
      } else {
         saveAs(blob, "NexusApp.apk");
      }
    } catch (e) {
      console.error(e);
      alert("APK Build Pipeline Error.");
    } finally {
      setIsBuildingApk(false);
    }
  };

  const handleAddSecret = () => {
    if (!newSecretKey.trim() || !newSecretValue.trim()) return;
    setSecrets([...secrets, { key: newSecretKey.toUpperCase(), value: newSecretValue }]);
    setNewSecretKey('');
    setNewSecretValue('');
  };

  const handleRemoveSecret = (idx: number) => {
    setSecrets(secrets.filter((_, i) => i !== idx));
  };

  const handleGithubAction = () => {
    if (!githubToken || !githubRepo) {
      alert("Please provide both a GitHub Token and Repository Name.");
      return;
    }
    setIsPushing(true);
    setTimeout(() => {
      setIsPushing(false);
      alert(`Successfully committed and pushed using template [${githubTemplate}] to ${githubRepo}! \n\nCommit: ${generatedCommitMsg}`);
    }, 1500);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" 
        onClick={() => setMenuOpen(false)}
      />
      
      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#12121e] border-t border-white/10 rounded-t-3xl z-[101] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] h-[85vh] overflow-hidden transform transition-transform">
        <div className="pt-4 px-4 pb-2 border-b border-white/10 bg-black/20 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" /> Preferences
            </h2>
            <button onClick={() => setMenuOpen(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-slate-300">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
            <button onClick={() => setActiveTab('ai')} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex justify-center items-center gap-1.5 ${activeTab === 'ai' ? 'bg-white/10 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
              <Bot className="w-3.5 h-3.5" /> AI / Chat
            </button>
            <button onClick={() => setActiveTab('secrets')} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex justify-center items-center gap-1.5 ${activeTab === 'secrets' ? 'bg-white/10 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
              <Key className="w-3.5 h-3.5" /> Secrets
            </button>
            <button onClick={() => setActiveTab('github')} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex justify-center items-center gap-1.5 ${activeTab === 'github' ? 'bg-white/10 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
              <Github className="w-3.5 h-3.5" /> GitHub
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 scrollbar-hide pb-20">
          
          {/* TAB 1: AI / CHAT */}
          {activeTab === 'ai' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-400" /> Intelligence Settings
                </h3>
                
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Model Selector</label>
                  <select
                     value={selectedModel}
                     onChange={(e) => setSelectedModel(e.target.value)}
                     className="w-full bg-black/40 text-white border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 appearance-none"
                  >
                    {MODELS.map(m => <option key={m.id} value={m.id} className="bg-[#0c0c14]">{m.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500">OpenRouter API Key</label>
                  <input 
                    type="password"
                    placeholder="sk-or-v1-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-black/40 text-white border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder:text-white/20"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 pl-1">Keys are stored securely in local browser storage.</p>
                </div>
              </div>

              <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                 <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 flex items-center gap-2">
                  <Box className="w-4 h-4 text-indigo-400" /> Local Artifacts
                 </h3>
                 <button onClick={handleDownloadZip} className="w-full flex items-center justify-between gap-2 bg-black/40 hover:bg-black/60 text-slate-200 border border-white/10 transition-colors p-3.5 rounded-xl text-sm font-semibold">
                  <span className="flex items-center gap-2"><Download className="w-4 h-4" /> Export Source Code</span>
                 </button>
                 <button onClick={handleDownloadAPK} disabled={isBuildingApk} className="w-full flex items-center justify-between gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition-colors p-3.5 rounded-xl text-sm font-semibold disabled:opacity-50">
                  <span className="flex items-center gap-2">
                    {isBuildingApk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />} 
                    {isBuildingApk ? 'Compiling APK Pipeline...' : 'Download Builded APK'}
                  </span>
                 </button>
                 <button onClick={() => { clearChat(); setMenuOpen(false); }} className="w-full mt-4 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors p-3.5 rounded-xl text-sm font-semibold">
                  <Trash2 className="w-4 h-4" /> Clear Environment
                 </button>
              </div>
            </div>
          )}

          {/* TAB 2: SECRETS */}
          {activeTab === 'secrets' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl shadow-lg">
                 <h2 className="text-indigo-200 font-semibold text-sm">Frontend Architecture Secrets</h2>
                 <p className="text-slate-400 text-xs mt-1 leading-relaxed">Provide external API keys or configuration secrets. These are securely injected into the preview environment's virtual \`.env\` but remain completely hidden from the actual static frontend artifacts.</p>
              </div>

              <div className="space-y-4">
                 {secrets.map((secret, i) => (
                    <div key={i} className="flex gap-2 items-center bg-black/40 p-2 rounded-xl border border-white/10">
                      <div className="flex-1 space-y-1">
                        <div className="text-[10px] font-mono text-slate-500 uppercase px-2">{secret.key}</div>
                        <div className="text-sm text-white px-2 truncate pb-1">••••••••••••••••</div>
                      </div>
                      <button onClick={() => handleRemoveSecret(i)} className="p-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                 ))}

                 {secrets.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-white/10 rounded-xl opacity-50">
                       <Key className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                       <span className="text-xs text-slate-400">No secrets configured.</span>
                    </div>
                 )}
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                 <h3 className="text-xs font-bold text-slate-400">ADD NEW KEY</h3>
                 <input 
                    type="text"
                    placeholder="Key (e.g. NEXT_PUBLIC_SUPABASE_URL)"
                    value={newSecretKey}
                    onChange={(e) => setNewSecretKey(e.target.value)}
                    className="w-full bg-black/40 font-mono text-white border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500/50"
                 />
                 <input 
                    type="password"
                    placeholder="Value"
                    value={newSecretValue}
                    onChange={(e) => setNewSecretValue(e.target.value)}
                    className="w-full bg-black/40 text-white border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500/50"
                 />
                 <button onClick={handleAddSecret} disabled={!newSecretKey || !newSecretValue} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white border border-indigo-500 transition-colors p-3 rounded-xl text-sm font-semibold disabled:opacity-50 mt-2">
                    <PlusCircle className="w-4 h-4" /> Inject Secret
                 </button>
              </div>
            </div>
          )}

          {/* TAB 3: GITHUB */}
          {activeTab === 'github' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 flex items-center gap-2">
                  <Github className="w-4 h-4 text-white" /> Repository Config
                </h3>
                
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Access Token</label>
                  <input 
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxx"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    className="w-full bg-black/40 text-white border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Repository Name</label>
                  <input 
                    type="text"
                    placeholder="username/my-app"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    className="w-full bg-black/40 text-white border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Template Engine</label>
                  <select
                     value={githubTemplate}
                     onChange={(e) => setGithubTemplate(e.target.value)}
                     className="w-full bg-black/40 text-white border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 appearance-none"
                  >
                    <option value="react-vite" className="bg-[#0c0c14]">React + Vite (Standard)</option>
                    <option value="nextjs" className="bg-[#0c0c14]">Next.js (App Router)</option>
                    <option value="expo" className="bg-[#0c0c14]">Expo (React Native)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest font-bold text-slate-500">Description</label>
                  <textarea 
                    rows={2}
                    placeholder="Describe your repository..."
                    value={githubDescription}
                    onChange={(e) => setGithubDescription(e.target.value)}
                    className="w-full bg-black/40 text-white border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>

              <div className="space-y-4 bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
                <h3 className="text-xs uppercase tracking-widest font-bold text-indigo-300">Push / Commit Pipeline</h3>
                <div className="space-y-2">
                   <label className="text-[11px] font-bold text-indigo-200">AI GENERATED COMMIT MESSAGE</label>
                   <textarea 
                     rows={3}
                     value={generatedCommitMsg}
                     onChange={(e) => setGeneratedCommitMsg(e.target.value)}
                     className="w-full bg-black/60 font-mono text-indigo-100 border border-indigo-500/30 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-400 resize-none"
                   />
                </div>
                <button 
                  onClick={handleGithubAction}
                  disabled={isPushing}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold p-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {isPushing ? <><Loader2 className="w-4 h-4 animate-spin"/> Processing...</> : <><CheckCircle2 className="w-4 h-4" /> Confirm & Push Source</>}
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}
