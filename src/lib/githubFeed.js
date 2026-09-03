import { useEffect, useState } from 'react';

/*
 * Live "News" feed for Finance mode, sourced from GitHub's public REST API
 * (no auth needed, CORS-open, generous enough rate limit for a personal
 * site since each visitor's browser only ever makes one request an hour).
 *
 * LinkedIn has no equivalent: there's no unauthenticated, browser-callable
 * API for a personal profile's activity, and getting one requires partner
 * API access individuals can't get for read-only personal use. Scraping it
 * client-side would also violate LinkedIn's terms and can't work anyway —
 * CORS blocks it. Those entries in feed.json stay hand-maintained.
 */

const CACHE_KEY = 'gh-feed-cache-v1';
const CACHE_MS = 60 * 60 * 1000; // 1 hour — plenty fresh for a "recent activity" panel

// Only the event types worth surfacing as a highlight; e.g. WatchEvent
// (starring someone else's repo) and ForkEvent are too noisy to be
// interesting here. Each formatter returns null to skip that specific
// event even if the type matches (e.g. a non-repository CreateEvent).
const FORMATTERS = {
  PushEvent: (e) => {
    const n = e.payload?.commits?.length || e.payload?.size || 0;
    if (!n) return null;
    const repo = e.repo.name.split('/')[1];
    return {
      xHtml: `pushed ${n} commit${n === 1 ? '' : 's'} to <b>${repo}</b>`,
      link: `https://github.com/${e.repo.name}`,
    };
  },
  PullRequestEvent: (e) => {
    const action = e.payload?.action;
    if (action !== 'opened' && action !== 'closed') return null;
    const repo = e.repo.name.split('/')[1];
    const verb = e.payload?.pull_request?.merged ? 'merged' : action === 'opened' ? 'opened' : 'closed';
    return {
      xHtml: `${verb} a pull request in <b>${repo}</b>`,
      link: e.payload?.pull_request?.html_url,
    };
  },
  ReleaseEvent: (e) => {
    const tag = e.payload?.release?.tag_name;
    if (!tag) return null;
    const repo = e.repo.name.split('/')[1];
    return { xHtml: `released <b>${tag}</b> for <b>${repo}</b>`, link: e.payload?.release?.html_url };
  },
  CreateEvent: (e) => {
    if (e.payload?.ref_type !== 'repository') return null;
    const repo = e.repo.name.split('/')[1];
    return { xHtml: `created <b>${repo}</b>`, link: `https://github.com/${e.repo.name}` };
  },
  IssuesEvent: (e) => {
    if (e.payload?.action !== 'opened') return null;
    const repo = e.repo.name.split('/')[1];
    return { xHtml: `opened an issue in <b>${repo}</b>`, link: e.payload?.issue?.html_url };
  },
};

function relTime(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.max(Math.floor(ms / 60000), 1);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${new Date(iso).getFullYear()}`;
}

function parseEvents(events, max) {
  const out = [];
  for (const e of events) {
    const fmt = FORMATTERS[e.type];
    if (!fmt) continue;
    const parsed = fmt(e);
    if (!parsed || !parsed.link) continue;
    out.push({ t: relTime(e.created_at), src: 'gh', xHtml: parsed.xHtml, link: parsed.link });
    if (out.length >= max) break;
  }
  return out;
}

/*
 * Returns:
 *   null      — still loading (first mount, before the cache/fetch resolves)
 *   []        — fetch failed, was empty, or nothing formattable — caller
 *               should fall back to feed.json's static 'gh' entries
 *   [...]     — live items, ready to render
 */
export function useGithubFeed(username, max = 3) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const settle = (value, cacheable) => {
      if (cancelled) return;
      setItems(value);
      if (cacheable) {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), items: value }));
        } catch {
          // Storage unavailable (private mode, quota) — just refetches next time.
        }
      }
    };

    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (cached && Date.now() - cached.at < CACHE_MS) {
        setItems(cached.items);
        return () => { cancelled = true; };
      }
    } catch {
      // Corrupt cache entry — ignore and fetch fresh below.
    }

    fetch(`https://api.github.com/users/${username}/events/public?per_page=30`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`GitHub API ${res.status}`))))
      .then((events) => settle(parseEvents(events, max), true))
      .catch(() => settle([], false)); // rate-limited, offline, blocked — fall back silently

    return () => { cancelled = true; };
  }, [username, max]);

  return items;
}
