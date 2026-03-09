# 환경 분리 TODO

**상태**: 🔴 대기 중  
**우선순위**: 중간  
**예상 시간**: 2시간

## 개요

현재 개발 환경이 Firebase 프로덕션으로 직접 연결되어 있습니다.
나중에 개발/운영 환경을 완전히 분리해야 합니다.

## 해야 할 일

### 1️⃣ Firebase 프로젝트 분리

- [ ] Firebase 프로젝트 2개 생성:
  - `prism-wedding-dev` (개발)
  - `prism-wedding-prod` (운영) ← 현재

- [ ] 각 프로젝트의 Firebase Config 저장

### 2️⃣ 환경변수 분리

- [ ] `.env.development` 업데이트
  ```
  VITE_FIREBASE_API_KEY=dev_key
  VITE_FIREBASE_AUTH_DOMAIN=dev_auth_domain
  ...
  ```

- [ ] `.env.production` 유지
  ```
  VITE_FIREBASE_API_KEY=prod_key
  ...
  ```

### 3️⃣ npm 스크립트 추가

- [ ] `npm run dev` → dev Firebase 사용
- [ ] `npm run build` → prod Firebase 사용

### 4️⃣ Firestore 규칙 설정

- [ ] 개발 환경: 모든 사용자 접근 허용 (테스트용)
- [ ] 운영 환경: 사용자 인증만 허용

### 5️⃣ 자동화

- [ ] 개발 환경에서 자동으로 테스트 데이터 초기화 (선택사항)
- [ ] CI/CD에 환경 분리 로직 추가

## 주의사항

⚠️ **현재 상태**: 개발과 운영이 같은 Firebase 프로젝트 사용
- 개발 중 실수로 운영 데이터 수정 가능성
- 테스트 데이터로 인한 운영 데이터 오염

## 참고 자료

- [Firebase 여러 프로젝트 관리](https://firebase.google.com/docs/projects/learn-more?hl=ko)
- [환경변수 관리 가이드](https://vitejs.dev/guide/env-and-mode.html)

---

**작성일**: 2026-03-09  
**대상 마일스톤**: Phase 2 완성 후
