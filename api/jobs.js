// Greenworks Landscaping - private schedule board API (runs on Vercel)
// Lists and updates signed jobs stored in Upstash Redis by api/accept-email.js.
// Protected by a key derived from the office PIN; the PIN itself is never stored here.

const KEY_HASH = 'f0cdcb4c68c050d6ee3994bb00cbee4d7b987b5c5bc4aa9d5c09240c842fde63';
const MAX_JOBS = 300;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'POST only' });
    return;
  }
  try {
    const b = req.body || {};
    if (String(b.key || '') !== KEY_HASH) {
      res.status(403).json({ ok: false, error: 'bad key' });
      return;
    }

    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      res.status(200).json({ ok: false, error: 'Database is not set up yet. Add Upstash Redis in the Vercel project and redeploy.' });
      return;
    }

    const redis = makeRedis(url, token);
    const action = String(b.action || 'list');

    if (action === 'list') {
      const ids = await redis(['LRANGE', 'gnw:jobids', '0', String(MAX_JOBS - 1)]);
      const list = Array.isArray(ids) ? ids : [];
      if (!list.length) { res.status(200).json({ ok: true, jobs: [] }); return; }
      const values = await redis(['MGET'].concat(list.map(id => 'gnw:job:' + id)));
      const jobs = [];
      (values || []).forEach(v => {
        if (!v) return;
        try { jobs.push(JSON.parse(v)); } catch (e) {}
      });
      res.status(200).json({ ok: true, jobs: jobs });
      return;
    }

    if (action === 'update') {
      const id = cleanId(b.id);
      if (!id) { res.status(400).json({ ok: false, error: 'missing id' }); return; }
      const raw = await redis(['GET', 'gnw:job:' + id]);
      if (!raw) { res.status(404).json({ ok: false, error: 'job not found' }); return; }
      let job;
      try { job = JSON.parse(raw); } catch (e) { res.status(500).json({ ok: false, error: 'bad record' }); return; }

      const patch = b.patch || {};
      if (typeof patch.status === 'string' && ['new', 'scheduled', 'done'].indexOf(patch.status) !== -1) {
        job.status = patch.status;
      }
      if (typeof patch.schedDate === 'string') job.schedDate = patch.schedDate.slice(0, 20);
      if (typeof patch.schedNote === 'string') job.schedNote = patch.schedNote.slice(0, 400);
      job.updated = Date.now();

      await redis(['SET', 'gnw:job:' + id, JSON.stringify(job)]);
      res.status(200).json({ ok: true, job: job });
      return;
    }

    if (action === 'remove') {
      const id = cleanId(b.id);
      if (!id) { res.status(400).json({ ok: false, error: 'missing id' }); return; }
      await redis(['DEL', 'gnw:job:' + id]);
      await redis(['LREM', 'gnw:jobids', '0', id]);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(400).json({ ok: false, error: 'unknown action' });
  } catch (e) {
    res.status(200).json({ ok: false, error: String(e && e.message || e).slice(0, 300) });
  }
};

function cleanId(v) {
  const id = String(v || '').trim();
  return /^[a-z0-9]{6,40}$/i.test(id) ? id : '';
}

function makeRedis(url, token) {
  const base = url.replace(/\/$/, '');
  return async function (command) {
    const r = await fetch(base, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(command)
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error('redis HTTP ' + r.status + (j && j.error ? ' ' + j.error : ''));
    return j.result;
  };
}
