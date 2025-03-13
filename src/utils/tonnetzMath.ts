import { NodeData, EdgeData, VirtualBounds, Vector } from "../types/tonnetz";

// 12-тоновая гамма
export const NOTE_NAMES = [
    "C", "C#", "D", "D#", "E", "F",
    "F#", "G", "G#", "A", "A#", "B",
];

// Виртуальные координаты для расчётов
export const VIRTUAL_STEP = 100; // Базовый шаг в виртуальных координатах

// Векторы (горизонталь = квинта +7, диагональ = +3)
export const vP5: Vector = { x: VIRTUAL_STEP, y: 0 };
export const vM3: Vector = {
    x: VIRTUAL_STEP / 2,
    y: (Math.sqrt(3) / 2) * VIRTUAL_STEP
};

// Формула pitchClass
export function getPitchClass(i: number, j: number): number {
    const offset = 7 * i + 3 * j;
    return ((offset % 12) + 12) % 12;
}

/**
 * Изменённая функция "минимального" чередования.
 * Теперь каждая вторая строка смещается "вправо" на +1.
 *
 * rowIndex (0-based) — номер строки от 0 до rows-1
 */
export function minimalShift(rowIndex: number): number {
    return -Math.floor(rowIndex / 2)
}

// Вычисляем минимальные и максимальные индексы
export function calculateIndices(rows: number, cols: number) {
    const MIN_J = -Math.floor(rows / 2);
    const MAX_J = MIN_J + rows - 1;
    const MIN_I = -Math.floor(cols / 2);
    const MAX_I = MIN_I + cols - 1;

    return { MIN_I, MAX_I, MIN_J, MAX_J };
}

// Генерация Tonnetz
export function generateTonnetzData(rows: number, cols: number): {
    nodes: NodeData[];
    edges: EdgeData[];
    virtualBounds: VirtualBounds;
} {
    const { MIN_I, MAX_I, MIN_J, MAX_J } = calculateIndices(rows, cols);

    const nodes: NodeData[] = [];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    // Создаем узлы
    for (let j = MIN_J; j <= MAX_J; j++) {
        const rowIndex = j - MIN_J;
        const shift = minimalShift(rowIndex);

        // Базовые границы для данного ряда
        let rowMinI = MIN_I + shift;
        let rowMaxI = MAX_I + shift;

        // Каждая вторая строка (нечётный rowIndex) короче на 1 клавишу
        if (rowIndex % 2 === 1) {
            rowMaxI -= 1;
        }

        for (let i = rowMinI; i <= rowMaxI; i++) {
            const pitchClass = getPitchClass(i, j);
            const noteName = NOTE_NAMES[pitchClass];

            // Виртуальные координаты
            const virtualX = i * vP5.x + j * vM3.x;
            const virtualY = i * vP5.y + j * vM3.y;

            // Обновляем границы
            minX = Math.min(minX, virtualX);
            maxX = Math.max(maxX, virtualX);
            minY = Math.min(minY, virtualY);
            maxY = Math.max(maxY, virtualY);

            nodes.push({
                i,
                j,
                virtualX,
                virtualY,
                noteName
            });
        }
    }

    // Map для быстрого доступа
    const keyMap = new Map<string, number>();
    function coordKey(i: number, j: number) {
        return `${i},${j}`;
    }

    for (let idx = 0; idx < nodes.length; idx++) {
        const nd = nodes[idx];
        keyMap.set(coordKey(nd.i, nd.j), idx);
    }

    // Рёбра Tonnetz
    const edges: EdgeData[] = [];

    for (let j = MIN_J; j <= MAX_J; j++) {
        const rowIndex = j - MIN_J;
        const shift = minimalShift(rowIndex);

        let rowMinI = MIN_I + shift;
        let rowMaxI = MAX_I + shift;

        if (rowIndex % 2 === 1) {
            rowMaxI -= 1;
        }

        for (let i = rowMinI; i <= rowMaxI; i++) {
            const currIdx = keyMap.get(coordKey(i, j));
            if (currIdx === undefined) continue;

            // Горизонталь (+7)
            const rightIdx = keyMap.get(coordKey(i + 1, j));
            if (rightIdx !== undefined) {
                edges.push({ from: currIdx, to: rightIdx });
            }
            // +3 (вертикаль вверх)
            const upIdx = keyMap.get(coordKey(i, j + 1));
            if (upIdx !== undefined) {
                edges.push({ from: currIdx, to: upIdx });
            }
            // +4 (диагональ)
            const diagIdx = keyMap.get(coordKey(i + 1, j - 1));
            if (diagIdx !== undefined) {
                edges.push({ from: currIdx, to: diagIdx });
            }
        }
    }

    return {
        nodes,
        edges,
        virtualBounds: { minX, maxX, minY, maxY }
    };
}

// Вычисляет масштаб и смещение для отображения
export function calculateScaling(
    virtualBounds: VirtualBounds,
    containerWidth: number
) {
    const virtualWidth = virtualBounds.maxX - virtualBounds.minX || 1;
    const virtualHeight = virtualBounds.maxY - virtualBounds.minY || 1;

    // Добавляем отступы
    const PADDING_PERCENT = 0.1;
    const paddingX = virtualWidth * PADDING_PERCENT;
    const paddingY = virtualHeight * PADDING_PERCENT;

    const scaledVirtualWidth = virtualWidth + 2 * paddingX;
    const scaledVirtualHeight = virtualHeight + 2 * paddingY;

    // Масштабируем по ширине контейнера
    const scale = containerWidth / scaledVirtualWidth;
    const scaledHeight = Math.max(1, scaledVirtualHeight * scale);

    // Смещение для "центрирования"
    const offsetX = -virtualBounds.minX + paddingX;
    const offsetY = -virtualBounds.minY + paddingY;

    return {
        scale,
        scaledHeight,
        offsetX,
        offsetY
    };
}
