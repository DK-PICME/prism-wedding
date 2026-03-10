# 🔐 Google OAuth 설정 가이드

## 📋 Google Cloud Console 설정

### 1단계: Google Cloud 프로젝트 생성

```
1. https://console.cloud.google.com 접속
2. 상단 "프로젝트 선택" 클릭
3. "새 프로젝트" 클릭
4. 프로젝트명: "Prism Studio Wedding"
5. "만들기" 클릭 (2-3분 소요)
```

### 2단계: OAuth 2.0 동의 화면 설정

```
1. 좌측 메뉴 → "APIs & Services" → "OAuth consent screen"
2. "User Type" 선택: 
   - 외부 사용자 선택 (권장)
3. "만들기" 클릭
4. 다음 정보 입력:
   - App name: "Prism Studio"
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
5. "저장 후 계속" 클릭
```

### 3단계: OAuth 클라이언트 ID 생성

```
1. 좌측 메뉴 → "APIs & Services" → "Credentials"
2. "Create Credentials" 클릭
3. "OAuth 2.0 Client ID" 선택
4. Application type: "Web application"
5. Name: "Prism Studio Web"
6. "Authorized JavaScript origins" 추가:
   - http://localhost:5173 (개발용)
   - http://localhost:3000 (개발용)
7. "Authorized redirect URIs" 추가:
   - http://localhost:5173/auth/callback
   - http://localhost:3000/auth/callback
   - https://your-domain.com/auth/callback (프로덕션)
8. "만들기" 클릭
```

### 4단계: 클라이언트 ID 복사

```
생성된 OAuth 클라이언트 정보에서:
- Client ID 복사 (VITE_GOOGLE_CLIENT_ID)
- Client Secret 복사 (나중에 사용할 경우)
```

---

## 🔧 프론트엔드 설정

### 1. .env 파일 업데이트

```bash
VITE_GOOGLE_CLIENT_ID=your_client_id_here
```

### 2. Firebase에 Google 제공자 활성화

```
1. Firebase Console → 인증 (Authentication)
2. "Sign-in method" 탭
3. "Google" 클릭
4. "활성화" 토글
5. "프로젝트 지원 이메일" 선택
6. "저장" 클릭
```

### 3. 코드 통합

SignUpPage, LoginPage에서 Google Sign-In 버튼 클릭 시:
- Google Sign-In 라이브러리 사용
- ID Token 획득
- Firebase 인증

---

## 📊 전체 흐름

```
사용자 → Google 로그인 버튼 클릭
         ↓
      Google OAuth 팝업 (Google 계정 입력)
         ↓
      ID Token 획득
         ↓
      Firebase signInWithCredential() 호출
         ↓
      사용자 정보 Firestore 저장
         ↓
      로그인 완료 → 메인 페이지로 리다이렉트
```

---

## ✅ 체크리스트

- [ ] Google Cloud 프로젝트 생성
- [ ] OAuth 동의 화면 설정
- [ ] OAuth 클라이언트 ID 생성
- [ ] Client ID .env에 추가
- [ ] Firebase Google 제공자 활성화
- [ ] Google Sign-In 컴포넌트 통합
- [ ] 테스트 (로컬 환경)
- [ ] 프로덕션 Redirect URI 추가
