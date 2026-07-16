import identity from '../../data/identity.json';

/* Deferred tab — stub only until Professional ships (handoff §2). */
export default function Life() {
  return (
    <div className="life-panel">
      <div className="in">
        <h2>The Table</h2>
        <p>Camera · watch · deck of cards · namecard: the interactive Life scene lands after Professional v1 ships.</p>
        <div className="credit">Built by {identity.name}</div>
      </div>
    </div>
  );
}
