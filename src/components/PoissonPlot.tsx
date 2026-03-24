import { useDimensions } from "@/hooks/useDimensions";
import { PLOT_ACCENT_COLOR, PLOT_ASPECT_RATIO } from "@/utils/plotConstants";
import * as d3 from "d3";
import { useEffect, useMemo, useRef, useState } from "react";

const MARGIN = { top: 20, right: 20, bottom: 40, left: 55 };
const DEFAULT_LAMBDA_T = 5;
const MIN_LAMBDA_T = 1;
const MAX_LAMBDA_T = 40;
const LAMBDA_T_STEP = 1;
// Fill and stroke intentionally use the same series color.
const SERIES_COLOR = PLOT_ACCENT_COLOR;
const BAR_OPACITY = 0.7;

/**
 * Poisson PMF: P(X = k) = (lambdaT^k * e^(-lambdaT)) / k!
 *
 * Computed in log space to avoid floating-point overflow for large k.
 */
function poissonPmf(k: number, lambdaT: number): number {
  if (k === 0) return Math.exp(-lambdaT);
  let logP = k * Math.log(lambdaT) - lambdaT;
  for (let i = 1; i <= k; i++) {
    logP -= Math.log(i);
  }
  return Math.exp(logP);
}

/**
 * Builds the full PMF data array in a single pass, stopping once the
 * cumulative probability exceeds 0.999. Avoids recomputing PMF values
 * that computeMaxK would otherwise discard.
 */
function buildPmfData(lambdaT: number): Array<{ k: number; p: number }> {
  const data: Array<{ k: number; p: number }> = [];
  let cumulative = 0;
  let k = 0;
  while (cumulative < 0.999999 && k < 200) {
    const p = poissonPmf(k, lambdaT);
    data.push({ k, p });
    cumulative += p;
    k++;
  }
  return data;
}

/**
 * Interactive bar chart of the Poisson PMF P(X = k) for a given λt.
 * Uses a slider to explore how λt shapes the distribution.
 */
export default function PoissonPlot() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [lambdaT, setLambdaT] = useState(DEFAULT_LAMBDA_T);
  const { width: containerWidth } = useDimensions(containerRef);

  const width = containerWidth;
  const height = Math.round(width / PLOT_ASPECT_RATIO);
  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  // Recompute only when lambdaT changes, not on every resize.
  const data = useMemo(() => buildPmfData(lambdaT), [lambdaT]);

  useEffect(() => {
    if (!svgRef.current || innerWidth <= 0 || innerHeight <= 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => String(d.k)))
      .range([0, innerWidth])
      .padding(0.1);

    const yMax = d3.max(data, (d) => d.p) ?? 0.5;
    const yScale = d3
      .scaleLinear()
      .domain([0, yMax * 1.1])
      .range([innerHeight, 0]);

    // X axis — thin out ticks to avoid label crowding
    const maxK = data.length - 1;
    const tickInterval = maxK > 30 ? 5 : maxK > 15 ? 2 : 1;
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues(
            data
              .filter((d) => d.k % tickInterval === 0)
              .map((d) => String(d.k)),
          ),
      )
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .text("k");

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(6).tickFormat(d3.format(".3f")))
      .append("text")
      .attr("x", -innerHeight / 2)
      .attr("y", -42)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("P(X = k)");

    // Bars
    g.selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => xScale(String(d.k)) ?? 0)
      .attr("y", (d) => yScale(d.p))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => innerHeight - yScale(d.p))
      .attr("fill", SERIES_COLOR)
      .attr("fill-opacity", BAR_OPACITY)
      .attr("stroke", SERIES_COLOR)
      .attr("stroke-width", 1);
  }, [data, innerWidth, innerHeight]);

  return (
    <div ref={containerRef}>
      <svg ref={svgRef} width={width} height={height} />
      <div className="d-flex align-items-center gap-3 mt-2 mb-3">
        <label
          htmlFor="lambda-t-slider"
          className="form-label mb-0 fw-semibold text-nowrap"
        >
          &mu; = &lambda;t = {lambdaT}
        </label>
        <input
          id="lambda-t-slider"
          type="range"
          className="form-range flex-grow-1"
          min={MIN_LAMBDA_T}
          max={MAX_LAMBDA_T}
          step={LAMBDA_T_STEP}
          value={lambdaT}
          onChange={(e) => setLambdaT(parseInt(e.target.value, 10))}
        />
        <span className="text-secondary text-nowrap">
          mean = {lambdaT}, variance = {lambdaT}
        </span>
      </div>
    </div>
  );
}
