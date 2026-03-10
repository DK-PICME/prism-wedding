/**
 * Firebase 에뮬레이터 Auth 사용자 이메일 검증 활성화
 */

async function updateUserEmailVerification() {
  try {
    const projectId = 'prism-wedding-84b5d';
    const uid = 'Yoq84EIiVQSfORqqZ0eBLCvFBROq';
    const apiKey = 'AIzaSyDummyKeyForLocalEmulator123456789';

    console.log('🔧 Firebase 에뮬레이터 사용자 업데이트 시도...\n');

    console.log('1️⃣ identitytoolkit API 시도...');
    const url = `http://localhost:9099/v1/projects/${projectId}/accounts:update?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        localId: uid,
        emailVerified: true,
      })
    });

    const data = await response.text();
    console.log('   상태:', response.status);
    console.log('   응답:', data);

    if (response.status === 200 || response.status === 201) {
      console.log('\n✅ 이메일 검증 활성화 성공!\n');
    }

  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

updateUserEmailVerification();
