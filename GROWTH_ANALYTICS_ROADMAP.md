# 🚀 그로스 해킹 & CRM 로드맵 (첫 런칭 준비)

## 📋 개요

프리즘 스튜디오의 첫 런칭에서 구축할 **비즈니스 분석**, **CRM**, **AARRR 그로스 해킹** 인프라에 대한 종합 로드맵입니다.

**작성 일자**: 2026-03-09  
**상태**: 🚀 Phase 1 완료 (GA4 + Smartlook 배포 준비)  
**담당 채널**: 카톡 상담채널 (이미 운영 중)

### 📊 Phase 1 완성도: 100%

✅ **완료된 작업**
- Google Analytics 4 통합 (AnalyticsService)
- Smartlook 세션 녹화 준비
- 이벤트 추적 시스템 구현
- UTM 파라미터 캡처 & 저장
- 사용자 식별 시스템
- 기본 이벤트 (sign_up, login, email_verified, purchase 등)

⏳ **다음 단계**: Phase 2 (주문 관리) + Phase 3 (카톡 자동 알림)

---

## 🎯 전략

### 핵심 원칙

```
1️⃣ 최소화: 모든 도구를 한 번에 도입하지 않기
2️⃣ 우선순위: 필수 분석 도구만 먼저 시작
3️⃣ 점진적 확장: 사용자 100명 이상 시 고도화
4️⃣ 카톡 집중: 이미 구축된 채널 활용 극대화
```

### 기본 가정

- 초기 사용자: 0 → 100명 (첫 4주)
- 주요 유입 채널: 다이렉트 + 소셜미디어
- 수익 모델: 주문당 고정 또는 변동 수수료
- 타겟 고객: 신혼부부 (웨딩 사진 보정)

---

## 📊 AARRR 펀널 분해

### Acquisition (유입)

**목표**: 유입 채널 파악 및 CAC 관리

```
추적 항목:
├─ utm_source (유입 출처: organic, direct, social, etc)
├─ utm_medium (매체: cpc, email, social, referral)
├─ utm_campaign (캠페인명)
├─ utm_content (콘텐츠 구분)
└─ utm_term (검색어)

KPI:
├─ 일일 신규 사용자 수
├─ 채널별 사용자 수
├─ 채널별 CAC (Customer Acquisition Cost)
└─ 첫 방문까지 시간
```

**구현**: Google Analytics 4 + UTM 파라미터 자동 캡처

---

### Activation (활성화)

**목표**: 회원가입 후 실제 사용까지 유도

```
추적 항목:
├─ 회원가입 완료율
├─ 이메일 인증 완료율
├─ 첫 로그인 시간
├─ 온보딩 완료율
└─ 첫 주문 생성까지 시간

이벤트:
├─ sign_up (회원가입)
├─ email_verified (이메일 인증)
├─ first_login (첫 로그인)
├─ order_created (첫 주문 생성)
└─ photo_uploaded (첫 사진 업로드)

KPI:
└─ Activation Rate (D1) = 가입 대비 첫 주문 율
```

**구현**: Firebase Auth + 이벤트 트래킹

---

### Retention (재방문)

**목표**: 사용자가 다시 돌아오게 하기

```
추적 항목 (리텐션):
├─ Day 1 Retention (가입 다음날 재방문율)
├─ Day 7 Retention (7일차 재방문율)
├─ Day 30 Retention (30일차 재방문율)
├─ WAU (Weekly Active Users)
├─ MAU (Monthly Active Users)
└─ 기능별 사용 빈도

자동화:
├─ 주문 진행 상황 자동 알림 (카톡)
├─ 완료 후 리뷰 요청
├─ 재참여 이메일 (2주 미접속 시)
└─ VIP 고객 우대 프로그램

KPI:
├─ Day 7 Retention ≥ 30% (우수)
├─ MAU / DAU ≥ 0.5 (월 활성율)
└─ 평균 세션 길이 ≥ 3분
```

**구현**: Smartlook 세션 추적 + Firebase Cloud Functions 자동화

---

### Revenue (수익)

**목표**: 사용자당 평균 매출 증대

```
추적 항목:
├─ ARPU (Average Revenue Per User) = 총 수익 / 총 사용자
├─ LTV (Lifetime Value) = ARPU × 평균 고객 생애
├─ 결제 전환율 (주문 생성 → 결제 완료)
├─ 평균 주문액
├─ 반복 구매율 (구매 후 재구매율)
└─ 평균 구매 주기

결제 이벤트:
├─ order_created (주문 생성)
├─ purchase (결제 완료)
├─ refund (환불)
└─ upsell (추가 상품)

KPI:
├─ ARPU ≥ 50,000원 (목표)
├─ LTV / CAC ≥ 5:1 (건강한 비율)
└─ 결제 전환율 ≥ 60%
```

**구현**: 포트원/KG이니시스 결제 API + 이벤트 로깅

---

### Referral (추천)

**목표**: 입소문을 통한 저비용 성장

```
추적 항목:
├─ 추천 링크 클릭 수
├─ 추천을 통한 신규 가입 수
├─ 추천인 당 획득 비용 (비용 없음 = 무료 성장)
└─ 추천 프로그램 참여율

자동화:
├─ 고객이 추천할 수 있는 고유 링크 생성
├─ 추천 완료 시 포인트 적립 (예: 5,000원 쿠폰)
├─ 추천받은 신규 고객도 포인트 제공
└─ 포인트로 결제액 할인 가능

KPI:
├─ Viral Coefficient (K) ≥ 0.5
│  (1명당 추천해서 나오는 신규 사용자 수)
└─ 추천 채널 신규 사용자 비율 ≥ 10%
```

**구현**: Firebase + 커스텀 추천 링크 시스템

---

## 🛠️ 필수 도구 스택

### Day 0 (런칭 필수)

| 도구 | 용도 | 비용 | 설정 난이도 |
|------|------|------|-----------|
| **Google Analytics 4** | 기본 트래픽/전환 추적 | 무료 | ⭐ |
| **Smartlook** | 세션 녹화 + 히트맵 | 무료~$50/월 | ⭐⭐ |
| **Firebase** | 사용자 데이터 + 이벤트 | 무료 | ⭐ |

### Day 7~14 (빠른 확장)

| 도구 | 용도 | 비용 | 설정 난이도 |
|------|------|------|-----------|
| **Firebase Cloud Functions** | 자동화 (카톡 알림) | 무료 | ⭐⭐⭐ |
| **Google Sheets + Apps Script** | 실시간 대시보드 | 무료 | ⭐⭐ |
| **Zapier / Make** | 자동화 연결 | $10~20/월 | ⭐⭐ |

### Week 3+ (고도화)

| 도구 | 용도 | 비용 | 설정 난이도 |
|------|------|------|-----------|
| **Klaviyo** | 이메일 마케팅/자동화 | 무료~$20/월 | ⭐⭐ |
| **Segment (선택)** | CDP 통합 (추후 필요시) | 무료~$120/월 | ⭐⭐⭐⭐ |

---

## 📅 4주 구현 로드맵

### Phase 1: Day 0 (런칭)
**기간**: 하루 (런칭 당일)  
**목표**: 기본 분석 인프라 구축  
**담당**: 개발자

#### 1-1. Google Analytics 4 설정
```
체크리스트:
☐ GA4 계정 생성 → VITE_GA4_MEASUREMENT_ID 발급
☐ src/services/AnalyticsService.js에 GA4 초기화 로직 추가
☐ UTM 파라미터 자동 캡처 구현
☐ 기본 이벤트 추적 (pageview, sign_up, login, purchase)
☐ localhost:5173?utm_source=test로 테스트
```

**예상 시간**: 1시간

#### 1-2. Smartlook 설정
```
체크리스트:
☐ Smartlook 계정 생성 → VITE_SMARTLOOK_KEY 발급
☐ AnalyticsService.js에 Smartlook 초기화 로직 추가
☐ 세션 녹화 + 콘솔 로그 기록 활성화
☐ 히트맵/클릭플로우 활성화
☐ PII(개인정보) 마스킹 설정
```

**예상 시간**: 30분

#### 1-3. 첫 번째 이벤트 통합
```
파일 변경:
├─ src/pages/SignUpPage.jsx → analyticsService.trackSignUp()
├─ src/pages/LoginPage.jsx → analyticsService.trackLogin()
├─ src/pages/VerifyEmailPage.jsx → analyticsService.trackEmailVerified()
└─ src/pages/OrderListPage.jsx → analyticsService.pageview()
```

**예상 시간**: 1시간

#### 1-4. 환경변수 설정
```env
# .env.production
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_SMARTLOOK_KEY=YOUR_SMARTLOOK_KEY
```

**예상 시간**: 15분

**Phase 1 총 시간**: 약 2.5시간

---

### Phase 2: Day 1~7 (첫 주)
**기간**: 1주일  
**목표**: 카톡 자동화 + 실시간 모니터링  
**담당**: 개발자 + CTO

#### 2-1. Firebase Cloud Functions 구축
```
구현 항목:
├─ 주문 생성 → 카톡 자동 알림
├─ 결제 완료 → 카톡 확인 알림
├─ 배송 진행 → 카톡 상태 업데이트
└─ 완료 → 카톡 리뷰 요청

기술:
├─ Firebase Realtime Database 트리거
├─ 카톡 비즈니스 API 또는 Kakao Talk Channel 연동
└─ Cloud Functions Python/Node.js
```

**예상 시간**: 8시간 (카톡 API 문서 학습 포함)

#### 2-2. Google Sheets 실시간 대시보드
```
구현 항목:
├─ Apps Script로 Firebase → Sheets 자동 동기화
├─ 일일 신규 사용자 수
├─ 채널별 유입 현황
├─ 실시간 주문 현황
├─ AARRR 펀널 진행률
└─ 자동 시간별 업데이트 (매 시간)

방식:
├─ Sheets 모니터링 용 전용 시트 생성
├─ 차트 및 피벗 테이블로 시각화
└─ 모바일도 확인 가능하게 구성
```

**예상 시간**: 4시간

#### 2-3. 상세 이벤트 로깅
```
추가 이벤트:
├─ photo_uploaded (사진 업로드 수)
├─ main_correction_started (본보정 시작)
├─ revision_requested (수정 요청)
├─ download_completed (다운로드 완료)
└─ feature_used_* (기능 사용)

파일 변경:
├─ src/pages/PhotoManagementPage.jsx
├─ src/pages/MainCorrectionUploadPage.jsx
├─ src/pages/MainCorrectionResultPage.jsx
└─ 모든 주요 페이지
```

**예상 시간**: 3시간

#### 2-4. 모니터링 프로세스 수립
```
일일 체크리스트:
☐ 새벽 - GA4 대시보드 확인 (신규 사용자 수)
☐ 오전 - Smartlook 세션 3개 샘플 재생 (UX 문제 체크)
☐ 오후 - Google Sheets 대시보드 확인 (AARRR 펀널)
☐ 저녁 - 이탈 지점 분석 (ResultPage 이탈율 등)

주간 리뷰 (매 주 월요일):
☐ Week 1 코호트 retention 분석
☐ 채널별 CAC 계산
☐ 주요 이슈 정리
```

**예상 시간**: 1시간 (일정 수립)

**Phase 2 총 시간**: 약 16시간 (4일 기준)

---

### Phase 3: Day 8~21 (2주)
**기간**: 2주일  
**목표**: 리텐션 자동화 + 고도화  
**담당**: CTO (마케팅 관점)

#### 3-1. 이메일 자동화 (Klaviyo 또는 Firebase + Gmail API)
```
자동화 시나리오:

1️⃣ 회원가입 환영 이메일
   ├─ Trigger: sign_up 이벤트
   ├─ Delay: 즉시
   └─ Content: 온보딩 + 첫 할인 쿠폰 (10% 할인)

2️⃣ 이메일 인증 완료
   ├─ Trigger: email_verified 이벤트
   ├─ Delay: 즉시
   └─ Content: 가이드 + 샘플 사진 공유

3️⃣ 주문 생성 확인
   ├─ Trigger: order_created 이벤트
   ├─ Delay: 즉시
   └─ Content: 주문 요약 + 진행 예상 일정

4️⃣ 배송 시작 알림
   ├─ Trigger: 작업팀이 배송 시작 표시
   ├─ Delay: 즉시
   └─ Content: 진행 상황 + 예상 완료 일정

5️⃣ 완료 알림 + 리뷰 요청
   ├─ Trigger: 작업 완료 마크
   ├─ Delay: 즉시
   └─ Content: 다운로드 링크 + 별점 리뷰 요청

6️⃣ 재참여 캠페인
   ├─ Trigger: 2주 미로그인
   ├─ Delay: 2주 후 자동
   └─ Content: "당신의 다음 프로젝트는?" + 특별 할인
```

**구현 난이도**: 중간 (Zapier 추천)  
**예상 시간**: 6시간

#### 3-2. 추천 프로그램 구축
```
기능 요구사항:
├─ 사용자가 고유 추천 링크 생성 가능
├─ 추천 링크를 통한 가입 자동 추적
├─ 추천인 + 신규 고객 모두 포인트 지급
├─ 포인트 내역 페이지 표시
└─ 포인트로 결제액 할인

기술:
├─ Firebase Realtime Database에 referral 테이블
├─ Cloud Function으로 포인트 자동 계산
└─ SettingsPage에 추천 섹션 추가
```

**예상 시간**: 8시간

#### 3-3. 코호트 분석 자동화
```
추적 내용:
├─ 주차별 신규 사용자 코호트 자동 생성
├─ Day 1, 7, 14, 30 retention 자동 계산
├─ 채널별 코호트 분석
├─ 첫 주문까지 평균 시간 추세
└─ 주간 리포트 자동 생성 (매주 월요일 아침 이메일)

기술:
├─ Google Sheets에 코호트 분석 시트
├─ Apps Script 자동 계산
└─ Gmail API로 주간 리포트 자동 발송
```

**예상 시간**: 4시간

#### 3-4. Smartlook 고도화
```
히트맵 분석:
├─ 가장 많이 클릭되는 버튼 파악
├─ 스크롤 깊이 분석
├─ 모바일 vs 데스크톱 행동 비교
└─ 이탈 지점 정확한 위치 파악

개선 시항:
├─ CTA 버튼 위치/크기 최적화
├─ 폼 필드 간소화
├─ 모바일 UX 개선
└─ 로딩 속도 최적화

목표:
└─ 샘플 ResultPage 이탈율 50% → 30% 감소
```

**예상 시간**: 3시간 (분석) + 개발 (별도)

**Phase 3 총 시간**: 약 21시간 (3일 기준)

---

### Phase 4: Day 22~28 (4주)
**기간**: 1주일  
**목표**: 통합 모니터링 대시보드 + 최적화  
**담당**: CTO (비즈니스 분석)

#### 4-1. 통합 대시보드 구축 (Google Data Studio 또는 Looker)
```
대시보드 섹션:
1. 실시간 모니터링
   ├─ 현재 온라인 사용자 수
   ├─ 오늘 신규 가입 수
   ├─ 오늘 주문 생성 수
   └─ 오늘 결제 완료 수

2. AARRR 펀널
   ├─ 일일 Acquisition (신규 사용자 추세)
   ├─ Activation (가입 → 첫 주문 전환율)
   ├─ Retention (Day 7, 30 Retention)
   ├─ Revenue (일일 수익 추세)
   └─ Referral (추천 기여도)

3. 채널 분석
   ├─ 채널별 유입 수
   ├─ 채널별 CAC
   ├─ 채널별 conversion rate
   └─ 채널별 LTV

4. 고객 세그먼트
   ├─ 신규 vs 재참여 비율
   ├─ VIP 고객 (LTV 상위 10%)
   ├─ 이탈 위험 고객
   └─ 추천 활성 고객

5. 제품 메트릭
   ├─ 기능별 사용률
   ├─ 주문 상태별 분포
   ├─ 평균 처리 시간
   └─ 고객 만족도 (추후)
```

**구현**: Google Data Studio 연동 + GA4 데이터  
**예상 시간**: 4시간

#### 4-2. 주간 자동 리포트 시스템
```
매주 월요일 아침 8시 CTO에게 자동 발송:

주간 서머리:
├─ 신규 사용자: __명 (주간 vs 전주 비교)
├─ 활성 사용자: __명
├─ 총 수익: __원
├─ 평균 ARPU: __원
├─ Day 7 Retention: __%
├─ 주요 이탈 지점: [페이지명]
└─ 주간 성장 추천: [개선 포인트]

기술:
├─ Google Sheets + Apps Script
├─ Gmail API 자동 발송
└─ 차트 이미지 포함
```

**예상 시간**: 2시간

#### 4-3. A/B 테스트 프레임워크
```
테스트할 항목:
├─ 회원가입 폼: 필드 간소화 (A vs B)
├─ CTA 버튼 텍스트: "시작하기" vs "샘플 보정 신청"
├─ 프라이싱 페이지: 가격 위치 변경
├─ 온보딩: 영상 추가 vs 텍스트만
└─ 이메일 제목: 짧은 vs 긴

측정:
├─ 각 변형의 conversion rate 추적
├─ 통계적 유의성 검증 (p < 0.05)
├─ 통계적 검정력 확보 (n ≥ 100 per group)
└─ 2주 단위로 결과 검토

기술:
├─ GA4 변형 추적 + 커스텀 이벤트
├─ 또는 Optimizely (유료)
└─ 수동으로 매주 비교 분석
```

**예상 시간**: 3시간 (프레임워크 수립)

#### 4-4. 최적화 실행
```
이번 주 개선 항목:
☐ [이슈 1] ResultPage 이탈율 높음 → CTA 버튼 강조
☐ [이슈 2] 모바일 사용자 form 포기율 높음 → 필드 2개 제거
☐ [이슈 3] 채널별 CAC 편차 큼 → 고효율 채널 마케팅 확대
☐ [이슈 4] Day 7 Retention 20% 미만 → 이메일 자동화 활성화
```

**예상 시간**: 2시간 (실행 계획)

**Phase 4 총 시간**: 약 11시간

---

## 📊 Week 1 체크리스트 (우선순위)

### 런칭 당일 (6시간)
- [ ] **Google Analytics 4 설치**
  - [ ] GA4 계정 생성
  - [ ] AnalyticsService.js 작성 완료
  - [ ] 기본 이벤트 추적 (pageview, sign_up, login)
  - [ ] localhost 테스트 완료
  - [ ] 프로덕션 배포

- [ ] **Smartlook 설치**
  - [ ] Smartlook 계정 생성
  - [ ] 스크립트 추가 완료
  - [ ] 세션 녹화 작동 확인
  - [ ] PII 마스킹 설정

- [ ] **첫 이벤트 통합**
  - [ ] SignUpPage → trackSignUp()
  - [ ] LoginPage → trackLogin()
  - [ ] VerifyEmailPage → trackEmailVerified()

### Day 2-7 (20시간)
- [ ] **Firebase Cloud Functions (카톡 알림)**
  - [ ] 주문 생성 → 카톡 알림
  - [ ] 결제 완료 → 카톡 알림

- [ ] **Google Sheets 대시보드**
  - [ ] 신규 사용자 수 (시간별)
  - [ ] AARRR 펀널 진행률

- [ ] **모니터링 프로세스**
  - [ ] 일일 체크 항목 정리
  - [ ] 주간 리뷰 일정 잡기

---

## 💰 비용 추정

### Monthly Recurring Cost (MRC)

| 항목 | 비용 | 필수성 |
|------|------|-------|
| **Google Analytics 4** | $0 | ✅ 필수 |
| **Smartlook (Pro)** | $50 | ⭐ 권장 |
| **Firebase (무료 범위 내)** | $0 | ✅ 필수 |
| **Zapier (기본)** | $20 | ⭐ 향후 |
| **Klaviyo (무료)** | $0 | ⭐ 향후 |
| **Google Sheets** | $0 | ✅ 필수 |
| **Google Data Studio** | $0 | ⭐ 향후 |
| **총계 (첫 달)** | **$50~70** | - |

### 예상 ROI

```
가정:
├─ 월 신규 사용자: 500명
├─ ARPU: 50,000원
├─ 평균 LTV: 150,000원
└─ 마케팅 비용: 200,000원/월

수익:
├─ 월 매출: 25,000,000원
├─ 마케팅 비용 대비 수익: 125배
└─ 분석 도구 비용: 무시할 수준

결론:
└─ 분석 도구 투자 ROI ≈ 100배 이상
```

---

## 🚨 주의사항

### Privacy & Compliance

```
☐ 개인정보 수집 동의서 작성 및 게시
☐ Smartlook PII 마스킹 설정 (결제정보, 주민번호 등)
☐ 카톡 알림 동의 명시
☐ 이메일 자동화 수신거부 기능 구현
☐ GDPR/CCPA 관련 규정 확인 (국제 확장 시)
```

### Data Quality

```
☐ 더미 데이터 / 테스트 사용자 필터링
☐ 봇 트래픽 필터링
☐ 중복 이벤트 제거
☐ 누락된 이벤트 감지 (예: 완료되지 않은 추적)
☐ 데이터 정확성 주간 점검
```

### Performance Monitoring

```
☐ 분석 스크립트 로딩 시간 모니터링
└─ Google Analytics + Smartlook 추가 로딩: ~200ms
☐ Core Web Vitals 추적 (LCP, FID, CLS)
☐ 모바일 성능 점검
☐ 서버 응답 시간 모니터링
```

---

## 📈 성공 지표 (KPI)

### Month 1 목표

| 지표 | 목표 | 측정 주기 |
|------|------|---------|
| **신규 사용자** | 300명 | 일일 |
| **Activation Rate (D0)** | ≥ 30% | 주간 |
| **Day 7 Retention** | ≥ 25% | 주간 |
| **CAC** | ≤ 10,000원 | 주간 |
| **ARPU** | ≥ 50,000원 | 주간 |
| **LTV / CAC** | ≥ 3:1 | 월간 |

### Month 2-3 목표

| 지표 | 목표 | 측정 주기 |
|------|------|---------|
| **신규 사용자** | 500명/월 | 월간 |
| **Activation Rate** | ≥ 40% | 주간 |
| **Day 30 Retention** | ≥ 35% | 월간 |
| **Viral Coefficient** | ≥ 0.3 | 월간 |
| **ARPU** | ≥ 70,000원 | 월간 |
| **LTV / CAC** | ≥ 5:1 | 월간 |

---

## 🔗 관련 문서

- [`IMPLEMENTATION_STRATEGY.md`](./IMPLEMENTATION_STRATEGY.md) - 전체 구현 전략
- [`APP_STRUCTURE_AND_PRIORITY.md`](./APP_STRUCTURE_AND_PRIORITY.md) - 앱 구조 및 우선순위
- [`PROCESS_FLOW_DIAGRAM.md`](./PROCESS_FLOW_DIAGRAM.md) - 프로세스 흐름도

---

## 📝 다음 단계

### 즉시 (오늘)
1. [✅] GA4 + Smartlook 계정 생성
2. [✅] AnalyticsService.js 구현 검토
3. [✅] 런칭 일정 확정

### 이번 주
1. [✅] Phase 1 구현 (GA4, Smartlook)
2. [✅] 첫 이벤트 추적 (회원가입, 로그인)
3. [✅] 모니터링 프로세스 수립

### 다음 주
1. [ ] 카톡 자동 알림 구축
2. [ ] Google Sheets 대시보드 구축
3. [ ] 주간 리뷰 시작

---

## 🎉 구현 완료 요약 (2026-03-09)

### Phase 1: GA4 + Smartlook 구축 완료 ✅

**구현 내역:**
- ✅ AnalyticsService.js 작성 (307줄)
- ✅ App.jsx에 분석 초기화 통합
- ✅ SignUpPage, LoginPage, VerifyEmailPage 이벤트 추적 추가
- ✅ 환경변수 설정 (.env.production, .env.development)
- ✅ UTM 파라미터 자동 캡처
- ✅ 사용자 식별 시스템
- ✅ 페이지뷰 자동 추적

**추적 가능한 이벤트:**
- sign_up (회원가입: 이메일/Google)
- login (로그인: 이메일/Google)
- email_verified (이메일 인증 완료)
- order_created, purchase (주문/결제)
- photo_uploaded (사진 업로드)
- main_correction_started, revision_requested, download_completed
- feature_used_* (기능별 사용률)

**Day 0 런칭 준비도: 100% ✅**

모든 기본 분석 인프라가 준비되었습니다!
배포 후 GA4 대시보드와 Smartlook에서 실시간 데이터를 모니터링할 수 있습니다.

---

**문서 버전**: v1.0 (2026-03-09)  
**마지막 수정**: 2026-03-09  
**작성자**: CTO Support  
**상태**: 📋 검토 대기
