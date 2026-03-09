import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase 설정 (프리즘 스튜디오 프로젝트)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firebase 서비스 초기화
export const auth = getAuth(app);
export const db = getFirestore(app);

// 로컬 에뮬레이터 연결 (개발 환경)
const useEmulator = import.meta.env.VITE_USE_EMULATOR === 'true';
if (useEmulator && typeof window !== 'undefined') {
  // 에뮬레이터가 이미 연결되었는지 확인
  if (!auth.emulatorConfig) {
    connectAuthEmulator(auth, `http://localhost:${import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_PORT || '9099'}`, {
      disableWarnings: true,
    });
  }
  
  if (!db.emulatorConfig) {
    connectFirestoreEmulator(db, 'localhost', parseInt(import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT || '8181'));
  }
  
  console.log('✅ Firebase 에뮬레이터 연결됨');
}

export default app;
