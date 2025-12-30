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
import { requestFCMToken, setupForegroundMessaging } from "../firebase";
import { fetchLatestTsunamiPrediction, fetchNearestSafeBuilding } from "../api";

export default function App() {
  // tsunami height in meters (default 0.2, updated from API)
  const [tsunamiHeight, setTsunamiHeight] = useState<number>(0.2);
  // inundation height in meters (separated from heuristic to support API values)
  const [inundationHeight, setInundationHeight] = useState<number>(estimateInundationHeight(0.2));

  // derive alert level from tsunami height using defined thresholds
  const alertLevel = getAlertLevelFromHeight(tsunamiHeight);

  // compute recommended safe floor based on estimated inundation
  const recommendedSafeFloor = computeRecommendedSafeFloor(inundationHeight);

  // expose a small global setter so external code (backend websocket handler,
  // integration test, etc.) can update the app state when new data arrives.
  React.useEffect(() => {
    window.updateTsunamiHeight = (h: number) => {
      setTsunamiHeight(h);
      setInundationHeight(estimateInundationHeight(h)); // Keep simulation sync
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

  // Initialize Firebase Cloud Messaging & Fetch Tsunami Data
  React.useEffect(() => {
    const initApp = async () => {
      // 1. FCM 초기화
      const token = await requestFCMToken();
      if (token) {
        console.log("FCM Token initialized:", token);
      }
      setupForegroundMessaging();

      // 2. 최신 기상해일 예측 정보 가져오기
      const prediction = await fetchLatestTsunamiPrediction();
      if (prediction) {
        console.log("Latest Tsunami Prediction:", prediction);
        // API에서 반환된 값을 그대로 사용 (0이면 0으로 표시)
        setTsunamiHeight(prediction.predicted_wave_height_m);
        setInundationHeight(prediction.predicted_flood_height_m);
      }
    };
    initApp();
  }, []);

  // (design choice) keep dynamic alert level behavior but keep the app frame
  // background static so overall app appearance remains like the original.
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // API로 불러올 데이터를 시뮬레이션하는 상태 -> 실제 API 데이터로 교체
  const [shelterData, setShelterData] = useState({
    // 기본값 (로딩 전 표시용)
    building_name: "안전한 대피소 검색 중...",
    name: "검색 중...",
    road_address: "-",
    safe_from_floor: "-", // 계산된 값으로 대체됨
    id: "0",
    latitude: 35.1566275, // 기본값 (부산 예시)
    longitude: 129.1450724,
  });

  // 위치가 변경되면 가장 가까운 안전 건물 검색
  React.useEffect(() => {
    if (userLocation) {
      const fetchShelter = async () => {
        const result = await fetchNearestSafeBuilding(userLocation.latitude, userLocation.longitude);
        if (result && result.results.length > 0) {
          const nearest = result.results[0];
          console.log("Nearest Safe Building:", nearest);
          
          setShelterData({
            building_name: nearest.building_name,
            name: nearest.building_name,
            road_address: nearest.road_address,
            safe_from_floor: `${nearest.safe_from_floor || 1}층`,
            id: String(nearest.id),
            latitude: nearest.latitude || userLocation.latitude,
            longitude: nearest.longitude || userLocation.longitude,
          });
        }
      };
      fetchShelter();
    }
  }, [userLocation]);

  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showBuildingInfoModal, setShowBuildingInfoModal] = useState(false);
  // create a display copy of shelterData that uses the computed recommended
  // safe floor so downstream components show the updated recommendation.
  const shelterDataForDisplay = {
    ...shelterData,
    safe_from_floor: recommendedSafeFloor, // API 결과보다는 현재 파고 기반 계산값 우선 사용 (더 안전함)
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
