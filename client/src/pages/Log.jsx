import { useState, useEffect } from 'react';

const today = new Date().toISOString().split('T')[0];

function Log() {
    const [gym, setGym] = useState('none');
    const [jobApplications, setJobApplications] = useState('none');
    const [skincare, setSkincare] = useState('none');
    const [nightlyAnchor, setNightlyAnchor] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:5000/api/entries/${today}`)
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
        fetch(`http://localhost:5000/api/entries/${today}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field, value }),
        }).catch((err) => console.error('Failed to update:', err));
    }

    return (
        <div>
            <h1>{today}</h1>

            <div>
            <span>Gym</span>
            <button onClick={() => updateField('gym', 'floor', setGym)}>Floor</button>
            <button onClick={() => updateField('gym', 'ceiling', setGym)}>Ceiling</button>
            <button onClick={() => updateField('gym', 'none', setGym)}>Clear</button>
            <span>{gym}</span>
            </div>

            <div>
            <span>Job Applications</span>
            <button onClick={() => updateField('jobApplications', 'floor', setJobApplications)}>Floor</button>
            <button onClick={() => updateField('jobApplications', 'ceiling', setJobApplications)}>Ceiling</button>
            <button onClick={() => updateField('jobApplications', 'none', setJobApplications)}>Clear</button>
            <span>{jobApplications}</span>
            </div>

            <div>
            <span>Skincare</span>
            <button onClick={() => updateField('skincare', 'floor', setSkincare)}>Floor</button>
            <button onClick={() => updateField('skincare', 'ceiling', setSkincare)}>Ceiling</button>
            <button onClick={() => updateField('skincare', 'none', setSkincare)}>Clear</button>
            <span>{skincare}</span>
            </div>

            <div>
            <span>Nightly Anchor</span>
            <button onClick={() => updateField('nightlyAnchor', !nightlyAnchor, setNightlyAnchor)}>
                {nightlyAnchor ? 'Done' : 'Mark Done'}
            </button>
            </div>
        </div>
    );
}

export default Log;