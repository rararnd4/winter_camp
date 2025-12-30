import React from "react";
import { CircleCheck } from "lucide-react";
import { levelConfig } from "./config";

interface ShelterData {
  building_name?: string;
  road_address?: string;
}

interface SafeProps {
  shelterData?: ShelterData | null;
}

export function Safe({ shelterData }: SafeProps) {
  const config = levelConfig.safe;

  const building = shelterData?.building_name ?? config.building;
  const buildingDetail = shelterData?.road_address ?? config.buildingDetail;

  return (
    <div
      className={`bg-gradient-to-br ${config.bgGradient} border-2 ${config.border} rounded-xl p-5 shadow-xl`}
    >
      <div className="flex items-center gap-3 mb-4">
        <CircleCheck className="w-10 h-10 text-green-400" />
        <div>
          <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase inline-block mb-2">
            {config.badgeText}
          </div>
          <div className={`text-lg font-semibold ${config.textColor}`}>
            {config.statusText}
          </div>
        </div>
      </div>

      <div className="bg-green-800/40 border border-green-500 rounded-lg p-4 mt-4">
        <div className="text-xl font-semibold text-white">{building}</div>
        <div className="text-sm text-gray-300 mt-2">{buildingDetail}</div>
      </div>
    </div>
  );
}

export default Safe;
