/**
 * @fileoverview
 * JSDoc shapes for the content in src/data/*.json — not a TypeScript
 * migration, just enough for an editor to flag a typo'd field or a
 * cross-file id/sym mismatch before it silently renders as "undefined".
 *
 * Nothing here runs: these are type-only comments, invisible to the build.
 * Cast an import with e.g. `/** @type {import('../data/types').Award[]} *\/`
 * directly above the `const` that holds it (JSDoc can't retype an `import`
 * statement itself) to get editor checking against a shape below.
 *
 * A few ids are load-bearing across files and worth keeping in mind:
 *   - projects.json[].sym    ↔ lib/projects.js `bySym`, Finance's ?sym=,
 *                              Paper's ?project=, Tech's gotoFinance handoff
 *   - experience.json[].id   ↔ Paper's ?xp=
 *   - skills.json leaves[].parent  → a hubs[].id or subhubs[].id
 *   - skills.json subhubs[].hub    → a hubs[].id
 */

/**
 * @typedef {Object} Award
 * @property {string} name
 * @property {string} year
 * @property {boolean} curated  - shown in Paper's curated awards list
 * @property {string} [tape]    - shown on Finance's ticker tape, if present
 */

/**
 * @typedef {Object} Cert
 * @property {string} name
 * @property {string} short
 * @property {string} issuer
 * @property {string} year
 * @property {string} slug
 * @property {boolean} curated
 */

/**
 * @typedef {Object} Education
 * @property {string} id
 * @property {string} school
 * @property {string} programme
 * @property {string} years
 * @property {string} financeName
 * @property {string} financeTag
 * @property {string} financeMeta
 * @property {string} financeDesc
 * @property {string} academics
 * @property {string} beyond
 */

/**
 * @typedef {Object} ExperienceDetail
 * @property {string} meta
 * @property {string} body
 * @property {string[]} skills
 * @property {Record<string, string>} stats
 * @property {string} [private]  - shown in the detail modal as a redaction note
 */
/**
 * @typedef {Object} ExperienceTech
 * @property {string} file        - filename shown in Tech mode's file tree
 * @property {string} title
 * @property {[string, string][]} badges  - [className, label] pairs
 * @property {string} bodyHtml
 * @property {string[]} highlights
 */
/**
 * @typedef {Object} Experience
 * @property {string} id          - matches Paper's ?xp= deep link
 * @property {string} org
 * @property {string} orgShort
 * @property {string} role
 * @property {string} when
 * @property {string} location
 * @property {string} paperTag
 * @property {string} financeTag
 * @property {string} paperDesc
 * @property {string} financeMeta
 * @property {string} financeDesc
 * @property {ExperienceDetail} detail
 * @property {ExperienceTech} tech
 */

/**
 * @typedef {Object} ProjectCard
 * @property {boolean} [feat]     - featured/highlighted in Paper's project grid
 * @property {string} [yr]        - overrides `year` in the card display
 * @property {string} [blurb]     - overrides `desc` in the card display
 * @property {string[]} [tags]    - overrides `skills` in the card display
 */
/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} sym         - matches ?sym=, ?project=, bySym() lookups
 * @property {boolean} flag       - flagship vs supplementary (lib/projects.js)
 * @property {string} repo        - matches Tech terminal's `open <repo>`
 * @property {string} title
 * @property {string} sector
 * @property {string} from
 * @property {string} to
 * @property {string} year
 * @property {string} role
 * @property {string} status
 * @property {string} desc
 * @property {string[]} skills
 * @property {Record<string, string>} stats
 * @property {[string, number, string][]} langs   - [language, pct, colour]
 * @property {number[]} curve     - Finance chart data points; chg is derived from this
 * @property {[number, string][]} [miles]  - [curve index, milestone label]
 * @property {ProjectCard} [card]
 */

/**
 * @typedef {Object} SkillHub
 * @property {string} id
 * @property {string} label
 * @property {number} angle
 * @property {number} span
 */
/**
 * @typedef {Object} SkillSubhub
 * @property {string} id
 * @property {string} label
 * @property {string} hub    - a SkillHub id
 */
/**
 * @typedef {Object} SkillLeaf
 * @property {string} name
 * @property {number} strength     - 1-10, drives node radius + font size
 * @property {string} evidence
 * @property {string} parent       - a SkillHub or SkillSubhub id
 * @property {string[]} also       - extra parent-cluster memberships (dashed links)
 * @property {string[]} connects_to  - cross-cluster leaf/subhub links, by name/id
 */
/**
 * @typedef {Object} SkillsData
 * @property {{label: string, caption: string}} root
 * @property {SkillHub[]} hubs
 * @property {SkillSubhub[]} subhubs
 * @property {SkillLeaf[]} leaves
 * @property {Record<string, string[] | number>} stack  - Tech mode's stack.json view (years_writing_code is derived in lib/data.js, not stored)
 */

/**
 * @typedef {Object} Testimonial
 * @property {string} name
 * @property {string} slug
 * @property {string} title
 * @property {string} [titleFinance]
 * @property {string} [quote]        - entries without this are filtered out (Furniture.jsx)
 * @property {string} [quoteFinance]
 * @property {string} [url]
 * @property {string} [financeTag]
 */

/**
 * @typedef {Object} TimelineMilestone
 * @property {string} b     - bold lead-in text
 * @property {string} text
 * @property {string} when
 */
/**
 * @typedef {Object} TimelinePhase
 * @property {string} when
 * @property {string} phase
 * @property {string} desc
 * @property {string} tag
 * @property {TimelineMilestone[]} miles
 */
/**
 * @typedef {Object} TimelineCommit
 * @property {string} msg
 * @property {string} tag
 * @property {string} hash
 * @property {string} when
 * @property {string} c   - hex colour
 */
/**
 * @typedef {Object} TimelineData
 * @property {TimelinePhase[]} phases
 * @property {TimelineCommit[]} commits
 */

/**
 * @typedef {Object} FeedItem
 * @property {string} t        - relative time label ("2d", "1w", "2025")
 * @property {'gh'|'li'} src
 * @property {string} xHtml    - inner HTML, rendered via dangerouslySetInnerHTML
 * @property {string} link     - "#" means no real destination (link is hidden)
 */

/**
 * @typedef {Object} HeaderGroup
 * @property {string} [eyebrow]
 * @property {string} [paper]
 * @property {string|null} [paperSub]
 */
/**
 * @typedef {Object} Headers
 * @property {HeaderGroup} about
 * @property {HeaderGroup} timeline
 * @property {HeaderGroup} experience
 * @property {HeaderGroup} projects
 * @property {HeaderGroup} skills
 * @property {{eyebrow: string, certsEyebrow: string}} awards
 * @property {HeaderGroup} testimonials
 * @property {Record<string, string>} finance   - panel titles keyed by name
 */

/**
 * @typedef {Object} IdentityContact
 * @property {string} email
 * @property {string} linkedin
 * @property {string} linkedinHandle
 * @property {string} github
 * @property {string} githubHandle
 * @property {string} [cvUrl]
 * @property {string} [driveUrl]
 */
/**
 * @typedef {Object} Identity
 * @property {string} name
 * @property {string} credit
 * @property {string} location
 * @property {string[]} positioningLinesHtml
 * @property {string} lede
 * @property {string} status
 * @property {string} goal
 * @property {string[]} aboutHtml
 * @property {{n?: number, since?: number, label: string, key: string}[]} stats  - `since` (a start year) is turned into `n` by lib/data.js; use it for anything that grows with time
 * @property {IdentityContact} contact
 * @property {Record<string, string>} finance   - $RTAN ticket copy
 * @property {Record<string, string>} tech      - README/terminal copy
 */

/**
 * @typedef {Object} CardGameConfig
 * @property {string} title
 * @property {string} intro
 * @property {number} cardsPerRound
 * @property {number} curveBonus
 * @property {{r: number, points: number, label: string}[]} rings
 */
/**
 * @typedef {Object} WatchEntry
 * @property {string} year
 * @property {string} line1
 * @property {string} line2
 */
/**
 * @typedef {Object} WatchStoryData
 * @property {string} brand
 * @property {string} sub
 * @property {WatchEntry[]} entries
 */
/**
 * @typedef {Object} PhotoTile
 * @property {string} id
 * @property {string} title
 * @property {number} count        - overridden by photos.length once photos exist
 * @property {string} cover        - explicit override; else photos[0], else a gradient
 * @property {number} hue
 * @property {string[]} photos     - real image paths; empty = still a placeholder set
 */
/**
 * @typedef {Object} PhotographyData
 * @property {string} handle
 * @property {string} name
 * @property {string} bio
 * @property {string} avatar
 * @property {{posts: number, gear: string, since: string}} stats
 * @property {PhotoTile[]} tiles
 */
/**
 * @typedef {Object} LifeData
 * @property {Object} objects        - room hotspot content, keyed by spot id
 * @property {{id: string}[]} spots  - room hotspot positions (see Life.jsx SPOTS)
 * @property {{name: string, year: string}[]} trophies
 * @property {CardGameConfig} cards
 * @property {WatchStoryData} watchStory
 * @property {PhotographyData} photography
 */

export {};
