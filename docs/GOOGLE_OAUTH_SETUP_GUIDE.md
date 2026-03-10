# Google OAuth 2.0 설정 가이드

## 개요
이 프로젝트에서 Google OAuth를 통한 로그인/가입 기능을 활성화하려면 다음 단계를 완료해야 합니다.

## 단계 1: Firebase Console에서 Google 제공자 활성화

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. 프로젝트 선택: **prism-wedding-84b5d**
3. 왼쪽 메뉴에서 **Authentication** 클릭
4. **Sign-in method** 탭 클릭
5. **Google** 제공자 선택
6. **Enable** 토글 켜기
7. 프로젝트 지원 이메일 설정
8. **Save** 클릭

## 단계 2: Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성

### 2-1. Google Cloud Console 접속
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 프로젝트 선택: **Prism Studio Wedding** (Firebase 프로젝트와 동일)

### 2-2. OAuth 동의 화면 설정
1. 왼쪽 메뉴에서 **APIs & Services** > **OAuth consent screen** 클릭
2. **User Type** 선택:
   - 개발 환경: **Internal** 권장 (테스트용)
   - 프로덕션: **External** 필요 (공개 배포)
3. 필수 정보 입력:
   - **App name**: "Prism Studio Wedding"
   - **User support email**: 지원 이메일 입력
   - **Developer contact information**: 개발자 이메일 입력
4. **Save and Continue** 클릭

### 2-3. OAuth 2.0 클라이언트 ID 생성
1. 왼쪽 메뉴에서 **APIs & Services** > **Credentials** 클릭
2. **+ Create Credentials** > **OAuth client ID** 클릭
3. **Application type** 선택: **Web application**
4. **Name**: "Prism Studio Wedding Web App"
5. **Authorized JavaScript origins** 추가:
   ```
   http://localhost:5174
   http://localhost:3000
   https://prism-wedding-84b5d.web.app
   ```
6. **Authorized redirect URIs** 추가:
   ```
   http://localhost:5174/
   http://localhost:3000/
   https://prism-wedding-84b5d.web.app/
   ```
7. **Create** 클릭
8. **Client ID** 복사 (나중에 필요)

## 단계 3: 환경 변수 설정

`.env` 파일에서 `VITE_GOOGLE_CLIENT_ID`를 설정합니다:

```env
VITE_GOOGLE_CLIENT_ID=your_copied_client_id_here
```

예시:
```env
VITE_GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
```

## 단계 4: 개발 서버 재시작

```bash
npm run dev
```

## 테스트

1. 개발 서버가 실행 중인지 확인: `http://localhost:5174`
2. 로그인 페이지 또는 회원가입 페이지 방문
3. "Google 계정으로 로그인" 버튼 클릭
4. Google 계정으로 인증
5. 성공 시 주문 목록 페이지로 자동 리다이렉트

## 문제 해결

### "The given client ID is not found" 에러
- `VITE_GOOGLE_CLIENT_ID` 환경 변수가 올바르게 설정되었는지 확인
- `.env` 파일을 수정한 후 개발 서버 재시작
- Google Cloud Console에서 클라이언트 ID가 활성화되어 있는지 확인

### "사용 설정된 API가 없습니다" 에러
- Google Cloud Console에서 **Google+ API** 또는 **Google Identity API**가 활성화되어 있는지 확인
- **APIs & Services** > **Library**에서 "Google+ API" 검색 후 **Enable** 클릭

### CORS 에러
- 현재 도메인이 Google Cloud Console의 **Authorized JavaScript origins**에 추가되어 있는지 확인

## 프로덕션 배포

Firebase 호스팅으로 배포할 때:

1. `.env` 파일에서 `VITE_GOOGLE_CLIENT_ID`를 프로덕션 클라이언트 ID로 설정
2. Firebase 호스팅 URL을 Google Cloud Console의 Authorized origins에 추가:
   ```
   https://prism-wedding-84b5d.web.app
   ```
3. `npm run build && npm run deploy` 실행

## 참고 자료

- [Firebase Google 인증 문서](https://firebase.google.com/docs/auth/web/google-signin?hl=ko)
- [Google OAuth 2.0 문서](https://developers.google.com/identity/protocols/oauth2/web-server)
- [@react-oauth/google 라이브러리](https://github.com/react-oauth/react-oauth.github.io)
