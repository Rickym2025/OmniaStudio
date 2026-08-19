/**
 * OmniaStudio PRO - Chatbot Omnia AI
 */
const OMNIA_CHAT_WEBHOOK = "https://n8n.rmstudio.app/webhook/omnia-chat";

let chatSessionId = localStorage.getItem('os_chat_session') || ('os_' + Math.random().toString(36).substring(7));
localStorage.setItem('os_chat_session', chatSessionId);

let chatIsOpen = window.innerWidth > 900; 

function injectChatbot() {
  let container = document.getElementById('chatbot-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'chatbot-container';
    document.body.appendChild(container);
  }

  container.innerHTML = `
    <style>
      #os-bubble { position:fixed; bottom:30px; left:30px; width:65px; height:65px; border-radius:50%; background:var(--accent); box-shadow:0 10px 25px rgba(0,123,255,.4); cursor:pointer; z-index:9999; display:flex; align-items:center; justify-content:center; border:2px solid #050505; transition:transform .3s; }
      #os-bubble:hover { transform:scale(1.1); }
      #os-window { position:fixed; bottom:110px; left:30px; width:360px; height:550px; background:rgba(10,10,10,0.95); backdrop-filter:blur(15px); border-radius:20px; box-shadow:0 20px 60px rgba(0,0,0,.8); z-index:9999; display:none; flex-direction:column; overflow:hidden; font-family:'Segoe UI',sans-serif; border:1px solid rgba(0,123,255,0.3); }
      .os-header { background:rgba(0,0,0,0.8); border-bottom:1px solid rgba(255,255,255,0.1); color:white; padding:16px 20px; font-weight:700; display:flex; justify-content:space-between; align-items:center; }
      .os-messages { flex:1; padding:20px; overflow-y:auto; display:flex; flex-direction:column; gap:14px; scroll-behavior:smooth; }
      .os-msg { padding:12px 16px; border-radius:15px; font-size:14px; max-width:85%; line-height:1.5; }
      .os-msg.bot  { background:rgba(255,255,255,0.05); color:white; border:1px solid rgba(255,255,255,0.1); align-self:flex-start; border-bottom-left-radius:4px; }
      .os-msg.user { background:var(--accent); color:white; font-weight:500; align-self:flex-end; border-bottom-right-radius:4px; }
      .os-msg b { font-weight:700; color:#00ffcc; }
      .os-chips { display:flex; flex-wrap:wrap; gap:8px; padding:0 20px 20px; }
      .os-chip { background:rgba(0,123,255,0.1); border:1px solid var(--accent); color:white; padding:8px 14px; border-radius:20px; font-size:12px; cursor:pointer; transition:.2s; }
      .os-chip:hover { background:var(--accent); }
      .os-input-area { padding:15px; border-top:1px solid rgba(255,255,255,0.1); display:flex; gap:10px; background:rgba(0,0,0,0.8); }
      .os-input-area input { flex:1; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:10px 14px; outline:none; font-size:14px; color:white; background:rgba(255,255,255,0.05); }
      .os-input-area input:focus { border-color:var(--accent); }
      .os-input-area button { background:var(--accent); border:none; border-radius:8px; color:white; cursor:pointer; font-weight:bold; padding:0 16px; transition:.2s; }
      .os-input-area button:hover { transform:translateY(-2px); box-shadow:0 5px 15px rgba(0,123,255,0.4); }
      .typing-dot { width:5px; height:5px; background:var(--accent); border-radius:50%; display:inline-block; animation:ostyping 1.4s infinite ease-in-out; margin-right:3px; }
      .typing-dot:nth-child(2) { animation-delay:.2s; }
      .typing-dot:nth-child(3) { animation-delay:.4s; }
      @keyframes ostyping { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
      @media(max-width:450px) { #os-window { width:calc(100% - 40px); height:500px; left:20px; bottom:90px; } #os-bubble { bottom:20px; left:20px; } }
    </style>

    <div id="os-bubble" title="Parla con Omnia AI">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    </div>

    <div id="os-window">
      <div class="os-header">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:20px;">🛡️</span>
          <div style="display:flex;flex-direction:column;">
            <span style="font-size:15px;">Omnia AI</span>
            <span style="font-size:10px;color:#00ffcc;">● Privacy garantita</span>
          </div>
        </div>
        <button id="os-close-btn" style="background:none;border:none;color:#94a3b8;font-size:24px;cursor:pointer;">&times;</button>
      </div>
      <div id="os-messages" class="os-messages">
        <div class="os-msg bot">
          Benvenuto! Sono <b>Omnia AI</b>. 🛡️<br><br>
          Posso rispondere a qualsiasi domanda su come funziono offline e su come proteggo i tuoi documenti legali e aziendali.<br><br>Cosa vuoi sapere?
        </div>
      </div>
      <div id="os-chips-container" class="os-chips">
        <div class="os-chip" onclick="sendOsMsg('Funziona senza internet?')">Senza internet?</div>
        <div class="os-chip" onclick="sendOsMsg('È un abbonamento?')">Abbonamento?</div>
        <div class="os-chip" onclick="sendOsMsg('Che documenti legge?')">Legge i PDF?</div>
      </div>
      <div class="os-input-area">
        <input type="text" id="os-input" placeholder="Chiedimi qualcosa..." onkeypress="if(event.key==='Enter') sendOsMsg()">
        <button onclick="sendOsMsg()">Invia</button>
      </div>
    </div>
  `;

  document.getElementById('os-bubble').addEventListener('click', toggleOsChat);
  document.getElementById('os-close-btn').addEventListener('click', toggleOsChat);
  document.getElementById('os-window').style.display = chatIsOpen ? 'flex' : 'none';
}

function toggleOsChat() {
  const win = document.getElementById('os-window');
  chatIsOpen = !chatIsOpen;
  win.style.display = chatIsOpen ? 'flex' : 'none';
}

async function sendOsMsg(textOverride) {
  const input = document.getElementById('os-input');
  const text = (textOverride || input.value).trim();
  if (!text) return;

  input.value = '';
  addOsMsg(text, 'user');

  const chips = document.getElementById('os-chips-container');
  if (chips) chips.style.display = 'none';

  const loadingId = 'loading-' + Date.now();
  addOsMsg('<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>', 'bot', loadingId);

  try {
    const res = await fetch(OMNIA_CHAT_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, sessionId: chatSessionId }),
      signal: AbortSignal.timeout(15000)
    });

    const raw = await res.text();
    let reply = 'Sto analizzando i dati...';
    if (raw && raw.trim() !== '') {
      try {
        const data = JSON.parse(raw);
        reply = data.output || data.response || data.text || reply;
      } catch (_) { reply = raw; }
    }

    document.getElementById(loadingId)?.remove();
    addOsMsg(reply, 'bot');

  } catch (err) {
    document.getElementById(loadingId)?.remove();
    addOsMsg('Scusami, i server sono momentaneamente occupati. Riprova tra poco.', 'bot');
  }
}

function addOsMsg(text, sender, id) {
  const div = document.createElement('div');
  div.className = `os-msg ${sender}`;
  if (id) div.id = id;
  div.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
  const box = document.getElementById('os-messages');
  box.appendChild(div);
  box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', injectChatbot);
