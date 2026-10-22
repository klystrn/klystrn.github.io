// Route chunk loaders, shared by App's lazy() routes and the nav's hover
// prefetch: calling one early (on hover/focus of a nav tab) starts the
// download, and the later lazy() render reuses the same in-flight promise.
export const loaders = {
  tech: () => import('../modes/tech/Tech'),
  finance: () => import('../modes/finance/Finance'),
  life: () => import('../modes/life/Life'),
  photography: () => import('../modes/life/Photography'),
  watch: () => import('../modes/life/WatchStory'),
  cards: () => import('../modes/life/CardGame'),
};

const started = new Set();
export function prefetch(name) {
  if (!loaders[name] || started.has(name)) return;
  started.add(name);
  loaders[name]().catch(() => started.delete(name));
}
