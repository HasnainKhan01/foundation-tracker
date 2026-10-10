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

  return (
    <div>
      <button onClick={prevWeek}>Previous</button>
      <span> {formatDate(weekStart)} – {days[6]} </span>
      <button onClick={nextWeek}>Next</button>

      <div className="grid">
        <div className="grid-row">
          <span className="grid-label">Gym</span>
          {days.map((date) => (
            <div key={date} className={`cell ${getValue(date, 'gym')}`} />
          ))}
        </div>

        <div className="grid-row">
          <span className="grid-label">Job Apps</span>
          {days.map((date) => (
            <div key={date} className={`cell ${getValue(date, 'jobApplications')}`} />
          ))}
        </div>

        <div className="grid-row">
          <span className="grid-label">Skincare</span>
          {days.map((date) => (
            <div key={date} className={`cell ${getValue(date, 'skincare')}`} />
          ))}
        </div>

        <div className="grid-row">
          <span className="grid-label">Anchor</span>
          {days.map((date) => (
            <span key={date}>{getValue(date, 'nightlyAnchor') ? '✓' : '✗'}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Snapshot;