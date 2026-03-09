/**
 * Firebase 에뮬레이터에서 로그인 테스트
 * 실행: node test-login.js
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, setDoc } from 'firebase/firestore';

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

async function testLogin() {
  try {
    const email = 'help@picme.kr';
    const password = '123123123!';

    // 1. 기존 계정 확인 후 삭제
    console.log('1️⃣ 기존 계정 확인...');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('   ✅ 계정 이미 존재');
      
      const currentUser = auth.currentUser;
      if (currentUser) {
        console.log('   📌 현재 사용자:', currentUser.email);
        console.log('   📌 이메일 검증:', currentUser.emailVerified);
      }
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        console.log('   ℹ️ 기존 계정 없음, 새로 생성합니다');
      } else {
        console.log('   ❌ 로그인 실패:', err.message);
      }
    }

    // 2. 새 계정 생성
    console.log('\n2️⃣ 계정 생성...');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('   ✅ 계정 생성 성공');
      console.log('   📧 이메일:', user.email);
      console.log('   🆔 UID:', user.uid);
      console.log('   ✓ 이메일 검증:', user.emailVerified);

      // 3. Firestore에 사용자 정보 저장
      console.log('\n3️⃣ Firestore에 사용자 정보 저장...');
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: '테스트 사용자',
        photoURL: '',
        createdAt: new Date(),
        lastLogin: new Date(),
        settings: {
          notifications: {
            uploadComplete: true,
            orderStatusChange: true,
            downloadReady: true,
            marketing: false,
          },
        },
      });
      console.log('   ✅ Firestore 저장 완료');

      // 4. 이메일 검증 전송 (에뮬레이터에서는 실제로 전송되지 않음)
      console.log('\n4️⃣ 이메일 검증 전송...');
      try {
        await sendEmailVerification(user);
        console.log('   ✅ 검증 이메일 전송 (에뮬레이터)');
      } catch (err) {
        console.log('   ⚠️ 검증 이메일 전송 실패 (예상된 동작):', err.code);
      }

      // 5. 로그아웃
      console.log('\n5️⃣ 로그아웃...');
      await signOut(auth);
      console.log('   ✅ 로그아웃 완료');

      // 6. 다시 로그인
      console.log('\n6️⃣ 로그인 시도...');
      const loginCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = loginCredential.user;
      console.log('   ✅ 로그인 성공!');
      console.log('   📧 이메일:', loggedInUser.email);
      console.log('   🆔 UID:', loggedInUser.uid);
      console.log('   ✓ 이메일 검증:', loggedInUser.emailVerified);

      console.log('\n✨ 로그인 테스트 완료!');
      console.log('\n🌐 웹 인터페이스에서 로그인 테스트:');
      console.log('   URL: http://localhost:5173');
      console.log('   이메일: help@picme.kr');
      console.log('   비밀번호: 123123123!');

    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        console.log('   ⚠️ 계정이 이미 존재합니다');
        
        // 기존 계정으로 로그인
        console.log('\n6️⃣ 기존 계정으로 로그인...');
        const loginCredential = await signInWithEmailAndPassword(auth, email, password);
        const loggedInUser = loginCredential.user;
        console.log('   ✅ 로그인 성공!');
        console.log('   📧 이메일:', loggedInUser.email);
        console.log('   🆔 UID:', loggedInUser.uid);
        console.log('   ✓ 이메일 검증:', loggedInUser.emailVerified);
      } else {
        console.log('   ❌ 오류:', err.message);
      }
    }

  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  } finally {
    process.exit(0);
  }
}

// 테스트 실행
testLogin();
