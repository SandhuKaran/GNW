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

    const GREEN = '#0f2e14';
    const GOLD = '#b08a3e';
    const LOGO = 'https://www.gnwlandscaping.ca/assets/img/logo-light.png';

    const headerHtml =
      '<div style="border-bottom: 3px solid #c9a24b; padding-bottom: 14px; margin-bottom: 18px;">' +
      '<img src="' + LOGO + '" alt="Greenworks Landscaping" height="48" style="display:block; height:48px; margin-bottom:8px;">' +
      '<div style="font-size: 17px; font-weight: bold; color: ' + GREEN + ';">Greenworks Landscaping</div>' +
      '<div style="font-size: 11px; color: #5d5747;">Georgetown, ON &nbsp;|&nbsp; (705) 500-9000 &nbsp;|&nbsp; info@gnwlandscaping.ca &nbsp;|&nbsp; gnwlandscaping.ca</div>' +
      '</div>';

    const detailsTable =
      '<table style="font-size: 13px; border-collapse: collapse; width: 100%; max-width: 480px; margin: 4px 0 8px;">' +
      row('Service', '<strong style="color:' + GREEN + ';">' + esc(service) + '</strong>') +
      row('Accepted by', '<strong>' + esc(name) + '</strong>') +
      row('Service address', esc(addr)) +
      (phone ? row('Phone', esc(phone)) : '') +
      (price ? row('Price', '<strong style="color:' + GREEN + ';">' + esc(price) + '</strong>') : '') +
      row('Accepted on', esc(stamp)) +
      (version ? row('Terms version', esc(version)) : '') +
      '</table>' +
      (details ? '<div style="font-size: 12px; color: #5d5747; margin: 0 0 6px;"><strong style="color:' + GREEN + ';">Services included:</strong> ' + esc(details) + '</div>' : '');

    const footerHtml =
      '<div style="border-top: 1px solid #e5ddc8; margin-top: 20px; padding-top: 10px; font-size: 11px; color: #8a836f;">' +
      '<span style="color:' + GREEN + '; font-weight: bold;">Greenworks Landscaping</span> is the operating name of Greenworks Construction &amp; Companies Inc., Georgetown, ON.' +
      '</div>';

    function wrap(inner) {
      return '<div style="font-family: Arial, Helvetica, sans-serif; color: #201d16; max-width: 560px; line-height: 1.55;">' +
        headerHtml + inner + footerHtml + '</div>';
    }

    const sends = [];

    // Copy to the office
    sends.push(sendResend({
      from: FROM,
      to: [OWNER_EMAIL],
      reply_to: customerEmail || undefined,
      subject: 'SIGNED: ' + service + ' terms accepted by ' + name + ' | ' + addr,
      html: wrap(
        '<p style="font-size: 14px; margin: 0 0 12px;"><strong style="color:' + GREEN + ';">A new signed agreement has been received.</strong></p>' +
        detailsTable +
        '<p style="font-size: 13px;">The signed Terms and Conditions' + (b.quotePdf ? ' and the quote' : '') + ' are attached as PDF for your records.</p>' +
        (recordLink ? '<p style="font-size: 12px;"><a href="' + esc(recordLink) + '" style="color:' + GOLD + ';">Open the signed record online</a></p>' : '')
      ),
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
        subject: 'Your signed ' + service.toLowerCase() + ' agreement | Greenworks Landscaping',
        html: wrap(
          '<p style="font-size: 14px; margin: 0 0 10px;">Dear ' + esc(name) + ',</p>' +
          '<p style="font-size: 13.5px;">Thank you for choosing <span style="color:' + GREEN + '; font-weight: bold;">Greenworks Landscaping</span>. This email confirms that you have accepted our ' + esc(service) + ' Terms and Conditions' + (price ? ' and your quote' : '') + ' for <strong>' + esc(addr) + '</strong>.</p>' +
          detailsTable +
          '<p style="font-size: 13.5px;">Your signed documents are attached to this email for your records.</p>' +
          '<p style="font-size: 13.5px;"><strong style="color:' + GREEN + ';">Next steps:</strong> our team will contact you shortly to confirm your scheduling.</p>' +
          '<p style="font-size: 13.5px;">If you have any questions, simply reply to this email or call or text us at (705) 500-9000.</p>' +
          '<p style="font-size: 13.5px; margin-top: 16px;">Warm regards,<br>' +
          '<strong style="color:' + GREEN + ';">The Greenworks Landscaping Team</strong><br>' +
          '<span style="font-size: 12px; color: #5d5747;">Georgetown, ON &nbsp;|&nbsp; (705) 500-9000 &nbsp;|&nbsp; info@gnwlandscaping.ca</span></p>'
        ),
        attachments: attachments
      }));
    }

    function row(label, value) {
      return '<tr>' +
        '<td style="padding: 5px 14px 5px 0; color: #5d5747; border-bottom: 1px solid #f2ecdb; white-space: nowrap; vertical-align: top;">' + label + '</td>' +
        '<td style="padding: 5px 0; border-bottom: 1px solid #f2ecdb;">' + value + '</td></tr>';
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
