"use client";

import { useEffect, useState } from "react";

type Weather = {
  temperature: number;
  weatherCode: number;
  isDay: boolean;
  localTime: Date;
};

const BRUSSELS = { lat: 50.8503, lon: 4.3517, city: "Brussels", countryCode: "BE" };

function weatherCondition(code: number): string {
  if (code === 0) return "clear";
  if (code <= 3) return "cloudy";
  if (code >= 45 && code <= 48) return "fog";
  if (code >= 51 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "rain";
  if (code >= 85 && code <= 86) return "snow";
  if (code >= 95) return "rain";
  return "cloudy";
}

function weatherIcon(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? "sun" : "partly-cloudy";
  if (code === 1 || code === 2) return "partly-cloudy";
  if (code === 3) return "cloudy";
  if (code >= 45 && code <= 48) return "cloudy";
  if (code >= 51 && code <= 64) return "light-rain";
  if (code === 65 || code === 66 || code === 67) return "heavy-rain";
  if (code >= 71 && code <= 73) return "snow";
  if (code === 75 || code === 77) return "heavy-snow";
  if (code === 80 || code === 81) return "light-rain";
  if (code === 82) return "heavy-rain";
  if (code === 85) return "snow";
  if (code === 86) return "heavy-snow";
  if (code >= 95) return "thunderstorms";
  return "cloudy";
}

function backgroundFor(condition: string, isDay: boolean): string {
  const day = isDay ? "day" : "night";
  const map: Record<string, string> = {
    "clear-day": "linear-gradient(160deg, #7fb8d9 0%, #c9e0ef 60%, #e8d5b7 100%)",
    "clear-night": "linear-gradient(160deg, #1a2942 0%, #3a4a6b 60%, #5a6b8a 100%)",
    "cloudy-day": "linear-gradient(160deg, #8a9bad 0%, #a8b5c2 60%, #c5ccd2 100%)",
    "cloudy-night": "linear-gradient(160deg, #2a3440 0%, #3e4856 60%, #565f6b 100%)",
    "rain-day": "linear-gradient(160deg, #4a5a6a 0%, #6a7a88 60%, #8a95a0 100%)",
    "rain-night": "linear-gradient(160deg, #1a2028 0%, #2a3540 60%, #3e4a56 100%)",
    "snow-day": "linear-gradient(160deg, #b8c4d0 0%, #d4dce4 60%, #ecf0f4 100%)",
    "snow-night": "linear-gradient(160deg, #3a4456 0%, #5a6478 60%, #7a8498 100%)",
    "fog-day": "linear-gradient(160deg, #9aa5ad 0%, #b8c0c6 60%, #d0d5d8 100%)",
    "fog-night": "linear-gradient(160deg, #2a3036 0%, #454a50 60%, #606568 100%)",
  };
  return map[`${condition}-${day}`] ?? map[`cloudy-${day}`];
}

export default function Widget() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${BRUSSELS.lat}&longitude=${BRUSSELS.lon}&current=temperature_2m,weather_code,is_day&timezone=auto`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("Weather fetch failed");
        return r.json();
      })
      .then((data) => {
        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          weatherCode: data.current.weather_code,
          isDay: data.current.is_day === 1,
          localTime: new Date(data.current.time),
        });
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="size-[400px] rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 text-sm p-6 text-center">
        Couldn&apos;t load weather. Try again later.
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="size-[400px] rounded-2xl bg-zinc-800 animate-pulse" />
    );
  }

  const condition = weatherCondition(weather.weatherCode);
  const background = backgroundFor(condition, weather.isDay);
  const icon = weatherIcon(weather.weatherCode, weather.isDay);
  const timeStr = weather.localTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const day = weather.localTime.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const weekday = weather.localTime.toLocaleDateString("en-GB", { weekday: "long" });
  const dateLine = `${day}, ${weekday}, ${timeStr}`;

  return (
    <div
      className="relative size-[400px] rounded-2xl overflow-hidden shadow-2xl text-white"
      style={{ background }}
    >
      <div
        className="absolute flex items-center text-[120px] font-bold text-white drop-shadow-md whitespace-nowrap"
        style={{ top: 32, left: 32, lineHeight: "120px", letterSpacing: "-2px" }}
      >
        <span>{weather.temperature}</span>
        <span>°</span>
      </div>
      <div
        className="absolute left-0 right-0 flex items-baseline justify-center gap-2 text-[32px] leading-none text-white drop-shadow-md"
        style={{ top: 317 }}
      >
        <span className="font-semibold">{BRUSSELS.city},</span>
        <span className="font-light">Belgium</span>
      </div>
      <div
        className="absolute left-0 right-0 text-center text-base font-semibold text-white drop-shadow-md"
        style={{ top: 357 }}
      >
        {dateLine}
      </div>
    </div>
  );
}
