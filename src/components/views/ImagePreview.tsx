import React, { useState, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Crosshair, 
  Grid, 
  FlipHorizontal, 
  FlipVertical 
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';

interface ImagePreviewProps {
  dataUrl: string;
  title: string;
  filterCanvasRef?: React.RefObject<HTMLCanvasElement | null>;
  showFilteredView?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  dataUrl,
  title,
  filterCanvasRef,
  showFilteredView = false,
}) => {
  const { themeTokens, isLight } = useTheme();
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [inspectMode, setInspectMode] = useState<boolean>(true);

  // Inspector cursor state
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [pixelColor, setPixelColor] = useState<{ r: number; g: number; b: number; hex: string } | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleZoomIn = () => {
    soundEngine.playClick();
    setZoom((z) => Math.min(500, z + 25));
  };

  const handleZoomOut = () => {
    soundEngine.playClick();
    setZoom((z) => Math.max(25, z - 25));
  };

  const handleRotate = () => {
    soundEngine.playClick();
    setRotation((r) => (r + 90) % 360);
  };

  const handleReset = () => {
    soundEngine.playClick();
    setZoom(100);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!inspectMode || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setCursorPos({ x, y });

    if (imgRef.current && imgRef.current.complete) {
      try {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imgRef.current.naturalWidth || 800;
        tempCanvas.height = imgRef.current.naturalHeight || 600;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(imgRef.current, 0, 0);
          const scaleX = tempCanvas.width / rect.width;
          const scaleY = tempCanvas.height / rect.height;
          const imgX = Math.floor(x * scaleX);
          const imgY = Math.floor(y * scaleY);
          const pixel = ctx.getImageData(imgX, imgY, 1, 1).data;
          const r = pixel[0];
          const g = pixel[1];
          const b = pixel[2];
          const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
          setPixelColor({ r, g, b, hex });
        }
      } catch (err) {
        // Cross-origin fallback ignore
      }
    }
  };

  const handleMouseLeave = () => {
    setCursorPos(null);
    setPixelColor(null);
  };

  const transformStyle = {
    transform: `scale(${zoom / 100}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  return (
    <GlassCard padding="none" className={`relative flex flex-col overflow-hidden select-none ${isFullscreen ? 'fixed inset-4 z-50' : 'w-full'}`}>
      {/* Top Glass Toolbar */}
      <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${isLight ? 'bg-black/[0.02] border-black/[0.08]' : 'bg-black/[0.3] border-white/[0.08]'}`}>
        <div className="flex items-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${themeTokens.accent.bg} animate-pulse`} />
          <h3 className={`text-xs font-bold tracking-wide truncate max-w-xs ${themeTokens.textPrimary}`}>{title}</h3>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${themeTokens.accentSoft}`}>
            {zoom}%
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center space-x-1 text-xs">
          <Button variant="toolbar" size="xs" icon={ZoomIn} onClick={handleZoomIn} title="Zoom In" />
          <Button variant="toolbar" size="xs" icon={ZoomOut} onClick={handleZoomOut} title="Zoom Out" />
          <Button variant="toolbar" size="xs" icon={RotateCw} onClick={handleRotate} title="Rotate 90°" />
          <Button variant="toolbar" size="xs" icon={FlipHorizontal} active={flipH} onClick={() => setFlipH(!flipH)} title="Flip Horizontal" />
          <Button variant="toolbar" size="xs" icon={FlipVertical} active={flipV} onClick={() => setFlipV(!flipV)} title="Flip Vertical" />

          <div className={`w-px h-4 mx-1 ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />

          <Button variant="toolbar" size="xs" icon={Crosshair} active={inspectMode} onClick={() => setInspectMode(!inspectMode)} title="Crosshair Inspector" />
          <Button variant="toolbar" size="xs" icon={Grid} active={showGrid} onClick={() => setShowGrid(!showGrid)} title="Toggle Grid Overlay" />
          <Button variant="toolbar" size="xs" icon={RefreshCw} onClick={handleReset} title="Reset View" />
          <Button variant="toolbar" size="xs" icon={isFullscreen ? Minimize2 : Maximize2} onClick={() => setIsFullscreen(!isFullscreen)} title="Toggle Fullscreen" />
        </div>
      </div>

      {/* Main Canvas Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative w-full h-[420px] md:h-[500px] flex items-center justify-center overflow-hidden cursor-crosshair select-none ${isLight ? 'bg-slate-100' : 'bg-[#0a0a0d]'}`}
      >
        {/* Optional Grid Overlay */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              backgroundImage: isLight
                ? 'linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)'
                : 'linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        )}

        {/* Display either original HTMLImageElement or filtered HTMLCanvasElement */}
        {showFilteredView ? (
          <canvas
            ref={filterCanvasRef}
            style={transformStyle}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        ) : (
          <img
            ref={imgRef}
            src={dataUrl}
            alt={title}
            style={transformStyle}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        )}

        {/* Crosshair Pixel Inspector Floating Glass Card */}
        {inspectMode && cursorPos && pixelColor && (
          <div
            className={`absolute z-30 pointer-events-none p-2.5 rounded-xl border backdrop-blur-xl shadow-2xl text-[11px] font-mono space-y-1 min-w-36 ${themeTokens.popoverBg}`}
            style={{
              left: Math.min(cursorPos.x + 16, (containerRef.current?.clientWidth || 500) - 160),
              top: Math.min(cursorPos.y + 16, (containerRef.current?.clientHeight || 400) - 90),
            }}
          >
            <div className={`flex items-center justify-between border-b pb-1 ${isLight ? 'border-black/10' : 'border-white/10'}`}>
              <span className={themeTokens.textMuted}>POS</span>
              <span className={`font-bold ${themeTokens.accentText}`}>X:{cursorPos.x} Y:{cursorPos.y}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className="w-3.5 h-3.5 rounded-md border border-black/20 shrink-0"
                style={{ backgroundColor: pixelColor.hex }}
              />
              <span className={`font-bold ${themeTokens.textPrimary}`}>{pixelColor.hex}</span>
            </div>
            <div className={`text-[10px] ${themeTokens.textMuted}`}>
              RGB({pixelColor.r}, {pixelColor.g}, {pixelColor.b})
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
