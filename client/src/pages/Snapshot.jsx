import { useState, useEffect } from 'react';
import './Snapshot.css';

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function Snapshot() {
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [entries, setEntries] = useState({});

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    days.push(formatDate(d));
  }

  useEffect(() => {
    const start = formatDate(weekStart);
    const end = days[6];
    fetch(`${import.meta.env.VITE_API_URL}/api/entries?start=${start}&end=${end}`)
      .then((res) => res.json())
      .then((data) => {
        const entriesMap = {};
        data.forEach((entry) => {
          entriesMap[entry.date] = entry;
        });
        setEntries(entriesMap);
      })
      .catch((err) => console.error('Failed to load entries:', err));
  }, [weekStart]);

  function prevWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  }

  function nextWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  }

  function getValue(date, field) {
    const entry = entries[date];
    if (!entry) return field === 'nightlyAnchor' ? false : 'none';
    return entry[field];
  }

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
      <div>
        <div className="page-header">
          <h1>Snapshot</h1>
          <p className="subline">Your week at a glance</p>
        </div>

        <div className="week-nav">
          <button onClick={prevWeek}>Previous</button>
          <span className="week-label">{formatDate(weekStart)} – {days[6]}</span>
          <button onClick={nextWeek}>Next</button>
        </div>

        <div className="snap-grid">
          <span></span>
          {dayLabels.map((d) => <span key={d} className="day-header">{d}</span>)}

          <span className="label">Gym</span>
          {days.map((date) => (
            <div key={date} className={`cell ${getValue(date, 'gym')}`} />
          ))}

          <span className="label">Job Apps</span>
          {days.map((date) => (
            <div key={date} className={`cell ${getValue(date, 'jobApplications')}`} />
          ))}

          <span className="label">Skincare</span>
          {days.map((date) => (
            <div key={date} className={`cell ${getValue(date, 'skincare')}`} />
          ))}

          <span className="label anchor-row">Nightly Anchor</span>
          {days.map((date) => (
            <span key={date} className="anchor-row anchor-mark">
              {getValue(date, 'nightlyAnchor') ? '✓' : '✗'}
            </span>
          ))}
        </div>

        <div className="legend">
          <span><span className="legend-swatch" style={{ background: 'var(--ceiling)' }}></span>Ceiling</span>
          <span><span className="legend-swatch" style={{ background: 'var(--floor)' }}></span>Floor</span>
          <span><span className="legend-swatch" style={{ border: '1px solid var(--border)' }}></span>None</span>
        </div>
      </div>
  );
}

export default Snapshot;