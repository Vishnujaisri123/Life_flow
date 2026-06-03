/**
 * Multi-provider AI Service
 * Supports: openrouter, grok, gemini, openai
 */

// Simple fetch wrapper for OpenAI-compatible endpoints (OpenRouter, Grok, OpenAI)
async function callOpenAICompatible(url, apiKey, model, messages, systemInstruction) {
  const formattedMessages = [];
  if (systemInstruction) {
    formattedMessages.push({ role: 'system', content: systemInstruction });
  }
  
  // Filter out system from original messages since we just added it
  const cleanMessages = messages.filter(m => m.role !== 'system');
  formattedMessages.push(...cleanMessages);

  const payload = {
    model: model,
    messages: formattedMessages,
    temperature: 0.7,
    max_tokens: 2048
  };

  // Special headers for OpenRouter
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = body?.error?.message || body?.message || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  const text = body?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('Empty response from AI provider');
  }

  return text.trim();
}

async function callGemini(apiKey, messages, systemInstruction) {
  const contents = [];
  for (const m of messages) {
    if (m.role !== 'system') {
      contents.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m.content) }],
      });
    }
  }

  const payload = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  if (systemInstruction) {
    payload.system_instruction = { parts: { text: systemInstruction } };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = body?.error?.message || body?.message || `Gemini request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  const text = body?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  return text.trim();
}

const PROVIDERS = {
  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    getModel: () => 'google/gemini-2.5-pro', // or whatever default openrouter model
    call: async (apiKey, msgs, sys) => callOpenAICompatible('https://openrouter.ai/api/v1/chat/completions', apiKey, 'google/gemini-2.5-pro', msgs, sys)
  },
  grok: {
    url: 'https://api.x.ai/v1/chat/completions',
    getModel: () => 'grok-2',
    call: async (apiKey, msgs, sys) => callOpenAICompatible('https://api.x.ai/v1/chat/completions', apiKey, 'grok-2', msgs, sys)
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    getModel: () => 'gpt-4o-mini',
    call: async (apiKey, msgs, sys) => callOpenAICompatible('https://api.openai.com/v1/chat/completions', apiKey, 'gpt-4o-mini', msgs, sys)
  },
  gemini: {
    url: '', // Uses specific endpoint format
    getModel: () => 'gemini-2.5-flash',
    call: async (apiKey, msgs, sys) => callGemini(apiKey, msgs, sys)
  }
};

const FALLBACK_CHAIN = ['openrouter', 'grok', 'gemini', 'openai'];

function getProviderKey(providerName) {
  if (providerName === 'openrouter') return process.env.OPENROUTER_API_KEY;
  if (providerName === 'grok') return process.env.GROK_API_KEY;
  if (providerName === 'openai') return process.env.OPENAI_API_KEY;
  if (providerName === 'gemini') return process.env.GEMINI_API_KEY;
  return null;
}

async function chatCompletion({ messages }) {
  let systemInstruction = '';
  const cleanMessages = [];

  for (const m of messages) {
    if (m.role === 'system') {
      systemInstruction += m.content + '\n';
    } else {
      cleanMessages.push(m);
    }
  }
  systemInstruction = systemInstruction.trim();

  const preferredProvider = (process.env.AI_PROVIDER || 'openrouter').toLowerCase();
  
  // Re-order fallback chain to put preferred first
  const chain = [...FALLBACK_CHAIN];
  const prefIdx = chain.indexOf(preferredProvider);
  if (prefIdx > -1) {
    chain.splice(prefIdx, 1);
    chain.unshift(preferredProvider);
  }

  const startTime = Date.now();
  let lastError = null;

  for (const providerName of chain) {
    const provider = PROVIDERS[providerName];
    const apiKey = getProviderKey(providerName);
    
    if (!apiKey) {
      console.warn(`[AI Service] Skipping ${providerName}, no API key found.`);
      continue;
    }

    try {
      console.log(`[AI Service] Attempting request via ${providerName}...`);
      const content = await provider.call(apiKey, cleanMessages, systemInstruction);
      
      const responseTime = Date.now() - startTime;
      
      return {
        content,
        model: provider.getModel(),
        provider: providerName,
        responseTime,
      };
    } catch (err) {
      console.error(`[AI Service] Provider ${providerName} failed:`, err.message);
      lastError = err;
      // Continue to next provider in fallback chain
    }
  }

  // If we exhaust the chain
  if (lastError) {
    throw lastError;
  } else {
    const err = new Error('No AI providers are configured with valid API keys.');
    err.code = 'NO_PROVIDERS_CONFIGURED';
    err.status = 503;
    throw err;
  }
}

module.exports = { chatCompletion };
