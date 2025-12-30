export {};

declare global {
  interface Window {
    // Call this from outside (e.g. backend websocket handler) to update app state
    updateTsunamiHeight?: (heightM: number) => void;
  }
}

export {};
