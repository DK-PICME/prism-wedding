# 🌍 Paddle 결제 게이트웨이 - 구현 가이드

**작성일**: 2026-03-09  
**상태**: 🚀 구현 계획  
**목표**: 글로벌 확장을 위한 Paddle 통합

---

## 📋 목차

1. [Paddle 개요](#개요)
2. [선택 이유](#선택-이유)
3. [장단점 분석](#장단점-분석)
4. [구현 계획](#구현-계획)
5. [기술 사양](#기술-사양)
6. [마이그레이션 전략](#마이그레이션-전략)

---

## 개요

### Paddle이란?

**Paddle Billing**은 B2B SaaS 기업을 위한 글로벌 결제 + 구독 관리 플랫폼입니다.

```
핵심 기능:
├─ 결제 처리 (카드, PayPal, Apple Pay, Google Pay, 로컬 결제)
├─ 구독 관리 (갱신, 업그레이드, 다운그레이드 자동화)
├─ 세금 처리 (VAT, Sales Tax 자동 계산 & 납부)
├─ 글로벌 지원 (200+ 국가, 30개 통화)
└─ Merchant of Record (세금/준법 책임 대행)
```

### 주요 특징

| 특징 | 설명 |
|------|------|
| **지원 국가** | 200+ 국가 (한국 포함) |
| **지원 통화** | 30개 통화 (KRW 포함) |
| **세금 처리** | 자동 계산 & 납부 (VAT, Sales Tax) |
| **결제 수단** | 카드, PayPal, Apple Pay, Google Pay, 로컬 결제 |
| **구독 관리** | 완전 자동화 |
| **비용** | 5% + 50¢ (모든 기능 포함) |
| **설정 시간** | 1-2시간 (개발자) |

---

## 선택 이유

### 1️⃣ 글로벌 확장 전략

```
우리 서비스의 미래:
1단계: 한국 론칭 (2026년 Q2)
2단계: 아시아 확장 (2026년 Q3-Q4)
3단계: 글로벌 확장 (2027년+)

Paddle의 이점:
✅ 처음부터 글로벌 설정 (나중에 마이그레이션 불필요)
✅ 국가별 세금 자동 처리 (VAT, Sales Tax 등)
✅ 로컬 결제 방법 자동 지원 (Alipay, iDEAL 등)
✅ 통화 자동 변환 (각 고객 국가의 현지 통화)
✅ 가격 로컬라이제이션 (각 국가별 구매력에 맞춘 가격)
```

### 2️⃣ 유지보수 최소화

```
Paddle이 하는 일 (우리는 신경 안 써도 됨):
✅ 세금 계산
✅ 세금 수집
✅ 세금 납부 (각국에 자동으로)
✅ 준법성 관리
✅ 구독 갱신 (자동)
✅ 결제 실패 재시도
✅ 부정 방지

우리가 하는 일 (최소):
- Webhook 처리 (transaction.completed)
- 주문 상태 업데이트 (Firestore)
- 카톡 알림 (나중에)
```

### 3️⃣ 비용 효율성

```
글로벌 SaaS $50k/월 매출 비교:

Stripe + 세금 도구:
├─ Stripe: 2.9% + 30¢
├─ Stripe Tax: ~$400/월
└─ 수동 준법 비용: $500~1,000/월
총: ~$3,232/월

Paddle:
├─ 5% + 50¢ (모든 기능 포함)
└─ 세금/준법 자동 처리
총: ~$2,625/월

결과: Paddle이 약 $600/월 저렴!
(초기에는 비싸지만, 글로벌 확장 시 Paddle이 저렴)
```

---

## 장단점 분석

### ✅ 장점

#### 1. 글로벌 지원 (최고!)
- 200+ 국가 즉시 지원
- 30개 통화 자동 지원
- 로컬 결제 방법 자동 활성화
- VAT/Sales Tax 자동 계산 & 납부

#### 2. 구독 관리 (완전 자동)
- 갱신 자동화
- 업그레이드/다운그레이드 자동화
- Proration (날짜별 정확한 요금 계산)
- 실패한 결제 자동 재시도 (Retain 기능)

#### 3. 유지보수 최소
- Webhook으로만 관리
- 세금/준법은 Paddle 담당
- 결제 실패 처리 자동
- 도움말 AI 어시스턴트

#### 4. 비용 투명성
- 한 가지 수수료 (5% + 50¢)
- 숨겨진 비용 없음
- 글로벌 확장 시 추가 비용 없음

### ❌ 단점

#### 1. API 레이트 제한 (낮음)
- 표준 API: 240 req/min
- Stripe: 6,000 req/min
- **우리에게는 영향 없음** (연 1,000~10,000 주문)

#### 2. 초기 수수료 (높을 수 있음)
- 5% + 50¢ (세금 처리 포함)
- 초기 거래액이 적으면 수수료 비율 높음
- **글로벌 확장 시 회수됨**

#### 3. 유연성 (제한적)
- 복잡한 커스터마이징 어려움
- 고정된 가격 모델 (flat, tiered, per-user)
- **우리 서비스에는 충분**

#### 4. 커뮤니티 (작음)
- Stripe보다 3rd party 통합 적음
- 오픈소스 커뮤니티 활동 적음
- **문제 없음** (Firebase + Paddle은 직관적)

---

## 구현 계획

### Phase 2-B: Paddle 통합 (9시간)

#### Day 1: 계정 & 샌드박스 설정 (3시간)

```
작업 항목:

1. Paddle 계정 생성
   └─ https://paddle.com에서 가입
   └─ 비즈니스 정보 입력 (한국 정보)
   └─ 이메일 검증

2. 샌드박스 환경 설정
   └─ 개발용 API Key 발급
   └─ Product 생성 (Wedding Photo Correction)
   └─ Price 생성 ($10 테스트)

3. Client Token 발급
   └─ Frontend에 노출할 공개 토큰
   └─ .env에 저장

시간 분배:
├─ 계정 생성: 10분
├─ 문서 읽기: 1시간
├─ Product/Price 설정: 1시간
└─ 테스트: 50분
```

#### Day 2-3: Frontend 통합 (4시간)

```
작업 항목:

1. PaymentPage에 Paddle.js 추가
   ```jsx
   import Paddle from '@paddle/paddle-js';

   useEffect(() => {
     Paddle.Initialize({
       token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN,
       environment: 'sandbox' // 나중에 'production'
     });
   }, []);
   ```

2. 체크아웃 버튼 구현
   ```jsx
   const handleCheckout = async () => {
     Paddle.Checkout.open({
       items: [
         {
           priceId: 'pri_wedding_correction', // 실제 Price ID
           quantity: 1
         }
       ],
       customData: {
         userId: currentUser.uid,
         projectId: projectId
       },
       onComplete: (result) => {
         // 성공 처리
         analyticsService.trackPurchase(...);
         navigate('/status');
       }
     });
   };
   ```

3. 테스트 결제
   ```
   테스트 카드:
   - 번호: 4111 1111 1111 1111
   - 유효기간: 12/25
   - CVV: 123
   ```

시간 분배:
├─ Paddle.js 설정: 30분
├─ UI 구현: 1.5시간
├─ 테스트: 1시간
├─ 디버깅: 1시간
```

#### Day 4: Backend 통합 (2시간)

```
작업 항목:

1. Firebase Cloud Function에 Webhook 핸들러 작성
   ```javascript
   exports.paddleWebhook = functions.https.onRequest(
     async (req, res) => {
       const event = req.body;

       // Webhook 서명 검증
       const isValid = verifyPaddleSignature(
         req.body,
         req.headers['paddle-signature'],
         process.env.PADDLE_WEBHOOK_SECRET
       );

       if (!isValid) {
         res.status(401).send('Unauthorized');
         return;
       }

       // 이벤트 처리
       if (event.type === 'transaction.completed') {
         const customData = event.data.customData;
         
         // 주문 상태 업데이트
         await admin.firestore().collection('projects')
           .doc(customData.projectId)
           .update({
             status: 'payment_completed',
             paddleTransactionId: event.data.id,
             paymentDate: new Date()
           });

         // 이벤트 추적
         analyticsService.trackPurchase(...);
       }

       res.status(200).send('OK');
     }
   );
   ```

2. Webhook URL 등록
   └─ Paddle Dashboard → Webhooks
   └─ URL: https://your-project.cloudfunctions.net/paddleWebhook
   └─ Webhook Secret 저장

3. 테스트
   └─ 샌드박스에서 테스트 거래 생성
   └─ Webhook 수신 확인
   └─ Firestore 업데이트 확인

시간 분배:
├─ 함수 작성: 1시간
├─ 등록 & 설정: 30분
└─ 테스트: 30분
```

### 총 예상 시간

```
Day 1: 3시간 (계정 & 설정)
Day 2-3: 4시간 (Frontend 통합)
Day 4: 2시간 (Backend 통합)
────────────────────
총 9시간 (+ 테스트)
```

---

## 기술 사양

### API 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| /transactions | GET | 거래 조회 |
| /transactions | POST | 거래 생성 |
| /prices | GET | 가격 조회 |
| /products | GET | 상품 조회 |
| /customers | GET | 고객 조회 |

### Webhook 이벤트

```javascript
// 우리가 수신할 주요 이벤트:

1. transaction.completed (결제 완료)
   ├─ transaction.id
   ├─ amount (결제액)
   ├─ currency
   ├─ status: 'completed'
   └─ customData (우리가 설정한 데이터)

2. transaction.updated (거래 업데이트)
   └─ 상태 변경 시 발생

3. subscription.created (구독 생성)
   └─ 구독 상품 구매 시

4. subscription.updated (구독 업데이트)
   └─ 구독 변경 시

5. subscription.canceled (구독 취소)
   └─ 고객이 취소 시
```

### 환경 변수

```env
# Paddle 설정
VITE_PADDLE_CLIENT_TOKEN=your_client_token_here
PADDLE_API_KEY=your_server_api_key_here
PADDLE_WEBHOOK_SECRET=your_webhook_secret_here

# 샌드박스 vs Production
PADDLE_ENVIRONMENT=sandbox # 또는 production
```

---

## 마이그레이션 전략

### 단계별 롤아웃

#### Phase 1: 샌드박스 테스트 (완료)
```
✅ 테스트 계정 생성
✅ 테스트 거래 처리
✅ Webhook 통합
✅ Frontend 테스트
```

#### Phase 2: 프로덕션 준비 (Week 1)
```
- Paddle 프로덕션 환경 신청
- 비즈니스 검증 (1-2일)
- 프로덕션 API Key 발급
- 실제 Product/Price 생성
- 결제 수수료 설정
```

#### Phase 3: 프로덕션 배포 (Week 2)
```
- 환경 변수 변경 (sandbox → production)
- 실제 거래 테스트
- 모니터링 설정
- Go Live!
```

### 장기 고려사항

```
✅ 1단계: 한국 론칭 (Paddle + KRW)
✅ 2단계: 아시아 확장 (Paddle + CNY, JPY, SGD)
✅ 3단계: 글로벌 확장 (Paddle + 30개 통화)

특징:
- 코드 변경 없음 (Paddle 설정만)
- 가격 로컬라이제이션 자동 (각 국가별 가격 조정)
- VAT/세금 자동 처리
```

---

## 참고 자료

- [Paddle 공식 문서](https://developer.paddle.com/)
- [Paddle.js 가이드](https://developer.paddle.com/paddlejs/overview)
- [Webhook 문서](https://developer.paddle.com/webhooks/overview)
- [API Reference](https://developer.paddle.com/api-reference/overview)

---

**문서 버전**: v1.0  
**상태**: 🚀 구현 준비 완료  
**다음 단계**: Day 1 Paddle 계정 생성 시작
