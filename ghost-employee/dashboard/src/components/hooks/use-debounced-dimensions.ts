import { useState, useEffect, RefObject } from 'react';

interface Dimensions {
  width: number;
  height: number;
}

export function useDimensions(ref: RefObject<HTMLElement | SVGElement>): Dimensions {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Immediately measure if possible
    const initialRect = element.getBoundingClientRect();
    if (initialRect.width > 0 && initialRect.height > 0) {
      setDimensions({ width: initialRect.width, height: initialRect.height });
    }

    // Use ResizeObserver to track layouts immediately and on any screen change
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [ref]);

  return dimensions;
}
