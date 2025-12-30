import React, { useState } from "react";
import { StatusHeader } from "./components/StatusHeader";
import { AlertCard } from "./components/AlertCard/index";
import { MapView } from "./components/MapView";
import { DetailCard } from "./components/DetailCard";
import { ActionButtons } from "./components/ActionButtons";
import { RouteModal } from "./components/RouteModal";
import { BuildingInfoModal } from "./components/BuildingInfoModal";
import getAlertLevelFromHeight, {
  estimateInundationHeight,
  setLargeWaveMultiplier,
  computeRecommendedSafeFloor,
} from "./utils/tsunami";

export default function App() {
  // tsunami height in meters (would normally come from an API)
  const [tsunamiHeight, setTsunamiHeight] = useState<number>(1.2);

  // derive alert level from tsunami height using defined thresholds
  const alertLevel = getAlertLevelFromHeight(tsunamiHeight);

  // estimate inundation height from tsunami height (simple heuristic)
  const inundationHeight = estimateInundationHeight(tsunamiHeight);

  // compute recommended safe floor based on estimated inundation
  const recommendedSafeFloor = computeRecommendedSafeFloor(inundationHeight);

  // expose a small global setter so external code (backend websocket handler,
  // integration test, etc.) can update the app state when new data arrives.
  React.useEffect(() => {
    window.updateTsunamiHeight = (h: number) => {
      setTsunamiHeight(h);
    };
    // expose multiplier setter for quick testing from console
    (window as any).setInundationMultiplier = (m: number) => {
      setLargeWaveMultiplier(m);
    };
    return () => {
      try {
        delete window.updateTsunamiHeight;
        try {
          delete (window as any).setInundationMultiplier;
        } catch {}
      } catch {}
    };
  }, []);

  // (design choice) keep dynamic alert level behavior but keep the app frame
  // background static so overall app appearance remains like the original.
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  // API로 불러올 데이터를 시뮬레이션하는 상태
  const [shelterData, setShelterData] = useState({
    // 기존 구조 유지하되 값만 교체
    building_name: "해운대두산위브더제니스아파트",
    // RouteModal 등에서 사용하는 간단한 'name' 필드도 추가
    name: "해운대두산위브더제니스아파트",
    road_address: "부산광역시 해운대구 마린시티2로 33",
    // UI는 '층' 문자열을 기대하므로 문자열로 유지
    safe_from_floor: "1층",
    id: "2769",
    latitude: 35.1566275,
    longitude: 129.1450724,
  });

  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showBuildingInfoModal, setShowBuildingInfoModal] = useState(false);
  // create a display copy of shelterData that uses the computed recommended
  // safe floor so downstream components show the updated recommendation.
  const shelterDataForDisplay = {
    ...shelterData,
    safe_from_floor: recommendedSafeFloor,
  };
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
      {/* iPhone 프레임 */}
      <div
        className={`w-[390px] h-[844px] bg-[#111111] overflow-hidden relative border border-gray-800`}
      >
        {/* 스크롤 가능한 컨텐츠 영역 */}
        <div className="h-full overflow-y-auto">
          {/* 상단 상태 영역 */}
          <StatusHeader alertLevel={alertLevel} />

          {/* tsunamiHeight is now expected to come from backend; use
              `window.updateTsunamiHeight(value)` or a websocket to push updates. */}

          {/* 메인 컨텐츠 */}
          <div className="px-4 pb-6 pt-5 space-y-5">
            {/* (개발용 상태 전환 버튼 제거됨) */}

            {/* 핵심 경고 카드 */}
            <AlertCard
              alertLevel={alertLevel}
              shelterData={shelterDataForDisplay}
            />

            {/* 지도 영역 */}
            <MapView
              onLocationChange={setUserLocation}
              shelterData={shelterDataForDisplay}
            />

            {/* 상세 정보 카드 */}
            <DetailCard
              tsunamiHeight={tsunamiHeight}
              inundationHeight={inundationHeight}
            />

            {/* 하단 행동 버튼 */}
            <ActionButtons
              userLocation={userLocation}
              onShowRoute={() => setShowRouteModal(true)}
              onShowBuildingInfo={() => setShowBuildingInfoModal(true)}
              shelterData={shelterDataForDisplay}
            />
          </div>
        </div>
        {/* 경로 표시 모달 */}
        <RouteModal
          show={showRouteModal}
          onClose={() => setShowRouteModal(false)}
          userLocation={userLocation}
          shelterData={shelterDataForDisplay}
        />
        {/* 건물 정보 표시 모달 */}
        <BuildingInfoModal
          show={showBuildingInfoModal}
          onClose={() => setShowBuildingInfoModal(false)}
          shelterData={shelterDataForDisplay}
        />
      </div>
    </div>
  );
}
