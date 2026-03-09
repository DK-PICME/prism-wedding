/**
 * Paddle API 테스트 스크립트
 * 기능: Paddle API 연결 테스트 (Ping)
 * 
 * 사용법:
 *   npm run paddle:test
 * 
 * 참고: PADDLE_API_KEY는 .env.development 또는 .env.production에서 자동 로드
 */

import { Paddle, Environment } from '@paddle/paddle-node-sdk';
import 'dotenv/config'; // .env 파일 자동 로드

// 환경변수 확인
const apiKey = process.env.PADDLE_API_KEY;

if (!apiKey) {
  console.error('❌ Error: PADDLE_API_KEY not found in environment variables');
  console.error('Please ensure PADDLE_API_KEY is set in .env.development or .env.production');
  process.exit(1);
}

// Paddle 클라이언트 초기화 (자동으로 프로덕션 API로 인식)
const paddle = new Paddle(apiKey);

/**
 * Paddle API Ping 테스트
 * Products API를 호출하여 연결 테스트
 */
async function testPaddleConnection() {
  try {
    console.log('🚀 Testing Paddle API connection...');
    console.log('─'.repeat(50));

    // Paddle API로부터 Products 리스트 조회 (Ping)
    console.log('\n📤 Request: Fetching products from Paddle (Ping test)');
    
    const response = await paddle.products.list({
      limit: 1 // 1개만 조회 (빠른 테스트)
    });

    console.log('✅ Success! Paddle API is responding');
    console.log('─'.repeat(50));
    console.log('\n📊 Response Details:');
    console.log(`   • Status: Connected ✓`);
    console.log(`   • Environment: Production (Live API)`);
    console.log(`   • Products found: ${response.data ? response.data.length : 0}`);
    console.log(`   • Timestamp: ${new Date().toISOString()}`);

    if (response.data && response.data.length > 0) {
      console.log('\n📦 Sample Product:');
      const product = response.data[0];
      console.log(`   • ID: ${product.id}`);
      console.log(`   • Name: ${product.name}`);
      console.log(`   • Type: ${product.type}`);
    }

    console.log('\n─'.repeat(50));
    console.log('✨ Paddle Node.js SDK is working perfectly!');
    console.log('✨ Ready for production setup.');

    return true;
  } catch (error) {
    console.error('❌ Connection Failed!');
    console.error('─'.repeat(50));
    console.error('\n📋 Error Details:');
    console.error(`   • Message: ${error.message}`);
    console.error(`   • Type: ${error.name || 'Unknown'}`);
    
    if (error.status) {
      console.error(`   • Status: ${error.status}`);
    }

    console.error('\n💡 Troubleshooting:');
    console.error('   1. Verify PADDLE_API_KEY is correct');
    console.error('   2. Check API key permissions (Developer Settings > API Keys)');
    console.error('   3. Check internet connection');
    console.error('   4. Verify .env file is loaded');

    return false;
  }
}

/**
 * 테스트 실행
 */
(async () => {
  const success = await testPaddleConnection();
  process.exit(success ? 0 : 1);
})();
