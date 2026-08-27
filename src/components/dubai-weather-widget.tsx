"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Cloud, CloudMoon, Wind, Droplets, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * DubaiWeatherWidget — shows current Dubai weather for nightlife planning.
 *
 * Uses a mock weather generator based on the current Dubai hour (since
 * we don't have a weather API key). The data is clearly labeled as "Sample"
 * until a real weather API is connected.
 *
 * Relevant for nightlife: temperature at night, wind (affects rooftop/terrace),
 * and general conditions.
 */

interface WeatherInfo {
  temp: number;
  condition: "clear" | "partly-cloudy" | "cloudy";
  humidity: number;
  windKmh: number;
  isNight: boolean;
}

function generateMockWeather(): WeatherInfo {
  const now = new Date();
  const hour = parseInt(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", hour: "2-digit", hour12: false }).format(now),
    10
  );
  const isNight = hour >= 18 || hour < 6;

  // Dubai night temps range ~25-32°C in summer, ~15-22°C in winter.
  const month = parseInt(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", month: "numeric" }).format(now),
    10
  );
  const isSummer = month >= 5 && month <= 9;
  const baseTemp = isNight
    ? (isSummer ? 30 : 18)
    : (isSummer ? 38 : 25);
  // Add slight variance based on minute for realism.
  const variance = (now.getMinutes() % 5) - 2;
  const temp = baseTemp + variance;

  // Conditions: mostly clear at night in Dubai.
  const condition: WeatherInfo["condition"] = now.getMinutes() % 7 === 0 ? "partly-cloudy" : "clear";
  const humidity = 40 + (now.getMinutes() % 20);
  const windKmh = 8 + (now.getMinutes() % 12);

  return { temp, condition, humidity, windKmh, isNight };
}

export function DubaiWeatherWidget() {
  const [weather, setWeather] = useState<WeatherInfo | null>(() => generateMockWeather());

  useEffect(() => {
    const t = setInterval(() => setWeather(generateMockWeather()), 60000);
    return () => clearInterval(t);
  }, []);

  if (!weather) return null;

  const Icon = weather.isNight
    ? weather.condition === "clear" ? Moon : CloudMoon
    : weather.condition === "clear" ? Sun : Cloud;

  return (
    <div
      className="flex items-center gap-3 rounded-sm border border-border/40 bg-secondary/30 px-3 py-2"
      title="Dubai weather — sample data"
    >
      <Icon className={cn("h-4 w-4", weather.isNight ? "text-accent" : "text-amber-400")} />
      <div className="flex items-baseline gap-2">
        <span className="font-mono-tight tnum text-sm text-foreground">
          {weather.temp}°
        </span>
        <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-muted-foreground">
          Dubai
        </span>
      </div>
      <div className="hidden items-center gap-3 sm:flex">
        <span className="flex items-center gap-1 font-mono-tight text-[0.5625rem] text-muted-foreground">
          <Wind className="h-3 w-3" /> {weather.windKmh}
        </span>
        <span className="flex items-center gap-1 font-mono-tight text-[0.5625rem] text-muted-foreground">
          <Droplets className="h-3 w-3" /> {weather.humidity}%
        </span>
      </div>
      <span className="rounded-full bg-accent/10 px-1.5 py-0.5 font-mono-tight text-[0.4rem] uppercase tracking-[0.1em] text-accent/70">
        Sample
      </span>
    </div>
  );
}
