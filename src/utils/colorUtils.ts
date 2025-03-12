import { NOTE_NAMES } from "./tonnetzMath";

// Функция для получения цвета из спектра для ноты
export function getNoteColor(
    noteName: string,
    isHighlighted: boolean = false,
    activeSaturation: number = 0.8,
    activeBrightness: number = 0.6,
    inactiveSaturation: number = 0.3,
    inactiveBrightness: number = 0.9
) {
    // Получаем индекс ноты в 12-тоновой гамме
    const noteIndex = NOTE_NAMES.indexOf(noteName.replace(/\d+$/, ''));

    if (noteIndex === -1) return "#CCCCCC"; // Если нота не найдена, возвращаем серый

    // Вычисляем оттенок (hue) на основе индекса ноты (0-360 градусов)
    const hue = (noteIndex * 30) % 360; // 30 градусов на ноту

    // Используем разные настройки для активных и неактивных нот
    const saturation = isHighlighted ? activeSaturation : inactiveSaturation;
    const brightness = isHighlighted ? activeBrightness : inactiveBrightness;

    // Преобразуем HSL в RGB
    return hslToRgb(hue, saturation, brightness);
}

// Функция для получения инверсного цвета
export function getInverseColor(color: string): string {
    // Если цвет в формате #RRGGBB
    if (color.startsWith('#') && color.length === 7) {
        // Преобразуем в RGB
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);

        // Вычисляем яркость
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;

        // Возвращаем черный или белый в зависимости от яркости
        return brightness > 128 ? '#000000' : '#FFFFFF';
    }

    return '#000000'; // По умолчанию черный
}

// Функция для преобразования HSL в RGB
export function hslToRgb(h: number, s: number, l: number): string {
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, (h / 360) + 1 / 3);
        g = hue2rgb(p, q, h / 360);
        b = hue2rgb(p, q, (h / 360) - 1 / 3);
    }

    // Преобразуем в hex
    const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
} 