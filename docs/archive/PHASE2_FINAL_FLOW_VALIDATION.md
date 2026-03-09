# Phase 2 최종 플로우 검증 - 로그인부터 결제 직전까지

## 1. 전체 플로우 맵

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         PHASE 2 최종 플로우                              │
└──────────────────────────────────────────────────────────────────────────┘

Step 1: 인증
├─ LoginPage (/login)
│  ├─ 이메일 + 비밀번호 로그인
│  ├─ Google OAuth 로그인
│  ├─ 현재 구현: ✅ 완료 (Firebase Auth)
│  └─ 상태: currentUser ← Firebase Auth
│     ↓
Step 2: 사진 관리 & 업로드
├─ PhotoManagementPage (/photo-management)
│  ├─ 사진 폴더 목록 표시
│  ├─ "새 폴더 생성" 버튼
│  ├─ 기존 폴더 클릭 → 사진 보여주기 (Dropbox 스타일)
│  ├─ 현재 구현: ❌ 미구현 (하지만 설계 완료 ✅)
│  └─ 7가지 상태 머신 준비 완료
│     ├─ PENDING, UPLOADING, UPLOAD_COMPLETED
│     ├─ PROCESSING, READY, UPLOAD_FAILED, PROCESSING_FAILED
│     └─ 각 상태별 UI (색상 + 아이콘) 완료 ✅
│     ↓
Step 3: 주문 생성
├─ CreateNewOrderPage (/create-new-order)
│  ├─ 주문정보 입력
│  │  ├─ 신부 이름, 신랑 이름
│  │  ├─ 촬영 유형 선택 (웨딩, 스냅, 포토북 등)
│  │  ├─ 촬영 장소 입력
│  │  └─ 추가 요청사항 입력
│  ├─ 사진 선택 (PhotoManagement에서 선택된 사진들)
│  │  └─ 선택된 사진 목록 표시 (썸네일)
│  ├─ 가격 정보 표시 (기본가 + 옵션)
│  ├─ 보정 옵션 선택 (기본/긴급)
│  └─ 현재 구현: ❌ 미구현 (데이터 구조 설계 필요)
│     ↓
Step 4: 사진 복제 (백그라운드)
├─ 주문 생성 완료 시
│  ├─ 7개 선택 사진에 대해
│  │  └─ Semaphore Lock 획득 (30분, 세마포어)
│  ├─ Worker Pool (10-15개)로 병렬 복제
│  │  └─ S3 → order-storage/{orderId}/ 복제
│  ├─ 복제 시간: 약 15-25초 (700MB 기준)
│  ├─ 프로그레스 바 표시
│  └─ 완료 후 자동 결제 페이지로 이동
│     ↓
Step 5: 견적서 확인 (Order Details)
├─ OrderDetailsPage (/order-details)
│  ├─ 주문 정보 확인
│  │  ├─ 신부/신랑 이름
│  │  ├─ 촬영 유형
│  │  ├─ 선택된 사진 수
│  │  ├─ 보정 옵션
│  │  └─ 납기일 예상
│  ├─ 가격 정보
│  │  ├─ 기본 가격 (사진 수 × 기본 단가)
│  │  ├─ 옵션 추가 요금 (긴급보정, 추가 수정 등)
│  │  ├─ 할인 (있으면)
│  │  ├─ 세금 (VAT 10%)
│  │  └─ 총액
│  ├─ 진행상황
│  │  ├─ 사진 복제 진행률: "복제 완료 ✅"
│  │  ├─ 준비 상태: "결제 대기 중"
│  │  └─ 타임아웃: "결제는 1시간 이내에 완료해주세요"
│  ├─ 버튼
│  │  ├─ "결제하기" (활성화, 다음 단계)
│  │  ├─ "주문 수정" (미구현, 향후)
│  │  └─ "주문 취소" (미구현, 향후)
│  ├─ 현재 구현: ⚠️ 부분 구현 (UI만 있고 데이터 연동 필요)
│  └─ 필요한 개선:
│      ├─ 주문 정보 동적 로드
│      ├─ 사진 복제 상태 실시간 표시
│      ├─ 타임아웃 경고 (결제 1시간 제한)
│      ├─ 세마포어 상태 감시
│      └─ Lock Duration 자동 갱신 (5분마다)
│     ↓
Step 6: 결제 직전
├─ PaymentPage (/payment) - 진입 조건 확인
│  ├─ 필수 확인사항 (모두 만족해야 진입 가능)
│  │  ├─ ✅ 사용자 로그인 (currentUser 존재)
│  │  ├─ ✅ 주문 존재 (orderId 파라미터)
│  │  ├─ ✅ 사진 복제 완료 (Order.copyStatus = "COMPLETED")
│  │  ├─ ✅ 세마포어 활성 (Photo.status = "COPYING_TO_ORDER")
│  │  └─ ✅ 1시간 이내 (Order.createdAt + 3600초 내)
│  └─ 조건 불만족 시:
│      ├─ "사진 복제 중" → OrderDetailsPage 돌아가기
│      ├─ "세마포어 만료" → 에러 메시지 + "복제 재시작" 버튼
│      └─ "1시간 초과" → 에러 + "주문 재생성" 유도
│     ↓ (다음 단계)
Step 7: 결제 진행
└─ PaymentPage (/payment)
   ├─ 결제 게이트웨이 (구현 필요)
   ├─ 카드, 계좌이체, 휴대폰 결제
   └─ 완료 후 → 보정 시작!
```

---

## 2. 각 Step별 상세 분석 및 구멍 찾기

### Step 1: LoginPage ✅ 완료

**현재 상태:**
```
✅ Firebase Auth 완전 구현
✅ Google OAuth 구현
✅ 이메일/비밀번호 로그인
✅ 회원가입, 이메일 검증, 비밀번호 찾기
✅ AuthContext 완성
```

**구멍:**
```
❓ 구멍 없음 (Phase 1 완료)
```

---

### Step 2: PhotoManagementPage ❌ 미구현 (설계 완료)

**필요한 기능:**
```
1. 폴더 목록 조회
   ├─ Firestore: Folder 컬렉션 조회
   ├─ 사용자별 폴더 필터링 (userId = currentUser.uid)
   ├─ 각 폴더의 사진 수 표시
   └─ 마지막 수정일 표시

2. 폴더 생성
   ├─ "새 폴더" 버튼
   ├─ 폴더 이름 입력 다이얼로그
   ├─ Firestore: Folder 문서 생성
   └─ UI 갱신

3. 폴더 상세 진입
   ├─ 선택된 폴더의 사진 목록 표시
   ├─ Firestore: Photo 컬렉션 조회 (folderId 필터)
   ├─ 7가지 상태별 UI 표시 (우상단 뱃지)
   │  ├─ PENDING (회색 원)
   │  ├─ UPLOADING (파란 스피닝)
   │  ├─ PROCESSING (주황 스피닝)
   │  ├─ READY (초록 체크마크)
   │  ├─ UPLOAD_FAILED (빨강 X 두 줄)
   │  └─ PROCESSING_FAILED (빨강 ⚠️)
   ├─ 각 사진에서:
   │  ├─ 썸네일 표시 (사진이 READY일 때)
   │  ├─ 진행 상황 (UPLOADING은 진행률)
   │  ├─ 에러 메시지 (실패한 경우)
   │  ├─ "재시도" / "삭제" 버튼 (실패한 경우)
   │  └─ 체크박스 (주문 생성 시 선택용)
   └─ 선택 완료 후 "다음" 버튼

4. 사진 업로드 (여기서 수행)
   ├─ Drag & Drop 또는 파일 선택
   ├─ 각 사진에 대해:
   │  ├─ Photo.status = "PENDING" 초기화
   │  ├─ S3 업로드 시작 (status = "UPLOADING")
   │  ├─ S3 완료 → "UPLOAD_COMPLETED"
   │  ├─ Cloud Function 트리거 → "PROCESSING"
   │  ├─ 모든 처리 완료 → "READY"
   │  └─ 또는 실패 → "UPLOAD_FAILED" or "PROCESSING_FAILED"
   └─ 모든 사진이 업로드 완료되어야 "주문 생성" 가능
```

**구멍 분석:**
```
❌ 구멍 1: 폴더 구조 설계 필요
   ├─ Firestore Folder 컬렉션 스키마 미정
   ├─ Photo ↔ Folder 관계 설정 필요
   └─ 사용자별 폴더 권한 체크 필요

❌ 구멍 2: 사진 상태 실시간 업데이트
   ├─ Firestore Listener 필요 (Realtime Database 아님)
   ├─ 각 Photo의 상태 변경을 실시간 감지
   └─ UI 컴포넌트가 상태 변경에 반응

❌ 구멍 3: Dropbox 스타일 UI 구현
   ├─ Grid 레이아웃 설계 필요
   ├─ 반응형 (모바일/태블릿/데스크톱)
   ├─ 썸네일 최적화 (로딩 성능)
   └─ 무한 스크롤 vs 페이지네이션

❌ 구멍 4: 업로드 실패 복구
   ├─ 재시도 로직 구현
   ├─ 지수 백오프 전략
   ├─ 최대 재시도 횟수 (업로드 3회, 처리 2회)
   └─ 자동 정리 (7일/14일 후)

❌ 구멍 5: Lock Duration 갱신
   ├─ 사용자가 사진 선택 중인 동안
   ├─ 5분마다 세마포어 갱신
   ├─ Firestore 업데이트 빈번
   └─ 네트워크 비용 고려
```

---

### Step 3: CreateNewOrderPage ❌ 미구현

**현재 UI:**
```
✅ 디자인 존재
❓ 데이터 연동 미구현
```

**필요한 기능:**
```
1. 선택된 사진 받기
   ├─ PhotoManagement에서 선택된 photoIds 받기
   ├─ 각 사진의 정보 표시 (썸네일, 파일 크기)
   └─ 선택 취소 기능 (다시 선택 가능)

2. 주문정보 폼
   ├─ 신부 이름 (필수)
   ├─ 신랑 이름 (필수)
   ├─ 촬영 유형 (필수, 드롭다운)
   ├─ 촬영 장소 (옵션)
   └─ 추가 요청사항 (옵션, 텍스트에어리어)

3. 가격 계산
   ├─ 기본 가격 계산
   │  ├─ 선택된 사진 수 × 단가 (기본)
   │  ├─ 예: 7장 × 100,000원 = 700,000원
   │  └─ 가격표 표시
   ├─ 옵션 추가 요금
   │  ├─ "긴급 보정" 옵션: +50,000원
   │  ├─ "추가 수정" 옵션: +30,000원
   │  └─ 체크박스로 선택
   ├─ 할인 (있으면)
   │  ├─ 프로모션 코드 입력
   │  └─ 자동 계산
   ├─ 세금 (VAT 10% = 총가격 × 0.1)
   └─ 총액 자동 계산

4. 보정 옵션 선택
   ├─ "기본 보정" (일반 납기)
   ├─ "긴급 보정" (빠른 납기, +요금)
   ├─ 각 옵션별 예상 납기일 표시
   └─ 라디오 버튼으로 선택

5. "다음: 견적서 확인" 버튼
   ├─ Firestore Order 문서 생성
   │  ├─ Order.status = "PENDING" (초기)
   │  ├─ Order.userId = currentUser.uid
   │  ├─ Order.photoIds = [...선택된 사진들]
   │  ├─ Order.correctionOption = "basic" or "urgent"
   │  ├─ Order.createdAt = Timestamp
   │  └─ Order.copyStatus = "PENDING" (아직 복제 안 함)
   └─ OrderDetailsPage로 이동 (orderDetails에 orderId 전달)
```

**구멍 분석:**
```
❌ 구멍 1: 상태 전달 메커니즘
   ├─ PhotoManagement → CreateNewOrder로 선택된 photoIds 전달
   ├─ React Router로 state 전달? 또는 URL 파라미터?
   ├─ 새로고침 시 데이터 손실 가능성 ⚠️
   └─ 권장: Firestore 임시 저장 (Order 문서 draft 상태로 먼저 생성)

❌ 구멍 2: 가격 계산 로직
   ├─ 단가 정의 필요 (어디서 가져올 것?)
   │  ├─ Firestore에 PriceTable 컬렉션? 또는 환경변수?
   │  ├─ 관리자 패널에서 수정 가능?
   │  └─ 버전 관리 필요 (과거 주문과 가격 일치)
   ├─ 옵션별 가격 정의 필요
   │  ├─ 긴급 보정: +50,000원 (하드코딩 vs 설정)
   │  └─ 추가 수정: +30,000원
   └─ 세금 계산 (국가별? 지역별?)

❌ 구멍 3: 주문 ID 생성 및 저장
   ├─ Firestore에서 자동 생성 (doc())? 또는 커스텀?
   ├─ Order 문서 생성 시기?
   │  ├─ 옵션 A: CreateNewOrder에서 생성 (Draft 상태)
   │  ├─ 옵션 B: OrderDetails 확인 후 생성
   │  └─ 추천: 옵션 A (타임아웃 방지)
   └─ 임시 주문 정리 (1시간 후 자동 삭제)

❌ 구멍 4: 사진 선택 검증
   ├─ 선택된 사진이 정말 READY 상태인지?
   ├─ 선택 후 사진이 삭제된 경우?
   ├─ 선택 후 사진 상태가 변경된 경우?
   └─ 재시도 로직 필요
```

---

### Step 4: 사진 복제 (백그라운드) ⚠️ 설계 완료, 미구현

**구조:**
```
주문 생성 후 → OrderDetailsPage 진입
    ↓
Firestore: Order.status = "PENDING"
    ↓ (별도 프로세스: Cloud Function 또는 프론트 폴링)
Order.copyStatus = "IN_PROGRESS"
    ↓ (병렬 복제, 15-25초)
Photo 7개 모두:
├─ Photo.status = "COPYING_TO_ORDER" (Lock 획득)
├─ Photo.lockedByOrder = orderId
├─ S3: user-uploads → order-storage/{orderId}/ 복제
└─ 복제 완료 후 Photo.status = "READONLY"
    ↓
Order.copyStatus = "COMPLETED"
Order.readyForPayment = true
```

**구멍 분석:**
```
❌ 구멍 1: 복제 타이밍
   ├─ 언제 복제를 시작할 것인가?
   ├─ 옵션 A: OrderDetailsPage 진입 시 즉시 시작
   │  ├─ 장점: 빠른 진행
   │  └─ 단점: 사용자가 주문 취소하면?
   ├─ 옵션 B: 결제 직전에 시작
   │  ├─ 장점: 확실한 주문
   │  └─ 단점: 복제 시간 + 결제 = 40초 이상 대기
   └─ 추천: 옵션 A (진입 시 시작, 백그라운드 실행)

❌ 구멍 2: 복제 실패 처리
   ├─ 7개 중 1개 사진 복제 실패?
   ├─ 옵션 1: All-or-Nothing (전체 다시)
   ├─ 옵션 2: Partial (성공한 것만 진행, 실패한 것은 재시도)
   └─ 추천: 옵션 1 (정합성)

❌ 구멍 3: 세마포어 관리
   ├─ OrderDetailsPage에서 Lock 갱신 (5분마다)
   ├─ 사용자가 페이지 떠났을 때?
   │  ├─ Lock 자동 갱신 안 됨 → Timeout!
   │  └─ 복제본 고아 (orphan) 상태
   ├─ Cloud Scheduler로 orphan 정리 필요
   └─ UI에 타임아웃 경고 필수

❌ 구멍 4: 프로그레스 표시
   ├─ 사용자에게 "복제 중... 75%" 표시?
   ├─ 또는 "복제 중..." (진행률 미표시)?
   └─ 네트워크 요청 빈도와 비용 고려
```

---

### Step 5: OrderDetailsPage ⚠️ UI 있음, 기능 미구현

**필요한 기능:**
```
1. 주문 정보 로드
   ├─ Firestore: Order 문서 조회 (orderId)
   ├─ Order 내용:
   │  ├─ 신부/신랑 이름
   │  ├─ 촬영 유형
   │  ├─ 선택된 사진 수
   │  ├─ 보정 옵션 (기본 or 긴급)
   │  └─ 가격 정보 (기본가, 옵션, 세금, 총액)
   └─ 로딩 중 UI (Spinner)

2. 사진 복제 상태 표시
   ├─ Real-time Listener: Order.copyStatus
   │  ├─ "PENDING": "복제 대기 중..."
   │  ├─ "IN_PROGRESS": "복제 중... (75%)" + 프로그레스 바
   │  ├─ "COMPLETED": "✅ 복제 완료"
   │  └─ "FAILED": "❌ 복제 실패 (재시도 필요)"
   ├─ 각 사진 상태도 표시 (선택사항)
   └─ UI 자동 갱신

3. 타임아웃 경고
   ├─ Order 생성 후 1시간 제한
   ├─ "결제는 1시간 이내에 완료해주세요"
   ├─ 남은 시간 표시 (카운트다운)
   │  ├─ 59:45 → 59:44 → ... (매초 업데이트)
   ├─ 30분 경과: 주황 경고색
   ├─ 50분 경과: 빨강 위험색
   └─ 60분 경과: "주문 만료 (주문 재생성 필요)"

4. 세마포어 상태 감시 (백그라운드)
   ├─ Photo.lockExpiry 확인
   ├─ 30분 후 Lock 해제 자동 갱신 (5분마다)
   │  ├─ Photo.lockExpiry = now + 30분
   │  └─ Firestore 배치 업데이트
   ├─ Lock 해제되면 경고:
   │  └─ "결제가 지연되고 있습니다. 빠르게 진행해주세요."
   └─ 사용자 이탈 1분 → Lock 자동 해제 (배치 Job)

5. 버튼
   ├─ "결제하기" 버튼
   │  ├─ 복제 완료 전: 비활성화 (disabled)
   │  ├─ 복제 완료 후: 활성화
   │  ├─ 클릭 → PaymentPage로 이동 (orderId 전달)
   │  └─ 한 번만 클릭 가능 (중복 방지)
   ├─ "주문 수정" 버튼 (미구현)
   │  └─ 복제 전에만 가능
   └─ "주문 취소" 버튼 (미구현)
      ├─ 복제 중이면 "복제 취소" 확인
      ├─ 복제본 삭제
      ├─ 세마포어 해제
      └─ Order.status = "CANCELLED"
```

**구멍 분석:**
```
❌ 구멍 1: Real-time 업데이트 구현
   ├─ Firestore Listener 필요 (onSnapshot)
   ├─ UI가 상태 변경에 자동 반응
   ├─ 언마운트 시 리스너 정리 필수
   └─ 성능 고려 (너무 많은 업데이트 X)

❌ 구멍 2: 타임아웃 구현
   ├─ 카운트다운 로직 복잡
   ├─ setInterval vs requestAnimationFrame
   ├─ 페이지 이탈 후 돌아올 때 시간 동기화
   ├─ 서버 시간과 클라이언트 시간 차이
   └─ 정확한 타이밍이 중요 (1시간 정확히)

❌ 구멍 3: 세마포어 갱신 로직
   ├─ 5분마다 자동으로 Lock Duration 연장
   ├─ OrderDetailsPage에 머무르는 동안만
   ├─ 페이지 떠났을 때 갱신 중단
   ├─ 네트워크 요청 최적화 (배치)
   └─ 과도한 Firestore 쓰기 방지

❌ 구멍 4: 복제 실패 시나리오
   ├─ "복제 실패" → "재시도" 버튼?
   ├─ 자동 재시도? 수동 재시도?
   ├─ 재시도 횟수 제한?
   └─ 최대 재시도 후 "주문 재생성 필요"

❌ 구멍 5: 주문 정보 변경 불가
   ├─ 복제 시작 후 주문 정보 수정 방지
   ├─ "주문 수정" 버튼 비활성화 (복제 진행 중)
   ├─ 사진 개수 등이 바뀌면?
   └─ 일관성 유지 (Phase 3에서 개선)
```

---

## 3. 구멍 요약 및 우선순위

### Critical (반드시 해결)

```
🔴 1. PhotoManagementPage 구현
   └─ 사진 관리가 없으면 주문 생성 불가
   └─ 7가지 상태 머신 UI 구현 필수
   └─ Firestore Photo 컬렉션 구조 정의

🔴 2. CreateNewOrderPage 데이터 연동
   └─ 사진 선택 → 주문 정보 → 가격 계산 전체 흐름
   └─ Firestore Order 문서 생성
   └─ 상태 전달 메커니즘

🔴 3. OrderDetailsPage 기능 구현
   └─ 복제 상태 Real-time 업데이트
   └─ 타임아웃 카운트다운
   └─ 세마포어 갱신 로직

🔴 4. 사진 복제 프로세스
   └─ Cloud Function 또는 프론트 폴링
   └─ Semaphore Lock 관리
   └─ 복제 실패 처리
```

### High (높은 우선순위)

```
🟠 1. Firestore 스키마 최종 확정
   ├─ Photo 컬렉션 (7가지 상태 필드)
   ├─ Order 컬렉션 (복제 상태, 가격 정보)
   ├─ Folder 컬렉션 (새로 필요)
   └─ 인덱스 설정

🟠 2. 에러 처리 및 복구
   ├─ 업로드 실패 → 재시도 (최대 3회)
   ├─ 처리 실패 → 재시도 (최대 2회)
   ├─ 복제 실패 → 고아 정리 (Cron Job)
   └─ 타임아웃 처리 (자동 정리)

🟠 3. 성능 최적화
   ├─ 썸네일 로딩 성능
   ├─ 무한 스크롤 vs 페이지네이션
   ├─ Firestore 쿼리 최적화
   └─ 네트워크 요청 최소화
```

### Medium (중간 우선순위)

```
🟡 1. UX 개선
   ├─ 로딩 상태 시각화
   ├─ 에러 메시지 명확화
   ├─ 재시도 UI
   └─ 모바일 반응형

🟡 2. 모니터링 & 로깅
   ├─ Analytics 이벤트 추적
   ├─ 에러 로깅 (Sentry)
   ├─ 성능 모니터링
   └─ 사용자 행동 분석
```

---

## 4. 플로우별 데이터 흐름

### Step 1: LoginPage → PhotoManagementPage

```
LoginPage
  └─ 로그인 성공
     └─ AuthContext.currentUser 설정
        └─ ProtectedRoute 통과
           └─ PhotoManagementPage 진입
              └─ Firestore: Folder 조회
                 └─ userId = currentUser.uid 필터링
                    └─ 폴더 목록 표시
```

### Step 2: PhotoManagementPage → CreateNewOrderPage

```
PhotoManagementPage
  └─ 사진 선택 (체크박스)
     └─ "다음: 주문 생성" 버튼
        └─ 선택된 photoIds[] 준비
           └─ React Router 네비게이션
              └─ CreateNewOrderPage
                 └─ photoIds[] 받기 (URL state 또는 Context)
                    └─ 각 사진 정보 표시 (Firestore Photo 조회)
                       └─ 가격 계산 (사진 수 × 단가)
```

### Step 3: CreateNewOrderPage → OrderDetailsPage

```
CreateNewOrderPage
  └─ "다음: 견적서 확인" 버튼
     └─ Order 문서 생성
        ├─ Order.status = "PENDING"
        ├─ Order.copyStatus = "PENDING"
        ├─ Order.photoIds = [...] (사진들)
        ├─ Order.correctionOption = "basic" or "urgent"
        └─ Firestore 저장
           └─ OrderDetailsPage로 네비게이션 (orderId 전달)
              └─ Order 정보 로드 (Real-time)
                 └─ 복제 시작 (별도 프로세스)
```

### Step 4: 사진 복제 (백그라운드)

```
OrderDetailsPage 진입 → 복제 시작
  └─ 전체 주문에 대해:
     ├─ Photo 7개 중 첫 개 처리
     ├─ Photo.status = "COPYING_TO_ORDER" (Lock)
     ├─ Photo.lockedByOrder = orderId
     ├─ Photo.lockExpiry = now + 30분
     ├─ S3: user-uploads/photo_001.jpg → order-storage/{orderId}/0_photo_001.jpg
     ├─ 복제 완료 후 Photo.status = "READONLY"
     └─ (동시에 다른 사진들도 병렬 처리)
        └─ 모든 복제 완료 후
           └─ Order.copyStatus = "COMPLETED"
              └─ UI 자동 갱신 (Real-time Listener)
                 └─ "✅ 복제 완료" 표시
```

### Step 5: OrderDetailsPage → PaymentPage

```
OrderDetailsPage
  └─ 복제 완료 + 타임아웃 미도래
     └─ "결제하기" 버튼 활성화
        └─ 클릭
           └─ PaymentPage로 네비게이션 (orderId, 가격 정보 전달)
              └─ 결제 게이트웨이 진입
```

---

## 5. 최종 검증 체크리스트

### 데이터 일관성

```
[ ] Order.photoIds와 실제 Photo 문서 일치
    └─ 사진 선택 후 삭제된 경우?
    └─ 사진 복제 중 원본 삭제된 경우?
    
[ ] Photo.status와 실제 파일 상태 일치
    └─ S3 파일은 없는데 status = READY?
    └─ 파일은 있는데 status = UPLOAD_FAILED?
    
[ ] Order.copyStatus와 Photo.status 일치
    └─ 일부만 복제되었는데 copyStatus = COMPLETED?
    └─ 모두 복제되었는데 copyStatus = IN_PROGRESS?
    
[ ] 세마포어 상태 추적
    └─ Photo.lockExpiry 만료되었는데 여전히 COPYING_TO_ORDER?
    └─ 다른 Order로 이미 Lock 중인 Photo 선택?
```

### 타이밍 이슈

```
[ ] 1시간 제한 (Order 생성 후 1시간 내 결제)
    ├─ 시작: Order.createdAt
    ├─ 만료: Order.createdAt + 3600초
    ├─ 근데 복제에 25초 걸림 → 남은 시간: 35분
    └─ 사용자가 주문 확인하는 데 5분 → 30분 여유
    
[ ] 30분 세마포어 (Photo Lock Duration)
    ├─ 시작: Photo.lockedAt
    ├─ 만료: Photo.lockedAt + 1800초 (30분)
    ├─ 근데 OrderDetailsPage에서 5분마다 갱신
    └─ 이론상 무한 연장 가능 (단, 페이지 유지 필수)
    
[ ] 복제 대기 시간 (15-25초)
    ├─ 사진 7개 @ 10MB = 70MB
    ├─ Worker 10개 병렬 처리
    ├─ 예상 시간: 약 20초
    └─ OrderDetailsPage 진입 후 20초 동안 복제 진행중 표시
```

### 에러 시나리오

```
[ ] 사진 선택 후 업로드 상태에서 주문 생성?
    └─ UPLOADING 상태 사진은 CreateNewOrder에서 제외?
    
[ ] 주문 생성 후 사진 삭제?
    └─ Order.photoIds에는 남아있지만 Photo 문서 없음
    └─ 복제 시작하면 에러 → 자동 정리 필요
    
[ ] 복제 진행 중 결제 페이지로 강제 진입?
    └─ 복제 완료 확인 후에만 진입 가능
    └─ 미완료면 OrderDetailsPage로 리다이렉트
    
[ ] 1시간 초과 후 결제 시도?
    └─ Order 자동 취소 또는 재생성 유도
    └─ 세마포어 자동 해제
```

---

## 6. 구현 우선순위 및 일정

### Phase 2-1 (1-2주) - 핵심 플로우

```
Week 1:
Day 1-2: Firestore 스키마 정의 (Photo, Order, Folder)
Day 3-4: PhotoManagementPage UI + 상태 머신
Day 5: CreateNewOrderPage 데이터 연동

Week 2:
Day 1-2: OrderDetailsPage 기능 (Real-time, 타임아웃, Lock)
Day 3-4: 사진 복제 프로세스 (Cloud Function 또는 프론트)
Day 5: E2E 테스트 (전체 플로우)

예상 소요: 8-10일
```

### Phase 2-2 (1주) - 에러 처리 및 최적화

```
Day 1-2: 재시도 로직 (최대 3회/2회)
Day 3-4: 자동 정리 (Cron Job)
Day 5: 성능 최적화 + 모니터링

예상 소요: 5-7일
```

---

## 최종 결론

### 큰 구멍 3개

```
🔴 1. PhotoManagementPage 미구현
   └─ Phase 2의 가장 핵심
   └─ 사진 관리 없으면 주문 불가능
   └─ 7가지 상태 머신 UI 필수

🔴 2. CreateNewOrderPage 데이터 연동 미흡
   └─ 사진 선택 상태 전달 불명확
   └─ 가격 계산 로직 미정의
   └─ Order 문서 생성 시기 결정 필요

🔴 3. OrderDetailsPage 실시간 기능 미구현
   └─ Real-time 업데이트 필수
   └─ 타임아웃 카운트다운 복잡
   └─ 세마포어 갱신 로직 필요
```

### 중간 구멍 3개

```
🟠 1. 복제 프로세스 구현 방식 미정
   └─ Cloud Function vs 프론트 폴링?
   └─ 배포, 모니터링, 에러 처리 다름

🟠 2. 에러 복구 전략 미흡
   └─ 재시도 횟수/전략 미정
   └─ 고아 정리 Cron Job 필요
   └─ 타임아웃 자동 정리

🟠 3. 타이밍 이슈 (1시간, 30분, 20초)
   └─ 정확한 시간 관리 필수
   └─ 클라이언트-서버 시간 동기화
```

### 작은 구멍 (구현 중 해결)

```
🟡 1. 모바일 반응형
🟡 2. 성능 최적화
🟡 3. UX 개선
🟡 4. 모니터링 & 로깅
```

### 타이밍 이슈 해결 ✅

```
기존: 복제를 OrderDetailsPage 진입 시 프론트에서 처리
  └─ 타이밍 부정확 (브라우저 성능 의존)
  └─ 타임아웃 관리 복잡

개선: Cloud Function 트리거로 즉시 복제
  └─ Order 문서 생성 → Pub/Sub 이벤트 발생
  └─ Cloud Function이 즉시 복제 시작
  └─ OrderDetailsPage는 Real-time Listener로만 상태 표시
  └─ 타이밍 정확 (서버 기준)
  └─ 타임아웃 계산 간단 (Order.createdAt + 3600초)
  
결과: 복제 중에도 OrderDetailsPage는 자유로움
     복제 실패해도 재시도는 Cloud Function이 담당
     프론트는 상태만 표시하면 됨 ✅
```

---

## 7. 최종 구현 계획 (수정됨)

### Phase 2-1: 사진 관리 & 주문 생성 (1주)

```
Day 1-2: Firestore 스키마 정의
  ├─ Photo (7가지 상태, Semaphore 필드)
  ├─ Order (복제 상태, 가격 정보)
  └─ Folder (사용자별 폴더)

Day 3-4: PhotoManagementPage 구현
  ├─ Dropbox 스타일 UI
  ├─ 7가지 상태 머신 + 뱃지 아이콘
  ├─ Firestore Real-time Listener
  └─ 업로드 & 재시도 로직

Day 5-6: CreateNewOrderPage + OrderDetailsPage
  ├─ 주문 생성 플로우
  ├─ 가격 계산
  ├─ Real-time 상태 표시
  └─ 1시간 타임아웃 카운트다운
```

### Phase 2-2: 사진 복제 프로세스 (3-4일)

```
Day 1-2: Cloud Function: photoCopyOnOrder
  ├─ Pub/Sub 트리거 (Order 생성 이벤트)
  ├─ Worker Pool 병렬 복제 (15-25초)
  ├─ 지수 백오프로 최대 2-3회 재시도 ✅
  └─ Photo.status 업데이트 (COPYING_TO_ORDER → READONLY)

Day 3: OrderDetailsPage + PaymentPage 연동
  ├─ Real-time 복제 상태 표시
  ├─ 진입 조건 검증
  └─ 결제 버튼 활성화

예상: 3-4일 (아키텍처 설계 완료 상태)
```

### Phase 2-3: 에러 정리 & 모니터링 (향후)

```
🔵 TODO: Admin Dashboard 구현 (Phase 3 이후)
├─ 고아 파일 모니터링 화면
├─ 수동 정리 버튼 (선택 삭제)
├─ 자동 정리 예약 (일주일 후)
└─ 정리 로그 기록

🟢 TODO: Cloud Scheduler - 자동 정리 (Phase 4+)
├─ UPLOAD_FAILED: 7일 후 자동 삭제
├─ PROCESSING_FAILED: 14일 후 자동 삭제
└─ Orphan Order: 1시간 후 자동 취소

현재: 수동 모니터링만 운영 (Admin이 필요시 처리)
```

---

## 8. 수정된 구멍 요약

### 해결됨 ✅

```
✅ 타이밍 이슈 (Cloud Function 트리거로 해결)
   ├─ 1시간 제한: Order.createdAt + 3600초 (정확)
   ├─ 30분 Lock: Photo.lockExpiry 관리 (서버 기준)
   ├─ 복제 20초: Cloud Function 비동기 처리 (정확한 타이밍)
   └─ OrderDetailsPage는 상태만 표시 (간단함)

✅ 복제 실패 처리 (지수 백오프 + 최대 2-3회)
   ├─ 1회 실패: 1초 후 재시도
   ├─ 2회 실패: 2초 후 재시도
   ├─ 3회 실패: 오류 기록 (Admin 수동 처리)
   └─ 자동 정리는 향후 (Admin Dashboard 준비 후)
```

### 잔여 구멍 (구현 중 해결)

```
🟠 1. PhotoManagementPage UI/로직
   └─ 7가지 상태 머신, Dropbox 스타일

🟠 2. CreateNewOrderPage 가격 계산
   └─ PriceTable 정의 필요

🟠 3. OrderDetailsPage Real-time 업데이트
   └─ Firestore Listener 구현

🟠 4. 세마포어 관리
   └─ 5분마다 Lock Duration 갱신 (프론트)

🔵 5. Admin Dashboard (향후 TODO)
   └─ 고아 파일 모니터링 + 수동 정리
```

---

## 다음 액션 (수정됨)

```
1️⃣ Firestore 스키마 최종 확정
   └─ Photo, Order, Folder 구조

2️⃣ PhotoManagementPage 구현
   └─ 7가지 상태 머신 UI (1-2일)

3️⃣ CreateNewOrderPage + OrderDetailsPage
   └─ 플로우 구현 (2-3일)

4️⃣ Cloud Function: photoCopyOnOrder
   └─ Pub/Sub 트리거, 병렬 복제, 재시도 (2-3일)

5️⃣ PaymentPage 연동
   └─ 진입 조건 검증 (1일)

6️⃣ E2E 테스트
   └─ 모든 시나리오 (1-2일)

📌 7️⃣ Admin Dashboard (Phase 3 이후 계획)
   └─ 고아 정리 수동+자동 모니터링
```
