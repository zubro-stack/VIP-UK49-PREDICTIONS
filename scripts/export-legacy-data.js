/**
 * Run this in the browser console while the legacy app
 * (remixed-544b6f74.html) is open, to export the draws and posts stored
 * in localStorage as a JSON file. That file is the input to
 * import-legacy-data.js, which loads it into the new Postgres-backed API.
 *
 * Usage: open the legacy page in your browser, open devtools > Console,
 * paste this whole script, press Enter - it downloads
 * uk49s-legacy-export.json.
 */
(function exportLegacyData() {
  function readJSON(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error(`Could not parse localStorage["${key}"]:`, e);
      return [];
    }
  }

  const draws = readJSON('uk49s-shared-draws');
  const posts = readJSON('uk49s-posts');

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    draws: draws.map((d) => ({
      drawDate: d.date,
      drawType: d.drawType,
      numbers: d.numbers,
      bonus: d.bonus,
    })),
    posts: posts.map((p) => ({
      title: p.title,
      target: p.target || '',
      numbers: p.numbers,
      notes: p.notes || '',
    })),
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'uk49s-legacy-export.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  console.log(`Exported ${exportPayload.draws.length} draws and ${exportPayload.posts.length} posts.`);
})();
