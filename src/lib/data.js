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

/** @type {import('../data/types').Identity} */
export const identity = identityJson;

/** @type {import('../data/types').Experience[]} */
export const experience = experienceJson;

/** @type {import('../data/types').TimelineData} */
export const timeline = timelineJson;

/** @type {import('../data/types').Award[]} */
export const awards = awardsJson;

/** @type {import('../data/types').Cert[]} */
export const certs = certsJson;

/** @type {import('../data/types').SkillsData} */
export const skills = skillsJson;

/** @type {import('../data/types').Testimonial[]} */
export const testimonials = testimonialsJson;

/** @type {import('../data/types').Headers} */
export const headers = headersJson;
