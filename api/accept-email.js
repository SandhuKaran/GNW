// Greenworks Landscaping - acceptance email relay (runs on Vercel)
// Sends the signed terms + quote PDFs via Resend when a customer accepts.
// Requires env var RESEND_API_KEY (Vercel project settings).

const OWNER_EMAIL = 'info@gnwlandscaping.ca';
const FROM = 'Greenworks Landscaping <quotes@send.gnwlandscaping.ca>';
const REPLY_TO = 'info@gnwlandscaping.ca';
const PAGE_TOKEN = 'gnw-accept-2026';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'POST only' });
    return;
  }
  try {
    const b = req.body || {};
    if (b.token !== PAGE_TOKEN) {
      res.status(403).json({ ok: false, error: 'bad token' });
      return;
    }

    const name = String(b.name || 'Customer').slice(0, 120);
    const addr = String(b.addr || '').slice(0, 200);
    const phone = String(b.phone || '').slice(0, 40);
    const service = String(b.service || 'Service').slice(0, 60);
    const price = String(b.price || '').slice(0, 200);
    const details = String(b.details || '').slice(0, 3000);
    const version = String(b.version || '').slice(0, 80);
    const stamp = String(b.stamp || '').slice(0, 120);
    const recordLink = String(b.recordLink || '').slice(0, 4000);
    const customerEmail = String(b.email || '').trim().slice(0, 200);

    const attachments = [];
    if (b.termsPdf && typeof b.termsPdf === 'string' && b.termsPdf.length < 8000000) {
      attachments.push({ filename: 'Greenworks_Terms_' + service.replace(/\s+/g, '_') + '_Signed.pdf', content: b.termsPdf });
    }
    if (b.quotePdf && typeof b.quotePdf === 'string' && b.quotePdf.length < 8000000) {
      attachments.push({ filename: 'Greenworks_Quote_' + name.replace(/[^a-zA-Z0-9]+/g, '_') + '.pdf', content: b.quotePdf });
    }

    const summaryHtml =
      '<div style="font-family: Arial, Helvetica, sans-serif; color: #201d16; max-width: 560px;">' +
      '<div style="border-bottom: 3px solid #c9a24b; padding-bottom: 10px; margin-bottom: 14px;">' +
      '<div style="font-size: 18px; font-weight: bold; color: #0f2e14;">GREENWORKS <span style="color:#b08a3e;">LANDSCAPING</span></div>' +
      '<div style="font-size: 11px; color: #5d5747;">Greenworks Construction &amp; Companies Inc., operating as Greenworks Landscaping</div>' +
      '</div>' +
      '<table style="font-size: 13px; border-collapse: collapse;">' +
      '<tr><td style="padding: 3px 12px 3px 0; color: #5d5747;">Service</td><td style="padding: 3px 0;"><strong>' + esc(service) + '</strong></td></tr>' +
      '<tr><td style="padding: 3px 12px 3px 0; color: #5d5747;">Accepted by</td><td style="padding: 3px 0;"><strong>' + esc(name) + '</strong></td></tr>' +
      '<tr><td style="padding: 3px 12px 3px 0; color: #5d5747;">Address</td><td style="padding: 3px 0;">' + esc(addr) + '</td></tr>' +
      (phone ? '<tr><td style="padding: 3px 12px 3px 0; color: #5d5747;">Phone</td><td style="padding: 3px 0;">' + esc(phone) + '</td></tr>' : '') +
      (price ? '<tr><td style="padding: 3px 12px 3px 0; color: #5d5747;">Price</td><td style="padding: 3px 0;"><strong>' + esc(price) + '</strong></td></tr>' : '') +
      '<tr><td style="padding: 3px 12px 3px 0; color: #5d5747;">Accepted on</td><td style="padding: 3px 0;">' + esc(stamp) + '</td></tr>' +
      (version ? '<tr><td style="padding: 3px 12px 3px 0; color: #5d5747;">Terms version</td><td style="padding: 3px 0;">' + esc(version) + '</td></tr>' : '') +
      '</table>' +
      (details ? '<div style="font-size: 12px; color: #5d5747; margin-top: 10px;"><strong>Services:</strong> ' + esc(details) + '</div>' : '');

    const sends = [];

    // Copy to the office
    sends.push(sendResend({
      from: FROM,
      to: [OWNER_EMAIL],
      reply_to: customerEmail || undefined,
      subject: 'SIGNED: ' + service + ' terms accepted by ' + name + ' | ' + addr,
      html: summaryHtml +
        (recordLink ? '<p style="font-size:12px;"><a href="' + esc(recordLink) + '">Open the signed record online</a></p>' : '') +
        '<p style="font-size: 12px; color: #5d5747;">The signed terms and quote PDFs are attached for your records.</p>',
      attachments: attachments
    }));

    // Copy to the customer, when they gave an email
    let customerSent = false;
    if (customerEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customerEmail)) {
      customerSent = true;
      sends.push(sendResend({
        from: FROM,
        to: [customerEmail],
        reply_to: REPLY_TO,
        subject: 'Your accepted ' + service.toLowerCase() + ' agreement - Greenworks Landscaping',
        html: summaryHtml +
          '<p style="font-size: 13px;">Thanks, ' + esc(name) + '! Your acceptance has been recorded. Your signed terms' + (attachments.length > 1 ? ' and quote are' : ' are') + ' attached for your records.</p>' +
          '<p style="font-size: 13px;">We will update you on scheduling shortly. Questions? Reply to this email or call or text (705) 500-9000.</p>' +
          '<p style="font-size: 12px; color: #5d5747;">Greenworks Landscaping · Georgetown, ON · gnwlandscaping.ca</p>',
        attachments: attachments
      }));
    }

    const results = await Promise.all(sends);
    const failed = results.filter(r => !r.ok);
    res.status(200).json({ ok: failed.length === 0, customerSent: customerSent, errors: failed.map(f => f.error).slice(0, 2) });
  } catch (e) {
    res.status(200).json({ ok: false, error: String(e && e.message || e).slice(0, 300) });
  }
};

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function sendResend(payload) {
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: (j && j.message) || ('HTTP ' + r.status) };
    return { ok: true, id: j.id };
  } catch (e) {
    return { ok: false, error: String(e && e.message || e).slice(0, 200) };
  }
}
