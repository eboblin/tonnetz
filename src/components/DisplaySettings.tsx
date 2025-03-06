import React from 'react';

interface DisplaySettingsProps {
    nodeSize: number;
    setNodeSize: (size: number) => void;
    transitionDuration: number;
    setTransitionDuration: (duration: number) => void;
    chordDuration: number;
    setChordDuration: (duration: number) => void;
    isPlaying: boolean;
    useColorSpectrum: boolean;
    setUseColorSpectrum: (use: boolean) => void;
    spectrumSaturation: number;
    setSpectrumSaturation: (saturation: number) => void;
    spectrumBrightness: number;
    setSpectrumBrightness: (brightness: number) => void;
}

const DisplaySettings: React.FC<DisplaySettingsProps> = ({
    nodeSize,
    setNodeSize,
    transitionDuration,
    setTransitionDuration,
    chordDuration,
    setChordDuration,
    isPlaying,
    useColorSpectrum,
    setUseColorSpectrum,
    spectrumSaturation,
    setSpectrumSaturation,
    spectrumBrightness,
    setSpectrumBrightness
}) => {
    const checkboxStyle = {
        marginRight: '10px',
        cursor: 'pointer'
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column' as 'column',
            gap: '15px',
            marginTop: '30px',
            marginBottom: '20px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ minWidth: '180px' }}>Node Size: {(nodeSize * 100).toFixed(0)}%</label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={nodeSize}
                    onChange={(e) => setNodeSize(parseFloat(e.target.value))}
                    style={{ flex: 1 }}
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ minWidth: '180px' }}>Transition Speed: {transitionDuration}ms</label>
                <input
                    type="range"
                    min="0"
                    max="1000"
                    step="50"
                    value={transitionDuration}
                    onChange={(e) => setTransitionDuration(parseInt(e.target.value))}
                    style={{ flex: 1 }}
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ minWidth: '180px' }}>Chord Duration: {(chordDuration / 1000).toFixed(1)}s</label>
                <input
                    type="range"
                    min="200"
                    max="5000"
                    step="100"
                    value={chordDuration}
                    onChange={(e) => setChordDuration(parseInt(e.target.value))}
                    style={{ flex: 1 }}
                    disabled={isPlaying} // Disable changes during playback
                />
            </div>

            {/* Color spectrum settings */}
            <div style={{
                display: 'flex',
                flexDirection: 'column' as 'column',
                gap: '10px',
                padding: '15px',
                background: '#2a2a2a',
                borderRadius: '4px',
                marginTop: '10px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        type="checkbox"
                        checked={useColorSpectrum}
                        onChange={(e) => setUseColorSpectrum(e.target.checked)}
                        style={checkboxStyle}
                        id="useColorSpectrum"
                    />
                    <label htmlFor="useColorSpectrum">Use Color Spectrum</label>
                </div>

                {useColorSpectrum && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ minWidth: '180px' }}>Color Saturation: {(spectrumSaturation * 100).toFixed(0)}%</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={spectrumSaturation}
                                onChange={(e) => setSpectrumSaturation(parseFloat(e.target.value))}
                                style={{ flex: 1 }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ minWidth: '180px' }}>Color Brightness: {(spectrumBrightness * 100).toFixed(0)}%</label>
                            <input
                                type="range"
                                min="0.2"
                                max="1"
                                step="0.05"
                                value={spectrumBrightness}
                                onChange={(e) => setSpectrumBrightness(parseFloat(e.target.value))}
                                style={{ flex: 1 }}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DisplaySettings; 