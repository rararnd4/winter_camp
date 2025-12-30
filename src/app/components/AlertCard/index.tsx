import React from "react";
import { Safe } from "./Safe";
import { Caution } from "./Caution";
import { Warning } from "./Warning";
import { Critical } from "./Critical";

export type AlertLevel = "safe" | "caution" | "warning" | "critical";

interface ShelterData {
  building_name?: string;
  road_address?: string;
  safe_from_floor?: string;
}

interface AlertCardProps {
  alertLevel: AlertLevel;
  shelterData?: ShelterData | null;
}

export function AlertCard({ alertLevel, shelterData }: AlertCardProps) {
  switch (alertLevel) {
    case "safe":
      return <Safe shelterData={shelterData} />;
    case "caution":
      return <Caution shelterData={shelterData} />;
    case "warning":
      return <Warning shelterData={shelterData} />;
    case "critical":
      return <Critical shelterData={shelterData} />;
    default:
      return <Safe shelterData={shelterData} />;
  }
}

export default AlertCard;
