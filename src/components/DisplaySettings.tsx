import React from 'react';

interface DisplaySettingsProps {
    nodeSize: number;
    setNodeSize: (size: number) => void;
    transitionDuration: number;
    setTransitionDuration: (duration: number) => void;
    bpm: number;
    setBpm: (bpm: number) => void;
    isPlaying: boolean;
    useColorSpectrum: boolean;
    setUseColorSpectrum: (use: boolean) => void;
    activeSpectrumSaturation: number;
    setActiveSpectrumSaturation: (saturation: number) => void;
    activeSpectrumBrightness: number;
    setActiveSpectrumBrightness: (brightness: number) => void;
    inactiveSpectrumSaturation: number;
    setInactiveSpectrumSaturation: (saturation: number) => void;
    inactiveSpectrumBrightness: number;
    setInactiveSpectrumBrightness: (brightness: number) => void;
    inactiveOpacity: number;
    setInactiveOpacity: (opacity: number) => void;
}

const DisplaySettings: React.FC<DisplaySettingsProps> = ({
    nodeSize,
    setNodeSize,
    transitionDuration,
    setTransitionDuration,
    bpm,
    setBpm,
    isPlaying,
    useColorSpectrum,
    setUseColorSpectrum,
    activeSpectrumSaturation,
    setActiveSpectrumSaturation,
    activeSpectrumBrightness,
    setActiveSpectrumBrightness,
    inactiveSpectrumSaturation,
    setInactiveSpectrumSaturation,
    inactiveSpectrumBrightness,
    setInactiveSpectrumBrightness,
    inactiveOpacity,
    setInactiveOpacity
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
                <label style={{ minWidth: '180px' }}>Playback Tempo: {bpm} BPM</label>
                <input
                    type="range"
                    min="30"
                    max="240"
                    step="1"
                    value={bpm}
                    onChange={(e) => setBpm(parseInt(e.target.value))}
                    disabled={isPlaying}
                    style={{ flex: 1 }}
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ minWidth: '180px' }}>Inactive Opacity: {(inactiveOpacity * 100).toFixed(0)}%</label>
                <input
                    type="range"
                    min="0.2"
                    max="1"
                    step="0.05"
                    value={inactiveOpacity}
                    onChange={(e) => setInactiveOpacity(parseFloat(e.target.value))}
                    style={{ flex: 1 }}
                />
            </div>

            <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        type="checkbox"
                        id="useColorSpectrum"
                        checked={useColorSpectrum}
                        onChange={(e) => setUseColorSpectrum(e.target.checked)}
                        style={checkboxStyle}
                    />
                    <label htmlFor="useColorSpectrum">Use Color Spectrum</label>
                </div>

                {useColorSpectrum && (
                    <>
                        <h4 style={{ marginTop: '10px', marginBottom: '5px' }}>Active Notes</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ minWidth: '180px' }}>Saturation: {(activeSpectrumSaturation * 100).toFixed(0)}%</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={activeSpectrumSaturation}
                                onChange={(e) => setActiveSpectrumSaturation(parseFloat(e.target.value))}
                                style={{ flex: 1 }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ minWidth: '180px' }}>Brightness: {(activeSpectrumBrightness * 100).toFixed(0)}%</label>
                            <input
                                type="range"
                                min="0.2"
                                max="1"
                                step="0.05"
                                value={activeSpectrumBrightness}
                                onChange={(e) => setActiveSpectrumBrightness(parseFloat(e.target.value))}
                                style={{ flex: 1 }}
                            />
                        </div>

                        <h4 style={{ marginTop: '15px', marginBottom: '5px' }}>Inactive Notes</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ minWidth: '180px' }}>Saturation: {(inactiveSpectrumSaturation * 100).toFixed(0)}%</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={inactiveSpectrumSaturation}
                                onChange={(e) => setInactiveSpectrumSaturation(parseFloat(e.target.value))}
                                style={{ flex: 1 }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ minWidth: '180px' }}>Brightness: {(inactiveSpectrumBrightness * 100).toFixed(0)}%</label>
                            <input
                                type="range"
                                min="0.2"
                                max="1"
                                step="0.05"
                                value={inactiveSpectrumBrightness}
                                onChange={(e) => setInactiveSpectrumBrightness(parseFloat(e.target.value))}
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