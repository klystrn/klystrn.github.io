// Typed wrapper for life.json, kept separate from lib/data.js on purpose:
// every consumer of this file is one of Life mode's own lazy-loaded routes
// (CardGame, Life, WatchStory, Photography), so this data should only ever
// end up in Life mode's split chunk — not in the eagerly-loaded main bundle
// that Paper.jsx pulls in. See src/data/types.js for the shape.

import lifeJson from '../data/life.json';

/** @type {import('../data/types').LifeData} */
export const life = lifeJson;
