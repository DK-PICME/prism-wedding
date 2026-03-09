# 프리즘 웨딩 스튜디오 - 최종 구현 전략 문서

## Executive Summary (경영진 요약)

### 앱 목표
**프리즘 웨딩 스튜디오**: 웨딩 사진 보정 서비스를 온라인으로 제공하는 플랫폼
- 신부/신랑이 온라인으로 주문을 생성하고 결제
- 샘플 보정을 통해 품질 확인
- 만족하면 본보정 진행
- 최종 사진을 다운로드

### 비즈니스 프로세스
```
신규/기존 고객 → 회원가입/로그인 → 새 주문 생성 → 결제 완료
                                      ↓
    ┌──────────────────────────────────────────────┐
    │                샘플 보정 플로우                │
    │  업로드 → 대기(24h) → 확인 → 결정           │
    └──────────────────────────────────────────────┘
                           ↓
    ┌──────────────────────────────────────────────┐
    │               본보정 플로우                    │
    │  파일업로드 → 작업(3-5일) → 다운로드         │
    └──────────────────────────────────────────────┘
                           ↓
                    고객 만족도 평가
```

### 핵심 가치
1. **셀프서비스**: 고객이 직접 주문 관리
2. **투명성**: 실시간 진행 상태 확인
3. **품질 보증**: 샘플을 통한 사전 확인
4. **편의성**: 온라인 결제 및 파일 다운로드

---

## 기술 스택 확정

| 계층 | 기술 | 버전 | 역할 |
|------|------|------|------|
| **Frontend** | React | 18.2 | UI 렌더링 |
| | React Router | 7.13 | SPA 라우팅 |
| | Vite | 5.0 | 번들러 |
| | Tailwind CSS | - | 스타일링 |
| **State Mgmt** | React Context | - | 인증 상태 |
| **Analytics** | Google Analytics 4 | - | 기본 분석 추적 |
| | Smartlook | - | 세션 녹화 + 히트맵 |
| | AnalyticsService | 커스텀 | 통합 이벤트 추적 |
| **Payment** | Paddle | - | 글로벌 결제 + 구독 관리 |
| | Paddle.js | - | 체크아웃 UI |
| **Backend** | Firebase Auth | - | 인증 |
| | Firestore | - | NoSQL DB |
| | Cloud Storage | - | 파일 저장 |
| | Cloud Functions | - | API 로직 + Webhook |
| | Cloud Hosting | - | 배포 |
| **Testing** | Playwright | 1.58 | E2E 테스트 |
| **Linting** | ESLint | 8.55 | 코드 품질 |

---

## 앱 화면 요약 (20개 페이지)

### 인증 관련 (4개)
1. **LoginPage** - 로그인 (이메일/Google)
2. **SignUpPage** - 회원가입
3. **VerifyEmailPage** - 이메일 인증
4. **PasswordRecoveryPage** - 비밀번호 찾기

### 주문 관리 (4개)
5. **OrderListPage** - 주문 목록 (대시보드)
6. **CreateNewOrderPage** - 새 주문 생성
7. **OrderDetailsPage** - 주문 상세
8. **PaymentPage** - 결제

### 사진 보정 (8개)
9. **PhotoManagementPage** - 사진 관리
10. **UploadPage** - 샘플 업로드 (STEP 1)
11. **WaitingPage** - 샘플 대기
12. **ResultPage** - 샘플 결과 (STEP 2)
13. **SampleRevisionRequestPage** - 샘플 수정 요청
14. **MainCorrectionUploadPage** - 본보정 업로드 (STEP 3)
15. **MainCorrectionProgressPage** - 본보정 진행 (STEP 4)
16. **MainCorrectionResultPage** - 본보정 결과 (STEP 5)

### 상태/유틸리티 (4개)
17. **CurrentStatusPage** - 현재 상태 확인
18. **CompletedPage** - 완료 페이지
19. **SettingsPage** - 설정
20. **NotificationCenterPage** - 알림 센터
21. **InquiryPage** - 1:1 문의
22. **FailedItemManagementPage** - 실패 항목 관리

### 네비게이션 구조
```
┌─────────────────────────────────────┐
│  PrismHeader (공통 헤더)              │
│  [Logo] [주문내역] [알림] [설정] [프로필] │
└─────────────────────────────────────┘
         ↓
    라우팅 페이지
         ↓
┌─────────────────────────────────────┐
│  PrismFooter (공통 푸터)              │
└─────────────────────────────────────┘
```

---

## 사용자 여정 (5단계)

```
┌──────────────────────────────────────────────────────────────┐
│ STEP 0: 접근 및 인증                                          │
│ • LoginPage 또는 SignUpPage 접근                             │
│ • 이메일/Google 로그인 또는 회원가입                          │
│ • 이메일 인증 완료                                            │
│ • OrderListPage (대시보드) 접근                              │
└──────────────────────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 1: 주문 생성 및 결제                                     │
│ • CreateNewOrderPage에서 주문 정보 입력                      │
│ • OrderDetailsPage에서 확인                                  │
│ • PaymentPage에서 결제                                       │
│ • 결제 완료 시 프로젝트 자동 생성                            │
│ • 상태: "대기" → "준비완료"                                 │
└──────────────────────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 2: 샘플 보정 (24시간 소요)                               │
│ • UploadPage에서 사진 1장 + 요청사항 업로드                  │
│ • WaitingPage에서 진행 상태 확인 (실시간 업데이트)            │
│ • ResultPage에서 보정 결과 확인                               │
│ • Before/After 비교 후 "본보정 진행" 또는 "수정 요청"         │
│ • 상태: "샘플 검토중" → "샘플 완료"                         │
└──────────────────────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 3: 본보정 (3~5일 소요)                                   │
│ • MainCorrectionUploadPage에서 전체 사진 업로드              │
│ • MainCorrectionProgressPage에서 진행 상태 확인               │
│ • MainCorrectionResultPage에서 완성된 사진 다운로드           │
│ • 만족도 평가 작성                                            │
│ • 상태: "업로드 마감" → "본보정 작업중" → "완료"             │
└──────────────────────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 4: 완료 및 아카이빙                                      │
│ • CompletedPage에서 최종 확인                                │
│ • 사진 7일간 다운로드 가능                                    │
│ • OrderListPage에서 다시 주문 생성 가능                      │
│ • 상태: "완료" (최종)                                        │
└──────────────────────────────────────────────────────────────┘
```

---

## 데이터 모델 (Firestore Collections)

### users 컬렉션
```javascript
users/{uid}
├─ uid: string
├─ email: string
├─ displayName: string (프로필 이름)
├─ photoURL: string (프로필 사진)
├─ createdAt: timestamp
├─ lastLogin: timestamp
└─ settings: {
    notifications: {
      uploadComplete: boolean,
      orderStatusChange: boolean,
      downloadReady: boolean,
      marketing: boolean
    },
    theme: "light" | "dark" | "auto"
  }
```

### projects 컬렉션
```javascript
projects/{projectId}
├─ userId: string (소유자)
├─ name: string (주문명: "신부명 & 신랑명 웨딩")
├─ eventType: string ("웨딩" | "스드메" | "야외촬영" ...)
├─ brideName: string
├─ groomName: string
├─ shootingDate: timestamp
├─ totalPhotos: number
├─ status: string (waiting → sample-review → sample-complete → ...)
├─ sampleUpload: {
│   fileName: string,
│   fileUrl: string (gs://...),
│   revisionRequest: string,
│   createdAt: timestamp,
│   completedAt: timestamp
│ }
├─ mainCorrection: {
│   files: [{ url: string, uploadedAt: timestamp }, ...],
│   additionalRequest: string,
│   uploadedAt: timestamp,
│   uploadDeadline: timestamp,
│   completedAt: timestamp
│ }
├─ payment: {
│   status: string ("pending" | "completed" | "failed"),
│   amount: number,
│   method: string ("card" | "bank" | "mobile"),
│   transactionId: string,
│   completedAt: timestamp
│ }
├─ createdAt: timestamp
├─ updatedAt: timestamp
├─ dueDate: timestamp (예상 납기일)
└─ rating: { (완료 후)
    score: number (1~5),
    comment: string,
    ratedAt: timestamp
  }
```

### notifications 컬렉션
```javascript
notifications/{notificationId}
├─ userId: string
├─ type: string ("status-change" | "payment" | "download-ready" | ...)
├─ title: string
├─ message: string
├─ projectId: string (관련 프로젝트)
├─ read: boolean
├─ createdAt: timestamp
└─ expiresAt: timestamp (7일 후 자동 삭제)
```

---

## 구현 우선순위 매트릭스

### 중요도 vs 난이도 분석

```
                    난이도 (↑ 어려움)
                    ↑
       ┌─────────────────────────────┐
    높  │                             │
       │  • 결제 연동                  │
    중  │  • 파일 업로드               │  • 다중 업로드
    요  │  • 실시간 업데이트           │  • 대용량 처리
    도  │  • 이메일 인증               │
    ↑   │  • 로그인                   │  • 고급 필터링
       │                             │  • 알림 시스템
    낮  └─────────────────────────────┘
       ↑                               ↑
       낮                              높
       (난이도)
```

### 우선순위 지표
- **가치도** (V): 비즈니스 가치 (높음/중간/낮음)
- **의존도** (D): 다른 기능의 선행조건 (높음=반드시 먼저)
- **복잡도** (C): 구현 난이도 (높음=오래 걸림)

| 순위 | 기능 | V | D | C | 우선순위 점수 | 실행 기간 |
|------|------|---|---|---|---|---|
| 1 | LoginPage + Google OAuth | 높 | 높 | 중 | **95점** | 2-3일 |
| 2 | SignUpPage + 이메일 인증 | 높 | 높 | 중 | **90점** | 2-3일 |
| 3 | OrderListPage (Mock 데이터) | 높 | 높 | 낮 | **85점** | 1-2일 |
| 4 | AuthContext 완성 | 높 | 높 | 중 | **85점** | 1-2일 |
| 5 | UploadPage (파일 업로드) | 높 | 높 | 중 | **85점** | 2-3일 |
| 6 | ResultPage (Before/After) | 높 | 중 | 중 | **80점** | 2-3일 |
| 7 | PaymentPage (결제 게이트웨이) | 높 | 중 | 높 | **75점** | 3-4일 |
| 8 | WaitingPage (실시간 업데이트) | 중 | 중 | 중 | **70점** | 2-3일 |
| 9 | CreateNewOrderPage | 중 | 중 | 중 | **70점** | 2-3일 |
| 10 | MainCorrectionUploadPage | 중 | 중 | 중 | **65점** | 2-3일 |
| 11 | SettingsPage | 중 | 낮 | 낮 | **60점** | 2일 |
| 12 | NotificationCenterPage | 중 | 낮 | 중 | **55점** | 2-3일 |
| 13 | SampleRevisionRequestPage | 낮 | 낮 | 낮 | **50점** | 1-2일 |
| 14 | InquiryPage | 낮 | 낮 | 낮 | **40점** | 1일 |
| 15 | FailedItemManagementPage | 낮 | 낮 | 낮 | **30점** | 1일 |

---

## 실행 로드맵 (Timeline)

### Week 1: 인증 및 기본 구조 (5일)
```
Day 1: Firebase Auth 연결 + LoginPage 완성
Day 2: SignUpPage + VerifyEmailPage 완성
Day 3: PasswordRecoveryPage + AuthContext 최적화
Day 4: PrismHeader 네비게이션 + 페이지 연결
Day 5: 테스트 및 버그 수정 + 배포 준비
```

### Week 2: 주문 관리 (5일)
```
Day 1: OrderListPage (Mock 데이터로 UI 완성)
Day 2-3: CreateNewOrderPage + OrderDetailsPage
Day 4: PaymentPage UI 완성
Day 5: Firebase 연동 + 테스트
```

### Week 3-4: 샘플 보정 플로우 (10일)
```
Day 1-2: UploadPage (파일 업로드 완성)
Day 3: WaitingPage (UI 완성, 폴링 구현)
Day 4-5: ResultPage (Before/After 슬라이더)
Day 6-7: MainCorrectionUploadPage (다중 업로드)
Day 8-9: MainCorrectionProgressPage + ResultPage
Day 10: 통합 테스트 및 버그 수정
```

### Week 5: 결제 및 추가 기능 (5일)
```
Day 1-2: 결제 게이트웨이 연동 (포트원/KG이니시스)
Day 3: SettingsPage 완성
Day 4: NotificationCenterPage + InquiryPage
Day 5: 최종 테스트 및 배포
```

### Week 6: QA 및 최적화 (5일)
```
Day 1-2: E2E 테스트 (Playwright)
Day 3: 성능 최적화 (번들 크기, 로딩 속도)
Day 4: 보안 감시 (XSS, CSRF, 데이터 검증)
Day 5: 최종 배포 준비
```

**총 소요 시간: 4-6주 (1명 기준)**

---

## 위험 관리 (Risk Management)

### 주요 위험 요소

| 위험 | 심각도 | 확률 | 대응 방안 |
|------|--------|------|---------|
| Firebase 할당량 초과 | 높 | 중 | 예산 모니터링, 자동 스케일링 |
| 파일 업로드 실패 | 높 | 중 | 재시도 로직, 클라우드 스토리지 검증 |
| 인증 토큰 만료 | 중 | 중 | 자동 갱신, 세션 관리 |
| 실시간 업데이트 지연 | 중 | 낮 | 폴링 주기 최적화, WebSocket 고려 |
| 결제 게이트웨이 연동 오류 | 높 | 낮 | 사전 통합 테스트, 제공사 지원 |
| 모바일 호환성 문제 | 중 | 높 | 반응형 디자인, 모바일 테스트 |

---

## 성공 지표 (KPI)

1. **기술적 지표**
   - 페이지 로딩 시간 < 2초
   - API 응답 시간 < 500ms
   - 가용성 > 99.9%
   - 번들 크기 < 500KB

2. **비즈니스 지표**
   - 회원가입 완료율 > 70%
   - 주문 완료율 > 80%
   - 샘플 → 본보정 전환율 > 60%
   - 고객 만족도 > 4.5/5

3. **사용자 경험 지표**
   - 첫 주문 완료 시간 < 10분
   - 샘플 결과 확인 만족도 > 4/5
   - 전체 프로세스 만족도 > 4.5/5

---

## 검수 및 배포

### 배포 전 체크리스트

- [ ] 모든 페이지 E2E 테스트 완료
- [ ] Firebase 보안 규칙 검토
- [ ] 환경변수 설정 확인 (.env.production)
- [ ] 데이터 마이그레이션 완료
- [ ] 모바일 반응형 확인
- [ ] 성능 최적화 완료
- [ ] 에러 처리 및 로깅 검증
- [ ] 백업 및 복구 계획 수립

### 배포 단계

1. **프리 프로덕션 (Staging)**
   - Firebase 에뮬레이터로 전체 테스트
   - 스태이징 환경 배포
   - 최종 QA 점검

2. **프로덕션 (Production)**
   - `npm run build`로 최적화된 번들 생성
   - `firebase deploy` 실행
   - 모니터링 및 로그 확인
   - 사용자 피드백 수집

### 배포 후 모니터링

- Firebase Console에서 실시간 모니터링
- Sentry 또는 LogRocket 연동 (에러 추적)
- Google Analytics 연동 (사용자 행동 분석)
- 일일 활성 사용자(DAU) 모니터링

---

## 최종 요약

### 성공의 핵심
1. **사용자 중심 설계**: 5단계 워크플로우 최적화
2. **신뢰성**: 샘플을 통한 품질 보증
3. **편의성**: 온라인 완전 자동화
4. **투명성**: 실시간 상태 업데이트
5. **유지보수성**: 명확한 코드 구조

### 다음 단계
1. 팀 구성 (개발자 1-2명)
2. Firebase 프로젝트 설정 완료
3. 로컬 개발 환경 구성
4. 첫 번째 마일스톤 (Week 1) 착수

---

## 🚀 현재 구현 상태 (2026-03-09 업데이트)

### Day 0 런칭 준비 완료 ✅

#### ✅ 인증 시스템 (100%)
- **LoginPage**: 이메일/비밀번호 + Google OAuth 완성
- **SignUpPage**: 회원가입 + 약관 동의 완성
- **VerifyEmailPage**: 이메일 인증 + 재전송 완성
- **PasswordRecoveryPage**: 비밀번호 찾기 완성
- **AuthContext**: 완전한 인증 상태 관리 완성
- **ProtectedRoute**: Private Route 구현 완료
- **세션 관리**: onAuthStateChanged로 실시간 감시

#### ✅ 분석 인프라 (100%) - **NEW**
- **AnalyticsService**: 통합 분석 서비스 구현
  - Google Analytics 4 초기화
  - Smartlook 세션 녹화 통합
  - Segment CDP 준비 (향후 확장용)
- **이벤트 추적**: sign_up, login, email_verified, purchase 등
- **UTM 파라미터**: 자동 캡처 & 저장
- **사용자 식별**: 로그인 시 자동 식별
- **페이지뷰**: 모든 라우트 변경 시 자동 추적

#### ✅ UI 페이지 (95%)
- 샘플보정 플로우: UploadPage, WaitingPage, ResultPage, SampleRevisionRequestPage ✅
- 본보정 플로우: MainCorrectionUploadPage, MainCorrectionProgressPage, MainCorrectionResultPage ✅
- 상태 페이지: CurrentStatusPage, CompletedPage ✅
- 공통 컴포넌트: PrismHeader, PrismFooter, LoadingSpinner ✅

#### ⏳ 주문 관리 (진행 중)
- OrderListPage: UI 완성, Firebase 연동 대기
- CreateNewOrderPage: UI 완성, 폼 검증 완성
- OrderDetailsPage: UI 완성
- PaymentPage: UI 완성, **Paddle 결제 게이트웨이 연동 예정**

#### 💳 결제 시스템 (Paddle - 글로벌 선택) **NEW**
- **선택 이유**: 글로벌 확장 전략 (200+ 국가 지원)
- **자동 세금 처리**: VAT, Sales Tax 자동 계산 & 납부
- **구독 관리**: 갱신, 업그레이드, 다운그레이드 자동화
- **유지보수 최소**: Webhook만 처리하면 대부분 자동
- **React 연동**: Paddle.js + Webhooks (간단함)
- **Merchant of Record**: 세금 책임은 Paddle 담당 → 우리는 관리 없음

**Paddle 장점:**
✅ 200+ 국가 자동 지원  
✅ 30개 통화 기본 제공 (한국 포함)  
✅ 로컬 결제 방법 (Alipay, iDEAL, 한국 결제 등)  
✅ 세금 자동 계산 & 납부 (준법성 100%)  
✅ 유지보수 최소 (개발자 부담 감소)  
✅ 구독 갱신 자동화 (완전 자동)  

**구현 계획:**
- Phase 2-B: Paddle 통합 (9시간)
  - Day 1: Paddle 계정 + 샌드박스 설정 (3h)
  - Day 2-3: Paddle.js 임베딩 + 테스트 (4h)
  - Day 4: Firebase Webhook 핸들러 (2h)

#### ⏳ 추가 기능 (계획 중)
- SettingsPage: 구조만 완성
- NotificationCenterPage: 구조만 완성
- InquiryPage: 구조만 완성

### 기술 체크리스트

| 항목 | 상태 | 비고 |
|------|------|------|
| Firebase Auth 연동 | ✅ | 이메일/Google OAuth |
| AuthContext 상태 관리 | ✅ | 토큰 갱신, 세션 유지 |
| Private Route (보호된 라우트) | ✅ | 미인증 사용자는 /login으로 리다이렉트|
| GA4 + Smartlook | ✅ | 환경변수 기반 설정 |
| 이벤트 추적 시스템 | ✅ | 20+ 기본 이벤트 정의 |
| UTM 파라미터 추적 | ✅ | localStorage 저장 |
| Firestore 사용자 데이터 동기화 | ✅ | 프로필, 설정 등 |
| 이메일 인증 플로우 | ✅ | 자동 리다이렉트 |
| 로그인 상태 유지 | ✅ | 새로고침 후에도 유지 |
| Tailwind CSS 반응형 | ✅ | Mobile-first 설계 |
| 환경변수 설정 | ✅ | .env.production, .env.development |

### Day 0 배포 체크리스트

**런칭 직전 확인사항:**
- [ ] GA4 Measurement ID 발급 → `.env.production`에 입력
- [ ] Smartlook API Key 발급 → `.env.production`에 입력
- [ ] Firebase 환경 변수 확인
- [ ] `npm run build` 테스트
- [ ] Firebase Hosting 배포 검증
- [ ] GA4 대시보드에서 데이터 수집 확인
- [ ] Smartlook에서 첫 세션 녹화 확인

### Day 1+ 모니터링 항목

**런칭 후 추적할 AARRR 메트릭:**
- Acquisition: 신규 사용자 수, 채널별 유입
- Activation: 가입 → 첫 주문까지 전환율
- Retention: Day 1, 7, 30 retention 추적
- Revenue: 주문당 평균 매출, 전환율
- Referral: 추천 기여도 (향후 추가)

---

**문서 작성일**: 2025-03-09  
**마지막 업데이트**: 2026-03-09 (GA4 + Smartlook 통합)  
**상태**: 런칭 준비 완료  
**버전**: 1.0
