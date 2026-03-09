/**
 * Firebase 에뮬레이터에서 이메일 검증을 활성화하고 로그인 테스트
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  connectAuthEmulator,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase 설정
const firebaseConfig = {
  apiKey: 'AIzaSyDummyKeyForLocalEmulator123456789',
  authDomain: 'localhost',
  projectId: 'prism-wedding-84b5d',
  storageBucket: 'prism-wedding-84b5d.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456789',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 에뮬레이터 연결
connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
connectFirestoreEmulator(db, 'localhost', 8181);

console.log('🔗 Firebase 에뮬레이터에 연결됨');
console.log('📧 테스트 이메일: help@picme.kr');
console.log('🔐 테스트 비밀번호: 123123123!\n');

async function testLoginWithVerification() {
  try {
    const email = 'help@picme.kr';
    const password = '123123123!';

    console.log('1️⃣ 로그인 시도...');
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const user = credential.user;
      
      console.log('   📧 이메일:', user.email);
      console.log('   🆔 UID:', user.uid);
      console.log('   ✓ 이메일 검증:', user.emailVerified);
      
      if (!user.emailVerified) {
        console.log('\n⚠️ 문제: 이메일이 검증되지 않았습니다!');
        console.log('   현재 상태에서는 로그인이 차단됩니다 (LoginPage 참고)');
        
        console.log('\n💡 해결 방법:');
        console.log('   - 에뮬레이터 UI를 통해 이메일 검증 상태 수정');
        console.log('   - URL: http://localhost:4000/auth');
        console.log('   - 사용자: help@picme.kr 검색');
        console.log('   - 이메일 검증 상태 활성화');
      } else {
        console.log('   ✅ 이메일 검증됨!');
      }

    } catch (err) {
      console.log('   ❌ 로그인 실패:', err.message);
      console.log('   코드:', err.code);
    }

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    process.exit(0);
  }
}

// 테스트 실행
testLoginWithVerification();
