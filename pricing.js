/**
 * OmniaStudio PRO - Live Pricing & Stripe On-The-Fly Checkout
 * RM Studio Universal Engine
 */

const SUPABASE_S2_URL = 'https://jhijfulhntlhcytbhcly.supabase.co';
const SUPABASE_S2_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoaWpmdWxobnRsaGN5dGJoY2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MzcxODcsImV4cCI6MjA5ODMxMzE4N30.z062NW4ApClll-XWHH2ufmcCleBRNHUUdKO6FiLa0TQ';

// 1. Prezzo di Fallback Immediato (Zero Flicker)
let OMNIA_PRICE = 699;

// 2. Render Reattivo del DOM
function renderOmniaPrice() {
  const el = document.getElementById("price-display");
  if (el) {
    el.innerText = `€ ${OMNIA_PRICE.toFixed(2).replace('.', ',')}`;
  }
}

// 3. Fetch Live da Supabase S2 (Tabella saas_pricing)
async function initOmniaPricing() {
  try {
    const res = await fetch(`${SUPABASE_S2_URL}/rest/v1/saas_pricing?saas=eq.omniastudio&plan_id=eq.lifetime&select=*`, {
      headers: {
        'apikey': SUPABASE_S2_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_S2_ANON_KEY}`
      },
      cache: 'no-store'
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].price) {
        OMNIA_PRICE = Number(data[0].price);
        renderOmniaPrice();
      }
    }
  } catch (e) {
    console.warn("Utilizzo prezzo locale fallback OmniaStudio:", e);
  }
}

// 4. Avvio Checkout Stripe On-The-Fly via n8n
async function pagaConStripe() {
  const input = document.getElementById('deviceCodeInput');
  const deviceCode = input ? input.value.trim() : '';

  if (!deviceCode || deviceCode.length < 5) {
    alert("Per favore, inserisci un Codice Dispositivo valido generato dal software OmniaStudio.");
    if (input) input.focus();
    return;
  }

  const origin = window.location.origin;
  const payload = {
    progetto: "OmniaStudio",
    portal_type: "omniastudio",
    title: "OmniaStudio PRO • Licenza Lifetime",
    price: OMNIA_PRICE,
    ricarica_tipo: "lifetime",
    agency_id: deviceCode,
    project_id: deviceCode,
    origin: origin,
    success_url: `${origin}/?success=true&code=${encodeURIComponent(deviceCode)}`,
    cancel_url: `${origin}/#acquista`
  };

  const btn = document.querySelector("#acquista button");
  if (btn) {
    btn.innerText = "Apertura Checkout Sicuro...";
    btn.style.opacity = "0.7";
    btn.style.pointerEvents = "none";
  }

  try {
    const res = await fetch("https://n8n.rmstudio.app/webhook/crea-sessione-stripe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Errore creazione sessione Stripe");
    const data = await res.json();
    const redirectUrl = data.url || data.checkout_url || data.session_url;

    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      throw new Error("URL Stripe mancante");
    }
  } catch (err) {
    console.error("Errore checkout OmniaStudio:", err);
    alert("Impossibile avviare il pagamento. Riprova tra poco.");
  } finally {
    if (btn) {
      btn.innerText = "💳 Acquista e Sblocca Ora";
      btn.style.opacity = "1";
      btn.style.pointerEvents = "auto";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderOmniaPrice();
  initOmniaPricing();
});
