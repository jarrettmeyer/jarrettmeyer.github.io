import { useEffect, useState, type RefObject } from "react";

export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Hook that observes an element's dimensions and returns width and height.
 * Updates whenever the element is resized.
 *
 * @param ref - React ref to the element to observe
 * @returns Object with width and height properties
 */
export function useDimensions(ref: RefObject<HTMLElement | null>): Dimensions {
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (!ref.current) return;

    // Set initial dimensions
    const updateDimensions = () => {
      if (ref.current) {
        setDimensions({
          width: ref.current.clientWidth,
          height: ref.current.clientHeight,
        });
      }
    };

    updateDimensions();

    // Create ResizeObserver to track dimension changes
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return dimensions;
}
