import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { LoadingSpinner, ErrorMessage } from '../components/LoadingSpinner';
import { useProject, useProjectId } from '../hooks/useProject';
import { formatDateKorean, statusToLabel } from '../utils/helpers';

/**
 * StepItem - 진행 상태 아이템
 */
function StepItem({ number, title, description, status, isLocked }) {
  const statusMap = {
    '대기중': { bgClass: 'bg-neutral-100', textClass: 'text-neutral-800' },
    '진행중': { bgClass: 'bg-neutral-900', textClass: 'text-white' },
    '완료': { bgClass: 'bg-green-600', textClass: 'text-white' },
    '잠김': { bgClass: 'bg-neutral-100', textClass: 'text-neutral-500' },
  };

  const style = statusMap[status] || statusMap['대기중'];

  return (
    <div className={`flex items-center justify-between py-4 border-b border-neutral-100 ${isLocked ? 'opacity-50' : ''}`}>
      <div className="flex items-center space-x-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isLocked ? 'bg-neutral-200' : 'bg-neutral-300'
          }`}
        >
          <span className={`text-sm ${isLocked ? 'text-neutral-400' : 'text-neutral-600'}`}>{number}</span>
        </div>
        <div>
          <h3 className={`${isLocked ? 'text-neutral-500' : 'text-neutral-900'}`}>{title}</h3>
          <p className={`text-sm ${isLocked ? 'text-neutral-400' : 'text-neutral-600'}`}>{description}</p>
        </div>
      </div>
      <span className={`px-3 py-1 ${style.bgClass} ${style.textClass} text-sm rounded-full`}>{status}</span>
    </div>
  );
}

/**
 * 프로젝트 status에 따라 각 단계의 상태를 계산
 */
function buildSteps(projectStatus) {
  const statusOrder = ['waiting', 'sample_review', 'sample_revision', 'main_upload', 'main_progress', 'main_review', 'completed'];
  const currentIdx = statusOrder.indexOf(projectStatus);

  const stepDefs = [
    {
      number: 1,
      title: '샘플 접수',
      description: '샘플 사진 업로드',
      requiredStatuses: ['sample_review', 'sample_revision'],
    },
    {
      number: 2,
      title: '샘플 결과 확인',
      description: '샘플 보정 결과 검토',
      requiredStatuses: ['main_upload'],
    },
    {
      number: 3,
      title: '본보정 업로드',
      description: '본보정 사진 업로드',
      requiredStatuses: ['main_progress', 'main_review'],
    },
    {
      number: 4,
      title: '본보정 결과 확인',
      description: '최종 결과물 다운로드',
      requiredStatuses: ['completed'],
    },
  ];

  return stepDefs.map((step) => {
    const stepIdx = statusOrder.indexOf(step.requiredStatuses[0]);
    const isCompleted = currentIdx > stepIdx + step.requiredStatuses.length - 1;
    const isInProgress = step.requiredStatuses.includes(projectStatus);
    const isLocked = currentIdx < stepIdx;

    let status = '대기중';
    if (isCompleted) status = '완료';
    else if (isInProgress) status = '진행중';
    else if (isLocked) status = '잠김';

    return { ...step, status, isLocked };
  });
}

/**
 * CurrentStatusPage - 고유 URL 진입 및 현재 상태 확인 페이지
 */
export function CurrentStatusPage({ projectService }) {
  const projectId = useProjectId();
  const { project, loading, error, reload } = useProject(projectService, projectId);

  const handleStartUpload = () => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', 'upload');
    window.location.search = params.toString();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header status={project ? statusToLabel(project.status) : '로딩중'} currentStep={project?.currentStep ?? 0} />

      <main id="main" className="bg-neutral-50 flex-1">
        <div className="max-w-screen-xl mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl text-neutral-900 mb-4">현재 진행 상황</h1>
              <p className="text-lg text-neutral-600">고유 URL로 접속하신 프로젝트의 현재 상태를 확인하세요.</p>
            </div>

            {loading && <LoadingSpinner message="프로젝트 정보를 불러오는 중..." />}
            {error && <ErrorMessage message={error.message} onRetry={reload} />}

            {!loading && !error && project && (
              <>
                <div className="bg-white rounded-lg border border-neutral-200 p-8 mb-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center">
                      <i className="fa-solid fa-clock text-neutral-600 text-lg"></i>
                    </div>
                    <div>
                      <h2 className="text-xl text-neutral-900">프로젝트 ID: #{projectId}</h2>
                      <p className="text-neutral-600">
                        생성일: {project.createdAt ? formatDateKorean(project.createdAt) : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-0">
                    {buildSteps(project.status).map((step) => (
                      <StepItem
                        key={step.number}
                        number={step.number}
                        title={step.title}
                        description={step.description}
                        status={step.status}
                        isLocked={step.isLocked}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 mb-8">
                  <div className="flex items-start space-x-3">
                    <i className="fa-solid fa-info-circle text-neutral-600 text-lg mt-1"></i>
                    <div>
                      <h3 className="text-neutral-900 mb-2">다음 단계 안내</h3>
                      {project.status === 'waiting' && (
                        <>
                          <p className="text-neutral-800 mb-3">샘플 보정을 위해 사진 1장과 요청사항을 업로드해주세요.</p>
                          <ul className="text-sm text-neutral-700 space-y-1">
                            <li>• 샘플 사진은 1장만 업로드 가능합니다</li>
                            <li>• 요청사항을 상세히 작성해주시면 더 정확한 보정이 가능합니다</li>
                            <li>• 샘플 결과 확인 후 본보정 단계로 진행됩니다</li>
                          </ul>
                        </>
                      )}
                      {project.status === 'sample_review' && (
                        <p className="text-neutral-800">샘플 보정이 진행 중입니다. 결과가 나오면 알려드리겠습니다.</p>
                      )}
                      {project.status === 'sample_revision' && (
                        <p className="text-neutral-800">재수정 요청이 접수되었습니다. 수정된 결과를 기다려주세요.</p>
                      )}
                      {project.status === 'main_upload' && (
                        <p className="text-neutral-800">샘플 보정이 완료되었습니다. 본보정 사진을 업로드해주세요.</p>
                      )}
                      {project.status === 'main_progress' && (
                        <p className="text-neutral-800">본보정이 진행 중입니다. 완료되면 알려드리겠습니다.</p>
                      )}
                      {project.status === 'main_review' && (
                        <p className="text-neutral-800">본보정이 완료되었습니다. 결과를 확인해주세요.</p>
                      )}
                      {project.status === 'completed' && (
                        <p className="text-neutral-800">모든 작업이 완료되었습니다. 결과물을 다운로드하세요.</p>
                      )}
                    </div>
                  </div>
                </div>

                {project.status === 'waiting' && (
                  <div className="text-center">
                    <button
                      onClick={handleStartUpload}
                      className="bg-neutral-900 text-white px-8 py-3 rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                      <i className="fa-solid fa-upload mr-2"></i>
                      샘플 업로드 시작하기
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
