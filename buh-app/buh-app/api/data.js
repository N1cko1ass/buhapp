// api/data.js — Общее хранилище данных через Vercel KV (Redis)
// Все пользователи видят и редактируют одни данные

import { kv } from '@vercel/kv';

const DATA_KEY = 'buh_shared_data';

const DEFAULT_DATA = {
  rates: {
    hourly: [
      { id: 'elec', name: 'Электричество', val: 25 },
      { id: 'nozzle', name: 'Сопло (износ)', val: 28 },
      { id: 'plate', name: 'Пластина (износ)', val: 1 }
    ],
    perBatch: [
      { id: 'amor', name: 'Амортизация', val: 285 },
      { id: 'glue', name: 'Клей', val: 2 },
      { id: 'lub', name: 'Смазка', val: 20 },
      { id: 'paper', name: 'Бумага', val: 1 }
    ],
    rent: [{ id: 'rent', name: 'Аренда полки (в неделю)', val: 2000 }],
    plastic: { id: 'plastic', name: 'Пластик', val: 11 }
  },
  materials: [
    { id: 'm1', name: 'Баночки', val: 23.5 },
    { id: 'm2', name: 'Кольца', val: 20 },
    { id: 'm3', name: 'Цепочка 6 см', val: 50 },
    { id: 'm4', name: 'Краска (1 цвет)', val: 24 }
  ],
  tovary: [
    { id: 't1', name: 'Вязанные собачки', plastic: 21.53, qty: 6, hours: 19.8, price: 0, mats: [] },
    { id: 't2', name: 'Брелки собачки', plastic: 13.86, qty: 16, hours: 16.8, price: 0, mats: [{ mid: 'm2', qty: 1 }, { mid: 'm3', qty: 1 }] },
    { id: 't3', name: 'Собака из мема на серфе', plastic: 40, qty: 2, hours: 4.4, price: 0, mats: [{ mid: 'm4', qty: 4 }] }
  ],
  nedeli: [
    { id: 'n1', week: '4–10 мая 2026', rashod: 0, vyr: 0 },
    { id: 'n2', week: '11–17 мая 2026', rashod: 0, vyr: 0 },
    { id: 'n3', week: '18–24 мая 2026', rashod: 0, vyr: 0 }
  ]
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      let data = await kv.get(DATA_KEY);
      if (!data) {
        data = DEFAULT_DATA;
        await kv.set(DATA_KEY, data);
      }
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const newData = req.body;
      if (!newData || typeof newData !== 'object') {
        return res.status(400).json({ error: 'Неверный формат данных' });
      }
      await kv.set(DATA_KEY, newData);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('KV error:', err);
    // Fallback: если KV не настроен, возвращаем данные из тела запроса
    if (req.method === 'GET') {
      return res.status(200).json(DEFAULT_DATA);
    }
    return res.status(500).json({ error: 'Ошибка базы данных' });
  }
}
