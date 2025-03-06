import React, { useState, useEffect, useRef } from 'react';
import MinimalShiftTonnetz from './components/Tonnetz';

export default function App() {
  // Base notes
  const rootNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  // Chord modifiers with display names
  const chordModifiers = [
    { value: "", label: "Major" },
    { value: "m", label: "Minor" },
    { value: "7", label: "Dominant 7" },
    { value: "maj7", label: "Major 7" },
    { value: "m7", label: "Minor 7" },
    { value: "dim", label: "Diminished" },
    { value: "aug", label: "Augmented" },
    { value: "sus4", label: "Suspended 4" }
  ];

  // States for selected note and modifier
  const [selectedRoot, setSelectedRoot] = useState("C");
  const [selectedModifier, setSelectedModifier] = useState("");

  // List of saved chords (initially empty)
  const [savedChords, setSavedChords] = useState<string[]>([]);

  // Active chord for display (initially null)
  const [activeChord, setActiveChord] = useState<string | null>(null);

  // Node size
  const [nodeSize, setNodeSize] = useState(0.5);

  // Transition time
  const [transitionDuration, setTransitionDuration] = useState(300);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);

  // Time to display each chord (in milliseconds)
  const [chordDuration, setChordDuration] = useState(1000);

  // Index of current chord during playback
  const [playIndex, setPlayIndex] = useState(0);

  // Ref for storing timer ID
  const timerRef = useRef<number | null>(null);

  // Calculate current chord from selected values
  const currentChord = selectedRoot + selectedModifier;

  // Function to add chord to the list
  const addChord = () => {
    if (!savedChords.includes(currentChord)) {
      setSavedChords([...savedChords, currentChord]);
    }
    setActiveChord(currentChord);
  };

  // Function to remove chord from the list
  const removeChord = (chord: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent chord activation when removing

    const newChords = savedChords.filter(c => c !== chord);
    setSavedChords(newChords);

    // If removing active chord, reset active chord
    if (activeChord === chord) {
      setActiveChord(null);
    }

    // If playback is active, stop it
    if (isPlaying && newChords.length < 2) {
      stopPlayback();
    }
  };

  // Function to start playback
  const startPlayback = () => {
    if (savedChords.length < 2) return; // Need at least 2 chords for playback

    setIsPlaying(true);
    // Start with the first chord
    setPlayIndex(0);
    setActiveChord(savedChords[0]);
  };

  // Function to stop playback
  const stopPlayback = () => {
    setIsPlaying(false);
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Function to toggle playback
  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  // Effect for managing playback
  useEffect(() => {
    if (isPlaying && savedChords.length > 0) {
      // Clear previous timer
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }

      // Set timer for next chord
      timerRef.current = window.setTimeout(() => {
        // Calculate next index
        const nextIndex = (playIndex + 1) % savedChords.length;
        setPlayIndex(nextIndex);
        setActiveChord(savedChords[nextIndex]);
      }, chordDuration);
    }

    // Cleanup on unmount
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, playIndex, savedChords, chordDuration]);

  // Styles for selects
  const selectStyle = {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #444',
    background: '#1a1a1a',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    marginRight: '10px'
  };

  // Styles for add button
  const addButtonStyle = {
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    background: '#646cff',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold' as const
  };

  // Styles for chord buttons
  const chordButtonStyle = (isActive: boolean) => ({
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    background: isActive ? '#646cff' : '#1a1a1a',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    margin: '0 8px 8px 0',
    position: 'relative' as const
  });

  // Styles for remove button
  const removeButtonStyle = {
    position: 'absolute' as const,
    top: '-8px',
    right: '-8px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#ff4d4f',
    color: 'white',
    border: 'none',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0
  };

  // Styles for play button
  const playButtonStyle = {
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    background: isPlaying ? '#ff4d4f' : '#52c41a',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginLeft: '16px'
  };

  return (
    <div style={{ width: '800px', margin: '0 auto' }}>
      <h1>Tonnetz Chord Visualizer</h1>

      <div style={{ marginBottom: '30px' }}>
        {/* Row with selectors and add button */}
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
            {chordModifiers.map(modifier => (
              <option key={modifier.value} value={modifier.value}>
                {modifier.label}
              </option>
            ))}
          </select>

          <button
            onClick={addChord}
            style={addButtonStyle}
          >
            Add Chord
          </button>
        </div>

        {/* List of saved chords and play button */}
        <div style={{
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            flex: 1
          }}>
            {savedChords.length === 0 ? (
              <div style={{ color: '#888', fontStyle: 'italic' }}>
                Add chords to display
              </div>
            ) : (
              savedChords.map(chord => (
                <div key={chord} style={{ position: 'relative' }}>
                  <button
                    onClick={() => {
                      setActiveChord(chord);
                      if (isPlaying) stopPlayback();
                    }}
                    style={chordButtonStyle(activeChord === chord)}
                  >
                    {chord}
                  </button>
                  <button
                    onClick={(e) => removeChord(chord, e)}
                    style={removeButtonStyle}
                    title="Remove chord"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          {savedChords.length >= 2 && (
            <button
              onClick={togglePlayback}
              style={playButtonStyle}
              title={isPlaying ? "Stop" : "Play"}
            >
              {isPlaying ? (
                <>
                  <span style={{ fontSize: '18px' }}>⏹</span> Stop
                </>
              ) : (
                <>
                  <span style={{ fontSize: '18px' }}>▶</span> Play
                </>
              )}
            </button>
          )}
        </div>

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

        {/* Display settings */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          marginTop: '30px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ minWidth: '180px' }}>Node Size: {(nodeSize * 100).toFixed(0)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={nodeSize}
              onChange={(e) => setNodeSize(parseFloat(e.target.value))}
              style={{ flex: 1 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ minWidth: '180px' }}>Transition Speed: {transitionDuration}ms</label>
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={transitionDuration}
              onChange={(e) => setTransitionDuration(parseInt(e.target.value))}
              style={{ flex: 1 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ minWidth: '180px' }}>Chord Duration: {(chordDuration / 1000).toFixed(1)}s</label>
            <input
              type="range"
              min="200"
              max="5000"
              step="100"
              value={chordDuration}
              onChange={(e) => setChordDuration(parseInt(e.target.value))}
              style={{ flex: 1 }}
              disabled={isPlaying} // Disable changes during playback
            />
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: '500px' }}>
        <MinimalShiftTonnetz
          highlightChords={activeChord ? [activeChord] : []}
          rows={9}
          cols={11}
          nodeSize={nodeSize}
          transitionDuration={transitionDuration}
        />
      </div>
    </div>
  );
}