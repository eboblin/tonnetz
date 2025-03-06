import React, { useState, useEffect, useRef } from 'react';
import MinimalShiftTonnetz from './components/Tonnetz';
import ChordSelector from './components/ChordSelector';
import ChordList from './components/ChordList';
import ActiveChordDisplay from './components/ActiveChordDisplay';
import DisplaySettings from './components/DisplaySettings';

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

  // Color spectrum settings
  const [useColorSpectrum, setUseColorSpectrum] = useState(false);
  const [spectrumSaturation, setSpectrumSaturation] = useState(0.8);
  const [spectrumBrightness, setSpectrumBrightness] = useState(0.6);

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

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      color: 'white',
      background: '#121212'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        Interactive Tonnetz Explorer
      </h1>

      <div style={{ marginBottom: '30px' }}>
        {/* Chord Selection */}
        <ChordSelector
          rootNotes={rootNotes}
          chordModifiers={chordModifiers}
          selectedRoot={selectedRoot}
          selectedModifier={selectedModifier}
          setSelectedRoot={setSelectedRoot}
          setSelectedModifier={setSelectedModifier}
          addChord={addChord}
        />

        {/* Chord List */}
        <ChordList
          savedChords={savedChords}
          activeChord={activeChord}
          setActiveChord={setActiveChord}
          removeChord={removeChord}
          isPlaying={isPlaying}
          togglePlayback={togglePlayback}
          stopPlayback={stopPlayback}
        />

        {/* Active Chord Display */}
        <ActiveChordDisplay activeChord={activeChord} />

        {/* Display Settings */}
        <DisplaySettings
          nodeSize={nodeSize}
          setNodeSize={setNodeSize}
          transitionDuration={transitionDuration}
          setTransitionDuration={setTransitionDuration}
          chordDuration={chordDuration}
          setChordDuration={setChordDuration}
          isPlaying={isPlaying}
          useColorSpectrum={useColorSpectrum}
          setUseColorSpectrum={setUseColorSpectrum}
          spectrumSaturation={spectrumSaturation}
          setSpectrumSaturation={setSpectrumSaturation}
          spectrumBrightness={spectrumBrightness}
          setSpectrumBrightness={setSpectrumBrightness}
        />
      </div>

      <div style={{ width: '100%', height: '500px' }}>
        <MinimalShiftTonnetz
          highlightChords={activeChord ? [activeChord] : []}
          rows={9}
          cols={11}
          nodeSize={nodeSize}
          transitionDuration={transitionDuration}
          useColorSpectrum={useColorSpectrum}
          spectrumSaturation={spectrumSaturation}
          spectrumBrightness={spectrumBrightness}
        />
      </div>
    </div>
  );
}