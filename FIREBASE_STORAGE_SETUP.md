# 🔧 Firebase Storage 활성화 및 배포 가이드

## **Cloud Storage 설정 (수동)**

### **1단계: Firebase Console 접속**
https://console.firebase.google.com/project/prism-wedding-84b5d/storage

### **2단계: "Get Started" 클릭**
- 스토리지 위치: `asia-northeast3` (기존 프로젝트와 동일)
- 규칙: "Start in production mode" 선택

### **3단계: 활성화 대기**
- 약 1-2분 소요
- 완료되면 자동으로 Rules를 적용

---

## **Storage Rules 배포**

활성화 후 아래 명령어로 Rules를 배포:

```bash
firebase deploy --only storage
```

---

## **완료 후 Hosting 재배포**

```bash
npm run deploy
```

---

## **Storage 폴더 구조**

```
user-uploads/
  ├── {userId}/
  │   ├── {projectId}/
  │   │   └── {photoId}.jpg
```

각 사용자는 자신의 폴더만 접근 가능합니다.

---

## **테스트**

1. 프로덕션 사이트 접속: https://prism-wedding-84b5d.web.app
2. 로그인
3. 사진 관리 페이지에서 사진 업로드 테스트

---

이 가이드대로 하면 모든 에러가 해결됩니다!
