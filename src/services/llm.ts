import { useStore, FileSystem } from '../store/index';

const SYSTEM_PROMPT = "";

function maskToken(token?: string): string {
  if (!token) return 'None';
  if (token.length <= 12) return '******';
  return `${token.substring(0, 6)}...${token.substring(token.length - 4)}`;
}

function maskHeaders(headers: Record<string, string>): Record<string, string> {
  const masked: Record<string, string> = {};
  for (const [key, val] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey === 'authorization' || lowerKey === 'x-api-key' || lowerKey === 'api-key') {
      if (val.startsWith('Bearer ')) {
        masked[key] = `Bearer ${maskToken(val.substring(7))}`;
      } else {
        masked[key] = maskToken(val);
      }
    } else {
      masked[key] = val;
    }
  }
  return masked;
}

let lastFileParseTime = 0;

export async function generateCodeStream(
  prompt: string,
  onChunk: (content: string) => void,
  onComplete: () => void,
  onError: (error: string) => void,
  signal?: AbortSignal
) {
  const state = useStore.getState();
  const provider = state.provider;
  
  let apiKey = '';
  let endpoint = '';
  let modelToUse = '';
  let headers: Record<string, string> = { 'Content-Type': 'application/json' };
  let useProxy = false;

  switch (provider) {
    case 'openai':
      apiKey = state.openaiApiKey;
      endpoint = 'https://api.openai.com/v1/chat/completions';
      modelToUse = state.openaiModel || 'gpt-4o-mini';
      headers['Authorization'] = `Bearer ${apiKey}`;
      useProxy = true;
      break;
    case 'anthropic':
      apiKey = state.anthropicApiKey;
      endpoint = 'https://api.anthropic.com/v1/messages';
      modelToUse = state.anthropicModel || 'claude-3-5-sonnet-latest';
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      useProxy = true;
      break;
    case 'google':
      apiKey = state.googleApiKey;
      endpoint = `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions?key=${apiKey}`;
      modelToUse = state.googleModel || 'gemini-1.5-flash';
      headers['Authorization'] = `Bearer ${apiKey}`;
      useProxy = true;
      break;
    case 'deepseek':
      apiKey = state.deepseekApiKey;
      endpoint = 'https://api.deepseek.com/chat/completions';
      modelToUse = state.deepseekModel || 'deepseek-chat';
      headers['Authorization'] = `Bearer ${apiKey}`;
      useProxy = true;
      break;
    case 'groq':
      apiKey = state.groqApiKey;
      endpoint = 'https://api.groq.com/openai/v1/chat/completions';
      modelToUse = state.groqModel || 'llama-3.1-70b-versatile';
      headers['Authorization'] = `Bearer ${apiKey}`;
      useProxy = true;
      break;
    case 'together':
      apiKey = state.togetherApiKey;
      endpoint = 'https://api.together.xyz/v1/chat/completions';
      modelToUse = state.togetherModel || 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo';
      headers['Authorization'] = `Bearer ${apiKey}`;
      useProxy = true;
      break;
    case 'mistral':
      apiKey = state.mistralApiKey;
      endpoint = 'https://api.mistral.ai/v1/chat/completions';
      modelToUse = state.mistralModel || 'mistral-large-latest';
      headers['Authorization'] = `Bearer ${apiKey}`;
      useProxy = true;
      break;
    case 'digitalocean':
      apiKey = state.doApiKey;
      endpoint = state.doEndpoint || 'https://cluster-api.do-ai.run/v1/chat/completions';
      modelToUse = state.doModel || 'meta-llama/META-Llama-3-8B-Instruct';
      headers['Authorization'] = `Bearer ${apiKey}`;
      useProxy = true;
      break;
    case 'custom':
      apiKey = state.customApiKey;
      let customUrl = (state.customEndpoint || '').trim();
      if (customUrl) {
        // If it doesn't end with a standard completion path, append /chat/completions
        if (!customUrl.endsWith('/chat/completions') && !customUrl.endsWith('/completions') && !customUrl.endsWith('/messages')) {
          customUrl = customUrl.replace(/\/+$/, '') + '/chat/completions';
        }
      }
      endpoint = customUrl;
      modelToUse = state.customModel;
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      // Use proxy if it's a remote URL to avoid CORS and Mixed Content. 
      // Direct fetch only if localhost/127.0.0.1 to access local machine.
      const isLocal = /localhost|127\.0\.0\.1|\.local/i.test(endpoint);
      useProxy = !isLocal;
      break;
    case 'openrouter':
    default:
      apiKey = state.apiKey;
      endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      modelToUse = state.selectedModel || 'openrouter/free';
      headers['Authorization'] = `Bearer ${apiKey}`;
      headers['HTTP-Referer'] = window.location.origin;
      headers['X-Title'] = 'Flow OS';
      useProxy = true;
      break;
  }

  console.log('Using model:', modelToUse, 'via provider:', provider);
  
  if (!apiKey && provider !== 'custom') {
    onError(`${provider.toUpperCase()} API Key is missing. Please configure it in Settings.`);
    return;
  }

  if (!endpoint) {
    onError(`Custom Endpoint URL is missing. Please configure it in Settings.`);
    return;
  }

  // Proposed optimization feature
  let finalPrompt = prompt;
  if (state.flowOptimizerEnabled) {
    finalPrompt = `${prompt}\n\n[Optimizer directive: Act as an expert Software Engineer. You MUST strictly format all generated or modified files in standard full complete blocks like this:\n### File: /src/App.tsx\n\`\`\`tsx\n// complete code\n\`\`\`\nDo not truncate files or use placeholders like "// ... rest of code". Return full file contents.]`;
  }

  const userMessage = { role: 'user' as const, content: finalPrompt };

  // Prepare standard/Anthropic payload
  let payload: any;
  if (provider === 'anthropic') {
    payload = {
      model: modelToUse,
      messages: [
        ...state.messages.slice(0, -2).map(m => ({ role: m.role === 'system' ? 'user' : m.role, content: m.content })),
        userMessage
      ],
      max_tokens: 4000,
      stream: true
    };
  } else {
    payload = {
      model: modelToUse,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...state.messages.slice(0, -2).map(m => ({ role: m.role, content: m.content })),
        userMessage
      ],
      stream: true
    };
  }

  let fetchUrl = endpoint;
  let fetchBody: any;

  if (useProxy) {
    fetchUrl = '/api/chat-proxy';
    fetchBody = {
      url: endpoint,
      headers,
      body: payload
    };
    headers = { 'Content-Type': 'application/json' };
  } else {
    fetchBody = payload;
  }

  const headersToLog = useProxy ? (fetchBody.headers || headers) : headers;
  const logEntry = {
    timestamp: new Date().toLocaleTimeString(),
    provider,
    endpoint: fetchUrl === '/api/chat-proxy' ? `${endpoint} (via server proxy)` : endpoint,
    headers: maskHeaders(headersToLog),
    payload: {
      model: modelToUse,
      messagesCount: (payload.messages || []).length,
      stream: true
    }
  };

  try {
    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(fetchBody),
      signal
    });

    const respHeaders: Record<string, string> = {};
    try {
      response.headers.forEach((val, key) => {
        respHeaders[key] = val;
      });
    } catch (e) {
      // ignore
    }

    if (!response.ok) {
      let errorMsg = '';
      try {
        const errorText = await response.text();
        try {
          const errObj = JSON.parse(errorText);
          errorMsg = errObj.error?.message || errObj.error || errorText;
        } catch (e) {
          errorMsg = errorText;
        }
      } catch (err) {
        errorMsg = 'Unknown error occurred';
      }

      state.addDiagnosticLog({
        ...logEntry,
        status: response.status,
        statusText: response.statusText,
        responseHeaders: respHeaders,
        errorMessage: errorMsg
      });

      onError(`API Error (${response.status}): ${errorMsg}`);
      return;
    }

    // Success diagnostic log
    state.addDiagnosticLog({
      ...logEntry,
      status: response.status,
      statusText: response.statusText || 'OK',
      responseHeaders: respHeaders
    });

    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullContent = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      
      let boundary = buffer.indexOf('\n');
      while (boundary !== -1) {
        const line = buffer.slice(0, boundary).trim();
        buffer = buffer.slice(boundary + 1);
        
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim();
          if (dataStr !== '[DONE]') {
            try {
              const data = JSON.parse(dataStr);
              let delta = '';
              
              if (data.choices?.[0]?.delta?.content) {
                delta = data.choices[0].delta.content;
              } else if (data.delta?.text) {
                delta = data.delta.text;
              } else if (data.type === 'content_block_delta' && data.delta?.text) {
                delta = data.delta.text;
              } else if (data.type === 'message_delta' && data.delta?.text) {
                delta = data.delta.text;
              }
              
              fullContent += delta;
              
              onChunk(fullContent);
              const now = Date.now();
              if (now - lastFileParseTime > 50) {
                parseAndCommitFiles(fullContent, state.updateFiles);
                lastFileParseTime = now;
              }
            } catch (e) {
              // Ignore transient JSON parse errors due to mid-stream parsing
            }
          }
        }
        boundary = buffer.indexOf('\n');
      }
    }
    
    // Final parse just to be safe
    parseAndCommitFiles(fullContent, state.updateFiles);
    onComplete();
    
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.log('Stream aborted by user');
    } else {
      state.addDiagnosticLog({
        ...logEntry,
        errorMessage: err.message || String(err)
      });
      onError(err.message || 'A network error occurred');
    }
  }
}

// Regex to extract blocks that look like:
// ### File: /path/to/file.tsx
// ```tsx
// code
// ```
function parseAndCommitFiles(markdown: string, updateFiles: (files: FileSystem) => void) {
  const state = useStore.getState();
  const fileRegex = /###\s*File:\s*([^\n]+)\s*\n(?:```[a-z]*\n)?([\s\S]*?)(?:```|$)/g;
  let match;
  const newFiles: FileSystem = {};
  let hasActualChange = false;
  
  while ((match = fileRegex.exec(markdown)) !== null) {
      let path = match[1].trim();
      
      if (path === 'App.tsx' || path === 'src/App.tsx' || path === '/src/App.tsx') {
         path = '/App.tsx';
      } else if (!path.startsWith('/')) {
         path = '/' + path;
      }
      
      const code = match[2].trim();
      
      if (code && !code.startsWith('//') && state.files[path]?.code !== code) {
        newFiles[path] = { code };
        hasActualChange = true;
      }
  }

  // Fallback for smaller/free models
  if (!hasActualChange) {
     const fallbackRegex = /```(?:tsx|jsx|js|ts|javascript|typescript|react|[a-zA-Z]*)\n([\s\S]*?)(?:```|$)/g;
     let fallbackMatch;
     while ((fallbackMatch = fallbackRegex.exec(markdown)) !== null) {
         const code = fallbackMatch[1].trim();
         if (code && !code.startsWith('//') && state.files['/App.tsx']?.code !== code) {
             newFiles['/App.tsx'] = { code };
             hasActualChange = true;
         }
     }
  }
  
  if (hasActualChange) {
      updateFiles(newFiles);
  }
}
