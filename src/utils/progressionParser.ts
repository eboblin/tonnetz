interface ParsedChord {
    chord: string;
    duration: number; // длительность в долях такта (1 = целый такт, 0.5 = половина такта)
}

export function parseProgression(text: string): ParsedChord[] {
    const result: ParsedChord[] = [];

    // Разбиваем на строки
    const lines = text.split('\n');

    for (let line of lines) {
        // Пропускаем заголовки в квадратных скобках и пустые строки
        if (line.trim().startsWith('[') || line.trim() === '') {
            continue;
        }

        // Разбиваем на такты (между |)
        const measures = line.split('|').filter(m => m.trim());

        for (let measure of measures) {
            const chords = measure.trim().split(/\s+/).filter(c => c.length > 0);

            // Вычисляем длительность для каждого аккорда в такте
            const duration = 1 / chords.length; // 1 = целый такт

            // Добавляем аккорды с их длительностями
            chords.forEach(chord => {
                result.push({
                    chord,
                    duration
                });
            });
        }
    }

    return result;
} 