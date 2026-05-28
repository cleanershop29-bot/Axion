// Netlify Function — Envoi email devis via Resend
// À placer dans netlify/functions/send-devis.js
// Variable d'environnement requise : RESEND_API_KEY

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return { statusCode: 500, body: 'Missing RESEND_API_KEY' };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch(e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { nom, email, telephone, secteur, besoin } = data;

  if (!nom || !email) {
    return { statusCode: 400, body: 'Champs requis manquants' };
  }

  // ── Email pour JÉRÉMY (récap complet)
  const emailJeremy = {
    from: 'AutoCarnet <noreply@axionappstudio.com>',
    to: ['contact@axionappstudio.com'],
    subject: 'Nouveau devis — ' + nom + ' (' + (secteur || 'secteur non précisé') + ')',
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <div style="background:#7C3AED;padding:20px 24px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:1.2rem;font-weight:700">Nouvelle demande de devis</h1>
          <p style="color:rgba(255,255,255,.7);margin:4px 0 0;font-size:.85rem">Axion App Studio</p>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 12px 12px">

          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            <tr style="border-bottom:1px solid #f3f4f6">
              <td style="padding:10px 0;font-size:.8rem;color:#6b7280;font-weight:600;width:120px">Nom</td>
              <td style="padding:10px 0;font-size:.85rem;color:#111827;font-weight:600">${nom}</td>
            </tr>
            <tr style="border-bottom:1px solid #f3f4f6">
              <td style="padding:10px 0;font-size:.8rem;color:#6b7280;font-weight:600">Email</td>
              <td style="padding:10px 0;font-size:.85rem;color:#111827"><a href="mailto:${email}" style="color:#7C3AED">${email}</a></td>
            </tr>
            <tr style="border-bottom:1px solid #f3f4f6">
              <td style="padding:10px 0;font-size:.8rem;color:#6b7280;font-weight:600">Téléphone</td>
              <td style="padding:10px 0;font-size:.85rem;color:#111827">${telephone || 'Non renseigné'}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;font-size:.8rem;color:#6b7280;font-weight:600">Secteur</td>
              <td style="padding:10px 0;font-size:.85rem;color:#111827">${secteur || 'Non renseigné'}</td>
            </tr>
          </table>

          <div style="background:#f9fafb;border-left:3px solid #7C3AED;padding:16px;border-radius:0 8px 8px 0;margin-bottom:20px">
            <div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#7C3AED;margin-bottom:10px">Configuration simulateur</div>
            <pre style="font-size:.82rem;color:#374151;white-space:pre-wrap;line-height:1.7;margin:0;font-family:system-ui">${besoin || 'Non configuré'}</pre>
          </div>

          <a href="mailto:${email}?subject=Votre devis Axion App Studio&body=Bonjour ${nom}," style="display:inline-block;background:#7C3AED;color:#fff;padding:12px 24px;border-radius:8px;font-size:.85rem;font-weight:600;text-decoration:none">Répondre à ${nom} →</a>

          <p style="margin-top:20px;font-size:.75rem;color:#9ca3af">Reçu le ${new Date().toLocaleDateString('fr-FR', {day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
        </div>
      </div>
    `
  };

  // ── Email de confirmation pour le CLIENT
  const emailClient = {
    from: 'Axion App Studio <contact@axionappstudio.com>',
    to: [email],
    subject: 'Votre demande de devis a bien été reçue — Axion App Studio',
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <div style="background:linear-gradient(135deg,#7C3AED,#FF6B35);padding:28px 24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:1.4rem;font-weight:800">✅ Demande bien reçue !</h1>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:28px;border-radius:0 0 12px 12px">
          <p style="font-size:.92rem;color:#374151;margin-bottom:16px">Bonjour <strong>${nom}</strong>,</p>
          <p style="font-size:.88rem;color:#6b7280;line-height:1.8;margin-bottom:20px">Votre demande de devis a bien été enregistrée. Je l'analyse et vous réponds <strong>sous 24h</strong> avec une proposition adaptée à votre projet.</p>

          <div style="background:#f9fafb;border-radius:10px;padding:18px;margin-bottom:20px">
            <div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#7C3AED;margin-bottom:12px">Récapitulatif de votre projet</div>
            <pre style="font-size:.82rem;color:#374151;white-space:pre-wrap;line-height:1.7;margin:0;font-family:system-ui">${besoin || 'Configuration en attente'}</pre>
          </div>

          <div style="border:1px solid #e5e7eb;border-radius:10px;padding:18px;margin-bottom:24px">
            <div style="font-size:.8rem;font-weight:700;color:#374151;margin-bottom:10px">Les prochaines étapes :</div>
            <div style="display:flex;flex-direction:column;gap:8px">
              <div style="display:flex;gap:10px;align-items:flex-start">
                <div style="width:22px;height:22px;border-radius:50%;background:#7C3AED;color:#fff;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;flex-shrink:0">1</div>
                <div style="font-size:.82rem;color:#6b7280">J'analyse votre projet et prépare un devis personnalisé</div>
              </div>
              <div style="display:flex;gap:10px;align-items:flex-start">
                <div style="width:22px;height:22px;border-radius:50%;background:#7C3AED;color:#fff;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;flex-shrink:0">2</div>
                <div style="font-size:.82rem;color:#6b7280">Vous recevez le devis détaillé avec délai et tarif exacts sous 24h</div>
              </div>
              <div style="display:flex;gap:10px;align-items:flex-start">
                <div style="width:22px;height:22px;border-radius:50%;background:#7C3AED;color:#fff;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;flex-shrink:0">3</div>
                <div style="font-size:.82rem;color:#6b7280">Après validation, on démarre immédiatement</div>
              </div>
            </div>
          </div>

          <p style="font-size:.82rem;color:#9ca3af;margin-bottom:4px">Une question urgente ?</p>
          <a href="mailto:contact@axionappstudio.com" style="color:#7C3AED;font-size:.85rem;font-weight:600">contact@axionappstudio.com</a>

          <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0">
          <p style="font-size:.72rem;color:#d1d5db;margin:0">Axion App Studio — Développeur web freelance · Finistère, Bretagne<br>
          <a href="https://axionappstudio.com" style="color:#d1d5db">axionappstudio.com</a></p>
        </div>
      </div>
    `
  };

  try {
    // Envoyer les deux emails en parallèle
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

    if (!r1.ok || !r2.ok) {
      const err = await r1.text();
      console.error('Resend error:', err);
      return { statusCode: 500, body: 'Email send failed' };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch(e) {
    console.error('Function error:', e);
    return { statusCode: 500, body: 'Internal error' };
  }
};
