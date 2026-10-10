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
            <h1>{today}</h1>

            <div className="row">
            <span className="label">Gym</span>
            <button
                className={gym === 'floor' ? 'active-floor' : ''}
                onClick={() => updateField('gym', 'floor', setGym)}
            >
                Floor
            </button>
            <button
                className={gym === 'ceiling' ? 'active-ceiling' : ''}
                onClick={() => updateField('gym', 'ceiling', setGym)}
            >
                Ceiling
            </button>
            <button onClick={() => updateField('gym', 'none', setGym)}>Clear</button>
            </div>

            <div className="row">
            <span className="label">Job Applications</span>
            <button
                className={jobApplications === 'floor' ? 'active-floor' : ''}
                onClick={() => updateField('jobApplications', 'floor', setJobApplications)}
            >
                Floor
            </button>
            <button
                className={jobApplications === 'ceiling' ? 'active-ceiling' : ''}
                onClick={() => updateField('jobApplications', 'ceiling', setJobApplications)}
            >
                Ceiling
            </button>
            <button onClick={() => updateField('jobApplications', 'none', setJobApplications)}>Clear</button>
            </div>

            <div className="row">
            <span className="label">Skincare</span>
            <button
                className={skincare === 'floor' ? 'active-floor' : ''}
                onClick={() => updateField('skincare', 'floor', setSkincare)}
            >
                Floor
            </button>
            <button
                className={skincare === 'ceiling' ? 'active-ceiling' : ''}
                onClick={() => updateField('skincare', 'ceiling', setSkincare)}
            >
                Ceiling
            </button>
            <button onClick={() => updateField('skincare', 'none', setSkincare)}>Clear</button>
            </div>

            <div className="row">
            <span className="label">Nightly Anchor</span>
            <button
                className={nightlyAnchor ? 'active-ceiling' : ''}
                onClick={() => updateField('nightlyAnchor', !nightlyAnchor, setNightlyAnchor)}
            >
                {nightlyAnchor ? 'Done' : 'Mark Done'}
            </button>
            </div>
        </div>
    );
}

export default Log;