// Netlify Function — Envoi email devis via Resend
// netlify/functions/send-devis.js
// Variable d'environnement : RESEND_API_KEY

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return { statusCode: 500, body: 'Missing RESEND_API_KEY' };

  let data;
  try { data = JSON.parse(event.body); } catch(e) { return { statusCode: 400, body: 'Invalid JSON' }; }

  const { nom, email, telephone, secteur, besoin } = data;
  if (!nom || !email) return { statusCode: 400, body: 'Champs requis manquants' };

  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const logoA = `<table cellpadding="0" cellspacing="0" border="0"><tr><td style="width:36px;height:36px;background:#16162A;border-radius:10px;border:1.5px solid #7C3AED;text-align:center;vertical-align:middle"><span style="font-family:system-ui;font-size:14px;font-weight:900;color:#A855F7">A</span></td><td style="padding-left:10px;font-family:system-ui;font-size:13px;font-weight:800;color:#fff;letter-spacing:.04em">AXION <span style="color:#A855F7">APP STUDIO</span></td></tr></table>`;

  // ── EMAIL JÉRÉMY
  const htmlJeremy = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A14;font-family:system-ui,-apple-system,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0A0A14;padding:32px 16px">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%">

      <!-- HEADER -->
      <tr><td style="padding-bottom:24px">${logoA}</td></tr>

      <!-- CARD PRINCIPALE -->
      <tr><td style="background:#10101E;border:1px solid rgba(124,58,237,.25);border-radius:16px;overflow:hidden">

        <!-- Bandeau haut -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="background:linear-gradient(135deg,#7C3AED,#A855F7);padding:24px 28px">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:rgba(255,255,255,.6)">Nouvelle demande</p>
            <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-.02em">Devis — ${nom}</h1>
            <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,.5)">${date}</p>
          </td></tr>
        </table>

        <!-- Infos client -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:24px 28px">
          <tr><td>
            <p style="margin:0 0 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#A855F7">Contact</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid rgba(255,255,255,.07);border-radius:10px;overflow:hidden">
              <tr style="border-bottom:1px solid rgba(255,255,255,.05)">
                <td style="padding:11px 16px;font-size:11px;color:rgba(255,255,255,.35);font-weight:600;width:100px;background:rgba(255,255,255,.02)">Nom</td>
                <td style="padding:11px 16px;font-size:13px;color:#fff;font-weight:600">${nom}</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(255,255,255,.05)">
                <td style="padding:11px 16px;font-size:11px;color:rgba(255,255,255,.35);font-weight:600;background:rgba(255,255,255,.02)">Email</td>
                <td style="padding:11px 16px;font-size:13px"><a href="mailto:${email}" style="color:#A855F7;font-weight:600">${email}</a></td>
              </tr>
              <tr style="border-bottom:1px solid rgba(255,255,255,.05)">
                <td style="padding:11px 16px;font-size:11px;color:rgba(255,255,255,.35);font-weight:600;background:rgba(255,255,255,.02)">Téléphone</td>
                <td style="padding:11px 16px;font-size:13px;color:rgba(255,255,255,.7)">${telephone || 'Non renseigné'}</td>
              </tr>
              <tr>
                <td style="padding:11px 16px;font-size:11px;color:rgba(255,255,255,.35);font-weight:600;background:rgba(255,255,255,.02)">Secteur</td>
                <td style="padding:11px 16px;font-size:13px;color:rgba(255,255,255,.7)">${secteur || 'Non renseigné'}</td>
              </tr>
            </table>
          </td></tr>
        </table>

        <!-- Config simulateur -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:0 28px 24px">
          <tr><td>
            <p style="margin:0 0 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#A855F7">Configuration simulateur</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(124,58,237,.07);border:1px solid rgba(124,58,237,.2);border-radius:10px">
              <tr><td style="padding:18px 20px">
                <pre style="margin:0;font-size:12px;color:rgba(255,255,255,.65);white-space:pre-wrap;line-height:1.8;font-family:system-ui">${(besoin || 'Non configuré').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
              </td></tr>
            </table>
          </td></tr>
        </table>

        <!-- CTA répondre -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:0 28px 28px">
          <tr><td>
            <table cellpadding="0" cellspacing="0" border="0">
              <tr><td style="background:#7C3AED;border-radius:10px">
                <a href="mailto:${email}?subject=Votre devis Axion App Studio&body=Bonjour ${nom}," style="display:inline-block;padding:13px 24px;font-size:13px;font-weight:700;color:#fff;text-decoration:none">Répondre à ${nom} →</a>
              </td></tr>
            </table>
          </td></tr>
        </table>

      </td></tr>

      <!-- FOOTER -->
      <tr><td style="padding:20px 0 0;text-align:center">
        <p style="margin:0;font-size:11px;color:rgba(255,255,255,.18)">Axion App Studio · SIRET 914 511 639 00025 · Saint-Ségal, Finistère</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;

  // ── EMAIL CLIENT
  const htmlClient = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F6F5FF;font-family:system-ui,-apple-system,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F6F5FF;padding:32px 16px">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%">

      <!-- HEADER -->
      <tr><td style="background:#0A0A14;border-radius:16px 16px 0 0;padding:24px 28px">
        ${logoA}
      </td></tr>

      <!-- HERO -->
      <tr><td style="background:linear-gradient(135deg,#7C3AED 0%,#A855F7 50%,#FF6B35 100%);padding:36px 28px;text-align:center">
        <p style="margin:0 0 8px;font-size:32px">✅</p>
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#fff;letter-spacing:-.02em">Demande bien reçue !</h1>
        <p style="margin:0;font-size:14px;color:rgba(255,255,255,.75);font-weight:300">Je vous réponds sous 24h avec une proposition adaptée.</p>
      </td></tr>

      <!-- BODY -->
      <tr><td style="background:#fff;border:1px solid rgba(0,0,0,.07);border-top:none;border-radius:0 0 16px 16px;padding:28px">

        <p style="margin:0 0 20px;font-size:15px;color:#374151">Bonjour <strong>${nom}</strong>,</p>
        <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.8;font-weight:300">Votre demande de devis a bien été enregistrée. J'analyse votre projet et vous envoie une proposition personnalisée <strong style="color:#374151">sous 24h</strong>, sans engagement.</p>

        <!-- Récap -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F6F5FF;border:1px solid rgba(124,58,237,.15);border-radius:12px;margin-bottom:24px">
          <tr><td style="padding:18px 20px">
            <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#7C3AED">Récapitulatif de votre projet</p>
            <pre style="margin:0;font-size:12px;color:#44445A;white-space:pre-wrap;line-height:1.8;font-family:system-ui">${(besoin || 'Configuration en attente').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
          </td></tr>
        </table>

        <!-- Étapes -->
        <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#374151">Les prochaines étapes :</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px">
          <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6">
            <table cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="width:28px;height:28px;background:linear-gradient(135deg,#7C3AED,#A855F7);border-radius:50%;text-align:center;vertical-align:middle;font-size:11px;font-weight:700;color:#fff;flex-shrink:0">1</td>
              <td style="padding-left:12px;font-size:13px;color:#6b7280;font-weight:300">J'analyse votre projet et prépare un devis personnalisé</td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6">
            <table cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="width:28px;height:28px;background:linear-gradient(135deg,#7C3AED,#A855F7);border-radius:50%;text-align:center;vertical-align:middle;font-size:11px;font-weight:700;color:#fff">2</td>
              <td style="padding-left:12px;font-size:13px;color:#6b7280;font-weight:300">Vous recevez le devis détaillé avec tarif et délai exacts <strong style="color:#374151">sous 24h</strong></td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:10px 0">
            <table cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="width:28px;height:28px;background:linear-gradient(135deg,#7C3AED,#A855F7);border-radius:50%;text-align:center;vertical-align:middle;font-size:11px;font-weight:700;color:#fff">3</td>
              <td style="padding-left:12px;font-size:13px;color:#6b7280;font-weight:300">Après validation du devis, je démarre immédiatement</td>
            </tr></table>
          </td></tr>
        </table>

        <!-- Question urgente -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F6F5FF;border-radius:10px;padding:16px;margin-bottom:8px">
          <tr><td style="padding:16px">
            <p style="margin:0 0 4px;font-size:12px;color:#8888A0;font-weight:400">Une question urgente ?</p>
            <a href="mailto:contact@axionappstudio.com" style="font-size:13px;color:#7C3AED;font-weight:600;text-decoration:none">contact@axionappstudio.com</a>
          </td></tr>
        </table>

      </td></tr>

      <!-- FOOTER -->
      <tr><td style="padding:20px 0 0;text-align:center">
        <p style="margin:0 0 4px;font-size:11px;color:#8888A0">Axion App Studio · Développeur web freelance · Finistère, Bretagne</p>
        <a href="https://axionappstudio.com" style="font-size:11px;color:#7C3AED;text-decoration:none">axionappstudio.com</a>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;

  const emailJeremy = {
    from: 'Axion App Studio <contact@autocarnet.fr>',
    to: ['contact@axionappstudio.com'],
    subject: 'Nouveau devis — ' + nom + ' (' + (secteur || 'secteur non précisé') + ')',
    html: htmlJeremy
  };

  const emailClient = {
    from: 'Axion App Studio <contact@autocarnet.fr>',
    to: [email],
    subject: 'Votre demande de devis a bien été reçue — Axion App Studio',
    html: htmlClient
  };

  try {
    const [r1, r2] = await Promise.all([
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(emailJeremy)
      }),
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(emailClient)
      })
    ]);

    if (!r1.ok) { const e = await r1.text(); console.error('Resend r1:', e); }
    if (!r2.ok) { const e = await r2.text(); console.error('Resend r2:', e); }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch(e) {
    console.error('Function error:', e);
    return { statusCode: 500, body: 'Internal error' };
  }
};
