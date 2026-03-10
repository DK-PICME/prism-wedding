# 🚀 Firebase 설정 완료 및 테스트 가이드

## ✅ 완료된 설정

### 1. Firebase 프로젝트 설정 (✅ 완료)
- ✅ Firebase Console에서 프로젝트 생성
- ✅ 웹 앱 등록 완료
- ✅ Firebase 설정 정보 복사 완료

### 2. 프로젝트 환경 설정 (✅ 완료)
- ✅ `.env` 파일 생성 및 Firebase 설정값 입력
- ✅ `.env` 파일이 `.gitignore`에 포함되어 있음 (보안 안전)

### 3. 남은 작업 (⏳ 해야 할 것)
Firebase Console에서 다음을 완료해야 합니다:

#### A. Authentication 활성화 (이메일/비밀번호)
```
Firebase Console → Build → Authentication → Sign-in method

1. "Email/Password" 클릭
2. "활성화" 토글 ON
3. "저장" 클릭
```

#### B. Authentication 활성화 (Google - 선택)
```
Firebase Console → Build → Authentication → Sign-in method

1. "Google" 클릭
2. "활성화" 토글 ON
3. 프로젝트 지원 이메일 선택
4. "저장" 클릭
```

#### C. Firestore Database 생성 (권장)
```
Firebase Console → Build → Firestore Database

1. "데이터베이스 만들기" 클릭
2. 위치 선택 (한국: asia-northeast1)
3. 보안 규칙: "테스트 모드"로 시작 (개발용)
4. "만들기" 클릭
```

---

## 🧪 로그인 페이지 테스트

### 테스트 환경 시작

```bash
# 터미널에서
cd /Users/prism/Downloads/wedding
npm run dev
```

### 브라우저에서 테스트

```
http://localhost:5173/?page=login
또는
http://localhost:5173/?page=sign-up
```

### 테스트 시나리오

#### 1️⃣ 회원가입 테스트
```
1. http://localhost:5173/?page=sign-up 접속
2. 다음 정보 입력:
   - 스튜디오명: "테스트 스튜디오"
   - 이메일: "test@example.com"
   - 비밀번호: "TestPass123!" (8자 이상, 숫자, 특수문자)
   - 비밀번호 확인: "TestPass123!"
   - 약관 동의 체크 (2개)
3. "회원가입" 버튼 클릭
4. 성공 메시지 또는 에러 확인
```

#### 2️⃣ 로그인 테스트
```
1. http://localhost:5173/?page=login 접속
2. 회원가입한 이메일과 비밀번호 입력
3. "로그인" 버튼 클릭
4. 성공 메시지 또는 에러 확인
```

#### 3️⃣ 비밀번호 찾기 테스트
```
1. http://localhost:5173/?page=password-recovery 접속
2. 등록된 이메일 입력
3. "재설정 링크 전송" 버튼 클릭
4. 성공 메시지 확인
5. 이메일 받은 편지함 확인 (Firebase에서 자동 발송)
```

---

## 🔍 문제 해결

### 1. "VITE_FIREBASE_PROJECT_ID is not defined" 에러
```
해결: .env 파일이 제대로 저장되었는지 확인
- 파일명: .env (점으로 시작해야 함)
- 위치: 프로젝트 루트 디렉토리
- npm run dev 실행 후 개발 서버 재시작
```

### 2. Firebase 인증 안 되는 경우
```
확인 사항:
1. Firebase Console에서 Email/Password 활성화 확인
2. .env 파일의 Firebase 설정값 정확성 확인
3. 개발 서버 재시작 (npm run dev)
4. 브라우저 캐시 삭제 후 다시 시도
```

### 3. Firestore 권한 오류
```
Firebase Console → Firestore Database → Rules

테스트 모드로 설정된 경우:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 2, 9);
    }
  }
}
```

---

## 📋 체크리스트

Firebase Console에서:
- [ ] Authentication → Email/Password 활성화
- [ ] Authentication → Google 활성화 (선택)
- [ ] Firestore Database 생성
- [ ] 보안 규칙 설정 (테스트 모드)

로컬 환경:
- [ ] .env 파일 생성 및 설정값 입력
- [ ] npm run dev 실행
- [ ] 로그인 페이지 테스트

---

## 🎯 다음 단계

1. Firebase Console에서 Authentication 활성화
2. 로컬에서 회원가입/로그인 테스트
3. 성공적이면 Google OAuth 설정 진행

---

**마지막 업데이트**: 2025-01-22
**상태**: Firebase 설정 완료 ✅, 로컬 테스트 준비 완료 ✅
