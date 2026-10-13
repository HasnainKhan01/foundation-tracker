import { useState, useEffect } from 'react';
import './Log.css';

const today = new Date().toISOString().split('T')[0];

function Log() {
    const [gym, setGym] = useState('none');
    const [jobApplications, setJobApplications] = useState('none');
    const [skincare, setSkincare] = useState('none');
    const [nightlyAnchor, setNightlyAnchor] = useState(false);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/entries/${today}`)
            .then((res) => res.json())
            .then((data) => {
                if (data) {
                    setGym(data.gym);
                    setJobApplications(data.jobApplications);
                    setSkincare(data.skincare);
                    setNightlyAnchor(data.nightlyAnchor);
            }
        })
        .catch((err) => console.error('Failed to load entry:', err));
    }, []);

    function updateField(field, value, setter) {
        setter(value);
        fetch(`${import.meta.env.VITE_API_URL}/api/entries/${today}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field, value }),
        }).catch((err) => console.error('Failed to update:', err));
    }

    return (
        <div>
            <div className="page-header">
            <h1>Log</h1>
            <p className="subline">{today}</p>
            </div>

            <div className="field-row">
            <span className="label">Gym</span>
            <div className="button-pair">
                <button
                className={gym === 'floor' ? 'active-floor' : ''}
                onClick={() => updateField('gym', gym === 'floor' ? 'none' : 'floor', setGym)}
                >
                Floor
                </button>
                <button
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
                className={jobApplications === 'floor' ? 'active-floor' : ''}
                onClick={() => updateField('jobApplications', jobApplications === 'floor' ? 'none' : 'floor', setJobApplications)}
                >
                Floor
                </button>
                <button
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
                className={skincare === 'floor' ? 'active-floor' : ''}
                onClick={() => updateField('skincare', skincare === 'floor' ? 'none' : 'floor', setSkincare)}
                >
                Floor
                </button>
                <button
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
                className={nightlyAnchor ? 'active-ceiling full-width' : 'full-width'}
                onClick={() => updateField('nightlyAnchor', !nightlyAnchor, setNightlyAnchor)}
            >
                {nightlyAnchor ? 'Done' : 'Mark Done'}
            </button>
            </div>
        </div>
    );
}

export default Log;