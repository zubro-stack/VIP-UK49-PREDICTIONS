const { sortDraws } = require('../core/draw-utils');
const { drawValues, computeSum, computeDiff, identityTransform, containsEquivalent, containsDirect } = require('../core/lottery-math');
const { finalizePatterns, currentStreak } = require('../core/pattern-store');

const DEFAULT_MAX_DRAWS = 10;

/**
 * One generic engine drives all seven "pairwise" prediction variants
 * (V1 Sequential, V1 Family, V2, Same Day, Bonus Sequential/Family/V2).
 * What differs between them is captured entirely in the config object:
 *
 *  - buildUnits(sortedDraws): the only truly variant-specific piece. Returns
 *    the list of { sourceA, sourceB, targets, drawType } comparisons to run
 *    (e.g. "this draw vs itself, target = next day" for Sequential; "recent
 *    vs previous draw of the same type" for Family; "same-day Lunch vs Tea"
 *    for V2/Same Day).
 *  - positionPairs(unit): which [i, j] position pairs to test (the 6
 *    sequential neighbours P1-P2..P6-B, or the full 7x7 product).
 *  - sumTransform / diffTransform: identityTransform for standard engines,
 *    bonusDigitShiftTransform for bonus engines (folds sums > 49 back into
 *    range instead of discarding them).
 *  - matchTarget(prediction, targetDraw): whole-draw equivalence match for
 *    standard engines, bonus-only equivalence match for bonus engines.
 *  - trackDirectHits: whether to also record exact (non-equivalence) hits.
 *  - minHits / maxFail: 2/2 for standard engines, 1/2 for bonus engines.
 *  - keyFn(unit, i, j): grouping key for the pattern map.
 *  - extraFn(unit): optional extra metadata stored on the pattern.
 *  - currentSources(sortedDraws, pattern): resolves the latest source
 *    draw(s) for a pattern so buildCards can compute today's prediction.
 */
function discover(draws, config) {
  const maxDraws = config.maxDraws ?? DEFAULT_MAX_DRAWS;
  const sorted = sortDraws(draws).slice(-maxDraws);
  const sumTransform = config.sumTransform ?? identityTransform;
  const diffTransform = config.diffTransform ?? identityTransform;
  const matchTarget = config.matchTarget ?? ((prediction, target) => containsEquivalent(prediction, target));
  const matchTargetDirect = config.matchTargetDirect ?? ((prediction, target) => containsDirect(prediction, target));

  const map = new Map();
  const units = config.buildUnits(sorted);

  for (const unit of units) {
    const valuesA = drawValues(unit.sourceA);
    const valuesB = drawValues(unit.sourceB);
    const pairs = config.positionPairs(unit);

    for (const [i, j] of pairs) {
      const n1 = valuesA[i];
      const n2 = valuesB[j];
      const addPreds = sumTransform(computeSum(n1, n2));
      const subPreds = diffTransform(computeDiff(n1, n2));
      if (addPreds.length === 0 && subPreds.length === 0) continue;

      const addHit = addPreds.some((p) => unit.targets.some((t) => matchTarget(p, t)));
      const subHit = subPreds.some((p) => unit.targets.some((t) => matchTarget(p, t)));

      const key = config.keyFn(unit, i, j);
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          drawType: unit.drawType ?? null,
          positionA: i,
          positionB: j,
          extra: config.extraFn ? config.extraFn(unit) : {},
          history: [],
        });
      }

      const entry = {
        sourceDate: unit.sourceA.drawDate,
        targetDate: unit.targets[0] ? unit.targets[0].drawDate : null,
        sourceDrawId: unit.sourceA.id ?? null,
        targetDrawId: unit.targets[0] ? unit.targets[0].id ?? null : null,
        v1: n1,
        v2: n2,
        addPreds,
        subPreds,
        addHit,
        subHit,
        hit: addHit || subHit,
      };
      if (config.trackDirectHits) {
        entry.addDirectHit = addPreds.some((p) => unit.targets.some((t) => matchTargetDirect(p, t)));
        entry.subDirectHit = subPreds.some((p) => unit.targets.some((t) => matchTargetDirect(p, t)));
      }
      map.get(key).history.push(entry);
    }
  }

  return finalizePatterns(map, { maxFail: config.maxFail ?? 2, minHits: config.minHits ?? 2 });
}

function buildCards(draws, patterns, config) {
  const sorted = sortDraws(draws);
  const sumTransform = config.sumTransform ?? identityTransform;
  const diffTransform = config.diffTransform ?? identityTransform;
  const minStreak = config.minHits ?? 2;

  return patterns
    .filter((p) => p.status === 'active' && p.occurrences >= (config.minHits ?? 2))
    .map((pattern) => {
      const current = config.currentSources(sorted, pattern);
      if (!current) return null;
      const valuesA = drawValues(current.sourceA);
      const valuesB = drawValues(current.sourceB);
      const n1 = valuesA[pattern.positionA];
      const n2 = valuesB[pattern.positionB];
      const streak = currentStreak(pattern.history);
      const lastHit = pattern.history.length > 0 ? !!pattern.history[pattern.history.length - 1].hit : false;
      const hasDirectHit = pattern.history.some((h) => h.addDirectHit || h.subDirectHit);

      return {
        id: pattern.id,
        drawType: pattern.drawType,
        positionA: pattern.positionA,
        positionB: pattern.positionB,
        extra: pattern.extra,
        v1: n1,
        v2: n2,
        sourceDate: current.sourceA.drawDate,
        addPreds: sumTransform(computeSum(n1, n2)),
        subPreds: diffTransform(computeDiff(n1, n2)),
        totalHits: pattern.occurrences,
        streak,
        last5: pattern.history.filter((h) => h.hit).slice(-5).reverse(),
        failures: pattern.failures,
        lastHit,
        hasDirectHit,
      };
    })
    .filter((card) => card && card.streak >= minStreak)
    .sort((a, b) => {
      if (a.hasDirectHit !== b.hasDirectHit) return a.hasDirectHit ? -1 : 1;
      if (a.lastHit !== b.lastHit) return a.lastHit ? -1 : 1;
      return b.streak - a.streak || b.totalHits - a.totalHits;
    });
}

function createPairwiseEngine(config) {
  return {
    code: config.code,
    label: config.label,
    discover: (draws) => discover(draws, config),
    buildCards: (draws, patterns) => buildCards(draws, patterns, config),
  };
}

module.exports = { createPairwiseEngine };
