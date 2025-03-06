import React, { useEffect, useState, useRef, useMemo } from "react";
import { chordsToNotes } from "../utils/chordParser";
import {
    generateTonnetzData,
    calculateScaling,
    VIRTUAL_STEP,
    NOTE_NAMES
} from "../utils/tonnetzMath";
import { TonnetzProps, NodeData, EdgeData, VirtualBounds } from "../types/tonnetz";
import "./Tonnetz.css"; // Импортируем CSS файл для стилей

// Функция для получения цвета из спектра для ноты
function getNoteColor(noteName: string, saturation: number = 1, brightness: number = 1, isHighlighted: boolean = false) {
    // Получаем индекс ноты в 12-тоновой гамме
    const noteIndex = NOTE_NAMES.indexOf(noteName.replace(/\d+$/, ''));

    if (noteIndex === -1) return "#CCCCCC"; // Если нота не найдена, возвращаем серый

    // Вычисляем оттенок (hue) на основе индекса ноты (0-360 градусов)
    const hue = (noteIndex * 30) % 360; // 30 градусов на ноту

    // Делаем более явную разницу между выделенными и невыделенными нотами
    const actualSaturation = isHighlighted ? saturation : saturation * 0.3; // Уменьшаем насыщенность сильнее
    const actualBrightness = isHighlighted ? brightness : Math.min(0.95, brightness * 1.5); // Увеличиваем яркость

    // Преобразуем HSL в RGB
    return hslToRgb(hue, actualSaturation, actualBrightness);
}

// Функция для получения инверсного цвета
function getInverseColor(color: string): string {
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

    // Если формат цвета неизвестен, возвращаем белый или черный
    return color === 'white' ? 'black' : 'white';
}

// Функция для преобразования HSL в RGB в формате #RRGGBB
function hslToRgb(h: number, s: number, l: number): string {
    h /= 360;
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
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    // Преобразуем в hex
    const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export default function MinimalShiftTonnetz({
    highlightNotes = [],
    highlightChords = [],
    rows = 7,
    cols = 7,
    nodeSize = 0.5, // Значение по умолчанию - средний размер

    // Значения по умолчанию для цветов
    highlightedNodeColor = "#ff00ff",
    nodeColor = "white",
    textColor = "black",
    edgeColor = "black",
    nodeStrokeColor = "black",

    // Время перехода в миллисекундах
    transitionDuration = 300,

    // Цветовой спектр
    useColorSpectrum = false,
    spectrumSaturation = 0.8,
    spectrumBrightness = 0.6
}: TonnetzProps) {
    // Используем useMemo для создания allHighlightedNotes, чтобы избежать пересоздания при каждом рендере
    const allHighlightedNotes = useMemo(() => {
        // Проверяем, есть ли аккорды или ноты для выделения
        if (highlightNotes.length === 0 && highlightChords.length === 0) {
            return [];
        }

        return [
            ...highlightNotes,
            ...chordsToNotes(highlightChords)
        ];
    }, [highlightNotes, highlightChords]);

    // Используем useMemo для создания highlightSet
    const highlightSet = useMemo(() => {
        return new Set(allHighlightedNotes.map(n => n.toUpperCase()));
    }, [allHighlightedNotes]);

    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(600);

    // Состояния для хранения данных Tonnetz
    const [nodes, setNodes] = useState<NodeData[]>([]);
    const [edges, setEdges] = useState<EdgeData[]>([]);
    const [virtualBounds, setVirtualBounds] = useState<VirtualBounds>({
        minX: 0, maxX: 0, minY: 0, maxY: 0
    });

    // Отслеживаем размер контейнера
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);

        return () => {
            window.removeEventListener('resize', updateWidth);
        };
    }, []);

    // Генерируем данные Tonnetz при изменении rows или cols
    useEffect(() => {
        const { nodes, edges, virtualBounds } = generateTonnetzData(rows, cols);
        setNodes(nodes);
        setEdges(edges);
        setVirtualBounds(virtualBounds);
    }, [rows, cols]);

    // Вычисляем масштаб и смещение для отображения
    const { scale, scaledHeight, offsetX, offsetY } = useMemo(() => {
        return calculateScaling(virtualBounds, containerWidth);
    }, [virtualBounds, containerWidth]);

    // Создаем стиль для перехода
    const transitionStyle = {
        transition: `fill ${transitionDuration}ms ease-in-out`
    };

    return (
        <div ref={containerRef} style={{ width: "100%" }}>
            <svg
                width="100%"
                height={scaledHeight || 400} // Предотвращаем NaN
                viewBox={`0 0 ${containerWidth} ${scaledHeight || 400}`} // Предотвращаем NaN
                style={{ border: "1px solid #ccc" }}
            >
                {/* Рёбра */}
                {edges.map((edge, idx) => {
                    const fromNode = nodes[edge.from];
                    const toNode = nodes[edge.to];

                    if (!fromNode || !toNode) return null;

                    const x1 = (fromNode.virtualX + offsetX) * scale;
                    const y1 = (fromNode.virtualY + offsetY) * scale;
                    const x2 = (toNode.virtualX + offsetX) * scale;
                    const y2 = (toNode.virtualY + offsetY) * scale;

                    return (
                        <line
                            key={idx}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={edgeColor}
                            strokeWidth={1}
                        />
                    );
                })}

                {/* Узлы */}
                {nodes.map((nd, i) => {
                    const noteName = nd.noteName.toUpperCase();
                    const isHighlighted = highlightSet.has(noteName);

                    const x = (nd.virtualX + offsetX) * scale;
                    const y = (nd.virtualY + offsetY) * scale;

                    // Вычисляем размер узла на основе nodeSize
                    const minNodeRadius = VIRTUAL_STEP * scale * 0.05;
                    const maxNodeRadius = VIRTUAL_STEP * scale * 0.45;
                    const nodeRadius = minNodeRadius + (maxNodeRadius - minNodeRadius) * nodeSize;

                    // Размер шрифта пропорционален размеру узла
                    const fontSize = nodeRadius * 0.9;

                    // Определяем цвет узла
                    let fillColor;
                    if (useColorSpectrum) {
                        // Используем цветовой спектр
                        fillColor = getNoteColor(
                            nd.noteName,
                            spectrumSaturation,
                            spectrumBrightness,
                            isHighlighted
                        );
                    } else {
                        // Используем обычные цвета
                        fillColor = isHighlighted ? highlightedNodeColor : nodeColor;
                    }

                    return (
                        <g key={i}>
                            <circle
                                cx={x}
                                cy={y}
                                r={nodeRadius}
                                fill={fillColor}
                                stroke={nodeStrokeColor}
                                strokeWidth={1}
                                style={transitionStyle}
                                className="tonnetz-node"
                            />
                            <text
                                x={x}
                                y={y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={fontSize}
                                fill={isHighlighted ? getInverseColor(fillColor) : textColor}
                                fontWeight={isHighlighted ? "bold" : "normal"}
                            >
                                {nd.noteName}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}