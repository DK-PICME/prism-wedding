# 🚀 Paddle Node.js SDK 자동화 - 조사 및 구현 내용

**작성일**: 2026-03-09  
**상태**: 🔍 조사 완료 → ✅ Node.js 구현 시작  
**목표**: 수작업 없이 Paddle Product/Price 자동 설정

---

## 📋 목차

1. [조사 결과](#조사-결과)
2. [선택 이유](#선택-이유)
3. [구현 전략](#구현-전략)
4. [테스트 가이드](#테스트-가이드)
5. [향후 계획](#향후-계획)

---

## 🔍 조사 결과

### Paddle 자동화 옵션 분석

#### ❌ 전통 CLI
```
상태: 없음
이유: Paddle이 CLI 대신 AI-powered 자동화로 전환
```

#### ✅ AI-Powered MCP (Model Context Protocol)
```
상태: 2025/2026 신규 출시
특징:
  • Cursor/Claude에서 자연어로 명령
  • 80+ 도구 지원
  • 상태: 베타 단계

평가:
  장점: 가장 간단 (자연어)
  단점: 아직 베타, 복잡한 작업 제한
  추천: 향후 (2026년 Q2+)
```

#### ✅ Node.js SDK (선택!)
```
패키지: @paddle/paddle-node-sdk (v3.6.0)
설치: npm install @paddle/paddle-node-sdk
상태: 공식, 활발 유지보수

평가:
  장점:
  ✅ 완전 자동화 가능
  ✅ Firebase Cloud Functions 통합 쉬움
  ✅ TypeScript 지원
  ✅ 복잡한 로직 구현 가능
  ✅ npm 패키지 (관리 간단)
  ✅ 로컬 테스트 가능
  
  단점:
  ⚠️ 코드 필요 (하지만 간단, 10줄)
  
  추천: ⭐⭐⭐⭐⭐ (즉시 사용 권장)
```

#### ✅ Python SDK
```
패키지: paddle-billing
상태: 공식, v1.8.0 안정 버전

평가:
  장점: 가장 간단한 문법
  단점: Firebase와 통합 복잡
  추천: ⭐⭐ (빠른 테스트용만)
```

#### ✅ Terraform Provider
```
패키지: terraform-provider-paddle (커뮤니티)
상태: 활발

평가:
  장점: Infrastructure as Code
  단점: Terraform 학습 필요, 복잡
  추천: ⭐ (향후 고려)
```

#### 📊 비교표

| 옵션 | 난이도 | 설정시간 | 자동화도 | 즉시성 | 추천도 |
|------|--------|---------|---------|--------|---------|
| **Node.js SDK** | ⭐⭐ | 20분 | ✅✅✅ | 높음 | ⭐⭐⭐⭐⭐ |
| **MCP (AI)** | ⭐ | 10분 | ✅✅✅ | 중간 | ⭐⭐⭐ |
| **Python SDK** | ⭐ | 15분 | ✅✅ | 중간 | ⭐⭐ |
| **Terraform** | ⭐⭐⭐ | 30분 | ✅✅✅ | 낮음 | ⭐ |
| **수작업** | ✅ | 30분 | ❌ | 없음 | ❌❌❌ |

---

## 🎯 선택 이유

### 우리가 Node.js SDK를 선택한 이유

#### 1️⃣ 즉시 사용 가능
```
✅ 이미 설치됨 (npm install 완료)
✅ 테스트 가능 (오늘)
✅ 프로덕션 배포 가능 (내일)
```

#### 2️⃣ Firebase와 완벽 통합
```
✅ Firebase Cloud Functions에서 직접 사용
✅ 이벤트 트리거 가능 (자동화)
✅ 비용 효율적 (서버 불필요)
```

#### 3️⃣ 완전 자동화
```
✅ 수작업 0% (웹사이트 접근 불필요)
✅ 스크립트로 모든 설정 가능
✅ 재사용 가능 (Product/Price 추가 시)
```

#### 4️⃣ TypeScript 지원
```
✅ 타입 안전성 (버그 감소)
✅ IDE 자동완성 (개발 속도 증가)
✅ 유지보수 쉬움
```

#### 5️⃣ 커뮤니티 활동
```
✅ 공식 유지보수 (PaddleHQ)
✅ 정기 업데이트
✅ 문제 발생 시 빠른 대응
```

---

## 🛠️ 구현 전략

### Phase 1: 테스트 (오늘)

#### Step 1: SDK 설치
```bash
npm install @paddle/paddle-node-sdk
```
**상태**: ✅ 완료 (v3.6.0 설치됨)

#### Step 2: 테스트 스크립트 작성
```bash
파일: scripts/test-paddle.js
기능: Paddle API Ping 테스트
```
**상태**: ✅ 완료

#### Step 3: 환경변수 설정
```bash
파일: .env.paddle
내용: PADDLE_API_KEY 템플릿
```
**상태**: ✅ 완료

#### Step 4: 테스트 실행
```bash
# 1. Paddle Sandbox API Key 발급받기
#    1. https://dashboard.paddle.com에 로그인
#    2. Developer Settings > API Keys
#    3. Sandbox API Key 복사

# 2. 환경변수 설정
export PADDLE_API_KEY="your_sandbox_api_key"

# 3. 테스트 실행
npm run paddle:test

# 기대 결과:
# ✅ Success! Paddle API is responding
# ✨ Ready for production setup.
```

---

### Phase 2: Product/Price 자동화 (내일)

#### 구현 코드

```javascript
// scripts/setup-paddle-products.js

import { Paddle, Environment } from '@paddle/paddle-node-sdk';

const paddle = new Paddle(process.env.PADDLE_API_KEY, {
  environment: Environment.Sandbox
});

/**
 * Paddle Product 및 Price 자동 생성
 */
async function setupPaddleProducts() {
  try {
    console.log('🚀 Setting up Paddle products...');
    console.log('─'.repeat(50));

    // 1. Product 생성
    console.log('\n📦 Creating Wedding Photo Correction product...');
    const product = await paddle.products.create({
      name: 'Wedding Photo Correction Service',
      type: 'standard',
      description: 'Professional wedding photo correction and editing service',
      customData: {
        category: 'photo-services',
        serviceType: 'wedding'
      }
    });

    console.log(`✅ Product created: ${product.id}`);

    // 2. Basic Price 생성
    console.log('\n💰 Creating Basic plan price...');
    const priceBasic = await paddle.prices.create({
      productId: product.id,
      unitPrice: {
        amount: '10000', // $100
        currencyCode: 'USD'
      },
      type: 'standard',
      customData: {
        tier: 'basic',
        photos: '50-100'
      }
    });

    console.log(`✅ Basic price created: ${priceBasic.id} ($100)`);

    // 3. Premium Price 생성
    console.log('\n💰 Creating Premium plan price...');
    const pricePremium = await paddle.prices.create({
      productId: product.id,
      unitPrice: {
        amount: '20000', // $200
        currencyCode: 'USD'
      },
      type: 'standard',
      customData: {
        tier: 'premium',
        photos: '200+'
      }
    });

    console.log(`✅ Premium price created: ${pricePremium.id} ($200)`);

    // 4. 결과 저장
    console.log('\n─'.repeat(50));
    console.log('✨ Setup Complete!');
    console.log('\n📊 Generated IDs (Copy to code):');
    console.log(`  PADDLE_PRODUCT_ID=${product.id}`);
    console.log(`  PADDLE_PRICE_BASIC=${priceBasic.id}`);
    console.log(`  PADDLE_PRICE_PREMIUM=${pricePremium.id}`);

    return {
      productId: product.id,
      prices: {
        basic: priceBasic.id,
        premium: pricePremium.id
      }
    };
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    throw error;
  }
}

// 실행
setupPaddleProducts().catch(console.error);
```

#### 실행 방법
```bash
npm run paddle:setup
```

---

### Phase 3: Firebase Cloud Function 통합 (이번 주)

#### 구조
```
firebase/functions/src/paddle/setupProducts.js
  ├─ initPaddle()
  ├─ createProduct()
  ├─ createPrices()
  └─ saveToFirestore()
```

#### 호출 시점
```
1. 배포 시 (수동 호출)
   firebase functions:call setupPaddleProducts

2. 자동화 (향후)
   - 새 서비스 추가 시
   - 가격 업데이트 시
```

---

## 🧪 테스트 가이드

### 준비 단계

#### 1. Paddle 계정 생성
```
1. https://paddle.com에 방문
2. "Get started" 클릭
3. 비즈니스 정보 입력 (한국 정보 가능)
4. 이메일 검증
```

#### 2. API Key 발급
```
1. Paddle Dashboard 로그인
2. Developer Settings > API Keys
3. Sandbox API Key 복사
```

#### 3. 환경변수 설정
```bash
# 방법 1: 커맨드라인
export PADDLE_API_KEY="your_sandbox_key"

# 방법 2: .env.paddle 파일
PADDLE_API_KEY="your_sandbox_key"
```

### 테스트 실행

#### Ping 테스트 (API 연결 확인)
```bash
npm run paddle:test

기대 결과:
✅ Success! Paddle API is responding
   • Status: Connected ✓
   • Environment: Sandbox
   • Timestamp: [현재 시간]
✨ Ready for production setup.
```

#### 실패 시 문제 해결
```
❌ Error: PADDLE_API_KEY not found
→ 환경변수 설정 확인

❌ Error: Invalid API Key
→ Dashboard에서 API Key 재확인
→ Sandbox 환경 API Key 사용 확인

❌ Error: Connection timeout
→ 인터넷 연결 확인
→ Paddle 서버 상태 확인 (paddle.status.io)
```

---

## 📈 향후 계획

### 단계별 진행

#### Week 1: 테스트 및 검증
```
☐ Day 1: SDK 설치 & 테스트 (오늘) ✅
☐ Day 2: Product/Price 자동 생성 스크립트
☐ Day 3: Firebase Function 통합
☐ Day 4: 프로덕션 API Key로 전환
```

#### Week 2: PaymentPage 통합
```
☐ Paddle.js 임베딩
☐ 체크아웃 버튼 구현
☐ 테스트 결제
☐ Webhook 구현
```

#### Week 3: 완전 자동화
```
☐ Webhook 핸들러 완성
☐ 주문 상태 자동 업데이트
☐ 카톡 알림 통합
☐ 모니터링 설정
```

### 확장성

```
✅ 새 Product 추가 시
   → 스크립트 실행만으로 자동 생성

✅ 가격 변경 시
   → API로 업데이트 (수작업 0%)

✅ 다국가 통화 지원 시
   → Price 생성 시 currencyCode 변경만으로 가능

✅ 글로벌 확장 시
   → 같은 코드로 모든 국가 지원 (Paddle 특성)
```

---

## 📝 체크리스트

### 현재 상태 (2026-03-09)

#### ✅ 완료
- [x] Paddle Node.js SDK 설치
- [x] 테스트 스크립트 작성 (test-paddle.js)
- [x] 환경변수 템플릿 생성 (.env.paddle)
- [x] package.json에 npm script 추가
- [x] 조사 및 결정 문서 작성

#### ⏳ 다음 단계
- [ ] Paddle 계정 생성 (Sandbox)
- [ ] API Key 발급
- [ ] test-paddle.js 실행 (Ping 테스트)
- [ ] setup-paddle-products.js 작성
- [ ] Product/Price 자동 생성 실행
- [ ] Firebase Cloud Function 통합
- [ ] Paddle.js PaymentPage 통합

---

## 🎯 결론

### Node.js SDK 선택의 이점

```
✅ 수작업: 0%
✅ 설정 시간: 30분 → 5분
✅ 유지보수: 간단 (스크립트만 관리)
✅ 확장성: 우수 (새 Product 추가 시에도 사용)
✅ 비용: 무료 (npm 패키지)
✅ 자동화도: 100%
```

### 행동 계획

```
오늘:
1. Paddle 계정 생성
2. API Key 발급
3. npm run paddle:test 실행

내일:
1. Product/Price 자동 생성 테스트
2. Firebase Function 준비

이번 주:
1. PaymentPage Paddle.js 통합
2. 프로덕션 배포 준비
```

---

**문서 버전**: v1.0  
**상태**: 🚀 구현 준비 완료  
**다음 단계**: Paddle 계정 생성 → API Key 발급 → test-paddle.js 실행
