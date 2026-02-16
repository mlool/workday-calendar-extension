import React from 'react';
import './CalendarControls.css';

interface IProps {
    worklist: number;
    term: number;
    currentSession: string;
    availableSessions: string[];
    setCurrentSession: (session: string) => void;
    setWorklist: (worklist: number) => void;
    setTerm: (term: number) => void;
}

const WORKLISTS = [0, 1, 2, 3];
const TERMS = [1, 2];

const CalendarControls: React.FC<IProps> = ({ worklist, term, currentSession, availableSessions, setCurrentSession, setWorklist, setTerm }) => {
    return (
        <div className="calendar-controls">
            <div className="control-row">
                <span className="control-label">Worklist:</span>
                <div className="button-group">
                    {WORKLISTS.map((wl) => (
                        <button
                            key={wl}
                            className={`control-button ${worklist === wl ? "active" : ""}`}
                            onClick={() => setWorklist(wl)}
                        >
                            {wl}
                        </button>
                    ))}
                </div>
            </div>

            <div className="control-row split">
                <div className="control-group">
                    <span className="control-label">Session:</span>
                    <div className="button-group">
                        <select
                            className="session-select"
                            value={currentSession}
                            onChange={(e) => setCurrentSession(e.target.value)}
                        >
                            {availableSessions.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="button-group">
                    <span className="control-label" style={{ minWidth: "auto" }}>Term:</span>
                    {TERMS.map((t) => (
                        <button
                            key={t}
                            className={`control-button ${term === t ? "active" : ""}`}
                            onClick={() => setTerm(t)}
                        >
                            T{t}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
};

export default CalendarControls;
