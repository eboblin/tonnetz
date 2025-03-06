// Базовые ноты
const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Интервалы для разных типов аккордов (в полутонах от основной ноты)
const CHORD_TYPES: Record<string, number[]> = {
    // Трезвучия
    '': [0, 4, 7],         // Мажорное трезвучие (например, C)
    'm': [0, 3, 7],        // Минорное трезвучие (например, Cm)
    'dim': [0, 3, 6],      // Уменьшенное трезвучие (например, Cdim)
    'aug': [0, 4, 8],      // Увеличенное трезвучие (например, Caug)
    'sus2': [0, 2, 7],     // Сус2 (например, Csus2)
    'sus4': [0, 5, 7],     // Сус4 (например, Csus4)

    // Септаккорды
    '7': [0, 4, 7, 10],    // Доминантсептаккорд (например, C7)
    'maj7': [0, 4, 7, 11], // Большой мажорный септаккорд (например, Cmaj7)
    'm7': [0, 3, 7, 10],   // Минорный септаккорд (например, Cm7)
    'dim7': [0, 3, 6, 9],  // Уменьшенный септаккорд (например, Cdim7)
    'm7b5': [0, 3, 6, 10], // Полууменьшенный септаккорд (например, Cm7b5)
    'aug7': [0, 4, 8, 10], // Увеличенный септаккорд (например, Caug7)

    // Другие распространенные аккорды
    '6': [0, 4, 7, 9],     // Мажорный секстаккорд (например, C6)
    'm6': [0, 3, 7, 9],    // Минорный секстаккорд (например, Cm6)
    '9': [0, 4, 7, 10, 14],// Нонаккорд (например, C9)
    'add9': [0, 4, 7, 14], // Добавленная нона (например, Cadd9)
};

/**
 * Парсит строку аккорда и возвращает массив нот
 * @param chordStr Строка аккорда (например, "Cmaj7", "F#m", "Bb7")
 * @returns Массив нот, составляющих аккорд
 */
export function parseChord(chordStr: string): string[] {
    // Обработка пустой строки
    if (!chordStr || chordStr.trim() === '') {
        return [];
    }

    // Нормализуем строку аккорда
    const chord = chordStr.trim();

    // Определяем основную ноту (корень)
    let rootNote = chord.charAt(0).toUpperCase();
    let index = 1;

    // Проверяем наличие диеза или бемоля
    if (index < chord.length && (chord.charAt(index) === '#' || chord.charAt(index) === 'b')) {
        rootNote += chord.charAt(index);
        index++;

        // Преобразуем бемоли в диезы для унификации
        if (rootNote.includes('b')) {
            const noteIndex = ROOT_NOTES.indexOf(rootNote.replace('b', '#'));
            rootNote = ROOT_NOTES[(noteIndex + 11) % 12]; // -1 полутон, с циклическим переходом
        }
    }

    // Определяем тип аккорда
    const chordType = chord.substring(index);

    // Получаем интервалы для данного типа аккорда
    const intervals = CHORD_TYPES[chordType];

    // Если тип аккорда не распознан, возвращаем только основную ноту
    if (!intervals) {
        console.warn(`Неизвестный тип аккорда: ${chordType}`);
        return [rootNote];
    }

    // Находим индекс основной ноты
    const rootIndex = ROOT_NOTES.indexOf(rootNote);
    if (rootIndex === -1) {
        console.warn(`Неизвестная нота: ${rootNote}`);
        return [];
    }

    // Формируем массив нот аккорда
    return intervals.map(interval => {
        const noteIndex = (rootIndex + interval) % 12;
        return ROOT_NOTES[noteIndex];
    });
}

/**
 * Преобразует строку аккорда или массив аккордов в массив нот
 * @param input Строка аккорда или массив аккордов
 * @returns Массив уникальных нот
 */
export function chordsToNotes(input: string | string[]): string[] {
    if (!input) return [];

    // Если передана строка, обрабатываем её как один аккорд
    if (typeof input === 'string') {
        return parseChord(input);
    }

    // Если передан массив, обрабатываем каждый элемент как аккорд
    const allNotes: string[] = [];

    input.forEach(item => {
        // Всегда обрабатываем как аккорд
        allNotes.push(...parseChord(item));
    });

    // Удаляем дубликаты
    return [...new Set(allNotes)];
} 