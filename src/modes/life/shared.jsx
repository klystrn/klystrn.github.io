import { Link, useSearchParams } from 'react-router-dom';
import { LazyMotion, domAnimation } from 'framer-motion';
import { life } from '../../lib/lifeData';

/* Life sub-pages animate with framer-motion's `m` components inside a
   LazyMotion boundary, which pulls in only the DOM animation feature set
   (animate/exit/transitions) instead of the full motion bundle. */
export function Motion({ children }) {
  return <LazyMotion features={domAnimation} strict>{children}</LazyMotion>;
}

/* One back control for every Life sub-page: same label, same place. */
export function LifeBack({ className = '' }) {
  return <Link className={`life-back ${className}`} to="/life">← back to the room</Link>;
}

/* Sub-pages still waiting on real content (life.wip.<page> = true) show a
   work-in-progress card instead. ?preview renders the real page anyway, so
   it can be checked while the content goes in. */
export function WipGate({ page, children }) {
  const [params] = useSearchParams();
  if (!life.wip?.[page] || params.has('preview')) return children;
  const o = life.objects[page === 'photography' ? 'camera' : page];
  return (
    <div className="life-wip">
      <LifeBack />
      <div className="life-wip-card">
        <span className="life-wip-tag">{life.wip.tag}</span>
        <div className="life-wip-label">{o?.label}</div>
        <h1>{life.wip.title}</h1>
        <p>{o?.blurb}</p>
        <p className="life-wip-body">{life.wip.body}</p>
        <Link className="life-wip-btn" to="/life">Back to the room</Link>
      </div>
    </div>
  );
}
