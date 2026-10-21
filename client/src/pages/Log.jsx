import { useState, useEffect } from 'react';
import { toDateString, addDays, formatLongDate } from '../utils/date';
import './Log.css';

function Log() {
    // Computed on render (not at module load) so it stays correct if the tab sits open past midnight
    const today = toDateString();
    const [date, setDate] = useState(today);
    // The date whose entry has finished loading; we're "loading" whenever it lags behind the picked date
    const [loadedDate, setLoadedDate] = useState(null);
    const loading = loadedDate !== date;
    const [gym, setGym] = useState('none');
    const [jobApplications, setJobApplications] = useState('none');
    const [skincare, setSkincare] = useState('none');
    const [nightlyAnchor, setNightlyAnchor] = useState(false);

    useEffect(() => {
        let cancelled = false;

        fetch(`${import.meta.env.VITE_API_URL}/api/entries/${date}`)
            .then((res) => res.json())
            .then((data) => {
                if (cancelled) return; // a newer date was picked while this was in flight
                // No entry yet for this day -> show a blank slate, not the previous day's values
                setGym(data?.gym ?? 'none');
                setJobApplications(data?.jobApplications ?? 'none');
                setSkincare(data?.skincare ?? 'none');
                setNightlyAnchor(data?.nightlyAnchor ?? false);
                setLoadedDate(date);
            })
            .catch((err) => {
                console.error('Failed to load entry:', err);
                if (!cancelled) setLoadedDate(date);
            });

        return () => {
            cancelled = true;
        };
    }, [date]);

    function updateField(field, value, setter) {
        setter(value);
        fetch(`${import.meta.env.VITE_API_URL}/api/entries/${date}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field, value }),
        }).catch((err) => console.error('Failed to update:', err));
    }

    function handleDatePick(e) {
        const picked = e.target.value;
        // The picker clears to '' if you wipe it; ignore that and any future date
        if (picked && picked <= today) setDate(picked);
    }

    return (
        <div>
            <div className="page-header">
            <h1>Log</h1>
            <p className="subline">
                {formatLongDate(date)}
                {date === today && ' · Today'}
            </p>
            </div>

            <div className="date-nav">
                <button onClick={() => setDate(addDays(date, -1))} aria-label="Previous day">
                    Previous
                </button>
                <input
                    type="date"
                    className="date-input"
                    value={date}
                    max={today}
                    onChange={handleDatePick}
                    aria-label="Pick a date to log"
                />
                <button
                    onClick={() => setDate(addDays(date, 1))}
                    disabled={date >= today}
                    aria-label="Next day"
                >
                    Next
                </button>
                {date !== today && (
                    <button className="today-btn" onClick={() => setDate(today)}>
                        Today
                    </button>
                )}
            </div>

            <div className={loading ? 'fields is-loading' : 'fields'}>

            <div className="field-row">
            <span className="label">Gym</span>
            <div className="button-pair">
                <button
                disabled={loading}
                className={gym === 'floor' ? 'active-floor' : ''}
                onClick={() => updateField('gym', gym === 'floor' ? 'none' : 'floor', setGym)}
                >
                Floor
                </button>
                <button
                disabled={loading}
                className={gym === 'ceiling' ? 'active-ceiling' : ''}
                onClick={() => updateField('gym', gym === 'ceiling' ? 'none' : 'ceiling', setGym)}
                >
                Ceiling
                </button>
            </div>
            </div>

            <div className="field-row">
            <span className="label">Job Applications</span>
            <div className="button-pair">
                <button
                disabled={loading}
                className={jobApplications === 'floor' ? 'active-floor' : ''}
                onClick={() => updateField('jobApplications', jobApplications === 'floor' ? 'none' : 'floor', setJobApplications)}
                >
                Floor
                </button>
                <button
                disabled={loading}
                className={jobApplications === 'ceiling' ? 'active-ceiling' : ''}
                onClick={() => updateField('jobApplications', jobApplications === 'ceiling' ? 'none' : 'ceiling', setJobApplications)}
                >
                Ceiling
                </button>
            </div>
            </div>

            <div className="field-row">
            <span className="label">Skincare</span>
            <div className="button-pair">
                <button
                disabled={loading}
                className={skincare === 'floor' ? 'active-floor' : ''}
                onClick={() => updateField('skincare', skincare === 'floor' ? 'none' : 'floor', setSkincare)}
                >
                Floor
                </button>
                <button
                disabled={loading}
                className={skincare === 'ceiling' ? 'active-ceiling' : ''}
                onClick={() => updateField('skincare', skincare === 'ceiling' ? 'none' : 'ceiling', setSkincare)}
                >
                Ceiling
                </button>
            </div>
            </div>

            <div className="field-row last-row">
            <span className="label">Nightly Anchor</span>
            <button
                disabled={loading}
                className={nightlyAnchor ? 'active-ceiling full-width' : 'full-width'}
                onClick={() => updateField('nightlyAnchor', !nightlyAnchor, setNightlyAnchor)}
            >
                {nightlyAnchor ? 'Done' : 'Mark Done'}
            </button>
            </div>

            </div>
        </div>
    );
}

export default Log;