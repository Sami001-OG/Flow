import React from 'react';
import { useStore } from '../store/index';
import { X, Settings, Database, Key, Server, Sparkles, Cpu } from 'lucide-react';
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
    setDoModel,
    // New Providers
    openaiApiKey,
    setOpenaiApiKey,
    openaiModel,
    setOpenaiModel,
    anthropicApiKey,
    setAnthropicApiKey,
    anthropicModel,
    setAnthropicModel,
    googleApiKey,
    setGoogleApiKey,
    googleModel,
    setGoogleModel,
    deepseekApiKey,
    setDeepseekApiKey,
    deepseekModel,
    setDeepseekModel,
    groqApiKey,
    setGroqApiKey,
    groqModel,
    setGroqModel,
    togetherApiKey,
    setTogetherApiKey,
    togetherModel,
    setTogetherModel,
    mistralApiKey,
    setMistralApiKey,
    mistralModel,
    setMistralModel,
    customApiKey,
    setCustomApiKey,
    customEndpoint,
    setCustomEndpoint,
    customModel,
    setCustomModel,
    flowOptimizerEnabled,
    setFlowOptimizerEnabled
  } = useStore();

  if (!isSettingsOpen) return null;

  const PROVIDERS = [
    { id: 'openrouter', name: 'OpenRouter (Default)', color: 'text-indigo-400' },
    { id: 'openai', name: 'OpenAI Direct', color: 'text-emerald-400' },
    { id: 'anthropic', name: 'Anthropic Claude Direct', color: 'text-orange-400' },
    { id: 'google', name: 'Google Gemini Direct', color: 'text-blue-400' },
    { id: 'deepseek', name: 'DeepSeek Direct', color: 'text-cyan-400' },
    { id: 'groq', name: 'Groq Cloud (Fast)', color: 'text-amber-400' },
    { id: 'together', name: 'Together AI', color: 'text-purple-400' },
    { id: 'mistral', name: 'Mistral AI Direct', color: 'text-rose-400' },
    { id: 'digitalocean', name: 'DigitalOcean GenAI', color: 'text-sky-400' },
    { id: 'custom', name: 'Custom OpenAI-Compatible', color: 'text-slate-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setSettingsOpen(false)}
      />
      
      <div className="relative w-full max-w-lg bg-[#0c0c14] border border-indigo-500/30 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" /> Settings Panel
          </h2>
          <button 
            onClick={() => setSettingsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Select Dropdown */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Select API Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as any)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {PROVIDERS.map(p => (
              <option key={p.id} value={p.id} className="bg-[#0c0c14] text-white">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="border-t border-white/5 my-1" />

        {/* Dynamic Provider Input Sections */}
        {provider === 'openrouter' && (
          <div className="space-y-4">
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

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Database className="w-3 h-3" /> Select Model Preset
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {MODELS.map(m => (
                  <option key={m.id} value={m.id} className="bg-[#0c0c14] text-white">
                    {m.name} ({m.provider})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {provider === 'openai' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Key className="w-3 h-3" /> OpenAI API Key
              </label>
              <input
                type="password"
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="sk-proj-..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Database className="w-3 h-3" /> OpenAI Model ID
              </label>
              <input
                type="text"
                value={openaiModel}
                onChange={(e) => setOpenaiModel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="gpt-4o-mini or o1-mini"
              />
            </div>
          </div>
        )}

        {provider === 'anthropic' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Key className="w-3 h-3" /> Anthropic API Key
              </label>
              <input
                type="password"
                value={anthropicApiKey}
                onChange={(e) => setAnthropicApiKey(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="sk-ant-..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Database className="w-3 h-3" /> Claude Model ID
              </label>
              <input
                type="text"
                value={anthropicModel}
                onChange={(e) => setAnthropicModel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="claude-3-5-sonnet-latest"
              />
            </div>
          </div>
        )}

        {provider === 'google' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Key className="w-3 h-3" /> Google Gemini API Key
              </label>
              <input
                type="password"
                value={googleApiKey}
                onChange={(e) => setGoogleApiKey(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="AIzaSy..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Database className="w-3 h-3" /> Gemini Model ID
              </label>
              <input
                type="text"
                value={googleModel}
                onChange={(e) => setGoogleModel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="gemini-1.5-flash or gemini-2.0-flash"
              />
            </div>
          </div>
        )}

        {provider === 'deepseek' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Key className="w-3 h-3" /> DeepSeek API Key
              </label>
              <input
                type="password"
                value={deepseekApiKey}
                onChange={(e) => setDeepseekApiKey(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                placeholder="sk-..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Database className="w-3 h-3" /> DeepSeek Model ID
              </label>
              <input
                type="text"
                value={deepseekModel}
                onChange={(e) => setDeepseekModel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                placeholder="deepseek-chat or deepseek-reasoner"
              />
            </div>
          </div>
        )}

        {provider === 'groq' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Key className="w-3 h-3" /> Groq API Key
              </label>
              <input
                type="password"
                value={groqApiKey}
                onChange={(e) => setGroqApiKey(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="gsk_..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Database className="w-3 h-3" /> Groq Model ID
              </label>
              <input
                type="text"
                value={groqModel}
                onChange={(e) => setGroqModel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="llama-3.1-70b-versatile"
              />
            </div>
          </div>
        )}

        {provider === 'together' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Key className="w-3 h-3" /> Together AI API Key
              </label>
              <input
                type="password"
                value={togetherApiKey}
                onChange={(e) => setTogetherApiKey(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="Together API Key"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Database className="w-3 h-3" /> Together Model ID
              </label>
              <input
                type="text"
                value={togetherModel}
                onChange={(e) => setTogetherModel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo"
              />
            </div>
          </div>
        )}

        {provider === 'mistral' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Key className="w-3 h-3" /> Mistral AI API Key
              </label>
              <input
                type="password"
                value={mistralApiKey}
                onChange={(e) => setMistralApiKey(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                placeholder="Mistral API Key"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Database className="w-3 h-3" /> Mistral Model ID
              </label>
              <input
                type="text"
                value={mistralModel}
                onChange={(e) => setMistralModel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                placeholder="mistral-large-latest"
              />
            </div>
          </div>
        )}

        {provider === 'digitalocean' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Key className="w-3 h-3" /> DigitalOcean Auth Token
              </label>
              <input
                type="password"
                value={doApiKey}
                onChange={(e) => setDoApiKey(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="meta-llama/META-Llama-3-8B-Instruct"
              />
            </div>
          </div>
        )}

        {provider === 'custom' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Server className="w-3 h-3" /> Endpoint Base URL
              </label>
              <input
                type="text"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="e.g. http://localhost:11434/v1/chat/completions"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Key className="w-3 h-3" /> API key / Token (Optional)
              </label>
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="Bearer Token (if needed)"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                <Database className="w-3 h-3" /> Model ID
              </label>
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="llama3"
              />
            </div>
          </div>
        )}

        <div className="border-t border-white/5 my-1" />

        {/* Proposed CTO Feature: Flow Intelligence Core */}
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" /> Flow Catalyst Core
            </span>
            <button
              onClick={() => setFlowOptimizerEnabled(!flowOptimizerEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${flowOptimizerEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${flowOptimizerEnabled ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Augments provider requests with a specialized system directive to force stable complete file structures, and automatically formats Reasoning Chains (&lt;think&gt; tags) into collapsible, interactive accordions.
          </p>
        </div>
      </div>
    </div>
  );
}
