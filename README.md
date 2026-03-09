# 프리즘 스튜디오 - 웨딩 프로젝트 웹앱

React + Vite + Tailwind CSS로 구축한 프리즘 스튜디오 고객 포털 프로젝트입니다.

🎯 **상태**: 진행 중 | 📅 **추정 완료**: 4-6주 (1명 기준) | 🔥 **우선순위**: Phase 1-2 진행 중

## 📚 주요 문서

### 🎯 Phase 2 — 단일 진실의 원천

> **[`PHASE2_MASTER_SPEC.md`](./PHASE2_MASTER_SPEC.md)** — Phase 2의 **유일한** 설계 기준 문서
> 아키텍처 결정, Firestore 스키마, Photo 상태 머신, 가격 모델, 플로우, Cloud Function 명세, 구현 체크리스트 모두 포함.
> 기존 설계 문서들은 `docs/archive/`로 이동되었습니다.

### 기타 참고 문서

- **[`APP_STRUCTURE_AND_PRIORITY.md`](./APP_STRUCTURE_AND_PRIORITY.md)** - 전체 화면 맵, 데이터 흐름, 연관관계, Phase별 작업 항목
- **[`PROCESS_FLOW_DIAGRAM.md`](./PROCESS_FLOW_DIAGRAM.md)** - 사용자 여정, 상태 전이도, 페이지 네비게이션, API 흐름도
- **[`IMPLEMENTATION_STRATEGY.md`](./IMPLEMENTATION_STRATEGY.md)** - 최종 구현 전략, 기술 스택, 로드맵, 위험 관리, KPI
- **[`GROWTH_ANALYTICS_ROADMAP.md`](./GROWTH_ANALYTICS_ROADMAP.md)** - 그로스 해킹, CRM, AARRR 펀널, 분석 도구 로드맵
- **[`PADDLE_IMPLEMENTATION_GUIDE.md`](./PADDLE_IMPLEMENTATION_GUIDE.md)** - 글로벌 결제 Paddle 구현 가이드
- **[`PADDLE_NODE_SDK_IMPLEMENTATION.md`](./PADDLE_NODE_SDK_IMPLEMENTATION.md)** - Node.js SDK 조사, 선택 이유, 테스트 스크립트, 자동화 구현 계획

## 📑 페이지 구성

### 전체 화면 지도 (20개 페이지)

| 그룹 | 페이지 | URL | 상태 | 설명 |
|------|--------|-----|------|------|
| **인증** | LoginPage | `/login` | 🔄 진행중 | 이메일/Google 로그인 |
| | SignUpPage | `/sign-up` | 🔄 진행중 | 회원가입 및 이메일 검증 |
| | VerifyEmailPage | `/verify-email` | 🔄 진행중 | 이메일 인증 |
| | PasswordRecoveryPage | `/password-recovery` | 🔄 진행중 | 비밀번호 찾기 |
| **주문관리** | OrderListPage | `/order-list` | ⚪ 대기 | 주문 목록 및 대시보드 |
| | CreateNewOrderPage | `/create-new-order` | ⚪ 대기 | 새 주문 생성 |
| | OrderDetailsPage | `/order-details` | ⚪ 대기 | 주문 상세 정보 |
| | PaymentPage | `/payment` | ⚪ 대기 | 결제 처리 |
| **사진관리** | PhotoManagementPage | `/photo-management` | ⚪ 대기 | 사진 관리 |
| **샘플보정** | UploadPage | `/upload` | ✅ 완료 | 샘플 업로드 (STEP 1) |
| | WaitingPage | `/waiting` | ✅ 완료 | 샘플 대기 (STEP 1) |
| | ResultPage | `/result` | ✅ 완료 | 샘플 결과 확인 (STEP 2) |
| | SampleRevisionRequestPage | `/sample-revision-request` | ✅ 완료 | 샘플 수정 요청 (STEP 2) |
| **본보정** | MainCorrectionUploadPage | `/main-correction-upload` | ✅ 완료 | 본보정 업로드 (STEP 3) |
| | MainCorrectionProgressPage | `/main-correction-progress` | ✅ 완료 | 본보정 진행중 (STEP 4) |
| | MainCorrectionResultPage | `/main-correction-result` | ✅ 완료 | 본보정 결과 (STEP 5) |
| **상태/설정** | CurrentStatusPage | `/status` | ✅ 완료 | 현재 상태 확인 |
| | CompletedPage | `/completed` | ✅ 완료 | 완료 및 다운로드 |
| | SettingsPage | `/settings` | ⚪ 대기 | 설정 (프로필, 알림, 계정) |
| | NotificationCenterPage | `/notification-center` | ⚪ 대기 | 알림 센터 |
| | InquiryPage | `/inquiry` | ⚪ 대기 | 1:1 문의 |
| | FailedItemManagementPage | `/failed-items` | ⚪ 대기 | 실패 항목 관리 |

**범례**: ✅ 완료 | 🔄 진행중 | ⚪ 대기

## 프로젝트 구조

```
wedding/
├── src/
│   ├── components/        # 재사용 가능한 React 컴포넌트
│   │   ├── Header.jsx     # 상단 네비게이션 (진행 단계 표시)
│   │   ├── Footer.jsx     # 하단 정보 및 연락처
│   │   ├── StatusMessage.jsx
│   │   ├── ProjectInfo.jsx
│   │   ├── NextSteps.jsx
│   │   └── ContactInfo.jsx
│   ├── pages/             # 페이지 단위 컴포넌트
│   │   ├── WaitingPage.jsx
│   │   ├── UploadPage.jsx
│   │   ├── ResultPage.jsx
│   │   └── CurrentStatusPage.jsx
│   ├── services/          # 비즈니스 로직 및 API 통신
│   │   ├── ProjectService.js (인터페이스)
│   │   └── ProjectServiceMock.js (개발용 더미 구현)
│   ├── hooks/             # 커스텀 React 훅
│   │   └── useProject.js
│   ├── utils/             # 유틸리티 함수
│   │   └── helpers.js
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
└── _backup/               # 기존 HTML 파일 백업
```

## 설치 및 실행

### 의존성 설치

```bash
npm install
```

### 개발 서버 시작

```bash
npm run dev
```

기본 포트는 `5173`입니다. 브라우저에서 `http://localhost:5173` 접속 후 `?projectId=proj_001` 파라미터를 추가하여 테스트합니다.

### 프로덕션 빌드

```bash
npm run build
```

## 🚀 구현 로드맵

### Phase 1: 인증 및 기본 구조 (1주) ⭐⭐⭐⭐⭐
**상태**: ✅ 완료 (분석 인프라 통합)

- [x] LoginPage (이메일/Google OAuth) - 완료
- [x] SignUpPage + VerifyEmailPage - 완료  
- [x] PasswordRecoveryPage - 완료
- [x] AuthContext 완성 (로그인 유지, 세션 관리)
- [x] 네비게이션 보호 (Private Route)
- [x] GA4 + Smartlook 분석 인프라 - **NEW**
- [x] 이벤트 추적 시스템 - **NEW**

### Phase 2: 주문 관리 (2주) ⭐⭐⭐⭐⭐
**상태**: 🔄 진행 중 (아키텍처 설계 완료, 구현 시작 단계)

> **상세 스펙**: [`PHASE2_MASTER_SPEC.md`](./PHASE2_MASTER_SPEC.md) 참조 (구현 체크리스트 포함)

**핵심 구현 항목:**
- [ ] PhotoManagementPage (폴더 + Dropbox 스타일 UI + 7가지 상태 머신)
- [ ] CreateNewOrderPage (Remote Config 기반 가격 계산)
- [ ] OrderDetailsPage (Real-time 복제 상태 + 타임아웃 카운트다운)
- [ ] Cloud Function: processUploadedPhoto (썸네일/백업 생성)
- [ ] Cloud Function: photoCopyOnOrder (주문 복제, 지수 백오프)
- [ ] PaymentPage (진입 조건 검증 + PaymentServiceMock)

**향후 계획 (Phase 3+):**
- [ ] TODO: Admin Dashboard (고아 파일 모니터링)
- [ ] TODO: Cloud Scheduler (자동 정리 Cron Job)

### Phase 3: 샘플 보정 플로우 (2주) ⭐⭐⭐⭐⭐
**상태**: ✅ UI 완료 / 🔄 Firebase 연동 진행중

- [x] UploadPage (사진 업로드 UI)
- [x] WaitingPage (대기 상태 표시)
- [x] ResultPage (Before/After 비교)
- [ ] Cloud Storage 파일 업로드 연동
- [ ] 실시간 상태 업데이트 (폴링)

### Phase 4: 본보정 플로우 (1주) ⭐⭐⭐⭐
**상태**: ✅ UI 완료 / 🔄 Firebase 연동 대기

- [x] MainCorrectionUploadPage (다중 업로드 UI)
- [x] MainCorrectionProgressPage (진행 상태 표시)
- [x] MainCorrectionResultPage (결과 확인)
- [ ] 실시간 진행 상태 업데이트
- [ ] 다운로드 기능 구현

### Phase 5: 부가 기능 (1주) ⭐⭐⭐
**상태**: ⚪ 대기

- [ ] SettingsPage (프로필, 알림, 계정 관리)
- [ ] NotificationCenterPage (알림 목록)
- [ ] InquiryPage (1:1 문의)
- [ ] 알림 시스템 (Email, In-App)

### Phase 6: 관리자 및 최적화 (1주) ⭐⭐
**상태**: ⚪ 대기

- [ ] FailedItemManagementPage (실패 항목 관리)
- [ ] 성능 최적화 (번들 크기, 로딩 속도)
- [ ] 보안 강화 (XSS, CSRF 방지)
- [ ] E2E 테스트 (Playwright)

**총 예상 소요 시간: 4-6주 (1명 기준)**

---

## 📋 기능 상세

### ✅ 완료된 기능

#### 사진 보정 UI 페이지
- ✅ UploadPage - 사진 업로드 (Drag&Drop)
- ✅ WaitingPage - 대기 상태 표시
- ✅ ResultPage - Before/After 비교
- ✅ SampleRevisionRequestPage - 수정 요청
- ✅ MainCorrectionUploadPage - 다중 파일 업로드
- ✅ MainCorrectionProgressPage - 진행 현황 타임라인
- ✅ MainCorrectionResultPage - 완성된 사진 다운로드
- ✅ CompletedPage - 완료 및 평가

#### 인증 UI 페이지
- ✅ LoginPage - 로그인 폼
- ✅ SignUpPage - 회원가입 폼
- ✅ VerifyEmailPage - 이메일 인증 UI
- ✅ PasswordRecoveryPage - 비밀번호 찾기 UI

#### 분석 및 추적 인프라 **NEW**
- ✅ AnalyticsService - 통합 분석 서비스 (GA4, Smartlook)
- ✅ 이벤트 추적 - sign_up, login, email_verified, purchase 등
- ✅ UTM 파라미터 캡처 - 유입 채널 추적
- ✅ 사용자 식별 - 로그인 사용자 자동 식별
- ✅ 페이지뷰 추적 - 모든 라우트 변경 시 자동 추적

#### 공통 컴포넌트
- ✅ PrismHeader - 공통 헤더 네비게이션
- ✅ PrismFooter - 공통 푸터
- ✅ ProtectedRoute - 보호된 라우트
- ✅ Header/Footer - 페이지별 헤더/푸터

### 🔄 진행 중인 기능

- 🔄 Firebase Auth 연동 (로그인 상태 유지)
- 🔄 Firestore 데이터 연동 (프로젝트 정보)
- 🔄 Cloud Storage 파일 업로드
- 🔄  실시간 상태 업데이트 (폴링)

### ⚪ 대기 중인 기능

- ⚪ 주문 관리 (생성, 조회, 수정, 삭제)
- ⚪ 결제 게이트웨이 (포트원, KG이니시스)
- ⚪ 설정 페이지 (프로필, 알림 설정)
- ⚪ 알림 센터 (메일, In-App 알림)
- ⚪ 1:1 문의하기

## 🏗️ 아키텍처

### 기술 스택

| 계층 | 기술 | 버전 | 용도 |
|------|------|------|------|
| **프론트엔드** | React | 18.2 | UI 렌더링 |
| | React Router | 7.13 | SPA 라우팅 |
| | Vite | 5.0 | 번들러 |
| | Tailwind CSS | - | 스타일링 |
| **상태 관리** | React Context | - | 인증 상태 |
| **백엔드** | Firebase Auth | - | 사용자 인증 |
| | Firestore | - | NoSQL 데이터베이스 |
| | Cloud Storage | - | 파일 저장 |
| | Cloud Functions | - | 서버리스 API |
| | Cloud Hosting | - | 배포 |
| **테스트** | Playwright | 1.58 | E2E 테스트 |

### 시스템 구조

```
┌─────────────────────────────────────────┐
│  React Frontend (Vite 번들)              │
│  • 20개 페이지 컴포넌트                   │
│  • Tailwind CSS 스타일링                 │
│  • React Router 네비게이션               │
└────────────────┬────────────────────────┘
                 │ HTTP/HTTPS
    ┌────────────▼────────────┐
    │  Firebase Backend        │
    ├─────────────────────────┤
    │ • Auth (이메일, Google)  │
    │ • Firestore (DB)        │
    │ • Cloud Storage (파일)   │
    │ • Cloud Functions (API) │
    └─────────────────────────┘
```

### 데이터 모델

**Firestore Collections:**
- `users/{uid}` - 사용자 정보 (프로필, 설정)
- `projects/{projectId}` - 프로젝트 정보 (주문, 샘플, 본보정)
- `notifications/{notificationId}` - 알림 기록

**Cloud Storage:**
- `/photos/{projectId}/sample.jpg` - 샘플 사진
- `/photos/{projectId}/main/` - 본보정 원본 사진
- `/photos/{projectId}/edited/` - 보정된 사진

### 현재 상태 (백엔드 연동)

- **Mock 구현** (ProjectServiceMock): 개발/테스트용 더미 데이터 제공
- **API 구현** (ProjectServiceApi): 실제 Firebase 메서드 구현
- **인터페이스** (ProjectService): 추상 베이스 클래스

### Firebase 환경 변수

`.env.local` 또는 `.env.development`에서 설정:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_USE_EMULATOR=true  # Firebase 에뮬레이터 사용 시
VITE_USE_MOCK=false      # Mock 데이터 사용 시
```

### Mock ↔ API 전환

`src/App.jsx`에서 환경변수로 자동 전환:

```javascript
const useMock = import.meta.env.VITE_USE_MOCK === 'true';
const projectService = useMock 
  ? new ProjectServiceMock() 
  : new ProjectServiceApi();
```

### 개발 명령어

```bash
# Mock 데이터로 개발
npm run dev

# Firebase 에뮬레이터로 개발
npm run dev:emulator

# 프로덕션 빌드
npm run build

# 배포
npm run deploy

# E2E 테스트
npm run test:e2e
npm run test:e2e:ui  # UI 포함
```

## 🧪 테스트

### 라우팅 테스트 (React Router v7)

```bash
# 인증 페이지
http://localhost:5173/login                     # 로그인
http://localhost:5173/sign-up                   # 회원가입
http://localhost:5173/verify-email              # 이메일 인증
http://localhost:5173/password-recovery         # 비밀번호 찾기

# 주문 관리
http://localhost:5173/order-list                # 주문 목록
http://localhost:5173/create-new-order          # 새 주문 생성
http://localhost:5173/order-details             # 주문 상세
http://localhost:5173/payment                   # 결제

# 사진 보정 (완료된 페이지)
http://localhost:5173/upload                    # 샘플 업로드 (STEP 1)
http://localhost:5173/waiting                   # 샘플 대기
http://localhost:5173/result                    # 샘플 결과 (STEP 2)
http://localhost:5173/sample-revision-request   # 샘플 수정 요청
http://localhost:5173/main-correction-upload    # 본보정 업로드 (STEP 3)
http://localhost:5173/main-correction-progress  # 본보정 진행중 (STEP 4)
http://localhost:5173/main-correction-result    # 본보정 결과 (STEP 5)

# 상태/설정
http://localhost:5173/status                    # 현재 상태 확인
http://localhost:5173/completed                 # 완료
http://localhost:5173/settings                  # 설정
http://localhost:5173/notification-center       # 알림 센터
http://localhost:5173/inquiry                   # 1:1 문의
http://localhost:5173/photo-management          # 사진 관리
```

### E2E 테스트

```bash
# Playwright 테스트 실행
npm run test:e2e

# UI 모드 (시각적 테스트)
npm run test:e2e:ui

# 디버그 모드
npm run test:e2e:debug
```

## 📖 개발 가이드

### 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── Header.jsx       # 샘플보정 진행상황 헤더
│   ├── Footer.jsx       # 페이지 푸터
│   ├── PrismHeader.jsx  # 메인 네비게이션 헤더
│   ├── PrismFooter.jsx  # 메인 푸터
│   ├── LoadingSpinner.jsx
│   ├── StatusMessage.jsx
│   ├── ProjectInfo.jsx
│   └── ...
├── pages/               # 페이지 컴포넌트 (20개)
│   ├── LoginPage.jsx
│   ├── SignUpPage.jsx
│   ├── OrderListPage.jsx
│   ├── UploadPage.jsx
│   ├── ResultPage.jsx
│   ├── MainCorrectionUploadPage.jsx
│   ├── MainCorrectionProgressPage.jsx
│   ├── MainCorrectionResultPage.jsx
│   └── ...
├── contexts/            # React Context
│   └── AuthContext.jsx  # 인증 상태 관리
├── services/            # 비즈니스 로직
│   ├── ProjectService.js (추상 클래스)
│   ├── ProjectServiceMock.js
│   └── ProjectServiceApi.js
├── hooks/               # 커스텀 React 훅
│   └── useProject.js
├── utils/               # 유틸리티 함수
│   └── helpers.js
├── config/              # 설정 파일
│   └── firebase.js
├── App.jsx              # 루트 컴포넌트
└── main.jsx             # 엔트리포인트
```

### 새로운 페이지 추가하기

1. **페이지 파일 생성**: `src/pages/MyNewPage.jsx`

```jsx
export function MyNewPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 콘텐츠 */}
    </div>
  );
}
```

2. **라우팅 추가**: `src/App.jsx`

```jsx
import { MyNewPage } from './pages/MyNewPage';

<Routes>
  <Route path="/my-new-page" element={<MyNewPage />} />
</Routes>
```

3. **네비게이션 추가**: `src/components/PrismHeader.jsx`

```jsx
<a href="/my-new-page">새 페이지</a>
```

### 새로운 컴포넌트 추가하기

1. **컴포넌트 파일 생성**: `src/components/MyComponent.jsx`

```jsx
export function MyComponent({ title, onClick }) {
  return (
    <div className="p-4 bg-white rounded-lg">
      <h2 className="text-lg font-semibold">{title}</h2>
      <button onClick={onClick}>액션</button>
    </div>
  );
}
```

2. **페이지에서 사용**

```jsx
import { MyComponent } from '../components/MyComponent';

export function MyPage() {
  return (
    <MyComponent 
      title="제목" 
      onClick={() => console.log('clicked')} 
    />
  );
}
```

### 인증 상태 사용하기

```jsx
import { useAuth } from '../contexts/AuthContext';

export function MyPage() {
  const { currentUser, userData, login, logout } = useAuth();

  if (!currentUser) {
    return <div>로그인 필요</div>;
  }

  return (
    <div>
      <h1>{userData?.displayName}님 환영합니다!</h1>
      <button onClick={logout}>로그아웃</button>
    </div>
  );
}
```

### 프로젝트 데이터 사용하기

```jsx
import { useProject, useProjectId } from '../hooks/useProject';

export function MyPage({ projectService }) {
  const projectId = useProjectId();
  const { project, loading, error } = useProject(projectService, projectId);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error.message}</div>;

  return (
    <div>
      <h1>{project?.name}</h1>
      <p>{project?.status}</p>
    </div>
  );
}
```

## 🎨 스타일링

- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **컬러 스키마**: Neutral (회색 계열) + 악센트 색상
- **반응형**: Mobile-first 디자인 (sm, md, lg, xl 브레이크포인트)
- **다크 모드**: 지원 예정 (localStorage 기반)

### Tailwind 설정

`tailwind.config.js`에서 커스텀 색상 및 테마 설정 가능

```javascript
module.exports = {
  theme: {
    colors: {
      // 기본 Tailwind 색상 사용
      neutral: { ... },
      white: '#fff',
      // 추가 커스텀 색상
    }
  }
}
```

---

## 🚀 배포

### Firebase Hosting 배포

```bash
# 1. 프로덕션 빌드
npm run build

# 2. 배포 (호스팅만)
npm run deploy

# 3. 전체 배포 (Firebase 모든 서비스)
npm run deploy:all

# 4. Cloud Functions만 배포
npm run deploy:functions
```

### 환경별 설정

| 환경 | 설정 | 용도 |
|------|------|------|
| **개발** | `.env.development` | `npm run dev` |
| **에뮬레이터** | `.env.local` + `VITE_USE_EMULATOR=true` | `npm run dev:emulator` |
| **프로덕션** | `.env.production` | `npm run build` |

---

## 📞 문의 및 지원

### 문제 해결

**로그인 실패:**
- Firebase Console에서 Authentication 활성화 확인
- Google OAuth 설정 확인
- 이메일 인증 활성화 확인

**파일 업로드 실패:**
- Cloud Storage 권한 확인 (`firebase.google.com` → Storage 규칙)
- 파일 크기 확인 (최대 10MB)
- 브라우저 콘솔 에러 확인

**데이터 로드 실패:**
- Firestore 권한 확인 (`firebase.google.com` → Firestore 규칙)
- 네트워크 연결 확인
- Firebase 할당량 확인

### 개발자 연락처

- 프로젝트 담당자: [연락처]
- Firebase 지원: https://firebase.google.com/support

---

## 📚 추가 자료

- [Vite 공식 문서](https://vitejs.dev/)
- [React 공식 문서](https://react.dev/)
- [Firebase 문서](https://firebase.google.com/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [React Router 문서](https://reactrouter.com/)

---

## 📝 라이선스

Copyright © 2026 Prism Studio. All rights reserved.

---

## 🔄 버전 히스토리

### v1.0.0 (2025-03-09)
- 초기 프로젝트 구조 설정
- 20개 페이지 UI 구현 완료 (샘플보정, 본보정)
- 인증 시스템 부분 구현 (LoginPage, SignUpPage)
- Firebase 기본 연동
- 로드맵 및 아키텍처 문서 작성

**다음 버전**: Phase 2 (주문관리, 결제) 구현
