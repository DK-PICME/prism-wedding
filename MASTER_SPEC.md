# Phase 2 마스터 스펙 — 단일 진실의 원천 (Single Source of Truth)

> **버전**: v1.0 | **최종 확정**: 2026-03-09
> **이 문서가 Phase 2의 유일한 설계 기준입니다.**
> 기존 설계 문서들은 `docs/archive/`로 이동되었습니다.

---

## 목차

1. [아키텍처 결정 요약](#1-아키텍처-결정-요약)
2. [Firestore 데이터 모델](#2-firestore-데이터-모델)
3. [Photo 상태 머신](#3-photo-상태-머신)
4. [가격 모델 (Remote Config)](#4-가격-모델-remote-config)
5. [전체 사용자 플로우](#5-전체-사용자-플로우)
6. [Cloud Function 명세](#6-cloud-function-명세)
7. [프론트엔드 컴포넌트 명세](#7-프론트엔드-컴포넌트-명세)
8. [에러 처리 전략](#8-에러-처리-전략)
9. [구현 체크리스트](#9-구현-체크리스트)
10. [향후 계획 (TODO)](#10-향후-계획-todo)

---

## 1. 아키텍처 결정 요약

### 1.1 핵심 결정사항

| 항목 | 결정 | 이유 |
|------|------|------|
| **Order : Payment 관계** | 1 : N | 긴급보정 등 추가 결제 가능성 |
| **사진 처리 방식** | 업로드 시 필터링/변환 + 내부 백업 | 업로드 CF에서 처리 완료, 주문은 photoIds 참조만 |
| **복제 트리거** | (삭제됨) | 업로드 시 이미 백업 완료되어 주문 시 별도 복제 불필요 |
| **업로드 처리** | Event-Driven (Firebase Storage → CF) | 비동기, 확장성, UX 우수 |
| **가격 테이블** | Firebase Remote Config + 로컬 기본값 | A/B 테스트 가능, 배포 없이 가격 변경 |
| **PENDING 상태** | 프론트 로컬 상태만 (Firestore 저장 안 함) | 불필요한 고아 문서 방지 |
| **isLocked (잠금)** | **[Phase 3로 연기]** | 구조 확정 전까지 구현 유예 (TODO) |

### 1.2 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                      프론트엔드 (React)                          │
│  PhotoManagementPage → CreateNewOrderPage → OrderDetailsPage    │
│                              → PaymentPage                      │
└────────────────────┬────────────────────────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │    Firebase Backend      │
        ├─────────────────────────┤
        │ Auth    │ Firestore      │
        │ Storage │ Cloud Func     │
        │ Remote Config (가격)    │
        └─────────────────────────┘

[업로드 파이프라인]
파일 선택 → Storage 업로드 → Storage Event → CF: processUploadedPhoto()
                                                    ├─ 썸네일 생성
                                                    ├─ 내부 백업 복제 (즉시 수행)
                                                    ├─ 미리보기/WebP 생성
                                                    └─ Photo.status = READY

[주문 파이프라인]
주문 생성 → Firestore Write → OrderDetailsPage (견적 확인) → PaymentPage (결제)
                                            └─ 주문은 READY 사진을 photoIds로 참조만 함
```

---

## 2. Firestore 데이터 모델

### 2.1 컬렉션 구조

```
users/{uid}
folders/{folderId}
photos/{photoId}
orders/{orderId}
payments/{paymentId}
```

### 2.2 Folder 컬렉션

```typescript
interface Folder {
  id: string;                    // Firestore auto-ID
  userId: string;                // 소유자 UID
  name: string;                  // 폴더명 (예: "2025년 1월 웨딩")
  photoCount: number;            // 사진 수 (캐시)
  totalSize: number;             // 총 파일 크기 bytes (캐시)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.3 Photo 컬렉션

```typescript
interface Photo {
  id: string;                    // Firestore auto-ID (nanoid 기반)
  userId: string;
  folderId: string;

  // ── 파일 정보 ──
  fileName: string;              // 원본 파일명
  fileSize: number;              // bytes
  fileExt: string;               // 'jpg' | 'jpeg' | 'png' | 'webp'
  fileMd5: string;               // 무결성 검증

  // ── 상태 (7가지, 아래 섹션 참조) ──
  status: PhotoStatus;

  // ── 주문 연계 (READY 상태에서 사용) ──
  isLocked: boolean;             // [TODO: Deferred] 주문에 사용 중 여부 (삭제 방지용)
  lockedByOrder: string | null;  // [TODO: Deferred] 잠근 주문 ID
  lockExpiry: Timestamp | null;  // [TODO: Deferred] 잠금 만료 시각
  usedInOrders: string[];        // 이 사진을 사용한 주문 ID 목록 (이력)

  // ── 업로드 단계 ──
  uploadStartTime: Timestamp | null;
  uploadEndTime: Timestamp | null;
  uploadProgress: number;        // 0-100 (프론트 업데이트)
  uploadError: string | null;
  uploadAttempt: number;         // 재시도 횟수 (최대 3)

  // ── 처리 단계 ──
  processStartTime: Timestamp | null;
  processEndTime: Timestamp | null;
  processingError: string | null;
  processingAttempt: number;     // 재시도 횟수 (최대 2)

  // ── 생성된 파일 URL (READY 이후) ──
  uploadedUrl: string | null;    // 원본: gs://bucket/user-uploads/...
  thumbnailUrl: string | null;   // 100x100px
  previewUrl: string | null;     // 500x500px
  webpUrl: string | null;        // WebP 포맷
  internalBackupUrl: string | null; // 내부 백업본

  // ── 이미지 메타데이터 ──
  metadata: {
    width: number;
    height: number;
    format: string;
    colorspace: string;
    hasAlpha: boolean;
  } | null;

  // ── 자동 정리 ──
  autoDeleteScheduledAt: Timestamp | null; // 실패 시 자동 삭제 예정일

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

> **⚠️ 중요**: `photoId`는 반드시 Firestore `doc().id` 또는 `nanoid()`로 생성합니다.
> `Date.now()` 기반 ID는 동시 업로드 시 충돌 위험이 있어 **금지**합니다.

> **⚠️ 중요**: `PENDING` 상태는 Firestore에 저장하지 않습니다.
> 파일 선택 후 실제 업로드 시작(UPLOADING) 시점에 Firestore 문서를 생성합니다.

### 2.4 Order 컬렉션

```typescript
interface Order {
  id: string;
  userId: string;
  folderId: string;
  photoIds: string[];            // 선택된 사진 ID 목록 (참조)

  // ── 주문 정보 ──
  brideName: string;
  groomName: string;
  shootingType: 'wedding' | 'snap' | 'photobook' | 'other';
  location: string;
  notes: string;
  correctionOption: 'basic' | 'urgent';

  // ── 가격 정보 (주문 시점 스냅샷 — Remote Config 값 복사) ──
  priceSnapshot: {
    remoteConfigVersion: string; // Remote Config 버전 (A/B 테스트 추적용)
    baseUnitPrice: number;       // 장당 단가
    urgentOptionPrice: number;   // 긴급 옵션 추가금
    additionalRevisionPrice: number;
    vatRate: number;             // 0.1 = 10%
  };
  photoCount: number;
  basePrice: number;
  optionCost: number;
  discount: number;
  vatAmount: number;
  totalAmount: number;

  // ── 상태 (통일된 상태코드 — Phase 2부터 Phase 3까지) ──
  // Phase 2 활성 상태: READY_TO_PAY(10) → PAID(30) → CORRECTING(40) → DELIVERY_DONE(100) or CANCELLED(20)
  // Phase 3 추가 상태: WAITING_BANK_INPUT(25), PRINTING(50), BEFORE_DELIVERY(60), IN_DELIVERY(70)
  // 향후 액자, 앨범 등 제작 발송 단계 확장 가능
  status: 'READY_TO_PAY' | 'WAITING_BANK_INPUT' | 'PAID' | 'CORRECTING' | 'PRINTING' | 'BEFORE_DELIVERY' | 'IN_DELIVERY' | 'DELIVERY_DONE' | 'CANCELLED';

  // ※ copyStatus 관련 필드 제거됨
  // processUploadedPhoto()에서 이미 내부 백업 복제 완료.
  // Order는 photoIds로 READY 사진을 참조만 함.

  // ── 타임아웃 ──
  paymentDeadline: Timestamp;    // createdAt + 3600초 (1시간)

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.5 Payment 컬렉션

```typescript
interface Payment {
  id: string;
  orderId: string;
  userId: string;
  type: 'base' | 'option_urgent' | 'option_additional_revision';
  amount: number;
  method: 'card' | 'bank_transfer' | 'mobile';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId: string | null;  // PG사 거래 ID
  pgProvider: string | null;     // 'portone' | 'tosspayments' | 'mock'
  receiptUrl: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 3. Photo 상태 머신

### 3.1 상태 정의 (7가지 — 최종 확정)

| # | 상태 | 설명 | 담당 | 최종? |
|---|------|------|------|-------|
| 1 | `PENDING` | 파일 선택됨, 업로드 대기 | 프론트 로컬만 | ❌ (Firestore 저장 안 함) |
| 2 | `UPLOADING` | Storage 업로드 진행 중 | 프론트 + Storage | ❌ |
| 3 | `UPLOAD_COMPLETED` | Storage 저장 완료, CF 처리 대기 | Storage + Firestore | ❌ |
| 4 | `PROCESSING` | 썸네일/백업/미리보기 생성 중 | Cloud Function | ❌ |
| 5 | `READY` | ✅ 완전 완료, 주문 사용 가능 | Cloud Function | ✅ |
| 6 | `UPLOAD_FAILED` | ❌ 업로드 실패 | 프론트 | ✅ |
| 7 | `PROCESSING_FAILED` | ❌ CF 처리 실패 (원본은 안전) | Cloud Function | ✅ |

> **주문 연계 상태 표현**: 별도 상태 없이 `isLocked` + `lockedByOrder` 필드로 표현
> - 주문 생성 후 복제 중: `status = READY` + `isLocked = true` + `lockedByOrder = orderId`
> - 결제 완료 후: `status = READY` + `isLocked = false` + `usedInOrders = [orderId, ...]`

### 3.2 상태 전이 다이어그램

```
[프론트 로컬]
PENDING ──────────────────────────────────────────────────────────┐
  │ 업로드 버튼 클릭                                               │
  │ → Firestore 문서 생성 (status: UPLOADING)                     │
  ▼                                                               │
UPLOADING ──── 네트워크 에러 / 타임아웃(300s) ──► UPLOAD_FAILED   │
  │                                                  │            │
  │ Storage 업로드 100%                              │ 재시도(최대3회)
  ▼                                                  │            │
UPLOAD_COMPLETED                                     └────────────┘
  │ Storage Event → Cloud Function 자동 실행
  ▼
PROCESSING ──── CF 에러 / 타임아웃(180s) ──► PROCESSING_FAILED
  │                                              │
  │ 모든 처리 완료                               │ 재시도(최대2회)
  ▼                                              │
READY ✅ ◄─────────────────────────────────────┘
  │
  │ (주문 활용)
  └─ usedInOrders에 추가 / isLocked(향후) 적용
```

### 3.3 타임아웃 정책

| 상태 | 최대 지속시간 | 초과 시 전환 | 감시 방법 |
|------|-------------|------------|----------|
| `UPLOADING` | 300초 (5분) | `UPLOAD_FAILED` | 프론트 클라이언트 타임아웃 + Cloud Scheduler (Phase 3) |
| `PROCESSING` | 180초 (3분) | `PROCESSING_FAILED` | Cloud Scheduler (Phase 3) |

> **Phase 2에서의 타임아웃 처리**: Cloud Scheduler 없이 프론트에서 `uploadStartTime + 300초` 초과 시 UI에서 실패 처리. Firestore 상태 업데이트는 Cloud Scheduler 구현 후 서버 기준으로 전환.

### 3.4 재시도 정책

| 상태 | 최대 재시도 | 지수 백오프 | 초과 시 |
|------|-----------|------------|--------|
| `UPLOAD_FAILED` | 3회 | 1s → 2s → 4s | 재시도 버튼 비활성화, 삭제 권장 |
| `PROCESSING_FAILED` | 2회 | 2s → 5s | 재시도 버튼 비활성화 |

### 3.5 자동 정리 정책

| 상태 | 자동 삭제 시점 | 비고 |
|------|-------------|------|
| `UPLOAD_FAILED` | 7일 후 | S3 파일 + Firestore 문서 삭제 |
| `PROCESSING_FAILED` | 14일 후 | Firestore 문서만 삭제 (원본 S3 파일 유지) |

---

## 4. 가격 모델 (Remote Config)

### 4.1 전략

- **Firebase Remote Config**에서 가격 테이블을 관리
- 앱 시작 시 Remote Config 패치, 실패 시 **로컬 기본값** 사용
- A/B 테스트: Remote Config 조건부 값으로 그룹별 가격 실험 가능
- **주문 생성 시 현재 가격을 Order 문서에 스냅샷으로 저장** (과거 주문 가격 보존)

### 4.2 Remote Config 키 정의

```javascript
// Remote Config 키 (Firebase Console에서 설정)
const REMOTE_CONFIG_KEYS = {
  BASE_UNIT_PRICE: 'base_unit_price',           // 장당 기본 단가
  URGENT_OPTION_PRICE: 'urgent_option_price',   // 긴급 보정 추가금
  ADDITIONAL_REVISION_PRICE: 'additional_revision_price', // 추가 수정 요청금
  VAT_RATE: 'vat_rate',                         // 부가세율
};

// 로컬 기본값 (Remote Config 패치 실패 시 사용)
const DEFAULT_PRICE_CONFIG = {
  base_unit_price: 100000,          // 장당 100,000원
  urgent_option_price: 50000,       // 긴급 +50,000원
  additional_revision_price: 30000, // 추가 수정 +30,000원
  vat_rate: 0.1,                    // VAT 10%
};
```

### 4.3 가격 계산 로직

```javascript
function calculateOrderPrice(photoCount, correctionOption, remoteConfig) {
  const config = remoteConfig ?? DEFAULT_PRICE_CONFIG;

  const basePrice = photoCount * config.base_unit_price;
  const optionCost = correctionOption === 'urgent' ? config.urgent_option_price : 0;
  const subtotal = basePrice + optionCost;
  const vatAmount = Math.round(subtotal * config.vat_rate);
  const totalAmount = subtotal + vatAmount;

  return {
    basePrice,
    optionCost,
    discount: 0,       // 향후 프로모션 코드 지원 시 확장
    vatAmount,
    totalAmount,
    // 스냅샷 (주문 문서에 저장)
    priceSnapshot: {
      remoteConfigVersion: config._version ?? 'local-default',
      baseUnitPrice: config.base_unit_price,
      urgentOptionPrice: config.urgent_option_price,
      additionalRevisionPrice: config.additional_revision_price,
      vatRate: config.vat_rate,
    },
  };
}
```

### 4.4 Remote Config 초기화 (서비스 레이어)

```javascript
// src/services/PriceConfigService.js
import { getRemoteConfig, fetchAndActivate, getValue } from 'firebase/remote-config';

const remoteConfig = getRemoteConfig();
remoteConfig.defaultConfig = DEFAULT_PRICE_CONFIG;
remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1시간 캐시

export async function loadPriceConfig() {
  try {
    await fetchAndActivate(remoteConfig);
    return {
      base_unit_price: getValue(remoteConfig, 'base_unit_price').asNumber(),
      urgent_option_price: getValue(remoteConfig, 'urgent_option_price').asNumber(),
      additional_revision_price: getValue(remoteConfig, 'additional_revision_price').asNumber(),
      vat_rate: getValue(remoteConfig, 'vat_rate').asNumber(),
      _version: getValue(remoteConfig, '_version').asString(),
    };
  } catch (e) {
    console.warn('Remote Config 패치 실패, 로컬 기본값 사용:', e);
    return DEFAULT_PRICE_CONFIG;
  }
}
```

---

## 5. 전체 사용자 플로우

### 5.1 플로우 맵

```
Step 1: 로그인 ✅ (Phase 1 완료)
  └─ LoginPage → AuthContext.currentUser 설정

Step 2: 사진 관리 ⏳ (구현 중)
  └─ PhotoManagementPage (/photo-management)
     ├─ Project 목록 조회 (Firestore: projects where userId = uid)
     ├─ Project CRUD (생성, 이름수정, 삭제)
     ├─ Project별 섹션 UI (헤더: 프로젝트명 + 생성날짜, 접기/펴기 토글)
     ├─ 사진 업로드 (각 Project 내 Drag & Drop)
     │   ├─ PENDING (로컬) → UPLOADING (Firestore 생성)
     │   ├─ Cloud Storage 업로드 → UPLOAD_COMPLETED
     │   ├─ CF 자동 실행 → PROCESSING → READY
     │   └─ 실패 시 → UPLOAD_FAILED / PROCESSING_FAILED
     ├─ Project 비었을 때: 업로드 유도 메시지 표시
     ├─ Real-time 리스너 (onSnapshot): Project + Photo 실시간 업데이트
     ├─ 사진 선택 로직 (체크박스: READY 상태만 선택 가능)
     ├─ 상태별 UI (7가지 배지, 액션 버튼: 재시도/삭제)
     ├─ 하단: "선택됨 N개" + "주문 생성" 버튼
     └─ 📌 TODO: 사진을 다른 Project로 드래그 이동 (고도화)

Step 3: 주문 생성 ❌ (미구현)
  └─ CreateNewOrderPage (/orders/new)
     ├─ 선택된 사진 목록 표시 (READY 상태만 허용)
     ├─ 주문 정보 입력 (신부/신랑 이름, 촬영 유형 등)
     ├─ 보정 옵션 선택 (기본 / 긴급)
     ├─ Remote Config 기반 가격 계산 (실시간)
     └─ "주문 확인" → Order 문서 생성 (status: PENDING_PAYMENT)
          ※ copyStatus 필드 불필요 — 복제는 결제 후 백그라운드 처리

Step 4: 견적서 확인 & 결제 ❌ (미구현)
  └─ OrderDetailsPage (/orders/:orderId)
     ├─ 주문 정보 확인 (사진 수, 가격 내역, 요청사항)
     ├─ 타임아웃 카운트다운 (1시간, paymentDeadline 기준)
     ├─ "결제하기" 버튼 → PaymentPage로 이동
     └─ ※ 복제 상태 섹션 제거 — 사용자가 기다릴 필요 없음

Step 5: 결제 ❌ (인터페이스만 구현)
  └─ PaymentPage (/orders/:orderId/payment)
     ├─ 진입 조건 검증 (1시간 이내, status = PENDING_PAYMENT)
     ├─ 결제 방법 선택 (카드/계좌/휴대폰)
     ├─ PaymentServiceMock 호출 (실제 PG 연동은 추후)
     └─ 완료 → Order.status = PAID

※ photoCopyOnOrder 제거됨 — processUploadedPhoto()에서 이미 내부 백업 복제 완료.
  주문은 기존 READY 상태의 사진을 photoIds로 참조만 하면 충분.
```

> **⚠️ 설계 변경 이유 (2026-03-10)**
> 사진은 PhotoManagementPage에서 업로드 시 `processUploadedPhoto()` CF가 이미 실행되어
> 썸네일/백업/미리보기 생성까지 완료된 `READY` 상태입니다.
> `photoCopyOnOrder()`는 결제 후 보정 작업용 격리 스토리지로 복제하는 것으로,
> 사용자가 결제 전에 이를 기다릴 필요가 없습니다.
> → OrderDetailsPage의 "사진 복제 상태" 섹션 및 복제 완료 대기 로직 제거.

### 5.2 화면 간 데이터 전달

```
PhotoManagementPage → CreateNewOrderPage
  └─ React Router state: { selectedPhotoIds: string[] }
  └─ 새로고침 대비: 선택 즉시 sessionStorage에도 저장

CreateNewOrderPage → OrderDetailsPage
  └─ React Router navigate: /orders/:orderId
  └─ orderId는 URL 파라미터 (새로고침 안전)

OrderDetailsPage → PaymentPage
  └─ React Router navigate: /orders/:orderId/payment
  └─ orderId는 URL 파라미터
```

---

## 6. Cloud Function 명세

### 6.1 processUploadedPhoto (업로드 처리)

```
트리거: Cloud Storage 업로드 이벤트 (onObjectFinalized)
런타임: Node.js 20
메모리: 512MB (sharp 라이브러리 + 이미지 버퍼 고려)
타임아웃: 180초

입력: Storage 이벤트 (bucket, filePath)
출력: Photo 문서 업데이트 (status: READY)

처리 순서:
1. 이벤트 파싱 → bucket, filePath 추출
2. 파일 메타데이터에서 photoId 추출 (x-goog-meta-photo-id 헤더)
   ⚠️ 파일명에서 추출하지 않음 (충돌 위험)
3. Photo 문서 조회 → status = PROCESSING으로 업데이트
4. 파일 다운로드 (메모리, 512MB 제한 고려)
5. 파일 검증 (크기 100MB 이하, 형식 jpg/jpeg/png/webp)
6. 병렬 처리:
   ├─ 썸네일 생성 (100x100, JPEG, quality 80)
   ├─ 미리보기 생성 (500x500, JPEG, quality 85)
   ├─ WebP 변환 (원본 크기, quality 80)
   └─ 내부 백업 복제 (원본 그대로)
7. MD5 해시 계산 (무결성)
8. Photo 문서 최종 업데이트 (status: READY, URL들, metadata)
9. 폴더 통계 업데이트 (photoCount, totalSize)

에러 처리:
- Pub/Sub 재시도 정책으로 자동 재시도 (최대 2회)
- 최종 실패 시 Photo.status = PROCESSING_FAILED + processingError 저장
```

**photoId 전달 방식 (중요)**:

```javascript
// 프론트엔드: 업로드 시 Custom Metadata에 photoId 포함
const xhr = new XMLHttpRequest();
xhr.open('PUT', uploadUrl);
xhr.setRequestHeader('x-goog-meta-photo-id', photoId);  // ✅ 안전한 전달
xhr.setRequestHeader('Content-Type', file.type);
xhr.send(file);

// Cloud Function: 메타데이터에서 추출
const [fileMetadata] = await storageFile.getMetadata();
const photoId = fileMetadata.metadata?.['photo-id'];     // ✅ 안전한 추출
if (!photoId) throw new Error('photo-id metadata missing');
```

### 6.2 ~~photoCopyOnOrder~~ (삭제됨)

> **삭제 사유**: `processUploadedPhoto()`에서 이미 내부 백업 복제(`internalBackupUrl`)를 수행.
> Order는 `photoIds`로 READY 상태 사진을 참조만 하면 충분하므로 별도 복제 CF 불필요.

---

## 7. 프론트엔드 컴포넌트 명세

### 7.1 Photo 상태별 UI (Dropbox 스타일)

#### 색상 체계

```
진행 중 상태 (흰색 배경):
├─ PENDING:           회색  (#9E9E9E)  — 정적 원 뱃지, 50% 불투명
├─ UPLOADING:         파란색 (#2196F3) — 스피닝 원 뱃지, 50% 불투명, 진행률 바
├─ UPLOAD_COMPLETED:  주황색 (#FF9800) — 스피닝 원 뱃지, 100% 불투명 (~1초)
└─ PROCESSING:        주황색 (#FF9800) — 스피닝 원 뱃지, 100% 불투명

완료 상태:
└─ READY:             초록색 (#4CAF50) — ✓ 체크마크 뱃지, 연초록 배경 (#E8F5E9)

실패 상태 (모두 빨간색, 아이콘으로 구분):
├─ UPLOAD_FAILED:     빨간색 (#F44336) — ✕ X 아이콘, 연빨강 배경 (#FFEBEE)
└─ PROCESSING_FAILED: 빨간색 (#F44336) — ⚠ 경고 아이콘, 연주황 배경 (#FFF3E0)
                      (파일은 안전하다는 메시지 표시)

주문 잠금 상태 (READY + isLocked = true):
└─ 🔒 자물쇠 오버레이 추가, "주문 진행 중" 툴팁
```

#### 상태별 액션 버튼

| 상태 | 표시 버튼 | 비고 |
|------|----------|------|
| `UPLOAD_FAILED` | 🔄 재시도 (N/3) + 🗑️ 삭제 | 3회 초과 시 재시도 비활성화 |
| `PROCESSING_FAILED` | 🔄 재시도 (N/2) + 🗑️ 삭제 | 2회 초과 시 재시도 비활성화 |
| `READY` + `isLocked` | 🔒 잠김 (주문 진행 중) | 삭제 불가 |
| `READY` + `!isLocked` | 🗑️ 삭제 + ☑️ 선택 | 주문 생성 시 선택 가능 |

### 7.2 OrderDetailsPage 타임아웃 카운트다운

```javascript
// 올바른 구현 패턴 (메모리 누수 방지)
useEffect(() => {
  const interval = setInterval(() => {
    const remaining = order.paymentDeadline.toDate() - new Date();
    if (remaining <= 0) {
      setIsExpired(true);
      clearInterval(interval);
    } else {
      setRemainingMs(remaining);
    }
  }, 1000);

  return () => clearInterval(interval);  // ✅ cleanup 필수
}, [order.paymentDeadline]);

// 색상 규칙
// remaining > 30분: 초록색
// remaining 10-30분: 주황색 경고
// remaining < 10분: 빨간색 위험
// remaining <= 0: 만료 메시지 + "주문 재생성" 버튼
```

### 7.3 [TODO: Deferred] 세마포어 갱신 (Phase 3)

※ `isLocked` 구조 확정 후 구현 예정. 현재는 주문 시 별도 잠금 없이 진행.

---

## 8. 에러 처리 전략

### 8.1 업로드 실패 복구

```
UPLOAD_FAILED 발생 시:
1. 사용자에게 에러 메시지 표시 (uploadError 필드)
2. "재시도 (N/3)" 버튼 활성화
3. 재시도 클릭:
   ├─ uploadAttempt += 1
   ├─ status = UPLOADING
   └─ 업로드 재시작 (지수 백오프: 1s, 2s, 4s)
4. 3회 초과 시 재시도 버튼 비활성화, 삭제 권장
5. 7일 후 자동 삭제 (Cloud Scheduler, Phase 3)
```

### 8.2 처리 실패 복구

```
PROCESSING_FAILED 발생 시:
1. "파일은 안전하게 저장됨" 메시지 표시
2. "재시도 (N/2)" 버튼 활성화
3. 재시도 클릭:
   ├─ processingAttempt += 1
   ├─ status = UPLOAD_COMPLETED (CF 재트리거)
   └─ Cloud Function 재실행
4. 2회 초과 시 재시도 버튼 비활성화
5. 14일 후 자동 삭제 (Cloud Scheduler, Phase 3)
```

### 8.3 [삭제됨] 복제 실패 복구
(업로드 시점에 이미 백업이 완료되므로 별도 주문 복제 실패 복구 로직 불필요)

### 8.4 타임아웃 처리

```
Order.paymentDeadline 초과 시:
1. OrderDetailsPage에서 "주문 만료" 표시
2. Photo.isLocked = false (Lock 해제)
3. Order.status = CANCELLED
4. "새 주문 생성" 버튼으로 유도
5. 복제된 파일 정리 (Admin Dashboard 또는 Cloud Scheduler)
```

---

## 9. 구현 체크리스트

> **최종 업데이트**: 2026-03-14 — 코드 감사 결과 반영

### Phase 2-1: 사진 관리 & 주문 생성 ✅ 완료

#### Firestore 스키마
- [x] Folder/Photo/Order 컬렉션 구조 확정 및 보안 규칙 업데이트

#### PhotoManagementPage ✅
- [x] ProjectServiceApi 구현 (CRUD: create, read, update, delete)
- [x] Firestore onProjectsChanged + onPhotosChanged (onSnapshot 실시간 리스너)
- [x] Project별 섹션 헤더 (프로젝트명 + 생성날짜 + 접기/펴기 토글)
- [x] 사진 그리드 + Drag & Drop 업로드 (Project별)
- [x] 사진 선택 체크박스 (READY 상태만 활성화)
- [x] 하단: "선택됨 N개" + "주문 생성" 버튼
- [x] 상태별 UI (7가지 배지, 삭제 버튼)
- [x] sessionStorage에 선택 사진 저장 후 CreateNewOrderPage로 이동
- [x] Project CRUD UI (새 프로젝트 다이얼로그, 삭제 확인 팝업)
- [x] Analytics 통합 (photo_upload, photo_delete, order_creation_started 등)

#### PriceConfigService ✅
- [x] Firebase Remote Config 초기화 + 로컬 기본값 설정
- [x] `initialize()` / `calculateOrderPrice()` / `formatPrice()` 구현

#### CreateNewOrderPage ✅
- [x] sessionStorage 복원 + Router state 기반 사진 목록 표시
- [x] 주문 정보 폼 (신부/신랑 이름, 보정 목적, 장소, 요청사항)
- [x] 보정 옵션 선택 (기본 / 긴급) + 실시간 가격 계산
- [x] Firestore `orders/` 문서 생성 (priceSnapshot, paymentDeadline 포함)
- [x] OrderDetailsPage(`/orders/:orderId`)로 이동

#### OrderDetailsPage ✅
- [x] Firestore onSnapshot (Order 실시간 구독)
- [x] 타임아웃 카운트다운 (paymentDeadline 기준, 색상 단계)
- [x] setInterval cleanup (메모리 누수 방지)
- [x] 만료 시 "새 주문 생성" 버튼 표시
- [x] "결제하기" 버튼 활성화 → PaymentPage 이동

### Phase 2-2: 사진 처리 Cloud Function ✅ 완료

- [x] Cloud Function 프로젝트 초기화 (`functions/src/index.js`)
- [x] `processUploadedPhoto()` 구현
  - [x] photoId를 Custom Metadata(`x-goog-meta-photo-id`)에서 추출
  - [x] sharp 라이브러리 (썸네일 / 미리보기 / WebP / 내부 백업 생성)
  - [x] Photo 문서 업데이트 (status: READY)
  - [x] 에러 시 PROCESSING_FAILED 처리
- [x] Cloud Function 구현 완료 (배포 테스트 필요)

### Phase 2-3: 결제 페이지 ✅ 완료

- [x] PaymentPage 진입 조건 검증 (1시간 이내, status = READY_TO_PAY)
- [x] 결제 방법 선택 UI (카드 / 계좌이체 / 휴대폰)
- [x] MockPayment 연동 (2초 시뮬레이션)
- [x] 결제 완료 → `Order.status = PAID` Firestore 업데이트

### Phase 2-4: 테스트 (🔄 진행 필요)

- [ ] E2E 테스트: 전체 플로우 (로그인 → 사진 업로드 → 주문 → 결제)
- [ ] 에러 시나리오 테스트 (업로드 실패, 타임아웃)
- [ ] 동시 업로드 테스트 (Race Condition 검증)

### Phase 3+ 남은 작업

- [ ] 실제 PG 연동 (포트원 / 토스페이먼츠)
- [ ] Cloud Scheduler (자동 정리 Cron Job — UPLOAD_FAILED 7일 후, PROCESSING_FAILED 14일 후)
- [ ] Admin Dashboard (고아 파일 모니터링)
- [ ] OrderListPage 구현
- [ ] SettingsPage / NotificationCenterPage / InquiryPage

---

## 10. 향후 계획 (TODO)

### Phase 3: Admin Dashboard

```
🔵 TODO: 고아 파일 모니터링
├─ UPLOAD_FAILED / PROCESSING_FAILED 사진 목록
├─ 복제 실패 Order 목록
├─ 수동 선택 정리 버튼
└─ 정리 로그 기록
```

### Phase 4: 자동화

```
🔵 TODO: Cloud Scheduler (자동 정리 Cron Job)
├─ UPLOAD_FAILED: 7일 후 자동 삭제
├─ PROCESSING_FAILED: 14일 후 자동 삭제
├─ Orphan Order: 1시간 후 자동 취소
├─ UPLOADING 타임아웃: 300초 초과 → UPLOAD_FAILED (서버 기준)
└─ 매일 자정 실행

🔵 TODO: 실제 PG 연동
├─ 포트원 (구 아임포트) 또는 토스페이먼츠
└─ PaymentServiceApi 구현 (현재 Mock만 있음)

🔵 TODO: Remote Config A/B 테스트
└─ 가격 실험 그룹 설정 및 분석

🔵 TODO (추후 검토): 주문 참조 사진 삭제 정책
├─ 주문에 참조된 사진(usedInOrders) 삭제 허용 여부
├─ 내부 백업(internalBackupUrl) 존재 시 삭제 허용 vs isLocked로 삭제 차단
└─ 결정 후 Photo 삭제 로직 및 UI 반영
```

---

## 부록: 아카이브된 문서 목록

다음 문서들은 `docs/archive/`로 이동되었습니다. 이 문서들은 더 이상 유효한 설계 기준이 아닙니다.

| 파일 | 내용 | 이 문서에서 통합된 섹션 |
|------|------|----------------------|
| `PHASE2_ARCHITECTURE_REVISION.md` | 초기 아키텍처 재검토 | §1, §2 |
| `COMPREHENSIVE_SUMMARY.md` | 종합 정리 | §1, §5 |
| `PHOTO_DELETION_RISK_ANALYSIS.md` | 사진 삭제 위험 분석 | §1.1 (복제 방식 결정) |
| `PHOTO_COPY_ON_ORDER_ANALYSIS.md` | 복제 전략 분석 | §6.2 |
| `EVENT_DRIVEN_PHOTO_PROCESSING.md` | 이벤트 드리븐 처리 | §6.1 |
| `INDUSTRY_PATTERN_ANALYSIS.md` | 업계 패턴 분석 | §1.1 배경 |
| `PHASE2_PROCESS_VALIDATION.md` | 플로우 검증 | §5 |
| `PHOTO_UPLOAD_STATE_MACHINE.md` | 상태 머신 명세 | §3, §7.1 |
| `PHASE2_FINAL_FLOW_VALIDATION.md` | 최종 플로우 검증 | §5, §9 |
| `PHASE2_IMPLEMENTATION_PLAN.md` | 구현 계획 | §9 |
