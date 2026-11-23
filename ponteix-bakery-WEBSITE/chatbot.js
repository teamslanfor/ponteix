/* Ponteix Bakery & Restaurant – scripted chat assistant (no AI service, no dependencies). */
(function () {
  'use strict';
  const S = window.SITE || {};
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const css = `
  .lt-btn{position:fixed;right:18px;bottom:18px;z-index:70;display:flex;align-items:center;gap:10px;padding:8px 20px 8px 8px;border:0;border-radius:999px;background:#8f2f22;color:#fff;font:800 .95rem 'Zilla Slab',Georgia,serif;cursor:pointer;box-shadow:0 14px 30px -12px rgba(60,30,20,.6);transition:transform .35s cubic-bezier(.22,.7,.2,1),box-shadow .35s}
  .lt-btn:hover{transform:translateY(-3px);box-shadow:0 18px 34px -12px rgba(60,30,20,.7)}
  .lt-btn i{width:40px;height:40px;border-radius:50%;background:#f7e7c4;display:grid;place-items:center;font-style:normal;font-size:1.3rem}
  .lt-panel{position:fixed;right:18px;bottom:90px;z-index:71;width:min(370px,calc(100vw - 36px));height:min(540px,calc(100vh - 120px));background:#fff;border-radius:24px;box-shadow:0 30px 70px -24px rgba(43,27,46,.55);display:flex;flex-direction:column;overflow:hidden;transform:translateY(16px) scale(.97);opacity:0;pointer-events:none;transition:all .35s cubic-bezier(.22,.7,.2,1)}
  .lt-panel.open{transform:none;opacity:1;pointer-events:auto}
  .lt-head{background:#8f2f22;color:#fff;padding:15px 18px;display:flex;align-items:center;gap:12px}
  .lt-head b{display:block;font:800 1.15rem 'Zilla Slab',Georgia,serif}
  .lt-head small{color:#f3d9cf;font-size:.78rem}
  .lt-head .x{margin-left:auto;background:rgba(255,255,255,.15);border:0;color:#fff;width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:1rem}
  .lt-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#fbf6ec}
  .lt-m{max-width:86%;padding:10px 14px;border-radius:18px;font-size:.93rem;line-height:1.5;white-space:pre-line;animation:ltIn .35s ease both}
  .lt-m a{color:#8f2f22;font-weight:800}
  .lt-bot{background:#fff;border:1px solid #eadfcb;border-bottom-left-radius:5px;color:#3b3040}
  .lt-me{align-self:flex-end;background:#8f2f22;color:#fff;border-bottom-right-radius:5px}
  .lt-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 10px;background:#fbf6ec}
  .lt-chips button{border:2px solid #8f2f22;background:#fff;color:#8f2f22;border-radius:999px;padding:5px 12px;font:700 .82rem 'Karla',system-ui,sans-serif;cursor:pointer;transition:all .25s}
  .lt-chips button:hover{background:#8f2f22;color:#f7e7c4}
  .lt-form{display:flex;gap:8px;padding:12px;border-top:1px solid #eadfcb;background:#fff}
  .lt-form input{flex:1;min-width:0;border:2px solid #eadfcb;border-radius:14px;padding:10px 14px;font:inherit;font-size:.94rem}
  .lt-form input:focus{outline:none;border-color:#8f2f22}
  .lt-form button{width:44px;height:44px;border-radius:14px;border:0;background:#8f2f22;color:#fff;cursor:pointer;display:grid;place-items:center}
  .lt-form svg{width:18px;height:18px}
  .lt-typing{display:inline-flex;gap:4px}.lt-typing span{width:6px;height:6px;border-radius:50%;background:#c9b8cc;animation:ltDot 1s infinite}.lt-typing span:nth-child(2){animation-delay:.15s}.lt-typing span:nth-child(3){animation-delay:.3s}
  @keyframes ltIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  @keyframes ltDot{0%,80%,100%{opacity:.3}40%{opacity:1}}
  @media (max-width:640px){.lt-btn span{display:none}.lt-btn{padding:6px;bottom:88px;right:14px}.lt-panel{bottom:150px;right:14px;height:min(500px,calc(100vh - 180px))}}
  @media (prefers-reduced-motion:reduce){.lt-m,.lt-panel{animation:none;transition:none}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const sendI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/></svg>';
  const root = document.createElement('div');
  root.innerHTML = `
  <button class="lt-btn" aria-expanded="false" aria-controls="lt-panel"><i aria-hidden="true">🥐</i><span>Ask us</span></button>
  <section class="lt-panel" id="lt-panel" role="dialog" aria-label="Chat with Ponteix Bakery &amp; Restaurant">
    <div class="lt-head"><div><b>Ponteix Bakery</b><small>Automated assistant · set answers</small></div><button class="x" aria-label="Close chat">✕</button></div>
    <div class="lt-body" aria-live="polite"></div>
    <div class="lt-chips"></div>
    <form class="lt-form"><label class="sr-only" for="lt-in">Type your message</label><input id="lt-in" autocomplete="off" placeholder="Ask about hours, the menu, orders…" maxlength="300"><button aria-label="Send">${sendI}</button></form>
  </section>`;
  document.body.appendChild(root);
  const btn = root.querySelector('.lt-btn'), panel = root.querySelector('.lt-panel'), body = root.querySelector('.lt-body'),
    chipBox = root.querySelector('.lt-chips'), form = root.querySelector('.lt-form'), input = root.querySelector('#lt-in');
  let started = false, busy = false;
  const add = (h, who = 'bot') => { const m = document.createElement('div'); m.className = 'lt-m lt-' + who; m.innerHTML = h; body.appendChild(m); body.scrollTop = body.scrollHeight; return m; };
  const say = (h, w = 420) => new Promise((r) => { const tp = add('<span class="lt-typing"><span></span><span></span><span></span></span>'); setTimeout(() => { tp.innerHTML = h; body.scrollTop = body.scrollHeight; r(); }, w); });
  const chips = (l) => { chipBox.innerHTML = ''; l.forEach((c) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = c; b.onclick = () => handle(c); chipBox.appendChild(b); }); };
  const MAIN = ['Opening hours', 'Bakery', 'Restaurant menu', 'Place an order', 'Find us'];
  const tel = () => `<a href="${S.phoneHref}">${S.phone}</a>`;
  const fb = () => `<a href="${S.facebook}" target="_blank" rel="noopener">Facebook</a>`;
  const contact = () => `📞 ${tel()}\n💬 <a href="${S.messenger}" target="_blank" rel="noopener">Facebook Messenger</a>${S.email ? `\n✉️ <a href="mailto:${S.email}">${esc(S.email)}</a>` : ''}\n📍 ${esc(S.address)}`;
  const intents = [
    { re: /hour|open|close|time|when|today|sunday|saturday|monday/i, run: () => say(`${S.hoursText.replace(/ · /g, '\n')}\nHours can change on holidays, so give us a call at ${tel()} if you’re not sure.`).then(() => chips(['Find us', 'Bakery'])) },
    { re: /order|dozen|large|party|pick ?up|ahead|reserve|catering|tray/i, run: () => say(`For bigger orders, like dozens of donuts or buns, please order ahead. Use the <a href="order.html">order form</a> or call ${tel()}.`).then(() => chips(['Opening hours', 'Contact'])) },
    { re: /donut|doughnut|eclair|éclair|muffin|cookie|bun|bread|bak|pastr|sweet|treat/i, run: () => say(`Fresh from our ovens: donuts, éclairs, muffins (banana chocolate chip is a favourite), oatmeal chocolate chip cookies and fresh buns. <a href="menu.html">See the menu</a>`).then(() => chips(['Place an order', 'Opening hours'])) },
    { re: /menu|lunch|breakfast|perog|pierog|sandwich|eat|food|restaurant|meal|special|soup|coffee/i, run: () => say(`In the restaurant: homestyle cooking, perogies, sandwiches on our fresh buns and good coffee. Ask about today’s special! <a href="menu.html?tab=kitchen">See the menu</a>`).then(() => chips(['Opening hours', 'Find us'])) },
    { re: /price|cost|how much|\$/i, run: () => say(`For current prices, please call ${tel()}. We’re happy to help!`).then(() => chips(MAIN)) },
    { re: /where|address|location|find|direction|park|centre|center|ponteix/i, run: () => say(`📍 ${esc(S.address)}\n<a href="contact.html#visit">Map & directions</a>`).then(() => chips(MAIN)) },
    { re: /allerg|gluten|nut|egg|dairy|vegan|dietary/i, run: () => say(`Please ask us about ingredients and allergies before ordering. Call ${tel()}.`).then(() => chips(MAIN)) },
    { re: /facebook|photo|picture|news|post/i, run: () => say(`Follow us on ${fb()} for news and specials.`).then(() => chips(MAIN)) },
    { re: /contact|phone|call|number|email|message|talk/i, run: () => say(`You can reach us here:\n${contact()}`).then(() => chips(MAIN)) },
    { re: /^(hi|hello|hey|bonjour|salut|good (morning|afternoon|evening))\b/i, run: () => say('Hello! Bonjour! What can we help you with?').then(() => chips(MAIN)) },
    { re: /thank|merci|cheers|great|perfect/i, run: () => say('You’re welcome. Merci! See you soon. 🥐').then(() => chips(MAIN)) },
  ];
  async function handle(text) {
    if (busy || !text.trim()) return;
    busy = true; add(esc(text), 'me');
    try {
      const map = { 'Opening hours': 'hours', 'Bakery': 'bakery', 'Restaurant menu': 'restaurant menu', 'Place an order': 'order', 'Find us': 'find location', 'Contact': 'contact' };
      const q = map[text] || text, hit = intents.find((i) => i.re.test(q));
      if (hit) { await hit.run(); return; }
      await say(`I don’t have a set answer for that one, but we can help:\n${contact()}`); chips(MAIN);
    } finally { busy = false; }
  }
  const open = async (s) => {
    panel.classList.toggle('open', s); btn.setAttribute('aria-expanded', String(s));
    if (s) { input.focus(); if (!started) { started = true; await say('Bienvenue! Welcome to <strong>Ponteix Bakery &amp; Restaurant</strong> on Centre Street. Ask me about our hours, the bakery, the menu or placing an order.', 300); chips(MAIN); } }
  };
  btn.addEventListener('click', () => open(!panel.classList.contains('open')));
  root.querySelector('.x').addEventListener('click', () => open(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panel.classList.contains('open')) open(false); });
  form.addEventListener('submit', (e) => { e.preventDefault(); const v = input.value; input.value = ''; handle(v); });
})();
