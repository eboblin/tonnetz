// Типы данных для Tonnetz

// Данные узла
export type NodeData = {
    i: number;
    j: number;
    virtualX: number;
    virtualY: number;
    noteName: string;
};

// Данные ребра
export type EdgeData = {
    from: number;
    to: number;
};

// Границы виртуальных координат
export type VirtualBounds = {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
};

// Вектор
export type Vector = {
    x: number;
    y: number;
};

// Пропсы для компонента Tonnetz
export interface TonnetzProps {
    highlightNotes?: string[];
    highlightChords?: string[];
    rows?: number;
    cols?: number;
    nodeSize?: number; // От 0 до 1, где 0 - очень маленькие, 1 - очень большие

    // Цветовые пропсы
    highlightedNodeColor?: string; // Цвет выделенных нот
    nodeColor?: string; // Цвет не выделенных нот
    textColor?: string; // Цвет текста
    edgeColor?: string; // Цвет рёбер
    nodeStrokeColor?: string; // Цвет обводки нот

    // Анимация
    transitionDuration?: number; // Время перехода в миллисекундах
} 