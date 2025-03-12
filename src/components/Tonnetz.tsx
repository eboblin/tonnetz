import React, { useEffect, useState, useRef, useMemo } from "react";
import {
    generateTonnetzData,
    calculateScaling,
} from "../utils/tonnetzMath";
import { TonnetzProps, NodeData, EdgeData, VirtualBounds } from "../types/tonnetz";
import { TonnetzNode, TonnetzEdge, calculateNodeRadius } from "./TonnetzElements";
import "./Tonnetz.css"; // Импортируем CSS файл для стилей


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