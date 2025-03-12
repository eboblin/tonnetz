import { NodeData, EdgeData } from "../types/tonnetz";
import { getNoteColor, getInverseColor } from "../utils/colorUtils";
import { VIRTUAL_STEP } from "../utils/tonnetzMath";

interface NodeProps {
    node: NodeData;
    x: number;
    y: number;
    nodeRadius: number;
    isHighlighted: boolean;
    useColorSpectrum: boolean;
    highlightedNodeColor: string;
    nodeColor: string;
    textColor: string;
    nodeStrokeColor: string;
    activeSpectrumSaturation: number;
    activeSpectrumBrightness: number;
    inactiveSpectrumSaturation: number;
    inactiveSpectrumBrightness: number;
    nodeOpacity: number;
    transitionStyle: React.CSSProperties;
}

export const TonnetzNode: React.FC<NodeProps> = ({
    node,
    x,
    y,
    nodeRadius,
    isHighlighted,
    useColorSpectrum,
    highlightedNodeColor,
    nodeColor,
    textColor,
    nodeStrokeColor,
    activeSpectrumSaturation,
    activeSpectrumBrightness,
    inactiveSpectrumSaturation,
    inactiveSpectrumBrightness,
    nodeOpacity,
    transitionStyle
}) => {
    // Размер шрифта пропорционален размеру узла
    const fontSize = nodeRadius * 0.9;

    // Определяем цвет узла
    let fillColor;

    if (useColorSpectrum) {
        // Используем цветовой спектр с отдельными настройками для активных и неактивных нот
        fillColor = getNoteColor(
            node.noteName,
            isHighlighted,
            activeSpectrumSaturation,
            activeSpectrumBrightness,
            inactiveSpectrumSaturation,
            inactiveSpectrumBrightness
        );
    } else {
        // Используем обычные цвета
        fillColor = isHighlighted ? highlightedNodeColor : nodeColor;
    }

    return (
        <g>
            {/* Добавляем эффект свечения для выделенных нот */}
            {isHighlighted && (
                <circle
                    cx={x}
                    cy={y}
                    r={nodeRadius * 1.2}
                    fill="none"
                    stroke={useColorSpectrum ? fillColor : highlightedNodeColor}
                    strokeWidth={2}
                    opacity={0.5}
                    style={transitionStyle}
                />
            )}
            <circle
                cx={x}
                cy={y}
                r={nodeRadius}
                fill={fillColor}
                stroke={isHighlighted ? (useColorSpectrum ? fillColor : highlightedNodeColor) : nodeStrokeColor}
                strokeWidth={isHighlighted ? 2 : 1}
                opacity={nodeOpacity}
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
                opacity={nodeOpacity}
                style={transitionStyle}
            >
                {node.noteName}
            </text>
        </g>
    );
};

interface EdgeProps {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    edgeColor: string;
    edgeOpacity: number;
    transitionStyle: React.CSSProperties;
}

export const TonnetzEdge: React.FC<EdgeProps> = ({
    fromX,
    fromY,
    toX,
    toY,
    edgeColor,
    edgeOpacity,
    transitionStyle
}) => {
    return (
        <line
            x1={fromX}
            y1={fromY}
            x2={toX}
            y2={toY}
            stroke={edgeColor}
            strokeWidth={1}
            opacity={edgeOpacity}
            style={transitionStyle}
        />
    );
};

export const calculateNodeRadius = (scale: number, nodeSize: number) => {
    const minNodeRadius = VIRTUAL_STEP * scale * 0.05;
    const maxNodeRadius = VIRTUAL_STEP * scale * 0.45;
    return minNodeRadius + (maxNodeRadius - minNodeRadius) * nodeSize;
}; 