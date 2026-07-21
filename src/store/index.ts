import { create } from 'zustand';

export type Message = {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type FileSystem = Record<string, { code: string }>;

const INITIAL_FILES: FileSystem = {
  '/App.tsx': {
    code: `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
        Welcome to DevAgent OS
      </h1>
      <p className="text-gray-400 text-lg">
        Ask the agent to build a React application, and preview it here.
      </p>
    </div>
  );
}`
  },
  '/public/index.html': {
    code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <!-- Tailwind CSS injected for isolated preview support -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {}
        }
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`
  },
  '/styles.css': {
    code: `body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}`
  }
};

interface AppState {
  apiKey: string;
  setApiKey: (key: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  messages: Message[];
  addMessage: (msg: Message) => void;
  updateLastMessage: (content: string) => void;
  files: FileSystem;
  updateFiles: (newFiles: FileSystem) => void;
  setFiles: (files: FileSystem) => void;
  isGenerating: boolean;
  setIsGenerating: (val: boolean) => void;
  clearChat: () => void;
  activeTab: 'chat' | 'preview';
  setActiveTab: (tab: 'chat' | 'preview') => void;
  isMenuOpen: boolean;
  setMenuOpen: (val: boolean) => void;
  isSettingsOpen: boolean;
  setSettingsOpen: (val: boolean) => void;
  provider: 'openrouter' | 'digitalocean' | 'openai' | 'anthropic' | 'google' | 'deepseek' | 'groq' | 'together' | 'mistral' | 'custom';
  setProvider: (provider: 'openrouter' | 'digitalocean' | 'openai' | 'anthropic' | 'google' | 'deepseek' | 'groq' | 'together' | 'mistral' | 'custom') => void;
  doApiKey: string;
  setDoApiKey: (key: string) => void;
  doEndpoint: string;
  setDoEndpoint: (endpoint: string) => void;
  doModel: string;
  setDoModel: (model: string) => void;
  // New Providers
  openaiApiKey: string;
  setOpenaiApiKey: (key: string) => void;
  openaiModel: string;
  setOpenaiModel: (model: string) => void;
  anthropicApiKey: string;
  setAnthropicApiKey: (key: string) => void;
  anthropicModel: string;
  setAnthropicModel: (model: string) => void;
  googleApiKey: string;
  setGoogleApiKey: (key: string) => void;
  googleModel: string;
  setGoogleModel: (model: string) => void;
  deepseekApiKey: string;
  setDeepseekApiKey: (key: string) => void;
  deepseekModel: string;
  setDeepseekModel: (model: string) => void;
  groqApiKey: string;
  setGroqApiKey: (key: string) => void;
  groqModel: string;
  setGroqModel: (model: string) => void;
  togetherApiKey: string;
  setTogetherApiKey: (key: string) => void;
  togetherModel: string;
  setTogetherModel: (model: string) => void;
  mistralApiKey: string;
  setMistralApiKey: (key: string) => void;
  mistralModel: string;
  setMistralModel: (model: string) => void;
  customApiKey: string;
  setCustomApiKey: (key: string) => void;
  customEndpoint: string;
  setCustomEndpoint: (endpoint: string) => void;
  customModel: string;
  setCustomModel: (model: string) => void;
  // Proposed Feature: Prompt Optimizer & Smart Routing
  flowOptimizerEnabled: boolean;
  setFlowOptimizerEnabled: (val: boolean) => void;
  githubToken: string;
  setGithubToken: (val: string) => void;
  githubRepo: string;
  setGithubRepo: (val: string) => void;
  secrets: { key: string; value: string }[];
  setSecrets: (secrets: { key: string; value: string }[]) => void;
  githubDescription: string;
  setGithubDescription: (val: string) => void;
  diagnosticLogs: DiagnosticLog[];
  addDiagnosticLog: (log: DiagnosticLog) => void;
  clearDiagnosticLogs: () => void;
}

export type DiagnosticLog = {
  timestamp: string;
  provider: string;
  endpoint: string;
  headers: Record<string, string>;
  status?: number;
  statusText?: string;
  errorMessage?: string;
  payload?: any;
  responseHeaders?: Record<string, string>;
};

export const useStore = create<AppState>((set) => ({
  apiKey: localStorage.getItem('openRouterApiKey') || '',
  setApiKey: (key) => Object.assign(() => {
    localStorage.setItem('openRouterApiKey', key);
    set({ apiKey: key });
  })(),
  selectedModel: localStorage.getItem('selectedModel') || 'openrouter/free',
  setSelectedModel: (model) => Object.assign(() => {
    localStorage.setItem('selectedModel', model);
    set({ selectedModel: model });
  })(),
  messages: [],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  updateLastMessage: (content) => set((state) => {
    const updatedMessages = [...state.messages];
    if (updatedMessages.length > 0) {
      const lastIndex = updatedMessages.length - 1;
      updatedMessages[lastIndex] = {
        ...updatedMessages[lastIndex],
        content: content
      };
    }
    return { messages: updatedMessages };
  }),
  files: INITIAL_FILES,
  updateFiles: (newFiles) => set((state) => ({ files: { ...state.files, ...newFiles } })),
  setFiles: (files) => set({ files }),
  isGenerating: false,
  setIsGenerating: (val) => set({ isGenerating: val }),
  clearChat: () => set({ messages: [], files: INITIAL_FILES }),
  activeTab: 'chat',
  setActiveTab: (tab) => set({ activeTab: tab }),
  isMenuOpen: false,
  setMenuOpen: (val) => set({ isMenuOpen: val }),
  isSettingsOpen: false,
  setSettingsOpen: (val) => set({ isSettingsOpen: val }),
  provider: (localStorage.getItem('provider') as any) || 'openrouter',
  setProvider: (val) => Object.assign(() => {
    localStorage.setItem('provider', val);
    set({ provider: val });
  })(),
  doApiKey: localStorage.getItem('doApiKey') || '',
  setDoApiKey: (key) => Object.assign(() => {
    localStorage.setItem('doApiKey', key);
    set({ doApiKey: key });
  })(),
  doEndpoint: localStorage.getItem('doEndpoint') || '',
  setDoEndpoint: (endpoint) => Object.assign(() => {
    localStorage.setItem('doEndpoint', endpoint);
    set({ doEndpoint: endpoint });
  })(),
  doModel: localStorage.getItem('doModel') || 'meta-llama/META-Llama-3-8B-Instruct',
  setDoModel: (model) => Object.assign(() => {
    localStorage.setItem('doModel', model);
    set({ doModel: model });
  })(),
  // New Providers
  openaiApiKey: localStorage.getItem('openaiApiKey') || '',
  setOpenaiApiKey: (key) => Object.assign(() => {
    localStorage.setItem('openaiApiKey', key);
    set({ openaiApiKey: key });
  })(),
  openaiModel: localStorage.getItem('openaiModel') || 'gpt-4o-mini',
  setOpenaiModel: (model) => Object.assign(() => {
    localStorage.setItem('openaiModel', model);
    set({ openaiModel: model });
  })(),
  anthropicApiKey: localStorage.getItem('anthropicApiKey') || '',
  setAnthropicApiKey: (key) => Object.assign(() => {
    localStorage.setItem('anthropicApiKey', key);
    set({ anthropicApiKey: key });
  })(),
  anthropicModel: localStorage.getItem('anthropicModel') || 'claude-3-5-sonnet-latest',
  setAnthropicModel: (model) => Object.assign(() => {
    localStorage.setItem('anthropicModel', model);
    set({ anthropicModel: model });
  })(),
  googleApiKey: localStorage.getItem('googleApiKey') || '',
  setGoogleApiKey: (key) => Object.assign(() => {
    localStorage.setItem('googleApiKey', key);
    set({ googleApiKey: key });
  })(),
  googleModel: localStorage.getItem('googleModel') || 'gemini-1.5-flash',
  setGoogleModel: (model) => Object.assign(() => {
    localStorage.setItem('googleModel', model);
    set({ googleModel: model });
  })(),
  deepseekApiKey: localStorage.getItem('deepseekApiKey') || '',
  setDeepseekApiKey: (key) => Object.assign(() => {
    localStorage.setItem('deepseekApiKey', key);
    set({ deepseekApiKey: key });
  })(),
  deepseekModel: localStorage.getItem('deepseekModel') || 'deepseek-chat',
  setDeepseekModel: (model) => Object.assign(() => {
    localStorage.setItem('deepseekModel', model);
    set({ deepseekModel: model });
  })(),
  groqApiKey: localStorage.getItem('groqApiKey') || '',
  setGroqApiKey: (key) => Object.assign(() => {
    localStorage.setItem('groqApiKey', key);
    set({ groqApiKey: key });
  })(),
  groqModel: localStorage.getItem('groqModel') || 'llama-3.1-70b-versatile',
  setGroqModel: (model) => Object.assign(() => {
    localStorage.setItem('groqModel', model);
    set({ groqModel: model });
  })(),
  togetherApiKey: localStorage.getItem('togetherApiKey') || '',
  setTogetherApiKey: (key) => Object.assign(() => {
    localStorage.setItem('togetherApiKey', key);
    set({ togetherApiKey: key });
  })(),
  togetherModel: localStorage.getItem('togetherModel') || 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
  setTogetherModel: (model) => Object.assign(() => {
    localStorage.setItem('togetherModel', model);
    set({ togetherModel: model });
  })(),
  mistralApiKey: localStorage.getItem('mistralApiKey') || '',
  setMistralApiKey: (key) => Object.assign(() => {
    localStorage.setItem('mistralApiKey', key);
    set({ mistralApiKey: key });
  })(),
  mistralModel: localStorage.getItem('mistralModel') || 'mistral-large-latest',
  setMistralModel: (model) => Object.assign(() => {
    localStorage.setItem('mistralModel', model);
    set({ mistralModel: model });
  })(),
  customApiKey: localStorage.getItem('customApiKey') || '',
  setCustomApiKey: (key) => Object.assign(() => {
    localStorage.setItem('customApiKey', key);
    set({ customApiKey: key });
  })(),
  customEndpoint: localStorage.getItem('customEndpoint') || '',
  setCustomEndpoint: (endpoint) => Object.assign(() => {
    localStorage.setItem('customEndpoint', endpoint);
    set({ customEndpoint: endpoint });
  })(),
  customModel: localStorage.getItem('customModel') || '',
  setCustomModel: (model) => Object.assign(() => {
    localStorage.setItem('customModel', model);
    set({ customModel: model });
  })(),
  flowOptimizerEnabled: localStorage.getItem('flowOptimizerEnabled') === 'true',
  setFlowOptimizerEnabled: (val) => Object.assign(() => {
    localStorage.setItem('flowOptimizerEnabled', String(val));
    set({ flowOptimizerEnabled: val });
  })(),
  githubToken: localStorage.getItem('githubToken') || '',
  setGithubToken: (val) => Object.assign(() => {
    localStorage.setItem('githubToken', val);
    set({ githubToken: val });
  })(),
  githubRepo: localStorage.getItem('githubRepo') || '',
  setGithubRepo: (val) => Object.assign(() => {
    localStorage.setItem('githubRepo', val);
    set({ githubRepo: val });
  })(),
  secrets: JSON.parse(localStorage.getItem('appSecrets') || '[]'),
  setSecrets: (secrets) => Object.assign(() => {
    localStorage.setItem('appSecrets', JSON.stringify(secrets));
    set({ secrets });
  })(),
  githubDescription: '',
  setGithubDescription: (val) => set({ githubDescription: val }),
  diagnosticLogs: [],
  addDiagnosticLog: (log) => set((state) => ({ 
    diagnosticLogs: [log, ...state.diagnosticLogs].slice(0, 50) // Keep last 50 logs
  })),
  clearDiagnosticLogs: () => set({ diagnosticLogs: [] })
}));
