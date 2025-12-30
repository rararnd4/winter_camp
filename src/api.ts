export interface BuildingResult {
  id: number;
  site_address: string | null;
  building_name: string;
  road_address: string;
  sigungu_code: string | null;
  legal_dong_code: string | null;
  bun: string | null;
  ji: string | null;
  main_use_name: string | null;
  above_ground_floors: number | null;
  height_m: number | null;
  use_approval_date: string | null;
  seismic_design_applied: boolean | null;
  latitude: number | null;
  longitude: number | null;
  effective_height_m: number | null;
  distance_m: number | null;
  safety_clearance_m: number | null;
  safe_from_floor: number | null;
}

export interface SafetyResponse {
  tsunami_height_m: number;
  safety_margin_m: number;
  required_height_m: number;
  required_floors: number;
  results: BuildingResult[];
}

export interface TsunamiPredictionRecord {
  id: number;
  risk_level: "안전" | "주의" | "위험" | "긴급";
  predicted_arrival_time: string | null;
  predicted_flood_height_m: number;
  predicted_wave_height_m: number;
  created_at: string;
}

/**
 * 가장 가까운 안전한 건물 검색
 * @param latitude 위도
 * @param longitude 경도
 */
export async function fetchNearestSafeBuilding(latitude: number, longitude: number): Promise<SafetyResponse | null> {
  try {
    // Vercel Rewrite & Vite Proxy를 통해 우회 (CORS 해결)
    const response = await fetch("/api/nearest-safe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ latitude, longitude }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch nearest safe building");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching nearest safe building:", error);
    return null;
  }
}

/**
 * 최신 기상해일 예측 정보 조회
 */
export async function fetchLatestTsunamiPrediction(): Promise<TsunamiPredictionRecord | null> {
  try {
    // Vercel Rewrite & Vite Proxy를 통해 우회 (CORS 해결)
    const response = await fetch("/api/tsunami-predictions/latest");

    if (!response.ok) {
      throw new Error("Failed to fetch latest tsunami prediction");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching latest tsunami prediction:", error);
    return null;
  }
}
