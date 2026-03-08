"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type MouseEvent } from "react";

type Source = "solar" | "wind" | "water";

type MachineSnapshot = {
  source: Source;
  label: string;
  bus: "AC" | "DC";
  converter: string;
  generatedKw: number;
  usableKw: number;
  storageKwh: number;
  storagePct: number;
  storageCapacityKwh: number;
  chargeKw: number;
  dischargeKw: number;
};

type Sample = {
  id: number;
  timestamp: number;
  machines: Record<Source, MachineSnapshot>;
  totalGeneratedKw: number;
  totalUsableKw: number;
  totalStoredKwh: number;
  totalStorageCapacityKwh: number;
  demandKw: number;
  demandDeltaKw: number;
  gridKw: number;
  batteryDispatchKw: number;
  chargeKw: number;
  curtailedKw: number;
  savingsUsd: number;
  tariffUsdPerKwh: number;
};

type MachineConfig = {
  label: string;
  bus: "AC" | "DC";
  converter: string;
  maxKw: number;
  minKw: number;
  converterEfficiency: number;
  storageCapacityKwh: number;
  initialStoragePct: number;
  maxChargeKw: number;
  maxDischargeKw: number;
};

const SOURCE_ORDER: Source[] = ["solar", "wind", "water"];
const MACHINE_CONFIG: Record<Source, MachineConfig> = {
  solar: {
    label: "Solar",
    bus: "DC",
    converter: "DC-DC + DC-AC",
    maxKw: 148,
    minKw: 0,
    converterEfficiency: 0.94,
    storageCapacityKwh: 120,
    initialStoragePct: 0.58,
    maxChargeKw: 44,
    maxDischargeKw: 38
  },
  wind: {
    label: "Wind",
    bus: "AC",
    converter: "AC-DC + DC-AC",
    maxKw: 132,
    minKw: 16,
    converterEfficiency: 0.92,
    storageCapacityKwh: 140,
    initialStoragePct: 0.52,
    maxChargeKw: 40,
    maxDischargeKw: 40
  },
  water: {
    label: "Water",
    bus: "AC",
    converter: "AC-DC + DC-AC",
    maxKw: 95,
    minKw: 52,
    converterEfficiency: 0.95,
    storageCapacityKwh: 160,
    initialStoragePct: 0.61,
    maxChargeKw: 36,
    maxDischargeKw: 34
  }
};

const MAX_BUFFER_SIZE = 900;
const UPDATE_MS = 1000;
const STEP_HOURS = UPDATE_MS / 3_600_000;
const WINDOW_OPTIONS = [60, 180, 300] as const;
const VIRTUAL_DAY_TICKS = 600;
const CHARGE_EFFICIENCY = 0.95;
const DISCHARGE_EFFICIENCY = 0.93;

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

const randomBetween = (min: number, max: number) => {
  return min + Math.random() * (max - min);
};

const round1 = (value: number) => {
  return Number(value.toFixed(1));
};

const toClockLabel = (timestamp: number) => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(timestamp);
};

const toMoney = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const getVirtualHour = (index: number) => {
  return ((index % VIRTUAL_DAY_TICKS) / VIRTUAL_DAY_TICKS) * 24;
};

const getTariffUsdPerKwh = (index: number) => {
  const hour = getVirtualHour(index);

  if (hour >= 17 && hour < 22) {
    return 0.31;
  }
  if (hour >= 8 && hour < 17) {
    return 0.24;
  }
  return 0.16;
};

const getSolarGeneration = (index: number, previousKw?: number) => {
  const config = MACHINE_CONFIG.solar;
  const phase = ((index % VIRTUAL_DAY_TICKS) / VIRTUAL_DAY_TICKS) * Math.PI * 2;
  const daylight = Math.max(Math.sin(phase - Math.PI / 2), 0);
  const cloudFactor = clamp(
    0.84 + Math.sin(index / 23) * 0.17 + Math.cos(index / 31) * 0.08,
    0.45,
    1.08
  );
  const target = config.maxKw * daylight * cloudFactor + randomBetween(-4, 4);
  const smoothed = previousKw === undefined ? target : previousKw * 0.68 + target * 0.32;
  return clamp(smoothed, config.minKw, config.maxKw);
};

const getWindGeneration = (index: number, previousKw?: number) => {
  const config = MACHINE_CONFIG.wind;
  const base = 58 + Math.sin(index / 11.5) * 24 + Math.sin(index / 4.4) * 12;
  const target = base + randomBetween(-6, 6);
  const smoothed = previousKw === undefined ? target : previousKw * 0.62 + target * 0.38;
  return clamp(smoothed, config.minKw, config.maxKw);
};

const getWaterGeneration = (index: number, previousKw?: number) => {
  const config = MACHINE_CONFIG.water;
  const base = 74 + Math.sin(index / 29) * 6 + Math.cos(index / 8.2) * 4;
  const target = base + randomBetween(-3, 3);
  const smoothed = previousKw === undefined ? target : previousKw * 0.76 + target * 0.24;
  return clamp(smoothed, config.minKw, config.maxKw);
};

const getDemand = (index: number, previousDemand?: number) => {
  const phase = ((index % VIRTUAL_DAY_TICKS) / VIRTUAL_DAY_TICKS) * Math.PI * 2;
  const daytimeLoad = 152 + Math.max(Math.sin(phase - Math.PI / 3), 0) * 68;
  const transientLoad = Math.sin(index / 9.2) * 18 + Math.cos(index / 3.8) * 10;
  const target = daytimeLoad + transientLoad + randomBetween(-5, 5);
  const smoothed = previousDemand === undefined ? target : previousDemand * 0.73 + target * 0.27;
  return clamp(smoothed, 98, 320);
};

const createMachineSnapshot = (
  source: Source,
  generatedKw: number,
  previousStorageKwh?: number
): MachineSnapshot => {
  const config = MACHINE_CONFIG[source];
  const fallbackStorage = config.storageCapacityKwh * config.initialStoragePct;
  const storageKwh = clamp(previousStorageKwh ?? fallbackStorage, 0, config.storageCapacityKwh);

  return {
    source,
    label: config.label,
    bus: config.bus,
    converter: config.converter,
    generatedKw,
    usableKw: generatedKw * config.converterEfficiency,
    storageKwh,
    storagePct: (storageKwh / config.storageCapacityKwh) * 100,
    storageCapacityKwh: config.storageCapacityKwh,
    chargeKw: 0,
    dischargeKw: 0
  };
};

const allocateCharge = (machines: MachineSnapshot[], availableKw: number) => {
  let remainingKw = availableKw;
  const ordered = [...machines].sort((a, b) => a.storagePct - b.storagePct);

  for (const machine of ordered) {
    if (remainingKw <= 0.0001) {
      break;
    }

    const config = MACHINE_CONFIG[machine.source];
    const headroomKwh = config.storageCapacityKwh - machine.storageKwh;
    if (headroomKwh <= 0.0001) {
      continue;
    }

    const headroomKw = headroomKwh / (STEP_HOURS * CHARGE_EFFICIENCY);
    const maxAcceptedKw = Math.min(config.maxChargeKw, headroomKw);
    const acceptedKw = Math.min(maxAcceptedKw, remainingKw);
    if (acceptedKw <= 0.0001) {
      continue;
    }

    machine.chargeKw += acceptedKw;
    machine.storageKwh += acceptedKw * STEP_HOURS * CHARGE_EFFICIENCY;
    remainingKw -= acceptedKw;
  }

  return {
    machines,
    appliedKw: availableKw - remainingKw
  };
};

const allocateDischarge = (machines: MachineSnapshot[], requiredKw: number) => {
  let remainingKw = requiredKw;
  const ordered = [...machines].sort((a, b) => b.storagePct - a.storagePct);

  for (const machine of ordered) {
    if (remainingKw <= 0.0001) {
      break;
    }

    const config = MACHINE_CONFIG[machine.source];
    const deliverableByEnergyKw = (machine.storageKwh * DISCHARGE_EFFICIENCY) / STEP_HOURS;
    const maxDeliverableKw = Math.min(config.maxDischargeKw, deliverableByEnergyKw);
    const dispatchKw = Math.min(maxDeliverableKw, remainingKw);
    if (dispatchKw <= 0.0001) {
      continue;
    }

    machine.dischargeKw += dispatchKw;
    machine.storageKwh -= (dispatchKw * STEP_HOURS) / DISCHARGE_EFFICIENCY;
    remainingKw -= dispatchKw;
  }

  return {
    machines,
    appliedKw: requiredKw - remainingKw
  };
};

const toMachineRecord = (machines: MachineSnapshot[]) => {
  const record = {} as Record<Source, MachineSnapshot>;
  for (const machine of machines) {
    record[machine.source] = machine;
  }
  return record;
};

const createSample = (index: number, timestamp: number, previous?: Sample): Sample => {
  const previousMachines = previous?.machines;
  const machines = SOURCE_ORDER.map((source) => {
    const previousMachine = previousMachines?.[source];
    const generatedKw =
      source === "solar"
        ? getSolarGeneration(index, previousMachine?.generatedKw)
        : source === "wind"
          ? getWindGeneration(index, previousMachine?.generatedKw)
          : getWaterGeneration(index, previousMachine?.generatedKw);

    return createMachineSnapshot(source, generatedKw, previousMachine?.storageKwh);
  });

  const demandKw = getDemand(index, previous?.demandKw);
  const demandDeltaKw = previous ? demandKw - previous.demandKw : 0;
  const totalUsableKw = machines.reduce((sum, machine) => sum + machine.usableKw, 0);

  let gridKw = 0;
  let batteryDispatchKw = 0;
  let chargeKw = 0;
  let curtailedKw = 0;

  if (totalUsableKw >= demandKw) {
    const excessKw = totalUsableKw - demandKw;
    const chargeResult = allocateCharge(machines, excessKw);
    chargeKw = chargeResult.appliedKw;
    curtailedKw = Math.max(excessKw - chargeKw, 0);
  } else {
    const deficitKw = demandKw - totalUsableKw;
    const dischargeResult = allocateDischarge(machines, deficitKw);
    batteryDispatchKw = dischargeResult.appliedKw;
    gridKw = Math.max(deficitKw - batteryDispatchKw, 0);
  }

  for (const machine of machines) {
    machine.storageKwh = clamp(machine.storageKwh, 0, machine.storageCapacityKwh);
    machine.storagePct = clamp((machine.storageKwh / machine.storageCapacityKwh) * 100, 0, 100);
    machine.generatedKw = round1(machine.generatedKw);
    machine.usableKw = round1(machine.usableKw);
    machine.storageKwh = round1(machine.storageKwh);
    machine.storagePct = round1(machine.storagePct);
    machine.chargeKw = round1(machine.chargeKw);
    machine.dischargeKw = round1(machine.dischargeKw);
  }

  const totalGeneratedKw = machines.reduce((sum, machine) => sum + machine.generatedKw, 0);
  const totalStoredKwh = machines.reduce((sum, machine) => sum + machine.storageKwh, 0);
  const totalStorageCapacityKwh = machines.reduce(
    (sum, machine) => sum + machine.storageCapacityKwh,
    0
  );
  const tariffUsdPerKwh = getTariffUsdPerKwh(index);
  const avoidedGridKw = Math.max(demandKw - gridKw, 0);
  const tickSavingsUsd = avoidedGridKw * STEP_HOURS * tariffUsdPerKwh;

  return {
    id: index,
    timestamp,
    machines: toMachineRecord(machines),
    totalGeneratedKw: round1(totalGeneratedKw),
    totalUsableKw: round1(totalUsableKw),
    totalStoredKwh: round1(totalStoredKwh),
    totalStorageCapacityKwh: round1(totalStorageCapacityKwh),
    demandKw: round1(demandKw),
    demandDeltaKw: round1(demandDeltaKw),
    gridKw: round1(gridKw),
    batteryDispatchKw: round1(batteryDispatchKw),
    chargeKw: round1(chargeKw),
    curtailedKw: round1(curtailedKw),
    savingsUsd: Number(((previous?.savingsUsd ?? 0) + tickSavingsUsd).toFixed(2)),
    tariffUsdPerKwh: Number(tariffUsdPerKwh.toFixed(2))
  };
};

const createInitialSeries = (count: number): Sample[] => {
  const now = Date.now();
  const start = now - count * UPDATE_MS;
  const samples: Sample[] = [];

  for (let i = 0; i < count; i += 1) {
    const previous = samples[samples.length - 1];
    samples.push(createSample(i, start + i * UPDATE_MS, previous));
  }

  return samples;
};

const getDemandTrend = (deltaKw: number) => {
  if (deltaKw > 0.3) {
    return {
      tone: "up",
      label: `Rising (+${deltaKw.toFixed(1)} kW/s)`
    };
  }
  if (deltaKw < -0.3) {
    return {
      tone: "down",
      label: `Falling (${deltaKw.toFixed(1)} kW/s)`
    };
  }

  return {
    tone: "flat",
    label: `Steady (${deltaKw.toFixed(1)} kW/s)`
  };
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

export default function EnergyDashboard() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [windowSize, setWindowSize] = useState<number>(180);
  const [isLive, setIsLive] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSamples(createInitialSeries(320));
      setIsInitialized(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!isLive || !isInitialized) {
      return;
    }

    const timer = window.setInterval(() => {
      setSamples((current) => {
        const previous = current[current.length - 1];
        const nextId = previous ? previous.id + 1 : 0;
        const nextSample = createSample(nextId, Date.now(), previous);
        return [...current, nextSample].slice(-MAX_BUFFER_SIZE);
      });
    }, UPDATE_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [isLive, isInitialized]);

  const visibleSamples = useMemo(() => {
    return samples.slice(-windowSize);
  }, [samples, windowSize]);

  if (visibleSamples.length === 0) {
    return (
      <main className="dashboard-shell">
        <div className="dashboard-background" aria-hidden="true" />

        <section className="dashboard">
          <header className="dashboard-header">
            <div>
              <p className="eyebrow">Hybrid Renewable Plant</p>
              <h1>Machine Feed Simulator</h1>
              <p className="description">
                Starting simulated machine telemetry and calibrating demand/storage model.
              </p>
            </div>
          </header>

          <section className="panel loading-panel" aria-live="polite">
            <p>Initializing sensor feed...</p>
            <div className="loading-bar" />
          </section>
        </section>
      </main>
    );
  }

  const currentSample = visibleSamples[visibleSamples.length - 1];
  const activeIndex = hoveredIndex ?? visibleSamples.length - 1;
  const safeIndex = clamp(activeIndex, 0, visibleSamples.length - 1);
  const activeSample = visibleSamples[safeIndex];

  const demandTrend = getDemandTrend(currentSample.demandDeltaKw);
  const storagePct =
    currentSample.totalStorageCapacityKwh > 0
      ? (currentSample.totalStoredKwh / currentSample.totalStorageCapacityKwh) * 100
      : 0;
  const gridOffsetPct =
    currentSample.demandKw > 0
      ? ((currentSample.demandKw - currentSample.gridKw) / currentSample.demandKw) * 100
      : 0;
  const avgDemandKw =
    visibleSamples.reduce((sum, sample) => sum + sample.demandKw, 0) / visibleSamples.length;
  const generatedWindowKwh =
    visibleSamples.reduce((sum, sample) => sum + sample.totalGeneratedKw, 0) * STEP_HOURS;
  const gridWindowKwh = visibleSamples.reduce((sum, sample) => sum + sample.gridKw, 0) * STEP_HOURS;

  const chartWidth = 920;
  const chartHeight = 360;
  const padding = { top: 24, right: 54, bottom: 38, left: 56 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const valueMax = Math.max(
    ...visibleSamples.map((sample) => {
      return Math.max(sample.demandKw, sample.totalGeneratedKw, sample.gridKw);
    })
  );
  const yMin = 0;
  const yMax = Math.max(40, Math.ceil((valueMax + 12) / 10) * 10);
  const yRange = Math.max(yMax - yMin, 1);

  const xForIndex = (index: number) => {
    const segments = Math.max(visibleSamples.length - 1, 1);
    return padding.left + (index / segments) * plotWidth;
  };

  const yForValue = (value: number) => {
    return padding.top + ((yMax - value) / yRange) * plotHeight;
  };

  const demandPath = buildChartPath(
    visibleSamples.map((sample) => sample.demandKw),
    xForIndex,
    yForValue
  );
  const renewablePath = buildChartPath(
    visibleSamples.map((sample) => sample.totalGeneratedKw),
    xForIndex,
    yForValue
  );
  const gridPath = buildChartPath(
    visibleSamples.map((sample) => sample.gridKw),
    xForIndex,
    yForValue
  );

  const hoverX = xForIndex(safeIndex);
  const hoverDemandY = yForValue(activeSample.demandKw);
  const hoverRenewableY = yForValue(activeSample.totalGeneratedKw);
  const hoverGridY = yForValue(activeSample.gridKw);
  const noteOnRight = hoverX < chartWidth - padding.right - 128;
  const noteX = noteOnRight ? hoverX + 10 : hoverX - 10;
  const noteAnchor = noteOnRight ? "start" : "end";
  const demandNoteY = clamp(hoverDemandY - 14, padding.top + 14, chartHeight - padding.bottom - 10);
  const renewableNoteY = clamp(
    hoverRenewableY + 2,
    padding.top + 14,
    chartHeight - padding.bottom - 10
  );
  const gridNoteY = clamp(hoverGridY + 18, padding.top + 14, chartHeight - padding.bottom - 10);

  const axisTicks = Array.from({ length: 6 }, (_, index) => {
    const ratio = index / 5;
    return {
      y: padding.top + ratio * plotHeight,
      label: (yMax - ratio * yRange).toFixed(0)
    };
  });

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = ((event.clientX - bounds.left) / bounds.width) * chartWidth;
    const clampedX = clamp(relativeX, padding.left, chartWidth - padding.right);
    const ratio = (clampedX - padding.left) / plotWidth;
    const index = Math.round(ratio * (visibleSamples.length - 1));
    setHoveredIndex(index);
  };

  return (
    <main className="dashboard-shell">
      <div className="dashboard-background" aria-hidden="true" />

      <section className="dashboard">
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
            <p className="eyebrow">Hybrid Renewable Plant</p>
            <h1>Machine Feed Simulator</h1>
            <p className="description">
              Simulated Solar (DC), Wind (AC), and Water (AC) machines stream telemetry every
              second, including storage, demand slope, grid draw, and avoided cost.
            </p>
          </div>

          <div className="header-controls">
            <label htmlFor="window-size">History</label>
            <select
              id="window-size"
              value={windowSize}
              onChange={(event) => {
                setWindowSize(Number(event.target.value));
              }}
            >
              {WINDOW_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  Last {value}s
                </option>
              ))}
            </select>

            <button
              type="button"
              className="live-toggle"
              onClick={() => {
                setIsLive((value) => !value);
              }}
            >
              {isLive ? "Pause Feed" : "Resume Feed"}
            </button>
          </div>
        </header>

        <section className="kpi-grid" aria-label="Key metrics">
          <article className="kpi-card">
            <h2>Generated Now</h2>
            <p>{currentSample.totalGeneratedKw.toFixed(1)} kW</p>
            <span className="kpi-sub">Usable {currentSample.totalUsableKw.toFixed(1)} kW</span>
          </article>

          <article className="kpi-card">
            <h2>Stored Energy</h2>
            <p>{currentSample.totalStoredKwh.toFixed(1)} kWh</p>
            <span className="kpi-sub">{storagePct.toFixed(1)}% of total capacity</span>
          </article>

          <article className="kpi-card">
            <h2>Demand</h2>
            <p>{currentSample.demandKw.toFixed(1)} kW</p>
            <span className={`kpi-sub ${demandTrend.tone}`}>{demandTrend.label}</span>
          </article>

          <article className="kpi-card">
            <h2>Grid Consumption</h2>
            <p>{currentSample.gridKw.toFixed(1)} kW</p>
            <span className="kpi-sub">Grid offset {gridOffsetPct.toFixed(1)}%</span>
          </article>

          <article className="kpi-card">
            <h2>Battery Dispatch</h2>
            <p>{currentSample.batteryDispatchKw.toFixed(1)} kW</p>
            <span className="kpi-sub">Charging {currentSample.chargeKw.toFixed(1)} kW</span>
          </article>

          <article className="kpi-card">
            <h2>Cost Savings</h2>
            <p>{toMoney(currentSample.savingsUsd)}</p>
            <span className="kpi-sub">Tariff {toMoney(currentSample.tariffUsdPerKwh)}/kWh</span>
          </article>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Generation vs Demand vs Grid</h2>
            <p>
              Hover point: <strong>{toClockLabel(activeSample.timestamp)}</strong> | Generated{" "}
              <strong>{activeSample.totalGeneratedKw.toFixed(1)} kW</strong> | Demand{" "}
              <strong>{activeSample.demandKw.toFixed(1)} kW</strong> | Grid{" "}
              <strong>{activeSample.gridKw.toFixed(1)} kW</strong>
            </p>
          </div>

          <div
            className="chart-wrap"
            onMouseMove={handleMove}
            onMouseLeave={() => {
              setHoveredIndex(null);
            }}
          >
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Power balance chart">
              {axisTicks.map((tick) => (
                <g key={tick.y}>
                  <line
                    className="grid-line"
                    x1={padding.left}
                    y1={tick.y}
                    x2={chartWidth - padding.right}
                    y2={tick.y}
                  />
                  <text className="axis-label left" x={padding.left - 10} y={tick.y + 4}>
                    {tick.label}
                  </text>
                </g>
              ))}

              <line
                className="axis-baseline"
                x1={padding.left}
                y1={chartHeight - padding.bottom}
                x2={chartWidth - padding.right}
                y2={chartHeight - padding.bottom}
              />

              <path className="demand-line" d={demandPath} />
              <path className="renewable-line" d={renewablePath} />
              <path className="grid-load-line" d={gridPath} />

              <line
                className="hover-line"
                x1={hoverX}
                y1={padding.top}
                x2={hoverX}
                y2={chartHeight - padding.bottom}
              />

              <circle className="demand-dot" cx={hoverX} cy={hoverDemandY} r="4.5" />
              <circle className="renewable-dot" cx={hoverX} cy={hoverRenewableY} r="4.5" />
              <circle className="grid-load-dot" cx={hoverX} cy={hoverGridY} r="4.5" />

              <text className="demand-note" x={noteX} y={demandNoteY} textAnchor={noteAnchor}>
                {activeSample.demandKw.toFixed(1)} kW
              </text>
              <text className="renewable-note" x={noteX} y={renewableNoteY} textAnchor={noteAnchor}>
                {activeSample.totalGeneratedKw.toFixed(1)} kW
              </text>
              <text className="grid-note" x={noteX} y={gridNoteY} textAnchor={noteAnchor}>
                {activeSample.gridKw.toFixed(1)} kW
              </text>

              <text className="axis-title left" x={padding.left} y={16}>
                Power (kW)
              </text>
            </svg>
          </div>

          <div className="legend">
            <span className="legend-demand">Demand</span>
            <span className="legend-renewable">Generated</span>
            <span className="legend-grid">Grid Draw</span>
            <span className="legend-status">Live feed: {isLive ? "On" : "Paused"}</span>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Machine Telemetry Feed</h2>
            <p>
              Per-machine stream with converter losses and storage state. Curtailment:{" "}
              <strong>{currentSample.curtailedKw.toFixed(1)} kW</strong>.
            </p>
          </div>

          <div className="machine-grid">
            {SOURCE_ORDER.map((source) => {
              const machine = currentSample.machines[source];
              const flowLabel =
                machine.chargeKw > 0.2
                  ? `Charging ${machine.chargeKw.toFixed(1)} kW`
                  : machine.dischargeKw > 0.2
                    ? `Discharging ${machine.dischargeKw.toFixed(1)} kW`
                    : "Storage idle";

              return (
                <article className="machine-card" key={source}>
                  <div className="machine-title">
                    <h3>{machine.label}</h3>
                    <span className="machine-bus">{machine.bus}</span>
                  </div>
                  <p className="machine-line">{machine.generatedKw.toFixed(1)} kW generated</p>
                  <p className="machine-line">
                    {machine.usableKw.toFixed(1)} kW after {machine.converter}
                  </p>

                  <div className="storage-meter" aria-hidden="true">
                    <span style={{ width: `${machine.storagePct.toFixed(0)}%` }} />
                  </div>
                  <p className="machine-storage">
                    Stored {machine.storageKwh.toFixed(1)} / {machine.storageCapacityKwh.toFixed(0)}{" "}
                    kWh ({machine.storagePct.toFixed(0)}%)
                  </p>
                  <p className="machine-flow">{flowLabel}</p>
                </article>
              );
            })}
          </div>

          <p className="hist-footnote">
            Last {windowSize}s: generated {generatedWindowKwh.toFixed(2)} kWh, grid consumed{" "}
            {gridWindowKwh.toFixed(2)} kWh, average demand {avgDemandKw.toFixed(1)} kW.
          </p>
        </section>
      </section>
    </main>
  );
}
