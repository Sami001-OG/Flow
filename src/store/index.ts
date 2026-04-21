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
  isGenerating: boolean;
  setIsGenerating: (val: boolean) => void;
  clearChat: () => void;
  activeTab: 'chat' | 'preview';
  setActiveTab: (tab: 'chat' | 'preview') => void;
  isMenuOpen: boolean;
  setMenuOpen: (val: boolean) => void;
  isSettingsOpen: boolean;
  setSettingsOpen: (val: boolean) => void;
  githubToken: string;
  setGithubToken: (val: string) => void;
  githubRepo: string;
  setGithubRepo: (val: string) => void;
  secrets: { key: string; value: string }[];
  setSecrets: (secrets: { key: string; value: string }[]) => void;
  githubDescription: string;
  setGithubDescription: (val: string) => void;
}

export const useStore = create<AppState>((set) => ({
  apiKey: localStorage.getItem('openRouterApiKey') || '',
  setApiKey: (key) => Object.assign(() => {
    localStorage.setItem('openRouterApiKey', key);
    set({ apiKey: key });
  })(),
  selectedModel: 'openrouter/free',
  setSelectedModel: (model) => set({ selectedModel: model }),
  messages: [],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  updateLastMessage: (content) => set((state) => {
    const updatedMessages = [...state.messages];
    if (updatedMessages.length > 0) {
      updatedMessages[updatedMessages.length - 1].content = content;
    }
    return { messages: updatedMessages };
  }),
  files: INITIAL_FILES,
  updateFiles: (newFiles) => set((state) => ({ files: { ...state.files, ...newFiles } })),
  isGenerating: false,
  setIsGenerating: (val) => set({ isGenerating: val }),
  clearChat: () => set({ messages: [], files: INITIAL_FILES }),
  activeTab: 'chat',
  setActiveTab: (tab) => set({ activeTab: tab }),
  isMenuOpen: false,
  setMenuOpen: (val) => set({ isMenuOpen: val }),
  isSettingsOpen: false,
  setSettingsOpen: (val) => set({ isSettingsOpen: val }),
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
  setGithubDescription: (val) => set({ githubDescription: val })
}));
