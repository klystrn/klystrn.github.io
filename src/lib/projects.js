import raw from '../data/projects.json';

// Growth is derived from the curve at load — never hand-typed — so it can't
// drift out of sync with the chart (content parity rule).
export const PROJECTS = raw.map((p) => ({
  ...p,
  chg: `+${p.curve[p.curve.length - 1] - p.curve[0]} pts`,
}));

export const FLAGSHIP = PROJECTS.filter((p) => p.flag);
export const SUPPLEMENTARY = PROJECTS.filter((p) => !p.flag);

export const bySym = (sym) => PROJECTS.find((p) => p.sym === sym);
