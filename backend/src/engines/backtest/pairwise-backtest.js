const { sortDraws } = require('../core/draw-utils');
const { containsEquivalent } = require('../core/lottery-math');
const { pairwiseEngines, pairwiseConfigs } = require('../pairwise');

/**
 * A card's real-world target draw(s) are found the exact same way the
 * engine's own buildUnits() finds them for historical units - so instead
 * of re-deriving "next day" / "same day" rules here, we run buildUnits()
 * over the FULL (untruncated) draw list and pick out the unit whose
 * source anchor matches the card, reading its already-resolved targets.
 * (currentSources always anchors on sourceA, and every config's sourceA
 * carries the pattern's own drawType, or 'lunch' for the cross-type
 * engines - v2, bonus-v2, same-day - so that single rule covers all 7.)
 */
function resolveCardTargets(config, fullSortedDraws, card) {
  const anchorType = card.drawType ?? 'lunch';
  const units = config.buildUnits(fullSortedDraws);
  const unit = units.find((u) => u.sourceA.drawDate === card.sourceDate && u.sourceA.drawType === anchorType);
  return unit ? unit.targets : [];
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
 */
function runPairwiseBacktest(engineCode, draws, { minHistory = 6, limit = 60 } = {}) {
  const engine = pairwiseEngines[engineCode];
  const config = pairwiseConfigs[engineCode];
  if (!engine || !config) throw new Error(`Unknown pairwise engine "${engineCode}"`);

  const sorted = sortDraws(draws);
  const checkpoints = [];

  for (let i = minHistory; i < sorted.length; i++) {
    const history = sorted.slice(0, i + 1);
    const patterns = engine.discover(history);
    const cards = engine.buildCards(history, patterns);
    if (!cards.length) continue;

    let hits = 0;
    cards.forEach((card) => {
      const targets = resolveCardTargets(config, sorted, card);
      if (targets.length && cardHit(config, card, targets)) hits++;
    });

    checkpoints.push({
      asOfDate: sorted[i].drawDate,
      asOfType: sorted[i].drawType,
      predictionsCount: cards.length,
      hits,
      hitRate: cards.length ? hits / cards.length : null,
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
