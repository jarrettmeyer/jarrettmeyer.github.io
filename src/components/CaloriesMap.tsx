import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

interface CalorieData {
  [country: string]: {
    [year: number]: number;
  };
}

interface CountryFeature {
  type: string;
  properties: {
    name: string;
  };
  geometry: any;
  id?: string;
}

// Maps CSV country names to JSON country names to handle naming convention differences
const countryAliases: { [key: string]: string } = {
  "Antigua and Barbuda": "Antigua and Barb.",
  "Bosnia and Herzegovina": "Bosnia and Herz.",
  "Cape Verde": "Cabo Verde",
  "Central African Republic": "Central African Rep.",
  "Cote d'Ivoire": "Côte d'Ivoire",
  "Democratic Republic of Congo": "Dem. Rep. Congo",
  "Dominican Republic": "Dominican Rep.",
  "East Timor": "Timor-Leste",
  "Eswatini": "eSwatini",
  "French Polynesia": "Fr. Polynesia",
  "Marshall Islands": "Marshall Is.",
  "Micronesia (country)": "Micronesia",
  "North Macedonia": "Macedonia",
  "Saint Kitts and Nevis": "St. Kitts and Nevis",
  "Saint Vincent and the Grenadines": "St. Vin. and Gren.",
  "Sao Tome and Principe": "São Tomé and Principe",
  "Solomon Islands": "Solomon Is.",
  "South Sudan": "S. Sudan",
  "United States": "United States of America",
};

const getCountryDataName = (csvCountryName: string): string => {
  return countryAliases[csvCountryName] || csvCountryName;
};

export const CaloriesMap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<CalorieData>({});
  const [worldData, setWorldData] = useState<any>(null);
  const [currentYear, setCurrentYear] = useState(1961);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<"fast" | "medium" | "slow">("medium");
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    country: string;
    year: number;
    total: number;
  } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const minYear = 1961;
  const maxYear = 2022;

  const speedMs: { [key: string]: number } = {
    fast: 500,
    medium: 1000,
    slow: 1500,
  };

  // Load data
  useEffect(() => {
    const loadData = async () => {
      // Load CSV
      const csvResponse = await fetch("/data/total-daily-supply-of-calories-per-person.csv");
      const csvText = await csvResponse.text();
      const csvData = d3.csvParse(csvText);

      const parsedData: CalorieData = {};
      csvData.forEach((row: any) => {
        const csvCountry = row.Entity;
        const jsonCountry = getCountryDataName(csvCountry);
        const year = parseInt(row.Year, 10);
        const total = parseFloat(row.Total);

        if (!parsedData[jsonCountry]) {
          parsedData[jsonCountry] = {};
        }
        parsedData[jsonCountry][year] = total;
      });

      setData(parsedData);

      // Load world map
      // Downloaded from: https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json
      const mapResponse = await fetch("/data/countries-50m.json");
      const mapData = await mapResponse.json();
      setWorldData(mapData);
    };

    loadData();
  }, []);

  // Handle animation
  useEffect(() => {
    if (!isPlaying) {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
      return;
    }

    const interval = speedMs[speed] / (maxYear - minYear);

    animationIntervalRef.current = setInterval(() => {
      setCurrentYear((prev) => {
        if (prev >= maxYear) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, interval);

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [isPlaying, speed]);

  // Render map
  useEffect(() => {
    if (!svgRef.current || !worldData || Object.keys(data).length === 0) return;

    const width = 960;
    const height = 600;

    const projection = d3.geoNaturalEarth1().fitSize([width, height], {
      type: "Sphere",
    });

    const pathGenerator = d3.geoPath().projection(projection);

    // Get min and max values for color scale
    const allValues = Object.values(data)
      .flatMap((countryData) => Object.values(countryData))
      .filter((v) => !isNaN(v));

    const minValue = d3.min(allValues) || 0;
    const maxValue = d3.max(allValues) || 1000;

    const colorScale = d3
      .scaleSequential<string>()
      .domain([minValue, maxValue])
      .interpolator(d3.interpolateOranges);

    const features: CountryFeature[] = topojson.feature(worldData, worldData.objects.countries).features;

    // Create SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const svgElement = svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    // Draw background
    svgElement.append("rect").attr("width", width).attr("height", height).attr("fill", "#f0f0f0");

    // Draw countries
    svgElement
      .selectAll("path")
      .data(features)
      .join("path")
      .attr("d", pathGenerator as any)
      .attr("fill", (d: any) => {
        const countryName = d.properties.name;
        const countryData = data[countryName];

        if (!countryData || !countryData[currentYear]) {
          return "#d3d3d3"; // Light gray for no data
        }

        const value = countryData[currentYear];
        return colorScale(value);
      })
      .attr("stroke", "#999")
      .attr("stroke-width", 0.5)
      .style("cursor", "pointer")
      .on("mouseenter", function (event: MouseEvent, d: any) {
        const countryName = d.properties.name;
        const countryData = data[countryName];

        if (countryData && countryData[currentYear]) {
          setHoveredCountry(countryName);
          setTooltipData({
            country: countryName,
            year: currentYear,
            total: countryData[currentYear],
          });

          const rect = (event.target as SVGElement).getBoundingClientRect();
          setTooltipPos({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          });

          d3.select(this).attr("stroke", "#000").attr("stroke-width", 0.5);
        }
      })
      .on("mouseleave", function () {
        setHoveredCountry(null);
        setTooltipData(null);
        setTooltipPos(null);
        d3.select(this).attr("stroke", "#999").attr("stroke-width", 0.5);
      });

    // Draw graticule (grid lines)
    const graticule = d3.geoGraticule();
    svgElement
      .append("path")
      .attr("d", pathGenerator(graticule()) as string)
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 0.5)
      .attr("pointer-events", "none");
  }, [worldData, data, currentYear]);

  const handlePlayClick = () => {
    if (currentYear === maxYear) {
      setCurrentYear(minYear);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSpeed(e.target.value as "fast" | "medium" | "slow");
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentYear(parseInt(e.target.value, 10));
    setIsPlaying(false);
  };

  return (
    <div className="w-100" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Controls */}
      <div className="mb-4 p-3 bg-light rounded">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-auto">
            <button
              className={`btn ${isPlaying ? "btn-danger" : "btn-success"}`}
              onClick={handlePlayClick}
            >
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>
          </div>

          <div className="col-12 col-md-auto">
            <label htmlFor="speedSelect" className="form-label me-2 mb-0">
              Speed:
            </label>
            <select
              id="speedSelect"
              className="form-select form-select-sm"
              value={speed}
              onChange={handleSpeedChange}
              style={{ maxWidth: "150px" }}
            >
              <option value="fast">Fast (500ms)</option>
              <option value="medium">Medium (1000ms)</option>
              <option value="slow">Slow (1500ms)</option>
            </select>
          </div>

          <div className="col-12 col-md">
            <label htmlFor="yearSlider" className="form-label">
              Year: <strong>{currentYear}</strong>
            </label>
            <input
              id="yearSlider"
              type="range"
              className="form-range"
              min={minYear}
              max={maxYear}
              value={currentYear}
              onChange={handleYearChange}
            />
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ position: "relative", width: "100%", overflow: "auto" }}>
        <svg
          ref={svgRef}
          style={{
            width: "100%",
            height: "auto",
            border: "1px solid #ccc",
            backgroundColor: "#e8f4f8",
          }}
        />

        {/* Tooltip */}
        {tooltipData && tooltipPos && (
          <div
            style={{
              position: "fixed",
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform: "translate(-50%, -100%)",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              color: "white",
              padding: "8px 12px",
              borderRadius: "4px",
              fontSize: "12px",
              zIndex: 1000,
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            <div>
              <strong>{tooltipData.country}</strong>
            </div>
            <div>Year: {tooltipData.year}</div>
            <div>Daily Calories: {tooltipData.total.toFixed(0)}</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4">
        <div className="row">
          <div className="col-12">
            <h6 className="mb-2">Color Scale</h6>
            <div className="mb-2">
              <div
                className="w-100"
                style={{
                  height: "20px",
                  background: "linear-gradient(to right, #fff7f3, #fee5d0, #fcbba1, #fc9272, #fb6a4a, #ef3b2c, #cb181d, #99000d, #7f1400)",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
              <div className="d-flex justify-content-between mt-1 small text-muted">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
            <div
              className="d-flex align-items-center justify-content-center w-100"
              style={{
                height: "20px",
                backgroundColor: "#d3d3d3",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "12px",
              }}
            >
              No Data
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
