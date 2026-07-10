const { sortDraws } = require('../core/draw-utils');
const { containsEquivalent } = require('../core/lottery-math');
const { pairwiseEngines, pairwiseConfigs } = require('../pairwise');

function targetKey(drawDate, drawType) {
  return `${drawDate}|${drawType}`;
}

/**
 * A card's real-world target draw(s) are found the exact same way the
 * engine's own buildUnits() finds them for historical units - so instead
 * of re-deriving "next day" / "same day" rules here, we run buildUnits()
 * ONCE over the FULL (untruncated) draw list and index every unit by its
 * source anchor. (currentSources always anchors on sourceA, and every
 * config's sourceA carries the pattern's own drawType, or 'lunch' for the
 * cross-type engines - v2, bonus-v2, same-day - so one lookup rule covers
 * all 7.) Built once per backtest run instead of once per card per
 * checkpoint, since the full draw list never changes across the replay.
 */
function buildTargetIndex(config, fullSortedDraws) {
  const index = new Map();
  config.buildUnits(fullSortedDraws).forEach((unit) => {
    index.set(targetKey(unit.sourceA.drawDate, unit.sourceA.drawType), unit.targets);
  });
  return index;
}

function resolveCardTargets(targetIndex, card) {
  const anchorType = card.drawType ?? 'lunch';
  return targetIndex.get(targetKey(card.sourceDate, anchorType));
}

function cardHit(config, card, targets) {
  const matchTarget = config.matchTarget ?? ((prediction, target) => containsEquivalent(prediction, target));
  const addHit = card.addPreds.some((p) => targets.some((t) => matchTarget(p, t)));
  const subHit = card.subPreds.some((p) => targets.some((t) => matchTarget(p, t)));
  return addHit || subHit;
}

/**
 * Replays a pairwise engine as if it had been run after each draw in turn:
 * at checkpoint i, only draws[0..i] are "known", discover()+buildCards()
 * produce that moment's predictions, and they're scored against what
 * really happened next (found via the full draw list). Aggregating this
 * across every checkpoint gives the engine's real historical hit rate -
 * this is what "backtesting" means for the 7 pairwise engines, none of
 * which had any performance-measurement built in before.
 *
 * A card whose real outcome isn't resolvable (no matching unit - e.g. the
 * Same Day engine anchoring on a Lunch draw whose Tea hasn't been entered
 * yet, or any engine's source draw sitting at the very end of the draw
 * list with no next-day target recorded) is excluded from that
 * checkpoint's tally entirely rather than counted as a guaranteed miss -
 * otherwise every trailing checkpoint
 * (exactly the ones a user reviewing a backtest looks at first) would have
 * its hit rate artificially deflated by outcomes that simply aren't known
 * yet.
 */
function runPairwiseBacktest(engineCode, draws, { minHistory = 6, limit = 60 } = {}) {
  const engine = pairwiseEngines[engineCode];
  const config = pairwiseConfigs[engineCode];
  if (!engine || !config) throw new Error(`Unknown pairwise engine "${engineCode}"`);

  const sorted = sortDraws(draws);
  const targetIndex = buildTargetIndex(config, sorted);
  const checkpoints = [];

  for (let i = minHistory; i < sorted.length; i++) {
    const history = sorted.slice(0, i + 1);
    const patterns = engine.discover(history);
    const cards = engine.buildCards(history, patterns);
    if (!cards.length) continue;

    let hits = 0;
    let resolvedCount = 0;
    cards.forEach((card) => {
      const targets = resolveCardTargets(targetIndex, card);
      if (!targets) return; // outcome not yet known - excluded, not a miss
      resolvedCount++;
      if (targets.length && cardHit(config, card, targets)) hits++;
    });
    if (!resolvedCount) continue;

    checkpoints.push({
      asOfDate: sorted[i].drawDate,
      asOfType: sorted[i].drawType,
      predictionsCount: resolvedCount,
      hits,
      hitRate: hits / resolvedCount,
    });
  }

  const kept = checkpoints.slice(-limit).reverse();
  const totalPredictions = kept.reduce((a, c) => a + c.predictionsCount, 0);
  const totalHits = kept.reduce((a, c) => a + c.hits, 0);

  return {
    checkpoints: kept,
    summary: {
      checkpointCount: kept.length,
      totalPredictions,
      totalHits,
      overallHitRate: totalPredictions ? totalHits / totalPredictions : null,
    },
  };
}

module.exports = { runPairwiseBacktest };
