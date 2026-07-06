const { strat1, strat2, strat3, hitType } = require('./strategies');
const { byType, sortDraws } = require('../core/draw-utils');
const { drawValues } = require('../core/lottery-math');

/** The calendar day after a draw date (string-only, YYYY-MM-DD, local-time parsing - no UTC offset shift). */
function nextCalendarDay(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + 1);
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function classify(predictions, sameValues, otherValues) {
  return predictions.map((n) => ({ value: n, hit: n == null ? 'none' : hitType(n, sameValues, otherValues) }));
}

function computeStrategies(draw) {
  return { draw, s1: strat1(draw.numbers), s2: strat2(draw.numbers), s3: strat3(draw.bonus) };
}

/**
 * Each source draw's own next-day verification targets, resolved
 * independently per column - a Lunch and Tea source picked from different
 * dates must each be checked against what actually happened the day after
 * THEM, not a single date derived from whichever of the two is later.
 */
function resolveNextDayTargets(draws, sourceDraw) {
  const otherType = sourceDraw.drawType === 'lunch' ? 'tea' : 'lunch';
  const nextDate = nextCalendarDay(sourceDraw.drawDate);
  const sameTypeDraw = draws.find((d) => d.drawDate === nextDate && d.drawType === sourceDraw.drawType) ?? null;
  const otherTypeDraw = draws.find((d) => d.drawDate === nextDate && d.drawType === otherType) ?? null;
  return { nextDate, sameTypeDraw, otherTypeDraw };
}

function buildColumn(draws, source, otherTargetsForSameDay) {
  const { s1, s2, s3 } = computeStrategies(source);
  const { nextDate, sameTypeDraw, otherTypeDraw } = resolveNextDayTargets(draws, source);
  const sameValues = sameTypeDraw ? drawValues(sameTypeDraw) : [];
  const otherValues = otherTypeDraw ? drawValues(otherTypeDraw) : [];

  const column = {
    draw: source,
    s1: classify(s1, sameValues, otherValues),
    s2: classify(s2, sameValues, otherValues),
    s3: classify(s3, sameValues, otherValues),
    nextDate,
    verified: Boolean(sameTypeDraw || otherTypeDraw),
  };

  if (otherTargetsForSameDay) {
    const { sameDayValues } = otherTargetsForSameDay;
    column.sameDay = {
      s1: classify(s1, sameDayValues, []),
      s2: classify(s2, sameDayValues, []),
      s3: classify(s3, sameDayValues, []),
    };
  }
  return column;
}

/**
 * Applies the three strategies (strat1/strat2/strat3) to a chosen Lunch
 * and Tea source draw (defaulting to the most recent of each - falling
 * back to the most recent when a given id doesn't match any draw, same as
 * when no id is given at all), then verifies each column's predictions
 * against whatever next-day draws are already recorded for THAT column's
 * own source date - "same" = hit in the next draw of the same type,
 * "other" = hit in the next draw of the other type, "none" = no
 * verification data yet. Also reports the same-day Lunch-to-Tea strategy
 * (no day offset).
 */
function computeCalcResult(draws, { lunchDrawId, teaDrawId } = {}) {
  const lunchDraws = sortDraws(byType(draws, 'lunch')).reverse();
  const teaDraws = sortDraws(byType(draws, 'tea')).reverse();

  const selectedLunch = (lunchDrawId ? lunchDraws.find((d) => d.id === lunchDrawId) : null) ?? lunchDraws[0] ?? null;
  const selectedTea = (teaDrawId ? teaDraws.find((d) => d.id === teaDrawId) : null) ?? teaDraws[0] ?? null;
  if (!selectedLunch && !selectedTea) return null;

  const sameDayTea = selectedLunch
    ? draws.find((d) => d.drawDate === selectedLunch.drawDate && d.drawType === 'tea') ?? null
    : null;
  const sameDayValues = sameDayTea ? drawValues(sameDayTea) : [];

  return {
    lunch: selectedLunch ? buildColumn(draws, selectedLunch, { sameDayValues }) : null,
    tea: selectedTea ? buildColumn(draws, selectedTea, null) : null,
    sameDayTea,
  };
}

module.exports = { computeCalcResult, nextCalendarDay };
