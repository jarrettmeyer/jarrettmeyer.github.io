import React, { useState } from "react";

export interface PlayPauseControlProps {
  min: number;
  max: number;
  onChange?: (value: number) => void;
}

type PlaySpeed = "Slow" | "Medium" | "Fast";

const playSpeeds: Record<PlaySpeed, number> = {
  "Slow": 1500,
  "Medium": 1000,
  "Fast": 500,
};

export function PlayControl({ min, max }: PlayPauseControlProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<PlaySpeed>("Medium");
  const [value, setValue] = useState<number>(min);

  return (
    <section>
      <div className="container bg-body-secondary p-3 rounded container">
        <div className="row">
          <div className="col">
            <button
              className={`btn ${isPlaying ? "btn-danger" : "btn-success"} w-100 mb-3`}
              onClick={(e) => {
                setIsPlaying((prev) => !prev);
              }}
            >
              <i
                className={`bi ${isPlaying ? "bi-pause-fill" : "bi-play-fill"}`}
              />
            </button>
          </div>
          <div className="col-9">
            <input type="range" className="form-range mt-1" min={min} max={max} value={value} onChange={() => {}} style={{ accentColor: "coral" }} />
          </div>
          <div className="col-2">
            <select
              className="form-control w-100 mb-3"
              value={playSpeed}
              onChange={(e) => {
                const newSpeed = e.target.value as PlaySpeed;
                setPlaySpeed(newSpeed);
                console.log(`playSpeed=${newSpeed}`);
              }}
            >
              <option value="Slow">Slow</option>
              <option value="Medium">Medium</option>
              <option value="Fast">Fast</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}
