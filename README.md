# 프리즘 스튜디오 - 웨딩 프로젝트 웹앱

React + Vite + Tailwind CSS로 구축한 프리즘 스튜디오 고객 포털 프로젝트입니다.

## 📑 페이지 구성

| 페이지 | URL | 설명 |
|------|-----|------|
| **Waiting Page** (STEP ①) | `?page=waiting` | 샘플 검토 대기 중 상태 표시 |
| **Upload Page** (STEP ①) | `?page=upload` | 샘플 사진 및 요청사항 업로드 |
| **Result Page** (STEP ②) | `?page=result` | 샘플 보정 결과 확인 및 만족도 투표 |
| **Status Page** (STEP ④) | `?page=status` | 고유 URL을 통한 진행상황 조회 |

## 프로젝트 구조

```
wedding/
├── src/
│   ├── components/        # 재사용 가능한 React 컴포넌트
│   │   ├── Header.jsx     # 상단 네비게이션 (진행 단계 표시)
│   │   ├── Footer.jsx     # 하단 정보 및 연락처
│   │   ├── StatusMessage.jsx
│   │   ├── ProjectInfo.jsx
│   │   ├── NextSteps.jsx
│   │   └── ContactInfo.jsx
│   ├── pages/             # 페이지 단위 컴포넌트
│   │   ├── WaitingPage.jsx
│   │   ├── UploadPage.jsx
│   │   ├── ResultPage.jsx
│   │   └── CurrentStatusPage.jsx
│   ├── services/          # 비즈니스 로직 및 API 통신
│   │   ├── ProjectService.js (인터페이스)
│   │   └── ProjectServiceMock.js (개발용 더미 구현)
│   ├── hooks/             # 커스텀 React 훅
│   │   └── useProject.js
│   ├── utils/             # 유틸리티 함수
│   │   └── helpers.js
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
└── _backup/               # 기존 HTML 파일 백업
```

## 설치 및 실행

### 의존성 설치

```bash
npm install
```

### 개발 서버 시작

```bash
npm run dev
```

기본 포트는 `5173`입니다. 브라우저에서 `http://localhost:5173` 접속 후 `?projectId=proj_001` 파라미터를 추가하여 테스트합니다.

### 프로덕션 빌드

```bash
npm run build
```

## 기능

### 현재 구현된 기능

#### 1️⃣ Waiting Page (STEP ①)
- ✅ 프로젝트 정보 조회 (Mock 데이터)
- ✅ 상태별 메시지 표시
- ✅ 진행 정보 표시 (예상 납기일, 진행 상태, 업로드 상태)
- ✅ 로딩 상태 처리
- ✅ 에러 처리

#### 2️⃣ Upload Page (STEP ①)
- ✅ 드래그 앤 드롭 파일 업로드
- ✅ 파일 선택 대화창
- ✅ 요청사항 텍스트 입력
- ✅ 폼 검증
- ✅ 업로드 완료 처리

#### 3️⃣ Result Page (STEP ②)
- ✅ 비포/애프터 이미지 비교
- ✅ 요청사항 요약 표시
- ✅ 만족도 투표 (만족/재수정)
- ✅ 조건부 다운로드 버튼 (만족 확인 후 활성화)
- ✅ 다음 단계 안내

#### 4️⃣ Status Page (STEP ④)
- ✅ 프로젝트 정보 표시
- ✅ 4단계 진행상황 리스트
- ✅ 단계별 잠금/해제 표시
- ✅ 반응형 디자인 (Tailwind CSS)

### 개발 중인 기능

- 🔄 Firebase Firestore 연동
- 🔄 실시간 상태 업데이트
- 🔄 실제 파일 업로드 처리

## 백엔드 연동

### 현재 상태

- **Mock 구현** (ProjectServiceMock): 개발/테스트용 더미 데이터 제공
- **인터페이스** (ProjectService): 실제 Firebase 구현 시 참고 가능

### Firebase 연동 방법

1. `src/services/` 에 `ProjectServiceFirebase.js` 파일 생성
2. `ProjectService` 인터페이스를 상속받아 실제 Firebase 메서드 구현
3. `src/App.jsx` 에서 아래와 같이 변경:

```javascript
// 변경 전
import { ProjectServiceMock } from './services/ProjectServiceMock';
const projectService = new ProjectServiceMock();

// 변경 후
import { ProjectServiceFirebase } from './services/ProjectServiceFirebase';
const projectService = new ProjectServiceFirebase();
```

## URL 파라미터

- `?page=waiting&projectId=proj_001`: 샘플 검토 대기 페이지 (기본값)
- `?page=upload`: 샘플 업로드 페이지
- `?page=result`: 샘플 결과 확인 페이지
- `?page=status`: 고유 URL 진입 및 현재 상태 확인 페이지

### 테스트 URL 예시

```bash
# 샘플 검토 대기 페이지
http://localhost:5173/?page=waiting&projectId=proj_001

# 다른 프로젝트 상태 (Mock에서 제공하는 더미 데이터)
http://localhost:5173/?page=waiting&projectId=proj_002  # 완료 상태
http://localhost:5173/?page=waiting&projectId=proj_003  # 대기 상태

# 샘플 업로드 페이지
http://localhost:5173/?page=upload

# 샘플 결과 확인 페이지
http://localhost:5173/?page=result

# 현재 진행상황 조회 페이지
http://localhost:5173/?page=status
```

## 개발 가이드

### 새로운 페이지 추가

1. `src/pages/` 에 새로운 컴포넌트 파일 생성
2. 필요한 컴포넌트들을 import하여 조립
3. `App.jsx` 에서 라우팅 추가 (필요 시)

### 새로운 컴포넌트 추가

1. `src/components/` 에 파일 생성
2. 재사용 가능하도록 props를 통해 데이터 전달
3. 컴포넌트는 순수 함수형으로 작성

### 데이터 흐름

```
App.jsx
  └─ WaitingPage.jsx
      ├─ Header.jsx
      ├─ StatusMessage.jsx
      ├─ ProjectInfo.jsx
      ├─ NextSteps.jsx
      ├─ ContactInfo.jsx
      └─ Footer.jsx
```

## 스타일링

- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **커스텀 색상**: `tailwind.config` 에 정의된 primary 색상 사용 가능

## 라이선스

Copyright © 2026 Prism Studio. All rights reserved.
