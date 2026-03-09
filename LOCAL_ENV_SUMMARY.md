# 로컬 개발 환경 정리

## ✅ 완료된 설정

### 1. 환경 파일 구조
- ✅ `.env.development` - Mock 서비스 (기본값)
- ✅ `.env.local` - 로컬 프로필 (현재 Mock 모드, 에뮬레이터 설정 준비 완료)
- ✅ `.env.production` - 프로덕션 (설정 필요 시)

### 2. NPM 스크립트
```bash
npm run dev         # 기본 개발 서버 (.env.development 사용)
npm run dev:local   # 로컬 프로필 (.env.local 사용)
npm run dev:emulator # Firebase 에뮬레이터와 함께 실행 (Java 21 필요)
npm run emulators   # Firebase 에뮬레이터만 실행
```

### 3. Firebase 설정
- ✅ Firebase 에뮬레이터 지원 추가 (firebase.js)
- ✅ 환경변수로 에뮬레이터 활성화/비활성화 가능
- ✅ 에뮬레이터 자동 연결 로직 구현

### 4. 문서 작성
- ✅ `FIREBASE_ENV_GUIDE.md` - Firebase 환경 상세 가이드
- ✅ `LOCAL_DEV_SETUP.md` - 로컬 개발 설정 가이드

## 🚀 현재 사용법

### 지금 바로 시작
```bash
npm run dev:local
```

그 다음:
1. 브라우저에서 http://localhost:5173 접속
2. 로그인 페이지 확인
3. Mock 데이터로 테스트

## 🔄 모드별 사용

### Mock 모드 (현재)
- 빠른 개발 테스트
- Firebase 연결 불필요
- 데이터 저장 안 됨 (새로고침하면 초기화)

```bash
npm run dev:local
```

### Firebase 에뮬레이터 모드 (향후)
- 실제 Firebase API 동작 테스트
- 로컬 데이터 저장/로드
- 인증 플로우 테스트

```bash
# Java 21 설치 후
npm run dev:emulator
```

## 📌 다음 단계

### 선택사항 1: Firebase 에뮬레이터 사용 (권장)
1. Java 21 설치: `brew install openjdk@21`
2. 환경 경로 설정 (위의 LOCAL_DEV_SETUP.md 참고)
3. `.env.local` 수정:
   - `VITE_USE_MOCK=false`
   - `VITE_USE_EMULATOR=true`
4. `npm run dev:emulator` 실행

### 선택사항 2: 프로덕션 Firebase 연결
1. Firebase Console에서 프로젝트 설정 복사
2. `.env.production` 업데이트
3. `npm run deploy` 또는 `npm run deploy:all` 실행

## 🎯 장점

| 항목 | Mock | 에뮬레이터 | 프로덕션 |
|-----|------|---------|---------|
| 빠른 시작 | ✅ | △ | ✗ |
| 데이터 저장 | ✗ | ✅ | ✅ |
| 오프라인 개발 | ✅ | ✅ | ✗ |
| 실제 API 테스트 | ✗ | ✅ | ✅ |

## 🔗 관련 문서
- [FIREBASE_ENV_GUIDE.md](./FIREBASE_ENV_GUIDE.md)
- [LOCAL_DEV_SETUP.md](./LOCAL_DEV_SETUP.md)
- [README.md](./README.md)
