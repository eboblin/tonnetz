import React, { useEffect, useState, useRef, useMemo } from "react";
import { chordsToNotes } from "../utils/chordParser";
import {
    generateTonnetzData,
    calculateScaling,
    VIRTUAL_STEP,
    NOTE_NAMES
} from "../utils/tonnetzMath";
import { TonnetzProps, NodeData, EdgeData, VirtualBounds } from "../types/tonnetz";
import { TonnetzNode, TonnetzEdge, calculateNodeRadius } from "./TonnetzElements";
import "./Tonnetz.css"; // Импортируем CSS файл для стилей

// Функция для получения цвета из спектра для ноты
function getNoteColor(
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
    rows = 7,
    cols = 7,
    nodeSize = 0.5,
    highlightedNodeColor = "#ff00ff",
    nodeColor = "white",
    textColor = "black",
    edgeColor = "black",
    nodeStrokeColor = "black",
    transitionDuration = 300,
    useColorSpectrum = true,
    activeSpectrumSaturation = 0.6,
    activeSpectrumBrightness = 0.4,
    inactiveSpectrumSaturation = 0.2,
    inactiveSpectrumBrightness = 0.45,
    inactiveOpacity = 0.65
}: TonnetzProps) {
    // Используем useMemo для создания highlightSet
    const highlightSet = useMemo(() => {
        return new Set(highlightNotes.map(n => n.toUpperCase()));
    }, [highlightNotes]);

    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(600);

    // Состояния для хранения данных Tonnetz
    const [nodes, setNodes] = useState<NodeData[]>([]);
    const [edges, setEdges] = useState<EdgeData[]>([]);
    const [bounds, setBounds] = useState<VirtualBounds>({
        minX: 0, maxX: 0, minY: 0, maxY: 0
    });

    // Состояния для масштабирования и смещения
    const [scale, setScale] = useState(1);
    const [scaledHeight, setScaledHeight] = useState(400);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);

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
        setBounds(virtualBounds);
    }, [rows, cols]);

    // Обновляем масштаб и смещение при изменении размера контейнера или границ
    useEffect(() => {
        if (containerWidth > 0 && bounds.maxX > bounds.minX) {
            const { scale, scaledHeight, offsetX, offsetY } = calculateScaling(bounds, containerWidth);
            setScale(scale);
            setOffsetX(offsetX);
            setOffsetY(offsetY);
            setScaledHeight(scaledHeight);
        }
    }, [containerWidth, bounds]);

    // Создаем стиль для перехода
    const transitionStyle = {
        transition: `fill ${transitionDuration}ms ease-in-out, opacity ${transitionDuration}ms ease-in-out`
    };

    // Прозрачность для рёбер
    const edgeOpacity = 0.3;

    return (
        <div ref={containerRef} style={{ width: "100%" }}>
            <svg
                width="100%"
                height={scaledHeight || 400}
                viewBox={`0 0 ${containerWidth} ${scaledHeight || 400}`}
                style={{ border: "1px solid #ccc" }}
            >
                {/* Рёбра */}
                {edges.map((edge, idx) => {
                    const fromNode = nodes[edge.from];
                    const toNode = nodes[edge.to];

                    if (!fromNode || !toNode) return null;

                    const fromX = (fromNode.virtualX + offsetX) * scale;
                    const fromY = (fromNode.virtualY + offsetY) * scale;
                    const toX = (toNode.virtualX + offsetX) * scale;
                    const toY = (toNode.virtualY + offsetY) * scale;

                    return (
                        <TonnetzEdge
                            key={idx}
                            fromX={fromX}
                            fromY={fromY}
                            toX={toX}
                            toY={toY}
                            edgeColor={edgeColor}
                            edgeOpacity={edgeOpacity}
                            transitionStyle={transitionStyle}
                        />
                    );
                })}

                {/* Узлы */}
                {nodes.map((node, i) => {
                    const noteName = node.noteName.toUpperCase();
                    const isHighlighted = highlightSet.has(noteName);

                    const x = (node.virtualX + offsetX) * scale;
                    const y = (node.virtualY + offsetY) * scale;

                    // Вычисляем размер узла
                    const nodeRadius = calculateNodeRadius(scale, nodeSize);

                    // Устанавливаем прозрачность в зависимости от того, выделена нота или нет
                    const nodeOpacity = isHighlighted ? 1 : inactiveOpacity;

                    return (
                        <TonnetzNode
                            key={i}
                            node={node}
                            x={x}
                            y={y}
                            nodeRadius={nodeRadius}
                            isHighlighted={isHighlighted}
                            useColorSpectrum={useColorSpectrum}
                            highlightedNodeColor={highlightedNodeColor}
                            nodeColor={nodeColor}
                            textColor={textColor}
                            nodeStrokeColor={nodeStrokeColor}
                            activeSpectrumSaturation={activeSpectrumSaturation}
                            activeSpectrumBrightness={activeSpectrumBrightness}
                            inactiveSpectrumSaturation={inactiveSpectrumSaturation}
                            inactiveSpectrumBrightness={inactiveSpectrumBrightness}
                            nodeOpacity={nodeOpacity}
                            transitionStyle={transitionStyle}
                        />
                    );
                })}
            </svg>
        </div>
    );
}