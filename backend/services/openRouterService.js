const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * @param {{ messages: Array<{ role: string, content: string }>, model?: string }} params
 */
async function chatCompletion({ messages, model }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    const err = new Error('OpenRouter is not configured on the server');
    err.code = 'OPENROUTER_MISSING';
    throw err;
  }

  const selectedModel =
    model || process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:5173',
      'X-Title': process.env.OPENROUTER_APP_NAME || 'LifeFlow AI',
    },
    body: JSON.stringify({
      model: selectedModel,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      body?.error?.message ||
      body?.message ||
      `OpenRouter request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  const content = body?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error('Empty response from OpenRouter');
  }

  return {
    content: content.trim(),
    model: body?.model || selectedModel,
    usage: body?.usage || null,
  };
}

module.exports = { chatCompletion };
