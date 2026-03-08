import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { LoadingSpinner, ErrorMessage } from '../components/LoadingSpinner';
import { useProjectId, useProject } from '../hooks/useProject';
import { formatDateKorean } from '../utils/helpers';

/**
 * ProgressStep - 진행 단계 아이템
 */
function ProgressStep({ number, title, date, isCompleted, isInProgress }) {
  return (
    <div className="flex items-center space-x-3">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
          isCompleted ? 'bg-neutral-900' : isInProgress ? 'bg-neutral-600' : 'bg-neutral-200'
        }`}
      >
        {isCompleted && <i className="fa-solid fa-check text-white text-xs"></i>}
        {isInProgress && <i className="fa-solid fa-cog fa-spin text-white text-xs"></i>}
        {!isCompleted && !isInProgress && <span className="text-xs text-neutral-400">{number}</span>}
      </div>
      <div>
        <div className={isCompleted || isInProgress ? 'text-neutral-900' : 'text-neutral-400'}>
          {isCompleted && '✓'} {title}
        </div>
        <div className={`text-sm ${isCompleted || isInProgress ? 'text-neutral-600' : 'text-neutral-400'}`}>
          {isInProgress ? '현재 진행중' : date}
        </div>
      </div>
    </div>
  );
}

/**
 * MainCorrectionProgressPage - 본보정 진행 페이지
 */
export function MainCorrectionProgressPage({ projectService }) {
  const projectId = useProjectId();
  const { project, loading, error, reload } = useProject(projectService, projectId);

  const sampleCompletedDate = project?.updatedAt ? formatDateKorean(project.updatedAt) : '-';
  const mainUploadDate = project?.uploadDate ? formatDateKorean(project.uploadDate) : '-';

  return (
    <div className="min-h-screen flex flex-col">
      <Header status="업로드 마감" currentStep={3} />

      <main id="main" className="bg-neutral-50 flex-1">
        <div className="max-w-screen-xl mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-800 rounded-full mb-6">
                <i className="fa-solid fa-cog fa-spin text-white text-3xl"></i>
              </div>
              <h1 className="text-3xl text-neutral-900 mb-4">본보정 진행중</h1>
              <p className="text-lg text-neutral-600">본보정이 진행 중이에요.</p>
            </div>

            {loading && <LoadingSpinner message="진행 상태를 불러오는 중..." />}
            {error && <ErrorMessage message={error.message} onRetry={reload} />}

            {!loading && !error && (
              <>
                <div className="bg-white rounded-lg border border-neutral-200 mb-8">
                  <div className="p-8 text-center">
                    <div className="mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-4">
                        <i className="fa-solid fa-clock text-neutral-600 text-2xl"></i>
                      </div>
                      <h2 className="text-xl text-neutral-900 mb-2">진행 상태</h2>
                      <p className="text-neutral-600">전문가가 본보정 작업을 진행하고 있습니다.</p>
                    </div>

                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 mb-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="text-center">
                          <div className="text-2xl text-neutral-900 mb-1">
                            {project?.dueDate ? formatDateKorean(project.dueDate) : '3-5일'}
                          </div>
                          <div className="text-sm text-neutral-600">예상 납기일</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl text-neutral-900 mb-1">진행중</div>
                          <div className="text-sm text-neutral-600">현재 상태</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
                      <h3 className="text-lg text-neutral-900 mb-3">업로드 상태</h3>
                      <p className="text-neutral-700 mb-3">업로드는 마감되었어요.</p>
                      <p className="text-sm text-neutral-600">추가 요청은 카톡으로 문의해주세요.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-neutral-200">
                  <div className="p-6">
                    <h3 className="text-lg text-neutral-900 mb-4">진행 현황</h3>
                    <div className="space-y-4">
                      <ProgressStep
                        number={1}
                        title="샘플 보정 완료"
                        date={sampleCompletedDate}
                        isCompleted={true}
                        isInProgress={false}
                      />
                      <ProgressStep
                        number={2}
                        title="본보정 업로드 완료"
                        date={mainUploadDate}
                        isCompleted={true}
                        isInProgress={false}
                      />
                      <ProgressStep
                        number={3}
                        title="본보정 작업 진행중"
                        date="현재 진행중"
                        isCompleted={false}
                        isInProgress={true}
                      />
                      <ProgressStep
                        number={4}
                        title="본보정 결과 확인"
                        date="대기중"
                        isCompleted={false}
                        isInProgress={false}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
