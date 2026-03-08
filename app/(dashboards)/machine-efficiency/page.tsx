import type { Metadata } from "next";
import InfluentPumpEfficiency from "@/components/influent-pump-efficiency";

export const metadata: Metadata = {
  title: "Machine Efficiency | Agenfic",
  description:
    "Calculate pump machine efficiency from flow, head, and electrical telemetry without changing the energy dashboard page."
};

export default function MachineEfficiencyPage() {
  return <InfluentPumpEfficiency />;
}
