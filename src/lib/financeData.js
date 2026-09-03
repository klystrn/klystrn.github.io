// Typed wrapper for the two data files that are genuinely Finance-only —
// split out of lib/data.js so they stay out of Paper's eager bundle. See
// that file's own comment for why, and src/data/types.js for the shapes.

import educationJson from '../data/education.json';
import feedJson from '../data/feed.json';

/** @type {import('../data/types').Education[]} */
export const education = educationJson;

/** @type {import('../data/types').FeedItem[]} */
export const feed = feedJson;
