export type AlertLevel = "safe" | "caution" | "warning" | "critical";

/**
 * Convert a tsunami height (meters) to an alert level.
 * Thresholds:
 * - <= 0.3 : safe
 * - >0.3 and <=0.8 : caution
 * - >0.8 and <1.5 : warning
 * - >=1.5 : critical
 */
export function getAlertLevelFromHeight(heightM: number): AlertLevel {
  if (Number.isNaN(heightM) || heightM == null) return "safe";

  if (heightM <= 0.3) return "safe";
  if (heightM > 0.3 && heightM <= 0.8) return "caution";
  if (heightM > 0.8 && heightM < 1.5) return "warning";
  return "critical";
}

export default getAlertLevelFromHeight;

/**
 * Estimate inundation (expected flooding) height from the tsunami height.
 *
 * NOTE: This is a simple heuristic estimator. Real inundation modeling depends on
 * local topography, tide, coastal defenses, and more. The function below uses a
 * conservative mapping to produce a reasonable display value for the UI.
 *
 * Assumptions used here:
 * - For very small waves (<= 0.3m) inundation is negligible (0m).
 * - Between 0.3 and 0.8m, inundation is smaller than the wave (factor 0.5).
 * - Between 0.8 and 1.5m, inundation is closer to the wave (factor 0.8).
 * - For >=1.5m, inundation may exceed the measured wave due to run-up (factor 1.2).
 */
// Configurable multiplier for run-up estimation. Default is 3.0.
// The multiplier is clamped to the range [2, 4] per user request (2x–4x).
let LARGE_WAVE_MULTIPLIER = 3.0;

export function setLargeWaveMultiplier(m: number) {
  if (typeof m === "number" && !Number.isNaN(m) && isFinite(m)) {
    // Clamp to [2,4] so estimates follow the user's requested range.
    LARGE_WAVE_MULTIPLIER = Math.max(2, Math.min(4, m));
  }
}

export function getLargeWaveMultiplier() {
  return LARGE_WAVE_MULTIPLIER;
}

/**
 * Estimate inundation (expected flooding) height from the tsunami height.
 *
 * New behavior: apply the configured run-up multiplier for any positive
 * tsunami height. This follows the user's request to use a 2x–4x multiplier
 * across the board (default 3x).
 */
export function estimateInundationHeight(heightM: number): number {
  if (heightM == null || Number.isNaN(heightM) || heightM <= 0) return 0;
  return roundTo(heightM * LARGE_WAVE_MULTIPLIER, 2);
}

/**
 * Compute a recommended safe evacuation floor string given an estimated
 * inundation height (meters).
 *
 * Simple model:
 * - floorHeight (m) is the vertical height of one floor (default 3m).
 * - We compute how many floors would be affected by inundation and then
 *   recommend being at least one floor above + extra safety floors.
 * - Returns a string like '3층' suitable for UI display.
 */
export function computeRecommendedSafeFloor(
  inundationM: number,
  floorHeight = 3,
  extraSafetyFloors = 1
): string {
  if (inundationM == null || Number.isNaN(inundationM) || inundationM <= 0) {
    return `1층`;
  }

  const floodedFloors = Math.ceil(inundationM / floorHeight);
  const recommended = Math.max(1, floodedFloors + 1 + extraSafetyFloors);
  return `${recommended}층`;
}

function roundTo(n: number, digits = 2) {
  const p = Math.pow(10, digits);
  return Math.round(n * p) / p;
}
