#!/usr/bin/env node

/**
 * Firebase 에뮬레이터에 개발용 테스트 계정 생성 스크립트
 * 사용: node scripts/create-dev-account.js
 * 
 * 필수: Firebase 에뮬레이터가 실행 중이어야 함
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase 설정
const firebaseConfig = {
  apiKey: 'AIzaSyBReIS5S49RRK4OB2TaOVF2VMTz-TLsYl4',
  authDomain: 'prism-wedding-84b5d.firebaseapp.com',
  projectId: 'prism-wedding-84b5d',
  storageBucket: 'prism-wedding-84b5d.firebasestorage.app',
  messagingSenderId: '1074936442263',
  appId: '1:1074936442263:web:3dc59b00cd69d799ec68d2',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 에뮬레이터 연결
connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
connectFirestoreEmulator(db, '127.0.0.1', 8181);

// 테스트 계정 정보
const TEST_EMAIL = process.env.VITE_DEV_TEST_EMAIL || 'test@prism.com';
const TEST_PASSWORD = process.env.VITE_DEV_TEST_PASSWORD || 'testPassword123';

async function createDevAccount() {
  try {
    console.log('🔧 Firebase 에뮬레이터에 개발 계정 생성 중...');
    console.log(`📧 Email: ${TEST_EMAIL}`);
    console.log(`🔐 Password: ${TEST_PASSWORD}`);

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      TEST_EMAIL,
      TEST_PASSWORD
    );

    console.log('✅ 계정 생성 성공!');
    console.log(`   UID: ${userCredential.user.uid}`);
    console.log(`   Email: ${userCredential.user.email}`);
    console.log('\n💡 팁: 이제 로그인 페이지에서 아무것도 입력하지 않고 "로그인" 버튼을 클릭하면 자동으로 로그인됩니다.');

    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️  이미 존재하는 계정입니다.');
      console.log(`   Email: ${TEST_EMAIL}`);
      console.log('\n✅ 계정 생성을 건너뜁니다.');
      process.exit(0);
    } else {
      console.error('❌ 계정 생성 실패:', error.message);
      process.exit(1);
    }
  }
}

createDevAccount();
