const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://w3naut.app.n8n.cloud/webhook/99c8f926-6555-4aab-a06d-22f827ec00b3';

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Static files
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/chat', async (req, res) => {
  try {
    const payload = {
      ...req.body,
      proxy: 'fitbuddy-proxy',
      receivedAt: new Date().toISOString(),
    };

    const r = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const contentType = r.headers.get('content-type') || '';
    const text = await r.text();

    if (!r.ok) {
      return res.status(r.status).send(text || `Upstream error ${r.status}`);
    }

    if (contentType.includes('application/json')) {
      try { return res.json(JSON.parse(text)); } catch {}
    }
    return res.type('text/plain').send(text);
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Proxy failed', message: String(err && err.message || err) });
  }
});

app.listen(PORT, () => {
  console.log(`FitBuddy AI site running on http://localhost:${PORT}`);
  console.log(`Proxy -> ${WEBHOOK_URL}`);
});
