/**
 * OmniaStudio PRO - Live Pricing & Stripe On-The-Fly Checkout
 * RM Studio Universal Engine
 */
let OMNIA_PRICE = 699;

async function initOmniaPricing() {
  try {
    const res = await fetch("https://zqkqlhosyjvxdwfjmwwb.supabase.co/rest/v1/saas_pricing?saas=eq.omniastudio&select=*");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].price) {
        OMNIA_PRICE = Number(data[0].price);
      }
    }
  } catch (e) {
    console.warn("Prezzi locali OmniaStudio:", e);
  }

  const el = document.getElementById("price-display");
  if (el) el.innerText = `€ ${OMNIA_PRICE.toFixed(2).replace('.', ',')}`;
}

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

document.addEventListener("DOMContentLoaded", initOmniaPricing);
