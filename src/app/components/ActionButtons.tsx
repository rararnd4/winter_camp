import React from 'react';
import { Navigation, Building2 } from 'lucide-react';

interface ActionButtonsProps {
  userLocation: { latitude: number; longitude: number } | null;
  onShowRoute: () => void;
  onShowBuildingInfo: () => void;
  shelterData: {
    id: string;
  } | null;
}

export function ActionButtons({
  userLocation,
  onShowRoute,
  onShowBuildingInfo,
  shelterData
}: ActionButtonsProps) {
  return (
    <div className="space-y-3 pb-8">
      {/* 대피 경로 보기 버튼 */}
      <button
        onClick={onShowRoute}
        disabled={!userLocation}
        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-5 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg border-2 border-orange-400 active:scale-95 min-h-[56px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Navigation className="w-6 h-6" />
        <span className="text-lg">대피 경로 보기</span>
      </button>

      {/* 건물 정보 보기 버튼 */}
      <button
        onClick={onShowBuildingInfo}
        disabled={!shelterData}
        className="w-full bg-[#1a1a1a] hover:bg-[#252525] text-white font-semibold py-5 px-6 rounded-xl flex items-center justify-center gap-3 transition-all border-2 border-gray-600 hover:border-gray-500 active:scale-95 min-h-[56px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Building2 className="w-6 h-6" />
        <span className="text-lg">건물 정보 보기</span>
      </button>
    </div>
  );
}
