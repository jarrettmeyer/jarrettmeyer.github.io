import { useDimensions } from "@/hooks/useDimensions";
import { useFetch } from "@/hooks/useFetch";
import * as d3 from "d3";
import { useEffect, useRef } from "react";
import * as topojson from "topojson-client";

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
  min?: number;
  max?: number;
  formatter?: (value: number) => string;
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
  min,
  max,
  formatter = (value) => value.toString(),
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const legendGradientId = useRef(
    `legend-gradient-${Math.random().toString(36).slice(2)}`
  ).current;
  const { data: topoData, error: fetchError } = useFetch(
    `/data/world-atlas@2.0.2/${mapType}.json`
  );
  const { width } = useDimensions(containerRef);

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
  const minValue = min !== undefined ? min : Math.min(...values);
  const maxValue = max !== undefined ? max : Math.max(...values);
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

  if (!topoData || width === 0 /* containerWidth === 0 */) {
    return (
      <div ref={containerRef} className="placeholder bg-primary">
        Loading map...
      </div>
    );
  }

  if (fetchError) {
    return (
      <div ref={containerRef} className="">
        Error loading map: {fetchError.message}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-100">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid meet"
        className="pb-2"
      />
      <svg width={width} height={50}>
        <defs>
          <linearGradient
            id={legendGradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            {Array.from({ length: 101 }, (_, i) => {
              const t = i / 100;
              const color = getColorScaleFunction(colorScale)(t);
              return <stop key={i} offset={`${t * 100}%`} stopColor={color} />;
            })}
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={width} height={50} fill={backgroundColor} />
        <text x="20" y="20" textAnchor="start">
          {formatter(minValue)}
        </text>
        <text x={width - 20} y="20" textAnchor="end">
          {formatter(maxValue)}
        </text>
        <rect
          x={20}
          y={25}
          width={width - 40}
          height={20}
          fill={`url(#${legendGradientId})`}
        />
      </svg>
    </div>
  );
}
