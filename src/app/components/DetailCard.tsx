import React from "react";
import { Waves, ArrowUp, CircleAlert } from "lucide-react";

interface DetailCardProps {
  tsunamiHeight?: number; // meters
  inundationHeight?: number; // meters
}

export function DetailCard({
  tsunamiHeight = 2.8,
  inundationHeight = 1.2,
}: DetailCardProps) {
  return (
    <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-5">
      {/* 카드 헤더 */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-700">
        <CircleAlert className="w-5 h-5 text-orange-400" />
        <h3 className="font-semibold">상세 정보</h3>
      </div>

      {/* 정보 그리드 */}
      <div className="space-y-4">
        {/* 예상 해일 높이 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-900/40 p-2 rounded-lg">
              <Waves className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-gray-400">예상 해일 높이</div>
              <div className="text-2xl font-bold text-white">
                {tsunamiHeight?.toFixed(1)}m
              </div>
            </div>
          </div>
        </div>

        {/* 침수 예상 높이 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-900/40 p-2 rounded-lg">
              <ArrowUp className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-xs text-gray-400">침수 예상 높이</div>
              <div className="text-2xl font-bold text-white">
                {inundationHeight && inundationHeight > 0
                  ? `${inundationHeight.toFixed(1)}m`
                  : "없음"}
              </div>
            </div>
          </div>
        </div>

        {/* 분석 근거 */}
        <div className="bg-[#252525] rounded-lg p-4 mt-4 border border-gray-700">
          <div className="text-xs text-gray-400 mb-2">분석 근거</div>
          <div className="text-sm text-gray-300">기압 변동 기반 AI 예측</div>
          <div className="text-xs text-gray-500 mt-2">
            최근 3시간 기압 변동률: -15.2 hPa/h
          </div>
        </div>

        {/* 추가 정보: 풍속 및 조위 정보는 제거됨 */}
      </div>
    </div>
  );
}
