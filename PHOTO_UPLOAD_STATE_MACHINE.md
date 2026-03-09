# Photo Upload State Machine & UI Specification (V2)

## 1. 상태 정의 (7개 상태)

### 상태 일览

| # | 상태 | 설명 | 담당 | 지속시간 | 최종 |
|---|------|------|------|---------|------|
| 1 | `PENDING` | 업로드 대기 | 프론트 | 사용자 대기 | ❌ |
| 2 | `UPLOADING` | 파일이 S3로 업로드 중 | 프론트+S3 | ~10초 (10MB) | ❌ |
| 3 | `UPLOAD_COMPLETED` | 파일이 S3에 저장 완료 | S3+Firestore | ~1초 | ❌ |
| 4 | `PROCESSING` | 썸네일, 백업본 생성 중 | Cloud Function | ~5-10초 | ❌ |
| 5 | `READY` | ✅ 최종 완료 (사진함 사용 가능) | Cloud Function | 영구 | ✅ |
| 6 | `UPLOAD_FAILED` | ❌ 파일 업로드 실패 | 프론트 | 최종 | ✅ |
| 7 | `PROCESSING_FAILED` | ❌ 메타정보 처리 실패 | Cloud Function | 최종 | ✅ |

---

## 2. 상태 전이 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Photo Upload State Machine (V2)                          │
└─────────────────────────────────────────────────────────────────────────────┘

시작
  │
  ▼
┌──────────────────┐
│    PENDING       │  ← 사용자가 파일 선택 (준비 상태)
│  업로드 대기     │     UI: 회색 뱃지
└────────┬─────────┘
         │
         │ 사용자: "업로드" 클릭
         │ 또는 Drag & Drop
         │
         ▼
┌──────────────────┐
│   UPLOADING      │  ← 파일이 S3로 업로드 중
│   업로드 중      │     UI: 파란 스피닝 원 + 진행률 (0-100%)
└────┬──────┬──────┘
     │      │
     │      │ 네트워크 에러 또는 사용자 취소
     │      │
     │      ▼
     │    ┌──────────────────┐
     │    │  UPLOAD_FAILED   │  ← 업로드 실패 (최종)
     │    │  업로드 실패     │     UI: 빨간 배경 + ❌ (두 줄) 아이콘
     │    │                  │     액션: 재시도 또는 삭제
     │    └──────────────────┘
     │
     │ 업로드 완료 (100%)
     │
     ▼
┌──────────────────────────────────┐
│   UPLOAD_COMPLETED               │  ← 파일이 S3에 저장됨
│   업로드 완료 (매우 짧음)        │     UI: 주황 스피닝 원 (~1초만 유지)
│   (메타정보 처리 시작 신호)      │
└────┬────────────────────────────┘
     │
     │ S3 Upload Event 발생
     │ → Pub/Sub → Cloud Function 트리거
     │ → 상태 자동 전환
     │
     ▼
┌──────────────────────────────────┐
│        PROCESSING                │  ← 썸네일, 백업본, 미리보기 생성 중
│   메타정보 처리 중                │     UI: 주황 스피닝 원 (5-10초)
│   (썸네일, 백업본, 미리보기 등)  │
└────┬─────────────────────────┬───┘
     │                         │
     │ 모든 처리 완료          │ Cloud Function 오류
     │ → Photo.status = READY  │ → 상태 전환
     │                         │
     ▼                         ▼
┌──────────────────┐        ┌──────────────────────┐
│     READY        │        │ PROCESSING_FAILED    │ ← 처리 실패 (최종)
│  최종 완료 ✅    │        │ 메타정보 처리 실패   │    UI: 빨간 배경 + ⚠️ 아이콘
│                  │        │                      │    액션: 재시도 또는 삭제
│ 초록 체크마크    │        └──────────────────────┘
│ 뱃지             │
│                  │
│ 사진함에 표시    │
│ 주문 시 사용     │
│ 가능 ✅          │
└──────────────────┘

최종 상태 3가지:
├─ READY (✅ 초록 체크)
├─ UPLOAD_FAILED (❌ 빨강 에러, 두 줄)
└─ PROCESSING_FAILED (❌ 빨강 경고, 삼각형 느낌표)
```

### 상태 전이 규칙 (모든 경로)

```
1. PENDING → UPLOADING
   조건: 사용자가 파일 선택 + 업로드 버튼 클릭
   액션: fileUploadHandler() 실행

2. UPLOADING → UPLOAD_COMPLETED
   조건: xhr.upload가 100% 도달
   액션: Photo.status = "UPLOAD_COMPLETED"

3. UPLOADING → UPLOAD_FAILED
   조건: xhr.onerror 또는 xhr.upload.onerror 또는 타임아웃(300초)
   액션: Photo.status = "UPLOAD_FAILED" + Photo.uploadError = 에러메시지
   
4. UPLOAD_COMPLETED → PROCESSING
   조건: S3 Upload Event 감지 + Cloud Function 호출
   액션: Firestore Listener에서 status 변경 감지 (자동)

5. PROCESSING → READY ✅ (최종 성공)
   조건: Cloud Function 모든 처리 완료
   액션: Photo.status = "READY" (사진함에 표시)

6. PROCESSING → PROCESSING_FAILED ❌
   조건: Cloud Function 내 에러 발생 또는 타임아웃(180초)
   액션: Photo.status = "PROCESSING_FAILED" + Photo.processingError = 에러

7. UPLOAD_FAILED ↔ UPLOADING (재시도)
   조건: 사용자 재시도 버튼 클릭
   액션: uploadAttempt += 1, 상태 UPLOADING으로 복원 후 재업로드

8. PROCESSING_FAILED → PROCESSING (재시도)
   조건: 사용자 재시도 버튼 클릭
   액션: processingAttempt += 1, Cloud Function 재트리거

9. [최종 상태] → [삭제]
   조건: 사용자 삭제 버튼 또는 자동 정리
   액션: Photo 문서 삭제 + S3 파일 정리 (선택적)
```

---

## 3. 상태별 타임아웃 및 자동 정리

### 타임아웃 정책

```
UPLOADING (업로드 중)
├─ 지속시간: 일반적으로 10-30초
├─ 최대 타임아웃: 300초 (5분)
├─ 초과 시: UPLOAD_FAILED로 자동 전환
├─ 조건: Photo.uploadStartTime + 300초 초과
└─ 자동 감시: Cloud Scheduler (매 분)

PROCESSING (메타정보 처리 중)
├─ 지속시간: 5-10초 (평균)
├─ 최대 타임아웃: 180초 (3분)
├─ 초과 시: PROCESSING_FAILED로 자동 전환
├─ 조건: Photo.processStartTime + 180초 초과
└─ 자동 감시: Cloud Scheduler (매 분)

READY (최종 완료)
├─ 지속시간: 영구
├─ 타임아웃: 없음
└─ 정리: 사용자가 명시적으로 삭제할 때까지
```

### 재시도 정책

```
UPLOAD_FAILED (업로드 실패)
├─ 최대 재시도: 3회
├─ 재시도 로직:
│  ├─ 1회 실패 → "재시도" 버튼 표시 (가능)
│  ├─ 2회 실패 → "재시도" 버튼 표시 (가능)
│  ├─ 3회 실패 → "재시도" 버튼 표시 (가능) + 경고 "최후의 시도"
│  └─ 4회 이상 → 재시도 불가, 삭제 권장
├─ 지수 백오프: 1초, 2초, 4초, 8초...
└─ 자동 정리: 7일 후 자동 삭제 (사용자가 삭제 안 한 경우)

PROCESSING_FAILED (처리 실패)
├─ 최대 재시도: 2회
├─ 재시도 로직:
│  ├─ 1회 실패 → "재시도" 버튼 표시
│  ├─ 2회 실패 → "재시도" 버튼 표시 + "최후의 시도" 경고
│  └─ 3회 이상 → 재시도 불가
├─ 지수 백오프: 2초, 5초, 10초...
└─ 자동 정리: 14일 후 자동 삭제 (원본 파일 유지)
   ├─ 이유: 원본 S3 파일은 있는데 처리만 안 됨
   ├─ 사용자: 나중에 "다시 시도" 가능
   └─ 도움말 제공: "처리 재개"
```

---

## 4. 상태 머신 구현 (Firestore 스키마)

### Photo 문서 구조 (확장)

```javascript
// Photo 컬렉션
{
  id: "photo_001",
  userId: "user_123",
  folderId: "folder_001",
  
  // ========== 상태 관리 ==========
  status: "PENDING" | "UPLOADING" | "UPLOAD_COMPLETED" | 
          "PROCESSING" | "READY" | "UPLOAD_FAILED" | "PROCESSING_FAILED",
  
  // ========== 파일 정보 ==========
  fileName: "wedding-photo-001.jpg",
  fileSize: 10485760,  // 10MB (bytes)
  fileExt: "jpg",
  fileMd5: "abc123def456...",
  
  // ========== 업로드 단계 ==========
  uploadStartTime: Timestamp,
  uploadEndTime: Timestamp,
  uploadProgress: 0-100,
  uploadError: "Network timeout",
  uploadAttempt: 1,  // 재시도 횟수
  uploadMaxAttempts: 3,
  
  // ========== 처리 단계 ==========
  processStartTime: Timestamp,
  processEndTime: Timestamp,
  processingError: "Thumbnail generation failed",
  processingAttempt: 1,  // 재시도 횟수
  processingMaxAttempts: 2,
  
  // ========== 생성된 파일들 (처리 완료 후) ==========
  uploadedUrl: "gs://bucket/user-uploads/photo_001.jpg",
  thumbnail: "gs://bucket/thumbnails/photo_001.jpg",
  preview: "gs://bucket/preview/photo_001.jpg",
  webp: "gs://bucket/preview/photo_001.webp",
  internalBackupUrl: "gs://bucket/internal/backup/photo_001.jpg",
  
  formats: [
    { type: "original", url: "...", size: 10485760 },
    { type: "thumbnail", url: "...", size: 5120 },
    { type: "preview", url: "...", size: 102400 },
    { type: "webp", url: "...", size: 98304 },
    { type: "backup", url: "...", size: 10485760 }
  ],
  
  // ========== 메타데이터 ==========
  metadata: {
    width: 4000,
    height: 3000,
    format: "jpeg",
    colorspace: "srgb",
    hasAlpha: false,
    uploadedAt: Timestamp,
    processedAt: Timestamp
  },
  
  // ========== 주문 연계 ==========
  usedInOrders: ["order_001", "order_002"],
  
  // ========== 삭제 정보 ==========
  deletedAt: Timestamp,
  autoDeleteScheduledAt: Timestamp,  // 7일 or 14일 후 자동 삭제 예정
  
  // ========== 생성 정보 ==========
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 5. 색상 및 아이콘 정의

### 5.1 뱃지 (우상단) 색상 및 아이콘

#### 진행 중 상태 (스피닝 애니메이션)

```
PENDING (회색 원, 회전 없음)
├─ 색상: #9E9E9E (회색)
├─ 아이콘: ⭕ 원 (정적)
├─ 애니메이션: 없음 (정적)
└─ 의미: 준비 중

UPLOADING (파란 원, 회전)
├─ 색상: #2196F3 (파란색)
├─ 아이콘: ⭕ 원 (회전)
├─ 애니메이션: 1.5초 회전 (↻)
└─ 의미: 파일 업로드 진행 중

UPLOAD_COMPLETED (주황 원, 회전, 짧음)
├─ 색상: #FF9800 (주황색)
├─ 아이콘: ⭕ 원 (회전)
├─ 애니메이션: 1.5초 회전 (↻)
├─ 지속시간: ~1초 (매우 짧음)
└─ 의미: 메타정보 처리 시작 대기

PROCESSING (주황 원, 회전)
├─ 색상: #FF9800 (주황색)
├─ 아이콘: ⭕ 원 (회전)
├─ 애니메이션: 1.5초 회전 (↻)
├─ 지속시간: 5-10초
└─ 의미: 메타정보 처리 진행 중
```

#### 완료 상태 (정적, 고정)

```
READY (초록 체크마크, 정적)
├─ 색상: #4CAF50 (초록색)
├─ 아이콘: ✓ (체크마크, 굵은 선)
├─ 애니메이션: 없음 (정적)
├─ 배경: 흰색 (일반)
└─ 의미: ✅ 완료, 사용 가능

UPLOAD_FAILED (빨간 에러, 정적)
├─ 색상: #F44336 (빨간색)
├─ 아이콘: ✕ (X 두 줄, 굵은 선) → "╳"
├─ 애니메이션: 없음 (정적)
├─ 배경: #FFEBEE (연한 빨강)
├─ 의미: ❌ 업로드 실패
└─ UI 설명: "파일 업로드에 실패했습니다"

PROCESSING_FAILED (주황 경고, 정적)
├─ 색상: #FF6F00 (진한 주황색)
├─ 아이콘: ⚠ (느낌표 in 삼각형)
├─ 애니메이션: 없음 (정적)
├─ 배경: #FFF3E0 (연한 주황)
├─ 의미: ⚠️ 처리 실패
└─ UI 설명: "메타정보 처리에 실패했습니다 (파일은 안전)"
```

### 5.2 전체 색상 체계

```
┌──────────────────────────────────────────────────────────┐
│                    색상 체계 정리                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ 진행 중 (흰색 배경):                                     │
│ ├─ 회색: PENDING (#9E9E9E)                              │
│ ├─ 파란색: UPLOADING (#2196F3) ← 파일 업로드 단계      │
│ └─ 주황색: PROCESSING (#FF9800) ← 메타정보 처리 단계   │
│                                                          │
│ 최종 성공 (초록 배경):                                  │
│ └─ 초록색: READY (#4CAF50) ✅                           │
│    배경: #E8F5E9                                         │
│                                                          │
│ 최종 실패 (빨강 배경):                                  │
│ ├─ 빨강색: UPLOAD_FAILED (#F44336) ❌                  │
│ │  배경: #FFEBEE                                        │
│ │  아이콘: ✕ (X 두 줄)                                 │
│ │                                                      │
│ └─ 진한 주황: PROCESSING_FAILED (#FF6F00) ⚠️           │
│    배경: #FFF3E0                                        │
│    아이콘: ⚠ (삼각형 느낌표)                            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Dropbox 스타일 UI 스펙 (V2)

### 6.1 상태별 UI 표현

#### 상태 1: PENDING (업로드 대기)

```
┌─────────────────────────────────┐
│                                 │
│   ┌───────────────────────────┐ │
│   │                           │ │
│   │     📷 사진                │ │
│   │  (반투명, 50% opacity)    │ │
│   │                           │ │
│   │   우상단 뱃지:            │ │
│   │   └─ ⭕ (회색)            │ │
│   │                           │ │
│   └───────────────────────────┘ │
│                                 │
│   파일명: wedding-photo.jpg      │
│   파일크기: 10 MB               │
│   상태: ⏳ 준비 중...           │
│                                 │
└─────────────────────────────────┘

CSS:
- img opacity: 0.5
- badge: #9E9E9E 배경, 정적 (회전 X)
- badge size: 24px
```

#### 상태 2: UPLOADING (업로드 중)

```
┌─────────────────────────────────┐
│                                 │
│   ┌───────────────────────────┐ │
│   │                           │ │
│   │     📷 사진                │ │
│   │  (반투명, 50% opacity)    │ │
│   │                           │ │
│   │   우상단 뱃지:            │ │
│   │   ┌─ ⭕ (파란, 회전) ↻    │ │
│   │   └─ 진행률: 45%         │ │
│   │                           │ │
│   └───────────────────────────┘ │
│                                 │
│   파일명: wedding-photo.jpg      │
│   상태: ⏳ 업로드 중... 45%     │
│   진행률 바:                     │
│   ▓▓▓▓▓▓▓░░░░░░░░ 45%          │
│                                 │
└─────────────────────────────────┘

CSS:
- img opacity: 0.5
- badge: #2196F3 배경, 1.5초 회전 애니메이션
- progress bar: 파란색 그라데이션
```

#### 상태 3: UPLOAD_COMPLETED (업로드 완료)

```
┌─────────────────────────────────┐
│                                 │
│   ┌───────────────────────────┐ │
│   │                           │ │
│   │     📷 사진                │ │
│   │  (불투명, 100% opacity)  │ │
│   │                           │ │
│   │   우상단 뱃지:            │ │
│   │   ┌─ ⭕ (주황, 회전) ↻    │ │
│   │   └─ 처리 시작            │ │
│   │                           │ │
│   └───────────────────────────┘ │
│                                 │
│   파일명: wedding-photo.jpg      │
│   상태: ⚙️ 처리 시작...          │
│   (매우 짧음, ~1초)             │
│                                 │
└─────────────────────────────────┘

CSS:
- img opacity: 1.0
- badge: #FF9800 배경, 회전 애니메이션 (1.5초)
- 진행률 바: 없음 (빠르니까)
```

#### 상태 4: PROCESSING (메타정보 처리 중)

```
┌─────────────────────────────────┐
│                                 │
│   ┌───────────────────────────┐ │
│   │                           │ │
│   │     📷 사진                │ │
│   │  (불투명, 100% opacity)  │ │
│   │                           │ │
│   │   우상단 뱃지:            │ │
│   │   ┌─ ⭕ (주황, 회전) ↻    │ │
│   │   └─ 처리 중...          │ │
│   │                           │ │
│   └───────────────────────────┘ │
│                                 │
│   파일명: wedding-photo.jpg      │
│   상태: ⚙️ 처리 중...           │
│   (썸네일, 백업, 미리보기)      │
│   예상시간: ~8초               │
│                                 │
└─────────────────────────────────┘

CSS:
- img opacity: 1.0
- badge: #FF9800 배경, 회전 애니메이션 (1.5초)
- 진행률 바: 없음
```

#### 상태 5: READY (최종 완료) ✅

```
┌─────────────────────────────────┐
│  배경: #E8F5E9 (연한 초록)      │
│                                 │
│   ┌───────────────────────────┐ │
│   │                           │ │
│   │     📷 사진                │ │
│   │  (불투명, 100% opacity)  │ │
│   │                           │ │
│   │   우상단 뱃지:            │ │
│   │   ✓ (초록 체크마크)       │ │
│   │                           │ │
│   └───────────────────────────┘ │
│                                 │
│   파일명: wedding-photo.jpg      │
│   상태: ✅ 완료                 │
│   사진함에 추가됨               │
│                                 │
└─────────────────────────────────┘

CSS:
- img opacity: 1.0
- badge: #4CAF50 배경 + ✓ (굵은 초록색 체크마크)
- background: #E8F5E9 (연한 초록)
- border-color: #4CAF50 (초록)
```

#### 상태 6: UPLOAD_FAILED (업로드 실패) ❌

```
┌─────────────────────────────────┐
│  배경: #FFEBEE (연한 빨강)      │
│                                 │
│   ┌───────────────────────────┐ │
│   │                           │ │
│   │     📷 사진                │ │
│   │  (반투명, 50% opacity)    │ │
│   │                           │ │
│   │   우상단 뱃지:            │ │
│   │   ✕ (빨간 X 두 줄)       │ │
│   │                           │ │
│   └───────────────────────────┘ │
│                                 │
│   파일명: wedding-photo.jpg      │
│   상태: ❌ 업로드 실패          │
│   에러: Network timeout         │
│   시도: 1/3                     │
│                                 │
│   [🔄 재시도] [🗑️ 삭제]         │
│                                 │
└─────────────────────────────────┘

CSS:
- img opacity: 0.5
- badge: #F44336 배경 + ✕ (빨강색 X 두 줄)
- background: #FFEBEE (연한 빨강)
- border-color: #F44336 (빨강)
```

#### 상태 7: PROCESSING_FAILED (메타정보 처리 실패) ⚠️

```
┌─────────────────────────────────┐
│  배경: #FFF3E0 (연한 주황)      │
│                                 │
│   ┌───────────────────────────┐ │
│   │                           │ │
│   │     📷 사진                │ │
│   │  (불투명, 100% opacity)  │ │
│   │  (파일은 OK)              │ │
│   │                           │ │
│   │   우상단 뱃지:            │ │
│   │   ⚠ (주황 느낌표)         │ │
│   │                           │ │
│   └───────────────────────────┘ │
│                                 │
│   파일명: wedding-photo.jpg      │
│   상태: ⚠️ 처리 실패            │
│   에러: Thumbnail generation failed │
│   시도: 1/2                     │
│                                 │
│   💡 파일은 안전하게 저장됨      │
│                                 │
│   [🔄 재시도] [🗑️ 삭제]         │
│                                 │
└─────────────────────────────────┘

CSS:
- img opacity: 1.0 (파일은 있음!)
- badge: #FF6F00 배경 + ⚠ (주황색 삼각형 느낌표)
- background: #FFF3E0 (연한 주황)
- border-color: #FF9800 (주황)
```

---

## 6.2 아이콘 스타일 가이드

### 뱃지 아이콘 디자인

```
PENDING (정적):
└─ ⭕ (원, 정적, 1px 테두리)

UPLOADING (회전):
└─ ⭕ (원, 회전 1.5초, 2px 테두리)

PROCESSING (회전):
└─ ⭕ (원, 회전 1.5초, 2px 테두리)

READY (정적):
└─ ✓ (체크마크, 정적, 3px 굵기, 각도 45도)

UPLOAD_FAILED (정적):
└─ ✕ (X 두 줄, 정적, 3px 굵기, 45도 교차)

PROCESSING_FAILED (정적):
└─ ⚠ (삼각형 + 느낌표, 정적, 느낌표 3px)
```

### CSS 애니메이션

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 스피닝 원 */
.spinner {
  animation: spin 1.5s linear infinite;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-radius: 50%;
}

/* 색상별 스피닝 */
.spinner.blue {
  color: #2196F3;
  border-color: #e3f2fd;
  border-top-color: #2196F3;
}

.spinner.orange {
  color: #FF9800;
  border-color: #ffe0b2;
  border-top-color: #FF9800;
}
```

---

## 7. 재시도 & 자동 정리 로직

### 7.1 재시도 버튼 표시 규칙

```
UPLOAD_FAILED 상태:
├─ uploadAttempt = 1 → "🔄 재시도 (1/3)" 버튼 표시
├─ uploadAttempt = 2 → "🔄 재시도 (2/3)" 버튼 표시
├─ uploadAttempt = 3 → "🔄 재시도 (3/3) 최후의 시도" 경고 추가
└─ uploadAttempt >= 4 → "재시도" 버튼 비활성화 (삭제만 가능)

PROCESSING_FAILED 상태:
├─ processingAttempt = 1 → "🔄 재시도 (1/2)" 버튼 표시
├─ processingAttempt = 2 → "🔄 재시도 (2/2) 최후의 시도" 경고
└─ processingAttempt >= 3 → "재시도" 버튼 비활성화

공통:
└─ 항상 "🗑️ 삭제" 버튼 활성화 (언제든 삭제 가능)
```

### 7.2 자동 정리 Cron Job

```javascript
/**
 * Scheduled Function: autoCleanupFailedPhotos()
 * 트리거: Cloud Scheduler (매일 자정)
 * 목적: 오래된 실패 사진 자동 삭제
 */
async function autoCleanupFailedPhotos() {
  const now = new Date();
  
  // 7일 이상 UPLOAD_FAILED인 사진 삭제
  const uploadFailedPhotos = await db.collection('photos')
    .where('status', '==', 'UPLOAD_FAILED')
    .where('updatedAt', '<', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))
    .get();
  
  for (const doc of uploadFailedPhotos.docs) {
    console.log(`🗑️ Auto-deleting UPLOAD_FAILED photo: ${doc.id}`);
    
    // S3에서 원본 파일 삭제 (있으면)
    const photo = doc.data();
    if (photo.uploadedUrl) {
      try {
        await s3Client.bucket('bucket').file(photo.uploadedUrl).delete();
      } catch (e) {
        console.warn(`Could not delete S3 file: ${e.message}`);
      }
    }
    
    // Firestore 문서 삭제
    await doc.ref.delete();
  }
  
  // 14일 이상 PROCESSING_FAILED인 사진 삭제
  // (원본 S3 파일은 유지하되 Photo 문서만 삭제)
  const processingFailedPhotos = await db.collection('photos')
    .where('status', '==', 'PROCESSING_FAILED')
    .where('updatedAt', '<', new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000))
    .get();
  
  for (const doc of processingFailedPhotos.docs) {
    console.log(`🗑️ Auto-deleting PROCESSING_FAILED photo: ${doc.id}`);
    
    // Photo 문서만 삭제 (원본은 유지)
    await doc.ref.delete();
  }
  
  console.log('✅ Auto-cleanup completed');
}
```

---

## 8. React 컴포넌트 (V2)

### PhotoGridItem.jsx (업데이트)

```jsx
import React, { useState, useEffect } from 'react';
import './PhotoGridItem.css';

export function PhotoGridItem({ photo, onRetry, onDelete }) {
  const [displayProgress, setDisplayProgress] = useState(0);
  
  useEffect(() => {
    if (photo.status === 'UPLOADING' && photo.uploadProgress) {
      setDisplayProgress(photo.uploadProgress);
    }
  }, [photo.uploadProgress, photo.status]);
  
  const getStatusDisplay = () => {
    switch (photo.status) {
      case 'PENDING':
        return { 
          text: '준비 중...', 
          badgeColor: '#9E9E9E',
          bgClass: 'bg-normal'
        };
      case 'UPLOADING':
        return { 
          text: `업로드 중... ${displayProgress}%`, 
          badgeColor: '#2196F3',
          bgClass: 'bg-normal'
        };
      case 'UPLOAD_COMPLETED':
        return { 
          text: '처리 시작...', 
          badgeColor: '#FF9800',
          bgClass: 'bg-normal'
        };
      case 'PROCESSING':
        return { 
          text: '처리 중...', 
          badgeColor: '#FF9800',
          bgClass: 'bg-normal'
        };
      case 'READY':
        return { 
          text: '완료', 
          badgeColor: '#4CAF50',
          bgClass: 'bg-success-light',
          icon: 'checkmark'
        };
      case 'UPLOAD_FAILED':
        return { 
          text: '업로드 실패', 
          badgeColor: '#F44336',
          bgClass: 'bg-error-light',
          icon: 'error-x',
          errorMsg: photo.uploadError,
          attempt: `${photo.uploadAttempt || 1}/${photo.uploadMaxAttempts || 3}`
        };
      case 'PROCESSING_FAILED':
        return { 
          text: '처리 실패', 
          badgeColor: '#FF6F00',
          bgClass: 'bg-warning-light',
          icon: 'warning',
          errorMsg: photo.processingError,
          attempt: `${photo.processingAttempt || 1}/${photo.processingMaxAttempts || 2}`
        };
      default:
        return { 
          text: '알 수 없음', 
          badgeColor: '#999',
          bgClass: 'bg-normal'
        };
    }
  };
  
  const getBadgeIcon = () => {
    const display = getStatusDisplay();
    
    switch (display.icon) {
      case 'checkmark':
        return <div className="icon-checkmark">✓</div>;
      case 'error-x':
        return <div className="icon-error-x">✕</div>;
      case 'warning':
        return <div className="icon-warning">⚠</div>;
      case undefined:
        // PENDING, UPLOADING, PROCESSING: 스피닝
        if (['PENDING', 'UPLOADING'].includes(photo.status)) {
          return <div className="spinner blue" />;
        } else if (['UPLOAD_COMPLETED', 'PROCESSING'].includes(photo.status)) {
          return <div className="spinner orange" />;
        }
        return null;
      default:
        return null;
    }
  };
  
  const getImageOpacity = () => {
    if (['PENDING', 'UPLOADING', 'UPLOAD_FAILED'].includes(photo.status)) {
      return 0.5;
    }
    return 1.0;
  };
  
  const display = getStatusDisplay();
  const canRetry = (photo.status === 'UPLOAD_FAILED' && photo.uploadAttempt < photo.uploadMaxAttempts) ||
                   (photo.status === 'PROCESSING_FAILED' && photo.processingAttempt < photo.processingMaxAttempts);
  
  return (
    <div className={`photo-grid-item ${display.bgClass}`}>
      
      {/* 사진 */}
      <div className="photo-wrapper">
        <img
          src={photo.thumbnail || photo.uploadedUrl}
          alt={photo.fileName}
          className="photo-image"
          style={{ opacity: getImageOpacity() }}
        />
        
        {/* 우상단 뱃지 */}
        <div className="photo-badge" style={{ backgroundColor: display.badgeColor }}>
          {getBadgeIcon()}
        </div>
        
        {/* 진행률 바 (업로드 중일 때만) */}
        {photo.status === 'UPLOADING' && photo.uploadProgress && (
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        )}
      </div>
      
      {/* 파일 정보 */}
      <div className="photo-info">
        <div className="filename" title={photo.fileName}>
          {photo.fileName}
        </div>
        
        <div className="file-size">
          {(photo.fileSize / 1024 / 1024).toFixed(1)} MB
        </div>
        
        <div className="status-text">
          {display.text}
        </div>
      </div>
      
      {/* 에러 메시지 */}
      {(photo.status === 'UPLOAD_FAILED' || photo.status === 'PROCESSING_FAILED') && (
        <div className={`error-section ${photo.status === 'UPLOAD_FAILED' ? 'error' : 'warning'}`}>
          <div className="error-message">
            {display.errorMsg || '오류가 발생했습니다'}
          </div>
          <div className="attempt-counter">
            시도: {display.attempt}
          </div>
        </div>
      )}
      
      {/* 버튼 */}
      {(photo.status === 'UPLOAD_FAILED' || photo.status === 'PROCESSING_FAILED') && (
        <div className="action-buttons">
          <button
            className="btn btn-retry"
            onClick={() => onRetry(photo.id)}
            disabled={!canRetry}
            title={canRetry ? "재시도" : "재시도 횟수 초과"}
          >
            {canRetry ? '🔄 재시도' : '❌ 재시도 불가'}
          </button>
          <button
            className="btn btn-delete"
            onClick={() => onDelete(photo.id)}
            title="삭제"
          >
            🗑️ 삭제
          </button>
        </div>
      )}
      
    </div>
  );
}
```

### PhotoGridItem.css (V2)

```css
.photo-grid-item {
  position: relative;
  width: 120px;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  background: white;
}

/* 배경색 상태 */
.photo-grid-item.bg-success-light {
  background: #E8F5E9;
  border-color: #4CAF50;
}

.photo-grid-item.bg-error-light {
  background: #FFEBEE;
  border-color: #F44336;
}

.photo-grid-item.bg-warning-light {
  background: #FFF3E0;
  border-color: #FF9800;
}

.photo-grid-item.bg-normal {
  background: white;
  border-color: #e0e0e0;
}

/* 사진 영역 */
.photo-wrapper {
  position: relative;
  width: 100%;
  height: 100px;
  overflow: hidden;
  background: #f5f5f5;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

/* 우상단 뱃지 */
.photo-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  font-size: 14px;
  transition: all 0.3s ease;
}

/* 스피닝 원 */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid;
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
}

.spinner.blue {
  color: #2196F3;
  border-color: #e3f2fd;
  border-top-color: #2196F3;
}

.spinner.orange {
  color: #FF9800;
  border-color: #ffe0b2;
  border-top-color: #FF9800;
}

/* 아이콘들 */
.icon-checkmark {
  color: #4CAF50;
  font-size: 14px;
  font-weight: bold;
  line-height: 1;
}

.icon-error-x {
  color: #F44336;
  font-size: 14px;
  font-weight: bold;
  line-height: 1;
}

.icon-warning {
  color: #FF6F00;
  font-size: 14px;
  font-weight: bold;
  line-height: 1;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 진행률 바 */
.progress-bar-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: #e0e0e0;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #2196F3, #1976D2);
  width: 0%;
  transition: width 0.2s ease;
}

/* 파일 정보 */
.photo-info {
  padding: 6px 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.filename {
  font-size: 12px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 11px;
  color: #999;
}

.status-text {
  font-size: 11px;
  font-weight: 500;
  margin-top: 2px;
}

/* 에러 섹션 */
.error-section {
  padding: 4px 6px;
  font-size: 10px;
  border-top: 1px solid rgba(0,0,0,0.1);
  white-space: normal;
}

.error-section.error {
  background: rgba(244, 67, 54, 0.1);
  color: #d32f2f;
  border-top-color: rgba(244, 67, 54, 0.2);
}

.error-section.warning {
  background: rgba(255, 152, 0, 0.1);
  color: #e65100;
  border-top-color: rgba(255, 152, 0, 0.2);
}

.error-message {
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.attempt-counter {
  font-size: 9px;
  opacity: 0.8;
}

/* 버튼 */
.action-buttons {
  display: flex;
  padding: 4px;
  gap: 4px;
  background: rgba(0,0,0,0.05);
  border-top: 1px solid rgba(0,0,0,0.1);
}

.btn {
  flex: 1;
  padding: 3px 4px;
  font-size: 10px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-weight: 500;
}

.btn-retry {
  background: #2196F3;
  color: white;
}

.btn-retry:hover:not(:disabled) {
  background: #1976D2;
  box-shadow: 0 2px 4px rgba(33, 150, 243, 0.3);
}

.btn-retry:disabled {
  background: #ccc;
  color: #999;
  cursor: not-allowed;
  opacity: 0.5;
}

.btn-delete {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.btn-delete:hover {
  background: #eee;
  border-color: #999;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 호버 효과 */
.photo-grid-item:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.photo-grid-item.bg-error-light:hover,
.photo-grid-item.bg-warning-light:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
```

---

## 9. 최종 상태 다이어그램 (V2 완성)

```
                        ┌─ READY ✅ (초록 체크)
                        │
PENDING → UPLOADING → UPLOAD_COMPLETED → PROCESSING ─┤
  ↓         ↓                                          │
  └────────────────────────────────────────────────────┴─ PROCESSING_FAILED ❌ (주황 ⚠️)
            ↓
        UPLOAD_FAILED ❌ (빨강 ✕)


색상 정의:
├─ 파란색 (#2196F3): 파일 업로드 단계 (UPLOADING)
├─ 주황색 (#FF9800): 메타정보 처리 단계 (PROCESSING)
├─ 초록색 (#4CAF50): ✅ 성공 (READY)
└─ 빨강색 (#F44336): ❌ 실패 (모든 실패 상태, 아이콘으로 구분)
   ├─ ✕ (X 두 줄): UPLOAD_FAILED
   └─ ⚠ (삼각형): PROCESSING_FAILED
```

---

## 10. 구현 체크리스트 (완성)

```
[ ] 1. Firestore 스키마
    [x] 7가지 상태 정의
    [x] 재시도 횟수 필드
    [x] 타이밍 필드
    [ ] 마이그레이션 스크립트

[ ] 2. Cloud Function
    [x] processUploadedPhoto()
    [x] detectUploadTimeout()
    [x] detectProcessingTimeout()
    [ ] autoCleanupFailedPhotos()

[ ] 3. UI 컴포넌트
    [x] PhotoGridItem.jsx (V2)
    [x] PhotoGridItem.css (V2)
    [x] 7가지 상태 렌더링
    [ ] Firestore 실시간 리스너

[ ] 4. 색상 및 아이콘
    [x] 7가지 색상 정의
    [x] 아이콘 정의 (✓, ✕, ⚠️)
    [x] CSS 애니메이션
    [ ] 최적화 (CSS 사이즈)

[ ] 5. 테스트
    [ ] 단위 테스트
    [ ] E2E 테스트 (모든 경로)
    [ ] 타임아웃 테스트
    [ ] 자동 정리 테스트

[ ] 6. 문서화
    [x] 상태 머신 다이어그램
    [x] UI 스펙
    [ ] API 문서
    [ ] 운영 가이드
```

---

## 최종 결론

### 7가지 상태 + 명확한 색상 & 아이콘 = 완벽한 설계 ✅

```
상태 머신 (7개):
├─ PENDING (준비)
├─ UPLOADING (파란색, 스피닝 원)
├─ UPLOAD_COMPLETED (주황색, 짧음)
├─ PROCESSING (주황색, 스피닝 원)
├─ READY ✅ (초록 체크마크)
├─ UPLOAD_FAILED ❌ (빨강 X 두 줄, 최대 3회 재시도)
└─ PROCESSING_FAILED ⚠️ (빨강 느낌표, 최대 2회 재시도)

색상 규칙:
├─ 파란색: 파일 업로드 진행
├─ 주황색: 메타정보 처리 진행
├─ 초록색: ✅ 완료 (사용 가능)
└─ 빨강색: ❌ 모든 실패 (아이콘으로 구분)

자동 정리:
├─ UPLOAD_FAILED: 7일 후 자동 삭제
├─ PROCESSING_FAILED: 14일 후 자동 삭제
└─ 타임아웃: 300초(UPLOADING), 180초(PROCESSING)

사용자 경험:
├─ 명확한 상태 표시 (색상 + 아이콘)
├─ 재시도 횟수 표시 (1/3, 2/2)
├─ 에러 메시지 (기술적 상세)
└─ 쉬운 복구 (재시도, 삭제)

프로덕션 수준의 완벽한 설계 🎉
```
