import React from 'react';

interface ActiveChordDisplayProps {
    activeChord: string | null;
}

const ActiveChordDisplay: React.FC<ActiveChordDisplayProps> = ({ activeChord }) => {
    return (
        <div style={{
            marginTop: '20px',
            padding: '16px',
            background: '#2a2a2a',
            borderRadius: '4px',
            textAlign: 'center'
        }}>
            <h2 style={{ margin: 0 }}>
                {activeChord
                    ? `Active Chord: ${activeChord}`
                    : 'No Chord Selected'}
            </h2>
        </div>
    );
};

export default ActiveChordDisplay; 