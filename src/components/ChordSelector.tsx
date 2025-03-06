import React from 'react';

interface ChordSelectorProps {
    rootNotes: string[];
    chordModifiers: { value: string; label: string }[];
    selectedRoot: string;
    selectedModifier: string;
    setSelectedRoot: (root: string) => void;
    setSelectedModifier: (modifier: string) => void;
    addChord: () => void;
}

const ChordSelector: React.FC<ChordSelectorProps> = ({
    rootNotes,
    chordModifiers,
    selectedRoot,
    selectedModifier,
    setSelectedRoot,
    setSelectedModifier,
    addChord
}) => {
    // Styles
    const selectStyle = {
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid #444',
        background: '#1a1a1a',
        color: 'white',
        fontSize: '16px',
        cursor: 'pointer'
    };

    const addButtonStyle = {
        padding: '8px 16px',
        borderRadius: '4px',
        border: 'none',
        background: '#4CAF50',
        color: 'white',
        fontSize: '16px',
        cursor: 'pointer',
        fontWeight: 'bold' as 'bold'
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px',
            gap: '10px'
        }}>
            <select
                value={selectedRoot}
                onChange={(e) => setSelectedRoot(e.target.value)}
                style={selectStyle}
            >
                {rootNotes.map(note => (
                    <option key={note} value={note}>{note}</option>
                ))}
            </select>

            <select
                value={selectedModifier}
                onChange={(e) => setSelectedModifier(e.target.value)}
                style={selectStyle}
            >
                {chordModifiers.map(mod => (
                    <option key={mod.value} value={mod.value}>{mod.label}</option>
                ))}
            </select>

            <button onClick={addChord} style={addButtonStyle}>
                Add Chord
            </button>
        </div>
    );
};

export default ChordSelector; 