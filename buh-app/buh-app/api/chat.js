// api/chat.js — Serverless функция для Gemini
// API ключ хранится в переменных окружения Vercel (недоступен пользователям)

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API ключ не настроен. Добавьте GEMINI_API_KEY в настройки Vercel.' });
  }

  try {
    const { messages, systemPrompt } = req.body;

    // Собираем историю для Gemini
    const contents = [];
    if (messages && messages.length > 0) {
      for (const msg of messages) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
    }

    const body = {
      system_instruction: {
        parts: [{ text: systemPrompt || 'Ты — бизнес-советник для малого бизнеса.' }]
      },
      contents,
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7
      }
    };

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    const data = await resp.json();

    if (!resp.ok) {
      console.error('Gemini error:', data);
      return res.status(resp.status).json({ error: data.error?.message || 'Ошибка Gemini API' });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Нет ответа';
    return res.status(200).json({ reply: text });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
}
