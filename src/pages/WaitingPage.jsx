import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { StatusMessage } from '../components/StatusMessage';
import { ProjectInfo } from '../components/ProjectInfo';
import { NextSteps } from '../components/NextSteps';
import { ContactInfo } from '../components/ContactInfo';
import { useProject, useProjectId } from '../hooks/useProject';
import { statusToLabel } from '../utils/helpers';

/**
 * WaitingPage - 샘플 검토 대기 페이지 (STEP 1)
 */
export function WaitingPage({ projectService }) {
  const projectId = useProjectId();
  const { project, loading, error } = useProject(projectService, projectId);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header status="오류" />
        <main className="bg-neutral-50 flex-1">
          <div className="max-w-screen-xl mx-auto px-6 py-12">
            <div className="max-w-2xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <i className="fa-solid fa-exclamation-circle text-red-600 text-4xl mb-4"></i>
                <h1 className="text-2xl text-red-900 mb-2">오류가 발생했습니다</h1>
                <p className="text-red-700">
                  {error?.message || '프로젝트 정보를 불러올 수 없습니다.'}
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header status={statusToLabel(project?.status) || '진행중'} />

      <main id="main" className="bg-neutral-50 flex-1">
        <div className="max-w-screen-xl mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto">
            {/* 상태 메시지 */}
            <StatusMessage status={project?.status} isLoading={loading} />

            {/* 진행 정보 */}
            {!loading && project && <ProjectInfo project={project} />}

            {/* 다음 단계 안내 */}
            {!loading && <NextSteps />}

            {/* 연락처 정보 */}
            {!loading && <ContactInfo />}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
