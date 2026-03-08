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
  const params = new URLSearchParams(window.location.search);
  const page = params.get('page') || 'login';

  const renderPage = () => {
    switch (page) {
      case 'upload':
        return <UploadPage projectService={projectService} />;
      case 'result':
        return <ResultPage projectService={projectService} />;
      case 'status':
        return <CurrentStatusPage projectService={projectService} />;
      case 'completed':
        return <CompletedPage projectService={projectService} />;
      case 'main-correction-result':
        return <MainCorrectionResultPage projectService={projectService} />;
      case 'sample-revision-request':
        return <SampleRevisionRequestPage projectService={projectService} />;
      case 'main-correction-progress':
        return <MainCorrectionProgressPage projectService={projectService} />;
      case 'main-correction-upload':
        return <MainCorrectionUploadPage projectService={projectService} />;
      case 'order-list':
        return <OrderListPage />;
      case 'settings':
        return <SettingsPage />;
      case 'notification-center':
        return <NotificationCenterPage />;
      case 'create-new-order':
        return <CreateNewOrderPage />;
      case 'order-details':
        return <OrderDetailsPage />;
      case 'payment':
        return <PaymentPage />;
      case 'password-recovery':
        return <PasswordRecoveryPage />;
      case 'sign-up':
        return <SignUpPage />;
      case 'login':
        return <LoginPage />;
      case 'verify-email':
        return <VerifyEmailPage />;
      case 'inquiry':
        return <InquiryPage />;
      case 'failed-items':
        return <FailedItemManagementPage />;
      case 'photo-management':
        return <PhotoManagementPage />;
      case 'waiting':
      default:
        return <WaitingPage projectService={projectService} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {renderPage()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
