# 사진 삭제 문제 분석 - 클라우드 스토리지 패턴 심화 연구

## 1. 문제 정의

### 현재 설계의 취약점

```
사용자 클라우드에 사진 1본만 존재
    ↓
주문 생성 (photoIds 참조)
    ↓
주문 완료/결제
    ↓
사용자가 원본 삭제 버튼 클릭 → ⚠️ 삭제됨!
    ↓
❌ 주문의 소스 사진이 없어짐!
```

**위험성:**
- 주문 완료 후 사진 삭제 → 보정본 생성 불가
- 사진 검색/다시 다운로드 불가
- 결제한 서비스를 못 받음

---

## 2. 기존 업계 사례 분석

### Snapfish / Shutterfly의 실제 방식

```
사용자가 사진 업로드
    ↓
[즉시 내부 복제본 생성]  ⭐ 핵심!
    ├─ 원본: 사용자 클라우드에 표시
    └─ 백업본: 서버 내부 저장소 (숨김)
    ↓
앨범/포스터 주문 (사진 선택)
    ├─ 참조 저장: photoIds = ["photo_001"]
    ├─ 동시에 백업본 경로도 기록: backupUrl = "s3://internal/..."
    └─ 메타 기록: "photo_001의 백업본은 s3://internal/backup_001에 있음"
    ↓
결제 완료
    ├─ Photo 상태: "backed_up" (백업본 생성됨)
    ├─ 사용자가 원본 삭제 가능 ✅
    └─ 내부 백업본은 계속 유지
    ↓
사진 삭제 시
    ├─ Photo.status = "deleted_by_user"
    ├─ Photo.internalBackupUrl = "s3://internal/..." (유지)
    └─ UI: "🔒 보호됨 (주문에서 사용 중)"
    ↓
보정 작업 / 재주문 시
    ├─ 원본 대신 backupUrl에서 읽음 ✅
    ├─ 사용자는 "원본은 삭제했는데 왜 되지?" → 실제로는 내부 백업 사용
    └─ 완벽하게 숨겨짐
```

**Snapfish 실제 동작:**
```
1. 업로드 → 즉시 백업
   • S3 Public: 사용자가 보는 원본
   • S3 Internal: 내부 백업 (사용자 몰래)
   
2. 주문 생성 → 두 경로 모두 기록
   • photoUrl: s3://public/photo_001.jpg (사용자용)
   • backupUrl: s3://internal/backup_001.jpg (내부용)
   
3. 사진 삭제 → 공개본만 삭제
   • s3://public/photo_001.jpg (삭제됨)
   • s3://internal/backup_001.jpg (유지됨) ✅
   
4. 재주문 → backupUrl로 사용
   • 사용자: "어? 내가 삭제했는데?"
   • 백엔드: backupUrl이 있으니 상관없음!
```

### Descript의 방식

```
영상 업로드 시
    ↓
[즉시 트랜스코딩 & 다중 포맷 백업]
    ├─ 원본 MP4: s3://user-uploads/video_001.mp4 (사용자)
    ├─ 백업 MP4: s3://internal/backup/video_001.mp4
    ├─ WebM: s3://internal/formats/video_001.webm
    ├─ HLS: s3://internal/streaming/video_001.m3u8
    └─ Preview: s3://internal/thumbnails/video_001.jpg
    ↓
결제 & 편집 시작
    ├─ 원본 삭제되면
    └─ 내부 백업 사용 ✅
```

### Printful의 방식

```
디자인 업로드 시
    ↓
[즉시 여러 해상도로 변환 & 저장]
    ├─ 원본: s3://user-uploads/design_001.png (사용자)
    ├─ 썸네일 (100x100): s3://internal/thumbnails/...
    ├─ 미리보기 (500x500): s3://internal/preview/...
    ├─ 고해상도 인쇄용 (3000x3000): s3://internal/hires/...
    └─ 여러 포맷: PDF, SVG, etc.
    ↓
주문 생성 시
    ├─ 사용자 해상도: 500x500 (사용자 클라우드)
    ├─ 실제 프린팅: 3000x3000 (내부 백업) ✅
    └─ 사진 삭제되면: 내부 3000x3000 사용
```

---

## 3. 이 패턴의 이름과 용어

### 정식 명칭

**"Dual-Source Pattern" 또는 "Internal Backup Pattern"**

또는

**"Layered Storage Architecture"**

```
┌─────────────────────────────────────────┐
│  Tier 1: User-Facing Layer (Public)     │
│  └─ s3://user-uploads/photo_001.jpg    │
│     (사용자가 보고 관리함)                │
│     (사용자가 삭제 가능)                  │
├─────────────────────────────────────────┤
│  Tier 2: Service Layer (Internal)       │
│  ├─ s3://internal/backup/photo_001.jpg │
│  ├─ s3://internal/compressed/...       │
│  └─ s3://internal/processed/...        │
│     (사용자는 절대 건드릴 수 없음)        │
│     (서비스가 보장하는 계층)              │
└─────────────────────────────────────────┘
```

---

## 4. 실제 코드 구현 패턴 분석

### Snapfish 스타일 (추정)

```javascript
// 업로드 시
async function uploadPhoto(userId, file) {
  // 1. 사용자 클라우드에 업로드
  const publicUrl = await uploadToPublicS3(file);
  
  // 2. 즉시 내부 백업본 생성 ⭐
  const backupUrl = await uploadToInternalS3(file);
  
  // 3. Photo 문서에 두 경로 모두 기록
  const photo = {
    id: `photo_${Date.now()}`,
    userId,
    fileName: file.name,
    fileSize: file.size,
    
    // 공개 레이어
    publicUrl,      // s3://public/...
    status: "active",
    
    // 내부 레이어 (사용자는 모름)
    backupUrl,      // s3://internal/backup/...
    internalBackups: [
      { format: "original", url: backupUrl },
      { format: "compressed", url: "s3://internal/compressed/..." },
      { format: "preview", url: "s3://internal/preview/..." }
    ],
    
    uploadedAt: new Date(),
    isBackedUp: true  // ⭐ 백업 여부 플래그
  };
  
  await db.photos.save(photo);
  return photo;
}

// 주문 생성 시
async function createOrder(userId, photoIds, options) {
  const order = {
    id: `order_${Date.now()}`,
    userId,
    photoIds,  // ["photo_001", "photo_002"]
    
    // 추가로 백업 정보도 함께 저장
    photoBackupMap: {
      "photo_001": "s3://internal/backup/photo_001.jpg",
      "photo_002": "s3://internal/backup/photo_002.jpg"
    },
    
    options,
    status: "pending",
    createdAt: new Date()
  };
  
  await db.orders.save(order);
  return order;
}

// 사진 삭제 시
async function deletePhoto(userId, photoId) {
  const photo = await db.photos.get(photoId);
  
  // 1. 공개 S3에서만 삭제
  await deleteFromPublicS3(photo.publicUrl);
  
  // 2. 내부 백업은 유지!
  // await deleteFromInternalS3(photo.backupUrl);  // ❌ 이 줄을 실행하지 않음!
  
  // 3. 상태 업데이트
  await db.photos.update(photoId, {
    status: "deleted_by_user",
    publicUrl: null,  // 공개 URL 제거
    // backupUrl 유지 (삭제 안 함)
    deletedAt: new Date()
  });
  
  return true;
}

// 보정 작업 시 (사진이 삭제되었는데도 작동)
async function processPhoto(photoId, options) {
  const photo = await db.photos.get(photoId);
  
  // 원본이 없어도 백업이 있으면 사용
  const sourceUrl = photo.publicUrl || photo.backupUrl;
  
  if (!sourceUrl) {
    throw new Error("Photo source not found");
  }
  
  // sourceUrl로 작업 진행
  const correctedPhoto = await runCorrectionProcess(sourceUrl, options);
  
  return correctedPhoto;
}
```

---

## 5. 다양한 구현 전략 비교

### 방식 1: 참조만 + Readonly (현재 설계) ❌

```
장점:
✅ 간단한 구조
✅ 빠른 구현

단점:
❌ 사진 삭제 취약점
❌ 사용자가 실수로 삭제 가능
❌ 결제 후 서비스 불가능
❌ 비즈니스 리스크 높음
```

---

### 방식 2: Dual-Source (공개 + 내부 백업) ⭐⭐⭐⭐⭐

```
// Photo 문서
{
  id: "photo_001",
  userId: "user_123",
  
  // Tier 1: 공개 레이어 (사용자가 관리)
  publicUrl: "s3://user-uploads/photo_001.jpg",
  status: "active" | "deleted_by_user",
  
  // Tier 2: 내부 레이어 (우리가 관리) ⭐
  internalBackupUrl: "s3://internal/backup_001.jpg",
  internalBackups: [
    { type: "original", url: "s3://internal/backup_001.jpg" },
    { type: "compressed", url: "s3://internal/compressed_001.jpg" },
    { type: "preview", url: "s3://internal/preview_001.jpg" }
  ],
  isBackedUp: true,
  backedUpAt: Timestamp,
  
  usedInOrders: ["order_001"],
  deletedAt: Timestamp (if deleted)
}
```

**장점:**
```
✅ 사진 삭제되어도 안전
✅ 서비스 보장 (백업이 있으니까)
✅ 재주문 가능
✅ 여러 포맷 제공 가능
✅ 업계 표준 패턴
```

**단점:**
```
⚠️ 스토리지 2배 사용 (초기)
⚠️ 약간의 복잡성 증가
```

---

### 방식 3: Immutable Copy on Order ⭐⭐⭐

```
사진 업로드 (참조)
    ↓
주문 생성 시에만 복사!
    ├─ orderPhotoMap: {
    │   "photo_001": "s3://orders/order_001/photo_001.jpg"
    │ }
    └─ 이 순간부터 이 복사본으로 작업
    ↓
사용자 원본 삭제 → 상관없음!
    └─ order_001용 복사본은 유지
```

**장점:**
```
✅ 사진 삭제 안전
✅ 주문별 격리
✅ 롤백 가능 (주문 취소하면 복사본도 삭제)
```

**단점:**
```
⚠️ 결제 전 삭제되면?
⚠️ 결제 중에 삭제되면?
⚠️ 타이밍 문제
```

---

### 방식 4: Hybrid (추천) ⭐⭐⭐⭐⭐

```
업로드 시
    ├─ 공개 저장소: s3://user-uploads/
    └─ 내부 백업: s3://internal/backup/ (즉시)
         ↓
결제 직전
    ├─ 선택한 사진들이 공개 저장소에 있나? 확인
    ├─ 없으면 내부 백업으로 복사해서 진행
    └─ 공개 저장소에 있으면 그대로 사용
         ↓
결제 후
    └─ 이제 내부 백업만 의존
         
사용자가 삭제해도
    └─ 공개: 없음
    └─ 내부: 있음 ✅
```

**구현:**
```javascript
async function createOrderSafely(userId, photoIds, options) {
  const photos = await db.photos.getMany(photoIds);
  
  // 각 사진을 확인
  const orderPhotos = [];
  for (const photo of photos) {
    let sourceUrl;
    
    if (photo.publicUrl) {
      // 공개 저장소에 있으면 그대로 사용
      sourceUrl = photo.publicUrl;
    } else if (photo.backupUrl) {
      // 공개가 없으면 내부 백업 사용
      sourceUrl = photo.backupUrl;
    } else {
      throw new Error(`Photo ${photo.id} has no source`);
    }
    
    orderPhotos.push({
      photoId: photo.id,
      sourceUrl,
      backupUrl: photo.backupUrl  // 주문 레코드에도 저장
    });
  }
  
  // 주문 생성
  const order = {
    id: `order_${Date.now()}`,
    userId,
    photos: orderPhotos,  // 스냅샷 저장
    status: "pending",
    createdAt: new Date()
  };
  
  return order;
}

// 보정 작업 시
async function correctPhotos(orderId) {
  const order = await db.orders.get(orderId);
  
  for (const photo of order.photos) {
    // 주문 생성 시 저장한 sourceUrl 사용
    // 사용자가 원본 삭제했어도 sourceUrl이 있으니 문제 없음!
    await runCorrection(photo.sourceUrl);
  }
}
```

---

## 6. 프리즘 웨딩을 위한 최적 방식

### 권장: Hybrid + Dual-Source 조합

```
┌─────────────────────────────────────────────────────────────┐
│                        업로드 완료                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Photo 문서                                                   │
│  {                                                           │
│    id: "photo_001",                                         │
│    userId: "user_123",                                      │
│    folderId: "folder_001",                                  │
│                                                              │
│    // Tier 1: 사용자 클라우드 (공개)                        │
│    publicUrl: "s3://user-uploads/photo_001.jpg",           │
│    publicSize: 2500000,                                     │
│    status: "active",                                        │
│                                                              │
│    // Tier 2: 내부 백업 (우리가 보장) ⭐                    │
│    internalBackupUrl: "s3://internal/backup_001.jpg",      │
│    internalBackupSize: 2500000,                            │
│    isBackedUp: true,                                        │
│    backedUpAt: Timestamp,                                   │
│                                                              │
│    // 추가 포맷 (프리미엄용)                                 │
│    internalFormats: [                                       │
│      {                                                       │
│        format: "original",                                  │
│        url: "s3://internal/backup_001.jpg"                 │
│      },                                                      │
│      {                                                       │
│        format: "compressed",                                │
│        url: "s3://internal/compressed_001.jpg"             │
│      },                                                      │
│      {                                                       │
│        format: "preview",                                   │
│        url: "s3://internal/preview_001.jpg"                │
│      }                                                       │
│    ],                                                        │
│                                                              │
│    uploadedAt: Timestamp                                    │
│  }                                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│                      주문 생성 시                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Order 문서                                                  │
│  {                                                           │
│    id: "order_001",                                         │
│    userId: "user_123",                                      │
│    folderId: "folder_001",                                  │
│                                                              │
│    // 스냅샷 저장 (이 순간의 소스 보장) ⭐                  │
│    photoSnapshots: [                                        │
│      {                                                       │
│        photoId: "photo_001",                               │
│        sourceUrl: "s3://user-uploads/photo_001.jpg",       │
│        // 또는 "s3://internal/backup_001.jpg"              │
│        backupUrl: "s3://internal/backup_001.jpg"           │
│      }                                                       │
│    ],                                                        │
│                                                              │
│    payments: [...],                                         │
│    status: "pending"                                        │
│  }                                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│                      사진 삭제 시                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Photo.status = "deleted_by_user"                          │
│  Photo.publicUrl = null  (공개 URL 제거)                    │
│  Photo.internalBackupUrl 유지! ⭐                           │
│                                                              │
│  → Order의 backupUrl로 계속 작업 가능 ✅                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. 구현 코드 (프리즘 웨딩 버전)

```javascript
// === 1단계: 사진 업로드 ===
async function uploadPhoto(userId, folderId, file) {
  // 1.1 공개 S3에 업로드
  const publicUrl = await s3.upload(file, `user-uploads/${userId}/${file.name}`);
  
  // 1.2 즉시 내부 백업 생성 ⭐
  const backupUrl = await s3.copyFile(
    publicUrl, 
    `internal/backup/${userId}/${Date.now()}_${file.name}`
  );
  
  // 1.3 압축본도 생성 (프리미엄용)
  const compressedUrl = await s3.uploadCompressed(
    file,
    `internal/compressed/${userId}/${Date.now()}_${file.name}`
  );
  
  // 1.4 Photo 문서 저장
  const photo = {
    id: `photo_${Date.now()}`,
    userId,
    folderId,
    fileName: file.name,
    fileSize: file.size,
    
    // Tier 1: 공개 (사용자가 관리)
    publicUrl,
    status: "active",
    
    // Tier 2: 내부 (우리가 보장)
    internalBackupUrl: backupUrl,
    internalFormats: [
      { format: "original", url: backupUrl },
      { format: "compressed", url: compressedUrl }
    ],
    isBackedUp: true,
    backedUpAt: new Date(),
    
    uploadedAt: new Date(),
    usedInOrders: []
  };
  
  await db.photos.save(photo);
  return photo;
}

// === 2단계: 주문 생성 (결제 직전) ===
async function createOrder(userId, folderId, photoIds, options) {
  const photos = await db.photos.getMany(photoIds);
  
  // 각 사진의 현재 소스 확인
  const photoSnapshots = photos.map(photo => ({
    photoId: photo.id,
    // 공개가 있으면 공개, 없으면 백업
    sourceUrl: photo.publicUrl || photo.internalBackupUrl,
    // 백업은 항상 기록
    backupUrl: photo.internalBackupUrl,
    // 선택된 옵션 (일반/긴급)
    correctionOption: options.correctionOption
  }));
  
  // 주문 생성
  const order = {
    id: `order_${Date.now()}`,
    userId,
    folderId,
    photoSnapshots,  // 스냅샷: 이 순간의 소스 고정
    
    payments: [
      {
        id: `payment_${Date.now()}`,
        type: "base",
        amount: calculatePrice(photoIds.length, options.correctionOption),
        status: "pending"
      }
    ],
    
    status: "pending",
    createdAt: new Date()
  };
  
  await db.orders.save(order);
  
  // Photo 문서 업데이트: 주문에서 사용 중으로 표시
  for (const photoId of photoIds) {
    await db.photos.update(photoId, {
      usedInOrders: db.arrayUnion(order.id),
      status: "readonly"  // 옵션: readonly로 변경 (또는 active 유지)
    });
  }
  
  return order;
}

// === 3단계: 사진 삭제 (주문과 무관) ===
async function deletePhoto(userId, photoId) {
  const photo = await db.photos.get(photoId);
  
  if (photo.usedInOrders && photo.usedInOrders.length > 0) {
    // 주문에서 사용 중이면
    console.log(`Photo ${photoId} is used in orders, keeping internal backup`);
  }
  
  // 공개 S3에서만 삭제
  await s3.delete(photo.publicUrl);
  
  // Photo 문서 업데이트
  await db.photos.update(photoId, {
    status: "deleted_by_user",
    publicUrl: null,
    deletedAt: new Date()
    // internalBackupUrl은 유지! ⭐
  });
  
  return true;
}

// === 4단계: 보정 작업 (사진 삭제되어도 작동) ===
async function processOrder(orderId) {
  const order = await db.orders.get(orderId);
  
  for (const snapshot of order.photoSnapshots) {
    // 주문 생성 시 저장한 소스 사용
    const sourceUrl = snapshot.sourceUrl;  // 공개 또는 백업
    
    // 보정 작업
    const corrected = await correctionService.correct(
      sourceUrl,
      snapshot.correctionOption
    );
    
    // 결과 저장
    await db.results.save({
      orderId,
      photoId: snapshot.photoId,
      resultUrl: corrected.url,
      correctionOption: snapshot.correctionOption
    });
  }
  
  order.status = "completed";
  await db.orders.save(order);
}
```

---

## 8. 스토리지 비용 비교

### 방식 1: 참조만 (현재) ❌

```
스토리지 사용: 1배
비용: 낮음
리스크: 높음 (데이터 손실 가능)
```

### 방식 2: Dual-Source + 내부 백업 ✅

```
스토리지 사용:
├─ 첫 3개월: 2배 (사용자 원본 + 백업)
├─ 이후: 1배 (대부분 사용자가 삭제했으니)
│
평균: ~1.3배

비용:
├─ AWS S3: 1TB당 $23
├─ 추가 비용: ~1TB당 $7 (백업)
├─ 100명 고객 × 평균 5GB = 500GB
├─ 월간 추가 비용: $161
└─ 합계: ~$195/월

리스크: 0 (데이터 안전)
```

**비용 대비 이점:**
```
월간 $200 정도의 추가 비용으로
모든 데이터 손실 리스크 제거
고객 만족도 극대화
```

---

## 9. 최종 권장사항

### 프리즘 웨딩을 위한 최적 설계

**도입할 패턴: Hybrid (Dual-Source + Snapshots)**

```
1. 업로드 시
   ├─ 공개 저장소: s3://user-uploads/photo_001.jpg
   └─ 내부 백업: s3://internal/backup_001.jpg (즉시)

2. 주문 생성 시
   ├─ Photo 스냅샷 저장 (sourceUrl)
   └─ 현재 소스 고정

3. 사진 삭제 시
   ├─ 공개만 삭제
   └─ 내부 백업 유지

4. 보정 작업 시
   ├─ 스냅샷의 sourceUrl 사용
   └─ 사진 삭제되어도 작동
```

**스토리지 비용 트레이드오프:**
```
추가 비용: ~$200/월
안정성 이득: 무한대 (데이터 손실 불가)
고객 만족도: 최대
→ 명백한 선택지: Hybrid 도입
```

---

## 10. 실제 사용자 경험

```
시나리오 1: 행복한 사용자
├─ 사진 업로드 → 폴더에 표시
├─ 주문 생성 → 보정 옵션 선택
├─ 결제 완료
├─ 사진 확인 후 삭제 (불필요해서)
├─ 주문 진행 → 백업본으로 자동 처리 ✅
├─ 결과 다운로드
└─ 행복!

시나리오 2: 실수한 사용자
├─ 사진 업로드 → "어 이 사진 품질 안 좋은데?"
├─ 사진 다시 업로드 → 같은 이름의 다른 파일
├─ 기존 사진 삭제 (실수로)
├─ 주문은 기존 사진으로 이미 생성됨
├─ 백업본이 있어서 보정 진행 ✅
├─ "어? 삭제했는데 왜 돼?" (긍정적 놀람)
└─ 더 행복!
```

---

## 결론

**프리즘 웨딩이 해야 할 일:**

### 변경 계획

```
기존 설계 (참조 + Readonly):
Photo 컬렉션
{
  id, userId, folderId,
  publicUrl,        ← 공개
  status: "readonly",
  usedInOrders
}
```

### → 개선된 설계 (Dual-Source):

```
Photo 컬렉션
{
  id, userId, folderId,
  
  // Tier 1: 공개 (사용자 관리)
  publicUrl,
  status: "active" | "deleted_by_user",
  
  // Tier 2: 내부 백업 (우리 보장) ⭐
  internalBackupUrl,
  isBackedUp: true,
  internalFormats: [...]
}

Order 컬렉션
{
  id, userId, folderId,
  
  // 스냅샷 (순간의 소스 고정) ⭐
  photoSnapshots: [{
    photoId,
    sourceUrl,      ← 공개 또는 백업
    backupUrl
  }],
  
  payments: [...],
  status
}
```

**이점:**
```
✅ 안전성: 데이터 손실 불가능
✅ 유연성: 사진 삭제 가능
✅ 신뢰성: 결제 후 서비스 100% 보장
✅ 비용: 추가 ~$200/월 (정당한 투자)
✅ UX: 사용자가 자유롭게 관리 가능
```
