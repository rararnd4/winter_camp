import React from 'react';
import { Clock, Building2, ArrowUp, CircleCheck } from 'lucide-react';

interface AlertCardProps {
  alertLevel: 'safe' | 'caution' | 'warning' | 'critical';
  shelterData: {
    building_name: string;
    road_address: string;
    safe_from_floor: string;
  } | null;
}

export function AlertCard({ alertLevel, shelterData }: AlertCardProps) {
  // 각 위험 단계별 설정
  const levelConfig = {
    safe: {
      bgGradient: 'from-green-900/40 to-emerald-900/40',
      border: 'border-green-500',
      badgeBg: 'bg-green-600',
      badgeText: '안전',
      statusText: '대피 불필요',
      textColor: 'text-green-300',
      time: null,
      floorBg: 'bg-green-700',
      floorBorder: 'border-green-500',
    },
    caution: {
      bgGradient: 'from-yellow-900/50 to-amber-900/50',
      border: 'border-yellow-500',
      badgeBg: 'bg-yellow-600',
      badgeText: '주의',
      statusText: '상황 주시 필요',
      textColor: 'text-yellow-300',
      time: '45',
      floorBg: 'bg-yellow-700',
      floorBorder: 'border-yellow-500',
    },
    warning: {
      bgGradient: 'from-orange-900/50 to-red-900/50',
      border: 'border-orange-500',
      badgeBg: 'bg-orange-600',
      badgeText: '경고',
      statusText: '대피 준비 필요',
      textColor: 'text-orange-300',
      time: '25',
      floorBg: 'bg-orange-700',
      floorBorder: 'border-orange-500',
    },
    critical: {
      bgGradient: 'from-red-900/60 to-orange-900/60',
      border: 'border-red-500',
      badgeBg: 'bg-red-500',
      badgeText: '긴급',
      statusText: '즉시 대피 필요',
      textColor: 'text-red-300',
      time: '12',
      floorBg: 'bg-red-600',
      floorBorder: 'border-red-400',
    },
  };

  const config = levelConfig[alertLevel];

  // 안전 상태일 때는 다른 레이아웃
  if (alertLevel === 'safe') {
    return (
      <div className={`bg-gradient-to-br ${config.bgGradient} border-2 ${config.border} rounded-xl p-5 shadow-xl`}>
        <div className="flex items-center gap-3 mb-4">
          <CircleCheck className="w-10 h-10 text-green-400" />
          <div>
            <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase inline-block mb-2">
              {config.badgeText}
            </div>
            <div className={`text-lg font-semibold ${config.textColor}`}>{config.statusText}</div>
          </div>
        </div>
        
        <div className="bg-green-800/40 border border-green-500 rounded-lg p-4 mt-4">
          <div className="text-xl font-semibold text-white">정상 상태입니다</div>
          <div className="text-sm text-gray-300 mt-2">기상해일 위험 없음</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br ${config.bgGradient} border-2 ${config.border} rounded-xl p-5 shadow-xl`}>
      {/* 긴급 배지 */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`${config.badgeBg} text-white px-3 py-1 rounded-full text-xs font-bold uppercase ${alertLevel === 'critical' ? 'animate-pulse' : ''}`}>
          {config.badgeText}
        </div>
        <div className={`${config.textColor} text-sm`}>{config.statusText}</div>
      </div>

      {/* 예상 도달 시간 */}
      <div className="mb-5">
        <div className="flex items-center gap-2 text-gray-300 mb-2">
          <Clock className="w-5 h-5" />
          <span className="text-sm">예상 도달 시간</span>
        </div>
        <div className="text-5xl font-bold text-white">
          약 <span className={config.textColor}>{config.time}</span>분 후
        </div>
      </div>

      {/* 권장 대피 건물 */}
      <div className="mb-5">
        <div className="flex items-center gap-2 text-gray-300 mb-2">
          <Building2 className="w-5 h-5" />
          <span className="text-sm">권장 대피 건물</span>
        </div>
        <div className="text-xl font-semibold text-white">
          {shelterData?.building_name}
        </div>
        <div className="text-sm text-gray-400 mt-1">
          {shelterData?.road_address}
        </div>
      </div>

      {/* 최소 안전 대피 층수 - 가장 강조 */}
      <div className={`${config.floorBg} border-2 ${config.floorBorder} rounded-lg p-4 mt-4`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-white/80 mb-1">최소 안전 대피 층수</div>
            <div className="text-5xl font-black text-white flex items-baseline gap-2">
              <ArrowUp className="w-8 h-8" />
              {shelterData?.safe_from_floor}
              <span className="text-xl">이상</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/80">필수</div>
          </div>
        </div>
      </div>
    </div>
  );
}