/** Numbers predicted by both a V1 engine (Sequential or Family) and V2 - agreement across engine families. */
function computeCommonNumbers(crossEnginePredictions) {
  const v1Set = new Set([...crossEnginePredictions.seq, ...crossEnginePredictions.fam]);
  const v2Set = new Set(crossEnginePredictions.v2);
  const result = [];
  v1Set.forEach((num) => {
    if (v2Set.has(num)) {
      const sources = [];
      if (crossEnginePredictions.seq.includes(num)) sources.push('Seq');
      if (crossEnginePredictions.fam.includes(num)) sources.push('Fam');
      result.push({ num, v1Sources: sources });
    }
  });
  return result.sort((a, b) => a.num - b.num);
}

module.exports = { computeCommonNumbers };
