import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { periodKeyFor, formatPeriodLabel, formatShortDate } from '../utils/date';
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
  const [refresh, setRefresh] = useState(0);
  const [claiming, setClaiming] = useState('');
  const [claimError, setClaimError] = useState('');
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
  }, [type, periodKey, refresh]);

    async function handleClaim(tier) {
    setClaiming(tier);
    setClaimError('');
    try {
      const res = await fetch(`${API}/api/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodType: type, periodKey, tier }),
      });
      const data = await res.json();
      // 409 means it was already claimed (say, on another device); reloading shows the truth
      if (!res.ok && res.status !== 409) throw new Error(data.error || 'Claim failed');
      setRefresh((n) => n + 1);
    } catch (err) {
      setClaimError(err.message);
    } finally {
      setClaiming('');
    }
  }

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
      {progress.windowStart !== progress.start && (
        <p className="reward-note">Counting from {formatShortDate(progress.windowStart)}, when you started tracking</p>
      )}
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
        {tiers.map((t) => {
          const ready = t.reached && !t.claimed;
          const cardClass = ['prize-card', ready && 'ready', t.claimed && 'claimed']
            .filter(Boolean)
            .join(' ');

          return (
            <div key={t.tier} className={cardClass}>
              <span className="card-tier">
                {TIER_LABELS[t.tier]} · {t.threshold} pts
              </span>
              <span className="card-title">
                {t.prize ?? <Link to="/prizes">Set a prize</Link>}
              </span>

              {t.claimed && <span className="card-status">Claimed</span>}
              {ready && t.prize && (
                <button
                  className="claim-btn"
                  disabled={claiming === t.tier}
                  onClick={() => handleClaim(t.tier)}
                >
                  {claiming === t.tier ? 'Claiming…' : 'Claim'}
                </button>
              )}
              {ready && !t.prize && <span className="card-status">Earned</span>}
              {!t.reached && (
                <span className="card-status">{t.threshold - points} points to go</span>
              )}
            </div>
          );
        })}
      </div>
      {claimError && <p className="error-msg">{claimError}</p>}
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