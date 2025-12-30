import React from 'react';
import { X } from 'lucide-react';

interface RouteModalProps {
  show: boolean;
  onClose: () => void;
  userLocation: { latitude: number; longitude: number } | null;
  shelterData: {
    name: string;
    latitude: number;
    longitude: number;
  } | null;
}

export function RouteModal({ show, onClose, userLocation, shelterData }: RouteModalProps) {
  if (!userLocation || !shelterData) {
    return null;
  }

  const startName = encodeURIComponent('현재위치');
  const endName = encodeURIComponent(shelterData.name);
  const url = `https://map.kakao.com/link/from/${startName},${userLocation.latitude},${userLocation.longitude}/to/${endName},${shelterData.latitude},${shelterData.longitude}`;

  return (
    <div
      className={`absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="bg-[#1a1a1a] w-11/12 h-5/6 max-w-sm max-h-[700px] rounded-xl border-2 border-gray-700 flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h3 className="font-semibold text-lg">대피 경로</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-grow w-full h-full">
          <iframe src={url} title="대피 경로" className="w-full h-full border-0" />
        </div>
      </div>
    </div>
  );
}