const { sortDraws } = require('../core/draw-utils');

const DEFAULT_WINDOW = 10;

function normalizeDraw(draw) {
  const nums = draw.numbers.slice();
  if (draw.bonus != null && !nums.includes(draw.bonus)) nums.push(draw.bonus);
  return { nums, drawDate: draw.drawDate, drawType: draw.drawType };
}

/**
 * Detects "journey" patterns for each number seen in the last `windowSize`
 * draws: a number that hits, then either skips-the-middle-draw (pattern A:
 * hit, miss, hit) or skips-the-last-draw (pattern B: hit, hit, miss) across
 * 3 consecutive draws is predicted to hit again on the 4th (D) draw.
 * completed journeys (where D already happened) feed a hit-rate tier for
 * any currently pending (D still in the future) journey on the same number.
 */
function computeRepeats(draws, windowSize = DEFAULT_WINDOW) {
  if (!draws || draws.length < 3) return { predictions: [], history: {}, windowSize: 0 };

  const window = sortDraws(draws).slice(-windowSize).map(normalizeDraw);
  const n = window.length;
  if (n < 3) return { predictions: [], history: {}, windowSize: n };

  const sets = window.map((d) => new Set(d.nums));
  const allNums = new Set();
  sets.forEach((s) => s.forEach((x) => allNums.add(x)));

  const history = {};
  let predictions = [];

  for (const num of allNums) {
    const completed = [];
    let i = 0;
    while (i <= n - 3) {
      if (!sets[i].has(num)) {
        i++;
        continue;
      }
      const A = i, B = i + 1, C = i + 2, D = i + 3;
      const hitB = sets[B].has(num);
      const hitC = sets[C].has(num);
      let pattern = null;
      if (!hitB && hitC) pattern = 'A'; // hit, miss, hit
      else if (hitB && !hitC) pattern = 'B'; // hit, hit, miss

      if (pattern) {
        if (D < n) {
          completed.push({ hitD: sets[D].has(num), pattern });
          i = D + 1;
          continue;
        }
        predictions.push({ num, pattern, aIdx: A, bIdx: B, cIdx: C });
        break;
      }
      i++;
    }
    history[num] = completed;
  }

  predictions = predictions.map((p) => {
    const hArr = history[p.num] || [];
    const total = hArr.length;
    const hits = hArr.filter((x) => x.hitD).length;
    const rate = total > 0 ? hits / total : null;
    let tier = 'new';
    if (total >= 2 && rate >= 0.6) tier = 'high';
    else if (total >= 1 && rate != null && rate >= 0.33) tier = 'med';
    else if (total >= 1) tier = 'low';
    return { ...p, hits, total, rate, tier };
  });

  const tierRank = { high: 0, med: 1, low: 2, new: 3 };
  predictions.sort((a, b) => {
    if (tierRank[a.tier] !== tierRank[b.tier]) return tierRank[a.tier] - tierRank[b.tier];
    if (a.rate != null && b.rate != null && a.rate !== b.rate) return b.rate - a.rate;
    return b.total - a.total;
  });

  return { predictions, history, windowSize: n };
}

/**
 * Replays computeRepeats over growing prefixes of the draw history and
 * checks each run's predictions against the draw that actually followed -
 * a lightweight, built-in backtest of the Repeats engine's own track record.
 */
function computeRepeatsPerformance(draws, windowSize = DEFAULT_WINDOW, limit = 30) {
  const sorted = sortDraws(draws);
  if (sorted.length < 4) return [];

  const results = [];
  for (let i = 2; i < sorted.length - 1; i++) {
    const sub = sorted.slice(0, i + 1);
    const { predictions } = computeRepeats(sub, windowSize);
    if (!predictions.length) continue;
    const nextDraw = sorted[i + 1];
    const nextNums = nextDraw.numbers.concat(nextDraw.bonus != null ? [nextDraw.bonus] : []);
    const hits = predictions.filter((p) => nextNums.includes(p.num));
    results.push({ drawDate: nextDraw.drawDate, drawType: nextDraw.drawType, total: predictions.length, hits });
  }
  return results.reverse().slice(0, limit);
}

module.exports = { computeRepeats, computeRepeatsPerformance, DEFAULT_WINDOW };
