import React, { useState, useEffect, useRef } from 'react';
import MinimalShiftTonnetz from './components/Tonnetz';

export default function App() {
  // Базовые ноты
  const rootNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  // Модификаторы аккордов с отображаемыми названиями
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

  // Состояния для выбранной ноты и модификатора
  const [selectedRoot, setSelectedRoot] = useState("C");
  const [selectedModifier, setSelectedModifier] = useState("");

  // Список сохраненных аккордов (изначально пустой)
  const [savedChords, setSavedChords] = useState<string[]>([]);

  // Активный аккорд для отображения (изначально null)
  const [activeChord, setActiveChord] = useState<string | null>(null);

  // Размер узлов
  const [nodeSize, setNodeSize] = useState(0.5);

  // Время перехода
  const [transitionDuration, setTransitionDuration] = useState(300);

  // Состояние воспроизведения
  const [isPlaying, setIsPlaying] = useState(false);

  // Время показа каждого аккорда (в миллисекундах)
  const [chordDuration, setChordDuration] = useState(1000);

  // Индекс текущего аккорда при воспроизведении
  const [playIndex, setPlayIndex] = useState(0);

  // Ref для хранения идентификатора таймера
  const timerRef = useRef<number | null>(null);

  // Вычисляем текущий аккорд из выбранных значений
  const currentChord = selectedRoot + selectedModifier;

  // Функция добавления аккорда в список
  const addChord = () => {
    if (!savedChords.includes(currentChord)) {
      setSavedChords([...savedChords, currentChord]);
    }
    setActiveChord(currentChord);
  };

  // Функция удаления аккорда из списка
  const removeChord = (chord: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Предотвращаем активацию аккорда при удалении

    const newChords = savedChords.filter(c => c !== chord);
    setSavedChords(newChords);

    // Если удаляем активный аккорд, сбрасываем активный аккорд
    if (activeChord === chord) {
      setActiveChord(null);
    }

    // Если воспроизведение активно, останавливаем его
    if (isPlaying && newChords.length < 2) {
      stopPlayback();
    }
  };

  // Функция запуска воспроизведения
  const startPlayback = () => {
    if (savedChords.length < 2) return; // Нужно минимум 2 аккорда для воспроизведения

    setIsPlaying(true);
    // Начинаем с первого аккорда
    setPlayIndex(0);
    setActiveChord(savedChords[0]);
  };

  // Функция остановки воспроизведения
  const stopPlayback = () => {
    setIsPlaying(false);
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Функция переключения воспроизведения
  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  // Эффект для управления воспроизведением
  useEffect(() => {
    if (isPlaying && savedChords.length > 0) {
      // Очищаем предыдущий таймер
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }

      // Устанавливаем таймер для следующего аккорда
      timerRef.current = window.setTimeout(() => {
        // Вычисляем следующий индекс
        const nextIndex = (playIndex + 1) % savedChords.length;
        setPlayIndex(nextIndex);
        setActiveChord(savedChords[nextIndex]);
      }, chordDuration);
    }

    // Очистка при размонтировании
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, playIndex, savedChords, chordDuration]);

  // Стили для селектов
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

  // Стили для кнопки добавления
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

  // Стили для кнопок аккордов
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

  // Стили для кнопки удаления
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

  // Стили для кнопки воспроизведения
  const playButtonStyle = {
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    background: isPlaying ? '#ff4d4f' : '#4caf50',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    marginLeft: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  return (
    <div style={{ width: '800px', margin: '0 auto' }}>
      <h1>Tonnetz Chord Visualizer</h1>

      <div style={{ marginBottom: '30px' }}>
        {/* Строка с выбиралками и кнопкой добавления */}
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
            Добавить аккорд
          </button>
        </div>

        {/* Список сохраненных аккордов и кнопка воспроизведения */}
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
                Добавьте аккорды для отображения
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
                    title="Удалить аккорд"
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
              title={isPlaying ? "Остановить" : "Воспроизвести"}
            >
              {isPlaying ? (
                <>
                  <span style={{ fontSize: '18px' }}>⏹</span> Стоп
                </>
              ) : (
                <>
                  <span style={{ fontSize: '18px' }}>▶</span> Играть
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
              ? `Активный аккорд: ${activeChord}`
              : 'Аккорд не выбран'}
          </h2>
        </div>

        {/* Настройки отображения */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          marginTop: '30px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ minWidth: '180px' }}>Размер узлов: {(nodeSize * 100).toFixed(0)}%</label>
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
            <label style={{ minWidth: '180px' }}>Скорость перехода: {transitionDuration}мс</label>
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
            <label style={{ minWidth: '180px' }}>Время на аккорд: {(chordDuration / 1000).toFixed(1)}с</label>
            <input
              type="range"
              min="200"
              max="5000"
              step="100"
              value={chordDuration}
              onChange={(e) => setChordDuration(parseInt(e.target.value))}
              style={{ flex: 1 }}
              disabled={isPlaying} // Блокируем изменение во время воспроизведения
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