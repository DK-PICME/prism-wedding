# Google OAuth 구현 완료 요약

## 날짜: 2026-03-09

## 구현 내용

### 1. App.jsx 수정
- `GoogleOAuthProvider` import 추가
- `GoogleOAuthProvider`로 `Router`와 `AuthProvider`를 감싸기
- 환경 변수 `VITE_GOOGLE_CLIENT_ID` 읽기 및 설정

```jsx
<GoogleOAuthProvider clientId={googleClientId || ''}>
  <Router>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </Router>
</GoogleOAuthProvider>
```

### 2. LoginPage.jsx 수정
- `GoogleLogin` 컴포넌트 import 추가
- 기존 버튼을 `GoogleLogin` 컴포넌트로 대체
- `handleGoogleLogin` 함수 수정:
  - `credentialResponse.credential`에서 ID Token 추출
  - `loginWithGoogle(idToken)` 호출
  - 성공 시 `/order-list`로 리다이렉트

### 3. SignUpPage.jsx 수정
- `GoogleLogin` 컴포넌트 import 추가
- 기존 버튼을 `GoogleLogin` 컴포넌트로 대체
- `handleGoogleSignUp` 함수 수정:
  - `credentialResponse.credential`에서 ID Token 추출
  - `loginWithGoogle(idToken)` 호출
  - 성공 시 `/order-list`로 리다이렉트

### 4. AuthContext.jsx 수정
- `loginWithGoogle` 함수 수정:
  ```jsx
  const loginWithGoogle = async (idToken) => {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    // Firestore에 사용자 정보 저장
    await saveUserData(...);
    return result.user;
  };
  ```
  - ID Token을 Firebase Credential로 변환
  - Firebase 인증 수행
  - Firestore에 사용자 정보 저장

## PKCE 흐름 (Protected Key Code Exchange)

`@react-oauth/google` 라이브러리에서 사용하는 Google Sign-In은 자동으로 PKCE 흐름을 지원합니다:

1. **Google 버튼 클릭** → 사용자가 Google 계정 인증
2. **ID Token 생성** → Google에서 ID Token 발급
3. **Callback 처리** → `handleGoogleLogin`에서 ID Token 수신
4. **Firebase 인증** → `GoogleAuthProvider.credential(idToken)` 생성
5. **사용자 세션** → Firebase에서 세션 생성 및 Firestore에 사용자 정보 저장

### PKCE 개선사항
- **보안**: Authorization Code 대신 ID Token 사용으로 중간자 공격 방지
- **성능**: 리다이렉트 없이 직접 ID Token 수신 가능
- **간편성**: `@react-oauth/google` 라이브러리에서 모든 복잡한 로직 처리

## 환경 변수 설정 필요

`.env` 파일에 다음 내용 추가:

```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here
```

예시:
```env
VITE_GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
```

## 남은 작업

1. **Google Cloud Console 설정**
   - OAuth 동의 화면 설정
   - OAuth 2.0 클라이언트 ID 생성
   - Authorized JavaScript origins 설정
   - Authorized redirect URIs 설정

2. **환경 변수 설정**
   - `.env` 파일에 Client ID 추가
   - 개발 서버 재시작

3. **테스트**
   - 로그인 페이지에서 Google 버튼 클릭
   - Google 인증 완료 후 자동 리다이렉트 확인
   - 사용자 정보 저장 확인

## 참고 자료

- [Firebase Google 인증 공식 문서](https://firebase.google.com/docs/auth/web/google-signin?hl=ko)
- [@react-oauth/google 라이브러리](https://github.com/react-oauth/react-oauth.github.io)
- [Google OAuth 2.0 PKCE 흐름](https://developers.google.com/identity/protocols/oauth2/native-app#authorization-requests)
