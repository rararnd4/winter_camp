import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyDkECs59wxMt6F-iOTScuGOx9sReF9iKI4",
  authDomain: "winter-came.firebaseapp.com",
  projectId: "winter-came",
  storageBucket: "winter-came.firebasestorage.app",
  messagingSenderId: "1044069050826",
  appId: "1:1044069050826:web:e9af770b733f7e66184733",
  measurementId: "G-Y33SGYH00S"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Messaging 인스턴스 (브라우저 환경에서만)
let messaging: Messaging | null = null;
if (typeof window !== 'undefined' && 'Notification' in window) {
  messaging = getMessaging(app);
}

export { app, analytics, messaging };

/**
 * 서버에 토큰 저장 함수
 * @param token FCM 토큰
 */
/**
 * 서버에 토큰 저장 함수
 * @param token FCM 토큰
 */
async function saveTokenToServer(token: string) {
  try {
    // Vercel Rewrite & Vite Proxy를 통해 우회 (CORS 해결)
    const response = await fetch("/api/fcm-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // API 명세에 맞춰 key를 fcm_token으로 변경
      body: JSON.stringify({ fcm_token: token }),
    });

    if (!response.ok) {
      throw new Error("서버 응답 오류");
    }
    console.log("FCM 토큰 서버 저장 성공");
  } catch (error) {
    console.error("FCM 토큰 서버 저장 실패:", error);
  }
}

/**
 * FCM 토큰 요청 함수
 * @returns FCM 토큰 또는 null
 */
export async function requestFCMToken(): Promise<string | null> {
  if (!messaging) {
    console.error("Messaging이 지원되지 않는 환경입니다.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      // 서비스 워커가 준비될 때까지 대기 (PushManager 에러 방지)
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        // 🔥 Firebase 콘솔 → 프로젝트 설정 → 클라우드 메시징 → Web Push 인증서에서 키 생성
        const token = await getToken(messaging, {
          vapidKey: "BFpkbbXxEvOdDthPFLUOLvpSL7QDFuNDrrJOSspumwKHMLyHsKFno9_1jkqRJOuiInZ7k0yv26Ex2T7wtq5PJWQ", // 🔥 여기에 VAPID 키를 넣으세요!
          serviceWorkerRegistration: registration, // 명시적으로 등록된 SW 전달
        });

        console.log("FCM Token:", token);
        
        // 서버에 토큰 저장
        await saveTokenToServer(token);
        
        return token;
      } else {
        console.error("Service Worker가 지원되지 않습니다.");
        return null;
      }
    } else {
      console.log("알림 권한이 거부되었습니다.");
      return null;
    }
  } catch (error) {
    console.error("FCM 토큰 요청 실패:", error);
    return null;
  }
}

/**
 * 포그라운드 메시지 리스너 설정
 */
export function setupForegroundMessaging() {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log("포그라운드 메시지 수신:", payload);

    if (payload.notification) {
      new Notification(payload.notification.title || "재난 알림", {
        body: payload.notification.body,
        icon: "/pwa-192x192.png",
      });
    }
  });
}

/**
 * 서비스 워커 등록
 */
export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      console.log("Service Worker 등록 성공:", registration);
      return registration;
    } catch (error) {
      console.error("Service Worker 등록 실패:", error);
      return null;
    }
  }
  return null;
}
