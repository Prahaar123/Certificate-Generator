import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Crosshair, ImagePlus, Maximize2, Minimize2, Move, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { FontSettings, TextBox } from '@/lib/certificateGenerator';

interface Position {
  x: number;
  y: number;
}

interface CertificatePreviewProps {
  templateImage: string;
  templateWidth: number;
  templateHeight: number;
  fontSettings: FontSettings;
  position: Position;
  textBox: TextBox;
  onPositionChange: (position: Position) => void;
  onTextBoxChange: (textBox: TextBox) => void;
}

const panelClass =
  'interactive-panel rounded-xl border border-white/10 bg-[#0a0d14]/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] backdrop-blur-xl';

export default function CertificatePreview({
  templateImage,
  templateWidth,
  templateHeight,
  fontSettings,
  position,
  textBox,
  onPositionChange,
}: CertificatePreviewProps) {
  const [baseScale, setBaseScale] = useState(1);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const certificateRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const displayScale = baseScale * zoom;

  const updateSize = useCallback(() => {
    if (!containerRef.current || templateWidth <= 0 || templateHeight <= 0) return;

    const container = containerRef.current;
    const availableWidth = Math.max(280, container.clientWidth - 36);
    const availableHeight = Math.max(360, container.clientHeight - 36);
    const nextBaseScale = Math.min(availableWidth / templateWidth, availableHeight / templateHeight, 1);

    setBaseScale(nextBaseScale);
    setContainerSize({
      width: templateWidth * nextBaseScale * zoom,
      height: templateHeight * nextBaseScale * zoom,
    });
  }, [templateHeight, templateWidth, zoom]);

  useEffect(() => {
    if (!templateImage) {
      setImageLoaded(false);
      setImageError(false);
      return;
    }

    setImageLoaded(false);
    setImageError(false);

    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setTimeout(updateSize, 50);
    };
    img.onerror = () => {
      setImageError(true);
      setImageLoaded(false);
    };
    img.src = templateImage;
  }, [templateImage, updateSize]);

  useEffect(() => {
    if (!imageLoaded) return;

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [focusMode, imageLoaded, updateSize]);

  useEffect(() => {
    if (!imageLoaded) return;
    updateSize();
  }, [imageLoaded, updateSize, zoom]);

  useEffect(() => {
    if (!focusMode) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFocusMode(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode]);

  const resetPosition = () => {
    onPositionChange({
      x: templateWidth / 2,
      y: templateHeight / 2,
    });
  };

  const getPointerPosition = (clientX: number, clientY: number) => {
    const rect = certificateRef.current?.getBoundingClientRect();
    if (!rect || displayScale <= 0) return null;

    return {
      x: (clientX - rect.left) / displayScale,
      y: (clientY - rect.top) / displayScale,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const pointer = getPointerPosition(event.clientX, event.clientY);
    if (!pointer) return;

    dragOffsetRef.current = {
      x: pointer.x - position.x,
      y: pointer.y - position.y,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const pointer = getPointerPosition(event.clientX, event.clientY);
    if (!pointer) return;

    const nextX = pointer.x - dragOffsetRef.current.x;
    const nextY = pointer.y - dragOffsetRef.current.y;
    const halfWidth = textBox.width / 2;

    onPositionChange({
      x: Math.max(halfWidth, Math.min(nextX, templateWidth - halfWidth)),
      y: Math.max(20, Math.min(nextY, templateHeight - 20)),
    });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) event.currentTarget.releasePointerCapture(event.pointerId);
    setIsDragging(false);
  };

  const previewText = fontSettings.uppercase ? 'Sample Name'.toUpperCase() : 'Sample Name';
  const scaledBoxWidth = Math.max(80, Math.min(textBox.width * displayScale, containerSize.width - 16));
  const scaledFontSize = Math.max(8, fontSettings.size * displayScale);
  const textCenterX = Math.max(scaledBoxWidth / 2, Math.min(position.x * displayScale, containerSize.width - scaledBoxWidth / 2));
  const textCenterY = Math.max(scaledFontSize / 2, Math.min(position.y * displayScale, containerSize.height - scaledFontSize / 2));

  return (
    <section
      className={
        focusMode
          ? `${panelClass} fixed inset-3 z-50 flex flex-col overflow-hidden sm:inset-5`
          : `${panelClass} min-h-[620px]`
      }
    >
      {focusMode && <div className="fixed inset-0 -z-10 bg-black/72 backdrop-blur-sm" aria-hidden="true" />}

      <div className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.055]">
            <Move className="h-4 w-4 text-[#aab2ff]" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-normal text-white">Certificate preview</h2>
            <p className="text-sm text-[#9aa1b7]">Drag the name area. The center point matches the exported certificate.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-[#8f96aa]">
          {imageLoaded && (
            <span className="rounded-md bg-white/[0.06] px-2.5 py-1 tabular-nums">
              {templateWidth} x {templateHeight}px at {Math.round(displayScale * 100)}%
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setZoom((value) => Math.max(0.75, Number((value - 0.15).toFixed(2))))}
            disabled={!templateImage}
            className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setZoom((value) => Math.min(3.2, Number((value + 0.15).toFixed(2))))}
            disabled={!templateImage}
            className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetPosition}
            disabled={!templateImage}
            className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFocusMode((value) => !value)}
            disabled={!templateImage}
            className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            {focusMode ? <Minimize2 className="h-4 w-4" aria-hidden="true" /> : <Maximize2 className="h-4 w-4" aria-hidden="true" />}
            {focusMode ? 'Done' : 'Focus'}
          </Button>
        </div>
      </div>

      <div className={focusMode ? 'flex min-h-0 flex-1 flex-col p-5' : 'p-5'}>
        {imageLoaded && (
          <div className="mb-4 rounded-lg border border-white/10 bg-black/20 px-4 py-3">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs text-[#9aa1b7]">
              <span>Preview size</span>
              <span className="tabular-nums text-white">{Math.round(zoom * 100)}%</span>
            </div>
            <Slider value={[zoom]} onValueChange={(value) => setZoom(value[0])} min={0.75} max={3.2} step={0.05} />
          </div>
        )}

        <div
          ref={containerRef}
          className={`relative flex items-center justify-center overflow-auto rounded-xl border border-white/10 bg-[#050711] p-4 ${
            focusMode ? 'min-h-0 flex-1' : 'min-h-[520px]'
          }`}
        >
          <div className="preview-grid" aria-hidden="true" />

          {!templateImage && (
            <div className="relative z-10 flex max-w-sm flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                <ImagePlus className="h-6 w-6 text-[#aab2ff]" aria-hidden="true" />
              </div>
              <p className="text-lg font-semibold text-white">Your certificate appears here</p>
              <p className="mt-2 text-sm leading-6 text-[#9aa1b7]">
                Upload a template to unlock live positioning, text styling, and high quality batch export.
              </p>
            </div>
          )}

          {templateImage && !imageLoaded && !imageError && (
            <div className="relative z-10 flex items-center gap-3 text-sm text-[#cdd2e3]">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#7c86ff] border-t-transparent" />
              Loading template
            </div>
          )}

          {imageError && (
            <div className="relative z-10 text-center">
              <p className="font-medium text-red-300">Failed to load image</p>
              <p className="mt-1 text-sm text-[#9aa1b7]">Try uploading the template again.</p>
            </div>
          )}

          {imageLoaded && !imageError && containerSize.width > 0 && containerSize.height > 0 && (
            <motion.div
              ref={certificateRef}
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22 }}
              className="relative z-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white shadow-2xl shadow-black/30"
              style={{
                width: `${containerSize.width}px`,
                height: `${containerSize.height}px`,
              }}
            >
              <img src={templateImage} alt="Certificate template" className="h-full w-full object-contain" />

              <div
                className={`absolute flex select-none items-center rounded-md border-2 border-[#6571ff] bg-[#6571ff]/13 backdrop-blur-[1px] ${
                  isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                style={{
                  left: `${textCenterX}px`,
                  top: `${textCenterY}px`,
                  width: `${scaledBoxWidth}px`,
                  minHeight: `${Math.max(28, scaledFontSize * 1.18)}px`,
                  transform: 'translate(-50%, -50%)',
                  fontFamily: fontSettings.family,
                  fontSize: `${scaledFontSize}px`,
                  color: fontSettings.color,
                  fontWeight: fontSettings.weight,
                  letterSpacing: `${fontSettings.letterSpacing * displayScale}px`,
                  lineHeight: 1,
                  textAlign: fontSettings.align,
                  textShadow: fontSettings.shadow ? '1px 1px 2px rgba(0,0,0,0.25)' : 'none',
                  touchAction: 'none',
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                role="button"
                aria-label="Drag name placement area"
              >
                <span className="pointer-events-none block w-full truncate px-2">{previewText}</span>
                <span className="pointer-events-none absolute -top-8 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-md bg-[#10131d] px-2 py-1 text-xs font-medium tracking-normal text-white shadow-lg">
                  <Crosshair className="h-3 w-3" aria-hidden="true" />
                  Drag
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {imageLoaded && (
          <div className="mt-4 grid gap-3 text-xs text-[#8f96aa] sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
              X position <span className="float-right tabular-nums text-white">{Math.round(position.x)}px</span>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
              Y position <span className="float-right tabular-nums text-white">{Math.round(position.y)}px</span>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
              Text width <span className="float-right tabular-nums text-white">{Math.round(textBox.width)}px</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
