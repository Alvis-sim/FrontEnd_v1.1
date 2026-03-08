"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type MouseEvent } from "react";

type PowerMode = "calculated" | "measured";

type TelemetryBaseline = {
  electricalKw: number;
  hydraulicKw: number;
  pumpEfficiencyPct: number;
  wireToWaterEfficiencyPct: number;
};

type TelemetrySample = {
  id: number;
  timestamp: number;
  electricalKw: number;
  hydraulicKw: number;
  pumpEfficiencyPct: number;
  wireToWaterEfficiencyPct: number;
};

type HistogramBin = {
  id: number;
  min: number;
  max: number;
  count: number;
};

const G = 9.80665;
const TELEMETRY_LIMIT = 720;
const TELEMETRY_STEP_MS = 1000;
const HISTORY_OPTIONS = [60, 180, 300] as const;
const HISTOGRAM_BINS = 10;
const INITIAL_TELEMETRY_BASELINE: TelemetryBaseline = {
  electricalKw: 58,
  hydraulicKw: 35,
  pumpEfficiencyPct: 76,
  wireToWaterEfficiencyPct: 70
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

const round = (value: number, digits = 2) => {
  return Number(value.toFixed(digits));
};

const asRatio = (percent: number) => {
  return clamp(percent, 0, 100) / 100;
};

const randomBetween = (min: number, max: number) => {
  return min + Math.random() * (max - min);
};

const toClockLabel = (timestamp: number) => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(timestamp);
};

const buildChartPath = (
  values: number[],
  xForIndex: (index: number) => number,
  yForValue: (value: number) => number
) => {
  return values
    .map((value, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${xForIndex(index).toFixed(2)} ${yForValue(value).toFixed(2)}`;
    })
    .join(" ");
};

const createTelemetrySample = (
  id: number,
  timestamp: number,
  baseline: TelemetryBaseline,
  previous?: TelemetrySample
): TelemetrySample => {
  const waveFast = Math.sin(id / 9.5);
  const waveMedium = Math.sin(id / 21.5 + 0.9);
  const waveSlow = Math.cos(id / 57 + 0.35);
  const regimeShift = Math.sin(id / 120 + 0.5);
  const disturbance = id % 52 === 0 ? randomBetween(-12, 18) : 0;
  const efficiencyDip = id % 67 === 0 ? randomBetween(8, 18) : 0;

  const electricalTarget =
    Math.max(baseline.electricalKw, 0.1) * (1 + regimeShift * 0.24) +
    waveFast * 6.5 +
    waveMedium * 3.2 +
    disturbance * 0.45 +
    randomBetween(-5, 5);
  const hydraulicTarget =
    Math.max(baseline.hydraulicKw, 0) * (1 + waveSlow * 0.22) +
    waveFast * 4.2 +
    waveMedium * 2.8 +
    disturbance * 0.3 +
    randomBetween(-4, 4);
  const pumpEffTarget =
    clamp(baseline.pumpEfficiencyPct, 0, 130) +
    waveFast * 14 +
    waveMedium * 8 +
    waveSlow * 7 +
    disturbance -
    efficiencyDip +
    randomBetween(-6.2, 6.2);
  const wireEffTarget =
    clamp(baseline.wireToWaterEfficiencyPct, 0, 130) +
    waveFast * 11 +
    waveMedium * 7 +
    waveSlow * 6 +
    disturbance * 0.76 -
    efficiencyDip * 0.85 +
    randomBetween(-5.2, 5.2);

  const electricalKw = clamp(
    (previous?.electricalKw ?? electricalTarget) * 0.46 +
      electricalTarget * 0.54 +
      randomBetween(-2.8, 2.8),
    0,
    Math.max(baseline.electricalKw * 2.1, 28)
  );
  const hydraulicKw = clamp(
    (previous?.hydraulicKw ?? hydraulicTarget) * 0.47 +
      hydraulicTarget * 0.53 +
      randomBetween(-2.4, 2.4),
    0,
    Math.max(baseline.hydraulicKw * 2.1, 20)
  );
  const pumpEfficiencyPct = clamp(
    (previous?.pumpEfficiencyPct ?? pumpEffTarget) * 0.5 +
      pumpEffTarget * 0.5 +
      randomBetween(-2.3, 2.3),
    0,
    130
  );
  const wireToWaterEfficiencyPct = clamp(
    (previous?.wireToWaterEfficiencyPct ?? wireEffTarget) * 0.5 +
      wireEffTarget * 0.5 +
      randomBetween(-2, 2),
    0,
    130
  );

  return {
    id,
    timestamp,
    electricalKw: round(electricalKw),
    hydraulicKw: round(hydraulicKw),
    pumpEfficiencyPct: round(pumpEfficiencyPct),
    wireToWaterEfficiencyPct: round(wireToWaterEfficiencyPct)
  };
};

const createInitialTelemetry = (count: number, baseline: TelemetryBaseline) => {
  const now = Date.now();
  const start = now - count * TELEMETRY_STEP_MS;
  const samples: TelemetrySample[] = [];

  for (let index = 0; index < count; index += 1) {
    const previous = samples[samples.length - 1];
    samples.push(createTelemetrySample(index, start + index * TELEMETRY_STEP_MS, baseline, previous));
  }

  return samples;
};

const createStaticTelemetry = (count: number, baseline: TelemetryBaseline) => {
  const start = Date.UTC(2026, 0, 1, 0, 0, 0);
  return Array.from({ length: count }, (_, id) => {
    return {
      id,
      timestamp: start + id * TELEMETRY_STEP_MS,
      electricalKw: round(Math.max(baseline.electricalKw, 0.1)),
      hydraulicKw: round(Math.max(baseline.hydraulicKw, 0)),
      pumpEfficiencyPct: round(clamp(baseline.pumpEfficiencyPct, 0, 130)),
      wireToWaterEfficiencyPct: round(clamp(baseline.wireToWaterEfficiencyPct, 0, 130))
    };
  });
};

export default function InfluentPumpEfficiency() {
  const [powerMode, setPowerMode] = useState<PowerMode>("calculated");
  const [flowM3h, setFlowM3h] = useState(920);
  const [headM, setHeadM] = useState(14.2);
  const [densityKgM3, setDensityKgM3] = useState(998);
  const [activePumps, setActivePumps] = useState(2);

  const [voltageV, setVoltageV] = useState(415);
  const [currentA, setCurrentA] = useState(92);
  const [powerFactor, setPowerFactor] = useState(0.88);
  const [measuredElectricalKw, setMeasuredElectricalKw] = useState(58.2);

  const [driveEfficiencyPct, setDriveEfficiencyPct] = useState(97);
  const [motorEfficiencyPct, setMotorEfficiencyPct] = useState(93);
  const [bepTargetPct, setBepTargetPct] = useState(85);
  const [lepTargetPct, setLepTargetPct] = useState(68);

  const [historyWindow, setHistoryWindow] = useState<number>(180);
  const [isLiveFeed, setIsLiveFeed] = useState(true);
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);
  const [hoveredHistogramBin, setHoveredHistogramBin] = useState<number | null>(null);

  const results = useMemo(() => {
    const flowM3s = Math.max(flowM3h, 0) / 3600;
    const hydraulicPowerKw = (Math.max(densityKgM3, 0) * G * flowM3s * Math.max(headM, 0)) / 1000;

    const electricalPowerKw =
      powerMode === "calculated"
        ? (Math.sqrt(3) * Math.max(voltageV, 0) * Math.max(currentA, 0) * clamp(powerFactor, 0, 1)) /
          1000
        : Math.max(measuredElectricalKw, 0);

    const shaftPowerKw =
      electricalPowerKw * asRatio(Math.max(driveEfficiencyPct, 0)) * asRatio(Math.max(motorEfficiencyPct, 0));

    const pumpEfficiencyPct = shaftPowerKw > 0 ? (hydraulicPowerKw / shaftPowerKw) * 100 : 0;
    const wireToWaterEfficiencyPct = electricalPowerKw > 0 ? (hydraulicPowerKw / electricalPowerKw) * 100 : 0;
    const specificEnergyKwhM3 = flowM3h > 0 ? electricalPowerKw / flowM3h : 0;

    const safePumpCount = clamp(Math.round(activePumps), 1, 8);
    const perPumpFlowM3h = flowM3h / safePumpCount;
    const perPumpElectricalKw = electricalPowerKw / safePumpCount;

    let efficiencyBand = "Near BEP";
    if (pumpEfficiencyPct > 100) {
      efficiencyBand = "Invalid (>100%)";
    } else if (pumpEfficiencyPct < lepTargetPct) {
      efficiencyBand = "Below LEP";
    } else if (pumpEfficiencyPct < bepTargetPct - 4) {
      efficiencyBand = "Below BEP";
    }

    return {
      hydraulicPowerKw: round(hydraulicPowerKw),
      electricalPowerKw: round(electricalPowerKw),
      shaftPowerKw: round(shaftPowerKw),
      pumpEfficiencyPct: round(pumpEfficiencyPct),
      wireToWaterEfficiencyPct: round(wireToWaterEfficiencyPct),
      specificEnergyKwhM3: round(specificEnergyKwhM3, 4),
      perPumpFlowM3h: round(perPumpFlowM3h),
      perPumpElectricalKw: round(perPumpElectricalKw),
      safePumpCount,
      efficiencyBand
    };
  }, [
    activePumps,
    bepTargetPct,
    currentA,
    densityKgM3,
    driveEfficiencyPct,
    flowM3h,
    headM,
    lepTargetPct,
    measuredElectricalKw,
    motorEfficiencyPct,
    powerFactor,
    powerMode,
    voltageV
  ]);

  const telemetryBaseline = useMemo<TelemetryBaseline>(() => {
    return {
      electricalKw: Math.max(results.electricalPowerKw, 0.1),
      hydraulicKw: Math.max(results.hydraulicPowerKw, 0),
      pumpEfficiencyPct: clamp(results.pumpEfficiencyPct, 0, 130),
      wireToWaterEfficiencyPct: clamp(results.wireToWaterEfficiencyPct, 0, 130)
    };
  }, [
    results.electricalPowerKw,
    results.hydraulicPowerKw,
    results.pumpEfficiencyPct,
    results.wireToWaterEfficiencyPct
  ]);

  const [telemetry, setTelemetry] = useState<TelemetrySample[]>(() => {
    return createStaticTelemetry(240, INITIAL_TELEMETRY_BASELINE);
  });

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setTelemetry(createInitialTelemetry(240, INITIAL_TELEMETRY_BASELINE));
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!isLiveFeed) {
      return;
    }

    const timer = window.setInterval(() => {
      setTelemetry((current) => {
        const previous = current[current.length - 1];
        const nextId = previous ? previous.id + 1 : 0;
        const nextSample = createTelemetrySample(nextId, Date.now(), telemetryBaseline, previous);
        return [...current, nextSample].slice(-TELEMETRY_LIMIT);
      });
    }, TELEMETRY_STEP_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [isLiveFeed, telemetryBaseline]);

  const visibleTelemetry = useMemo(() => {
    return telemetry.slice(-historyWindow);
  }, [telemetry, historyWindow]);

  const activeTrendIndex = hoveredTrendIndex ?? visibleTelemetry.length - 1;
  const safeTrendIndex = clamp(activeTrendIndex, 0, visibleTelemetry.length - 1);
  const activeTelemetry = visibleTelemetry[safeTrendIndex];

  const chartWidth = 1280;
  const chartHeight = 560;
  const padding = { top: 24, right: 64, bottom: 38, left: 56 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const efficiencyMinValue = Math.min(
    ...visibleTelemetry.map((sample) => {
      return Math.min(sample.pumpEfficiencyPct, sample.wireToWaterEfficiencyPct);
    })
  );
  const efficiencyMaxValue = Math.max(
    ...visibleTelemetry.map((sample) => {
      return Math.max(sample.pumpEfficiencyPct, sample.wireToWaterEfficiencyPct);
    })
  );
  const efficiencyMin = Math.max(0, Math.floor((efficiencyMinValue - 4) / 5) * 5);
  const efficiencyMax = Math.max(
    efficiencyMin + 20,
    Math.min(130, Math.ceil((efficiencyMaxValue + 4) / 5) * 5)
  );
  const efficiencyRange = Math.max(efficiencyMax - efficiencyMin, 1);

  const powerMinValue = Math.min(...visibleTelemetry.map((sample) => sample.electricalKw));
  const powerMaxValue = Math.max(...visibleTelemetry.map((sample) => sample.electricalKw));
  const powerMin = Math.max(0, Math.floor((powerMinValue - 2) / 2) * 2);
  const powerMax = Math.max(powerMin + 8, Math.ceil((powerMaxValue + 2) / 2) * 2);
  const powerRange = Math.max(powerMax - powerMin, 1);

  const xForIndex = (index: number) => {
    const segments = Math.max(visibleTelemetry.length - 1, 1);
    return padding.left + (index / segments) * plotWidth;
  };
  const yForEfficiency = (value: number) => {
    return padding.top + ((efficiencyMax - value) / efficiencyRange) * plotHeight;
  };
  const yForPower = (value: number) => {
    return padding.top + ((powerMax - value) / powerRange) * plotHeight;
  };

  const pumpEfficiencyPath = buildChartPath(
    visibleTelemetry.map((sample) => sample.pumpEfficiencyPct),
    xForIndex,
    yForEfficiency
  );
  const wireToWaterPath = buildChartPath(
    visibleTelemetry.map((sample) => sample.wireToWaterEfficiencyPct),
    xForIndex,
    yForEfficiency
  );
  const powerPath = buildChartPath(
    visibleTelemetry.map((sample) => sample.electricalKw),
    xForIndex,
    yForPower
  );

  const hoverX = xForIndex(safeTrendIndex);
  const hoverPumpEfficiencyY = yForEfficiency(activeTelemetry.pumpEfficiencyPct);
  const hoverWireEfficiencyY = yForEfficiency(activeTelemetry.wireToWaterEfficiencyPct);
  const hoverPowerY = yForPower(activeTelemetry.electricalKw);
  const hoverNoteOnRight = hoverX < chartWidth - padding.right - 170;
  const hoverNoteX = hoverNoteOnRight ? hoverX + 10 : hoverX - 10;
  const hoverAnchor = hoverNoteOnRight ? "start" : "end";

  const efficiencyTicks = Array.from({ length: 6 }, (_, index) => {
    const ratio = index / 5;
    return {
      y: padding.top + ratio * plotHeight,
      label: (efficiencyMax - ratio * efficiencyRange).toFixed(0)
    };
  });

  const powerTicks = Array.from({ length: 6 }, (_, index) => {
    const ratio = index / 5;
    return {
      y: padding.top + ratio * plotHeight,
      label: (powerMax - ratio * powerRange).toFixed(1)
    };
  });

  const handleTrendMove = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = ((event.clientX - bounds.left) / bounds.width) * chartWidth;
    const clampedX = clamp(relativeX, padding.left, chartWidth - padding.right);
    const ratio = (clampedX - padding.left) / plotWidth;
    const index = Math.round(ratio * (visibleTelemetry.length - 1));
    setHoveredTrendIndex(index);
  };

  const histogram = useMemo(() => {
    const min = 0;
    const max = 100;
    const width = (max - min) / HISTOGRAM_BINS;
    const bins: HistogramBin[] = Array.from({ length: HISTOGRAM_BINS }, (_, index) => {
      return {
        id: index,
        min: min + index * width,
        max: min + (index + 1) * width,
        count: 0
      };
    });

    for (const sample of visibleTelemetry) {
      const capped = clamp(sample.pumpEfficiencyPct, min, max - 0.0001);
      const bucket = clamp(Math.floor((capped - min) / width), 0, HISTOGRAM_BINS - 1);
      bins[bucket].count += 1;
    }

    const maxCount = Math.max(...bins.map((bin) => bin.count), 1);
    return {
      bins,
      total: visibleTelemetry.length,
      maxCount
    };
  }, [visibleTelemetry]);

  const highlightedBin = hoveredHistogramBin === null ? null : histogram.bins[hoveredHistogramBin];
  const highlightedBinRatio =
    highlightedBin && histogram.total > 0 ? (highlightedBin.count / histogram.total) * 100 : 0;

  const histogramSummary = highlightedBin
    ? `Range ${highlightedBin.min.toFixed(0)}-${highlightedBin.max.toFixed(0)}%: ${highlightedBin.count} sample(s), ${highlightedBinRatio.toFixed(1)}% of selected history.`
    : `Hover bars to inspect range density. ${histogram.total} sample(s) included.`;

  return (
    <main className="dashboard-shell eff-shell">
      <div className="dashboard-background" aria-hidden="true" />

      <div className="eff-page">
        <section className="dashboard eff-dashboard eff-top">
          <header className="dashboard-header">
            <div>
              <Link
                className="nav_logo_wrap w-inline-block dashboard-home-logo"
                href="/"
                aria-label="Home page"
                target="_top"
              >
                <div className="nav_logo_lottie">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 143 16"
                    width="143"
                    height="16"
                    preserveAspectRatio="xMidYMid meet"
                    aria-hidden="true"
                  >
                    <text
                      x="3"
                      y="12.1"
                      fill="#181818"
                      fontFamily="'Avenir Next', 'Helvetica Neue', 'Segoe UI', Arial, sans-serif"
                      fontSize="15.2"
                      fontWeight="700"
                      letterSpacing="1.15"
                    >
                      AGENFIC
                    </text>
                  </svg>
                </div>
              </Link>
              <p className="eyebrow">Influent Pump Toolkit</p>
              <h1>Machine Efficiency Calculator</h1>
              <p className="description">
                Calculate pump efficiency from flow, head, and electrical data with live trend and
                distribution tracking.
              </p>
            </div>

            <div className="header-controls eff-header-controls">
              <label htmlFor="eff-history-window">History</label>
              <select
                id="eff-history-window"
                value={historyWindow}
                onChange={(event) => {
                  setHistoryWindow(Number(event.target.value));
                }}
              >
                {HISTORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    Last {option}s
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="live-toggle"
                onClick={() => {
                  setIsLiveFeed((current) => !current);
                }}
              >
                {isLiveFeed ? "Pause Feed" : "Resume Feed"}
              </button>

              <Link className="eff-link" href="/energy-dashboard">
                Open Energy Dashboard
              </Link>
            </div>
          </header>

          <section className="kpi-grid" aria-label="Calculated results">
            <article className="kpi-card">
              <h2>Hydraulic Power</h2>
              <p>{results.hydraulicPowerKw.toFixed(2)} kW</p>
              <span className="kpi-sub">From flow, head, and fluid density</span>
            </article>
            <article className="kpi-card">
              <h2>Electrical Input</h2>
              <p>{results.electricalPowerKw.toFixed(2)} kW</p>
              <span className="kpi-sub">
                {powerMode === "calculated" ? "Calculated from V/A/PF" : "Measured input mode"}
              </span>
            </article>
            <article className="kpi-card">
              <h2>Shaft Power</h2>
              <p>{results.shaftPowerKw.toFixed(2)} kW</p>
              <span className="kpi-sub">
                Drive {driveEfficiencyPct.toFixed(1)}%, Motor {motorEfficiencyPct.toFixed(1)}%
              </span>
            </article>
            <article className="kpi-card">
              <h2>Pump Efficiency</h2>
              <p>{results.pumpEfficiencyPct.toFixed(2)}%</p>
              <span
                className={`kpi-sub ${
                  results.efficiencyBand === "Near BEP"
                    ? "flat"
                    : results.efficiencyBand === "Below BEP"
                      ? "up"
                      : "down"
                }`}
              >
                {results.efficiencyBand}
              </span>
            </article>
            <article className="kpi-card">
              <h2>Wire-to-Water</h2>
              <p>{results.wireToWaterEfficiencyPct.toFixed(2)}%</p>
              <span className="kpi-sub">Electrical to hydraulic efficiency</span>
            </article>
            <article className="kpi-card">
              <h2>Specific Energy</h2>
              <p>{results.specificEnergyKwhM3.toFixed(4)} kWh/m3</p>
              <span className="kpi-sub">
                {results.safePumpCount} pumps, {results.perPumpFlowM3h.toFixed(1)} m3/h each
              </span>
            </article>
          </section>
        </section>

        <section className="eff-outside-sections">
          <section className="dashboard eff-dashboard eff-trend-row">
            <article className="panel eff-trend-panel">
              <div className="panel-head">
                <h2>Power Efficiency Trend</h2>
                <p>
                  Hover point: <strong>{toClockLabel(activeTelemetry.timestamp)}</strong> | Pump{" "}
                  <strong>{activeTelemetry.pumpEfficiencyPct.toFixed(2)}%</strong> | Wire{" "}
                  <strong>{activeTelemetry.wireToWaterEfficiencyPct.toFixed(2)}%</strong> | Power{" "}
                  <strong>{activeTelemetry.electricalKw.toFixed(2)} kW</strong>
                </p>
              </div>

              <div
                className="eff-trend-wrap"
                onMouseMove={handleTrendMove}
                onMouseLeave={() => {
                  setHoveredTrendIndex(null);
                }}
              >
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  role="img"
                  aria-label="Power and efficiency trend chart"
                >
                  {efficiencyTicks.map((tick) => (
                    <g key={`eff-${tick.y}`}>
                      <line
                        className="eff-grid-line"
                        x1={padding.left}
                        y1={tick.y}
                        x2={chartWidth - padding.right}
                        y2={tick.y}
                      />
                      <text className="eff-axis-label left" x={padding.left - 10} y={tick.y + 4}>
                        {tick.label}
                      </text>
                    </g>
                  ))}

                  {powerTicks.map((tick) => (
                    <text
                      key={`power-${tick.y}`}
                      className="eff-axis-label right"
                      x={chartWidth - padding.right + 10}
                      y={tick.y + 4}
                    >
                      {tick.label}
                    </text>
                  ))}

                  <line
                    className="eff-axis-baseline"
                    x1={padding.left}
                    y1={chartHeight - padding.bottom}
                    x2={chartWidth - padding.right}
                    y2={chartHeight - padding.bottom}
                  />

                  <path className="eff-line pump" d={pumpEfficiencyPath} />
                  <path className="eff-line wire" d={wireToWaterPath} />
                  <path className="eff-line power" d={powerPath} />

                  <line
                    className="eff-hover-line"
                    x1={hoverX}
                    y1={padding.top}
                    x2={hoverX}
                    y2={chartHeight - padding.bottom}
                  />

                  <circle className="eff-dot pump" cx={hoverX} cy={hoverPumpEfficiencyY} r="4.4" />
                  <circle className="eff-dot wire" cx={hoverX} cy={hoverWireEfficiencyY} r="4.2" />
                  <circle className="eff-dot power" cx={hoverX} cy={hoverPowerY} r="4.4" />

                  <text
                    className="eff-note pump"
                    x={hoverNoteX}
                    y={hoverPumpEfficiencyY - 12}
                    textAnchor={hoverAnchor}
                  >
                    {activeTelemetry.pumpEfficiencyPct.toFixed(1)}%
                  </text>
                  <text
                    className="eff-note power"
                    x={hoverNoteX}
                    y={hoverPowerY + 16}
                    textAnchor={hoverAnchor}
                  >
                    {activeTelemetry.electricalKw.toFixed(1)} kW
                  </text>

                  <text className="eff-axis-title left" x={padding.left} y={16}>
                    Efficiency (%)
                  </text>
                  <text className="eff-axis-title right" x={chartWidth - padding.right} y={16}>
                    Power (kW)
                  </text>
                </svg>
              </div>

              <div className="eff-trend-legend">
                <span className="pump">Pump efficiency</span>
                <span className="wire">Wire-to-water</span>
                <span className="power">Electrical power</span>
                <span className="status">Live feed: {isLiveFeed ? "On" : "Paused"}</span>
              </div>

              <p className="eff-trend-summary">
                Point {safeTrendIndex + 1}/{visibleTelemetry.length} at{" "}
                <strong>{toClockLabel(activeTelemetry.timestamp)}</strong> | Pump{" "}
                <strong>{activeTelemetry.pumpEfficiencyPct.toFixed(2)}%</strong> | Wire{" "}
                <strong>{activeTelemetry.wireToWaterEfficiencyPct.toFixed(2)}%</strong> | Power{" "}
                <strong>{activeTelemetry.electricalKw.toFixed(2)} kW</strong>.
              </p>
            </article>
          </section>

          <section className="eff-main-grid">
            <article className="panel eff-form">
              <div className="eff-section-head">
                <h2>Input Parameters</h2>
                <p>Configure process and electrical telemetry for your influent pump train.</p>
              </div>

            <div className="eff-form-grid">
              <label className="eff-field">
                <span>Total flow rate (m3/h)</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={flowM3h}
                  onChange={(event) => {
                    setFlowM3h(Number(event.target.value) || 0);
                  }}
                />
              </label>

              <label className="eff-field">
                <span>Total dynamic head (m)</span>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={headM}
                  onChange={(event) => {
                    setHeadM(Number(event.target.value) || 0);
                  }}
                />
              </label>

              <label className="eff-field">
                <span>Fluid density (kg/m3)</span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={densityKgM3}
                  onChange={(event) => {
                    setDensityKgM3(Number(event.target.value) || 1);
                  }}
                />
              </label>

              <label className="eff-field">
                <span>Active influent pumps</span>
                <input
                  type="number"
                  min={1}
                  max={8}
                  step={1}
                  value={activePumps}
                  onChange={(event) => {
                    setActivePumps(Number(event.target.value) || 1);
                  }}
                />
              </label>
            </div>

            <div className="eff-section-head">
              <h3>Electrical Mode</h3>
            </div>

            <div className="eff-mode-toggle" role="tablist" aria-label="Power input mode">
              <button
                type="button"
                role="tab"
                className={powerMode === "calculated" ? "active" : ""}
                aria-selected={powerMode === "calculated"}
                onClick={() => {
                  setPowerMode("calculated");
                }}
              >
                Compute from V / A / PF
              </button>
              <button
                type="button"
                role="tab"
                className={powerMode === "measured" ? "active" : ""}
                aria-selected={powerMode === "measured"}
                onClick={() => {
                  setPowerMode("measured");
                }}
              >
                Use measured kW
              </button>
            </div>

            {powerMode === "calculated" ? (
              <div className="eff-form-grid">
                <label className="eff-field">
                  <span>Voltage (V, 3-phase)</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={voltageV}
                    onChange={(event) => {
                      setVoltageV(Number(event.target.value) || 0);
                    }}
                  />
                </label>

                <label className="eff-field">
                  <span>Current (A)</span>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={currentA}
                    onChange={(event) => {
                      setCurrentA(Number(event.target.value) || 0);
                    }}
                  />
                </label>

                <label className="eff-field">
                  <span>Power factor (0-1)</span>
                  <input
                    type="number"
                    min={0}
                    max={1}
                    step={0.01}
                    value={powerFactor}
                    onChange={(event) => {
                      setPowerFactor(clamp(Number(event.target.value) || 0, 0, 1));
                    }}
                  />
                </label>
              </div>
            ) : (
              <div className="eff-form-grid">
                <label className="eff-field">
                  <span>Measured electrical power (kW)</span>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={measuredElectricalKw}
                    onChange={(event) => {
                      setMeasuredElectricalKw(Number(event.target.value) || 0);
                    }}
                  />
                </label>
              </div>
            )}

            <div className="eff-form-grid">
              <label className="eff-field">
                <span>Drive efficiency (%)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={driveEfficiencyPct}
                  onChange={(event) => {
                    setDriveEfficiencyPct(Number(event.target.value) || 0);
                  }}
                />
              </label>

              <label className="eff-field">
                <span>Motor efficiency (%)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={motorEfficiencyPct}
                  onChange={(event) => {
                    setMotorEfficiencyPct(Number(event.target.value) || 0);
                  }}
                />
              </label>

              <label className="eff-field">
                <span>BEP target (%)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={bepTargetPct}
                  onChange={(event) => {
                    setBepTargetPct(Number(event.target.value) || 0);
                  }}
                />
              </label>

              <label className="eff-field">
                <span>LEP floor (%)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={lepTargetPct}
                  onChange={(event) => {
                    setLepTargetPct(Number(event.target.value) || 0);
                  }}
                />
              </label>
            </div>
            </article>

            <article className="panel eff-results">
              <div className="eff-section-head">
                <h2>Calculated Results</h2>
                <p>Hydraulic, mechanical, and wire-to-water performance snapshot.</p>
              </div>

            <div className="eff-result-grid">
              <div className="eff-result-card">
                <h3>Hydraulic Power</h3>
                <p>{results.hydraulicPowerKw.toFixed(2)} kW</p>
              </div>
              <div className="eff-result-card">
                <h3>Electrical Input</h3>
                <p>{results.electricalPowerKw.toFixed(2)} kW</p>
              </div>
              <div className="eff-result-card">
                <h3>Shaft Power</h3>
                <p>{results.shaftPowerKw.toFixed(2)} kW</p>
              </div>
              <div className="eff-result-card">
                <h3>Pump Efficiency</h3>
                <p>{results.pumpEfficiencyPct.toFixed(2)}%</p>
              </div>
              <div className="eff-result-card">
                <h3>Wire-to-Water</h3>
                <p>{results.wireToWaterEfficiencyPct.toFixed(2)}%</p>
              </div>
              <div className="eff-result-card">
                <h3>Specific Energy</h3>
                <p>{results.specificEnergyKwhM3.toFixed(4)} kWh/m3</p>
              </div>
            </div>

            <div
              className={`eff-band ${
                results.efficiencyBand === "Near BEP"
                  ? "good"
                  : results.efficiencyBand === "Below BEP"
                    ? "warn"
                    : "bad"
              }`}
            >
              <strong>{results.efficiencyBand}</strong>
              <span>
                Pump train: {results.safePumpCount} active pump(s) | Per pump flow{" "}
                {results.perPumpFlowM3h.toFixed(2)} m3/h | Per pump electrical load{" "}
                {results.perPumpElectricalKw.toFixed(2)} kW
              </span>
            </div>

            <div className="eff-notes">
              <h3>Assumptions</h3>
              <ul>
                <li>Hydraulic power = rho x g x Q x H.</li>
                <li>Electrical power from V/A/PF assumes balanced 3-phase load.</li>
                <li>Shaft power applies drive and motor efficiency as losses.</li>
                <li>Check sensor scaling if computed pump efficiency exceeds 100%.</li>
              </ul>
            </div>
            </article>

            <section className="panel eff-histogram-panel">
              <div className="panel-head">
                <h2>Efficiency Histogram</h2>
                <p>Distribution of pump efficiency across the selected time window.</p>
              </div>

            <div className="eff-hist-bars">
              {histogram.bins.map((bin) => {
                const heightPct = (bin.count / histogram.maxCount) * 100;
                const isActive = hoveredHistogramBin === bin.id;
                return (
                  <button
                    type="button"
                    key={bin.id}
                    className={isActive ? "eff-hist-bar active" : "eff-hist-bar"}
                    onMouseEnter={() => {
                      setHoveredHistogramBin(bin.id);
                    }}
                    onMouseLeave={() => {
                      setHoveredHistogramBin(null);
                    }}
                    onFocus={() => {
                      setHoveredHistogramBin(bin.id);
                    }}
                    onBlur={() => {
                      setHoveredHistogramBin(null);
                    }}
                    title={`${bin.min.toFixed(0)}-${bin.max.toFixed(0)}%`}
                  >
                    <span className="eff-hist-track">
                      <span className="eff-hist-fill" style={{ height: `${heightPct}%` }} />
                    </span>
                    <span className="eff-hist-label">
                      {bin.min.toFixed(0)}-{bin.max.toFixed(0)}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="eff-hist-summary">{histogramSummary}</p>
          </section>
          </section>
        </section>
      </div>
    </main>
  );
}
