/**
 * @param {{ messages: Array<{ role: string, content: string }> }} params
 */
async function chatCompletion({ messages }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error('Gemini API is not configured on the server');
    err.code = 'GEMINI_MISSING';
    throw err;
  }

  let systemInstruction = '';
  const contents = [];

  for (const m of messages) {
    if (m.role === 'system') {
      systemInstruction += m.content + '\n';
    } else {
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

  if (systemInstruction.trim()) {
    payload.system_instruction = { parts: { text: systemInstruction.trim() } };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      body?.error?.message ||
      body?.message ||
      `Gemini request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  const text = body?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  return {
    content: text.trim(),
    model: 'gemini-2.5-flash',
  };
}

module.exports = { chatCompletion };
