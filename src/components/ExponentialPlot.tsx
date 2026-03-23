import { useDimensions } from "@/hooks/useDimensions";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

type PlotMode = "pdf" | "cdf";

interface ExponentialPlotProps {
  mode: PlotMode;
}

/** Exponential PDF: f(x) = lambda * e^(-lambda * x) */
function exponentialPdf(x: number, lambda: number): number {
  return lambda * Math.exp(-lambda * x);
}

/** Exponential CDF: F(x) = 1 - e^(-lambda * x) */
function exponentialCdf(x: number, lambda: number): number {
  return 1 - Math.exp(-lambda * x);
}

const MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };
const ASPECT_RATIO = 2.2;
const X_DOMAIN_MAX = 8;
const NUM_POINTS = 200;
const DEFAULT_LAMBDA = 0.5;
const MIN_LAMBDA = 0.1;
const MAX_LAMBDA = 3.0;
const LAMBDA_STEP = 0.1;

/**
 * Interactive plot of the exponential distribution's PDF or CDF.
 * Uses D3 for rendering with a lambda slider for exploration.
 */
export default function ExponentialPlot({ mode }: ExponentialPlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [lambda, setLambda] = useState(DEFAULT_LAMBDA);
  const { width: containerWidth } = useDimensions(containerRef);

  const width = containerWidth;
  const height = Math.round(width / ASPECT_RATIO);
  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  const fn = mode === "pdf" ? exponentialPdf : exponentialCdf;
  const yLabel = mode === "pdf" ? "f(x)" : "F(x)";

  useEffect(() => {
    if (!svgRef.current || innerWidth <= 0 || innerHeight <= 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, X_DOMAIN_MAX])
      .range([0, innerWidth]);

    const yMax = mode === "pdf" ? Math.max(lambda * 1.1, 0.5) : 1.05;
    const yScale = d3.scaleLinear().domain([0, yMax]).range([innerHeight, 0]);

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(8))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .text("x");

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(6))
      .append("text")
      .attr("x", -innerHeight / 2)
      .attr("y", -38)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text(yLabel);

    // Generate data points
    const xStep = X_DOMAIN_MAX / NUM_POINTS;
    const data = d3.range(0, X_DOMAIN_MAX + xStep, xStep).map((x) => ({
      x,
      y: fn(x, lambda),
    }));

    // Area fill
    const area = d3
      .area<{ x: number; y: number }>()
      .x((d) => xScale(d.x))
      .y0(innerHeight)
      .y1((d) => yScale(d.y));

    g.append("path")
      .datum(data)
      .attr("d", area)
      .attr("fill", "#5B9BD5")
      .attr("fill-opacity", 0.2);

    // Curve line
    const line = d3
      .line<{ x: number; y: number }>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    g.append("path")
      .datum(data)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "#5B9BD5")
      .attr("stroke-width", 2.5);
  }, [lambda, innerWidth, innerHeight, mode, fn, yLabel]);

  const lambdaDisplay = lambda.toFixed(1);
  const meanDisplay = (1 / lambda).toFixed(2);

  return (
    <div ref={containerRef}>
      <svg ref={svgRef} width={width} height={height} />
      <div className="d-flex align-items-center gap-3 mt-2 mb-3">
        <label
          htmlFor={`lambda-slider-${mode}`}
          className="form-label mb-0 fw-semibold"
        >
          &lambda; = {lambdaDisplay}
        </label>
        <input
          id={`lambda-slider-${mode}`}
          type="range"
          className="form-range flex-grow-1"
          min={MIN_LAMBDA}
          max={MAX_LAMBDA}
          step={LAMBDA_STEP}
          value={lambda}
          onChange={(e) => setLambda(parseFloat(e.target.value))}
        />
        <span className="text-secondary">mean = {meanDisplay}</span>
      </div>
    </div>
  );
}
