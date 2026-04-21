import { useStore, FileSystem } from '../store/index';

const SYSTEM_PROMPT = "";

export async function generateCodeStream(
  prompt: string,
  onChunk: (content: string) => void,
  onComplete: () => void,
  onError: (error: string) => void,
  signal?: AbortSignal
) {
  const state = useStore.getState();
  const apiKey = state.apiKey;
  
  if (!apiKey) {
    onError('OpenRouter API Key is missing. Please configure it in the sidebar.');
    return;
  }

  const userMessage = { role: 'user' as const, content: prompt };
  
  // Create payload
  const payload = {
    model: state.selectedModel,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...state.messages.map(m => ({ role: m.role, content: m.content })),
      userMessage
    ],
    stream: true,
  };

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin, // Required by OpenRouter
        'X-Title': 'DevAgent OS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      onError(`API Error (${response.status}): ${errorText}`);
      return;
    }

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
                    const delta = data.choices[0]?.delta?.content || '';
                    fullContent += delta;
                    
                    onChunk(fullContent);
                    parseAndCommitFiles(fullContent, state.updateFiles);
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
        onError(err.message || 'An network error occurred');
    }
  }
}

// Regex to extract blocks that look like:
// ### File: /path/to/file.tsx
// ```tsx
// code
// ```
function parseAndCommitFiles(markdown: string, updateFiles: (files: FileSystem) => void) {
  // A more robust regex that can handle partial streaming codes temporarily 
  // by attempting to match from ### File: to the closing ``` or end of string.
  
  const fileRegex = /###\s*File:\s*([^\n]+)\s*\n(?:```[a-z]*\n)?([\s\S]*?)(?:```|$)/g;
  let match;
  const newFiles: FileSystem = {};
  let anyMatch = false;
  
  while ((match = fileRegex.exec(markdown)) !== null) {
      let path = match[1].trim();
      
      // Enforce the /App.tsx mapping if the AI gets confused about NextJS vs standalone React routing inside Sandpack natively.
      if (path === 'App.tsx' || path === 'src/App.tsx' || path === '/src/App.tsx') {
         path = '/App.tsx';
      } else if (!path.startsWith('/')) {
         path = '/' + path; // ensure leading slash
      }
      
      const code = match[2].trim();
      
      // Prevent picking up trailing empty blocks while streaming
      if (code && !code.startsWith('//')) {
        newFiles[path] = { code };
        anyMatch = true;
      }
  }

  // Fallback for smaller/free models that ignore the prompt and just spit out raw code blocks
  if (!anyMatch) {
     const fallbackRegex = /```(?:tsx|jsx|js|ts|javascript|typescript|react|[a-zA-Z]*)\n([\s\S]*?)(?:```|$)/g;
     let fallbackMatch;
     while ((fallbackMatch = fallbackRegex.exec(markdown)) !== null) {
         const code = fallbackMatch[1].trim();
         if (code && !code.startsWith('//')) {
             newFiles['/App.tsx'] = { code };
             anyMatch = true;
         }
     }
  }
  
  if (anyMatch) {
      updateFiles(newFiles);
  }
}
