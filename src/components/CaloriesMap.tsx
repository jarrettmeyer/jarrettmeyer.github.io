import React, { useMemo, useState } from "react";
import * as d3 from "d3";
import { useFetch } from "@/utils/hooks/useFetch";
import { MapView } from "@/components/MapView";
import { PlayControl } from "@/components/PlayControl";

interface CalorieData {
  [country: string]: {
    [year: number]: number;
  };
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
  const minYear = 1961;
  const maxYear = 2022;
  const [currentYear, setCurrentYear] = useState(minYear);

  // Load CSV data
  const { data: csvText } = useFetch<string>(
    "/data/total-daily-supply-of-calories-per-person.csv",
    undefined,
    async (response) => response.text(),
  );

  // Parse and transform CSV data
  const calorieData = useMemo<CalorieData>(() => {
    if (!csvText) return {};

    const csvData = d3.csvParse(csvText as unknown as string);
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

    return parsedData;
  }, [csvText]);

  // Transform data for current year into MapView format
  const mapData = useMemo(() => {
    return Object.entries(calorieData)
      .map(([country, yearData]) => ({
        name: country,
        value: yearData[currentYear] || 0,
      }))
      .filter((d) => d.value > 0);
  }, [calorieData, currentYear]);

  const handleYearChange = (year: number) => {
    setCurrentYear(year);
  };

  return (
    <div className="w-100">
      <PlayControl
        min={minYear}
        max={maxYear}
        playSpeed={1000}
        onChange={handleYearChange}
      />
      <div className="mt-4">
        <MapView
          data={mapData}
          colorScale="warm"
          mapType="countries-50m"
          projection="natural"
          min={0}
          max={5000}
          formatter={d3.format(",d")}
        />
      </div>
    </div>
  );
};
