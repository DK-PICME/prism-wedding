import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { WaitingPage } from './pages/WaitingPage';
import { UploadPage } from './pages/UploadPage';
import { ResultPage } from './pages/ResultPage';
import { CurrentStatusPage } from './pages/CurrentStatusPage';
import { CompletedPage } from './pages/CompletedPage';
import { MainCorrectionResultPage } from './pages/MainCorrectionResultPage';
import { SampleRevisionRequestPage } from './pages/SampleRevisionRequestPage';
import { MainCorrectionProgressPage } from './pages/MainCorrectionProgressPage';
import { MainCorrectionUploadPage } from './pages/MainCorrectionUploadPage';
import { OrderListPage } from './pages/OrderListPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotificationCenterPage } from './pages/NotificationCenterPage';
import { CreateNewOrderPage } from './pages/CreateNewOrderPage';
import { OrderDetailsPage } from './pages/OrderDetailsPage';
import { PaymentPage } from './pages/PaymentPage';
import { PasswordRecoveryPage } from './pages/PasswordRecoveryPage';
import { SignUpPage } from './pages/SignUpPage';
import { LoginPage } from './pages/LoginPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { InquiryPage } from './pages/InquiryPage';
import { FailedItemManagementPage } from './pages/FailedItemManagementPage';
import { PhotoManagementPage } from './pages/PhotoManagementPage';
import { ProjectServiceMock } from './services/ProjectServiceMock';
import { ProjectServiceApi } from './services/ProjectServiceApi';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { analyticsService } from './services/AnalyticsService';
import './App.css';

// 환경변수로 Mock/Api 전환
// 개발 서버(npm run dev)에서는 VITE_USE_MOCK=true → Mock 사용
// 빌드(npm run build) 또는 에뮬레이터 연결 시 → Api 사용
const useMock = import.meta.env.VITE_USE_MOCK === 'true';
const projectService = useMock ? new ProjectServiceMock() : new ProjectServiceApi();

function AppContent() {
  const { currentUser } = useAuth();

  // 분석 초기화 및 UTM 파라미터 캡처
  useEffect(() => {
    analyticsService.init();
    analyticsService.captureUTMParams();
  }, []);

  // 사용자 식별
  useEffect(() => {
    if (currentUser) {
      analyticsService.identifyUser(currentUser.uid, {
        email: currentUser.email,
        displayName: currentUser.displayName || '미설정',
        createdAt: currentUser.metadata?.creationTime,
      });
    }
  }, [currentUser]);

  // 페이지 변경 시 페이지뷰 추적
  useEffect(() => {
    const pathname = window.location.pathname;
    const pageName = pathname === '/' ? 'home' : pathname.replace(/^\//, '').replace(/-/g, '_');
    analyticsService.pageview(pageName);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Routes>
        {/* 인증 관련 페이지 (공개) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/password-recovery" element={<PasswordRecoveryPage />} />

        {/* 주문 관리 페이지 (보호됨) */}
        <Route path="/order-list" element={<ProtectedRoute element={<OrderListPage />} />} />
        <Route path="/order-details" element={<ProtectedRoute element={<OrderDetailsPage />} />} />
        <Route path="/create-new-order" element={<ProtectedRoute element={<CreateNewOrderPage />} />} />
        <Route path="/payment" element={<ProtectedRoute element={<PaymentPage />} />} />

        {/* 사진 관리 페이지 (보호됨) */}
        <Route path="/photo-management" element={<ProtectedRoute element={<PhotoManagementPage />} />} />
        <Route path="/upload" element={<ProtectedRoute element={<UploadPage projectService={projectService} />} />} />
        <Route path="/result" element={<ProtectedRoute element={<ResultPage projectService={projectService} />} />} />

        {/* 주문 상태 페이지 (보호됨) */}
        <Route path="/status" element={<ProtectedRoute element={<CurrentStatusPage projectService={projectService} />} />} />
        <Route path="/completed" element={<ProtectedRoute element={<CompletedPage projectService={projectService} />} />} />

        {/* 본보정 관련 페이지 (보호됨) */}
        <Route path="/main-correction-result" element={<ProtectedRoute element={<MainCorrectionResultPage projectService={projectService} />} />} />
        <Route path="/sample-revision-request" element={<ProtectedRoute element={<SampleRevisionRequestPage projectService={projectService} />} />} />
        <Route path="/main-correction-progress" element={<ProtectedRoute element={<MainCorrectionProgressPage projectService={projectService} />} />} />
        <Route path="/main-correction-upload" element={<ProtectedRoute element={<MainCorrectionUploadPage projectService={projectService} />} />} />

        {/* 설정 및 기타 페이지 (보호됨) */}
        <Route path="/settings" element={<ProtectedRoute element={<SettingsPage />} />} />
        <Route path="/notification-center" element={<ProtectedRoute element={<NotificationCenterPage />} />} />
        <Route path="/inquiry" element={<ProtectedRoute element={<InquiryPage />} />} />
        <Route path="/failed-items" element={<ProtectedRoute element={<FailedItemManagementPage />} />} />

        {/* 기본 페이지 (보호됨) */}
        <Route path="/waiting" element={<ProtectedRoute element={<WaitingPage projectService={projectService} />} />} />

        {/* 루트 경로 및 기본값 */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  useEffect(() => {
    // 초기 테마 설정
    const theme = localStorage.getItem('theme') || 'light';
    const html = document.documentElement;
    
    if (theme === 'dark') {
      html.classList.add('dark');
    } else if (theme === 'light') {
      html.classList.remove('dark');
    } else if (theme === 'auto') {
      // 시스템 설정 따르기
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
