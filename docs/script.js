/* ============================= */
/* FitBuddy AI – Live Agent JS   */
/* (Direct n8n Webhook Version)  */
/* ============================= */

const chatWindow = document.getElementById('chatWindow');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const statusEl = document.getElementById('status');

/* ============================= */
/* CONFIG – PRODUCTION WEBHOOK   */
/* ============================= */

const DIRECT_WEBHOOK_URL =
  'https://w3naut.app.n8n.cloud/webhook/99c8f926-6555-4aab-a06d-22f827ec00b3';

/* ============================= */
/* UI HELPERS                    */
/* ============================= */

function appendMessage(text, role = 'ai') {
  const msg = document.createElement('div');
  msg.className = `msg ${role}`;
  msg.textContent = text;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function appendTyping() {
  const wrapper = document.createElement('div');
  wrapper.className = 'msg ai';

  const typing = document.createElement('div');
  typing.className = 'typing';
  typing.innerHTML = '<span></span><span></span><span></span>';

  wrapper.appendChild(typing);
  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  return wrapper;
}

function removeNode(node) {
  if (node && node.parentNode) {
    node.parentNode.removeChild(node);
  }
}

function setStatus(text) {
  statusEl.textContent = text || '';
}

/* ============================= */
/* WEBHOOK CALL (DIRECT)         */
/* ============================= */

async function sendToWebhook(payload) {
  const res = await fetch(
    'https://w3naut.app.n8n.cloud/webhook/99c8f926-6555-4aab-a06d-22f827ec00b3',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Webhook error ${res.status}: ${text}`);
  }

  if (!text) return { text: 'No response received.' };

  try {
    return JSON.parse(text);
  } catch {
    return { text };
  }
}


/* ============================= */
/* RESPONSE PARSER               */
/* ============================= */

function extractReply(data) {
  if (!data) return null;
  if (typeof data === 'string') return data;

  // Common n8n / AI agent fields
  if (data.reply) return data.reply;
  if (data.output) return data.output;
  if (data.text) return data.text;
  if (data.message) return data.message;

  // Nested fallback
  if (data.data) {
    if (data.data.reply) return data.data.reply;
    if (data.data.output) return data.data.output;
    if (data.data.text) return data.data.text;
    if (data.data.message) return data.data.message;
  }

  // Last resort
  return JSON.stringify(data);
}

/* ============================= */
/* FORM HANDLER                  */
/* ============================= */

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const userText = chatInput.value.trim();
  if (!userText) return;

  chatInput.value = '';
  appendMessage(userText, 'user');

  const typingNode = appendTyping();
  setStatus('Thinking…');

  try {
    const payload = {
  message: userText,
  input: userText,
  text: userText,
  question: userText,
  prompt: userText
};


    const data = await sendToWebhook(payload);
    const reply = extractReply(data) || 'No response received.';

    removeNode(typingNode);
    appendMessage(reply, 'ai');
    setStatus('');
  } catch (err) {
    console.error(err);
    removeNode(typingNode);
    appendMessage(
      'Sorry, the assistant is temporarily unavailable. Please try again.',
      'system'
    );
    setStatus('');
  }
});

/* ============================= */
/* INITIAL MESSAGE               */
/* ============================= */

appendMessage(
  "Ready to work?",
  'ai'
);
