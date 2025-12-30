'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation } from 'lucide-react';

// TypeScript에서 window.kakao를 인식할 수 있도록 타입을 확장합니다.
declare global {
  interface Window {
    kakao: any;
  }
}

const KAKAO_MAP_API_KEY = '50bfd9f0c3929d6ad2f2f5e81198ca92';

interface MapViewProps {
  onLocationChange: (location: { latitude: number; longitude: number } | null) => void;
  shelterData: {
    latitude: number;
    longitude: number;
  } | null;
}

export function MapView({ onLocationChange, shelterData }: MapViewProps) {
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null); // 지도 인스턴스를 ref로 관리
  const markersRef = useRef<any[]>([]); // 마커 인스턴스들을 ref로 관리
  const polylineRef = useRef<any>(null); // 폴리라인 인스턴스를 ref로 관리

  // '현재 위치' 버튼 클릭 시 실행되는 함수
  const handleShowMap = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          onLocationChange({ latitude: position.coords.latitude, longitude: position.coords.longitude });
          setShowMap(true); // 지도 표시 상태로 전환
        },
        (error) => {
          console.error("Geolocation error: ", error);
          if (error.code === error.PERMISSION_DENIED) {
            alert("위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.");
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            alert("현재 위치 정보를 사용할 수 없습니다.");
          } else if (error.code === error.TIMEOUT) {
            alert("위치 정보 요청 시간이 초과되었습니다.");
          } else {
            alert("현재 위치를 가져올 수 없습니다.");
          }
        },
        {
          enableHighAccuracy: false, // 배터리 소모를 줄이고 응답 속도를 높임 (실패 확률 감소)
          timeout: 60000,            // 60초 대기 (사용자가 고민할 시간 충분히 부여)
          maximumAge: 0
        }
      );
    } else {
      alert("이 브라우저에서는 Geolocation이 지원되지 않습니다.");
    }
  };

  // 컴포넌트 마운트 시 카카오 지도 스크립트를 동적으로 로드합니다.
  useEffect(() => {
    // 스크립트가 이미 로드되어 window.kakao 객체가 존재하면, 바로 isScriptLoaded를 true로 설정합니다.
    if (window.kakao && window.kakao.maps) {
      setIsScriptLoaded(true);
      return;
    }

    // 기존에 스크립트 태그가 이미 추가되어 있는지 확인합니다.
    const existingScript = document.getElementById('kakao-map-script');
    if (existingScript) return;

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&autoload=false&libraries=services`;
    script.async = true;
    script.id = 'kakao-map-script';
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        setIsScriptLoaded(true);
      });
    };

    script.onerror = () => {
      console.error("카카오 지도 스크립트를 불러오는 데 실패했습니다. API 키와 도메인 설정을 확인해주세요.");
    };

  }, []); // 최초 렌더링 시에만 실행

  // 지도 생성 및 업데이트 로직
  useEffect(() => {
    // 스크립트 로딩, 지도 표시 여부, 위치 정보가 모두 준비되면 실행
    if (isScriptLoaded && showMap && location && shelterData && mapContainerRef.current) {
      window.kakao.maps.load(() => {
        const userPosition = new window.kakao.maps.LatLng(location.latitude, location.longitude);
        const shelterPosition = new window.kakao.maps.LatLng(shelterData.latitude, shelterData.longitude);
        
        // 지도가 아직 생성되지 않았다면 새로 생성
        if (!mapRef.current) {
          const mapOption = {
            center: userPosition,
            level: 3,
          };
          mapRef.current = new window.kakao.maps.Map(mapContainerRef.current, mapOption);
        }

        const currentMap = mapRef.current;

        // 기존 마커 제거
        markersRef.current.forEach(marker => marker.setMap(null));
        if (polylineRef.current) {
          polylineRef.current.setMap(null);
        }
        markersRef.current = [];

        // 1. 마커 생성 및 ref에 추가
        const userMarker = new window.kakao.maps.Marker({ map: currentMap, position: userPosition });
        const shelterMarker = new window.kakao.maps.Marker({ map: currentMap, position: shelterPosition });
        markersRef.current.push(userMarker, shelterMarker);

        // 2. 경로(Polyline) 생성 및 ref에 추가
        const polyline = new window.kakao.maps.Polyline({
          path: [userPosition, shelterPosition],
          strokeWeight: 5,
          strokeColor: '#10b981', // Tailwind green-500
          strokeOpacity: 0.8,
          strokeStyle: 'shortdash'
        });
        polyline.setMap(currentMap);
        polylineRef.current = polyline;
        
        // 3. 두 마커가 모두 보이도록 지도 범위 조정
        const bounds = new window.kakao.maps.LatLngBounds();
        bounds.extend(userPosition);
        bounds.extend(shelterPosition);
        currentMap.setBounds(bounds);
      });
    }
  }, [isScriptLoaded, showMap, location, shelterData]);

  return (
    <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl overflow-hidden">
      {/* 지도 헤더 */}
      <div className="bg-[#222222] px-4 py-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">대피 경로 지도</div>
          <button
            onClick={handleShowMap}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Navigation className="w-4 h-4" />
            <span>현재 위치</span>
          </button>
        </div>
      </div>

      {/* 지도 표시 영역 */}
      <div className="relative h-48 bg-gradient-to-b from-gray-800 to-gray-900">
        {showMap ? (
          // '현재 위치' 버튼 클릭 후, 카카오 지도를 표시할 div
          <div id="map" ref={mapContainerRef} className="w-full h-full"></div>
        ) : (
          // 초기 상태의 정적 지도 UI
          <>
            <svg className="absolute inset-0 w-full h-full opacity-20">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-red-600/40 to-transparent">
              <div className="absolute bottom-2 left-2 text-xs text-red-300 bg-red-900/80 px-2 py-1 rounded">
                침수 예상 지역
              </div>
            </div>
            <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="absolute -inset-2 bg-blue-500/30 rounded-full animate-ping"></div>
                <div className="relative bg-blue-500 rounded-full p-2 border-2 border-white">
                  <Navigation className="w-4 h-4 text-white" fill="white" />
                </div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs bg-blue-600 text-white px-2 py-1 rounded">
                  현재 위치
                </div>
              </div>
            </div>
            <div className="absolute top-1/4 right-1/4 transform translate-x-1/2">
              <div className="relative">
                <div className="bg-green-500 rounded-full p-2 border-2 border-white shadow-lg">
                  <MapPin className="w-5 h-5 text-white" fill="white" />
                </div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs bg-green-600 text-white px-2 py-1 rounded">
                  대피 건물
                </div>
              </div>
            </div>
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path
                d="M 130 95 Q 200 70 270 60"
                stroke="#10b981"
                strokeWidth="3"
                fill="none"
                strokeDasharray="5,5"
                className="animate-pulse"
              />
            </svg>
          </>
        )}
      </div>

      {/* 지도 범례 */}
      <div className="bg-[#222222] px-4 py-3 border-t border-gray-700 flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-400">현재 위치</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-400">대피 건물</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500/60 rounded"></div>
          <span className="text-gray-400">침수 예상</span>
        </div>
      </div>
    </div>
  );
}
