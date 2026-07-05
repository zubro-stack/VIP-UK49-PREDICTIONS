#!/usr/bin/env node
/**
 * Loads a JSON export produced by export-legacy-data.js into the new
 * backend via its own API (not a direct DB write - this exercises the
 * exact same validation/RBAC path a real user would go through).
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

  const exportPayload = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
  console.log(`Loaded export: ${exportPayload.draws.length} draws, ${exportPayload.posts.length} posts (exported ${exportPayload.exportedAt}).`);

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

  if (exportPayload.draws.length > 0) {
    const importRes = await fetch(`${API_URL}/draws/import`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ draws: exportPayload.draws }),
    });
    if (!importRes.ok) {
      console.error('Draw import failed:', await importRes.text());
    } else {
      const result = await importRes.json();
      console.log(`Imported draws: ${result.count} new rows (duplicates on the same date+type were skipped).`);
    }
  }

  let postsImported = 0;
  for (const post of exportPayload.posts) {
    const res = await fetch(`${API_URL}/posts`, { method: 'POST', headers: authHeaders, body: JSON.stringify(post) });
    if (res.ok) postsImported++;
    else console.error(`Post "${post.title}" failed:`, await res.text());
  }
  console.log(`Imported posts: ${postsImported}/${exportPayload.posts.length}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
