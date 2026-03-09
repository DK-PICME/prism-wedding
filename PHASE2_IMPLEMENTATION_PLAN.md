# Phase 2 구현 계획 - 인터페이스 및 더미 구현체 완성

## ✅ 완료된 작업

### 1. 프로세스 플로우 검증 문서
- **PHASE2_PROCESS_VALIDATION.md** 생성
  - 전체 사용자 여정 (User Journey) 시각화
  - 화면별 상세 플로우 (4개 페이지)
  - 데이터 일:다 관계 검증
  - 화면 간 네비게이션 및 파라미터 검증
  - 필수 검증 시나리오 (25개+)
  - 누락되거나 확인이 필요한 부분 정리

**주요 발견사항:**
- Order : User = N : 1 (사용자별 주문 필터링 필수)
- Order : Payment = 1 : 1 (paymentStatus로 관리)
- Order : Timeline = 1 : N (자동 생성 규칙 필요)
- userId 기반 권한 검증 필수

---

### 2. PaymentService 인터페이스 정의
- **src/services/PaymentService.js** 생성
  - 8개 핵심 메서드 인터페이스 정의
  - 상세한 JSDoc 주석 (파라미터, 반환값, 예외 처리)
  - 결제 방법별 처리 규칙 (신용카드/계좌이체/휴대폰)
  - 웹훅 처리 인터페이스

**메서드 목록:**
```
1. processPayment()        - 결제 처리
2. getPaymentStatus()      - 결제 상태 조회
3. cancelPayment()         - 결제 취소 (환불)
4. validatePaymentMethod() - 유효성 검사
5. calculateFee()          - 수수료 계산
6. generateReceipt()       - 영수증 생성
7. handleWebhook()         - 웹훅 처리 (백엔드용)
```

---

### 3. PaymentServiceMock (더미 구현체)
- **src/services/PaymentServiceMock.js** 생성
  - 모든 메서드 더미 구현 완료
  - 항상 성공 시나리오 반환
  - 거래 ID 자동 생성 및 저장
  - 카드/계좌/휴대폰 검증 로직 포함
  - 2% 수수료 계산 규칙 적용

**특징:**
- 메모리 기반 거래 저장소 (Map)
- 자동 타임스탬프 생성
- 환불 거래 자동 처리
- 테스트용 헬퍼 메서드 제공

---

### 4. ProjectService 주문 관리 인터페이스 확장
- **src/services/ProjectService.js** 업데이트
  - 10개 주문 관리 메서드 인터페이스 추가
  - 필터링/검색 옵션 정의
  - 페이지네이션 규칙 정의
  - 권한 검증 규칙 명시

**메서드 목록:**
```
1. getOrders()        - 주문 목록 조회 (필터/검색/페이지네이션)
2. getOrder()         - 개별 주문 조회 (권한 검증)
3. createOrder()      - 새 주문 생성
4. updateOrder()      - 주문 수정
5. deleteOrder()      - 주문 삭제
6. updateOrderStatus() - 주문 상태 업데이트
7. updatePaymentStatus() - 결제 상태 업데이트
8. addTimelineItem()  - 타임라인 항목 추가
```

---

### 5. ProjectServiceMock 주문 관리 구현
- **src/services/ProjectServiceMock.js** 업데이트
  - 더미 주문 3개 데이터 사전 정의
  - 8개 주문 관리 메서드 더미 구현
  - 필터링 로직 (상태/기간/검색)
  - 페이지네이션 로직 (offset/limit)
  - 권한 검증 로직

**더미 데이터 예시:**
```javascript
order_001: 진행중 (85% 완료, 결제완료)
order_002: 대기 (0% 진행, 결제대기)
order_003: 완료 (100% 완료, 결제완료)
```

---

## 📊 구현 상태

| 컴포넌트 | 상태 | 설명 |
|---------|------|------|
| **설계 문서** | ✅ 완료 | PHASE2_PROCESS_VALIDATION.md |
| **PaymentService 인터페이스** | ✅ 완료 | 8개 메서드 정의 |
| **PaymentServiceMock** | ✅ 완료 | 모든 메서드 더미 구현 |
| **ProjectService 확장** | ✅ 완료 | 10개 메서드 인터페이스 |
| **ProjectServiceMock 확장** | ✅ 완료 | 모든 메서드 더미 구현 |

---

## 🚀 다음 단계 (실제 구현)

### Phase 2-1: OrderListPage 구현 (1.5시간)
1. Firebase에서 주문 목록 조회
2. 필터링 로직 (상태/기간)
3. 검색 기능
4. 페이지네이션
5. 통계 계산 (대기중/진행중/완료)
6. E2E 테스트

### Phase 2-2: CreateNewOrderPage 구현 (1.5시간)
1. 폼 상태 관리
2. 실시간 가격 계산
3. 유효성 검사
4. 신규/수정 모드 분기
5. Firebase 저장
6. 결제 페이지로 이동

### Phase 2-3: OrderDetailsPage 구현 (1시간)
1. 주문 상세 조회
2. 타임라인 표시
3. 수정/삭제 기능
4. 권한 검증

### Phase 2-4: PaymentPage 구현 (1.5시간)
1. 결제 정보 입력 폼
2. 결제 방법 선택 UI
3. PaymentServiceMock 호출
4. 결과 처리 (성공/실패)
5. Firestore 상태 업데이트

### Phase 2-5: 테스트 (1.5시간)
- 단위 테스트 (유효성 검사)
- E2E 테스트 (전체 플로우)
- 엣지 케이스 테스트

---

## 🔑 핵심 구현 규칙

### 1. 권한 검증
```javascript
// 모든 Order 조회/수정/삭제 시
if (order.userId !== currentUserId) {
  throw new Error('권한이 없습니다');
}
```

### 2. 필터링 로직 (AND 조건)
```javascript
// 상태 + 기간 + 검색이 모두 만족되어야 함
const filtered = allOrders
  .filter(o => !status || o.status === status)
  .filter(o => !startDate || o.createdAt >= startDate)
  .filter(o => !endDate || o.createdAt <= endDate)
  .filter(o => !query || o.name.includes(query) || o.projectId.includes(query));
```

### 3. 페이지네이션
```javascript
const start = (page - 1) * limit;
const end = start + limit;
const paginated = filtered.slice(start, end);
const hasMore = end < filtered.length;
```

### 4. 가격 계산
```javascript
const total = (basePrice × photos) + additionalCost;
```

### 5. 타임라인 자동 생성
```javascript
// 주문 생성 시
{ event: '주문 생성', status: 'completed', date: now }

// 결제 완료 시
{ event: '결제 완료', status: 'completed', date: now }

// 수정 시
{ event: '주문 수정', status: 'completed', date: now }
```

---

## 📝 테스트 체크리스트

### OrderListPage
- [ ] 기본 목록 조회 및 렌더링
- [ ] 상태 필터링 (전체/대기/진행중/완료)
- [ ] 기간 필터링 (전체/7일/30일/90일)
- [ ] 검색 기능 (주문명/프로젝트ID)
- [ ] 페이지네이션 (1-13페이지)
- [ ] 통계 계산 검증
- [ ] 행 클릭 → OrderDetailsPage 이동
- [ ] 새 주문 생성 버튼 → CreateNewOrderPage 이동

### CreateNewOrderPage
- [ ] 빈 폼 표시 (신규 모드)
- [ ] 기존 데이터 로드 (수정 모드)
- [ ] 실시간 가격 계산
- [ ] 필수 필드 검증
- [ ] 숫자 타입 검증
- [ ] 주문 생성 성공
- [ ] 주문 수정 성공
- [ ] Firebase 저장 확인
- [ ] 결제 페이지로 이동

### OrderDetailsPage
- [ ] 주문 정보 표시
- [ ] 타임라인 표시
- [ ] 수정 버튼 → CreateNewOrderPage (수정 모드)
- [ ] 삭제 버튼 → 확인 팝업 → 삭제
- [ ] 결제 버튼 (결제 미완료 시) → PaymentPage
- [ ] 뒤로가기 → OrderListPage

### PaymentPage
- [ ] 주문 정보 표시
- [ ] 결제 방법 선택 (신용카드/계좌이체/휴대폰)
- [ ] 결제 정보 입력 폼
- [ ] 약관 동의 체크박스
- [ ] 결제 처리 성공
- [ ] Firestore 상태 업데이트 확인
- [ ] 성공 메시지 + OrderListPage로 이동
- [ ] 취소 버튼 → OrderDetailsPage

---

## 💡 구현 팁

### 1. 에러 처리
```javascript
try {
  const order = await projectService.createOrder(userId, formData);
  // 성공
} catch (error) {
  if (error.code === 'INVALID_INPUT') {
    // 유효성 검사 실패
  } else if (error.code === 'PERMISSION_DENIED') {
    // 권한 없음
  } else {
    // 기타 오류
  }
}
```

### 2. 로딩 상태 관리
```javascript
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    // 작업
  } finally {
    setIsLoading(false);
  }
};
```

### 3. 타임라인 표시
```javascript
// 상태에 따라 색상/아이콘 변경
const statusColors = {
  completed: 'bg-green-600',
  'in-progress': 'bg-blue-600',
  pending: 'bg-neutral-300',
};
```

---

## 🎯 성공 기준

✅ Phase 2 성공 = 모든 4개 페이지가 정상 작동 + E2E 테스트 통과

- OrderListPage: 주문 조회/필터/검색/페이지네이션
- CreateNewOrderPage: 주문 생성/수정, 가격 계산
- OrderDetailsPage: 상세 조회, 수정/삭제
- PaymentPage: 더미 결제 처리, 상태 업데이트

---

## 📌 주의사항

⚠️ **결제 게이트웨이는 더미 구현**
- PaymentServiceMock 사용 (항상 성공)
- 실제 결제 연동은 나중에 (포트원, 토스페이먼츠 등)

⚠️ **Firebase 연동 준비**
- 현재 ProjectServiceMock 사용
- 나중에 ProjectServiceApi로 교체
- Firestore 컬렉션 구조 미리 정의 필요

⚠️ **권한 검증 필수**
- 모든 Order 작업에 userId 검증
- 현재 사용자만 자신의 주문 수정/삭제 가능

---

이제 **Phase 2-1: OrderListPage 구현**을 시작할 준비가 되었습니다!! 🚀✨
