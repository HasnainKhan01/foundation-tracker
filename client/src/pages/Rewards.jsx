import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { periodKeyFor, formatPeriodLabel } from '../utils/date';
import './Rewards.css';

const API = import.meta.env.VITE_API_URL;

const SECTIONS = [
  { type: 'week', heading: 'This week' },
  { type: 'month', heading: 'This month' },
  { type: 'year', heading: 'This year' },
];

const TIER_LABELS = { floor: 'Floor', ceiling: 'Ceiling', perfect: 'Perfect' };

// One bar + three prize cards for the current week, month, or year
function PeriodSection({ type, heading }) {
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const periodKey = periodKeyFor(type);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API}/api/progress?periodType=${type}&periodKey=${periodKey}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        if (!cancelled) setProgress(data);
      })
      .catch((err) => {
        console.error('Failed to load progress:', err);
        if (!cancelled) setError('Couldn’t load progress.');
      });

    return () => { cancelled = true; };
  }, [type, periodKey]);

  if (error) {
    return (
      <section className="reward-section">
        <h2>{heading}</h2>
        <p className="error-msg">{error}</p>
      </section>
    );
  }

  if (!progress) {
    return (
      <section className="reward-section is-loading">
        <h2>{heading}</h2>
        <p className="reward-date">{formatPeriodLabel(type, periodKey)}</p>
      </section>
    );
  }

  const { points, maxPoints, tiers } = progress;
  const fillPct = Math.min(100, (points / maxPoints) * 100);

  // The bar takes the color of the highest tier reached so far
  const reached = tiers.filter((t) => t.reached);
  const level = reached.length ? reached[reached.length - 1].tier : 'none';

  return (
    <section className="reward-section">
      <h2>{heading}</h2>
      <p className="reward-date">{formatPeriodLabel(type, periodKey)}</p>
      <p className="reward-points">
        <strong>{points}</strong> / {maxPoints} points
      </p>

      <div
        className="bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={maxPoints}
        aria-valuenow={points}
        aria-label={`${heading} progress`}
      >
        <div className={`bar-fill fill-${level}`} style={{ width: `${fillPct}%` }} />
        {tiers.map((t) => (
          <span key={t.tier} className="tick" style={{ left: `${t.percent}%` }} />
        ))}
      </div>

      <div className="prize-cards">
        {tiers.map((t) => (
          <div key={t.tier} className={t.reached ? 'prize-card earned' : 'prize-card'}>
            <span className="card-tier">
              {TIER_LABELS[t.tier]} · {t.threshold} pts
            </span>
            <span className="card-title">
              {t.prize ?? <Link to="/prizes">Set a prize</Link>}
            </span>
            <span className="card-status">
              {t.reached ? 'Earned' : `${t.threshold - points} points to go`}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Rewards() {
  return (
    <div>
      <div className="page-header">
        <h1>Rewards</h1>
        <p className="subline">Consistency earns the good stuff</p>
      </div>

      {SECTIONS.map((s) => (
        <PeriodSection key={s.type} type={s.type} heading={s.heading} />
      ))}

      <div className="legend">
        <span><span className="legend-swatch fill-floor"></span>Floor</span>
        <span><span className="legend-swatch fill-ceiling"></span>Ceiling</span>
        <span><span className="legend-swatch fill-perfect"></span>Perfect</span>
      </div>
    </div>
  );
}

export default Rewards;