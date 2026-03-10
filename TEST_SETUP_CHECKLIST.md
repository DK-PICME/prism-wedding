# 🚀 테스트 준비 체크리스트

## 필수 사항

### 개발 서버
- [ ] Firebase 에뮬레이터 실행 중
  ```bash
  npm run dev:emulator
  ```
  
- [ ] Vite 개발 서버 실행 중 (http://localhost:5173)

- [ ] 콘솔에서 다음 메시지 확인:
  ```
  ✅ Firebase 에뮬레이터 연결됨
  ```

### 환경 설정
- [ ] `.env.development` 설정 확인:
  ```
  VITE_USE_EMULATOR=true
  VITE_USE_MOCK=false
  ```

- [ ] Firestore Rules 업데이트 완료:
  ```bash
  # firestore.rules 파일에 orders, payments 컬렉션 추가됨
  ```

### 브라우저 준비
- [ ] Chrome/Firefox 최신 버전
- [ ] DevTools 열기 (F12)
- [ ] Network 탭, Console 탭 준비
- [ ] 쿠키/캐시 비우기 (선택사항)

---

## 테스트 시작 명령어

### 터미널 1 - 에뮬레이터 & 개발 서버
```bash
cd /Users/dk/project/prism-wedding
npm run dev:emulator
```

### 터미널 2 - 선택사항 (Firebase 콘솔 모니터링)
```bash
# Firestore 에뮬레이터 UI 열기
# http://localhost:4000 (자동으로 열림)
```

### 브라우저
```
http://localhost:5173
```

---

## 테스트 계정 정보

| 항목 | 값 |
|------|-----|
| 이메일 | `test@example.com` |
| 비밀번호 | `test123456` |
| 이름 | `테스트사용자` |

> 에뮬레이터는 이메일 검증을 자동으로 완료합니다.

---

## 주요 확인 포인트

### 1. 각 페이지 이동 경로
```
/login 또는 /sign-up
  ↓
/verify-email (에뮬레이터는 자동 완료)
  ↓
/photo-management ✅
  ↓
/create-new-order ✅
  ↓
/order-details ✅
  ↓
/payment ✅
```

### 2. Firestore 컬렉션 생성 확인
```
users/{uid} ✅
projects/{projectId} ✅
photos/{photoId} ✅
orders/{orderId} ✅
```

### 3. 상태 변화 확인
```
Photo.status:
  UPLOADING → UPLOAD_COMPLETED → PROCESSING → READY

Order.copyStatus:
  PENDING → IN_PROGRESS → COMPLETED
```

### 4. 실시간 업데이트 확인
```
OrderDetailsPage에서 F5 새로고침 시
copyStatus 변화가 보여야 함 (자동 또는 수동)
```

---

## 에러 대응 가이드

### Case 1: "Firebase 에뮬레이터 연결 실패"
```bash
# 에뮬레이터 재시작
npm run dev:emulator

# 또는 수동으로
firebase emulators:start --import=./firebase-data --export-on-exit=./firebase-data
```

### Case 2: "No matching allow statements"
```bash
# Firestore Rules 재로드
# → 에뮬레이터 재시작 필요
npm run dev:emulator
```

### Case 3: 사진 상태가 UPLOADING에서 안 넘어감
```
// Console에서 확인:
// 1. Network 탭 → 업로드 요청 완료 여부
// 2. Console 에러 메시지 확인
// 3. F5 새로고침
```

### Case 4: 주문 생성 후 OrderDetailsPage에서 복제 상태 안 보임
```
// 해결:
// 1. F5 새로고침
// 2. Console에서 onSnapshot 에러 확인
// 3. Firestore Rules 검증
```

---

## 테스트 소요 시간

| 단계 | 예상 시간 |
|------|----------|
| 회원가입 & 로그인 | 2-3분 |
| 프로젝트 생성 | 1분 |
| 사진 업로드 | 2-3분 |
| 사진 선택 | 1분 |
| 주문 생성 | 2-3분 |
| 복제 상태 대기 | 1-2분 |
| 결제 | 1분 |
| **총계** | **12-16분** |

---

## 성공 기준

✅ 다음 조건을 모두 만족하면 성공:

1. 회원가입 & 로그인 성공
2. PhotoManagementPage에서 사진 업로드 완료 (READY 상태)
3. CreateNewOrderPage에서 주문 정보 입력 & 가격 계산
4. OrderDetailsPage에서 복제 상태 모니터링
5. PaymentPage에서 결제 완료
6. 모든 Firestore 문서가 정상 생성됨
7. Console 에러 없음

---

## 추가 자료

- 📖 [상세 테스트 가이드](./LOCAL_E2E_TEST_GUIDE.md)
- 🔍 [Firestore 에뮬레이터 UI](http://localhost:4000)
- 🐛 [Firebase 에뮬레이터 로그](http://localhost:4000/logs)

---

## 테스트 완료 후

1. **성공한 경우:**
   ```bash
   git add -A
   git commit -m "test: Local E2E test passed - full order flow"
   ```

2. **실패한 경우:**
   - 콘솔 에러 스크린샷 저장
   - 에러 메시지 기록
   - 원인 분석 후 수정

---

## 빠른 참고

| 항목 | 로그/확인 위치 |
|------|--------------|
| 회원가입 로그 | Chrome DevTools → Console |
| Firestore 데이터 | http://localhost:4000 → Firestore 탭 |
| 사진 업로드 진행 | PhotoManagementPage UI |
| 주문 정보 | Firestore 에뮬레이터 또는 OrderDetailsPage |
| 결제 상태 | PaymentPage 또는 Firestore: orders/{orderId} |
