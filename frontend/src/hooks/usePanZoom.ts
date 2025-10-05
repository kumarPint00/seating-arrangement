import { useEffect, useRef, useState } from 'react';

interface PanZoomConfig {
  minZoom: number;
  maxZoom: number;
  enabled: boolean;
}

interface PanZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

export const usePanZoom = (config: PanZoomConfig) => {
  const elementRef = useRef<SVGSVGElement>(null);
  const [state, setState] = useState<PanZoomState>({
    scale: 1,
    translateX: 0,
    translateY: 0
  });

  const [isPanning, setIsPanning] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [startTranslate, setStartTranslate] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !config.enabled) return;

    let lastTouchDistance = 0;
    let lastScale = 1;

    // Touch events for mobile
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      
      if (e.touches.length === 1) {
        // Single touch - start panning
        const touch = e.touches[0];
        if (touch) {
          setIsPanning(true);
          setStartPoint({ x: touch.clientX, y: touch.clientY });
          setStartTranslate({ x: state.translateX, y: state.translateY });
        }
      } else if (e.touches.length === 2) {
        // Two touches - start zooming
        setIsPanning(false);
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        if (touch1 && touch2) {
          const distance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
          );
          lastTouchDistance = distance;
          lastScale = state.scale;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      
      if (e.touches.length === 1 && isPanning) {
        // Panning
        const touch = e.touches[0];
        if (touch) {
          const deltaX = touch.clientX - startPoint.x;
          const deltaY = touch.clientY - startPoint.y;
          
          setState(prev => ({
            ...prev,
            translateX: startTranslate.x + deltaX,
            translateY: startTranslate.y + deltaY
          }));
        }
      } else if (e.touches.length === 2) {
        // Pinch zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        if (touch1 && touch2) {
          const distance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
          );
          
          const scale = Math.max(
            config.minZoom,
            Math.min(config.maxZoom, lastScale * (distance / lastTouchDistance))
          );
          
          setState(prev => ({ ...prev, scale }));
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      setIsPanning(false);
    };

    // Mouse events for desktop
    const handleWheel = (e: WheelEvent) => {
      if (!config.enabled) return;
      e.preventDefault();
      
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(
        config.minZoom,
        Math.min(config.maxZoom, state.scale * delta)
      );
      
      setState(prev => ({ ...prev, scale: newScale }));
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('wheel', handleWheel);
    };
  }, [config, isPanning, startPoint, startTranslate, state.translateX, state.translateY, state.scale]);

  const resetZoom = () => {
    setState({ scale: 1, translateX: 0, translateY: 0 });
  };

  const zoomIn = () => {
    setState(prev => ({
      ...prev,
      scale: Math.min(config.maxZoom, prev.scale * 1.2)
    }));
  };

  const zoomOut = () => {
    setState(prev => ({
      ...prev,
      scale: Math.max(config.minZoom, prev.scale * 0.8)
    }));
  };

  return {
    elementRef,
    transform: `scale(${state.scale}) translate(${state.translateX}px, ${state.translateY}px)`,
    scale: state.scale,
    resetZoom,
    zoomIn,
    zoomOut
  };
};