import { WaitingPage } from './pages/WaitingPage';
import { UploadPage } from './pages/UploadPage';
import { ResultPage } from './pages/ResultPage';
import { CurrentStatusPage } from './pages/CurrentStatusPage';
import { CompletedPage } from './pages/CompletedPage';
import { MainCorrectionResultPage } from './pages/MainCorrectionResultPage';
import { SampleRevisionRequestPage } from './pages/SampleRevisionRequestPage';
import { MainCorrectionProgressPage } from './pages/MainCorrectionProgressPage';
import { MainCorrectionUploadPage } from './pages/MainCorrectionUploadPage';
import { ProjectServiceMock } from './services/ProjectServiceMock';
import { ProjectServiceApi } from './services/ProjectServiceApi';
import './App.css';

// 환경변수로 Mock/Api 전환
// 개발 서버(npm run dev)에서는 VITE_USE_MOCK=true → Mock 사용
// 빌드(npm run build) 또는 에뮬레이터 연결 시 → Api 사용
const useMock = import.meta.env.VITE_USE_MOCK === 'true';
const projectService = useMock ? new ProjectServiceMock() : new ProjectServiceApi();

function App() {
  const params = new URLSearchParams(window.location.search);
  const page = params.get('page') || 'waiting';

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

export default App;
