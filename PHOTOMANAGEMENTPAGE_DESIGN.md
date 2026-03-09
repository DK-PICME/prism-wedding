# PhotoManagementPage 상세 설계 문서

**작성일**: 2026-03-09  
**상태**: 설계 확정  
**참고**: PHASE2_MASTER_SPEC.md 의 §7 + 전체 플로우 참고

---

## 1. 개념 정의

### Project (프로젝트)
- **정의**: 사용자의 웨딩 촬영 프로젝트 (예: "2025년 3월 실내 촬영")
- **계층**: 1뎁스만 허용 (Project > Photo, 이상 없음)
- **용도**: 사진들을 주제별/시간별로 그룹화하여 관리
- **기본값**: 사용자 첫 생성 시 "기본 프로젝트" 자동 생성

### Photo (사진)
- **정의**: 각 Project에 속하는 개별 사진
- **상태**: 7가지 (UPLOADING, UPLOAD_COMPLETED, PROCESSING, READY, UPLOAD_FAILED, PROCESSING_FAILED, READONLY)
- **선택 가능 조건**: `status === 'READY' AND !isLocked`

---

## 2. Firestore 데이터 모델

### 2.1 Project 컬렉션

```typescript
interface Project {
  id: string;                    // Firestore auto-ID
  userId: string;                // 소유자 UID
  name: string;                  // 프로젝트명 (예: "2025년 3월 웨딩")
  description: string | null;    // 설명 (선택사항)
  photoCount: number;            // 사진 개수 (캐시)
  totalSize: number;             // 총 파일 크기 bytes (캐시)
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.2 Photo 컬렉션

```typescript
interface Photo {
  id: string;
  userId: string;
  projectId: string;             // 소속 프로젝트 ID
  
  // ── 파일 정보 ──
  fileName: string;
  fileSize: number;
  fileExt: string;               // 'jpg' | 'jpeg' | 'png' | 'webp'
  fileMd5: string | null;
  
  // ── 상태 (7가지) ──
  status: PhotoStatus;
  
  // ── 주문 연계 ──
  isLocked: boolean;
  lockedByOrder: string | null;
  lockExpiry: Timestamp | null;
  usedInOrders: string[];
  
  // ── 업로드 진행 ──
  uploadProgress: number;        // 0-100
  uploadError: string | null;
  uploadAttempt: number;         // 최대 3회
  
  // ── 처리 진행 ──
  processingError: string | null;
  processingAttempt: number;     // 최대 2회
  
  // ── URL들 ──
  uploadedUrl: string | null;
  thumbnailUrl: string | null;
  previewUrl: string | null;
  webpUrl: string | null;
  internalBackupUrl: string | null;
  
  // ── 메타데이터 ──
  metadata: {
    width: number;
    height: number;
    format: string;
    colorspace: string;
    hasAlpha: boolean;
  } | null;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 3. UI 구조

### 3.1 전체 레이아웃

```
┌─────────────────────────────────────────────────────┐
│  Header: "사진 관리" + "새 프로젝트" 버튼            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                                                     │
│ [Project 1: "2025년 3월"]                           │
│  2025-03-09  [▼ 펴기] [✎ 수정] [🗑 삭제]          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  사진 그리드 (4-6열)                               │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                  │
│  │ ☑   │ │ ☑   │ │ ☑   │ │ ☑   │                  │
│  │ [이미지] │ [이미지] │ [이미지] │ [이미지] │        │
│  │ ✓READY  │ ⟳UPLOAD │ ✓READY  │ ✕FAILED  │       │
│  │ [🗑]    │ [🔄]    │ [🗑]    │ [🔄][🗑] │        │
│  └─────┘ └─────┘ └─────┘ └─────┘                  │
│                                                     │
│  또는 (비었을 때):                                  │
│  ┌───────────────────────────────────────────────┐ │
│  │  ☁ 사진을 드래그해서 업로드하세요             │ │
│  │  [파일 선택]                                  │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ [Project 2: "2025년 2월"]                           │
│  2025-02-15  [▶ 접기] [✎ 수정] [🗑 삭제]          │
├─────────────────────────────────────────────────────┤
│  (접혀있음 - 사진 그리드 미표시)                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ [하단 액션 바]                                      │
│  선택됨: 3개  [주문 생성] (활성/비활성)             │
└─────────────────────────────────────────────────────┘
```

### 3.2 Project 섹션 헤더

```
┌──────────────────────────────────────────────┐
│ 📁 프로젝트명              생성날짜 [▼] [✎][🗑] │
└──────────────────────────────────────────────┘
  • 좌측: 프로젝트 아이콘 + 이름
  • 우측: 생성날짜 + 접기/펴기 토글 + 수정/삭제 버튼
  • 배경: 연한 회색 (border-bottom)
  • 높이: 48px
```

### 3.3 사진 카드

```
┌──────────────┐
│ ☑ [상태배지] │  (상단 좌측: 체크박스, 상단 우측: 배지)
│              │
│ [이미지      │  (사진, 실패/처리중이면 그레이아웃)
│  미리보기]   │
│              │
│ [파일명]     │  (하단: 파일명 + 크기)
│ 2.5 MB       │
└──────────────┘

호버 시:
└──────────────┐
│ ☑ [상태배지] │
│              │
│ [이미지      │
│  미리보기]   │
│   [🔄][🗑]   │  (액션 버튼)
│ [파일명]     │
└──────────────┘
```

---

## 4. 기능 명세

### 4.1 Project CRUD

#### Create (새 프로젝트)
```
UI: "새 프로젝트" 버튼 → 다이얼로그
입력: 프로젝트명 (required, max 50자)
      설명 (optional, max 200자)
결과: Firestore에 Project 문서 생성
     UI 실시간 반영 (onSnapshot)
```

#### Read (목록 조회)
```
쿼리: Firestore
  where('userId', '==', currentUser.uid)
  orderBy('createdAt', 'desc')
리스너: onSnapshot (실시간 업데이트)
표시: Project 섹션별로 (헤더 포함)
```

#### Update (이름 수정)
```
UI: 섹션 헤더의 [✎] 버튼 → 인라인 수정 또는 다이얼로그
입력: 새 프로젝트명
결과: Firestore 업데이트
```

#### Delete (삭제)
```
UI: 섹션 헤더의 [🗑] 버튼 → 확인 팝업
검증: Project 내 모든 사진도 삭제 (Cascade)
      또는 사진이 있으면 확인 필요
결과: Firestore에서 Project + 모든 Photo 삭제
```

### 4.2 사진 관리

#### 업로드 (Drag & Drop)
```
Flow:
  1. 사용자가 파일을 드래그해서 Project 섹션으로 드롭
  2. PhotoService.createPhotoDocument() → UPLOADING 상태로 Firestore 저장
  3. StorageService.uploadPhoto() → Cloud Storage에 업로드
  4. 진행률 표시 (0-100%)
  5. uploadCompleted() → UPLOAD_COMPLETED 상태
  6. Cloud Function 자동 실행 (Pub/Sub 트리거)
     → PROCESSING → READY

조건:
  - JPG, PNG, WebP만 지원
  - 최대 10MB
  - Project별로 독립적 업로드
```

#### 선택 (체크박스)
```
선택 가능 조건: status === 'READY' AND !isLocked
선택 불가 조건:
  - UPLOADING, PROCESSING (진행 중)
  - UPLOAD_FAILED, PROCESSING_FAILED (실패)
  - isLocked === true (주문 진행 중)

상태 관리:
  - sessionStorage에 저장 (임시)
  - 또는 Component state 관리
```

#### 상태별 UI (7가지)

| # | 상태 | 배지 | 색상 | 액션 | 비고 |
|----|------|------|------|------|------|
| 1 | UPLOADING | ⟳ | 파란색 | - | 진행률 바 표시 |
| 2 | UPLOAD_COMPLETED | ⟳ | 주황색 | - | - |
| 3 | PROCESSING | ⟳ | 주황색 | - | - |
| 4 | READY | ✓ | 초록색 | 🗑 | 선택 가능 |
| 5 | READY + isLocked | 🔒 | 회색 | - | 주문 진행 중 |
| 6 | UPLOAD_FAILED | ✕ | 빨간색 | 🔄(3) 🗑 | 재시도 3회 제한 |
| 7 | PROCESSING_FAILED | ⚠ | 빨간색 | 🔄(2) 🗑 | 재시도 2회 제한 |

#### 삭제
```
UI: 사진 카드의 [🗑] 버튼 → 확인 팝업
검증: isLocked === false만 삭제 가능
결과: Firestore에서 Photo 삭제
     Cloud Storage 파일도 삭제 (선택사항)
```

#### 재시도
```
UI: 실패 사진의 [🔄] 버튼
동작: UPLOAD_FAILED → 업로드 재시도
     PROCESSING_FAILED → Cloud Function 재트리거
제한: 업로드 최대 3회, 처리 최대 2회
     초과 시 버튼 비활성화
```

### 4.3 실시간 업데이트

```javascript
// React hook
useEffect(() => {
  const unsubscribeProjects = onSnapshot(
    query(
      collection(db, 'projects'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    ),
    (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    }
  );
  
  const unsubscribePhotos = onSnapshot(
    query(
      collection(db, 'photos'),
      where('userId', '==', currentUser.uid)
    ),
    (snapshot) => {
      setPhotos(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    }
  );
  
  return () => {
    unsubscribeProjects();
    unsubscribePhotos();
  };
}, [currentUser.uid]);
```

### 4.4 "주문 생성" 버튼

```
표시: 하단 고정 바
상태:
  - 비활성 (회색): 선택된 사진 0개
  - 활성 (검은색): 선택된 사진 1개 이상

클릭:
  → selectedPhotoIds + projectId를 React Router state로 전달
  → CreateNewOrderPage로 이동 (/create-new-order)
  → CreateNewOrderPage에서 sessionStorage 또는 URL 파라미터로 복원
```

---

## 5. Project 비었을 때 UI

```
┌─────────────────────────────────────────────────────┐
│ [Project 1: "기본 프로젝트"]                         │
│  2025-03-09  [▼] [✎] [🗑]                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│              (빈 상태)                              │
│                                                     │
│          ┌─────────────────────────┐                │
│          │       ☁️ 업로드        │                │
│          │   사진을 드래그해서       │                │
│          │   업로드하세요           │                │
│          │   JPG, PNG, WebP         │                │
│          │   (최대 10MB)            │                │
│          │  [파일 선택]            │                │
│          └─────────────────────────┘                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 특징
- 중앙 정렬
- 대형 아이콘 + 텍스트
- "파일 선택" 버튼
- 흐린 배경 또는 border

---

## 6. 섹션 토글 (접기/펴기)

```javascript
// State
const [expandedProjects, setExpandedProjects] = useState({});

// Toggle
const toggleProject = (projectId) => {
  setExpandedProjects(prev => ({
    ...prev,
    [projectId]: !prev[projectId]
  }));
};

// UI
<button onClick={() => toggleProject(project.id)}>
  {expandedProjects[project.id] ? '▼ 펴기' : '▶ 접기'}
</button>

// 조건부 렌더
{expandedProjects[project.id] && (
  <PhotoGrid photos={photosByProject[project.id]} />
)}
```

---

## 7. 고도화 기능 (TODO)

### 📌 사진을 다른 Project로 드래그 이동

```
현재: 각 Project 내에서만 Drag & Drop
향후:
  - Source: Project A의 사진
  - Target: Project B의 drop zone
  - 결과: Photo.projectId = ProjectB

구현 예상:
  - React DnD 또는 HTML5 Drag API 확장
  - Project 간 drop zone 감지
  - Photo document의 projectId 업데이트
  - UI 실시간 반영
```

---

## 8. 상태 관리 구조

```
PhotoManagementPage Component
├─ projects: Project[]
├─ photos: Photo[]
├─ selectedPhotoIds: Set<string>
├─ expandedProjects: { [projectId]: boolean }
├─ uploadingFiles: { [photoId]: progress }
└─ loading: boolean

Helper Functions:
├─ loadProjects() → onSnapshot
├─ loadPhotos() → onSnapshot
├─ selectPhoto(photoId) → Set 추가
├─ deselectPhoto(photoId) → Set 제거
├─ toggleProject(projectId) → 토글
├─ deleteProject(projectId) → Firestore 삭제
├─ updateProjectName(projectId, newName) → 업데이트
└─ createProject(name, description) → 생성
```

---

## 9. Analytics 추적

```javascript
// 페이지 진입
analyticsService.track('photo_management_viewed');

// 프로젝트 생성
analyticsService.track('project_created', {
  projectName: name,
});

// 사진 업로드 시작
analyticsService.track('photo_upload_started', {
  fileName: file.name,
  fileSize: file.size,
  projectId: projectId,
});

// 사진 업로드 완료
analyticsService.track('photo_upload_completed', {
  fileName: file.name,
  duration: uploadDuration,
});

// 사진 선택
analyticsService.track('photo_selected', {
  photoId: photoId,
  totalSelected: selectedCount,
});

// 주문 생성 진행
analyticsService.track('order_creation_started', {
  photoCount: selectedPhotos.length,
  projectId: projectId,
});

// 에러
analyticsService.trackError('photo_upload_failed', error.message);
```

---

## 10. 에러 처리

| 에러 | 메시지 | 액션 |
|------|--------|------|
| 파일 형식 오류 | "JPG, PNG, WebP만 지원합니다" | 재선택 유도 |
| 파일 크기 초과 | "파일이 10MB를 초과했습니다" | 압축 유도 |
| 업로드 실패 | "업로드 실패. 재시도하세요" | [🔄 재시도] 버튼 |
| 처리 실패 | "사진 처리 실패. 재시도하세요" | [🔄 재시도] 버튼 |
| 타임아웃 | "업로드 시간 초과 (300초)" | 자동 UPLOAD_FAILED |
| 네트워크 오류 | "네트워크 연결을 확인하세요" | 재시도 유도 |

---

## 11. 구현 순서

```
1️⃣ ProjectService (CRUD)
2️⃣ Firestore Project 컬렉션 설정
3️⃣ PhotoManagementPage 기본 구조 (프로젝트 목록 조회)
4️⃣ Project 섹션 UI (헤더, 토글)
5️⃣ 사진 업로드 (기존 PhotoService 활용)
6️⃣ 사진 선택 로직
7️⃣ Real-time 리스너
8️⃣ Project CRUD UI (생성, 수정, 삭제)
9️⃣ 하단 "주문 생성" 버튼
🔟 Analytics + 테스트
```

---

**작성자**: CTO Support  
**최종 수정**: 2026-03-09
