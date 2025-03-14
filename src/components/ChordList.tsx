import React from 'react';

interface ParsedChord {
    chord: string;
    duration: number;
}

interface ChordListProps {
    savedChords: ParsedChord[];
    activeChord: string | null;
    setActiveChord: (chord: string | null) => void;
    removeChord: (index: number) => void;
    isPlaying: boolean;
    stopPlayback: () => void;
}

const ChordList: React.FC<ChordListProps> = ({
    savedChords,
    activeChord,
    setActiveChord,
    removeChord,
    isPlaying,
    stopPlayback
}) => {
    // Styles
    const chordButtonStyle = (isActive: boolean) => ({
        padding: '8px 16px',
        margin: '0 8px 8px 0',
        borderRadius: '4px',
        border: 'none',
        background: isActive ? '#2196F3' : '#333',
        color: 'white',
        fontSize: '16px',
        cursor: 'pointer',
        position: 'relative' as 'relative'
    });

    const removeButtonStyle = {
        position: 'absolute' as 'absolute',
        top: '-8px',
        right: '-8px',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        border: 'none',
        background: '#f44336',
        color: 'white',
        fontSize: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0
    };

    const playButtonStyle = {
        padding: '8px 16px',
        borderRadius: '4px',
        border: 'none',
        background: isPlaying ? '#f44336' : '#4CAF50',
        color: 'white',
        fontSize: '16px',
        cursor: 'pointer',
        marginLeft: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
    };

    return (
        <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                {savedChords.length === 0 ? (
                    <div style={{ color: '#888', fontStyle: 'italic' }}>
                        Add chords to display
                    </div>
                ) : (
                    savedChords.map(({ chord, duration }) => (
                        <div key={chord} style={{ position: 'relative', marginRight: '8px', marginBottom: '8px' }}>
                            <button
                                onClick={() => {
                                    setActiveChord(chord);
                                    if (isPlaying) stopPlayback();
                                }}
                                style={chordButtonStyle(activeChord === chord)}
                            >
                                {chord}
                                <span style={{ fontSize: '0.8em', opacity: 0.7 }}>
                                    {duration === 1 ? '' : ` (${duration})`}
                                </span>
                            </button>
                            <button
                                onClick={() => removeChord(savedChords.indexOf({ chord, duration }))}
                                style={removeButtonStyle}
                                title="Remove chord"
                            >
                                ×
                            </button>
                        </div>
                    ))
                )}

            </div>
        </div>
    );
};

export default ChordList; 