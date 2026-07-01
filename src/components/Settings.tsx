import React from 'react';
import { useStore } from '../store/index';
import { X, Settings, Database, Key, Server, Globe } from 'lucide-react';
import { MODELS } from '../lib/constants';

export function SettingsModal() {
  const { 
    isSettingsOpen, 
    setSettingsOpen, 
    provider,
    setProvider,
    apiKey, 
    setApiKey, 
    selectedModel, 
    setSelectedModel,
    doApiKey,
    setDoApiKey,
    doEndpoint,
    setDoEndpoint,
    doModel,
    setDoModel
  } = useStore();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setSettingsOpen(false)}
      />
      
      <div className="relative w-full max-w-lg bg-[#0c0c14] border border-indigo-500/30 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" /> Settings
          </h2>
          <button 
            onClick={() => setSettingsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Toggle */}
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
          <button
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${provider === 'openrouter' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setProvider('openrouter')}
          >
            OpenRouter
          </button>
          <button
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${provider === 'digitalocean' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setProvider('digitalocean')}
          >
            DigitalOcean
          </button>
        </div>

        {provider === 'openrouter' ? (
          <>
            {/* API Key Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Key className="w-3 h-3" /> OpenRouter API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="sk-or-..."
              />
            </div>

            {/* Model Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Database className="w-3 h-3" /> Select Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <>
            {/* DigitalOcean Input Settings */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Key className="w-3 h-3" /> DigitalOcean Auth Token
              </label>
              <input
                type="password"
                value={doApiKey}
                onChange={(e) => setDoApiKey(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="dop_v1_..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Server className="w-3 h-3" /> Endpoint URL (Optional)
              </label>
              <input
                type="text"
                value={doEndpoint}
                onChange={(e) => setDoEndpoint(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://cluster-api.do-ai.run/v1/chat/completions"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Database className="w-3 h-3" /> Model ID
              </label>
              <input
                type="text"
                value={doModel}
                onChange={(e) => setDoModel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="meta-llama/META-Llama-3-8B-Instruct"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
