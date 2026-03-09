# Phase 2: 주문 관리 - 프로세스 플로우 및 데이터 검증 문서

## 1. 전체 사용자 여정 (User Journey)

```
┌─────────────────────────────────────────────────────────────────┐
│                    사용자 로그인 (Phase 1 완료)                    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │   OrderListPage              │
        │  (주문 목록 대시보드)          │
        │                               │
        │ • 주문 목록 조회              │
        │ • 상태별/기간별 필터링        │
        │ • 검색                        │
        │ • 페이지네이션               │
        └──────────────┬───────────────┘
                       │
        ┌──────────────┴────────────────────┐
        │                                   │
┌───────▼─────────────┐      ┌──────────────▼──────────────┐
│ CreateNewOrderPage  │      │  OrderDetailsPage          │
│ (새 주문 생성)      │      │ (주문 상세 조회)           │
│                     │      │                             │
│ • 주문 정보 입력    │      │ • 주문 정보 표시           │
│ • 가격 계산         │      │ • 타임라인 표시            │
│ • 주문 생성         │      │ • 수정 버튼                │
│ • Firestore 저장    │      │ • 삭제 버튼                │
│ • 결제 페이지 이동  │      │ • 결제 페이지 이동         │
└───────┬─────────────┘      └──────────────┬──────────────┘
        │                                   │
        └──────────────┬────────────────────┘
                       │
        ┌──────────────▼──────────────────┐
        │     PaymentPage                 │
        │    (결제 처리)                   │
        │                                 │
        │ • 주문 정보 표시              │
        │ • 결제 방법 선택              │
        │ • 결제 정보 입력              │
        │ • 결제 처리                   │
        │ • 성공/실패 처리              │
        │ • 주문 상태 업데이트          │
        └──────────────┬─────────────────┘
                       │
        ┌──────────────▼──────────────────┐
        │   다음 프로세스 시작             │
        │  (사진 업로드 / Phase 3)        │
        └─────────────────────────────────┘
```

---

## 2. 화면별 상세 플로우

### 2.1 OrderListPage 플로우

```
[진입]
  ↓
[Firestore에서 주문 목록 조회]
  ├─ 기본: 최신순 정렬
  ├─ 페이지 크기: 10개
  ├─ userId로 필터링 (현재 사용자의 주문만)
  ↓
[주문 목록 렌더링]
  ├─ orders 배열
  ├─ stats 계산 (대기중/진행중/완료 합계)
  ↓
[필터/검색 상호작용]
  ├─ 상태 필터 (전체/대기/진행중/완료)
  │  └─ status 필드로 필터링
  ├─ 기간 필터 (전체/7일/30일/90일)
  │  └─ createdAt 기반 날짜 필터링
  ├─ 검색 (주문명/프로젝트ID)
  │  └─ name, projectId 필드 검색
  ├─ 페이지네이션 (1-13페이지)
  │  └─ offset/limit 적용
  ↓
[행 클릭]
  ├─ 눈 아이콘 → OrderDetailsPage로 이동
  │  (orderId 파라미터 전달)
  ├─ 더보기 아이콘 → 컨텍스트 메뉴
  │  ├─ 수정 → CreateNewOrderPage (orderId 전달, 수정 모드)
  │  └─ 삭제 → 삭제 확인 → 삭제 처리
  ↓
[새 주문 생성 버튼]
  └─ CreateNewOrderPage로 이동 (신규 모드)
```

**데이터 구조:**
```javascript
orders: [
  {
    id: "order_001",              // Firestore doc ID
    userId: "user_123",           // 현재 사용자
    name: "김민수 & 박지영 웨딩",  // 주문명
    projectId: "#2025-0122",      // 프로젝트ID
    status: "in-progress",        // waiting | in-progress | completed
    statusLabel: "진행중",
    statusIcon: "fa-spinner",
    photos: 150,
    progress: 85,
    createdAt: Timestamp,         // 필터링 용
    date: "2025-01-20",           // 촬영 날짜
    paymentStatus: "completed",   // waiting | completed
    amount: 450000,               // 숫자로 저장 (표시 시 포맷)
    description: "요청사항...",    // 특별 요청사항
  }
]

stats: [
  { label: '대기중', count: 8, photos: '340장', icon: 'fa-clock' },
  { label: '진행중', count: 12, photos: '580장', icon: 'fa-spinner' },
  { label: '완료', count: 45, photos: '2,150장', icon: 'fa-check-circle' },
]
```

---

### 2.2 CreateNewOrderPage 플로우

```
[진입]
  ├─ 신규 모드: 빈 폼
  └─ 수정 모드: 기존 데이터 로드 (orderId 파라미터)
  ↓
[폼 작성]
  ├─ 신부명 & 신랑명 (필수)
  ├─ 웨딩 종류 (필수)
  │  └─ options: 본식/스튜디오/스드메/야외/셀프
  ├─ 촬영 날짜 (필수)
  ├─ 예상 사진 수 (필수, 숫자)
  ├─ 특별 요청사항 (선택)
  ├─ 기본 가격 (필수, 숫자)
  ├─ 추가 비용 (선택, 기본값 0)
  ↓
[실시간 계산]
  ├─ 총액 = (기본 가격 × 사진 수) + 추가 비용
  ├─ 우측 요약 패널 실시간 업데이트
  ↓
[유효성 검사]
  ├─ 필수 필드 확인
  ├─ 숫자 필드 타입 확인
  ├─ 날짜 유효성 확인
  ↓
[주문 생성/수정]
  ├─ 신규: Firestore에 새 문서 생성
  │  └─ auto-generated ID
  ├─ 수정: 기존 문서 업데이트
  ├─ Firebase Auth에서 현재 userId 획득
  ├─ createdAt/updatedAt 타임스탬프 기록
  ↓
[결과 처리]
  ├─ 성공: 토스트 메시지 + 결제 페이지로 이동
  │  └─ PaymentPage로 이동 (orderId 전달)
  ├─ 실패: 에러 메시지 표시
  └─ 취소: OrderListPage로 돌아가기
```

**폼 데이터 구조:**
```javascript
formData: {
  brideName: "김민수",           // 신랑명
  groomName: "박지영",           // 신부명
  weddingType: "본식",            // 웨딩 종류
  shootingDate: "2025-01-20",    // 촬영 날짜
  estimatedPhotos: 150,          // 예상 사진 수
  remarks: "요청사항...",         // 특별 요청사항
  basePrice: 2000,               // 장당 기본 가격
  additionalCost: 150000,        // 추가 비용
  // 계산 필드 (DB에 저장 X)
  totalPrice: 450000,            // = (2000 * 150) + 150000
}
```

**검증:**
```javascript
✓ 신부/신랑명: 1글자 이상
✓ 웨딩 종류: 필수 선택
✓ 촬영 날짜: 과거 또는 미래 가능
✓ 사진 수: 1 이상 1000 이하
✓ 기본 가격: 0 이상
✓ 추가 비용: 0 이상
```

---

### 2.3 OrderDetailsPage 플로우

```
[진입]
  ├─ orderId 파라미터 받음
  ├─ Firestore에서 해당 주문 조회
  ↓
[데이터 렌더링]
  ├─ 주문 기본 정보
  │  ├─ 주문명
  │  ├─ 주문번호
  ├─ 상태 카드 (3개)
  │  ├─ 주문 상태
  │  ├─ 결제 상태
  │  └─ 총 사진 수
  ├─ 주문 정보 (좌측)
  │  ├─ 웨딩 유형
  │  ├─ 촬영 날짜
  │  ├─ 생성일
  │  └─ 보정 진행률
  ├─ 결제 정보 (우측)
  │  ├─ 기본 요금
  │  ├─ 추가 요금
  │  └─ 총액
  ├─ 타임라인 (하단)
  │  ├─ 주문 생성
  │  ├─ 사진 업로드 시작/완료
  │  ├─ AI 보정 진행중
  │  └─ 보정 완료 대기
  ↓
[버튼 상호작용]
  ├─ 뒤로가기 → OrderListPage
  ├─ 수정 버튼 → CreateNewOrderPage (orderId 전달)
  ├─ 삭제 버튼 → 삭제 확인 팝업
  │  └─ 확인 → Firestore에서 삭제
  ├─ 결제 버튼 (결제 미완료 시)
  │  └─ PaymentPage로 이동
  └─ 다음 단계 버튼 (결제 완료 후 사진 업로드 페이지로)
```

**데이터 구조:**
```javascript
order: {
  id: "order_001",
  userId: "user_123",
  name: "김민수 & 박지영 웨딩",
  projectId: "#2025-0122",
  status: "in-progress",
  statusLabel: "진행중",
  photos: 150,
  progress: 85,
  createdAt: Timestamp,
  date: "2025-01-20",
  paymentStatus: "completed",
  amount: 450000,
  basePrice: 300000,
  additionalCost: 150000,
  weddingType: "본식 촬영",
  remarks: "요청사항...",
  timeline: [
    { date: '2025-01-18 14:30', event: '주문 생성', status: 'completed' },
    { date: '2025-01-19 09:15', event: '사진 업로드 시작', status: 'completed' },
    // ...
  ]
}
```

---

### 2.4 PaymentPage 플로우

```
[진입]
  ├─ orderId 파라미터 받음
  ├─ Firestore에서 해당 주문 조회
  ↓
[데이터 표시]
  ├─ 주문 정보
  │  ├─ 주문명
  │  ├─ 주문번호
  │  └─ 촬영 날짜
  ├─ 결제 요약
  │  ├─ 기본 요금
  │  ├─ 추가 요금
  │  └─ 총액
  ↓
[결제 방법 선택]
  ├─ 신용카드 (기본)
  ├─ 계좌이체
  └─ 휴대폰 결제
  ↓
[결제 정보 입력]
  ├─ 신용카드 선택 시:
  │  ├─ 카드번호 (필수)
  │  ├─ 유효기간 (필수)
  │  ├─ CVC (필수)
  │  └─ 카드주인명 (필수)
  ├─ 결제 약관 동의 (필수)
  ↓
[결제 처리]
  ├─ 결제 게이트웨이 호출
  │  └─ 데모: 더미 구현체로 항상 성공
  ├─ 결과 처리
  │  ├─ 성공: Firestore에서 paymentStatus = "completed" 업데이트
  │  └─ 실패: 에러 메시지 표시
  ↓
[다음 단계]
  ├─ 성공 시: PhotoManagementPage 또는 UploadPage로 이동
  └─ 실패 시: 재시도 또는 취소
```

**결제 데이터 구조:**
```javascript
payment: {
  orderId: "order_001",
  userId: "user_123",
  amount: 450000,
  method: "card",                // card | bank | mobile
  methodLabel: "신용카드",
  
  // 카드 정보 (결제 게이트웨이로 전송, DB 저장 X)
  cardNumber: "****",            // 마스킹 처리
  expiryDate: "02/26",
  cvc: "***",                    // 마스킹 처리
  cardholderName: "김민수",
  
  // 결과 저장
  status: "pending",             // pending | completed | failed
  transactionId: "txn_12345",    // 거래 고유 ID
  processedAt: Timestamp,
  errorMessage: null,            // 실패 시
}
```

---

## 3. 데이터 일:다 관계 및 검증

### 3.1 User : Order (1 : N)

```
┌────────────┐          ┌────────────┐
│   Users    │          │   Orders   │
├────────────┤          ├────────────┤
│ userId (PK)├───────→  │ orderId (PK)
│ email      │  1       │ userId (FK)
│ displayName│          │ folderId (FK)
│ createdAt  │    N     │ photoIds   │
└────────────┘          │ status     │
                        │ payments[] │
                        │ createdAt  │
                        └────────────┘

검증:
✓ 모든 Order는 반드시 userId를 가져야 함
✓ OrderListPage: userId로 필터링해서 자신의 주문만 표시
✓ OrderDetailsPage: 현재 사용자만 상세 조회 가능
✓ 모든 Order 수정/삭제 시 userId 검증 필수
```

### 3.2 Folder : Photo (1 : N)

```
┌────────────┐          ┌────────────┐
│  Folders   │          │   Photos   │
├────────────┤          ├────────────┤
│ folderId (PK)├───────→│ photoId (PK)
│ userId (FK)│  1       │ folderId (FK)
│ name       │          │ userId (FK)
│ createdAt  │    N     │ fileUrl    │
└────────────┘          │ status     │
                        │ usedInOrders│
                        │ uploadedAt │
                        └────────────┘

검증:
✓ 모든 Photo는 반드시 folderId를 가져야 함
✓ 모든 Photo는 반드시 userId를 가져야 함
✓ Photo.status: "active" | "readonly" | "viewonly" | "archived"
✓ Photo.readonly: 사용자가 삭제/수정 불가
```

### 3.3 Order : Photo (N : M 참조)

```
┌────────────┐          ┌────────────┐
│   Orders   │          │   Photos   │
├────────────┤          ├────────────┤
│ orderId (PK)├─ N : M ─→│ photoId (PK)
│ photoIds   │(참조)      │ usedInOrders│
│ status     │          │ status     │
└────────────┘          └────────────┘

특징:
✓ 참조만 저장 (복사하지 않음)
✓ Order 생성 시 Photo.status = "readonly"로 변경
✓ Photo.usedInOrders에 orderId 추가
✓ 같은 사진으로 여러 Order 생성 가능

검증:
✓ Order 취소 시 해당 Photos를 다시 "active"로 변경
✓ Photo 상태를 readonly로 변경할 때 UI에 🔒 표시
```

### 3.4 Order : Payment (1 : N) - ⭐ 새로운 구조

```
┌────────────┐          ┌────────────┐
│   Orders   │          │  Payments  │
├────────────┤          ├────────────┤
│ orderId (PK)├───────→ │ paymentId (PK)
│ userId (FK)│  1       │ orderId (FK)
│ payments[] │          │ userId (FK)
│ totalPaid  │    N     │ type       │
│ totalDue   │          │ amount     │
│ status     │          │ status     │
└────────────┘          │ transactionId
                        │ createdAt  │
                        └────────────┘

Order 생성 시:
✓ payments[0]: base (기본 보정)
✓ status = "waiting"
✓ totalDue = basePrice × photos

추가 옵션 선택 시:
✓ payments[1], payments[2], ... 추가됨
✓ status = "in-progress" (부분 결제)
✓ totalDue 업데이트

전체 결제 완료 시:
✓ status = "completed"
✓ totalDue = 0

검증:
✓ Order.totalPaid = sum(payments[i].amount where status='completed')
✓ Order.totalDue = sum(payments[i].amount) - totalPaid
✓ 각 Payment는 독립적으로 성공/실패 가능
```

### 3.3 Order : Timeline (1 : N)

```
┌────────────┐          ┌─────────────────┐
│   Orders   │          │   Timeline      │
├────────────┤          ├─────────────────┤
│ orderId (PK)├───────→ │ timelineId (PK) │
│            │  1       │ orderId (FK)    │
│            │    N     │ date            │
│            │          │ event           │
│            │          │ status          │
└────────────┘          └─────────────────┘

자동 생성 타임라인:
1. 주문 생성 → 즉시
2. 사진 업로드 시작 → 사진 업로드 페이지 진입
3. 사진 업로드 완료 → 모든 사진 업로드 완료
4. AI 보정 진행중 → 다음 단계 버튼 클릭
5. 보정 완료 → 예정일 후 자동
```

---

## 4. 화면 간 네비게이션 및 파라미터 검증

### 4.1 라우팅 맵

```
OrderListPage (/order-list)
  ├─ "새 주문 생성" 버튼
  │  └─ → CreateNewOrderPage (/create-new-order, 신규 모드)
  ├─ "눈" 아이콘 (행 클릭)
  │  └─ → OrderDetailsPage (/order-details?id=order_001)
  └─ "더보기" → 수정
     └─ → CreateNewOrderPage (/create-new-order?id=order_001, 수정 모드)

CreateNewOrderPage (/create-new-order)
  ├─ "주문 생성" 버튼 (성공)
  │  └─ → PaymentPage (/payment?id=order_001)
  ├─ "취소" 버튼
  │  └─ → OrderListPage (/order-list)
  └─ 에러 시: 페이지 유지

OrderDetailsPage (/order-details?id=order_001)
  ├─ "뒤로" 버튼
  │  └─ → OrderListPage (/order-list)
  ├─ "결제" 버튼 (paymentStatus != 'completed')
  │  └─ → PaymentPage (/payment?id=order_001)
  └─ "수정" 버튼
     └─ → CreateNewOrderPage (/create-new-order?id=order_001)

PaymentPage (/payment?id=order_001)
  ├─ "결제" 버튼 (성공)
  │  └─ → 토스트 메시지 + OrderListPage (/order-list)
  ├─ "취소" 버튼
  │  └─ → OrderDetailsPage (/order-details?id=order_001)
  └─ 에러 시: 페이지 유지
```

### 4.2 파라미터 검증

```
orderId 파라미터:
✓ 형식: "order_XXXXX" (Firestore 자동 생성 ID)
✓ 필수 전달 페이지: OrderDetailsPage, PaymentPage, CreateNewOrderPage (수정 모드)
✓ 검증: orderId로 Firestore 조회 후 없으면 에러 페이지
✓ 권한 검증: 조회한 order.userId === 현재 사용자 userId

mode 파라미터 (CreateNewOrderPage):
✓ "create" (기본) | "edit"
✓ create 모드: orderId 없음
✓ edit 모드: orderId 필수
```

---

## 5. 필수 검증 시나리오

### 5.1 CreateNewOrderPage - 주문 생성

```
시나리오 1: 정상 주문 생성
1. 모든 필드 정상 입력
2. "주문 생성" 클릭
3. 유효성 검사 통과
4. Firestore에 저장 성공
5. 결과: PaymentPage로 이동, 주문 ID 전달

시나리오 2: 필드 누락
1. 필수 필드 하나 이상 비워둠
2. "주문 생성" 클릭
3. 유효성 검사 실패
4. 결과: 에러 메시지 표시, 페이지 유지

시나리오 3: 잘못된 데이터 타입
1. 사진 수에 "abc" 입력
2. "주문 생성" 클릭
3. 유효성 검사 실패
4. 결과: 에러 메시지 표시

시나리오 4: Firebase 저장 실패
1. 모든 필드 정상 입력
2. Firebase 연결 오류 발생
3. 결과: 에러 메시지 표시, 재시도 버튼 제공

시나리오 5: 기존 주문 수정
1. orderId 파라미터로 진입 (edit 모드)
2. 기존 데이터 미리 로드
3. 일부 필드 수정
4. "주문 수정" 클릭
5. Firestore에 업데이트
6. 결과: OrderDetailsPage로 이동 또는 토스트 메시지
```

### 5.2 OrderListPage - 필터링 및 검색

```
시나리오 1: 상태 필터
1. "전체 상태" → "진행중" 선택
2. 진행중인 주문만 필터링
3. stats 업데이트 (진행중 항목만)
4. 결과: 필터된 목록 표시

시나리오 2: 기간 필터
1. "전체 기간" → "최근 7일" 선택
2. createdAt이 7일 이내인 주문만
3. 결과: 필터된 목록 표시

시나리오 3: 검색
1. 검색창에 "김민수" 입력
2. name 필드에서 검색
3. 결과: 일치하는 주문만 표시

시나리오 4: 복합 필터
1. 상태 "진행중" + 기간 "최근 30일" + 검색 "웨딩"
2. 모든 조건을 AND로 적용
3. 결과: 조건 만족하는 주문만 표시

시나리오 5: 페이지네이션
1. 페이지 2 클릭
2. offset = 10, limit = 10으로 조회
3. 결과: 11-20번째 주문 표시
```

### 5.3 PaymentPage - 결제 처리

```
시나리오 1: 정상 결제
1. 결제 정보 입력 (신용카드)
2. 약관 동의 확인
3. "결제" 버튼 클릭
4. 더미 결제 게이트웨이 호출 (항상 성공)
5. Firestore: paymentStatus = "completed" 업데이트
6. 결과: 성공 토스트 메시지 + OrderListPage로 이동

시나리오 2: 결제 정보 불완전
1. 카드번호만 입력, 나머지 비움
2. "결제" 버튼 클릭
3. 유효성 검사 실패
4. 결과: 에러 메시지 표시

시나리오 3: 약관 미동의
1. 약관 동의 체크 해제
2. "결제" 버튼 클릭
3. 결과: "약관에 동의해주세요" 에러

시나리오 4: 결제 실패 (더미)
1. 특정 카드번호 입력 시 실패 유도 (나중 구현)
2. 결과: 에러 메시지 표시, 재시도 가능

시나리오 5: 취소
1. "취소" 버튼 클릭
2. 결과: OrderDetailsPage로 돌아가기
```

---

## 6. 누락되거나 확인이 필요한 부분

### 6.1 명확히 해야 할 부분

```
❓ 주문 상태 (status) 전이:
현재: waiting → in-progress → completed
보정 진행 시 자동으로 업데이트되나? 아니면 수동으로?

❓ 프로젝트 ID (projectId) 생성 규칙:
현재: "#2025-0122" (수동 입력?)
자동 생성 규칙이 있나?

❓ 타임라인 자동 업데이트:
누가 타임라인을 생성하나?
- 프론트: OrderDetailsPage에서 수동 생성?
- 백엔드: Cloud Functions에서 이벤트 기반 생성?

❓ 보정 진행률 (progress):
누가 업데이트하나?
- 백엔드에서 자동?
- 프론트에서 수동?

❓ 주문 삭제 시:
- 대기 상태만 삭제 가능? 아니면 모든 상태 삭제 가능?
- 연관된 타임라인/결제 정보도 삭제?
```

### 6.2 구현 제약사항

```
⚠️ 결제 게이트웨이:
더미 구현체 사용 (항상 성공)
실제 결제 연동은 Phase 3 이후?

⚠️ 실시간 업데이트:
현재 폴링 방식 (30초 주기)
WebSocket 필요한가?

⚠️ 동시성 문제:
여러 탭에서 같은 주문 수정하면?
마지막 저장이 우선되나?

⚠️ 오프라인 지원:
네트워크 끊김 시 어떻게?
```

---

## 7. 결론

### 7.1 구현 순서 (최적)

1. **데이터 모델 정의** (OrderSchema, PaymentSchema)
2. **OrderListPage** (조회/필터/검색/페이지네이션)
3. **CreateNewOrderPage** (생성/수정, 유효성 검사)
4. **OrderDetailsPage** (상세 조회, 수정/삭제)
5. **PaymentPage** (더미 결제 게이트웨이)

### 7.2 구현 제약사항

- ✅ 모든 페이지는 보호 라우트 내에서만 접근 가능
- ✅ userId 필터링으로 보안 보장
- ✅ 에러 처리 및 사용자 친화적 메시지
- ✅ 로딩 상태 표시 (Firestore 조회 중)

### 7.3 테스트 계획

- 각 화면별 단위 테스트 (유효성 검사)
- E2E 테스트 (전체 플로우)
- 엣지 케이스 테스트 (삭제, 네트워크 오류 등)
