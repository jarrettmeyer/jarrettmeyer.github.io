import { useDimensions } from "@/hooks/useDimensions";
import { PLOT_ACCENT_COLOR, PLOT_ASPECT_RATIO } from "@/utils/plotConstants";
import * as d3 from "d3";
import { useEffect, useMemo, useRef, useState } from "react";

const MARGIN = { top: 20, right: 20, bottom: 40, left: 55 };
const OBSERVATION_WINDOW_HOURS = 8;
const OBSERVATION_WINDOW_MINUTES = 480;
const DEFAULT_LAMBDA = 3;
const MIN_LAMBDA = 0.5;
const MAX_LAMBDA = 12;
const LAMBDA_STEP = 0.5;
/** Base animation interval in milliseconds. Divided by speedMultiplier each tick. */
const PLAY_INTERVAL_MS = 10;
const STAIRCASE_COLOR = PLOT_ACCENT_COLOR;
/** Muted red for the E[N(t)] = λt expectation line and theoretical PMF overlay. */
const EXPECTED_LINE_COLOR = "#E57373";
const NOW_LINE_COLOR = "#888888";
const ARRIVAL_DOT_RADIUS = 3;

const HISTOGRAM_MARGIN = { top: 20, right: 20, bottom: 40, left: 55 };
const EMPIRICAL_BAR_OPACITY = 0.7;
const THEORETICAL_DOT_RADIUS = 3;

/**
 * Generates Poisson process arrival times using the inverse-transform method.
 * Each interarrival time T = -ln(U) / lambda follows Exp(lambda).
 * Returns arrival times in hours, stopping when the time exceeds the observation window.
 */
function generateArrivals(lambda: number): number[] {
  const arrivals: number[] = [];
  let t = 0;
  while (t <= OBSERVATION_WINDOW_HOURS) {
    const u = Math.random();
    t += -Math.log(u) / lambda;
    if (t <= OBSERVATION_WINDOW_HOURS) {
      arrivals.push(t);
    }
  }
  return arrivals;
}

/** Converts a minute count (0–480) to a human-readable "Xh Ym" string. */
function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

/**
 * Computes Poisson PMF P(X=k) for given lambda*t.
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

/** Builds the theoretical Poisson PMF array for k = 0..maxK. */
function buildTheoreticalPmf(
  lambdaT: number,
  maxK: number,
): Array<{ k: number; p: number }> {
  const data: Array<{ k: number; p: number }> = [];
  for (let k = 0; k <= maxK; k++) {
    data.push({ k, p: poissonPmf(k, lambdaT) });
  }
  return data;
}

/**
 * Interactive simulation of a Poisson process.
 *
 * Generates exponential interarrival times and visualizes the cumulative
 * counting function N(t) as a staircase plot over an 8-hour window.
 * Each completed run contributes its final N(8) to an empirical PMF histogram
 * that converges to the theoretical Poisson(λ·8) distribution over time.
 */
export default function PoissonSimulation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const histSvgRef = useRef<SVGSVGElement>(null);

  const [lambda, setLambda] = useState(DEFAULT_LAMBDA);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  /** Incrementing this value triggers re-generation of arrivals on Reset. */
  const [seed, setSeed] = useState(0);
  const [histogramCounts, setHistogramCounts] = useState<Map<number, number>>(
    new Map(),
  );
  const [completedRuns, setCompletedRuns] = useState(0);

  const { width: containerWidth } = useDimensions(containerRef);
  // Each chart gets half the container width, minus half the gap-3 (16px).
  const halfWidth = Math.max(0, Math.floor((containerWidth - 16) / 2));
  // Both charts share the same height so their x-axes stay aligned.
  const sharedHeight = Math.round(halfWidth / PLOT_ASPECT_RATIO);

  const width = halfWidth;
  const height = sharedHeight;
  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  const histWidth = halfWidth;
  const histHeight = sharedHeight;
  const histInnerWidth =
    histWidth - HISTOGRAM_MARGIN.left - HISTOGRAM_MARGIN.right;
  const histInnerHeight =
    histHeight - HISTOGRAM_MARGIN.top - HISTOGRAM_MARGIN.bottom;

  // Pre-generate all arrivals for this realization. Regenerates when lambda
  // changes or Reset is pressed (via seed increment).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const arrivals = useMemo(() => generateArrivals(lambda), [lambda, seed]);

  // Keep a ref so the animation interval can read arrivals without a stale closure.
  const arrivalsRef = useRef(arrivals);
  arrivalsRef.current = arrivals;

  // Changing lambda resets the playhead and clears the histogram.
  useEffect(() => {
    setCurrentMinute(0);
    setIsPlaying(false);
    setHistogramCounts(new Map());
    setCompletedRuns(0);
  }, [lambda]);

  // Animation loop: advance one minute per tick. On completion, record N(8) and restart.
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentMinute((prev) => {
        const next = prev + 1;
        if (next >= OBSERVATION_WINDOW_MINUTES) {
          const finalCount = arrivalsRef.current.length;
          setHistogramCounts((prevCounts) => {
            const updated = new Map(prevCounts);
            updated.set(finalCount, (updated.get(finalCount) ?? 0) + 1);
            return updated;
          });
          setCompletedRuns((r) => r + 1);
          setSeed((s) => s + 1);
          return 0;
        }
        return next;
      });
    }, PLAY_INTERVAL_MS / speedMultiplier);

    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier]);

  const currentTimeHours = currentMinute / 60;
  const visibleArrivals = arrivals.filter((t) => t <= currentTimeHours);

  // Y-axis max is fixed to the full arrivals array so the axis does not
  // rescale during playback, which would be visually distracting.
  const yAxisMax = Math.max(
    arrivals.length * 1.1,
    lambda * OBSERVATION_WINDOW_HOURS * 1.3,
    10,
  );

  const lambdaT = lambda * OBSERVATION_WINDOW_HOURS;

  const histogramData = useMemo(() => {
    return Array.from(histogramCounts.entries())
      .map(([k, count]) => ({ k, count, frequency: count / completedRuns }))
      .sort((a, b) => a.k - b.k);
  }, [histogramCounts, completedRuns]);

  const histogramXDomain = useMemo(() => {
    const sigma = Math.sqrt(lambdaT);
    const theoreticalMin = Math.max(0, Math.floor(lambdaT - 3 * sigma));
    const theoreticalMax = Math.ceil(lambdaT + 3 * sigma);
    if (histogramData.length === 0) {
      return { min: theoreticalMin, max: theoreticalMax };
    }
    return {
      min: Math.min(histogramData[0].k, theoreticalMin),
      max: Math.max(histogramData[histogramData.length - 1].k, theoreticalMax),
    };
  }, [histogramData, lambdaT]);

  const empiricalMean = useMemo(() => {
    if (completedRuns === 0) return 0;
    let sum = 0;
    for (const [k, count] of histogramCounts) {
      sum += k * count;
    }
    return sum / completedRuns;
  }, [histogramCounts, completedRuns]);

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
      .domain([0, OBSERVATION_WINDOW_HOURS])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, yAxisMax])
      .range([innerHeight, 0]);

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(OBSERVATION_WINDOW_HOURS))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .text("Time (hours)");

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(6))
      .append("text")
      .attr("x", -innerHeight / 2)
      .attr("y", -42)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Arrivals N(t)");

    // Expected value line: E[N(t)] = λt, drawn up to currentTimeHours
    if (currentTimeHours > 0) {
      const expectedData = [
        { t: 0, n: 0 },
        { t: currentTimeHours, n: lambda * currentTimeHours },
      ];
      const expectedLine = d3
        .line<{ t: number; n: number }>()
        .x((d) => xScale(d.t))
        .y((d) => yScale(d.n));

      g.append("path")
        .datum(expectedData)
        .attr("d", expectedLine)
        .attr("fill", "none")
        .attr("stroke", EXPECTED_LINE_COLOR)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "5,4");
    }

    // Staircase path: N(t) counting function
    if (visibleArrivals.length > 0) {
      const staircaseData: Array<{ t: number; n: number }> = [
        { t: 0, n: 0 },
        ...visibleArrivals.map((t, i) => ({ t, n: i + 1 })),
        { t: currentTimeHours, n: visibleArrivals.length },
      ];

      const staircaseLine = d3
        .line<{ t: number; n: number }>()
        .x((d) => xScale(d.t))
        .y((d) => yScale(d.n))
        .curve(d3.curveStepAfter);

      g.append("path")
        .datum(staircaseData)
        .attr("d", staircaseLine)
        .attr("fill", "none")
        .attr("stroke", STAIRCASE_COLOR)
        .attr("stroke-width", 2.5);

      // Dots at each arrival point
      g.selectAll("circle")
        .data(visibleArrivals)
        .join("circle")
        .attr("cx", (t) => xScale(t))
        .attr("cy", (_, i) => yScale(i + 1))
        .attr("r", ARRIVAL_DOT_RADIUS)
        .attr("fill", STAIRCASE_COLOR);
    } else {
      // Before any arrivals, draw a flat line from origin to current time
      const flatData = [
        { t: 0, n: 0 },
        { t: currentTimeHours, n: 0 },
      ];
      const flatLine = d3
        .line<{ t: number; n: number }>()
        .x((d) => xScale(d.t))
        .y((d) => yScale(d.n));

      g.append("path")
        .datum(flatData)
        .attr("d", flatLine)
        .attr("fill", "none")
        .attr("stroke", STAIRCASE_COLOR)
        .attr("stroke-width", 2.5);
    }

    // "Now" line — vertical dashed line at current time
    if (currentTimeHours > 0) {
      g.append("line")
        .attr("x1", xScale(currentTimeHours))
        .attr("x2", xScale(currentTimeHours))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", NOW_LINE_COLOR)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3");
    }
  }, [
    visibleArrivals,
    currentTimeHours,
    innerWidth,
    innerHeight,
    lambda,
    yAxisMax,
  ]);

  // Histogram: empirical PMF built from completed runs.
  useEffect(() => {
    if (!histSvgRef.current || histInnerWidth <= 0 || histInnerHeight <= 0)
      return;

    const svg = d3.select(histSvgRef.current);
    svg.selectAll("*").remove();

    if (completedRuns === 0) {
      // Draw empty axes so the chart area isn't blank before the first run.
      const g = svg
        .append("g")
        .attr(
          "transform",
          `translate(${HISTOGRAM_MARGIN.left},${HISTOGRAM_MARGIN.top})`,
        );

      const kValues = d3.range(histogramXDomain.min, histogramXDomain.max + 1);
      const xScale = d3
        .scaleBand()
        .domain(kValues.map(String))
        .range([0, histInnerWidth])
        .padding(0.1);
      const yScale = d3
        .scaleLinear()
        .domain([0, 1])
        .range([histInnerHeight, 0]);

      const tickInterval =
        kValues.length > 30 ? 5 : kValues.length > 15 ? 2 : 1;
      g.append("g")
        .attr("transform", `translate(0,${histInnerHeight})`)
        .call(
          d3
            .axisBottom(xScale)
            .tickValues(
              kValues.filter((k) => k % tickInterval === 0).map(String),
            ),
        )
        .append("text")
        .attr("x", histInnerWidth / 2)
        .attr("y", 35)
        .attr("fill", "currentColor")
        .attr("text-anchor", "middle")
        .text("N(8)");

      g.append("g")
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format(".3f")))
        .append("text")
        .attr("x", -histInnerHeight / 2)
        .attr("y", -42)
        .attr("fill", "currentColor")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Relative Frequency");

      return;
    }

    const g = svg
      .append("g")
      .attr(
        "transform",
        `translate(${HISTOGRAM_MARGIN.left},${HISTOGRAM_MARGIN.top})`,
      );

    const kValues = d3.range(histogramXDomain.min, histogramXDomain.max + 1);

    const xScale = d3
      .scaleBand()
      .domain(kValues.map(String))
      .range([0, histInnerWidth])
      .padding(0.1);

    const theoreticalPmf = buildTheoreticalPmf(lambdaT, histogramXDomain.max);
    const empiricalMax = d3.max(histogramData, (d) => d.frequency) ?? 0;
    const theoreticalMax = d3.max(theoreticalPmf, (d) => d.p) ?? 0;
    const yMax = Math.max(empiricalMax, theoreticalMax) * 1.1;

    const yScale = d3
      .scaleLinear()
      .domain([0, yMax])
      .range([histInnerHeight, 0]);

    // Thin x-axis labels when there are many k values
    const tickInterval = kValues.length > 30 ? 5 : kValues.length > 15 ? 2 : 1;

    g.append("g")
      .attr("transform", `translate(0,${histInnerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues(
            kValues.filter((k) => k % tickInterval === 0).map(String),
          ),
      )
      .append("text")
      .attr("x", histInnerWidth / 2)
      .attr("y", 35)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .text("N(8)");

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format(".3f")))
      .append("text")
      .attr("x", -histInnerHeight / 2)
      .attr("y", -42)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Relative Frequency");

    // Empirical bars
    g.selectAll("rect.empirical")
      .data(histogramData)
      .join("rect")
      .attr("class", "empirical")
      .attr("x", (d) => xScale(String(d.k)) ?? 0)
      .attr("y", (d) => yScale(d.frequency))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => histInnerHeight - yScale(d.frequency))
      .attr("fill", PLOT_ACCENT_COLOR)
      .attr("fill-opacity", EMPIRICAL_BAR_OPACITY)
      .attr("stroke", PLOT_ACCENT_COLOR)
      .attr("stroke-width", 1);

    // Theoretical PMF overlay: dots connected by a line
    const theoreticalFiltered = theoreticalPmf.filter(
      (d) => d.k >= histogramXDomain.min && d.k <= histogramXDomain.max,
    );

    const pmfLine = d3
      .line<{ k: number; p: number }>()
      .x((d) => (xScale(String(d.k)) ?? 0) + xScale.bandwidth() / 2)
      .y((d) => yScale(d.p));

    g.append("path")
      .datum(theoreticalFiltered)
      .attr("d", pmfLine)
      .attr("fill", "none")
      .attr("stroke", EXPECTED_LINE_COLOR)
      .attr("stroke-width", 2);

    g.selectAll("circle.theoretical")
      .data(theoreticalFiltered)
      .join("circle")
      .attr("class", "theoretical")
      .attr("cx", (d) => (xScale(String(d.k)) ?? 0) + xScale.bandwidth() / 2)
      .attr("cy", (d) => yScale(d.p))
      .attr("r", THEORETICAL_DOT_RADIUS)
      .attr("fill", EXPECTED_LINE_COLOR);
  }, [
    histogramData,
    histInnerWidth,
    histInnerHeight,
    completedRuns,
    lambdaT,
    histogramXDomain,
  ]);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (next && currentMinute >= OBSERVATION_WINDOW_MINUTES) {
        setCurrentMinute(0);
      }
      return next;
    });
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentMinute(0);
    setSeed((s) => s + 1);
    setHistogramCounts(new Map());
    setCompletedRuns(0);
  };

  const expectedAtCurrentTime = (lambda * currentTimeHours).toFixed(1);

  return (
    <div ref={containerRef}>
      <div className="d-flex gap-3 align-items-start">
        <div>
          <svg ref={svgRef} width={width} height={height} />
          <div className="d-flex justify-content-between mt-2 text-secondary">
            <span>Time: {formatTime(currentMinute)}</span>
            <span>Arrivals: {visibleArrivals.length}</span>
            <span>Expected: {expectedAtCurrentTime}</span>
          </div>
        </div>

        <div>
          <svg ref={histSvgRef} width={histWidth} height={histHeight} />
          {completedRuns > 0 && (
            <div className="d-flex justify-content-between mt-2 text-secondary">
              <span>Runs: {completedRuns}</span>
              <span>Empirical mean: {empiricalMean.toFixed(2)}</span>
              <span>Theoretical: {lambdaT.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-secondary rounded p-3 mt-3">
        <div className="d-flex justify-content-between">
          <div>0:00</div>
          <div>8:00</div>
        </div>
        <div className="mb-3">
          <input
            type="range"
            className="form-range"
            min={0}
            max={OBSERVATION_WINDOW_MINUTES}
            value={currentMinute}
            onChange={(e) => setCurrentMinute(Number(e.target.value))}
          />
        </div>

        <div className="d-flex justify-content-between gap-2">
          <button
            className={`btn ${isPlaying ? "btn-danger" : "btn-success"}`}
            onClick={handleTogglePlay}
            title={isPlaying ? "Pause" : "Play"}
          >
            <i
              className={`bi ${isPlaying ? "bi-pause-fill" : "bi-play-fill"}`}
            />
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={handleReset}
            title="Reset"
          >
            <i className="bi bi-arrow-counterclockwise" />
          </button>
          <select
            className="form-select"
            value={speedMultiplier}
            onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
          >
            {[1, 5, 10, 20, 50].map((s) => (
              <option key={s} value={s}>
                {s}x
              </option>
            ))}
          </select>
        </div>

        <div className="d-flex align-items-center gap-3 mt-3">
          <label
            htmlFor="lambda-sim-slider"
            className="form-label mb-0 fw-semibold"
          >
            &lambda; = {lambda}/hr
          </label>
          <input
            id="lambda-sim-slider"
            type="range"
            className="form-range flex-grow-1"
            min={MIN_LAMBDA}
            max={MAX_LAMBDA}
            step={LAMBDA_STEP}
            value={lambda}
            onChange={(e) => setLambda(parseFloat(e.target.value))}
          />
          <span className="text-secondary">
            expected = {(lambda * OBSERVATION_WINDOW_HOURS).toFixed(0)} arrivals
          </span>
        </div>
      </div>
    </div>
  );
}
