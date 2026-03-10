# React Router 마이그레이션 완료

## 개요
웨딩 스튜디오 프로젝트에서 페이지 깜빡거림 문제를 해결하기 위해 **URL 쿼리 파라미터 기반 라우팅에서 React Router로 마이그레이션**했습니다.

## 문제점 (마이그레이션 전)
- **페이지 깜빡거림**: 네비게이션 시 `window.location` 사용으로 인해 전체 페이지가 새로고침
- **상태 손실**: 페이지 이동 시 AuthContext 상태가 초기화되어 깜빡거리는 현상 발생
- **사용자 정보 표시 지연**: 사용자 정보 로드 비동기 처리로 인한 UI 깜빡거림

## 해결 방법
### 1. React Router 설치
```bash
npm install react-router-dom
```

### 2. 라우터 구조 설정
`src/App.jsx`를 React Router 기반으로 리팩토링:
```jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
```

### 3. 라우트 정의
모든 페이지를 명시적 경로로 정의:
```jsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/sign-up" element={<SignUpPage />} />
  <Route path="/verify-email" element={<VerifyEmailPage />} />
  <Route path="/order-list" element={<OrderListPage />} />
  <Route path="/settings" element={<SettingsPage />} />
  {/* ... 기타 라우트 */}
  <Route path="/" element={<Navigate to="/login" replace />} />
</Routes>
```

### 4. 네비게이션 업데이트
**이전 (URL 쿼리 파라미터):**
```jsx
window.location.href = '?page=order-list';
```

**이후 (useNavigate 훅):**
```jsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/order-list');
```

### 5. 컴포넌트별 수정
다음 파일들을 업데이트했습니다:
- `src/App.jsx` - React Router 설정
- `src/components/PrismHeader.jsx` - useNavigate 사용
- `src/pages/SignUpPage.jsx` - 네비게이션 업데이트
- `src/pages/LoginPage.jsx` - 네비게이션 업데이트
- `src/pages/VerifyEmailPage.jsx` - 네비게이션 업데이트

## 주요 개선사항

### 1️⃣ 깜빡거림 제거
- ✅ 페이지 전체 새로고침 없음
- ✅ 상태 유지 네비게이션
- ✅ 부드러운 페이지 전환

### 2️⃣ 헤더 정보 유지
```jsx
// 네비게이션 시에도 헤더의 사용자 정보가 유지됨
const displayName = userData?.displayName || currentUser?.displayName;
const userEmail = userData?.email || currentUser?.email;
```

### 3️⃣ URL 구조 개선
**이전:**
```
http://localhost:5173/?page=order-list
http://localhost:5173/?page=settings
```

**이후:**
```
http://localhost:5173/order-list
http://localhost:5173/settings
```

## 라우트 목록

### 인증 (Authentication)
- `/login` - 로그인 페이지
- `/sign-up` - 회원가입 페이지
- `/verify-email` - 이메일 검증 페이지
- `/password-recovery` - 비밀번호 복구 페이지

### 주문 관리 (Orders)
- `/order-list` - 주문 목록
- `/order-details` - 주문 상세
- `/create-new-order` - 새 주문 생성
- `/payment` - 결제 페이지

### 사진 관리 (Photos)
- `/photo-management` - 사진 관리
- `/upload` - 사진 업로드
- `/result` - 결과 확인

### 설정 (Settings)
- `/settings` - 설정 페이지
- `/notification-center` - 알림 센터

## 테스트 결과
✅ 페이지 이동 시 깜빡거림 없음
✅ 헤더 사용자 정보 유지
✅ 뒤로가기/앞으로 가기 정상 작동
✅ 새로고침 시에도 현재 페이지 유지

## 주의사항

### 개발 서버 유지
프로젝트는 여전히 `npm run dev`로 개발 서버를 실행합니다.

### 빌드
프로덕션 빌드 시:
```bash
npm run build
firebase deploy --only hosting
```

### 라우트 추가 시
새로운 페이지를 추가할 때는 항상 React Router의 `<Route>`로 정의하고, 
`useNavigate()` 훅을 사용하여 네비게이션하세요.

## 향후 개선 사항
- 페이지 전환 애니메이션 추가
- 라우트 가드 (예: 인증 필수 페이지)
- 쿼리 파라미터 처리 (예: 필터링, 정렬)
- 중첩 라우팅 구조 고려

## 커밋 히스토리
- `5c482b4` - 🔄 React Router 도입 및 URL 기반 라우팅 마이그레이션
