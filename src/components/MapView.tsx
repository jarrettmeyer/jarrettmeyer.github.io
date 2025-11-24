import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { useFetch } from "@/utils/hooks/useFetch";

export type MapType =
  | "countries-10m"
  | "countries-50m"
  | "countries-110m"
  | "land-10m"
  | "land-50m"
  | "land-110m";

interface DataPoint {
  name: string;
  value: number;
}

export type ProjectionType =
  | "natural"
  | "mercator"
  | "equirectangular"
  | "stereographic";

export type MapViewProps = {
  data: DataPoint[];
  colorScale?: "viridis" | "plasma" | "cool" | "warm" | "turbo";
  backgroundColor?: string;
  borderColor?: string;
  fillColor?: string;
  mapType?: MapType;
  projection?: ProjectionType;
  onHover?: (name: string | null, value: number | null) => void;
};

export function MapView({
  data,
  colorScale = "viridis",
  backgroundColor = "white",
  borderColor = "#999",
  fillColor = "#eee",
  mapType = "countries-50m",
  projection = "natural",
  onHover,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const { data: topoData, error: fetchError } = useFetch(
    `/data/world-atlas@2.0.2/${mapType}.json`
  );

  // Measure container using ResizeObserver on the ref itself
  useEffect(() => {
    if (!containerRef.current) return;

    const checkWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        if (width > 0) {
          setContainerWidth(width);
        }
      }
    };

    const resizeObserver = new ResizeObserver(checkWidth);
    resizeObserver.observe(containerRef.current);

    // Schedule checks for initial width (ResizeObserver may not fire on first layout)
    const timeoutId = setTimeout(checkWidth, 0);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, []);

  // Calculate aspect ratio from TopoJSON bbox
  const getAspectRatio = (topology: any): number => {
    if (topology && topology.bbox) {
      const [minX, minY, maxX, maxY] = topology.bbox;
      const width = maxX - minX;
      const height = maxY - minY;
      return width / height;
    }
    return 2.0; // Fallback to typical world map ratio
  };

  // Calculate dimensions based on container width and aspect ratio
  const aspectRatio = getAspectRatio(topoData);
  const width = containerWidth;
  const height = Math.round(width / aspectRatio);

  // Determine which feature key to use based on mapType
  const getFeatureKey = (type: MapType): string => {
    if (type.startsWith("countries")) {
      return "countries";
    }
    return "land";
  };

  // Create a map of data by name for quick lookup
  const dataMap = new Map(data.map((d) => [d.name.toLowerCase(), d.value]));

  // Find min and max values for color scale
  const values = data.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  // Get the color scale function
  const getColorScaleFunction = (scale: string): ((t: number) => string) => {
    switch (scale) {
      case "plasma":
        return d3.interpolatePlasma;
      case "cool":
        return d3.interpolateCool;
      case "warm":
        return d3.interpolateWarm;
      case "turbo":
        return d3.interpolateTurbo;
      default:
        return d3.interpolateViridis;
    }
  };

  // Get the projection function
  const getProjectionFunction = (
    proj: ProjectionType
  ): (() => d3.GeoProjection) => {
    switch (proj) {
      case "mercator":
        return d3.geoMercator;
      case "equirectangular":
        return d3.geoEquirectangular;
      case "stereographic":
        return d3.geoStereographic;
      default:
        return d3.geoNaturalEarth1;
    }
  };

  // Render map
  useEffect(() => {
    if (!svgRef.current || !topoData) return;

    const featureKey = getFeatureKey(mapType);
    const features = (
      topojson.feature(topoData, topoData.objects[featureKey]) as any
    ).features as any[];

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    // Create projection and path generator
    const colorScaleFunc = getColorScaleFunction(colorScale);
    const projectionFunc = getProjectionFunction(projection);
    const proj = projectionFunc().fitSize([width, height], { type: "Sphere" });
    const pathGenerator = d3.geoPath().projection(proj);

    // Draw background
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", backgroundColor);

    // Draw features (countries or land)
    svg
      .selectAll("path")
      .data(features)
      .join("path")
      .attr("d", pathGenerator as any)
      .attr("fill", (d: any) => {
        const name = d.properties?.name || "";
        const value = dataMap.get(name.toLowerCase());
        if (value !== undefined) {
          const normalized = (value - minValue) / valueRange;
          return colorScaleFunc(normalized);
        }
        return fillColor; // Default color for countries without data
      })
      .attr("stroke", borderColor)
      .attr("stroke-width", 0.5)
      .attr("cursor", "pointer")
      .on("mouseenter", (event: any, d: any) => {
        const name = d.properties?.name || "";
        const value = dataMap.get(name.toLowerCase());
        if (onHover && value !== undefined) {
          onHover(name, value);
        }
      })
      .on("mouseleave", () => {
        if (onHover) {
          onHover(null, null);
        }
      });
  }, [
    topoData,
    data,
    dataMap,
    colorScale,
    backgroundColor,
    borderColor,
    mapType,
    width,
    height,
    projection,
    onHover,
  ]);

  if (!topoData || containerWidth === 0) {
    return <div ref={containerRef} className="placeholder bg-primary">Loading map...</div>;
  }

  if (fetchError) {
    return <div ref={containerRef} className="">Error loading map: {fetchError.message}</div>;
  }

  return (
    <div ref={containerRef} className="w-100" style={{ height: `${height}px` }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
}
