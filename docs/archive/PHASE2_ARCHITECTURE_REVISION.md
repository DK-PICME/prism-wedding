# Phase 2 아키텍처 재검토 - Order와 Photo 관계 재정의

## 1. 기존 설계의 문제점

### 기존 구조
```
Order (1) ←→ (1) Payment
  └─ photos 필드 (숫자만 저장)
```

**문제점:**
- ❌ 사진이 실제로 어디에 저장되는지 불명확
- ❌ 결제 후 사진만 남는데, 결제 전 사진 관리 방법 없음
- ❌ 같은 사진으로 여러 주문 생성 불가
- ❌ 사진 수정/삭제가 주문에 영향을 미치는 문제

---

## 2. 새로운 아키텍처 제안

### 2.1 데이터 모델 재설계

```
┌──────────────┐
│   Folders    │ (사진 보관 클라우드)
├──────────────┤
│ folderId (PK)
│ userId (FK)
│ name
│ description
│ createdAt
│ photos: [Photo]
│ status: 'active' | 'archived'
└──────────────┘
        │ (1)
        │
        ├─ (N) Photos
        │
        └─ (N) Orders (참조)


┌──────────────┐
│   Photos     │
├──────────────┤
│ photoId (PK)
│ folderId (FK)
│ userId (FK)
│ fileName
│ fileUrl (Cloud Storage)
│ fileSize
│ uploadedAt
│ status: 'active' | 'readonly'
└──────────────┘


┌──────────────┐         ┌──────────────┐
│   Orders     │ ──N:M─→ │   Photos     │
├──────────────┤         ├──────────────┤
│ orderId (PK) │         │ photoId (PK) │
│ userId (FK)  │         │ fileUrl      │
│ folderId (FK)│         └──────────────┘
│ status       │
│ createdAt    │
└──────────────┘
        │ (1)
        │
        └─ (N) Payments (새로운 구조)


┌──────────────┐
│   Payments   │ (여러 결제 가능)
├──────────────┤
│ paymentId (PK)
│ orderId (FK)
│ userId (FK)
│ type: 'base' | 'option_urgent' | 'option_premium'
│ amount
│ status: 'pending' | 'completed' | 'refunded'
│ transactionId
│ createdAt
│ processedAt
└──────────────┘
```

### 2.2 Order : Payment = 1 : N 관계

```javascript
// Order 예시
{
  id: "order_001",
  userId: "user_123",
  folderId: "folder_001",  // 사진이 저장된 폴더
  photoIds: ["photo_001", "photo_002", "photo_003"],  // 참조만
  status: "waiting",
  
  // 결제 정보 (여러 번 발생)
  payments: [
    {
      id: "payment_001",
      type: "base",           // 기본 보정
      basePrice: 3000,
      photos: 3,
      totalAmount: 9000,
      status: "completed",
      createdAt: "2025-01-18T14:30:00Z"
    },
    {
      id: "payment_002",
      type: "option_urgent",  // 긴급 보정 추가
      additionalCost: 5000,
      status: "completed",
      createdAt: "2025-01-19T09:15:00Z"
    },
    {
      id: "payment_003",
      type: "option_premium",  // 프리미엄 보정 추가
      additionalCost: 10000,
      status: "pending",
      createdAt: "2025-01-20T10:00:00Z"
    }
  ],
  
  totalPaid: 24000,  // 지금까지 결제된 총액
  totalDue: 10000    // 남은 결제액
}
```

---

## 3. 사진 관리 시스템 아키텍처

### 3.1 폴더 기반 클라우드 스토리지

```
사진 관리 메뉴 (/photo-management)
├─ 폴더 목록 (아이콘 그리드)
│  ├─ 폴더1 [2025년 1월]
│  │  └─ 3개 사진
│  ├─ 폴더2 [2025년 2월]
│  │  └─ 5개 사진
│  └─ [+ 새 폴더 만들기]
│
├─ 폴더 내부 (/photo-management/:folderId)
│  ├─ 사진 그리드
│  │  ├─ 사진1 [보호됨 🔒]  (order_001에서 사용 중)
│  │  ├─ 사진2 [편집 가능]
│  │  └─ 사진3 [편집 가능]
│  │
│  └─ 액션
│     ├─ 선택한 사진으로 주문 생성
│     ├─ 사진 삭제 (보호된 사진 제외)
│     └─ 다운로드
│
└─ 주문 생성 플로우
   ├─ 1단계: 폴더/사진 선택
   ├─ 2단계: 보정 옵션 선택 (일반/긴급)
   ├─ 3단계: 견적 확인
   └─ 4단계: 결제
```

### 3.2 사진 상태 관리

```javascript
// Photo 문서
{
  id: "photo_001",
  userId: "user_123",
  folderId: "folder_001",
  fileName: "wedding_portrait_001.jpg",
  fileUrl: "gs://bucket/photos/user_123/folder_001/photo_001.jpg",
  fileSize: 2500000,  // 2.5MB
  uploadedAt: "2025-01-18T10:00:00Z",
  
  // 핵심: 사진 상태 (읽기 전용 여부)
  status: "active",  // "active" | "readonly"
  
  // 이 사진을 사용하는 주문들 (참조용)
  usedInOrders: [
    "order_001",
    "order_002"
  ],
  
  // 사진이 readonly가 된 이유
  lockedReason: "used_in_order",
  lockedAt: "2025-01-18T14:30:00Z",
  lockedByOrder: "order_001"
}
```

### 3.3 상태 전이도

```
┌─────────────────────────────────────────┐
│           Photo Lifecycle               │
└─────────────────────────────────────────┘

[활성상태 (Editable)]
  ├─ 업로드 직후
  ├─ 사용자가 삭제 가능
  ├─ 사용자가 수정 가능
  └─ 사용자가 다운로드 가능
      │
      │ (주문에 포함)
      ↓
[읽기전용 (Readonly)]
  ├─ 주문이 이 사진을 사용 중
  ├─ UI에서 보호 표시 (🔒)
  ├─ 사용자가 삭제 불가
  ├─ 사용자가 수정 불가
  ├─ 사용자가 다운로드 가능 (참조용)
  └─ 원본은 폴더에 그대로 유지
      │
      │ (주문 완료 또는 취소)
      ↓
[활성상태로 복원 (Optional)]
  └─ 주문이 완료되면 다시 활성상태로 변경 가능
```

---

## 4. 주문 생성 시 사진 처리 방안 비교

### 방안 1: 사진 복사 (❌ 비추천)

```javascript
// 주문 생성 시
const copiedPhotos = [];
for (const photoId of selectedPhotos) {
  const newPhoto = await copyPhoto(photoId);  // 복사 작업
  copiedPhotos.push(newPhoto);
}
await createOrder({
  photos: copiedPhotos
});
```

**장점:**
- ✅ 사진 손실 방지
- ✅ 사진 수정으로부터 완전히 독립

**단점:**
- ❌ 복사 작업이 오래 걸림 (특히 사진 많을 때)
- ❌ 스토리지 2배 사용 (원본 + 복사본)
- ❌ 동기화 문제 (원본과 복사본 불일치)
- ❌ 스토리지 비용 증가
- ❌ 주문 생성 완료 시간 증가

---

### 방안 2: 참조 + Readonly 변경 (✅ 추천)

```javascript
// 주문 생성 시
await updatePhotosStatus(selectedPhotos, 'readonly');  // 빠름
await createOrder({
  photoIds: selectedPhotos,  // 참조만 저장
  status: 'waiting'
});

// Photo 컬렉션에서
selectedPhotos.forEach(photoId => {
  updatePhoto(photoId, {
    status: 'readonly',
    usedInOrders: [...currentOrders, newOrderId],
    lockedReason: 'used_in_order',
    lockedAt: now()
  });
});
```

**장점:**
- ✅ 속도 빠름 (상태 업데이트만)
- ✅ 스토리지 효율적 (원본만 유지)
- ✅ 명확한 관계 관리
- ✅ 유저 경험 명확 (🔒 표시)

**단점:**
- ⚠️ 주문 취소 시 readonly 해제 필요
- ⚠️ 같은 사진으로 여러 주문 생성 가능 (관리 복잡)

---

### 방안 3: 하이브리드 (중간 수준)

```javascript
// 선택적 복사
if (selectedPhotos.length > 100) {
  // 많은 사진: 참조 + readonly
  await updatePhotosStatus(selectedPhotos, 'readonly');
  await createOrder({ photoIds: selectedPhotos });
} else {
  // 적은 사진: 복사
  const copied = await copyPhotos(selectedPhotos);
  await createOrder({ photoIds: copied });
}
```

---

## 5. 추천 방안: 방안 2 (참조 + Readonly)

### 5.1 장점 정리

| 기준 | 복사 | Readonly | 평가 |
|------|------|---------|------|
| 속도 | ❌ 느림 | ✅ 빠름 | Readonly 승리 |
| 스토리지 | ❌ 2배 | ✅ 1배 | Readonly 승리 |
| 동기화 | ❌ 어려움 | ✅ 쉬움 | Readonly 승리 |
| 안정성 | ✅ 높음 | ⚠️ 중간 | 복사 승리 |
| UX 명확성 | ❌ 불명확 | ✅ 명확 | Readonly 승리 |
| 구현 난이도 | ⚠️ 중간 | ✅ 쉬움 | Readonly 승리 |

### 5.2 구현 플로우

```
┌─────────────────────────────────────────┐
│  사진 관리 페이지                         │
│  (PhotoManagementPage)                   │
└──────────────┬──────────────────────────┘
               │
               ├─ 폴더 선택
               └─ 폴더 내부 진입
                    │
        ┌───────────▼────────────────┐
        │  폴더 상세 페이지            │
        │  (PhotoFolderPage)          │
        ├────────────────────────────┤
        │ [사진1] [사진2] [사진3]     │
        │  선택 ☑️  
        │                            │
        │ [+ 새 주문 생성]            │
        │ [✎ 편집]                   │
        │ [🗑️ 삭제]                   │
        └───────────┬────────────────┘
                    │
                    ├─ "새 주문 생성" 클릭
                    │
        ┌───────────▼────────────────┐
        │  보정 옵션 선택 페이지       │
        │  (CorrectionOptionsPage)    │
        ├────────────────────────────┤
        │ ○ 일반 보정 (3,000/장)     │
        │ ○ 긴급 보정 (5,000/장)     │
        │ □ 프리미엄 옵션 (+10,000) │
        │                            │
        │ 총 비용: 9,000원            │
        │                            │
        │ [견적 확인] → 주문 생성     │
        └───────────┬────────────────┘
                    │
                    ├─ Order 생성
                    ├─ Photos status = readonly
                    ├─ Photos.usedInOrders 추가
                    │
        ┌───────────▼────────────────┐
        │  주문 상세 페이지            │
        │  (OrderDetailsPage)         │
        ├────────────────────────────┤
        │ 주문 정보                    │
        │ 사진: 3개 [🔒 보호됨]      │
        │ 기본 보정: ₩9,000          │
        │                            │
        │ [추가 옵션 선택]            │
        │ [결제하기]                  │
        └────────────────────────────┘
```

---

## 6. 주문 생성 시 처리 로직

### 6.1 Order 생성 (new)

```javascript
// CreateOrderPage에서
async function createOrder(folderId, selectedPhotoIds, correctionOption) {
  try {
    // 1. Order 문서 생성
    const order = {
      id: `order_${Date.now()}`,
      userId: currentUser.uid,
      folderId,
      photoIds: selectedPhotoIds,  // 참조만 저장
      status: 'waiting',
      
      // 기본 결제 정보
      payments: [
        {
          id: `payment_${Date.now()}`,
          type: 'base',
          correctionOption,  // 'normal' | 'urgent'
          basePrice: getCorrectionPrice(correctionOption),
          photos: selectedPhotoIds.length,
          totalAmount: getCorrectionPrice(correctionOption) * selectedPhotoIds.length,
          status: 'pending',
          createdAt: now()
        }
      ],
      
      totalDue: getCorrectionPrice(correctionOption) * selectedPhotoIds.length,
      totalPaid: 0,
      
      createdAt: now(),
      timeline: [
        { event: '주문 생성', status: 'completed', date: now() }
      ]
    };
    
    // 2. Firestore에 Order 저장
    await db.collection('orders').doc(order.id).set(order);
    
    // 3. 선택한 사진들을 readonly로 변경 (⭐ 핵심)
    for (const photoId of selectedPhotoIds) {
      await db.collection('photos').doc(photoId).update({
        status: 'readonly',
        usedInOrders: firebase.firestore.FieldValue.arrayUnion(order.id),
        lockedReason: 'used_in_order',
        lockedAt: now(),
        lockedByOrder: order.id
      });
    }
    
    // 4. Folder의 주문 참조 추가 (선택)
    await db.collection('folders').doc(folderId).update({
      orders: firebase.firestore.FieldValue.arrayUnion(order.id)
    });
    
    return order;
  } catch (error) {
    console.error('Order creation failed:', error);
    throw error;
  }
}
```

### 6.2 Photo 상태 업데이트 로직

```javascript
// Photo UI에서 상태 표시
function PhotoThumbnail({ photo, onDelete, onDownload }) {
  const isReadonly = photo.status === 'readonly';
  
  return (
    <div className={`relative ${isReadonly ? 'opacity-75' : ''}`}>
      <img src={photo.fileUrl} alt={photo.fileName} />
      
      {isReadonly && (
        <div className="absolute top-2 right-2">
          <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <i className="fa-solid fa-lock"></i>
            보호됨
          </div>
          
          {/* 주문 정보 표시 */}
          <div className="mt-2 text-xs text-gray-600">
            주문 {photo.lockedByOrder}에서 사용 중
            <br />
            {photo.usedInOrders.map(orderId => (
              <a href={`/order-details?id=${orderId}`} key={orderId}>
                → {orderId}
              </a>
            ))}
          </div>
        </div>
      )}
      
      {!isReadonly && (
        <div className="flex gap-2">
          <button onClick={onDownload}>
            <i className="fa-solid fa-download"></i>
          </button>
          <button onClick={onDelete} className="text-red-500">
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 7. 추가 결제 옵션 처리

### 7.1 결제 추가 플로우

```
┌──────────────────────────────────────┐
│  OrderDetailsPage (기본 보정 결제 완료) │
└──────────────────────────────────────┘
                │
                ├─ 추가 옵션 필요
                │
    ┌───────────▼────────────────────┐
    │  "추가 옵션 선택" 버튼           │
    │  (오른쪽 사이드 패널)           │
    ├────────────────────────────────┤
    │ ☑️ 긴급 보정 (+5,000원)        │
    │ ☑️ 프리미엄 (선택 사진)        │
    │ ☑️ AI 터치업 (+3,000원)       │
    │                                │
    │ 추가 비용: 8,000원              │
    │ [옵션 추가하기]                 │
    └───────────┬────────────────────┘
                │
    ┌───────────▼────────────────────┐
    │  Payment 추가 생성               │
    ├────────────────────────────────┤
    │ {                              │
    │   type: 'option_urgent',       │
    │   additionalCost: 5000,        │
    │   amount: 5000,                │
    │   status: 'pending',           │
    │   createdAt: now()             │
    │ }                              │
    └───────────┬────────────────────┘
                │
    ┌───────────▼────────────────────┐
    │  PaymentPage (추가 결제)        │
    ├────────────────────────────────┤
    │ 기존 결제: ₩9,000 (완료)       │
    │ 추가 결제: ₩5,000 (진행 중)    │
    │ 총액: ₩14,000                  │
    │                                │
    │ [₩5,000 결제]                   │
    └────────────────────────────────┘
```

### 7.2 Order 문서 구조 (추가 결제 포함)

```javascript
{
  id: "order_001",
  userId: "user_123",
  folderId: "folder_001",
  photoIds: ["photo_001", "photo_002", "photo_003"],
  status: "in-progress",  // 부분 결제 중
  
  // 여러 결제
  payments: [
    {
      id: "payment_001",
      type: "base",
      correctionOption: "normal",
      basePrice: 3000,
      photos: 3,
      amount: 9000,
      status: "completed",
      transactionId: "txn_001",
      processedAt: "2025-01-18T14:30:00Z",
      createdAt: "2025-01-18T14:00:00Z"
    },
    {
      id: "payment_002",
      type: "option_urgent",
      amount: 5000,
      status: "completed",
      transactionId: "txn_002",
      processedAt: "2025-01-18T15:00:00Z",
      createdAt: "2025-01-18T14:50:00Z"
    },
    {
      id: "payment_003",
      type: "option_premium",
      amount: 3000,
      status: "pending",  // 아직 미결제
      createdAt: "2025-01-19T10:00:00Z"
    }
  ],
  
  // 집계 정보
  totalPaid: 14000,       // 9000 + 5000
  totalDue: 3000,         // 14000 + 3000 - 14000
  totalAmount: 17000,     // 9000 + 5000 + 3000
  
  createdAt: "2025-01-18T14:00:00Z",
  updatedAt: "2025-01-19T10:00:00Z"
}
```

---

## 8. 데이터 일관성 보장

### 8.1 주문 취소 시 처리

```javascript
async function cancelOrder(orderId) {
  try {
    // 1. Order 상태 변경
    await db.collection('orders').doc(orderId).update({
      status: 'cancelled',
      cancelledAt: now(),
      cancelReason: userProvidedReason
    });
    
    // 2. 해당 주문의 모든 사진을 활성상태로 변경
    const order = await db.collection('orders').doc(orderId).get();
    for (const photoId of order.data().photoIds) {
      await db.collection('photos').doc(photoId).update({
        status: 'active',  // readonly에서 active로 복구
        usedInOrders: firebase.firestore.FieldValue.arrayRemove(orderId),
        lockedReason: null,
        lockedAt: null,
        lockedByOrder: null
      });
    }
    
    // 3. 모든 결제를 환불 처리
    const payments = order.data().payments;
    for (const payment of payments) {
      if (payment.status === 'completed') {
        // 환불 처리
        await createRefundPayment(payment);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Order cancellation failed:', error);
    throw error;
  }
}
```

### 8.2 주문 완료 시 처리 (선택)

```javascript
async function completeOrder(orderId) {
  try {
    // 1. Order 상태 변경
    await db.collection('orders').doc(orderId).update({
      status: 'completed',
      completedAt: now()
    });
    
    // 2. 사진을 활성상태로 복구 (선택사항)
    // → 보기 전용(viewonly)으로 유지할 수도 있음
    const order = await db.collection('orders').doc(orderId).get();
    for (const photoId of order.data().photoIds) {
      await db.collection('photos').doc(photoId).update({
        status: 'viewonly',  // 사용자가 볼 수만 있음
        // usedInOrders는 유지 (이력)
      });
    }
    
    return true;
  } catch (error) {
    console.error('Order completion failed:', error);
    throw error;
  }
}
```

---

## 9. 새로운 데이터 모델 정리

### 9.1 Folder 컬렉션

```javascript
{
  id: "folder_001",
  userId: "user_123",
  name: "2025년 1월 웨딩",
  description: "김민수&박지영 웨딩 촬영",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  
  // 통계
  photoCount: 150,
  usedInOrders: ["order_001", "order_002"],
  
  // 상태
  status: "active",  // "active" | "archived"
}
```

### 9.2 Photo 컬렉션

```javascript
{
  id: "photo_001",
  userId: "user_123",
  folderId: "folder_001",
  fileName: "wedding_001.jpg",
  fileUrl: "gs://bucket/...",
  fileSize: 2500000,
  uploadedAt: Timestamp,
  
  // 상태 관리
  status: "active" | "readonly" | "viewonly" | "archived",
  lockedReason: "used_in_order" | "archived",
  lockedAt: Timestamp (optional),
  lockedByOrder: "order_001" (optional),
  
  // 사용처 추적
  usedInOrders: ["order_001", "order_002"],  // 이력
  
  // 메타데이터
  width: 4000,
  height: 3000,
  tags: ["portrait", "bride"],
}
```

### 9.3 Order 컬렉션 (수정)

```javascript
{
  id: "order_001",
  userId: "user_123",
  folderId: "folder_001",
  
  // 사진 참조
  photoIds: ["photo_001", "photo_002", "photo_003"],
  
  // 상태
  status: "waiting" | "in-progress" | "completed" | "cancelled",
  
  // 여러 결제
  payments: [
    {
      id: "payment_001",
      type: "base" | "option_urgent" | "option_premium" | "addon",
      amount: 9000,
      status: "pending" | "completed" | "refunded",
      transactionId: "txn_001" (optional),
      createdAt: Timestamp,
      processedAt: Timestamp (optional),
    }
  ],
  
  // 집계
  totalAmount: 17000,      // 모든 결제 금액 합
  totalPaid: 14000,        // 완료된 결제 금액 합
  totalDue: 3000,          // 남은 결제 금액
  
  // 메타데이터
  createdAt: Timestamp,
  updatedAt: Timestamp,
  cancelledAt: Timestamp (optional),
}
```

---

## 10. 마이그레이션 계획 (기존 구조에서)

### 10.1 변경사항

| 항목 | 기존 | 신규 | 영향 |
|------|------|------|------|
| Order.photos | number | photoIds (array) | ❌ 마이그레이션 필요 |
| Order.payments | 없음 | payments (array) | ✅ 새로 추가 |
| Photo 컬렉션 | 없음 | 새 컬렉션 | ✅ 새로 추가 |
| Folder 컬렉션 | 없음 | 새 컬렉션 | ✅ 새로 추가 |

### 10.2 마이그레이션 스크립트 (나중에)

```javascript
async function migrateToNewModel() {
  // 1. 기존 Order 조회
  const oldOrders = await db.collection('orders').get();
  
  // 2. 각 Order 변환
  for (const oldOrder of oldOrders.docs) {
    const data = oldOrder.data();
    
    // Order 업데이트
    await oldOrder.ref.update({
      // photos (숫자) 제거 후 photoIds (배열) 추가
      photoIds: [],  // 빈 배열로 초기화 (나중에 사용자가 수동 추가)
      
      // payments 구조 추가
      payments: [
        {
          id: `payment_legacy_${oldOrder.id}`,
          type: 'base',
          amount: data.amount,
          status: data.paymentStatus === 'completed' ? 'completed' : 'pending',
          transactionId: data.transactionId || null,
          createdAt: data.createdAt,
          processedAt: data.paymentProcessedAt
        }
      ],
      
      totalAmount: data.amount,
      totalPaid: data.paymentStatus === 'completed' ? data.amount : 0,
      totalDue: data.paymentStatus === 'completed' ? 0 : data.amount,
      
      // 기존 필드 제거
      photos: firebase.firestore.FieldValue.delete(),
      paymentStatus: firebase.firestore.FieldValue.delete(),
      amount: firebase.firestore.FieldValue.delete(),
    });
  }
}
```

---

## 11. 최종 결론 및 권장사항

### 11.1 권장 사항 정리

| 결정 항목 | 권장 선택 | 이유 |
|---------|---------|------|
| Order:Payment 관계 | **1:N** | ✅ 추가 옵션 결제 지원, 유연함 |
| 사진 처리 방식 | **참조 + Readonly** | ✅ 빠르고, 효율적, UX 명확 |
| 사진 복사 | **하지 않음** | ✅ 스토리지 절약, 성능 우수 |
| Photo 상태 관리 | **Readonly** | ✅ 사용자가 수정 못함, 명확 |
| 폴더 시스템 | **구현** | ✅ 클라우드 스토리지 UX 제공 |
| 사진 보존 | **주문 후에도 유지** | ✅ 사용자 편의, 이력 관리 |

### 11.2 구현 순서

```
Phase 2-1: OrderListPage (기존)
Phase 2-2: CreateNewOrderPage (기존 수정)
  ├─ 보정 옵션 추가
  ├─ 사진 선택 UI 추가
  ├─ Order:Payment 1:N 구조 적용
  └─ Photo.status = readonly 처리

Phase 2-3: OrderDetailsPage (기존 수정)
  ├─ 여러 Payment 표시
  ├─ 추가 옵션 선택 UI
  └─ 총 결제액/남은 결제액 표시

Phase 2-4: PaymentPage (기존)

Phase 2-5: 새로운 기능
  ├─ Folder 컬렉션 생성
  ├─ Photo 컬렉션 생성
  ├─ PhotoManagementPage 재구성
  ├─ 폴더 목록 페이지
  ├─ 폴더 상세 페이지
  └─ 보정 옵션 선택 페이지
```

---

## 12. 정리: 새로운 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────┐
│                   사진 관리 시스템                         │
│                  (클라우드 스토리지)                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Folder] (1:N) ──→ [Photo]                            │
│   • 2025-01 웨딩                  • photo_001 (active)   │
│   • 2025-02 스튜디오             • photo_002 (readonly) │
│   • 아카이브                      • photo_003 (readonly) │
│                                                          │
│                          ↓ 참조                          │
│                                                          │
│                      [Order] (1:N)                       │
│                   photoIds 저장                          │
│                                                          │
│                          ↓                               │
│                                                          │
│                  [Payment] (1:N)                         │
│              • Base (기본 보정)                           │
│              • Urgent (긴급 보정)                         │
│              • Premium (프리미엄)                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

이제 정말 견고한 아키텍처가 완성되었습니다!! 🎉✨

**핵심 변경점:**
1. ✅ **Order : Payment = 1 : N** (추가 결제 옵션 지원)
2. ✅ **사진 참조 + Readonly** (복사하지 않음, 효율적)
3. ✅ **Folder 기반 클라우드 스토리지** (폴더 탐색기 UI)
4. ✅ **Photo 상태 관리** (readonly로 보호)
5. ✅ **사진 보존** (주문 후에도 유지)

모두 좋은 결정입니다!! 👍
