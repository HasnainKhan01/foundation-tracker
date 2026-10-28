import { useState, useEffect } from 'react';
import { periodKeyFor, shiftPeriod, formatPeriodLabel } from '../utils/date';
import './Prizes.css';

const API = import.meta.env.VITE_API_URL;

const PERIOD_TYPES = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'year', label: 'Year' },
];

const TIERS = [
  { id: 'floor', label: 'Floor' },
  { id: 'ceiling', label: 'Ceiling' },
  { id: 'perfect', label: 'Perfect' },
];

function Prizes() {
  const [periodType, setPeriodType] = useState('week');
  const [periodKey, setPeriodKey] = useState(() => periodKeyFor('week'));
  const [saved, setSaved] = useState({});   // what the server has: { floor: 'Title', ... }
  const [drafts, setDrafts] = useState({}); // what's typed in the boxes
  const [loadedFor, setLoadedFor] = useState(null);
  const [error, setError] = useState('');

  const periodId = `${periodType}:${periodKey}`;
  const loading = loadedFor !== periodId;
  const isCurrent = periodKey === periodKeyFor(periodType);

  // Load the prizes for whichever period is showing
  useEffect(() => {
    let cancelled = false;
    const id = `${periodType}:${periodKey}`;

    fetch(`${API}/api/prizes?periodType=${periodType}&periodKey=${periodKey}`)
      .then((res) => res.json())
      .then((list) => {
        if (!Array.isArray(list)) throw new Error('Unexpected response');
        if (cancelled) return;
        const map = {};
        list.forEach((p) => { map[p.tier] = p.title; });
        setSaved(map);
        setDrafts(map);
        setError('');
        setLoadedFor(id);
      })
      .catch((err) => {
        console.error('Failed to load prizes:', err);
        if (cancelled) return;
        setSaved({});
        setDrafts({});
        setError('Couldn’t load prizes for this period.');
        setLoadedFor(id);
      });

    return () => { cancelled = true; };
  }, [periodType, periodKey]);

  // Changing type and key together (one handler) avoids a render with a mismatched pair
  function handleTypeChange(type) {
    setPeriodType(type);
    setPeriodKey(periodKeyFor(type));
  }

  async function handleSave(tier) {
    setError('');
    try {
      const res = await fetch(`${API}/api/prizes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodType, periodKey, tier, title: drafts[tier] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSaved((s) => ({ ...s, [tier]: data.title }));
      setDrafts((d) => ({ ...d, [tier]: data.title })); // shows the trimmed version
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemove(tier) {
    setError('');
    try {
      const res = await fetch(
        `${API}/api/prizes?periodType=${periodType}&periodKey=${periodKey}&tier=${tier}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Remove failed');
      }
      setSaved((s) => { const next = { ...s }; delete next[tier]; return next; });
      setDrafts((d) => { const next = { ...d }; delete next[tier]; return next; });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Prizes</h1>
        <p className="subline">What each tier earns</p>
      </div>

      <div className="period-tabs" role="tablist">
        {PERIOD_TYPES.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={periodType === p.id}
            className={periodType === p.id ? 'active' : ''}
            onClick={() => handleTypeChange(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="period-nav">
        <button onClick={() => setPeriodKey(shiftPeriod(periodType, periodKey, -1))}>
          Previous
        </button>
        <span className="period-label">
          {formatPeriodLabel(periodType, periodKey)}
          {isCurrent && <span className="period-now"> · Current</span>}
        </span>
        <button onClick={() => setPeriodKey(shiftPeriod(periodType, periodKey, 1))}>
          Next
        </button>
      </div>

      <div className={loading ? 'prize-rows is-loading' : 'prize-rows'}>
        {TIERS.map((t) => {
          const draft = drafts[t.id] ?? '';
          const isSaved = saved[t.id] !== undefined;
          const changed = draft.trim() !== (saved[t.id] ?? '');
          return (
            <div className="prize-row" key={t.id}>
              <label className="prize-tier" htmlFor={`prize-${t.id}`}>{t.label}</label>
              <div className="prize-controls">
                <input
                  id={`prize-${t.id}`}
                  type="text"
                  maxLength={100}
                  value={draft}
                  disabled={loading}
                  placeholder="e.g. Watch two episodes"
                  onChange={(e) => setDrafts((d) => ({ ...d, [t.id]: e.target.value }))}
                />
                <button
                  disabled={loading || draft.trim() === '' || !changed}
                  onClick={() => handleSave(t.id)}
                >
                  Save
                </button>
                {isSaved && (
                  <button className="remove-btn" disabled={loading} onClick={() => handleRemove(t.id)}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="error-msg">{error}</p>}
    </div>
  );
}

export default Prizes;