import { Link } from 'react-router-dom';

/* Unknown routes: a real editorial 404 instead of silently rendering home.
   Renders under the default (paper/light) chrome since the path isn't a mode. */
export default function NotFound() {
  return (
    <div className="mv">
      <div className="nf">
        <div className="nf-in">
          <div className="nf-code">404 · PAGE NOT FOUND</div>
          <h1>This page wandered off.</h1>
          <p>The link is broken or the page never existed. Let's get you back to the work.</p>
          <Link className="nf-btn" to="/">← Back to the portfolio</Link>
        </div>
      </div>
    </div>
  );
}
