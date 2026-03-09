# 로컬 개발 환경 설정

## 📋 현재 상태

| 항목 | 상태 | 설명 |
|-----|------|------|
| **Mock 개발** | ✅ 바로 사용 가능 | `npm run dev` 또는 `npm run dev:local` |
| **Firebase 에뮬레이터** | ⚠️ Java 업그레이드 필요 | Java 21 이상 필요 |
| **프로덕션 Firebase** | 📋 설정 필요 | 프로덕션 API 키 필요 |

## 🚀 빠른 시작 (Mock 모드)

### 지금 바로 사용
```bash
# 방법 1: 기본 개발 서버
npm run dev

# 방법 2: 로컬 프로필 사용 (Mock 모드)
npm run dev:local
```

두 명령어는 동일합니다. `.env.local` 파일을 사용하려면 **`npm run dev:local`** 추천

### 환경 설정
- ✅ `.env.development` - Mock 서비스 (기본값)
- ✅ `.env.local` - Mock 서비스 (로컬 프로필, 설정 준비 완료)
- 📋 `.env.production` - 프로덕션 Firebase (설정 필요)

## 🔧 Firebase 에뮬레이터 설정 (선택사항)

### 요구사항
- **Java 21 이상** (현재 Java 15 설치됨)

### Java 21 설치 방법

**Homebrew 사용 (Mac)**
```bash
brew install openjdk@21
```

**다른 OS의 경우**
- [Oracle JDK 21](https://www.oracle.com/java/technologies/downloads/#java21)
- [OpenJDK 21](https://jdk.java.net/21/)

### Java 설치 후 환경 경로 설정

```bash
# zsh (추천)
echo 'export PATH="/usr/local/opt/openjdk@21/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 또는 bash 사용 시
echo 'export PATH="/usr/local/opt/openjdk@21/bin:$PATH"' >> ~/.bash_profile
source ~/.bash_profile
```

### Java 버전 확인
```bash
java -version
# java version "21.x.x" 이상이어야 함
```

### 에뮬레이터 활성화

Java 21 설치 후:

```bash
# .env.local 파일 수정
# VITE_USE_MOCK=false
# VITE_USE_EMULATOR=true

# 에뮬레이터와 함께 개발 서버 시작
npm run dev:emulator
```

## 📝 환경 파일 선택 가이드

### `.env.development`
- **사용**: `npm run dev`
- **특징**: Mock 데이터 사용
- **용도**: 빠른 프로토타이핑

### `.env.local`
- **사용**: `npm run dev:local`
- **특징**: Mock 데이터 또는 에뮬레이터 (Java 21 필요)
- **용도**: 로컬 개발 전용 설정 유지
- **수정 가능**: 원할 때 `.env.local`만 수정

### `.env.production`
- **사용**: 빌드/배포 시 자동 선택
- **특징**: 실제 프로덕션 Firebase
- **용도**: 배포 환경

## 🔀 모드 전환

### Mock ↔️ Mock
```bash
npm run dev              # `.env.development` 사용
npm run dev:local        # `.env.local` 사용
```

### Mock → Firebase 에뮬레이터 (Java 21 설치 후)
```bash
# 1. .env.local 파일 수정
VITE_USE_MOCK=false
VITE_USE_EMULATOR=true

# 2. 에뮬레이터와 함께 실행
npm run dev:emulator
```

### 기본값으로 돌아가기
```bash
# 1. 다시 Mock 모드로
# .env.local 파일 또는 .env.development 수정
VITE_USE_MOCK=true
VITE_USE_EMULATOR=false

# 2. 개발 서버 실행
npm run dev:local
```

## 🧪 각 모드 테스트 체크리스트

### Mock 모드 테스트
- [ ] `npm run dev:local` 실행
- [ ] http://localhost:5173 접속
- [ ] 로그인 페이지 표시 확인
- [ ] 이메일/비밀번호 입력 (Mock 데이터)
- [ ] 콘솔에 에러 없음 확인

### 에뮬레이터 모드 테스트 (Java 21 설치 후)
- [ ] Java 21 설치 확인
- [ ] `.env.local` 수정 (VITE_USE_EMULATOR=true)
- [ ] `npm run dev:emulator` 실행
- [ ] http://localhost:5173 접속
- [ ] http://localhost:4000 (에뮬레이터 UI)
- [ ] 회원가입, 로그인, 로그아웃 테스트
- [ ] 데이터 저장 확인 (재시작해도 유지)

## 🐛 트러블슈팅

### "포트 이미 사용 중" 오류
```bash
# 모든 관련 포트 종료
lsof -i :5173 -i :5174 -i :9099 -i :8080 -i :4000 | grep -v COMMAND | awk '{print $2}' | xargs kill -9
```

### Java 버전 오류
```bash
# Java 21 설치 확인
java -version

# 경로 설정 후 재부팅
echo 'export PATH="/usr/local/opt/openjdk@21/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Firebase 에뮬레이터 연결 실패
1. 에뮬레이터 UI 확인: http://localhost:4000
2. 콘솔에서 에러 메시지 확인 (F12)
3. `.env.local` 파일이 올바른지 확인

## 📚 관련 가이드

- [FIREBASE_ENV_GUIDE.md](./FIREBASE_ENV_GUIDE.md) - 자세한 환경 설정
- [README.md](./README.md) - 프로젝트 개요
