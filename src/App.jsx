import { useState } from 'react';
import { WaitingPage } from './pages/WaitingPage';
import { UploadPage } from './pages/UploadPage';
import { ResultPage } from './pages/ResultPage';
import { CurrentStatusPage } from './pages/CurrentStatusPage';
import { ProjectServiceMock } from './services/ProjectServiceMock';
import './App.css';

// 서비스 초기화
const projectService = new ProjectServiceMock();

/**
 * App - 메인 애플리케이션
 */
function App() {
  // URL에서 페이지 파라미터 추출
  const params = new URLSearchParams(window.location.search);
  const page = params.get('page') || 'waiting'; // 기본: waiting

  const renderPage = () => {
    switch (page) {
      case 'upload':
        return <UploadPage />;
      case 'result':
        return <ResultPage />;
      case 'status':
        return <CurrentStatusPage />;
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
