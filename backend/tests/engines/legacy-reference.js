/**
 * Verbatim port of the discovery logic from the legacy monolith
 * (remixed-544b6f74.html, lines ~350-610), field-renamed from `date` to
 * `drawDate` for consistency with the new draw shape. This file exists
 * ONLY as a regression oracle: the new engines under src/engines/pairwise
 * must produce equivalent output, proving the extraction didn't change
 * behaviour.
 */
const SC = {
  MAX_DRAWS: 10,
  MAX_FAIL: 2,
  EQ: [[1, 10], [2, 20], [3, 30], [4, 40], [6, 9], [12, 21], [13, 31], [14, 41], [16, 19], [23, 32], [24, 42], [26, 29], [34, 43], [36, 39], [46, 49]],
  SEQ: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
  ALL: (() => { const p = []; for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) p.push([i, j]); return p; })(),
};

function eqv(a, b) {
  if (a === b) return true;
  return SC.EQ.some((p) => (p[0] === a && p[1] === b) || (p[1] === a && p[0] === b));
}
function inD(num, draw) { return draw.numbers.concat([draw.bonus]).some((n) => eqv(num, n)); }
function inDirect(num, draw) { return draw.numbers.concat([draw.bonus]).some((n) => n === num); }
function sortD(arr) {
  return arr.slice().sort((a, b) => {
    const d = new Date(a.drawDate) - new Date(b.drawDate);
    return d !== 0 ? d : (a.drawType === 'lunch' ? -1 : 1);
  });
}
function cF(h) { let n = 0; for (let i = h.length - 1; i >= 0; i--) { if (!h[i].hit) n++; else break; } return n; }
function finalize(map) {
  return Array.from(map.values()).map((p) => {
    const hits = p.history.filter((x) => x.hit).length;
    const cf = cF(p.history);
    const status = (hits < 2 || cf >= SC.MAX_FAIL) ? 'failed' : cf === 1 ? 'warning' : 'active';
    return { ...p, occurrences: hits, failures: cf, status };
  }).filter((p) => p.history.filter((x) => x.hit).length >= 2 || p.status === 'failed');
}

function discoverSeq(draws) {
  const sorted = sortD(draws).slice(-SC.MAX_DRAWS);
  const map = new Map();
  for (let di = 0; di < sorted.length; di++) {
    const draw = sorted[di];
    const nums = draw.numbers.concat([draw.bonus]);
    const tgts = sorted.filter((d) => Math.round((new Date(d.drawDate) - new Date(draw.drawDate)) / 86400000) === 1);
    if (!tgts.length) continue;
    for (const [i, j] of SC.SEQ) {
      const n1 = nums[i], n2 = nums[j];
      const ap = n1 + n2, sp = Math.abs(n1 - n2);
      const va = ap >= 1 && ap <= 49, vs = sp >= 1 && sp <= 49 && sp !== 0;
      if (!va && !vs) continue;
      const ah = va && tgts.some((t) => inD(ap, t));
      const sh = vs && tgts.some((t) => inD(sp, t));
      const key = `${draw.drawType}|${i}|${j}`;
      if (!map.has(key)) map.set(key, { id: key, drawType: draw.drawType, p1: i, p2: j, history: [] });
      map.get(key).history.push({
        drawDate: draw.drawDate, v1: n1, v2: n2, addPred: va ? ap : null, subPred: vs ? sp : null,
        addHit: ah, subHit: sh, hit: ah || sh,
        addDirectHit: va && tgts.some((t) => inDirect(ap, t)),
        subDirectHit: vs && tgts.some((t) => inDirect(sp, t)),
      });
    }
  }
  return finalize(map);
}

function discoverFam(draws) {
  const sorted = sortD(draws).slice(-SC.MAX_DRAWS);
  const map = new Map();
  for (const type of ['lunch', 'tea']) {
    const td = sorted.filter((d) => d.drawType === type);
    for (let k = 1; k < td.length; k++) {
      const recent = td[k], prev = td[k - 1];
      const tgts = sorted.filter((d) => Math.round((new Date(d.drawDate) - new Date(recent.drawDate)) / 86400000) === 1);
      if (!tgts.length) continue;
      const rN = recent.numbers.concat([recent.bonus]);
      const pN = prev.numbers.concat([prev.bonus]);
      for (const [ri, pi] of SC.ALL) {
        const n1 = rN[ri], n2 = pN[pi];
        const ap = n1 + n2, sp = Math.abs(n1 - n2);
        const va = ap >= 1 && ap <= 49, vs = sp >= 1 && sp <= 49 && sp !== 0;
        if (!va && !vs) continue;
        const ah = va && tgts.some((t) => inD(ap, t));
        const sh = vs && tgts.some((t) => inD(sp, t));
        const key = `fam|${type}|${ri}|${pi}`;
        if (!map.has(key)) map.set(key, { id: key, drawType: type, rp: ri, pp: pi, history: [] });
        map.get(key).history.push({
          drawDate: recent.drawDate, nextDate: tgts[0].drawDate, rv: n1, pv: n2,
          addPred: va ? ap : null, subPred: vs ? sp : null, addHit: ah, subHit: sh, hit: ah || sh,
          addDirectHit: va && tgts.some((t) => inDirect(ap, t)),
          subDirectHit: vs && tgts.some((t) => inDirect(sp, t)),
        });
      }
    }
  }
  return finalize(map);
}

function discoverV2(draws) {
  const sorted = sortD(draws).slice(-SC.MAX_DRAWS);
  const map = new Map();
  const ld = sorted.filter((d) => d.drawType === 'lunch');
  for (const L of ld) {
    const T = sorted.find((d) => d.drawType === 'tea' && d.drawDate === L.drawDate);
    if (!T) continue;
    const lN = L.numbers.concat([L.bonus]), tN = T.numbers.concat([T.bonus]);
    const tgts = sorted.filter((d) => Math.round((new Date(d.drawDate) - new Date(L.drawDate)) / 86400000) === 1);
    if (!tgts.length) continue;
    for (let lp = 0; lp < 7; lp++) {
      for (let tp = 0; tp < 7; tp++) {
        const n1 = lN[lp], n2 = tN[tp], ap = n1 + n2, sp = Math.abs(n1 - n2);
        const va = ap >= 1 && ap <= 49, vs = sp >= 1 && sp <= 49 && sp !== 0;
        if (!va && !vs) continue;
        const ah = va && tgts.some((t) => inD(ap, t));
        const sh = vs && tgts.some((t) => inD(sp, t));
        const key = `${lp}|${tp}`;
        if (!map.has(key)) map.set(key, { id: key, lp, tp, history: [] });
        map.get(key).history.push({
          drawDate: L.drawDate, lVal: n1, tVal: n2, addPred: va ? ap : null, subPred: vs ? sp : null,
          addHit: ah, subHit: sh, hit: ah || sh,
          addDirectHit: va && tgts.some((t) => inDirect(ap, t)),
          subDirectHit: vs && tgts.some((t) => inDirect(sp, t)),
        });
      }
    }
  }
  return finalize(map);
}

function discoverSameDay(draws) {
  const sorted = sortD(draws).slice(-SC.MAX_DRAWS);
  const map = new Map();
  const dateMap = {};
  sorted.forEach((d) => { if (!dateMap[d.drawDate]) dateMap[d.drawDate] = {}; dateMap[d.drawDate][d.drawType] = d; });
  Object.keys(dateMap).forEach((drawDate) => {
    const L = dateMap[drawDate].lunch, T = dateMap[drawDate].tea;
    if (!L || !T) return;
    const nums = L.numbers.concat([L.bonus]);
    for (const [pi, pj] of SC.ALL) {
      if (pj <= pi) continue;
      const n1 = nums[pi], n2 = nums[pj];
      const ap = n1 + n2, sp = Math.abs(n1 - n2);
      const va = ap >= 1 && ap <= 49, vs = sp >= 1 && sp <= 49 && sp !== 0;
      if (!va && !vs) continue;
      const ah = va && inD(ap, T), sh = vs && inD(sp, T);
      const key = `sd|${pi}|${pj}`;
      if (!map.has(key)) map.set(key, { id: key, p1: pi, p2: pj, history: [] });
      map.get(key).history.push({ drawDate, v1: n1, v2: n2, addPred: va ? ap : null, subPred: vs ? sp : null, addHit: ah, subHit: sh, hit: ah || sh });
    }
  });
  return finalize(map);
}

function bonusNums(raw) {
  if (raw < 1) return [];
  if (raw <= 49) return [raw];
  const d1 = Math.floor(raw / 10), d2 = raw % 10;
  if (d1 === d2) return d1 >= 1 ? [d1] : [];
  const rev = d2 * 10 + d1;
  if (rev >= 1 && rev <= 49) return [rev];
  const out = [];
  if (d1 >= 1) out.push(d1);
  if (d2 >= 1) out.push(d2);
  return [...new Set(out)].sort((a, b) => a - b);
}
function finalizeBonus(map) {
  return Array.from(map.values()).map((p) => {
    const hits = p.history.filter((x) => x.hit).length;
    const cf = cF(p.history);
    const status = (hits < 1 || cf >= SC.MAX_FAIL) ? 'failed' : cf === 1 ? 'warning' : 'active';
    return { ...p, occurrences: hits, failures: cf, status };
  }).filter((p) => p.history.filter((x) => x.hit).length >= 1 || p.status === 'failed');
}

function discoverBonusSeq(draws) {
  const sorted = sortD(draws).slice(-SC.MAX_DRAWS);
  const map = new Map();
  for (const draw of sorted) {
    const nums = draw.numbers.concat([draw.bonus]);
    const tgts = sorted.filter((d) => Math.round((new Date(d.drawDate) - new Date(draw.drawDate)) / 86400000) === 1);
    if (!tgts.length) continue;
    for (const [i, j] of SC.SEQ) {
      const n1 = nums[i], n2 = nums[j];
      const addPs = bonusNums(n1 + n2);
      const sp = Math.abs(n1 - n2);
      const subPs = sp >= 1 ? [sp] : [];
      if (!addPs.length && !subPs.length) continue;
      const ah = addPs.some((ap) => tgts.some((t) => eqv(ap, t.bonus)));
      const sh = subPs.some((sp2) => tgts.some((t) => eqv(sp2, t.bonus)));
      const key = `${draw.drawType}|bseq|${i}|${j}`;
      if (!map.has(key)) map.set(key, { id: key, drawType: draw.drawType, p1: i, p2: j, history: [] });
      map.get(key).history.push({ drawDate: draw.drawDate, v1: n1, v2: n2, addPreds: addPs, subPreds: subPs, addHit: ah, subHit: sh, hit: ah || sh });
    }
  }
  return finalizeBonus(map);
}

function discoverBonusFam(draws) {
  const sorted = sortD(draws).slice(-SC.MAX_DRAWS);
  const map = new Map();
  for (const type of ['lunch', 'tea']) {
    const td = sorted.filter((d) => d.drawType === type);
    for (let k = 1; k < td.length; k++) {
      const recent = td[k], prev = td[k - 1], next = td[k + 1];
      if (!next) continue;
      const rN = recent.numbers.concat([recent.bonus]);
      const pN = prev.numbers.concat([prev.bonus]);
      for (const [ri, pi2] of SC.ALL) {
        const n1 = rN[ri], n2 = pN[pi2];
        const addPs = bonusNums(n1 + n2);
        const sp = Math.abs(n1 - n2);
        const subPs = sp >= 1 ? [sp] : [];
        if (!addPs.length && !subPs.length) continue;
        const ah = addPs.some((ap) => eqv(ap, next.bonus));
        const sh = subPs.some((sp2) => eqv(sp2, next.bonus));
        const key = `bfam|${type}|${ri}|${pi2}`;
        if (!map.has(key)) map.set(key, { id: key, drawType: type, rp: ri, pp: pi2, history: [] });
        map.get(key).history.push({ drawDate: recent.drawDate, nextDate: next.drawDate, rv: n1, pv: n2, addPreds: addPs, subPreds: subPs, addHit: ah, subHit: sh, hit: ah || sh });
      }
    }
  }
  return finalizeBonus(map);
}

function discoverBonusV2(draws) {
  const sorted = sortD(draws).slice(-SC.MAX_DRAWS);
  const map = new Map();
  const ld = sorted.filter((d) => d.drawType === 'lunch');
  for (const L of ld) {
    const T = sorted.find((d) => d.drawType === 'tea' && d.drawDate === L.drawDate);
    if (!T) continue;
    const lN = L.numbers.concat([L.bonus]);
    const tN = T.numbers.concat([T.bonus]);
    const tgts = sorted.filter((d) => Math.round((new Date(d.drawDate) - new Date(L.drawDate)) / 86400000) === 1);
    if (!tgts.length) continue;
    for (let lp = 0; lp < 7; lp++) {
      for (let tp = 0; tp < 7; tp++) {
        const n1 = lN[lp], n2 = tN[tp];
        const addPs = bonusNums(n1 + n2);
        const sp = Math.abs(n1 - n2);
        const subPs = sp >= 1 ? [sp] : [];
        if (!addPs.length && !subPs.length) continue;
        const ah = addPs.some((ap) => tgts.some((t) => eqv(ap, t.bonus)));
        const sh = subPs.some((sp2) => tgts.some((t) => eqv(sp2, t.bonus)));
        const key = `bv2|${lp}|${tp}`;
        if (!map.has(key)) map.set(key, { id: key, lp, tp, history: [] });
        map.get(key).history.push({ drawDate: L.drawDate, lVal: n1, tVal: n2, addPreds: addPs, subPreds: subPs, addHit: ah, subHit: sh, hit: ah || sh });
      }
    }
  }
  return finalizeBonus(map);
}

module.exports = {
  discoverSeq, discoverFam, discoverV2, discoverSameDay,
  discoverBonusSeq, discoverBonusFam, discoverBonusV2,
};
