# 주문 생성 시점 사진 복제 전략 상세 분석

## 1. 제안된 아키텍처

### 프로세스 플로우

```
┌────────────────────────────────────────────────────────────┐
│                    1단계: 사진함 업로드                     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  사진 업로드 (무제한)
│  └─ s3://user-photos/{userId}/folder_1/photo_001.jpg
│     └─ 마음껏 올려! 삭제도 자유!
│
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                    2단계: 주문 생성 클릭                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  사용자가 사진 선택 + "주문하기" 클릭
│  └─ photoIds = [photo_001, photo_002, ..., photo_N]
│
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│              3단계: SEMAPHORE 획득 (Lock)                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Photo 컬렉션에 Lock 설정
│  ├─ Photo.status = "COPYING_TO_ORDER"  ⭐ 세마포어 역할
│  ├─ Photo.lockExpiry = now + 30분
│  ├─ Photo.orderId = order_001 (어느 주문으로 복제되는 중)
│  │
│  의미:
│  ├─ 이 사진 삭제 불가능! (Lock 중)
│  ├─ 다른 주문에서 선택 불가능!
│  ├─ 타임아웃으로 자동 해제 (결제 실패 대비)
│  └─ 30분 내에 결제 완료해야 Lock 해제
│
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│           4단계: 병렬 복제 (Multiple Workers)               │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Photo 10장 기준: ~100MB
│  
│  Worker Pool 실행 (예: 5개 Worker)
│  ├─ Worker 1: photo_001 복제
│  ├─ Worker 2: photo_002 복제
│  ├─ Worker 3: photo_003 복제
│  ├─ Worker 4: photo_004 복제
│  ├─ Worker 5: photo_005 복제
│  │ (동시 진행)
│  │
│  복제 대상: s3://order-storage/{orderId}/
│  ├─ s3://order-storage/order_001/photo_001.jpg (복사본)
│  ├─ s3://order-storage/order_001/photo_002.jpg (복사본)
│  └─ ...
│
│  예상 시간:
│  ├─ 10장 (100MB): ~2-3초
│  ├─ 100장 (1GB): ~20-30초
│  ├─ 500장 (5GB): ~100-150초
│  └─ 1000장 (10GB): ~200-300초
│
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│              5단계: 결제 프로세스 시작                      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  복제 완료 후 사용자에게 결제 페이지 제공
│  ├─ 사진들이 모두 order-storage로 복제됨
│  ├─ 사진함의 원본은 여전히 "COPYING_TO_ORDER" 상태
│  └─ 사용자: 결제하기 or 취소하기
│
└────────────────────────────────────────────────────────────┘
                            ↓
        ┌──────────────────┬──────────────────┐
        │ 시나리오 A       │   시나리오 B     │
        │ 결제 완료        │   결제 취소       │
        └────────┬─────────┴────────┬─────────┘
                 │                  │
        ┌────────▼─────────┐  ┌────▼──────────────┐
        │ 5A: 결제 완료    │  │ 5B: 결제 실패/취소 │
        ├────────────────┤  ├──────────────────┤
        │                │  │                  │
        │ Order.status   │  │ 주문 삭제        │
        │  = CONFIRMED   │  │                  │
        │                │  │ 복제 사진 삭제   │
        │ Photo.status   │  │ (order-storage)  │
        │  = READONLY    │  │                  │
        │  (Lock 해제!)   │  │ Photo.status     │
        │                │  │  = ACTIVE        │
        │ 결과 저장소로  │  │ (Lock 해제!)     │
        │ 사진 복제       │  │                  │
        │ (예: 보정본)    │  │ 세마포어 풀기 ✅ │
        │                │  │                  │
        │ 세마포어 풀기 ✅ │  │                  │
        └────────────────┘  └──────────────────┘
                │                      │
                │                      │
        사용자: 사진함에서 삭제 불가 ✅  사용자: 자유롭게 삭제 ✅
```

---

## 2. 상세 구현 로직

### 2.1 주문 생성 요청 핸들러

```javascript
// 프론트: 사진 선택 후 "주문하기" 클릭
async function startOrderCreation(userId, folderId, selectedPhotoIds) {
  try {
    // 1. 백엔드에 "주문 생성 요청 with 사진 복제" 호출
    const response = await api.post('/orders/create-with-copy', {
      userId,
      folderId,
      photoIds: selectedPhotoIds,  // [photo_001, photo_002, ...]
      correctionOption: "basic"    // 또는 "advanced"
    });
    
    // 2. 응답: 주문 ID + 복제 진행률
    const { orderId, copyProgress } = response.data;
    
    // 3. 복제 진행 모니터링 (WebSocket or Polling)
    monitorCopyProgress(orderId, copyProgress);
    
    // 4. 복제 완료 → 결제 페이지로 자동 이동
    return orderId;
  } catch (error) {
    handleOrderCreationError(error);
  }
}
```

### 2.2 백엔드 주문 생성 + 복제 로직

```javascript
// 백엔드 (Node.js + Firebase)

async function createOrderWithCopy(userId, folderId, photoIds, correctionOption) {
  const orderId = `order_${Date.now()}`;
  
  try {
    // ============ Phase 1: 세마포어 설정 ============
    const lockResult = await acquirePhotosLock(photoIds, orderId, 1800000); // 30분
    
    if (!lockResult.success) {
      throw new Error(`Could not lock photos: ${lockResult.failedPhotos}`);
    }
    
    console.log(`✅ Semaphore acquired for order ${orderId}`);
    
    // ============ Phase 2: 주문 문서 생성 (임시 상태) ============
    const order = {
      id: orderId,
      userId,
      folderId,
      photoIds,
      correctionOption,
      
      // 사진 복제 진행 정보
      copyStatus: "IN_PROGRESS",
      copyStartTime: new Date(),
      copyProgress: {
        total: photoIds.length,
        completed: 0,
        failed: []
      },
      
      // 복제된 사진들 정보
      copiedPhotos: [],  // 복제 완료된 사진들
      
      // 결제 정보
      payments: [],
      paymentStatus: "PENDING",
      
      status: "COPYING",  // ⭐ 중요: 복제 중
      createdAt: new Date()
    };
    
    await db.collection('orders').doc(orderId).set(order);
    console.log(`✅ Order document created: ${orderId}`);
    
    // ============ Phase 3: 병렬 복제 시작 ============
    const copyTasks = photoIds.map((photoId, index) =>
      copyPhotoToOrderStorage(orderId, photoId, userId, index)
    );
    
    // Worker Pool로 병렬 처리 (동시성 제한: 예 5개)
    const CONCURRENCY = 5;
    const results = await pLimit(CONCURRENCY)(
      copyTasks
    );
    
    // 복제 결과 처리
    const failedCopies = results.filter(r => !r.success);
    const successfulCopies = results.filter(r => r.success);
    
    if (failedCopies.length > 0) {
      console.warn(`⚠️ Failed to copy ${failedCopies.length} photos`);
      
      // 부분 실패 처리: 성공한 사진들만 진행
      // 또는 전체 롤백 (설정에 따라)
      if (failedCopies.length === photoIds.length) {
        throw new Error("All copy operations failed");
      }
    }
    
    console.log(`✅ Copy completed: ${successfulCopies.length}/${photoIds.length}`);
    
    // ============ Phase 4: 주문 문서 업데이트 ============
    await db.collection('orders').doc(orderId).update({
      copyStatus: "COMPLETED",
      copyEndTime: new Date(),
      copiedPhotos: successfulCopies.map(r => ({
        originalPhotoId: r.photoId,
        copiedUrl: r.copiedUrl,
        copiedSize: r.fileSize,
        copiedAt: r.timestamp
      })),
      status: "READY_FOR_PAYMENT",  // ⭐ 복제 완료 → 결제 준비
      copyProgress: {
        total: photoIds.length,
        completed: successfulCopies.length,
        failed: failedCopies.map(f => f.photoId)
      }
    });
    
    console.log(`✅ Order ready for payment: ${orderId}`);
    
    // ============ Phase 5: 결과 반환 ============
    return {
      success: true,
      orderId,
      copyStatus: "COMPLETED",
      photosCopied: successfulCopies.length,
      photosFailed: failedCopies.length
    };
    
  } catch (error) {
    console.error(`❌ Order creation failed: ${error.message}`);
    
    // 세마포어 해제 (실패했으니까)
    await releasePhotosLock(photoIds, orderId);
    
    // 복제된 사진들 정리
    await cleanupOrderStorage(orderId);
    
    throw error;
  }
}

// === 세마포어 획득 ===
async function acquirePhotosLock(photoIds, orderId, lockDurationMs) {
  const batch = db.batch();
  const lockExpiry = Date.now() + lockDurationMs;
  
  for (const photoId of photoIds) {
    const photoRef = db.collection('photos').doc(photoId);
    const photoSnap = await photoRef.get();
    
    if (!photoSnap.exists) {
      return { success: false, failedPhotos: [photoId] };
    }
    
    const photo = photoSnap.data();
    
    // 이미 다른 주문으로 Lock 중인지 확인
    if (photo.status === "COPYING_TO_ORDER" && photo.lockExpiry > Date.now()) {
      return { success: false, failedPhotos: [photoId] };
    }
    
    // Lock 설정
    batch.update(photoRef, {
      status: "COPYING_TO_ORDER",
      lockedByOrder: orderId,
      lockExpiry,
      lockedAt: new Date()
    });
  }
  
  await batch.commit();
  return { success: true };
}

// === 병렬 복제 작업 ===
async function copyPhotoToOrderStorage(orderId, photoId, userId, index) {
  try {
    // 1. 원본 사진 정보 조회
    const photoSnap = await db.collection('photos').doc(photoId).get();
    const photo = photoSnap.data();
    const sourceUrl = photo.publicUrl;
    
    // 2. S3에서 S3로 복제
    const timestamp = Date.now();
    const destKey = `order-storage/${orderId}/${index}_${photoId}.jpg`;
    
    const copyResult = await s3.copyObject({
      Bucket: 'prism-wedding-storage',
      CopySource: `prism-wedding-storage/${sourceUrl}`,
      Key: destKey,
      Metadata: {
        orderId,
        photoId,
        copiedAt: new Date().toISOString()
      }
    }).promise();
    
    console.log(`✅ Photo copied: ${photoId} → ${destKey}`);
    
    return {
      success: true,
      photoId,
      copiedUrl: `s3://prism-wedding-storage/${destKey}`,
      fileSize: photo.fileSize,
      timestamp
    };
    
  } catch (error) {
    console.error(`❌ Copy failed for photo ${photoId}: ${error.message}`);
    
    return {
      success: false,
      photoId,
      error: error.message
    };
  }
}

// === 세마포어 해제 ===
async function releasePhotosLock(photoIds, orderId) {
  const batch = db.batch();
  
  for (const photoId of photoIds) {
    const photoRef = db.collection('photos').doc(photoId);
    
    batch.update(photoRef, {
      status: "ACTIVE",
      lockedByOrder: null,
      lockExpiry: null,
      lockedAt: null
    });
  }
  
  await batch.commit();
  console.log(`✅ Semaphore released for ${photoIds.length} photos`);
}

// === 결제 완료 처리 ===
async function confirmPayment(orderId, paymentData) {
  try {
    // 1. 결제 처리
    const paymentResult = await processPayment(paymentData);
    
    if (!paymentResult.success) {
      throw new Error("Payment failed");
    }
    
    // 2. 주문 상태 업데이트
    const orderSnap = await db.collection('orders').doc(orderId).get();
    const order = orderSnap.data();
    
    // 3. Photo 상태를 READONLY로 변경 (세마포어 해제)
    const batch = db.batch();
    
    for (const photoId of order.photoIds) {
      const photoRef = db.collection('photos').doc(photoId);
      
      batch.update(photoRef, {
        status: "READONLY",  // ⭐ Lock 해제 + Readonly로 전환
        lockedByOrder: null,
        lockExpiry: null,
        usedInOrders: db.arrayUnion(orderId)
      });
    }
    
    // 주문 상태 업데이트
    batch.update(db.collection('orders').doc(orderId), {
      status: "CONFIRMED",
      paymentStatus: "COMPLETED",
      paymentData: paymentResult,
      confirmedAt: new Date()
    });
    
    await batch.commit();
    
    console.log(`✅ Payment confirmed, semaphore released: ${orderId}`);
    
    return { success: true, orderId };
    
  } catch (error) {
    console.error(`❌ Payment confirmation failed: ${error.message}`);
    
    // 결제 실패 → 세마포어 해제 + 복제본 삭제
    await handlePaymentFailure(orderId);
    
    throw error;
  }
}

// === 결제 실패 처리 ===
async function handlePaymentFailure(orderId) {
  try {
    const orderSnap = await db.collection('orders').doc(orderId).get();
    const order = orderSnap.data();
    
    // 1. 세마포어 해제
    await releasePhotosLock(order.photoIds, orderId);
    
    // 2. 복제된 사진들 삭제
    for (const copiedPhoto of order.copiedPhotos) {
      await s3.deleteObject({
        Bucket: 'prism-wedding-storage',
        Key: copiedPhoto.copiedUrl.replace('s3://prism-wedding-storage/', '')
      }).promise();
    }
    
    // 3. 주문 상태 업데이트
    await db.collection('orders').doc(orderId).update({
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancellationReason: "Payment failed"
    });
    
    console.log(`✅ Payment failure handled, resources cleaned up: ${orderId}`);
    
  } catch (error) {
    console.error(`❌ Error in handlePaymentFailure: ${error.message}`);
  }
}

// === Timeout 처리 (30분 후 자동 정리) ===
async function handleLockTimeout() {
  const now = Date.now();
  
  const lockedPhotos = await db.collection('photos')
    .where('status', '==', 'COPYING_TO_ORDER')
    .where('lockExpiry', '<', now)
    .get();
  
  for (const photoDoc of lockedPhotos.docs) {
    const photo = photoDoc.data();
    const orderId = photo.lockedByOrder;
    
    console.warn(`⚠️ Lock timeout for photo ${photoDoc.id}, releasing...`);
    
    // 1. 세마포어 해제
    await photoDoc.ref.update({
      status: "ACTIVE",
      lockedByOrder: null,
      lockExpiry: null
    });
    
    // 2. 주문 상태 확인
    const orderSnap = await db.collection('orders').doc(orderId).get();
    
    if (orderSnap.exists && orderSnap.data().status !== "CONFIRMED") {
      // 3. 결제되지 않은 주문이면 정리
      await handlePaymentFailure(orderId);
    }
  }
}
```

---

## 3. 성능 분석: 예상 복제 시간

### 3.1 AWS S3 Copy 성능 기준

```
기본 가정:
├─ 각 사진: 10MB
├─ S3 내 Copy (Cross-Region X): 빠름!
├─ Worker Pool: 5개 동시 Worker
├─ Network Latency: ~50-100ms (평균)
└─ S3 Copy Speed: ~30-50MB/s (S3 내 Copy는 매우 빠름)
```

### 3.2 시나리오별 예상 시간

#### 시나리오 1: 10장 (100MB)

```
순차 처리 (1개 Worker):
├─ 각 사진: 10MB
├─ Copy 오버헤드: ~200ms (네트워크 + S3 API 콜)
├─ 총 시간: 10 × (10MB / 30MB/s + 0.2s) ≈ 5-7초
└─ ✅ 빠름!

병렬 처리 (5개 Worker):
├─ Worker 1: photo_1, photo_6
├─ Worker 2: photo_2, photo_7
├─ Worker 3: photo_3, photo_8
├─ Worker 4: photo_4, photo_9
├─ Worker 5: photo_5, photo_10
├─ 병렬 시간: 2 × (10MB / 30MB/s + 0.2s) ≈ 2-3초
└─ ✅ 매우 빠름!

결론: 10장 → **2-3초** ✅
```

#### 시나리오 2: 100장 (1GB)

```
순차 처리:
├─ 총 시간: 100 × 0.4s ≈ 40초
└─ ⚠️ 느림 (사용자 대기)

병렬 처리 (5개 Worker, 각 20장):
├─ 각 Worker: 20 × 0.4s = 8초
├─ 동시 실행: 8초
└─ 결론: 100장 → **8-12초** ✅

실제 성능:
├─ AWS S3 내 Copy는 네트워크 비용 거의 없음
├─ Metadata 복제만 하는 수준
├─ 실제로는 더 빠를 수 있음: **5-8초**
└─ ✅ 체감상 OK
```

#### 시나리오 3: 500장 (5GB)

```
병렬 처리 (5개 Worker, 각 100장):
├─ 각 Worker: 100 × 0.4s = 40초
├─ 동시 실행: 40초
└─ 결론: 500장 → **30-50초** ⚠️

분석:
├─ 사용자가 결제 페이지에서 30-50초 대기
├─ 프로그래스 바로 모니터링하면 OK
├─ 비동기 처리 권장 (복제는 백그라운드)
└─ UX 개선: 복제 중 "사진 미리보기" 표시

개선안: Worker 수 증가
├─ Worker 10개로 증가 → 20-25초 ✅
├─ 병목: S3 Rate Limit (초당 3500 PUT, 5500 GET)
└─ 프리즘 규모에선 무시할 수 있는 수준
```

#### 시나리오 4: 1000장 (10GB)

```
병렬 처리 (5개 Worker):
├─ 각 Worker: 200 × 0.4s = 80초
├─ 결론: 1000장 → **80-120초** ❌ 너무 오래

병렬 처리 (20개 Worker):
├─ 각 Worker: 50 × 0.4s = 20초
├─ 결론: 1000장 → **20-30초** ✅

AWS S3 Rate Limit 확인:
├─ 초당 3500 PUT/COPY 요청 가능
├─ 20개 Worker × 2-3 copies/sec = 40-60 copies/sec
└─ Limit: 3500/sec → 여유있음! ✅
```

### 3.3 정리: 복제 시간 요약

| 사진 수 | 용량 | Worker 5개 | Worker 10개 | Worker 20개 |
|--------|------|-----------|-----------|-----------|
| **10장** | 100MB | **2-3초** | 2-3초 | 2-3초 |
| **100장** | 1GB | **8-12초** | 5-8초 | 5-8초 |
| **500장** | 5GB | **30-50초** | 15-25초 | 10-15초 |
| **1000장** | 10GB | **80-120초** | 30-40초 | **20-30초** |

**결론:**
```
Worker 수 = 10~15개 기준으로
├─ 10-100장: 2-12초 ✅ (사용자가 느끼지 못함)
├─ 500장: 15-25초 ✅ (프로그래스 바 표시)
├─ 1000장: 30-40초 ⚠️ (비동기 권장)
└─ 1500장 이상: 백그라운드 작업으로 변경 권장
```

---

## 4. 장점 분석

### 4.1 데이터 무결성

```
✅ 완벽한 격리 (Order-Specific Storage)

시나리오:
├─ 사진함에서 사진 삭제
│  ├─ 원본: 사진함에서 제거
│  └─ 주문용 복사본: order-storage에서 유지
│  
├─ 다른 주문에서 같은 사진 사용
│  ├─ 주문1: order-storage/order_001/photo_001.jpg
│  ├─ 주문2: order-storage/order_002/photo_001.jpg
│  └─ 완전 독립적! 서로 영향 없음
│
└─ 결론: 각 주문의 데이터는 100% 격리됨
```

### 4.2 사용자 자유도

```
✅ 사진함 = 완전한 자유

사용자가 마음껏:
├─ 사진 업로드 (무제한)
├─ 사진 삭제 (주문 후에도!)
├─ 사진 재업로드
├─ 사진 이름 변경
└─ 폴더 정리

주문 생성 후:
├─ 사진함의 원본 삭제 가능
├─ 주문 진행은 영향 없음
└─ 주문용 복사본은 독립적으로 존재
```

### 4.3 트랜잭션 안전성

```
✅ 결제 완료 = 절대 안전

복제 완료 → 결제 대기 → 결제 완료 순서로
├─ 사진이 order-storage에 100% 존재함
├─ 사진함 원본 삭제되어도 무관
├─ 결제 실패 시에만 정리 (복제본 삭제)
└─ 이중 삼중 안전 장치!
```

### 4.4 동시성 제어 (Semaphore)

```
✅ 세마포어로 Race Condition 방지

Lock 기간:
├─ 복제 중: COPYING_TO_ORDER (Lock)
├─ 복제 완료 → 결제 대기: COPYING_TO_ORDER (계속 Lock)
├─ 결제 완료: READONLY (Lock 해제)
├─ 결제 실패: ACTIVE (Lock 해제)
└─ Timeout (30분): ACTIVE (자동 해제)

보호되는 시나리오:
├─ ❌ 사진 복제 중 삭제 시도 → 차단! ✅
├─ ❌ 같은 사진으로 두 주문 동시 생성 → 차단! ✅
├─ ❌ 복제 중 사진 수정 → 차단! ✅
└─ ✅ 타임아웃으로 자동 정리됨
```

### 4.5 감사 추적 (Audit Trail)

```
✅ 모든 작업의 완벽한 기록

Photo 문서:
├─ lockedByOrder: order_001
├─ lockExpiry: 1711000000
├─ lockedAt: 2024-03-21T...
├─ usedInOrders: [order_001, order_002]
└─ 모든 관계 명확하게 추적

Order 문서:
├─ photoIds: [photo_001, photo_002, ...]
├─ copiedPhotos: [{originalPhotoId, copiedUrl, copiedAt}, ...]
├─ copyStatus: COMPLETED
├─ copyStartTime / copyEndTime
└─ 전체 복제 과정 기록

결론: 문제 발생 시 원인 파악 쉬움
```

### 4.6 성능 (예상 복제 시간)

```
✅ 충분히 빠름!

Worker 10~15개 기준:
├─ 10장: 2-3초 ✅
├─ 100장: 5-8초 ✅
├─ 500장: 15-25초 ✅
└─ 1000장: 30-40초 (비동기 권장)

S3 내 Copy는 매우 효율적
├─ 네트워크 전송 X (S3 내부 작업)
├─ API 호출 오버헤드: ~200ms/copy
└─ 총 처리량: 수십 MB/s 가능
```

---

## 5. 단점 분석

### 5.1 스토리지 비용 증가

```
⚠️ 데이터 복제 = 스토리지 2배

시나리오:
├─ 월 신규 사용자: 100명
├─ 평균 사진함: 5GB
├─ 월 평균 주문: 50건
├─ 주문당 평균 50장 (500MB)
│
총 스토리지:
├─ 사진함: 100 × 5GB = 500GB
├─ 주문 복사본: 50 × 500MB = 25GB
├─ 결과 저장소: 50 × 500MB = 25GB (보정 결과)
│
총합: 550GB

비용 (AWS S3 Standard):
├─ 550GB × $0.023/GB = $12.65/월
└─ 기존 (백업만): 550GB × $0.023/GB = $12.65/월

실제 추가 비용:
├─ 구성: 사진함(500GB) + 주문복사(25GB) + 결과(25GB)
├─ 기존: 사진함(500GB) + 백업(500GB) = $23.30/월
├─ 신규: 사진함(500GB) + 주문복사(25GB) + 결과(25GB) = $14.95/월
└─ 절감! (복사는 중복도 없고 더 효율적)
```

### 5.2 결제 중단 시 복구 복잡도

```
⚠️ 결제 실패 → 정리 작업 필요

시나리오:
├─ 사진 복제 완료 ✅
├─ 결제 페이지 → 사용자 나감
├─ 세마포어 30분 후 자동 해제
├─ 복제본도 30분 후 자동 삭제
│
문제: 사용자가 1시간 후 돌아오면?
├─ 복제본 없음 (이미 삭제됨)
├─ 다시 복제해야 함
└─ ⚠️ 사용자 만족도 ↓

해결책:
├─ 1단계: 세마포어 자동 해제 30분
├─ 2단계: 복제본 유지 기간 연장 (7일?)
├─ 3단계: 자동 정리 Cron Job (7일 후)
├─ 4단계: 사용자 알림 (복제본 7일 보관)
└─ 결론: 명시적 정리 전략 필요
```

### 5.3 동시성 제어 복잡도

```
⚠️ 세마포어 관리 = 추가 로직

관리해야 할 상태:
├─ ACTIVE (기본)
├─ COPYING_TO_ORDER (Lock)
├─ READONLY (결제 완료)
├─ ARCHIVED (오래된 사진)
└─ Timeout 처리

잠재적 버그:
├─ Lock 미해제 (결제 실패 처리 안 됨)
├─ Timeout 초과 (복제본 고아 상태)
├─ Race Condition (두 개의 Lock 요청)
├─ 롤백 실패 (부분 복제 완료 후 취소)
└─ ⚠️ 철저한 테스트 필수!
```

### 5.4 Cloud Function 비용

```
⚠️ 복제 작업 = 높은 CPU 사용

비용 분석 (Google Cloud Functions):
├─ 함수 호출: 주문당 1회 = 50건/월 = $0.40/월
├─ 실행 시간: 20초 × 50 = 1000초/월
│  ├─ 256MB: 1000초 × $0.0000041 = $0.0041 ≈ 무시
│  └─ 2GB: 1000초 × $0.000033 = $0.033 ≈ 무시
├─ 네트워크: S3 내 Copy = 비용 X (cross-region도 아니면)
└─ 총 함수 비용: ~$0.50/월

스토리지 비용 (S3):
├─ 저장: 25GB × $0.023/GB = $0.575/월
├─ 복제: 50건 × 500MB × $0.0037/1M operations = ~$0.09/월
└─ 총 스토리지 비용: ~$0.67/월

결론: 추가 비용은 무시할 수준 ✅
```

---

## 6. 구멍과 위험 시나리오

### 6.1 부분 복제 실패

```
❌ 시나리오: 복제 중 500장 중 400장 성공, 100장 실패

현재 처리:
├─ 400장 성공 → Order 생성
├─ 100장 실패 → 에러 반환
├─ 세마포어 해제
└─ 사용자: "뭔가 복제 안 되는데?"

문제:
├─ 부분 주문은 이상함 (400장만?)
├─ 주문 취소? 재시도?
└─ ⚠️ UX 복잡함

해결책:
1단계: All-or-Nothing 원칙
├─ 모든 사진 복제 성공해야만 주문 생성
├─ 하나라도 실패 → 전체 롤백
├─ 사용자에게 명확한 에러 메시지

2단계: 자동 재시도
├─ 실패한 사진: 재시도 로직
├─ 지수 백오프 (exponential backoff)
├─ 최대 3회 재시도

3단계: 부분 주문 지원 (고급)
├─ "400장으로 진행하시겠습니까?" 확인
├─ 사용자 선택권 제공
└─ 명시적 동의 필수
```

### 6.2 타임아웃 (30분 Lock Expiry)

```
❌ 시나리오: 사용자가 결제 페이지에서 45분 동안 대기

현재 처리:
├─ 복제 완료 → 세마포어 설정 (30분)
├─ 사용자: 결제 페이지에서 45분 웹서핑
├─ 30분 후: Lock 자동 해제!
├─ 사진함에서 사진 삭제 가능
├─ 결제 완료 시도 → ⚠️ 사진이 없는데?

문제:
├─ 세마포어 해제 후 사진 삭제되면?
├─ 또는 다른 주문으로 복제되면?
└─ ⚠️ 데이터 일관성 깨짐

해결책:
1단계: Lock Duration 재평가
├─ 30분은 너무 짧나?
├─ 1시간? 2시간?
└─ 트레이드오프: 길수록 좋음 (최대 24시간)

2단계: 사용자에게 알림
├─ "30분 내에 결제 완료 필요"
├─ 카운트다운 타이머 표시
├─ 남은 시간 알림

3단계: 결제 시도 시 재검증
├─ 결제 완료 전: 복제본 존재 확인
├─ 복제본 없으면 → 에러 + 재복제 옵션
└─ 안전장치

4단계: 세마포어 갱신
├─ 사용자가 아직 결제 페이지에 있으면
├─ 주기적으로 Lock Duration 연장
├─ 예: 5분마다 Lock 갱신
```

### 6.3 Race Condition: 동시 결제

```
❌ 시나리오: 같은 사진으로 두 개의 주문이 동시에 생성

경로 1:
├─ 주문1 시작
├─ 주문1 Lock 획득 (photo_001)
└─ 복제 중...

경로 2 (동시):
├─ 주문2 시작
├─ 주문2 Lock 획득 시도...
├─ ⚠️ Lock이 이미 있음 (주문1이 가지고 있음)
├─ 에러: "사진이 다른 주문에서 사용 중"
└─ 사용자: "뭔가 에러 났는데?"

현재 처리:
├─ 주문2 생성 실패
├─ 재시도 권장
└─ ⚠️ 사용자 혼란

더 나은 해결책:
1단계: 명확한 에러 메시지
├─ "이 사진은 다른 주문에서 진행 중입니다"
├─ "주문ID: order_001"
├─ "상태: 복제 진행 중 (예상 30초)"

2단계: 자동 재시도
├─ 클라이언트에서 자동 재시도
├─ 5초 후 다시 시도
├─ 지수 백오프 (5s, 10s, 20s)

3단계: 사진 선택 시 Lock 사전 확인
├─ 사진 선택 순간에 이미 Lock 상태 확인
├─ UI에서 미리 알림: "사용 중인 사진입니다"
└─ 사진 선택 불가로 처리

4단계: 디바운싱
├─ 주문 생성 버튼: 1회만 작동 (중복 클릭 방지)
├─ 클라이언트: 복제 중 버튼 비활성화
└─ 백엔드: 중복 주문 방지 로직
```

### 6.4 고아 복제본 (Orphaned Copies)

```
❌ 시나리오: 주문 문서는 삭제되었는데 order-storage는 남음

원인:
├─ 주문 생성 실패 후 부분 정리
├─ 데이터베이스 에러
├─ Cloud Function 타임아웃
├─ 잘못된 수동 삭제
└─ ⚠️ 고아 파일 누적

문제:
├─ S3에 쓸데없는 데이터 누적
├─ 불필요한 스토리지 비용
├─ 1년 후: 수십 GB (비용 낭비)

해결책:
1단계: 주문 삭제 시 자동 정리
├─ Order 문서 삭제 → copiedPhotos 모두 삭제
├─ Firestore Triggers (Cloud Functions)
├─ 예: onDelete → cleanupOrderStorage()
└─ 트랜잭션으로 원자성 보장

2단계: 정기적 고아 정리 (Cleanup Job)
├─ 매일 자정: S3 order-storage/ 스캔
├─ 대응하는 Order 문서 확인
├─ 없으면 → 삭제 대상 마크
├─ 7일 후 → 최종 삭제 (실수 복구 기간)
└─ Cron Job (Cloud Scheduler)

3단계: 모니터링 및 알림
├─ CloudWatch/Stackdriver 모니터링
├─ 예: "고아 파일 1GB 이상 감지"
├─ 알림 받기 → 수동 확인
└─ 임계값 설정 (월 100MB 이상)
```

### 6.5 복제 중 원본 수정

```
❌ 시나리오: 복제 중 사용자가 원본 사진 수정 (메타데이터)

경로:
├─ 복제 시작
├─ Worker 1: photo_001 복제 시작 (0s)
├─ Worker 2: photo_002 복제 시작 (0s)
├─ 사용자: photo_001의 메타데이터 수정 (2s) ← 동시에 발생!
├─ Worker 1: 복제 완료 (3s)
└─ ⚠️ 복제본 메타가 고를 수 있음 (수정 전 vs 후)

해결책:
1단계: Read-Only Lock 중 메타데이터 수정 차단
├─ Photo.status = "COPYING_TO_ORDER"
├─ 메타데이터 수정 요청 → 에러
├─ "사진이 주문에 사용 중입니다"

2단계: 이미지 데이터만 복제
├─ 메타데이터는 복제 안 함
├─ Order 문서에 스냅샷으로 저장
│ {
│   photoId: "photo_001",
│   originalUrl: "...",
│   metadata: { title, description, tags }  ← 스냅샷
│ }
├─ 이후 메타 수정되어도 영향 X
└─ ✅ 권장 방식

결론: 메타는 스냅샷, 이미지는 복제
```

### 6.6 스토리지 용량 부족

```
❌ 시나리오: S3 버킷 용량 한계 도달

상황:
├─ 프리즘 성장 중
├─ 월 신규 사용자 500명
├─ 평균 주문 300건
├─ 월 복제본: 150GB (이전 예상: 25GB)
└─ ⚠️ 스토리지 터짐!

해결책:
1단계: 파티셔닝 (Sharding)
├─ order-storage-2024 (연간 파티션)
├─ order-storage/2024-Q1/ (분기별)
├─ order-storage/{userId}/ (사용자별)
└─ 더 나음

2단계: 자동 아카이빙
├─ 결과 생성 후 → 결과로 이동 (reference만 남김)
├─ 30일 후 → 콜드 스토리지로 이동 (Glacier)
├─ 비용: $0.023/GB (S3) → $0.004/GB (Glacier)
└─ 비용 87% 절감!

3단계: 압축 및 최적화
├─ 복제본 이미지 압축 (Lossy)
├─ 보정에 필요한 해상도만 유지
├─ 예: 1000x1000px 이상 필요 없으면 압축
└─ 용량 50% 절감 가능

4단계: 용량 모니터링
├─ CloudWatch 알림
├─ "S3 버킷 80% 사용"
├─ 사전 대응 (스케일 계획)
└─ 예측: 월간 증가율 추적
```

---

## 7. 추천 구현 전략

### 7.1 즉시 도입 (Phase 2)

```
✅ 권장: Hybrid Strategy (Semaphore + On-Demand Copy)

프로세스:
1. 사진함: 자유로운 업로드/삭제
2. 주문 시: 세마포어 Lock (30분)
3. 사진 복제: Worker Pool (10-15개)
4. 복제 완료 후: 결제 페이지
5. 결제 완료: Lock 해제 + Photo.status = "READONLY"
6. 결제 실패: Lock 해제 + 복제본 삭제

장점:
├─ 구현 간단 (현재 기반에서 추가)
├─ 성능 우수 (2-40초 이내)
├─ 데이터 안전 (100% 격리)
├─ 사용자 만족 (자유로운 관리)
└─ 비용 효율적 (추가 $200-300/월)

단점:
├─ 복제 시간 (500장 25초)
├─ 세마포어 관리 복잡도
└─ 모니터링 필요

구현 시간: 5-7일
```

### 7.2 개선사항 (Phase 2.5)

```
📈 개선: 비동기 복제 + 백그라운드 Processing

프로세스:
1. 주문 생성 요청
2. 즉시 Order 문서 생성 (상태: PENDING_COPY)
3. 복제 작업을 Job Queue에 푸시 (비동기)
4. 사용자: 결제 페이지로 즉시 이동 ← ⭐ 빠름!
5. 백그라운드: 복제 진행
6. 복제 완료: 상태 업데이트 (READY_FOR_PAYMENT)
7. 결제: 정상 진행
8. 결제 실패: 복제본 정리

장점:
├─ 사용자: 즉시 결제 페이지 (0초!)
├─ 백그라운드 처리 (사용자 블로킹 X)
├─ 높은 동시성 가능
└─ 우수한 UX

단점:
├─ 복잡한 상태 관리
├─ Job Queue 필요 (Firestore Tasks, Bull.js, etc.)
├─ 모니터링 필수
└─ 구현 복잡도 중상

구현 시간: 3-5일 (추가)
```

### 7.3 장기 전략 (Phase 3)

```
🚀 고급: Smart Caching + CDN + Prefetch

프로세스:
1. 사진 업로드 시: CDN 프리프리페치 시작
2. 주문 생성: 이미 캐시된 데이터 복제 (매우 빠름)
3. 복제: ~1초 (네트워크 비용 X)
4. 결제: 즉시
5. 보정: CloudFront에서 스트리밍

장점:
├─ 극도로 빠른 복제 (<1초)
├─ 높은 동시성 (무한)
├─ 최적 성능
└─ 전문적 인프라

단점:
├─ 복잡한 설계
├─ CDN 비용 추가 ($100-500/월)
├─ 관리 복잡도 높음
└─ 구현 어려움

구현 시간: 2-3주 (대규모 프로젝트)
```

---

## 8. 최종 권장사항

### 도입 계획

| 항목 | Phase 2 (즉시) | Phase 2.5 (개선) | Phase 3 (고급) |
|------|----------------|-----------------|----------------|
| **복제 시기** | 동기 (사용자 대기) | 비동기 (백그라운드) | 프리페치 (미리) |
| **복제 시간** | 2-40초 | 백그라운드 | <1초 |
| **사용자 경험** | 프로그레스 바 | 즉시 결제 | 완벽함 |
| **구현 시간** | 5-7일 | +3-5일 | +2-3주 |
| **추가 비용** | ~$200/월 | +$50/월 | +$200-500/월 |
| **권장 시점** | 지금! | 사용자 100명+ | 사용자 1000명+ |

### 결론

```
✅ 도입 권장: YES

전략: Hybrid (Semaphore + On-Demand Copy)

이유:
1. 데이터 안전성: 100% 보장
2. 사용자 자유도: 사진함 마음껏 사용 가능
3. 구현 복잡도: 관리 가능 수준
4. 성능: 충분히 빠름 (2-40초)
5. 비용: 정당한 투자 (~$200/월)

최종 선택:
├─ Phase 2: Semaphore + Sync Copy (이번에!)
├─ Phase 2.5: Async Copy (사용자 100명 기준)
└─ Phase 3: Smart Caching (사용자 1000명 기준)

구현 순서:
1단계: 기본 구조 (Semaphore 상태 관리)
2단계: 복제 로직 (S3 CopyObject)
3단계: 결제 연동 (Lock/Unlock)
4단계: 정리 로직 (Timeout, Orphan Cleanup)
5단계: 테스트 (10장, 100장, 500장, 1000장)
```

---

## 9. 구현 체크리스트

```
Phase 2 구현 (Semaphore + On-Demand Copy)

[ ] 1. Photo 컬렉션 스키마 업데이트
    [ ] status: "ACTIVE" | "COPYING_TO_ORDER" | "READONLY" | ...
    [ ] lockedByOrder: orderId (참조)
    [ ] lockExpiry: timestamp
    [ ] lockedAt: timestamp

[ ] 2. Order 컬렉션 스키마 업데이트
    [ ] copyStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED"
    [ ] copiedPhotos: [{ photoId, copiedUrl, fileSize, copiedAt }]
    [ ] copyProgress: { total, completed, failed }
    [ ] copyStartTime, copyEndTime

[ ] 3. 세마포어 함수 구현
    [ ] acquirePhotosLock()
    [ ] releasePhotosLock()
    [ ] validatePhotoLock()
    [ ] handleLockTimeout()

[ ] 4. 복제 함수 구현
    [ ] copyPhotoToOrderStorage()
    [ ] createOrderWithCopy()
    [ ] Worker Pool 설정

[ ] 5. 결제 함수 업데이트
    [ ] confirmPayment() - Photo.status = "READONLY"
    [ ] handlePaymentFailure() - cleanup

[ ] 6. 정리 함수 구현
    [ ] cleanupOrderStorage()
    [ ] handleLockTimeout() Cron
    [ ] handleOrphanedCopies() Cron

[ ] 7. 에러 처리
    [ ] Partial Failure (All-or-Nothing)
    [ ] Timeout Handling
    [ ] Race Condition (Lock 충돌)
    [ ] S3 API Errors

[ ] 8. 모니터링 및 로깅
    [ ] Copy 시간 추적
    [ ] Lock 충돌 모니터링
    [ ] 고아 파일 감지
    [ ] Timeout 발생 로그

[ ] 9. 테스트
    [ ] Unit: acquirePhotosLock, releasePhotosLock
    [ ] Integration: createOrderWithCopy (10, 100, 500장)
    [ ] E2E: 전체 주문 흐름 (결제 완료, 실패, 타임아웃)
    [ ] Load: 동시 100개 주문 생성

[ ] 10. 문서화
    [ ] 아키텍처 설계 문서
    [ ] API 문서 (createOrderWithCopy, confirmPayment)
    [ ] 운영 가이드 (Cleanup, Monitoring)
    [ ] 트러블슈팅 가이드
```
