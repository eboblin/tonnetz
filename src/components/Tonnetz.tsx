import React, { useEffect, useState, useRef, useMemo } from "react";
import { chordsToNotes } from "../utils/chordParser";
import {
    generateTonnetzData,
    calculateScaling,
    VIRTUAL_STEP
} from "../utils/tonnetzMath";
import { TonnetzProps, NodeData, EdgeData, VirtualBounds } from "../types/tonnetz";
import "./Tonnetz.css"; // Импортируем CSS файл для стилей

export default function MinimalShiftTonnetz({
    highlightNotes = [],
    highlightChords = [],
    rows = 7,
    cols = 7,
    nodeSize = 0.5, // Значение по умолчанию - средний размер

    // Значения по умолчанию для цветов
    highlightedNodeColor = "blue",
    nodeColor = "white",
    textColor = "black",
    edgeColor = "black",
    nodeStrokeColor = "black",

    // Время перехода в миллисекундах
    transitionDuration = 300
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

                    return (
                        <g key={i}>
                            <circle
                                cx={x}
                                cy={y}
                                r={nodeRadius}
                                fill={isHighlighted ? highlightedNodeColor : nodeColor}
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
                                fill={textColor}
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