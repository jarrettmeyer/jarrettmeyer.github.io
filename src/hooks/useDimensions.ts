import { useEffect, useState, type RefObject } from "react";

export interface Dimensions {
  width: number;
  height: number;
}

/**
 * client = inner
 * offset = inner + padding + borders + scroll bars
 * scroll = inner + padding + borders + scroll bars + excess
 */
type Measure = "client" | "offset" | "scroll";

/**
 * Hook that observes an element's dimensions and returns width and height.
 * Updates whenever the element is resized.
 *
 * @param ref - React ref to the element to observe
 * @param measure - Which measure to use (default: "offset")
 * @returns Object with width and height properties
 */
export function useDimensions(
  ref: RefObject<HTMLElement | null>,
  measure: Measure = "offset"
): Dimensions {
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (!ref.current) return;

    // Set initial dimensions
    const updateDimensions = () => {
      if (ref.current) {
        let _width = ref.current.offsetWidth;
        let _height = ref.current.offsetHeight;

        if (measure === "client") {
          _width = ref.current.clientWidth;
          _height = ref.current.clientHeight;
        } else if (measure === "scroll") {
          _width = ref.current.scrollWidth;
          _height = ref.current.scrollHeight;
        }

        setDimensions({
          width: _width,
          height: _height,
        });
      }
    };

    // Call updateDimensions to set initial values.
    updateDimensions();

    // Create ResizeObserver to track dimension changes
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref, measure]);

  return dimensions;
}
