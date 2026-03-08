import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

// 환경변수로 Mock/Api 전환
// 개발 서버(npm run dev)에서는 VITE_USE_MOCK=true → Mock 사용
// 빌드(npm run build) 또는 에뮬레이터 연결 시 → Api 사용
const useMock = import.meta.env.VITE_USE_MOCK === 'true';
const projectService = useMock ? new ProjectServiceMock() : new ProjectServiceApi();

function AppContent() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Routes>
        {/* 인증 관련 페이지 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/password-recovery" element={<PasswordRecoveryPage />} />

        {/* 주문 관리 페이지 */}
        <Route path="/order-list" element={<OrderListPage />} />
        <Route path="/order-details" element={<OrderDetailsPage />} />
        <Route path="/create-new-order" element={<CreateNewOrderPage />} />
        <Route path="/payment" element={<PaymentPage />} />

        {/* 사진 관리 페이지 */}
        <Route path="/photo-management" element={<PhotoManagementPage />} />
        <Route path="/upload" element={<UploadPage projectService={projectService} />} />
        <Route path="/result" element={<ResultPage projectService={projectService} />} />

        {/* 주문 상태 페이지 */}
        <Route path="/status" element={<CurrentStatusPage projectService={projectService} />} />
        <Route path="/completed" element={<CompletedPage projectService={projectService} />} />

        {/* 본보정 관련 페이지 */}
        <Route path="/main-correction-result" element={<MainCorrectionResultPage projectService={projectService} />} />
        <Route path="/sample-revision-request" element={<SampleRevisionRequestPage projectService={projectService} />} />
        <Route path="/main-correction-progress" element={<MainCorrectionProgressPage projectService={projectService} />} />
        <Route path="/main-correction-upload" element={<MainCorrectionUploadPage projectService={projectService} />} />

        {/* 설정 및 기타 페이지 */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notification-center" element={<NotificationCenterPage />} />
        <Route path="/inquiry" element={<InquiryPage />} />
        <Route path="/failed-items" element={<FailedItemManagementPage />} />

        {/* 기본 페이지 */}
        <Route path="/waiting" element={<WaitingPage projectService={projectService} />} />

        {/* 루트 경로 및 기본값 */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/waiting" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
