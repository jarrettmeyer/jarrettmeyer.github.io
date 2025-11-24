import React, { useState, useEffect } from "react";

export type PlayPauseControlProps = {
  min: number;
  max: number;
  playSpeed?: number;
  onChange?: (value: number) => void;
};

export function PlayControl({
  min,
  max,
  playSpeed = 500,
  onChange,
}: PlayPauseControlProps) {
  const speeds = [0.25, 0.5, 1, 1.25, 1.5, 2];

  const [value, setValue] = useState<number>(min);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setValue((prev) => {
        const next = prev + 1;
        if (next >= max) {
          setIsPlaying(false);
          return max;
        }
        return next;
      });
    }, playSpeed / speedMultiplier);

    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier, playSpeed, max]);

  useEffect(() => {
    onChange?.(value);
  }, [value, onChange]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(e.target.value));
  };

  const togglePlaying = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <section className="container-fluid bg-secondary rounded p-3">
      <div className="d-flex justify-content-between">
        <div>{min}</div>
        <div>{max}</div>
      </div>
      <div className="mb-3">
        <input
          type="range"
          className="form-range"
          min={min}
          max={max}
          value={value}
          onChange={handleSliderChange}
          style={{ height: "1rem" }}
        />
      </div>
      <div className="d-flex justify-content-between gap-2 ">
        <div>
          <button
            className="btn btn-primary"
            onClick={togglePlaying}
            title={isPlaying ? "Pause" : "Play"}
          >
            <i
              className={`bi ${isPlaying ? "bi-pause-fill" : "bi-play-fill"}`}
            />
          </button>
        </div>
        <div>
          <input
            className="form-control"
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={(e) => {
              const inputValue = +e.target.value;
              const clampedValue = Math.max(min, Math.min(max, inputValue));
              setValue(clampedValue);
            }}
          />
        </div>
        <div>
          <select
            className="form-select"
            value={speedMultiplier}
            onChange={(e) => {
              setSpeedMultiplier(+e.target.value);
            }}
          >
            {speeds.map((speed) => (
              <option key={speed} value={speed}>
                {speed}x
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
