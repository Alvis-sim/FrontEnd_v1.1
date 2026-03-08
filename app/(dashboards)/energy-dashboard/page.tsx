import type { Metadata } from "next";
import EnergyDashboard from "@/components/energy-dashboard";

export const metadata: Metadata = {
  title: "Energy Dashboard | Agenfic",
  description: "Live efficiency dashboard with interactive power graph"
};

export default function EnergyDashboardPage() {
  return <EnergyDashboard />;
}
