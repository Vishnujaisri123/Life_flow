const GROK_URL = 'https://api.x.ai/v1/chat/completions';

/**
 * @param {{ messages: Array<{ role: string, content: string }>, model?: string }} params
 */
async function chatCompletion({ messages, model }) {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    const err = new Error('Grok API is not configured on the server');
    err.code = 'GROK_MISSING';
    throw err;
  }

  const selectedModel = model || process.env.GROK_MODEL || 'grok-beta';

  const res = await fetch(GROK_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
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
      `Grok request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  const content = body?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error('Empty response from Grok');
  }

  return {
    content: content.trim(),
    model: body?.model || selectedModel,
    usage: body?.usage || null,
  };
}

module.exports = { chatCompletion };
