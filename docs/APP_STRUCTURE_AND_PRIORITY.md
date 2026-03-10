# 프리즘 웨딩 스튜디오 - 앱 화면 구조 및 구현 우선순위

## 1. 전체 앱 화면 맵 (화면 흐름도)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PRISM WEDDING STUDIO                        │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    인증 플로우 (Auth Flow)                    │    │
│  │                                                              │    │
│  │  1. LoginPage (로그인)                                       │    │
│  │     ├─ 이메일/비밀번호 로그인                                │    │
│  │     ├─ Google 소셜 로그인                                    │    │
│  │     └─ 네이버 로그인 (UI만 존재)                             │    │
│  │        ↓                                                      │    │
│  │  2. SignUpPage (회원가입)                                    │    │
│  │     ├─ 이메일/비밀번호 입력                                  │    │
│  │     └─ 이메일 검증 메일 발송                                 │    │
│  │        ↓                                                      │    │
│  │  3. VerifyEmailPage (이메일 인증)                            │    │
│  │     └─ 인증 링크 클릭 확인                                   │    │
│  │        ↓                                                      │    │
│  │  4. PasswordRecoveryPage (비밀번호 찾기)                      │    │
│  │     └─ 이메일로 재설정 링크 전송                             │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              ↓ (인증 완료)                           │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              메인 네비게이션 (Main Navigation)                │    │
│  │                                                              │    │
│  │  [로고] [주문내역] [알림] [설정] [프로필]                      │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│         ↓              ↓              ↓              ↓               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │ OrderFlow    │ │ PhotoFlow    │ │ AdminFlow    │ │ UserFlow     │ │
│  │              │ │              │ │              │ │              │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## 2. 세부 플로우 및 페이지 맵

### 2.1 주문 관리 플로우 (Order Management Flow)
```
주문 내역 페이지
├─ OrderListPage
│  ├─ 주문 목록 (테이블)
│  │  ├─ 상태별 필터링 (대기, 진행중, 완료)
│  │  ├─ 기간별 필터링
│  │  └─ 검색
│  ├─ 통계 표시 (대기중, 진행중, 완료 수)
│  └─ 새 주문 생성 버튼
│     ↓
├─ CreateNewOrderPage (새 주문 생성)
│  ├─ 주문정보 입력 (신부/신랑 이름, 촬영 유형 등)
│  └─ 가격 정보 표시
│     ↓
├─ OrderDetailsPage (주문 상세)
│  ├─ 주문 기본 정보
│  ├─ 진행 현황
│  ├─ 납기일
│  └─ 수정/삭제 버튼
│     ↓
└─ PaymentPage (결제)
   ├─ 주문 정보 확인
   ├─ 결제 방법 선택 (신용카드, 계좌이체, 휴대폰)
   ├─ 결제 정보 입력
   └─ 결제 완료
```

### 2.2 사진 보정 플로우 (Photo Editing Flow)
```
사진 관리 페이지
├─ PhotoManagementPage
│  └─ 프로젝트 목록
│     ↓
├─ UploadPage (STEP 1: 샘플 업로드)
│  ├─ 사진 파일 업로드 (Drag&Drop)
│  ├─ 요청사항 입력
│  └─ 샘플 보정 요청
│     ↓ (상태: 샘플 검토중)
├─ WaitingPage (샘플 보정 대기)
│  ├─ 현재 진행 상태
│  ├─ 예상 완료 시간
│  └─ 실시간 업데이트
│     ↓ (24시간 후 샘플 완료)
├─ ResultPage (STEP 2: 샘플 결과 확인)
│  ├─ 보정된 샘플 사진 표시
│  ├─ 사전 보정/보정 이후 비교
│  ├─ 추가 수정 요청 여부 선택
│  ├─ 본보정 진행 버튼
│  └─ 본보정 취소 버튼
│     ├─ 추가 수정 요청 시 → SampleRevisionRequestPage
│     │  ├─ 수정 요청사항 입력
│     │  └─ 요청 제출 (ResultPage로 돌아감)
│     │
│     └─ 본보정 진행 시 ↓
├─ MainCorrectionUploadPage (STEP 3: 본보정 파일 업로드)
│  ├─ 다중 사진 업로드 (Drag&Drop)
│  ├─ 추가 요청사항 입력
│  └─ 업로드 마감
│     ↓ (상태: 업로드 마감)
├─ MainCorrectionProgressPage (STEP 4: 본보정 진행중)
│  ├─ 본보정 작업 진행 상태
│  ├─ 예상 납기일
│  ├─ 진행 현황 (샘플완료→본업로드완료→본작업중→결과확인대기)
│  └─ 콘텐츠 다운로드 불가
│     ↓ (5일 후 본보정 완료)
└─ MainCorrectionResultPage (STEP 5: 본보정 결과 다운로드)
   ├─ 완성된 사진 목록
   ├─ 일괄 다운로드
   ├─ 개별 다운로드
   └─ CompletedPage로 전환 (완료)
```

### 2.3 상태 확인 플로우 (Status Flow)
```
CurrentStatusPage
├─ 현재 프로젝트 상태 표시
├─ 진행 단계별 시간표
└─ 다음 단계 안내

CompletedPage
├─ 완료된 프로젝트 정보
├─ 최종 생성물 목록
└─ 만족도 평가 버튼 (구현 필요)
```

### 2.4 추가 페이지 (Utilities)
```
SettingsPage (설정)
├─ 프로필 수정
├─ 알림 설정
├─ 비밀번호 변경
├─ 계정 연동 관리 (Google, 네이버)
└─ 계정 삭제

NotificationCenterPage (알림 센터)
├─ 알림 목록
├─ 알림 상세 보기
└─ 알림 삭제

InquiryPage (문의하기)
├─ 1:1 문의 작성
├─ 문의 이력 조회
└─ 답변 확인

FailedItemManagementPage (실패 항목 관리)
└─ 작업 실패 항목 처리 (관리자용)
```

## 3. 앱 아키텍처 및 연관관계

```
┌────────────────────────────────────────────────────────────────┐
│                        React App (App.jsx)                      │
└────────────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────────────┐
│                    Router (React Router v7)                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Routes Configuration                    │   │
│  │  • /login, /sign-up, /verify-email, /password-recovery    │   │
│  │  • /order-list, /order-details, /create-new-order         │   │
│  │  • /upload, /result, /status, /completed                  │   │
│  │  • /main-correction-* (업로드,진행,결과)                   │   │
│  │  • /settings, /notification-center, /inquiry              │   │
│  │  • /photo-management, /failed-items                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────────────┐
│                    AuthContext (인증 상태 관리)                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ • currentUser (Firebase Auth)                              │   │
│  │ • userData (Firestore - 사용자 정보)                       │   │
│  │ • methods: login, logout, signup, resetPassword           │   │
│  │ • methods: loginWithGoogle, loginWithGooglePopup          │   │
│  │ • methods: updateUserProfile, updateUserSettings          │   │
│  │ • methods: unlinkProvider, deleteAccount, changePassword  │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────────────┐
│           Service Layer (ProjectService 추상, 구현체 2개)         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ProjectService (추상 베이스 클래스)                        │   │
│  │  • getProject(projectId): Promise<Project>               │   │
│  │  • createSample(projectId, data): Promise<void>          │   │
│  │  • uploadMainCorrection(projectId, files): Promise<void> │   │
│  │  • onProjectStatusChanged(projectId, callback): void     │   │
│  └──────────────────────────────────────────────────────────┘   │
│         ↓                              ↓                         │
│  ProjectServiceMock          ProjectServiceApi                  │
│  (개발/테스트용)             (프로덕션용)                          │
│  • Mock 데이터 반환           • HTTP API 호출                     │
│  • 30초 폴링                  • /api 엔드포인트                   │
└────────────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────────────┐
│                    Firebase Backend                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ • Firebase Auth (이메일, Google OAuth)                    │   │
│  │ • Cloud Firestore (users, projects 컬렉션)               │   │
│  │ • Cloud Storage (사진 파일 저장)                          │   │
│  │ • Cloud Functions (API 엔드포인트)                        │   │
│  │ • Cloud Hosting (프론트엔드 배포)                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

## 4. 데이터 흐름 (Data Flow)

### 4.1 프로젝트 데이터 구조
```javascript
{
  projectId: "project-2025-0122",
  
  // 기본 정보
  brideName: "박지영",
  groomName: "김민수",
  eventType: "웨딩", // 웨딩, 스드메, 야외촬영 등
  shootingDate: "2025-01-20",
  totalPhotos: 150,
  
  // 샘플 보정 단계
  sampleRequest: {
    fileName: "sample.jpg",
    fileUrl: "gs://...",
    revisionRequest: "얼굴톤 자연스럽게...",
    createdAt: timestamp,
    completedAt: timestamp,
  },
  
  // 본보정 단계
  mainCorrection: {
    files: [
      { fileUrl: "gs://...", uploadedAt: timestamp }
    ],
    additionalRequest: "눈 자연스럽게...",
    uploadedAt: timestamp,
    uploadDeadline: timestamp,
    completedAt: timestamp,
  },
  
  // 상태
  status: "in-progress", // waiting, sample-review, sample-complete, main-correction-upload, main-correction-in-progress, completed
  
  // 타이밍
  createdAt: timestamp,
  updatedAt: timestamp,
  dueDate: timestamp,
  
  // 결제
  paymentStatus: "completed", // waiting, completed
  amount: 450000,
}
```

## 5. 구현 우선순위 (Implementation Priority)

### Phase 1: 핵심 인증 및 기본 구조 (우선순위 ⭐⭐⭐⭐⭐)
**목표**: 사용자가 로그인해서 메인 페이지에 접근 가능하게 하기

1. **LoginPage 기능 완성** (⭐⭐⭐⭐⭐ - 최우선)
   - ✅ 이메일/비밀번호 로그인
   - ✅ Google OAuth 로그인
   - ⚪ 네이버 로그인 연동 (미구현)
   - ⚪ 로그인 상태 유지 (rememberMe) - Firebase persistence

2. **AuthContext 완성** (⭐⭐⭐⭐⭐ - 최우선)
   - ✅ 인증 상태 관리
   - ✅ 사용자 데이터 Firestore 저장
   - ⚪ 로그인 유지 기능 (Firebase persistence)
   - ⚪ 세션 만료 처리

3. **SignUpPage 기능 완성** (⭐⭐⭐⭐)
   - ✅ 회원가입 폼
   - ✅ 이메일 검증 메일 발송
   - ⚪ 입력값 유효성 검사 강화
   - ⚪ 약관 동의 화면

4. **VerifyEmailPage 기능 완성** (⭐⭐⭐⭐)
   - ✅ 이메일 인증 확인
   - ⚪ 인증 메일 재전송 기능
   - ⚪ 인증 상태 UI 개선

---

### Phase 2: 주문 관리 페이지 (우선순위 ⭐⭐⭐⭐)
**목표**: 사용자가 주문을 생성, 조회, 수정할 수 있게 하기

5. **OrderListPage 기능 완성** (⭐⭐⭐⭐)
   - ✅ 주문 목록 조회 (Mock 데이터)
   - ⚪ Firebase에서 실제 데이터 로드
   - ⚪ 검색, 필터링 (상태, 기간)
   - ⚪ 페이지네이션
   - ⚪ 새 주문 생성 버튼 동작

6. **CreateNewOrderPage 기능 완성** (⭐⭐⭐⭐)
   - ⚪ 주문 정보 폼 (신부/신랑 이름, 촬영 유형, 촬영일)
   - ⚪ 가격 계산 로직
   - ⚪ 주문 생성 API 연동
   - ⚪ 유효성 검사

7. **OrderDetailsPage 기능 완성** (⭐⭐⭐⭐)
   - ⚪ 주문 상세 정보 조회
   - ⚪ 진행 상태 시각화
   - ⚪ 수정/삭제 기능
   - ⚪ 상태별 액션 버튼

---

### Phase 3: 사진 보정 플로우 (우선순위 ⭐⭐⭐⭐⭐)
**목표**: 사용자가 샘플 보정을 요청하고 결과를 확인할 수 있게 하기

8. **UploadPage 기능 완성** (⭐⭐⭐⭐⭐ - 핵심)
   - ✅ 파일 업로드 UI (Drag&Drop)
   - ✅ 요청사항 입력
   - ⚪ Cloud Storage에 실제 파일 업로드
   - ⚪ 파일 크기/형식 검증
   - ⚪ 진행 상황 표시

9. **WaitingPage 기능 완성** (⭐⭐⭐⭐)
   - ✅ UI 디자인
   - ⚪ 실시간 상태 업데이트 (Firebase polling)
   - ⚪ 예상 완료 시간 표시
   - ⚪ Firestore에서 프로젝트 데이터 로드

10. **ResultPage 기능 완성** (⭐⭐⭐⭐)
    - ⚪ 보정된 사진 로드 및 표시
    - ⚪ Before/After 비교 슬라이더
    - ⚪ 추가 수정 요청 로직
    - ⚪ 본보정 진행 버튼

11. **SampleRevisionRequestPage 기능 완성** (⭐⭐⭐)
    - ⚪ 수정 요청 폼
    - ⚪ 요청 제출 및 저장
    - ⚪ 수정 결과 재확인 로직

---

### Phase 4: 결제 및 본보정 (우선순위 ⭐⭐⭐)
**목표**: 사용자가 결제하고 본보정을 진행할 수 있게 하기

12. **PaymentPage 기능 완성** (⭐⭐⭐)
    - ✅ UI 디자인 (결제 폼)
    - ⚪ 결제 게이트웨이 연동 (포트원, KG이니시스 등)
    - ⚪ 결제 상태 추적
    - ⚪ 결제 실패 처리

13. **MainCorrectionUploadPage 기능 완성** (⭐⭐⭐⭐)
    - ⚪ 다중 파일 업로드
    - ⚪ 업로드 마감 제한
    - ⚪ Cloud Storage 연동
    - ⚪ 업로드 진행률 표시

14. **MainCorrectionProgressPage 기능 완성** (⭐⭐⭐)
    - ✅ UI 디자인
    - ⚪ 실시간 진행 상태 업데이트
    - ⚪ 예상 납기일 표시
    - ⚪ 타이머/진행률 표시

15. **MainCorrectionResultPage 기능 완성** (⭐⭐⭐⭐)
    - ⚪ 완성된 사진 목록 로드
    - ⚪ 일괄/개별 다운로드
    - ⚪ 다운로드 만료 처리
    - ⚪ 만족도 평가 기능

---

### Phase 5: 부가 기능 (우선순위 ⭐⭐⭐)
**목표**: 사용자 경험 개선 및 관리 기능

16. **SettingsPage 기능 완성** (⭐⭐⭐)
    - ⚪ 프로필 수정 (이름, 프로필 사진)
    - ⚪ 알림 설정
    - ⚪ 비밀번호 변경
    - ⚪ 계정 연동 관리 (Google 해제 등)
    - ⚪ 계정 삭제

17. **NotificationCenterPage 기능 완성** (⭐⭐⭐)
    - ⚪ 알림 목록 조회
    - ⚪ 알림 상세 보기
    - ⚪ 알림 읽음 표시
    - ⚪ 알림 삭제

18. **InquiryPage 기능 완성** (⭐⭐)
    - ⚪ 1:1 문의 폼
    - ⚪ 문의 이력 조회
    - ⚪ 이메일 알림

---

### Phase 6: 관리자 및 고급 기능 (우선순위 ⭐⭐)
**목표**: 관리자 기능 및 시스템 최적화

19. **FailedItemManagementPage 기능 완성** (⭐⭐)
    - ⚪ 작업 실패 항목 관리
    - ⚪ 재작업 처리
    - ⚪ 로그 기록

20. **PhotoManagementPage 기능 개선** (⭐⭐)
    - ⚪ 프로젝트별 사진 관리
    - ⚪ 사진 정렬/필터링
    - ⚪ 사진 삭제

---

## 6. 각 단계별 작업 항목

### Phase 1 상세 작업 (1-2주)
```
Week 1:
- Day 1-2: Firebase Auth 테스트 및 LoginPage 완성
- Day 2-3: SignUpPage, VerifyEmailPage 완성
- Day 3-4: AuthContext에서 로그인 상태 유지 구현
- Day 4-5: PasswordRecoveryPage 완성
- Day 5: PrismHeader 네비게이션 추가

Week 2:
- Day 1-2: OrderListPage Mock 데이터로 UI 검증
- Day 2-3: ProjectService 테스트
- Day 3-4: Firebase 연결 테스트
- Day 4-5: 각 페이지 링크 검증
```

### Phase 2-3 상세 작업 (2-3주)
```
Week 3:
- Day 1-2: UploadPage 파일 업로드 완성
- Day 2-3: Cloud Storage 연동
- Day 3-4: WaitingPage 실시간 상태 업데이트
- Day 4-5: ResultPage Before/After 비교 기능

Week 4:
- Day 1-2: MainCorrectionUploadPage 다중 업로드
- Day 2-3: MainCorrectionProgressPage 타이머
- Day 3-4: 페이지 네비게이션 통합
- Day 4-5: E2E 테스트 작성
```

---

## 7. 진행 상황 체크리스트

### Phase 1
- [ ] LoginPage 완성 (Google OAuth 포함)
- [ ] SignUpPage 완성
- [ ] VerifyEmailPage 완성
- [ ] PasswordRecoveryPage 완성
- [ ] AuthContext 모든 메서드 테스트
- [ ] 로그인 유지 기능 구현
- [ ] 네비게이션 보호 (Private Route)

### Phase 2
- [ ] OrderListPage Firebase 연동
- [ ] CreateNewOrderPage 완성
- [ ] OrderDetailsPage 완성
- [ ] 주문 CRUD 작업 테스트

### Phase 3
- [ ] UploadPage Cloud Storage 연동
- [ ] WaitingPage 실시간 업데이트
- [ ] ResultPage 완성
- [ ] MainCorrectionUploadPage 완성
- [ ] 전체 보정 플로우 테스트

### Phase 4
- [ ] PaymentPage 결제 게이트웨이 연동
- [ ] MainCorrectionProgressPage 타이머
- [ ] MainCorrectionResultPage 다운로드
- [ ] 결제 플로우 통합 테스트

### Phase 5-6
- [ ] SettingsPage 완성
- [ ] NotificationCenterPage 완성
- [ ] InquiryPage 완성
- [ ] 전체 앱 안정성 테스트

---

## 8. 주요 기술 스택

- **프론트엔드**: React 18.2, React Router 7.13, Vite 5
- **백엔드**: Firebase (Auth, Firestore, Storage, Functions, Hosting)
- **인증**: Firebase Auth + Google OAuth + 이메일 인증
- **상태 관리**: React Context API (AuthContext)
- **스타일**: Tailwind CSS
- **테스트**: Playwright E2E
- **배포**: Firebase Hosting

---

## 9. 개발 팁 및 주의사항

### 개발 환경 전환
```bash
# Mock 데이터로 개발
npm run dev

# Firebase 에뮬레이터로 개발
npm run dev:emulator

# 프로덕션 빌드
npm run build
```

### Mock ↔ API 전환
- `App.jsx`에서 환경변수로 제어
- `VITE_USE_MOCK=true` → ProjectServiceMock 사용
- `VITE_USE_MOCK=false` → ProjectServiceApi 사용

### Firebase 권한 체크
- Firestore 규칙 배포 필요: `firebase deploy --only firestore`
- Auth 설정 확인: `firebase.google.com` → Authentication

### 성능 최적화
- 대용량 파일 업로드는 Resumable Upload 사용
- 이미지는 다운로드 시 최적화 (webp, 썸네일)
- 폴링 대신 Realtime Database 고려

---

## 10. 다음 단계

1. **Phase 1 시작**: LoginPage 테스트 → SignUpPage 구현
2. **데이터 스키마 확정**: Firestore collections 구조 확정
3. **API 엔드포인트 정의**: Cloud Functions 작성
4. **E2E 테스트 작성**: Playwright 테스트 케이스
5. **UI/UX 검수**: 디자인 팀과 협업

