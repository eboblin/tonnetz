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

  // BPM
  const [bpm, setBpm] = useState(60); // 60 ударов в минуту по умолчанию

  // Index of current chord during playback
  const [playIndex, setPlayIndex] = useState(0);

  // Color spectrum settings
  const [useColorSpectrum, setUseColorSpectrum] = useState(true);
  const [spectrumSaturation, setSpectrumSaturation] = useState(0.8);
  const [spectrumBrightness, setSpectrumBrightness] = useState(0.6);

  // Active notes color settings
  const [activeSpectrumSaturation, setActiveSpectrumSaturation] = useState(0.6);
  const [activeSpectrumBrightness, setActiveSpectrumBrightness] = useState(0.4);

  // Inactive notes color settings
  const [inactiveSpectrumSaturation, setInactiveSpectrumSaturation] = useState(0.2);
  const [inactiveSpectrumBrightness, setInactiveSpectrumBrightness] = useState(0.8);

  // Opacity for inactive notes
  const [inactiveOpacity, setInactiveOpacity] = useState(0.65);

  // Ref for storing timer ID
  const timerRef = useRef<number | null>(null);

  // Calculate current chord from selected values
  const currentChord = selectedRoot + selectedModifier;

  // Функция для преобразования BPM в миллисекунды
  const bpmToMs = (bpm: number) => Math.round(60000 / bpm);

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

  // Обновляем функцию playChords, чтобы использовать BPM
  const playChords = () => {
    if (savedChords.length < 2) return;

    const nextIndex = (playIndex + 1) % savedChords.length;
    setActiveChord(savedChords[nextIndex]);
    setPlayIndex(nextIndex);

    // Используем bpmToMs для расчета времени задержки
    timerRef.current = window.setTimeout(playChords, bpmToMs(bpm));
  };

  // Обновляем togglePlayback, чтобы использовать BPM
  const togglePlayback = () => {
    if (isPlaying) {
      // Остановка воспроизведения
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setIsPlaying(false);
    } else {
      // Начало воспроизведения
      setIsPlaying(true);
      setPlayIndex(0);
      setActiveChord(savedChords[0]);

      // Используем bpmToMs для расчета времени задержки
      timerRef.current = window.setTimeout(playChords, bpmToMs(bpm));
    }
  };

  // Function to stop playback
  const stopPlayback = () => {
    setIsPlaying(false);
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
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
      }, bpmToMs(bpm));
    }

    // Cleanup on unmount
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, playIndex, savedChords, bpm]);

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
          bpm={bpm}
          setBpm={setBpm}
          isPlaying={isPlaying}
          useColorSpectrum={useColorSpectrum}
          setUseColorSpectrum={setUseColorSpectrum}
          activeSpectrumSaturation={activeSpectrumSaturation}
          setActiveSpectrumSaturation={setActiveSpectrumSaturation}
          activeSpectrumBrightness={activeSpectrumBrightness}
          setActiveSpectrumBrightness={setActiveSpectrumBrightness}
          inactiveSpectrumSaturation={inactiveSpectrumSaturation}
          setInactiveSpectrumSaturation={setInactiveSpectrumSaturation}
          inactiveSpectrumBrightness={inactiveSpectrumBrightness}
          setInactiveSpectrumBrightness={setInactiveSpectrumBrightness}
          inactiveOpacity={inactiveOpacity}
          setInactiveOpacity={setInactiveOpacity}
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
          activeSpectrumSaturation={activeSpectrumSaturation}
          activeSpectrumBrightness={activeSpectrumBrightness}
          inactiveSpectrumSaturation={inactiveSpectrumSaturation}
          inactiveSpectrumBrightness={inactiveSpectrumBrightness}
          inactiveOpacity={inactiveOpacity}
        />
      </div>
    </div>
  );
}