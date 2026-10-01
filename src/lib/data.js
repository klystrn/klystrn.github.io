// Single typed entry point for src/data/*.json (projects.json is the one
// exception — it already has its own wrapper in lib/projects.js, since it
// needs derived fields, not just a type). Importing through here instead of
// the raw JSON paths means each shape is annotated once, in one place, and
// every consumer gets the same editor checking without repeating the cast.
// See src/data/types.js for what each shape actually looks like.
//
// Two things deliberately aren't re-exported here:
//   - life.json: only used by Life mode's own lazy-loaded routes (see
//     lib/lifeData.js).
//   - education.json and feed.json: Finance-only, and unlike the rest of
//     this file's data, Paper.jsx's import graph never separately needed
//     them before — bundlers don't reliably tree-shake unused named
//     exports out of a shared module, so keeping them here would leak
//     Finance-only content into Paper's eager bundle (see lib/financeData.js).
//
// Everything that IS re-exported here was already part of Paper's eager
// bundle before this file existed (via Paper's own direct imports, or via
// Constellation.jsx/Furniture.jsx, which it renders) — so sharing it here
// doesn't add anything new to that bundle.

import identityJson from '../data/identity.json';
import experienceJson from '../data/experience.json';
import timelineJson from '../data/timeline.json';
import awardsJson from '../data/awards.json';
import certsJson from '../data/certs.json';
import skillsJson from '../data/skills.json';
import testimonialsJson from '../data/testimonials.json';
import headersJson from '../data/headers.json';

// "Years of X" figures are derived from a start year (identity.json stats'
// `since`) at load, not hand-typed — so they tick up on their own instead of
// needing someone to remember to bump them every January, and the prose that
// repeats them ({CodingSpan} / {tradingSpan} tokens) can't disagree with the
// stat tiles. Same principle as lib/projects.js deriving `chg` from the curve.
const NUM_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
const span = (n) => `${NUM_WORDS[n] ?? n} ${n === 1 ? 'year' : 'years'}`;
const cap = (str) => str[0].toUpperCase() + str.slice(1);
const yearsSince = (y) => Math.max(new Date().getFullYear() - y, 0);

const sinceOf = (key) => identityJson.stats.find((s) => s.key === key)?.since;
const codingYears = yearsSince(sinceOf('years_writing_code'));
const tradingYears = yearsSince(sinceOf('years_trading'));
const fill = (text) =>
  text
    .replaceAll('{CodingSpan}', cap(span(codingYears)))
    .replaceAll('{codingSpan}', span(codingYears))
    .replaceAll('{TradingSpan}', cap(span(tradingYears)))
    .replaceAll('{tradingSpan}', span(tradingYears));

/** @type {import('../data/types').Identity} */
export const identity = {
  ...identityJson,
  lede: fill(identityJson.lede),
  aboutHtml: identityJson.aboutHtml.map(fill),
  stats: identityJson.stats.map((s) => ({ ...s, n: s.since != null ? yearsSince(s.since) : s.n })),
  tech: { ...identityJson.tech, readmeAboutHtml: fill(identityJson.tech.readmeAboutHtml) },
};

/** @type {import('../data/types').Experience[]} */
export const experience = experienceJson;

/** @type {import('../data/types').TimelineData} */
export const timeline = timelineJson;

/** @type {import('../data/types').Award[]} */
export const awards = awardsJson;

/** @type {import('../data/types').Cert[]} */
export const certs = certsJson;

/** @type {import('../data/types').SkillsData} */
export const skills = {
  ...skillsJson,
  stack: { ...skillsJson.stack, years_writing_code: codingYears },
};

/** @type {import('../data/types').Testimonial[]} */
export const testimonials = testimonialsJson;

/** @type {import('../data/types').Headers} */
export const headers = headersJson;
