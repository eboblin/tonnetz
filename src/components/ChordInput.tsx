import React, { useState } from 'react';

interface ChordInputProps {
    onParseChords: (chords: string[]) => void;
    isPlaying: boolean;
    togglePlayback: () => void;
    savedChords: string[];
}

const ChordInput: React.FC<ChordInputProps> = ({
    onParseChords,
    isPlaying,
    togglePlayback,
    savedChords
}) => {
    const [inputText, setInputText] = useState('');

    const handlePlayClick = () => {
        if (isPlaying) {
            togglePlayback();
            return;
        }

        // Если есть текст в поле ввода, парсим его
        if (inputText.trim()) {
            const chords = inputText
                .trim()
                .split(/\s+/)
                .filter(chord => chord.length > 0);

            if (chords.length > 0) {
                onParseChords(chords);
                togglePlayback();
            }
        }
        // Если нет текста, но есть сохраненные аккорды, просто запускаем воспроизведение
        else if (savedChords.length > 0) {
            togglePlayback();
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter chord progression (e.g. Am F C G)"
                style={{
                    width: '100%',
                    height: '100px',
                    padding: '10px',
                    borderRadius: '4px',
                    backgroundColor: '#2a2a2a',
                    color: 'white',
                    border: '1px solid #444',
                    resize: 'vertical',
                    fontFamily: 'monospace',
                    fontSize: '16px'
                }}
            />
            <button
                onClick={handlePlayClick}
                disabled={(inputText.trim() === '' && savedChords.length === 0) ||
                    (inputText.trim() !== '' && inputText.trim().split(/\s+/).length === 0)}
                style={{
                    padding: '10px 20px',
                    borderRadius: '4px',
                    border: 'none',
                    background: isPlaying ? '#f44336' : '#4CAF50',
                    color: 'white',
                    fontSize: '16px',
                    cursor: 'pointer',
                    opacity: (inputText.trim() === '' && savedChords.length === 0) ||
                        (inputText.trim() !== '' && inputText.trim().split(/\s+/).length === 0) ? 0.6 : 1
                }}
            >
                {isPlaying ? 'Stop' : 'Play Progression'}
            </button>
        </div>
    );
};

export default ChordInput; 