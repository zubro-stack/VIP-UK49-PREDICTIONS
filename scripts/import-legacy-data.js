#!/usr/bin/env node
/**
 * Loads a JSON export produced by export-legacy-data.js into the new
 * backend via its own API (not a direct DB write - this exercises the
 * exact same validation/RBAC path a real user would go through).
 *
 * Accepts two export shapes:
 *  - The simple shape (this repo's export-legacy-data.js): { draws, posts }
 *    already field-renamed (drawDate instead of date).
 *  - The full localStorage dump shape (exports every uk49s-* key as-is):
 *    { data: { 'uk49s-shared-draws': [...], 'uk49s-posts': [...], ... } }
 *    Only the draws and posts keys are used - every other key
 *    (uk49s-pats-v3, uk49s-bonus-*, etc.) is a derived pattern cache that
 *    the new engines recompute from the draws themselves, so it's safe
 *    to ignore during migration.
 *
 * Usage:
 *   API_URL=http://localhost:4000/api \
 *   UK49S_EMAIL=admin@uk49s.local UK49S_PASSWORD=... \
 *   node scripts/import-legacy-data.js path/to/uk49s-legacy-export.json
 */
const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:4000/api';
const EMAIL = process.env.UK49S_EMAIL;
const PASSWORD = process.env.UK49S_PASSWORD;

/** Normalizes either export shape into { draws: [{drawDate,drawType,numbers,bonus}], posts: [{title,target,numbers,notes}] }. */
function normalizeExport(payload) {
  if (payload.data) {
    const rawDraws = payload.data['uk49s-shared-draws'] || [];
    const rawPosts = payload.data['uk49s-posts'] || [];
    return {
      draws: rawDraws.map((d) => ({ drawDate: d.drawDate || d.date, drawType: d.drawType, numbers: d.numbers, bonus: d.bonus })),
      posts: rawPosts.map((p) => ({ title: p.title, target: p.target || '', numbers: p.numbers, notes: p.notes || '' })),
    };
  }
  return { draws: payload.draws || [], posts: payload.posts || [] };
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node scripts/import-legacy-data.js <export.json>');
    process.exit(1);
  }
  if (!EMAIL || !PASSWORD) {
    console.error('Set UK49S_EMAIL and UK49S_PASSWORD (a manager or admin account) before running.');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
  const { draws, posts } = normalizeExport(raw);
  console.log(`Loaded export: ${draws.length} draws, ${posts.length} posts (exported ${raw.exportedAt}).`);

  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!loginRes.ok) {
    console.error('Login failed:', await loginRes.text());
    process.exit(1);
  }
  const { accessToken } = await loginRes.json();
  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` };

  let hadFailure = false;

  if (draws.length > 0) {
    const importRes = await fetch(`${API_URL}/draws/import`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ draws }),
    });
    if (!importRes.ok) {
      console.error('Draw import failed:', await importRes.text());
      hadFailure = true;
    } else {
      const result = await importRes.json();
      console.log(`Imported draws: ${result.count} new rows (duplicates on the same date+type were skipped).`);
    }
  }

  let postsImported = 0;
  for (const post of posts) {
    const res = await fetch(`${API_URL}/posts`, { method: 'POST', headers: authHeaders, body: JSON.stringify(post) });
    if (res.ok) postsImported++;
    else console.error(`Post "${post.title}" failed:`, await res.text());
  }
  console.log(`Imported posts: ${postsImported}/${posts.length}.`);
  if (postsImported < posts.length) hadFailure = true;

  if (hadFailure) {
    console.error('Migration completed with errors - see above.');
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
