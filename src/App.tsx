import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import MinimalShiftTonnetz from './components/Tonnetz';
import ChordInput from './components/ChordInput';
import ChordList from './components/ChordList';
import ActiveChordDisplay from './components/ActiveChordDisplay';
import DisplaySettings from './components/DisplaySettings';
import { chordsToNotes } from './utils/chordParser';

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

  // Allways use color spectrum
  const useColorSpectrum = true;

  // Active notes color settings
  const [activeSpectrumSaturation, setActiveSpectrumSaturation] = useState(0.6); // 60%
  const [activeSpectrumBrightness, setActiveSpectrumBrightness] = useState(0.4); // 40%

  // Inactive notes color settings
  const [inactiveSpectrumSaturation, setInactiveSpectrumSaturation] = useState(0.2); // 20%
  const [inactiveSpectrumBrightness, setInactiveSpectrumBrightness] = useState(0.45); // 45%

  // Opacity for inactive notes
  const [inactiveOpacity, setInactiveOpacity] = useState(0.65);

  // Ref for storing timer ID
  const timerRef = useRef<number | null>(null);

  // Calculate current chord from selected values
  const currentChord = selectedRoot + selectedModifier;

  // Преобразуем активный аккорд в массив нот для отображения
  const activeNotes = useMemo(() => {
    if (!activeChord) return [];
    return chordsToNotes(activeChord);
  }, [activeChord]);

  // Функция для преобразования BPM в миллисекунды
  const bpmToMs = (bpm: number) => Math.round(60000 / bpm);

  // Function to add chord to the list
  const addChord = () => {
    if (currentChord && !savedChords.includes(currentChord)) {
      setSavedChords([...savedChords, currentChord]);
    }
  };

  // Function to remove chord from the list
  const removeChord = (index: number) => {
    const newChords = [...savedChords];
    newChords.splice(index, 1);
    setSavedChords(newChords);

    // If we're removing the active chord, clear it
    if (activeChord === savedChords[index]) {
      setActiveChord(null);
    }

    // If we're playing and remove a chord, we need to adjust
    if (isPlaying) {
      if (newChords.length < 2) {
        // Stop playback if we have less than 2 chords
        stopPlayback();
      } else if (playIndex >= newChords.length) {
        // Adjust playIndex if it's now out of bounds
        setPlayIndex(newChords.length - 1);
      }
    }
  };

  // Функция для остановки воспроизведения
  const stopPlayback = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setPlayIndex(0);
    setActiveChord(null);
  };

  // Функция для переключения воспроизведения
  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
    } else if (savedChords.length > 0) {
      setIsPlaying(true);
      setPlayIndex(0);
      setActiveChord(savedChords[0]);
    }
  };

  // Эффект для управления воспроизведением
  useEffect(() => {
    if (!isPlaying || savedChords.length === 0) {
      return;
    }

    const playNextChord = () => {
      const nextIndex = (playIndex + 1) % savedChords.length;
      setPlayIndex(nextIndex);
      setActiveChord(savedChords[nextIndex]);
    };

    const timerId = setTimeout(playNextChord, bpmToMs(bpm));
    timerRef.current = timerId;

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [isPlaying, playIndex, savedChords, bpm]);

  // Эффект для отслеживания изменений в savedChords
  useEffect(() => {
    if (isPlaying && savedChords.length === 0) {
      stopPlayback();
    }
  }, [savedChords.length, isPlaying]);

  // Эффект для очистки при размонтировании
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Новая функция для обработки списка аккордов из textarea
  const handleParseChords = (chords: string[]) => {
    setSavedChords(chords);
    setActiveChord(chords[0]);
    setPlayIndex(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '20px', gap: '20px' }}>
      <h1>Tonnetz Chord Visualizer</h1>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Заменяем ChordSelector на ChordInput */}
          <ChordInput
            onParseChords={handleParseChords}
            isPlaying={isPlaying}
            togglePlayback={togglePlayback}
            savedChords={savedChords}
          />

          {/* Chord List */}
          <ChordList
            savedChords={savedChords}
            activeChord={activeChord}
            setActiveChord={setActiveChord}
            removeChord={removeChord}
            isPlaying={isPlaying}
            stopPlayback={stopPlayback}
          />

          {/* Playback Tempo Control */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '15px',
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: '#1e1e1e',
            borderRadius: '5px'
          }}>
            <label style={{ minWidth: '180px' }}>Playback Tempo: {bpm} BPM</label>
            <input
              type="range"
              min="30"
              max="240"
              step="1"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value))}
              disabled={isPlaying}
              style={{ flex: 1 }}
            />
          </div>

          {/* Active Chord Display */}
          <ActiveChordDisplay activeChord={activeChord} />

          {/* Display Settings */}
          <DisplaySettings
            nodeSize={nodeSize}
            setNodeSize={setNodeSize}
            transitionDuration={transitionDuration}
            setTransitionDuration={setTransitionDuration}
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
            bpm={bpm}
            setBpm={setBpm}
            isPlaying={isPlaying}
            useColorSpectrum={useColorSpectrum}
            setUseColorSpectrum={() => true}
          />
        </div>

        <div style={{ width: '100%', height: '500px' }}>
          <MinimalShiftTonnetz
            highlightNotes={activeNotes}
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
    </div>
  );
}