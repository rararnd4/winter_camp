import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./styles/index.css";
import { registerServiceWorker } from "./firebase";

// Firebase 서비스 워커 등록
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
