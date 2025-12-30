import React from 'react';
import { X, Building2, MapPin, ArrowUp } from 'lucide-react';

interface BuildingInfoModalProps {
  show: boolean;
  onClose: () => void;
  shelterData: {
    building_name: string;
    road_address: string;
    safe_from_floor: string;
  } | null;
}

export function BuildingInfoModal({ show, onClose, shelterData }: BuildingInfoModalProps) {
  if (!shelterData) {
    return null;
  }

  return (
    <div
      className={`absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="bg-[#1a1a1a] w-11/12 max-w-sm rounded-xl border-2 border-gray-700 flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h3 className="font-semibold text-lg">대피 건물 정보</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Building2 className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">건물명</p>
              <p className="text-lg font-semibold">{shelterData.building_name}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">주소</p>
              <p className="text-lg font-semibold">{shelterData.road_address}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ArrowUp className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">최소 안전 층수</p>
              <p className="text-lg font-semibold">{shelterData.safe_from_floor} 이상</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}