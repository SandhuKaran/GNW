// Greenworks Landscaping - customer feedback (runs on Vercel)
// Stores star-rating feedback in Upstash Redis and emails a copy to the office.
// Also serves the private board a list of submissions (board API key required).

const OWNER_EMAIL = 'info@gnwlandscaping.ca';
const FROM = 'Greenworks Landscaping <quotes@send.gnwlandscaping.ca>';
const PAGE_TOKEN = 'gnw-accept-2026';
const KEY_HASH = 'daae3655e72f2bcde38c7f90dc4fc5745a64166440f4670c5bd7ece72f1b71c8';

const CATS = ['timely', 'quality', 'detail', 'cleanup', 'property', 'crew', 'communication', 'booking', 'billing', 'value', 'overall'];
const CAT_LABELS = {
  timely: 'Timely visits',
  quality: 'Quality of work',
  detail: 'Attention to detail',
  cleanup: 'Cleanup after the job',
  property: 'Care for your property',
  crew: 'Crew professionalism',
  communication: 'Communication',
  booking: 'Ease of booking',
  billing: 'Billing and pricing clarity',
  value: 'Value for money',
  overall: 'Overall'
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'POST only' });
    return;
  }
  try {
    const b = req.body || {};
    const redis = makeRedis();

    // ---- Private board: list submissions ----
    if (b.action === 'list') {
      if (b.key !== KEY_HASH) {
        res.status(403).json({ ok: false, error: 'bad key' });
        return;
      }
      if (!redis) { res.status(200).json({ ok: true, feedback: [] }); return; }
      const ids = await redis(['LRANGE', 'gnw:fbids', '0', '299']);
      let items = [];
      if (Array.isArray(ids) && ids.length) {
        const vals = await redis(['MGET'].concat(ids.map(id => 'gnw:fb:' + id)));
        items = (vals || []).filter(Boolean).map(v => {
          try { return JSON.parse(v); } catch (e) { return null; }
        }).filter(Boolean);
      }
      res.status(200).json({ ok: true, feedback: items });
      return;
    }

    // ---- Public: submit feedback ----
    if (b.token !== PAGE_TOKEN) {
      res.status(403).json({ ok: false, error: 'bad token' });
      return;
    }
    if (b.website) { // honeypot field: real customers leave it empty
      res.status(200).json({ ok: true });
      return;
    }

    const ratings = {};
    let rated = 0;
    for (const c of CATS) {
      const n = Math.round(Number(b[c]));
      if (n >= 1 && n <= 5) { ratings[c] = n; rated++; }
    }
    if (!rated) {
      res.status(200).json({ ok: false, error: 'Please tap the stars for at least one category.' });
      return;
    }

    const rec = {
      id: 'f' + Date.now() + Math.random().toString(36).slice(2, 6),
      ts: Date.now(),
      ratings: ratings,
      comment: String(b.comment || '').slice(0, 2000),
      name: String(b.name || '').slice(0, 120),
      addr: String(b.addr || '').slice(0, 200),
      email: String(b.email || '').trim().slice(0, 200),
      service: String(b.service || '').slice(0, 60),
      stamp: new Date().toLocaleString('en-CA', { timeZone: 'America/Toronto', dateStyle: 'full', timeStyle: 'short' })
    };

    const sends = [];

    if (redis) {
      sends.push(redis([
        ['SET', 'gnw:fb:' + rec.id, JSON.stringify(rec)],
        ['LPUSH', 'gnw:fbids', rec.id],
        ['LTRIM', 'gnw:fbids', '0', '999']
      ], true).then(() => ({ ok: true })).catch(e => ({ ok: false, error: 'save: ' + String(e && e.message || e).slice(0, 120) })));
    }

    // Email the office
    const avg = (CATS.filter(c => c !== 'overall' && ratings[c]).reduce((s, c) => s + ratings[c], 0) /
      Math.max(1, CATS.filter(c => c !== 'overall' && ratings[c]).length)) || ratings.overall || 0;
    const head = ratings.overall ? ratings.overall + ' star' + (ratings.overall > 1 ? 's' : '') : avg.toFixed(1) + ' avg';
    const starRow = (label, n) =>
      '<tr><td style="padding:5px 14px 5px 0; color:#5d5747; border-bottom:1px solid #f2ecdb;">' + label + '</td>' +
      '<td style="padding:5px 0; border-bottom:1px solid #f2ecdb; color:#b08a3e; font-size:15px; letter-spacing:2px;">' +
      '&#9733;'.repeat(n) + '<span style="color:#ddd;">' + '&#9733;'.repeat(5 - n) + '</span>' +
      ' <span style="color:#5d5747; font-size:12px;">(' + n + '/5)</span></td></tr>';
    let rows = '';
    for (const c of CATS) if (ratings[c]) rows += starRow(CAT_LABELS[c], ratings[c]);

    sends.push(sendResend({
      from: FROM,
      to: [OWNER_EMAIL],
      reply_to: rec.email || undefined,
      subject: 'FEEDBACK: ' + head + (rec.name ? ' from ' + rec.name : '') + (rec.addr ? ' | ' + rec.addr : ''),
      html: '<div style="font-family: Arial, Helvetica, sans-serif; color:#201d16; max-width:560px; line-height:1.55;">' +
        '<div style="border-bottom:3px solid #c9a24b; padding-bottom:10px; margin-bottom:16px;">' +
        '<div style="font-size:17px; font-weight:bold; color:#0f2e14;">New customer feedback</div></div>' +
        '<table style="font-size:13px; border-collapse:collapse; width:100%; max-width:480px;">' +
        (rec.name ? '<tr><td style="padding:5px 14px 5px 0; color:#5d5747;">Name</td><td style="padding:5px 0;"><strong>' + esc(rec.name) + '</strong></td></tr>' : '') +
        (rec.addr ? '<tr><td style="padding:5px 14px 5px 0; color:#5d5747;">Address</td><td style="padding:5px 0;">' + esc(rec.addr) + '</td></tr>' : '') +
        (rec.email ? '<tr><td style="padding:5px 14px 5px 0; color:#5d5747;">Email</td><td style="padding:5px 0;">' + esc(rec.email) + '</td></tr>' : '') +
        (rec.service ? '<tr><td style="padding:5px 14px 5px 0; color:#5d5747;">Service</td><td style="padding:5px 0;">' + esc(rec.service) + '</td></tr>' : '') +
        rows + '</table>' +
        (rec.comment ? '<p style="font-size:13px; background:#faf6ea; border-left:3px solid #c9a24b; padding:10px 12px; margin:14px 0;">' + esc(rec.comment) + '</p>' : '') +
        '<p style="font-size:11px; color:#8a836f;">Received ' + esc(rec.stamp) + ' (Toronto time)</p></div>'
    }));

    const results = await Promise.all(sends);
    const failed = results.filter(r => !r.ok);
    res.status(200).json({ ok: failed.length === 0, errors: failed.map(f => f.error).slice(0, 2) });
  } catch (e) {
    res.status(200).json({ ok: false, error: String(e && e.message || e).slice(0, 300) });
  }
};

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Returns a function(command, isPipeline) -> result, or null when no database is configured.
function makeRedis() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const base = url.replace(/\/$/, '');
  return async function (cmd, isPipeline) {
    const r = await fetch(isPipeline ? base + '/pipeline' : base, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(cmd)
    });
    if (!r.ok) throw new Error('redis HTTP ' + r.status);
    const j = await r.json();
    if (isPipeline) return j;
    if (j && j.error) throw new Error(j.error);
    return j ? j.result : null;
  };
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
