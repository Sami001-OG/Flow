import React, { useState, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useStore } from '../store/index';
import { generateCodeStream } from '../services/llm';
import { Send, Terminal, Loader2, Sparkles, Settings, Copy, Check } from 'lucide-react';
import Markdown from 'react-markdown';
import { MODELS } from '../lib/constants';

function stripMetadata(content: string) {
  return content.replace(/###\s*File:\s*([^\n]+)\n?/g, '');
}

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1 hover:bg-white/10 rounded absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
    </button>
  );
}

function FullMessageCopy({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      onClick={handleCopy} 
      className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20 w-max"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy Response'}
    </button>
  );
}

export function ChatPane() {
  const { messages, addMessage, updateLastMessage, isGenerating, setIsGenerating, selectedModel, setSettingsOpen } = useStore();
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    abortControllerRef.current = new AbortController();
    const userPrompt = input;
    setInput('');
    setIsGenerating(true);

    const userMessageId = Math.random().toString(36).substring(7);
    addMessage({ id: userMessageId, role: 'user', content: userPrompt });

    const assistantMessageId = Math.random().toString(36).substring(7);
    addMessage({ id: assistantMessageId, role: 'assistant', content: '' });

    await generateCodeStream(
      userPrompt,
      (partialContent) => {
        updateLastMessage(partialContent);
      },
      () => {
        setIsGenerating(false);
        abortControllerRef.current = null;
      },
      (errorLog) => {
        setIsGenerating(false);
        updateLastMessage("**SYSTEM ERROR:** \n\n" + errorLog);
        abortControllerRef.current = null;
      },
      abortControllerRef.current.signal
    );
  };

  const modelInfo = MODELS.find(m => m.id === selectedModel);

  return (
    <div className="h-full flex flex-col pt-safe bg-transparent relative z-10 w-full">
      
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">Flow</h1>
        
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button 
             onClick={() => setSettingsOpen(true)}
             className="text-slate-400 hover:text-white p-2"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        
          <div className="flex items-center gap-1.5 sm:gap-2 bg-indigo-500/10 border border-indigo-500/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
            <span className="text-[10px] sm:text-xs font-semibold text-indigo-200 truncate max-w-[80px] sm:max-w-[120px]">{modelInfo?.name}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 space-y-4 sm:space-y-6 pb-28 sm:pb-32 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-40 select-none pb-10">
             <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl mb-4">
               <Terminal className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />
             </div>
             <p className="text-slate-300 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-center">Ready to Chat</p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col max-w-[95%] sm:max-w-[90%] ${
              message.role === 'user' ? 'items-end self-end ml-auto' : 'items-start'
            }`}
          >
            <div
              className={`px-4 sm:px-5 py-2.5 sm:py-3 shadow-lg rounded-2xl text-sm sm:text-[15px] leading-relaxed break-words max-w-full ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white/5 border border-white/10 text-slate-100 rounded-tl-none'
              }`}
            >
              {message.role === 'user' ? (
                message.content
              ) : (
                <>
                  <div className="markdown-body prose prose-invert max-w-full prose-sm prose-pre:bg-black/60 prose-pre:p-4 prose-pre:rounded-xl prose-pre:border prose-pre:border-indigo-500/20 prose-headings:text-indigo-100 prose-a:text-indigo-400 prose-code:text-indigo-300 prose-code:font-mono prose-code:bg-black/50 prose-code:px-1 prose-code:rounded prose-blockquote:border-indigo-500/50">
                     <Markdown
                       components={{
                         pre({ node, children }) {
                           const content = String(children);
                           return (
                             <div className="my-3 sm:my-4 bg-black/40 border border-white/10 rounded-xl p-3 sm:p-4 shadow-inner relative group">
                                <CopyButton content={content} />
                                {children}
                             </div>
                           );
                         }
                       }}
                     >
                       {stripMetadata(message.content)}
                     </Markdown>
                  </div>
                  {/* Only show full message copy button if not generating */}
                  {!isGenerating && (
                    <FullMessageCopy content={message.content} />
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        {isGenerating && (
           <div className="flex items-center gap-2 sm:gap-3 text-indigo-400 font-mono text-[10px] sm:text-xs pl-2 bg-white/5 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 border border-white/10 rounded-2xl w-max rounded-tl-sm shadow-md">
             <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
             Working...
           </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-4 flex flex-col justify-end pointer-events-none">
        <form
          onSubmit={handleSubmit}
          className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-[1.5rem] p-1 shadow-2xl flex items-center gap-1 sm:gap-2 pointer-events-auto transition-all focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/30"
        >
          <input
            type="text"
            className="flex-1 bg-transparent border-none text-white px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none placeholder-white/40 text-sm sm:text-[15px]"
            placeholder="Compose..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isGenerating}
          />
          <button
            type={isGenerating ? "button" : "submit"}
            disabled={!input.trim() && !isGenerating}
            onClick={isGenerating ? stopGeneration : undefined}
            className={`w-9 h-9 sm:w-[42px] sm:h-[42px] flex items-center justify-center rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group ${
              isGenerating 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
            }`}
          >
            {isGenerating ? (
               <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            ) : (
               <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
