# Firebase 환경 설정 가이드

## 환경 파일 구조

이 프로젝트는 세 가지 환경을 지원합니다:

### 1. `.env.development` - Mock 서비스 (기본 개발)
- **용도**: 빠른 프로토타이핑, Firebase 없이 개발
- **명령어**: `npm run dev`
- **특징**: Mock 데이터 사용, Firebase 연결 불필요
- **사용하는 상황**: 
  - UI/UX 개발
  - Firebase 설정 전 초기 개발
  - 빠른 테스트

### 2. `.env.local` - Firebase 에뮬레이터 (로컬 개발)
- **용도**: 로컬 Firebase 에뮬레이터와 함께 개발
- **명령어**: `npm run dev:local`
- **특징**: 
  - 로컬 Auth/Firestore 사용
  - 데이터 영속성 (firebase-data 폴더에 저장)
  - 실제 Firebase API와 동일하게 동작
- **사용하는 상황**: 
  - 실제 Firebase 기능 테스트
  - 데이터 저장/로드 테스트
  - 인증 플로우 테스트

### 3. `.env.production` - 프로덕션 Firebase
- **용도**: 실제 서버에 배포
- **명령어**: `npm run build && npm run deploy`
- **특징**: 실제 프로덕션 Firebase 프로젝트 연결

## 로컬 개발 시작하기

### 1단계: 필요한 도구 설치
```bash
# Firebase CLI 설치 (아직 안 했다면)
npm install -g firebase-tools

# 로그인 (처음 한 번만)
firebase login
```

### 2단계: 로컬 에뮬레이터와 함께 개발 시작
```bash
npm run dev:local
```

이 명령어는 다음을 자동으로 수행합니다:
1. Firebase 에뮬레이터 시작 (Auth: 9099, Firestore: 8080)
2. 개발 서버 시작 (Vite: localhost:5173)
3. 에뮬레이터 UI 시작 (localhost:4000)

### 3단계: 브라우저에서 앱 열기
- **앱**: http://localhost:5173
- **에뮬레이터 UI**: http://localhost:4000 (선택사항)

## 로컬 데이터 관리

### 데이터 내보내기
```bash
firebase emulators:export ./firebase-data
```

### 데이터 불러오기
```bash
firebase emulators:start --import=./firebase-data
```

### 자동 저장
`npm run dev:local` 종료 시 자동으로 데이터가 `./firebase-data`에 저장됩니다.

## 환경별 환경변수

### `.env.development` (Mock 모드)
```
VITE_USE_MOCK=true
VITE_USE_EMULATOR=false
```

### `.env.local` (에뮬레이터 모드)
```
VITE_USE_MOCK=false
VITE_USE_EMULATOR=true
VITE_FIREBASE_AUTH_EMULATOR_PORT=9099
VITE_FIREBASE_FIRESTORE_EMULATOR_PORT=8080
```

### `.env.production` (프로덕션)
```
VITE_USE_MOCK=false
VITE_USE_EMULATOR=false
VITE_FIREBASE_API_KEY=실제_프로덕션_키
VITE_FIREBASE_AUTH_DOMAIN=실제_도메인
VITE_FIREBASE_PROJECT_ID=prism-wedding-84b5d
VITE_FIREBASE_STORAGE_BUCKET=실제_버킷
VITE_FIREBASE_MESSAGING_SENDER_ID=실제_발신자ID
VITE_FIREBASE_APP_ID=실제_앱ID
```

## 트러블슈팅

### "포트 이미 사용 중" 오류
```bash
# 기존 프로세스 종료
lsof -i :5173 -i :5174 -i :9099 -i :8080 -i :4000 | grep -v COMMAND | awk '{print $2}' | xargs kill -9
```

### Firebase 에뮬레이터 연결 실패
1. 에뮬레이터가 실제로 실행 중인지 확인: http://localhost:4000
2. 포트가 5173, 9099, 8080 모두 사용 가능한지 확인
3. `.env.local` 파일이 존재하고 올바르게 설정되었는지 확인

### Mock vs Emulator 전환
- Mock에서 Emulator로 전환: `npm run dev:local`
- Emulator에서 Mock으로 전환: `npm run dev`

## 프로덕션 Firebase 설정

실제 프로덕션 환경을 설정하려면:

1. [Firebase Console](https://console.firebase.google.com)에서 프로젝트 선택
2. 프로젝트 설정 → "웹 앱" → 설정값 확인
3. `.env.production` 파일 업데이트:
```bash
VITE_FIREBASE_API_KEY=your_actual_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=prism-wedding-84b5d
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. 배포:
```bash
npm run deploy:all
```

## NPM 스크립트 참고

| 스크립트 | 설명 | Firebase 연결 |
|---------|-----|------------|
| `npm run dev` | Mock 서비스로 개발 | 없음 (Mock 사용) |
| `npm run dev:local` | 로컬 에뮬레이터로 개발 | localhost (에뮬레이터) |
| `npm run build` | 프로덕션 빌드 | 연결 안 함 |
| `npm run emulators` | Firebase 에뮬레이터만 실행 | localhost |
| `npm run lint` | ESLint 실행 | - |
| `npm run preview` | 빌드된 앱 미리보기 | - |
| `npm run deploy` | 호스팅만 배포 | 프로덕션 |
| `npm run deploy:all` | 전체 배포 (함수 + 호스팅) | 프로덕션 |
