import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, Move } from 'lucide-react';
import { FontSettings } from '@/lib/certificateGenerator';

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
  onPositionChange: (position: Position) => void;
}

export default function CertificatePreview({
  templateImage,
  templateWidth,
  templateHeight,
  fontSettings,
  position,
  onPositionChange
}: CertificatePreviewProps) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const textBoxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (templateImage) {
      setImageLoaded(false);
      setImageError(false);
      
      const img = new Image();
      img.onload = () => {
        console.log('Image loaded successfully:', { width: img.naturalWidth, height: img.naturalHeight });
        setImageLoaded(true);
        setImageError(false);
        setTimeout(updateSize, 100);
      };
      img.onerror = (error) => {
        console.error('Failed to load template image:', error);
        setImageError(true);
        setImageLoaded(false);
      };
      img.src = templateImage;
    } else {
      setImageLoaded(false);
      setImageError(false);
    }
  }, [templateImage]);

  const updateSize = useCallback(() => {
    if (containerRef.current && templateWidth > 0 && templateHeight > 0) {
      const container = containerRef.current;
      const containerWidth = container.clientWidth - 40;
      const containerHeight = 350;
      
      const scaleX = containerWidth / templateWidth;
      const scaleY = containerHeight / templateHeight;
      const newScale = Math.min(scaleX, scaleY, 0.8);
      
      const scaledWidth = templateWidth * newScale;
      const scaledHeight = templateHeight * newScale;
      
      setScale(newScale);
      setContainerSize({
        width: scaledWidth,
        height: scaledHeight
      });
    }
  }, [templateWidth, templateHeight]);

  useEffect(() => {
    if (imageLoaded && templateWidth > 0 && templateHeight > 0) {
      updateSize();
    }
  }, [templateWidth, templateHeight, imageLoaded, updateSize]);

  useEffect(() => {
    const handleResize = () => {
      if (imageLoaded) {
        setTimeout(updateSize, 100);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageLoaded, updateSize]);

  const resetPosition = () => {
    onPositionChange({ 
      x: templateWidth / 2, 
      y: templateHeight / 2 
    });
  };

  // Custom drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setDragOffset({
        x: (position.x * scale) - 100,
        y: (position.y * scale) - 20
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;
    
    const newX = dragOffset.x + deltaX;
    const newY = dragOffset.y + deltaY;
    
    // Convert back to template coordinates
    const templateX = (newX + 100) / scale;
    const templateY = (newY + 20) / scale;
    
    // Constrain to bounds
    const constrainedX = Math.max(50, Math.min(templateX, templateWidth - 50));
    const constrainedY = Math.max(20, Math.min(templateY, templateHeight - 20));
    
    onPositionChange({ x: constrainedX, y: constrainedY });
  }, [isDragging, dragStart, dragOffset, scale, templateWidth, templateHeight, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!templateImage) {
    return (
      <Card style={{ backgroundColor: '#1e2a3b' }} className="border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Move className="w-5 h-5" />
            Certificate Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-white/30 rounded-lg">
            <p className="text-blue-100">Upload a certificate template to see preview</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={{ backgroundColor: '#1e2a3b' }} className="border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Move className="w-5 h-5" />
            Certificate Preview
          </div>
          <Button variant="outline" size="sm" onClick={resetPosition} className="border-white/30 text-white hover:bg-white/10">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Position
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={containerRef}
          className="relative border rounded-lg overflow-hidden flex items-center justify-center p-4 border-white/30"
          style={{ height: '400px', minHeight: '400px', backgroundColor: '#0f182a' }}
        >
          {!imageLoaded && !imageError && templateImage && (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="ml-3 text-blue-100">Loading template...</p>
            </div>
          )}
          
          {imageError && (
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-red-400 mb-2">Failed to load image</p>
              <p className="text-sm text-blue-100">Please try uploading the image again</p>
            </div>
          )}
          
          {imageLoaded && !imageError && containerSize.width > 0 && containerSize.height > 0 && (
            <div 
              className="relative bg-white shadow-lg border"
              style={{
                width: `${containerSize.width}px`,
                height: `${containerSize.height}px`,
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            >
              <img
                src={templateImage}
                alt="Certificate template"
                className="w-full h-full object-contain"
                style={{
                  width: `${containerSize.width}px`,
                  height: `${containerSize.height}px`,
                  display: 'block'
                }}
              />
              
              {scale > 0 && (
                <div
                  ref={textBoxRef}
                  className={`absolute border-2 border-blue-500 bg-blue-500/20 rounded px-4 py-2 min-w-[200px] text-center select-none z-10 ${
                    isDragging ? 'cursor-grabbing' : 'cursor-grab'
                  }`}
                  style={{
                    left: `${Math.max(0, Math.min((position.x * scale) - 100, containerSize.width - 200))}px`,
                    top: `${Math.max(0, Math.min((position.y * scale) - 20, containerSize.height - 40))}px`,
                    fontFamily: fontSettings.family,
                    fontSize: `${Math.min(fontSettings.size * scale, 24)}px`,
                    color: fontSettings.color,
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                    maxWidth: `${containerSize.width - 20}px`
                  }}
                  onMouseDown={handleMouseDown}
                >
                  Sample Name
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                    Drag to position
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {imageLoaded && (
          <div className="mt-2 text-xs text-blue-100 text-center">
            Template: {templateWidth} × {templateHeight}px | Scale: {Math.round(scale * 100)}%
          </div>
        )}
        
        <p className="text-sm text-blue-100 mt-2 text-center">
          Drag the blue rectangle to position where names should appear on certificates
        </p>
      </CardContent>
    </Card>
  );
}