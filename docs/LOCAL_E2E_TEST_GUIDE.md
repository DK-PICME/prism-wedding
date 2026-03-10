# 🧪 로컬 에뮬레이터 E2E 테스트 가이드

> **목표**: Phase 2 주문 생성 & 결제 플로우 전체 테스트
> **환경**: Firebase 에뮬레이터 (이메일 검증 스킵)
> **시간**: 약 15-20분

---

## 📋 테스트 체크리스트

### 1️⃣ 환경 준비 (2분)

- [ ] 터미널 1: `npm run dev:emulator` 실행 중 확인
  ```bash
  # 다음과 같은 로그가 보여야 함:
  # ✅ Firebase 에뮬레이터 연결됨
  # ✅ Vite 개발 서버 실행 중
  ```

- [ ] http://localhost:5173 브라우저에서 접속 가능 확인

- [ ] 콘솔 열기 (F12) → Network/Console 탭 확인

---

### 2️⃣ 회원가입 & 로그인 (3분)

**단계:**
1. "회원가입" 클릭
2. 다음 정보로 가입:
   - 이메일: `test@example.com`
   - 비밀번호: `test123456`
   - 이름: `테스트사용자`
3. "가입" 버튼 클릭
4. 이메일 검증 화면 → "확인" (에뮬레이터는 자동 완료)
5. 자동으로 `/photo-management`로 이동 확인

**확인 사항:**
- ✅ 회원가입 성공 (에러 없음)
- ✅ Firestore 콘솔: `users/{uid}` 문서 생성 확인
- ✅ Auth 에뮬레이터: 사용자 생성 확인

---

### 3️⃣ PhotoManagementPage 테스트 (5분)

**프로젝트 생성:**
1. "새 프로젝트" 버튼 클릭
2. 다이얼로그에서 프로젝트명 입력: `웨딩 촬영 2025`
3. "생성" 버튼 클릭

**확인 사항:**
- ✅ 프로젝트 섹션 생성 (헤더: 프로젝트명 + 생성날짜)
- ✅ "업로드 유도 메시지" 표시됨
- ✅ Firestore 콘솔: `projects/{projectId}` 문서 생성 확인

**사진 업로드:**
1. 프로젝트 영역에 간단한 이미지 파일 드래그앤드롭 (또는 "파일 선택")
   - 추천: 작은 이미지 (< 1MB)
2. 업로드 진행률 바 확인
3. 업로드 완료 후 상태 변화 확인

**확인 사항:**
- ✅ 업로드 진행률 표시 (0% → 100%)
- ✅ 사진 상태: UPLOADING → UPLOAD_COMPLETED → PROCESSING → READY
- ✅ Firestore 콘솔: `photos/{photoId}` 문서 생성 및 상태 변화 확인
- ✅ Cloud Storage 콘솔: 파일 업로드 확인

**사진 선택:**
1. READY 상태의 사진에 체크박스 클릭 (1-2개 선택)
2. 하단에 "선택됨: N개" 표시 확인

**확인 사항:**
- ✅ 체크박스 활성화 (READY + !isLocked만)
- ✅ 선택 카운트 업데이트
- ✅ "주문 생성" 버튼 활성화

---

### 4️⃣ CreateNewOrderPage 테스트 (3분)

**페이지 이동:**
1. "주문 생성" 버튼 클릭
2. `/create-new-order` 페이지 확인

**확인 사항:**
- ✅ 선택된 사진 개수 표시 (예: "총 2장")
- ✅ 폼 비어있음

**양식 작성:**
1. 신부 이름: `김영희`
2. 신랑 이름: `이민준`
3. 촬영 유형: `웨딩 촬영` 선택
4. 촬영 장소: `롯데월드 타워`
5. 요청사항: `야외 촬영 선호합니다`
6. 보정 옵션: `기본 보정` 선택

**확인 사항:**
- ✅ 가격이 실시간으로 계산됨 (사진 수 × 장당 단가)
- ✅ 부가세 자동 계산 (10%)
- ✅ 총액 표시 (예: 1,210,000원)

**주문 생성:**
1. "주문 생성" 버튼 클릭
2. 로딩 스피너 표시
3. `/order-details?orderId=xxx` 페이지 자동 이동

**확인 사항:**
- ✅ 주문 문서 생성 (Firestore: `orders/{orderId}`)
- ✅ priceSnapshot 저장됨 (Remote Config 버전 포함)
- ✅ copyStatus: PENDING
- ✅ Console: `[Analytics] order_created` 이벤트 추적됨

---

### 5️⃣ OrderDetailsPage 테스트 (4min)

**페이지 확인:**
1. 주문 정보 표시 확인:
   - 신부/신랑 이름
   - 촬영 유형, 장소
   - 선택된 사진 개수
   - 가격 정보 (기본/옵션/부가세/총액)

**복제 상태 모니터링:**
1. "복제 상태" 섹션 확인:
   - PENDING → IN_PROGRESS → COMPLETED (또는 실패)
2. 상태가 변하지 않으면 F5로 새로고침
3. 30초~1분 내 복제 완료 대기

**확인 사항:**
- ✅ 실시간 구독이 작동함 (onSnapshot)
- ✅ 복제 상태 시각화 (배지색상 변화)
- ✅ Firestore 콘솔: `orders/{orderId}` copyStatus 변화 확인

**"결제하기" 버튼:**
1. copyStatus = COMPLETED되면 버튼 활성화 확인
2. 그 전까지는 비활성화 (disabled) 확인

**확인 사항:**
- ✅ 복제 완료 후 버튼 활성화
- ✅ 미완료 상태에서 버튼 비활성화

---

### 6️⃣ PaymentPage 테스트 (2분)

**페이지 이동:**
1. "결제하기" 버튼 클릭
2. `/payment?orderId=xxx` 페이지 확인

**확인 사항:**
- ✅ 주문 요약 정보 표시
- ✅ 결제 금액 표시 (총액)

**결제 방법 선택:**
1. 라디오 버튼으로 결제 방법 선택 (예: "신용카드")
2. 선택된 상태 시각화 확인

**결제 처리:**
1. "결제하기" 버튼 클릭
2. 2초간 로딩 (Mock 결제 시뮬레이션)
3. "결제 완료!" 화면 표시

**확인 사항:**
- ✅ Order.status = PAID 업데이트 (Firestore 확인)
- ✅ Console: `[Analytics] payment_completed` 이벤트 추적됨
- ✅ 완료 화면 표시

---

## 🐛 에러 시 확인 사항

### "No matching allow statements" 오류
**원인:** Firestore Rules 업데이트 안 됨
**해결:**
```bash
# Firebase 에뮬레이터 재시작
firebase emulators:start --import=./firebase-data --export-on-exit=./firebase-data
```

### 복제 상태가 업데이트 안 됨
**원인:** onSnapshot 구독 미작동
**해결:**
1. F5로 새로고침
2. 브라우저 콘솔 에러 확인
3. Network 탭에서 WebSocket 연결 확인

### 주문 생성 안 됨
**원인:** 
- 필수 필드 미입력
- userId 불일치

**해결:**
1. 콘솔 에러 메시지 확인
2. Firestore Rules 검증
3. 네트워크 탭에서 요청 확인

---

## 📊 Firestore 콘솔에서 확인할 데이터

### 구조
```
firestore-emulator/
├── users/{uid}/
│   ├── email, displayName, createdAt, lastLogin
│   └── settings: { notifications: {...} }
├── projects/{projectId}/
│   ├── userId, name, createdAt, updatedAt
│   └── photoCount, totalSize
├── photos/{photoId}/
│   ├── userId, projectId (또는 folderId)
│   ├── fileName, fileSize, fileExt, fileMd5
│   ├── status, uploadProgress
│   └── uploadedUrl, thumbnailUrl, previewUrl, webpUrl
├── orders/{orderId}/
│   ├── userId, photoIds: [...]
│   ├── brideName, groomName, shootingType, location
│   ├── status, copyStatus
│   ├── priceSnapshot: {...}
│   └── paymentDeadline, createdAt
└── payments/{paymentId}/
    ├── userId, orderId
    ├── amount, method, status
    └── pgProvider, transactionId
```

---

## 🔍 Console 로그로 확인

다음 로그들이 순서대로 나타나야 함:

```javascript
// 1. 사진 업로드
[Analytics] photo_upload_started
✅ 사진 업로드 완료: ...

// 2. 주문 생성
[Analytics] order_creation_started
[Analytics] order_created

// 3. 복제 상태 (실시간 업데이트)
✅ 프로젝트 실시간 리스너 등록
// copyStatus 변화: PENDING → IN_PROGRESS → COMPLETED

// 4. 결제
[Analytics] payment_initiated
[Analytics] payment_completed
```

---

## 📝 테스트 결과 기록

| 항목 | 상태 | 비고 |
|------|------|------|
| 회원가입 | ⏳ | |
| 프로젝트 생성 | ⏳ | |
| 사진 업로드 | ⏳ | |
| 사진 선택 | ⏳ | |
| 주문 생성 | ⏳ | |
| 복제 상태 모니터링 | ⏳ | |
| 결제 | ⏳ | |
| **전체** | ⏳ | |

---

## 💡 추가 팁

1. **Chrome DevTools → Sources**에서 breakpoint 설정 가능
2. **Network 탭**에서 Firestore 요청 확인
3. **Application 탭**에서 sessionStorage 데이터 확인
4. **주기적으로 F5 새로고침** (실시간 구독 확인)

---

## 🎯 다음 단계

테스트 완료 후:
1. ✅ 모든 항목 성공 → Cloud Functions 배포
2. ❌ 에러 발생 → 콘솔 로그로 원인 파악 후 수정
