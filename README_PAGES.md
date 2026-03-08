# 🎊 Prism Studio - 웨딩 사진 보정 관리 시스템

![Prism Studio](https://img.shields.io/badge/Prism%20Studio-v1.0.0-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.0.8-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-Latest-38B2AC)

Prism Studio는 전문적인 웨딩 스튜디오를 위한 종합 사진 보정 관리 시스템입니다. AI 기반 사진 보정 서비스와 함께 주문 관리, 사진 업로드, 결제 처리 등의 기능을 제공합니다.

## ✨ 주요 기능

### 📋 주문 관리
- **주문 내역**: 모든 주문을 한눈에 조회 및 상태 관리
- **주문 생성**: 신규 주문 쉽게 등록
- **주문 상세**: 주문별 상세 정보 및 타임라인 확인
- **상태 추적**: 주문 진행 상태 실시간 모니터링

### 📸 사진 관리
- **드래그 & 드롭 업로드**: 간편한 사진 업로드
- **그리드/리스트 뷰**: 다양한 뷰 옵션
- **실패 항목 관리**: 업로드 실패 항목 추적 및 재시도
- **통계 대시보드**: 사진 처리 현황 실시간 표시

### 💳 결제 시스템
- **안전한 결제**: 신용카드, 계좌이체, 휴대폰 결제 지원
- **결제 관리**: 결제 내역 및 상태 확인
- **견적 계산**: 자동 견적 계산 및 표시

### 🔔 알림 시스템
- **통합 알림**: 업로드, 주문, 다운로드 관련 알림 통합 관리
- **알림 커스터마이징**: 알림 종류별 ON/OFF 설정
- **실시간 알림**: 상태 변화 시 즉시 알림

### ⚙️ 계정 관리
- **프로필 설정**: 스튜디오 정보 관리
- **보안 설정**: 비밀번호 변경 및 소셜 계정 연결
- **다운로드 설정**: 기본 폴더 및 파일명 규칙 설정
- **다국어 지원**: 한국어, English, 日本語, 中文

### 💬 고객 지원
- **자주 묻는 질문 (FAQ)**: 일반적인 질문에 대한 답변
- **연락처 정보**: 이메일, 전화, 카카오톡 지원
- **직접 문의**: 고객 문의 양식 제공

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 16 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone <repository-url>
cd wedding

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 열기
http://localhost:5173
```

## 📦 빌드 및 배포

### 프로덕션 빌드
```bash
npm run build
```

### Firebase 배포
```bash
npm run deploy          # 호스팅만 배포
npm run deploy:all      # 호스팅 + 함수 배포
npm run deploy:functions # 함수만 배포
```

### 로컬 에뮬레이터 실행
```bash
npm run emulators
```

## 🏗️ 프로젝트 구조

```
src/
├── pages/                          # 페이지 컴포넌트
│   ├── OrderListPage.jsx          # 주문 내역
│   ├── OrderDetailsPage.jsx        # 주문 상세
│   ├── CreateNewOrderPage.jsx      # 새 주문 생성
│   ├── PhotoManagementPage.jsx     # 사진 관리
│   ├── FailedItemManagementPage.jsx # 실패 항목 관리
│   ├── NotificationCenterPage.jsx  # 알림 센터
│   ├── SettingsPage.jsx            # 설정
│   ├── PaymentPage.jsx             # 결제
│   ├── PasswordRecoveryPage.jsx     # 비밀번호 찾기
│   ├── SignUpPage.jsx              # 회원가입
│   ├── InquiryPage.jsx             # 문의
│   └── [기타 페이지]
│
├── components/                     # 공통 컴포넌트
│   ├── PrismHeader.jsx            # 헤더 네비게이션
│   ├── PrismFooter.jsx            # 푸터
│   └── [기타 컴포넌트]
│
├── services/                       # API 서비스
│   ├── ProjectService.js          # 기본 서비스
│   ├── ProjectServiceApi.js       # API 연결
│   └── ProjectServiceMock.js      # Mock 데이터
│
├── hooks/                          # 커스텀 훅
│   └── useProject.js
│
├── utils/                          # 유틸리티
│   └── helpers.js
│
├── App.jsx                         # 메인 앱 컴포넌트
├── main.jsx                        # 진입점
└── App.css                         # 글로벌 스타일
```

## 📄 페이지 가이드

모든 페이지는 `?page=PAGE_NAME` 쿼리 파라미터로 접근합니다.

| 페이지 | URL | 설명 |
|-------|-----|------|
| 주문 내역 | `?page=order-list` | 모든 주문 조회 |
| 주문 상세 | `?page=order-details` | 특정 주문 상세 정보 |
| 새 주문 생성 | `?page=create-new-order` | 신규 주문 등록 |
| 사진 관리 | `?page=photo-management` | 사진 업로드 및 관리 |
| 실패 항목 관리 | `?page=failed-items` | 업로드 실패 항목 처리 |
| 알림 센터 | `?page=notification-center` | 알림 통합 관리 |
| 설정 | `?page=settings` | 계정 및 서비스 설정 |
| 결제 | `?page=payment` | 결제 처리 |
| 비밀번호 찾기 | `?page=password-recovery` | 비밀번호 재설정 |
| 회원가입 | `?page=sign-up` | 신규 계정 생성 |
| 문의 | `?page=inquiry` | 고객 문의 |

자세한 정보는 [PAGE_GUIDE.md](./PAGE_GUIDE.md)를 참고하세요.

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: Neutral (Gray) - 다양한 명도 제공
- **Accent**: Neutral-900 (검정색)
- **Background**: White / Neutral-50 (밝은 회색)
- **Success**: Green
- **Warning**: Yellow/Orange
- **Error**: Red

### 타이포그래피
- **Display**: 큼직한 제목 (3xl, 2xl)
- **Heading**: 섹션 제목 (xl, lg)
- **Body**: 본문 텍스트 (base)
- **Caption**: 작은 텍스트 (xs, sm)

### 컴포넌트
- **Button**: Primary, Secondary 스타일
- **Input**: 텍스트, 이메일, 비밀번호, 숫자 입력
- **Select**: 드롭다운 선택
- **Checkbox/Radio**: 선택 입력
- **Table**: 데이터 표시
- **Card**: 컨텐츠 그룹화

## 🔧 기술 스택

- **Frontend Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome 6.4.0
- **Backend**: Firebase
- **Hosting**: Firebase Hosting
- **Functions**: Firebase Functions

## 📊 상태 관리

현재는 Component Props를 통한 상태 관리를 사용합니다. 필요시 아래 옵션 고려:
- Redux Toolkit
- Zustand
- Jotai
- Context API

## 🧪 테스트

테스트는 환경 변수로 Mock/API를 전환합니다:

```bash
# Mock 데이터로 개발 (기본값)
npm run dev

# API 연결로 개발
VITE_USE_MOCK=false npm run dev
```

## 🌐 환경 변수

`.env` 파일을 프로젝트 루트에 생성:

```env
VITE_USE_MOCK=true
VITE_API_URL=http://localhost:3000
```

## 📝 코드 스타일

- **ESLint**: 코드 품질 검사
- **Prettier**: 코드 포맷팅 (선택적)
- **React Hooks**: 최신 React 패턴 사용
- **Functional Components**: 클래스 컴포넌트 대신 함수형 사용

## 🤝 기여 가이드

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이센스

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 팀 정보

**Prism Studio Team**
- 개발: AI Code Assistant
- 디자인: UI/UX Design System

## 📞 연락처

- 이메일: support@prismstudio.com
- 전화: 02-XXXX-XXXX
- 카카오톡: @prismstudio

## 🎯 향후 계획

- [ ] 모바일 앱 (React Native)
- [ ] 실시간 알림 시스템 (WebSocket)
- [ ] AI 이미지 프리뷰
- [ ] 팀 협업 기능
- [ ] 자동화된 워크플로우
- [ ] API 통합 도구
- [ ] 고급 분석 대시보드

## 📚 문서

- [PAGE_GUIDE.md](./PAGE_GUIDE.md) - 페이지별 가이드
- [package.json](./package.json) - 의존성 정보

---

**Made with ❤️ by Prism Studio**

마지막 업데이트: 2025-01-22
