/**
 * Deterministic pseudo-random draw generator used only for regression
 * testing the extracted engines against the legacy reference logic.
 * A fixed seed keeps output stable across runs.
 */
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawNumbers(rand) {
  const pool = Array.from({ length: 49 }, (_, i) => i + 1);
  const picked = [];
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(rand() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked.sort((a, b) => a - b);
}

function generateDraws(days = 24, seed = 42) {
  const rand = mulberry32(seed);
  const draws = [];
  const start = new Date('2026-01-01T00:00:00Z');
  for (let d = 0; d < days; d++) {
    const date = new Date(start.getTime() + d * 86400000).toISOString().slice(0, 10);
    for (const drawType of ['lunch', 'tea']) {
      const numbers = drawNumbers(rand);
      const remaining = Array.from({ length: 49 }, (_, i) => i + 1).filter((n) => !numbers.includes(n));
      const bonus = remaining[Math.floor(rand() * remaining.length)];
      draws.push({ drawDate: date, drawType, numbers, bonus });
    }
  }
  return draws;
}

module.exports = { generateDraws };
