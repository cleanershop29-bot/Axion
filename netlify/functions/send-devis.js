// Netlify Function — send-devis.js
// Protection : honeypot, rate limiting en mémoire, validation email, CORS

const rateMap = {};
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 3; // max 3 soumissions par IP par minute

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function isRateLimited(ip) {
  const now = Date.now();
  if (!rateMap[ip]) { rateMap[ip] = []; }
  rateMap[ip] = rateMap[ip].filter(t => now - t < RATE_LIMIT_WINDOW);
  if (rateMap[ip].length >= RATE_LIMIT_MAX) return true;
  rateMap[ip].push(now);
  return false;
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const KEY = process.env.RESEND_API_KEY;
  if (!KEY) return { statusCode: 500, body: 'Configuration error' };

  const clientIP = event.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(clientIP)) {
    return { statusCode: 429, body: JSON.stringify({ error: 'Trop de demandes. Réessayez dans une minute.' }) };
  }

  let d;
  try { d = JSON.parse(event.body); } catch(e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { nom, email, telephone, secteur, besoin, honeypot } = d;

  if (honeypot && honeypot.length > 0) {
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  if (!nom || !nom.trim() || nom.trim().length < 2) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Nom invalide.' }) };
  }
  if (!email || !isValidEmail(email.trim())) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Adresse email invalide.' }) };
  }

  const nomSafe = nom.trim().substring(0, 100);
  const emailSafe = email.trim().toLowerCase().substring(0, 200);
  const telSafe = (telephone || '').trim().substring(0, 30);
  const secteurSafe = (secteur || '').trim().substring(0, 100);

  const date = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const safebesoin = esc(besoin || 'Non configuré');
  const safeNom = esc(nomSafe);
  const safeTel = esc(telSafe || 'Non renseigné');
  const safeSecteur = esc(secteurSafe || 'Non renseigné');

  const logo = `<table cellpadding="0" cellspacing="0" border="0"><tr valign="middle">
    <td style="width:40px;height:40px;background:#0D0D1A;border-radius:11px;border:1.5px solid #7C3AED;text-align:center;vertical-align:middle;padding:0">
      <svg width="40" height="40" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
        <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7C3AED"/><stop offset="100%" stop-color="#FF6B35"/></linearGradient><linearGradient id="g2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#A855F7"/><stop offset="100%" stop-color="#FF6B35"/></linearGradient></defs>
        <path d="M18 56 L36 16 L54 56" stroke="url(#g1)" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <line x1="25" y1="41" x2="47" y2="41" stroke="url(#g2)" stroke-width="4" stroke-linecap="round"/>
      </svg>
    </td>
    <td style="padding-left:10px;font-family:system-ui,sans-serif;font-size:13px;font-weight:800;letter-spacing:.05em;color:#ffffff">AXION&nbsp;<span style="color:#A855F7">APP STUDIO</span></td>
  </tr></table>`;

  const htmlJeremy = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nouveau devis</title></head>
<body style="margin:0;padding:0;background:#07070F;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#07070F" style="background:#07070F;padding:28px 12px">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%">
  <tr><td style="padding-bottom:20px">${logo}</td></tr>
  <tr><td style="background:#0F0F1E;border:1px solid #2D1F6E;border-radius:16px;overflow:hidden">
    <tr><td style="background:linear-gradient(135deg,#4C1D95,#7C3AED);padding:22px 28px;border-radius:16px 16px 0 0">
      <p style="margin:0 0 3px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.15em;color:rgba(255,255,255,.55)">Nouvelle demande de devis</p>
      <h1 style="margin:0;font-size:20px;font-weight:800;color:#fff;letter-spacing:-.02em">${safeNom}</h1>
      <p style="margin:5px 0 0;font-size:11px;color:rgba(255,255,255,.45)">${date}</p>
    </td></tr>
    <tr><td style="padding:22px 28px 0">
      <p style="margin:0 0 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.13em;color:#A855F7">Contact</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border:1px solid rgba(255,255,255,.08);border-radius:10px;overflow:hidden">
        <tr><td style="padding:10px 14px;font-size:11px;color:rgba(255,255,255,.3);font-weight:600;width:90px;background:rgba(255,255,255,.02);border-bottom:1px solid rgba(255,255,255,.05)">Nom</td><td style="padding:10px 14px;font-size:13px;color:#fff;font-weight:600;border-bottom:1px solid rgba(255,255,255,.05)">${safeNom}</td></tr>
        <tr><td style="padding:10px 14px;font-size:11px;color:rgba(255,255,255,.3);font-weight:600;background:rgba(255,255,255,.02);border-bottom:1px solid rgba(255,255,255,.05)">Email</td><td style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.05)"><a href="mailto:${emailSafe}" style="font-size:13px;color:#A855F7;font-weight:600;text-decoration:none">${emailSafe}</a></td></tr>
        <tr><td style="padding:10px 14px;font-size:11px;color:rgba(255,255,255,.3);font-weight:600;background:rgba(255,255,255,.02);border-bottom:1px solid rgba(255,255,255,.05)">Téléphone</td><td style="padding:10px 14px;font-size:13px;color:rgba(255,255,255,.65);border-bottom:1px solid rgba(255,255,255,.05)">${safeTel}</td></tr>
        <tr><td style="padding:10px 14px;font-size:11px;color:rgba(255,255,255,.3);font-weight:600;background:rgba(255,255,255,.02)">Secteur</td><td style="padding:10px 14px;font-size:13px;color:rgba(255,255,255,.65)">${safeSecteur}</td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:20px 28px 0">
      <p style="margin:0 0 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.13em;color:#A855F7">Configuration simulateur</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="background:rgba(124,58,237,.1);border:1px solid rgba(124,58,237,.25);border-radius:10px;padding:16px 18px">
          <pre style="margin:0;font-size:12px;color:rgba(255,255,255,.7);white-space:pre-wrap;line-height:1.85;font-family:system-ui,sans-serif">${safebesoin}</pre>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:22px 28px 26px">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="background:#7C3AED;border-radius:9px">
          <a href="mailto:${emailSafe}?subject=Votre devis Axion App Studio&body=Bonjour ${safeNom},%0D%0A%0D%0AMerci pour votre demande." style="display:inline-block;padding:12px 22px;font-size:13px;font-weight:700;color:#fff;text-decoration:none;font-family:system-ui">Répondre à ${safeNom} →</a>
        </td></tr>
      </table>
    </td></tr>
  </td></tr>
  <tr><td style="padding:18px 0 0;text-align:center">
    <p style="margin:0;font-size:11px;color:rgba(255,255,255,.18);font-family:system-ui">Axion App Studio · SIRET 914 511 639 00025 · Saint-Ségal, Finistère, France</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  const htmlClient = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Demande bien reçue</title></head>
<body style="margin:0;padding:0;background:#EEEDF8;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#EEEDF8" style="background:#EEEDF8;padding:28px 12px">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%">
  <tr><td style="background:#0A0A14;border-radius:14px 14px 0 0;padding:20px 28px">${logo}</td></tr>
  <tr><td style="background:linear-gradient(135deg,#3B0F8C 0%,#7C3AED 45%,#C2410C 100%);padding:40px 28px;text-align:center">
    <div style="font-size:40px;margin-bottom:12px">✅</div>
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#fff;letter-spacing:-.03em;font-family:system-ui">Demande bien reçue !</h1>
    <p style="margin:0;font-size:14px;color:rgba(255,255,255,.7);font-weight:300;line-height:1.6;font-family:system-ui">Je vous réponds sous 24h avec une proposition sur mesure.</p>
  </td></tr>
  <tr><td style="background:#ffffff;border-left:1px solid #E5E3F5;border-right:1px solid #E5E3F5;padding:32px 28px">
    <p style="margin:0 0 8px;font-size:15px;color:#1a1a2e;font-weight:600;font-family:system-ui">Bonjour ${safeNom},</p>
    <p style="margin:0 0 28px;font-size:14px;color:#6b6b8a;line-height:1.8;font-weight:300;font-family:system-ui">Votre demande de devis a bien été enregistrée. J'analyse votre projet et vous envoie une proposition personnalisée <strong style="color:#1a1a2e;font-weight:600">sous 24 heures ouvrées</strong>, sans engagement de votre part.</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px">
      <tr><td style="background:#F3F1FE;border-left:3px solid #7C3AED;border-radius:0 10px 10px 0;padding:18px 20px">
        <p style="margin:0 0 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.13em;color:#7C3AED;font-family:system-ui">Récapitulatif de votre projet</p>
        <pre style="margin:0;font-size:12px;color:#44445A;white-space:pre-wrap;line-height:1.85;font-family:system-ui,sans-serif">${safebesoin}</pre>
      </td></tr>
    </table>
    <p style="margin:0 0 14px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#1a1a2e;font-family:system-ui">Les prochaines étapes</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px">
      <tr><td style="padding-bottom:12px"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr valign="top">
        <td style="width:30px"><div style="width:28px;height:28px;background:linear-gradient(135deg,#7C3AED,#A855F7);border-radius:50%;text-align:center;line-height:28px;font-size:11px;font-weight:800;color:#fff;font-family:system-ui">1</div></td>
        <td style="padding-left:12px;font-size:13px;color:#6b6b8a;line-height:1.7;font-weight:300;font-family:system-ui;padding-top:4px">J'analyse votre projet et prépare un devis personnalisé et détaillé.</td>
      </tr></table></td></tr>
      <tr><td style="padding-bottom:12px"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr valign="top">
        <td style="width:30px"><div style="width:28px;height:28px;background:linear-gradient(135deg,#7C3AED,#A855F7);border-radius:50%;text-align:center;line-height:28px;font-size:11px;font-weight:800;color:#fff;font-family:system-ui">2</div></td>
        <td style="padding-left:12px;font-size:13px;color:#6b6b8a;line-height:1.7;font-weight:300;font-family:system-ui;padding-top:4px">Vous recevez le devis avec tarif exact, délai et détail des fonctionnalités <strong style="color:#1a1a2e;font-weight:600">sous 24h</strong>.</td>
      </tr></table></td></tr>
      <tr><td><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr valign="top">
        <td style="width:30px"><div style="width:28px;height:28px;background:linear-gradient(135deg,#7C3AED,#A855F7);border-radius:50%;text-align:center;line-height:28px;font-size:11px;font-weight:800;color:#fff;font-family:system-ui">3</div></td>
        <td style="padding-left:12px;font-size:13px;color:#6b6b8a;line-height:1.7;font-weight:300;font-family:system-ui;padding-top:4px">Après validation du devis et de l'acompte, je démarre immédiatement votre projet.</td>
      </tr></table></td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8F7FF;border:1px solid #E5E3F5;border-radius:10px">
      <tr><td style="padding:16px 18px">
        <p style="margin:0 0 3px;font-size:11px;color:#8888A0;font-family:system-ui">Une question urgente ?</p>
        <a href="mailto:contact@axionappstudio.com" style="font-size:13px;font-weight:600;color:#7C3AED;text-decoration:none;font-family:system-ui">contact@axionappstudio.com</a>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="background:#F0EFF9;border:1px solid #E5E3F5;border-top:none;border-radius:0 0 14px 14px;padding:18px 28px;text-align:center">
    <p style="margin:0 0 4px;font-size:11px;color:#8888A0;font-family:system-ui">Axion App Studio · Développeur web freelance · Finistère, Bretagne</p>
    <a href="https://axionappstudio.com" style="font-size:11px;color:#7C3AED;text-decoration:none;font-family:system-ui">axionappstudio.com</a>
  </td></tr>
  <tr><td style="padding-top:24px;text-align:center">
    <p style="margin:0;font-size:10px;color:#AAAABC;font-family:system-ui">Vous avez reçu cet email car vous avez soumis une demande sur axionappstudio.com</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  const send = (payload) => fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  try {
    const [r1, r2] = await Promise.all([
      send({
        from: 'Axion App Studio <contact@autocarnet.fr>',
        to: ['contact@axionappstudio.com'],
        subject: `Nouveau devis — ${nomSafe} (${secteurSafe || 'secteur non précisé'})`,
        html: htmlJeremy
      }),
      send({
        from: 'Axion App Studio <contact@autocarnet.fr>',
        to: [emailSafe],
        subject: 'Votre demande de devis a bien été reçue — Axion App Studio',
        html: htmlClient
      })
    ]);
    if (!r1.ok) { const e = await r1.text(); console.error('Resend r1 error:', e); }
    if (!r2.ok) { const e = await r2.text(); console.error('Resend r2 error:', e); }
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch(e) {
    console.error('send-devis error:', e);
    return { statusCode: 500, body: JSON.stringify({ error: 'Erreur serveur' }) };
  }
};
