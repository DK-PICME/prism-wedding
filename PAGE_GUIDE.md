# Prism Studio - 페이지 가이드

이 문서는 Prism Studio 애플리케이션의 모든 페이지에 접근하는 방법을 설명합니다.

## 주요 페이지 목록

### 주문 관리
- **[주문 내역](http://localhost:5173/?page=order-list)** - 모든 주문을 조회하고 관리하는 페이지
  - 주문 상태별 통계 (대기중, 진행중, 완료)
  - 주문 목록 테이블
  - 검색 및 필터링 기능

- **[주문 상세](http://localhost:5173/?page=order-details)** - 특정 주문의 상세 정보 조회
  - 주문 정보 및 결제 정보
  - 타임라인

- **[새 주문 생성](http://localhost:5173/?page=create-new-order)** - 새로운 주문 생성
  - 기본 정보 입력 (신부명, 신랑명, 웨딩 종류 등)
  - 견적 정보 입력

### 사진 관리
- **[사진 관리](http://localhost:5173/?page=photo-management)** - 프로젝트별 사진 관리
  - 사진 업로드 영역 (드래그 & 드롭)
  - 사진 목록 (그리드/리스트 뷰)
  - 사진 통계 (총 사진, 업로드 완료 등)

- **[실패 항목 관리](http://localhost:5173/?page=failed-items)** - 업로드 실패 항목 관리
  - 실패 항목 목록
  - 실패 사유별 필터링
  - 재시도 및 삭제 기능

### 알림 및 설정
- **[알림 센터](http://localhost:5173/?page=notification-center)** - 모든 알림 통합 관리
  - 업로드, 주문, 다운로드 관련 알림
  - 알림 통계

- **[설정](http://localhost:5173/?page=settings)** - 계정 및 서비스 설정
  - 프로필 설정
  - 로그인 및 보안 설정
  - 알림 설정
  - 다운로드 설정
  - 언어 및 테마 설정

### 결제 및 인증
- **[결제](http://localhost:5173/?page=payment)** - 주문 결제 처리
  - 주문 정보 확인
  - 결제 방법 선택 (신용카드, 계좌이체, 휴대폰 결제)
  - 결제 요약

- **[비밀번호 찾기](http://localhost:5173/?page=password-recovery)** - 비밀번호 재설정
  - 이메일을 통한 재설정 링크 전송

- **[회원가입](http://localhost:5173/?page=sign-up)** - 새 계정 생성
  - 스튜디오명, 이메일, 비밀번호 입력
  - 약관 동의
  - 소셜 로그인 옵션 (Google, Naver)

### 고객 지원
- **[문의](http://localhost:5173/?page=inquiry)** - 고객 문의 페이지
  - FAQ 섹션
  - 직접 문의 양식
  - 연락처 정보 (이메일, 전화, 카카오톡)

## URL 쿼리 파라미터

기본 URL: `http://localhost:5173/?page=PAGE_NAME`

## 개발 및 배포

### 개발 서버 실행
```bash
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
```

### 배포
```bash
npm run deploy
```

## 기술 스택
- React 18
- Vite
- Tailwind CSS
- Font Awesome 6.4.0
- Firebase Hosting

## 컴포넌트 구조

```
src/
├── pages/
│   ├── OrderListPage.jsx
│   ├── OrderDetailsPage.jsx
│   ├── CreateNewOrderPage.jsx
│   ├── PhotoManagementPage.jsx
│   ├── FailedItemManagementPage.jsx
│   ├── NotificationCenterPage.jsx
│   ├── SettingsPage.jsx
│   ├── PaymentPage.jsx
│   ├── PasswordRecoveryPage.jsx
│   ├── SignUpPage.jsx
│   ├── InquiryPage.jsx
│   └── [기타 페이지]
├── components/
│   ├── PrismHeader.jsx
│   ├── PrismFooter.jsx
│   └── [기타 컴포넌트]
└── App.jsx
```

## 주요 컴포넌트

### PrismHeader
- 헤더 네비게이션
- 현재 페이지 하이라이트
- 사용자 정보 표시
- 알림 버튼

### PrismFooter
- 회사 정보
- 빠른 링크 (서비스, 지원, 회사)
- 저작권 정보

## 스타일링

모든 페이지는 **Tailwind CSS**로 스타일링되어 있으며, 다음의 색상 팔레트를 사용합니다:
- Primary: Neutral (Gray) 색상
- Accent: 검정색 (neutral-900)
- Background: 흰색 / 밝은 회색 (neutral-50)

## 주요 기능

✅ 반응형 디자인
✅ 다크모드 설정 지원
✅ 다국어 지원 (한국어, English, 日本語, 中文)
✅ 알림 설정 커스터마이징
✅ 프로필 및 계정 관리
✅ 안전한 결제 프로세스
✅ 고객 지원 통합

---

**최종 수정**: 2025-01-22
**버전**: 1.0.0
