import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { LoadingSpinner, ErrorMessage } from '../components/LoadingSpinner';
import { useProjectId, useProject, useMainPhotos } from '../hooks/useProject';
import { formatDateKorean } from '../utils/helpers';

/**
 * CompletionToast - 완료 알림 토스트
 */
function CompletionToast() {
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-neutral-900 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3">
        <i className="fa-solid fa-check-circle text-neutral-400"></i>
        <span>확인 완료! 다운로드가 가능해졌어요.</span>
      </div>
    </div>
  );
}

/**
 * CompletedPage - 모든 작업 완료 페이지
 */
export function CompletedPage({ projectService }) {
  const projectId = useProjectId();
  const { project, loading: projectLoading, error: projectError, reload: reloadProject } = useProject(projectService, projectId);
  const { photos, loading: photosLoading, error: photosError, reload: reloadPhotos } = useMainPhotos(projectService, projectId);

  const loading = projectLoading || photosLoading;
  const error = projectError || photosError;

  const handleDownload = () => {
    const resultUrls = photos.filter((p) => p.resultUrl).map((p) => p.resultUrl);
    if (resultUrls.length === 0) {
      alert('다운로드할 파일이 없습니다.');
      return;
    }
    resultUrls.forEach((url) => window.open(url, '_blank'));
  };

  const summaryItems = [
    { label: '샘플 보정', value: '완료' },
    { label: '본보정 작업', value: '완료' },
    { label: '최종 검수', value: '완료' },
    { label: '다운로드 준비', value: '완료' },
  ];

  const services = [
    { icon: 'fa-headset', title: '고객 지원', description: '궁금한 점이 있으시면 언제든 문의하세요' },
    { icon: 'fa-redo', title: '재작업 요청', description: '30일 이내 무료 재작업 가능' },
    { icon: 'fa-star', title: '리뷰 작성', description: '서비스 후기를 남겨주세요' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header status="완료/결과 도착" currentStep={4} />
      <CompletionToast />

      <main id="main" className="bg-neutral-50 flex-1">
        <div className="max-w-screen-xl mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-600 rounded-full mb-6">
                <i className="fa-solid fa-check text-white text-3xl"></i>
              </div>
              <h1 className="text-3xl text-neutral-900 mb-4">모든 작업이 완료되었습니다</h1>
              <p className="text-lg text-neutral-600">프리즘 스튜디오의 전문 보정 서비스를 이용해주셔서 감사합니다.</p>
            </div>

            {loading && <LoadingSpinner message="완료 정보를 불러오는 중..." />}
            {error && (
              <ErrorMessage
                message={error.message}
                onRetry={() => { reloadProject(); reloadPhotos(); }}
              />
            )}

            {!loading && !error && (
              <>
                <div className="bg-white rounded-lg border border-neutral-200 p-8 mb-8">
                  <div className="text-center">
                    <div className="mb-6">
                      <div className="inline-flex items-center space-x-2 px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-full mb-4">
                        <i className="fa-solid fa-check-circle text-neutral-600"></i>
                        <span className="text-neutral-800 text-sm">작업 완료</span>
                      </div>
                      <h2 className="text-xl text-neutral-900 mb-2">최종 결과물이 준비되었습니다</h2>
                      <p className="text-neutral-600">모든 보정 작업이 완료되어 다운로드가 가능합니다.</p>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mb-8">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className="fa-solid fa-image text-neutral-600 text-xl"></i>
                        </div>
                        <div className="text-sm text-neutral-600 mb-1">총 보정 이미지</div>
                        <div className="text-lg text-neutral-900">{photos.length}장</div>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className="fa-solid fa-clock text-neutral-600 text-xl"></i>
                        </div>
                        <div className="text-sm text-neutral-600 mb-1">작업 완료일</div>
                        <div className="text-lg text-neutral-900">
                          {project?.completedAt ? formatDateKorean(project.completedAt) : '-'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className="fa-solid fa-star text-neutral-600 text-xl"></i>
                        </div>
                        <div className="text-sm text-neutral-600 mb-1">품질</div>
                        <div className="text-lg text-neutral-900">고해상도</div>
                      </div>
                    </div>

                    <button
                      onClick={handleDownload}
                      className="flex items-center justify-center space-x-3 w-full px-8 py-4 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                      <i className="fa-solid fa-download text-lg"></i>
                      <span className="text-lg">전체 이미지 다운로드</span>
                      <span className="text-sm bg-neutral-700 px-2 py-1 rounded">ZIP 파일</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-lg border border-neutral-200 p-6">
                    <h3 className="text-lg text-neutral-900 mb-4">작업 요약</h3>
                    <div className="space-y-3">
                      {summaryItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-neutral-600">{item.label}</span>
                          <span className="text-neutral-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-neutral-200 p-6">
                    <h3 className="text-lg text-neutral-900 mb-4">추가 서비스</h3>
                    <div className="space-y-4">
                      {services.map((service, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                          <i className={`fa-solid ${service.icon} text-neutral-600`}></i>
                          <div>
                            <div className="text-sm text-neutral-900">{service.title}</div>
                            <div className="text-xs text-neutral-500">{service.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-100 border border-neutral-200 rounded-lg p-6 text-center">
                  <h3 className="text-lg text-neutral-900 mb-3">프리즘 스튜디오를 이용해주셔서 감사합니다</h3>
                  <p className="text-neutral-600 mb-4">
                    전문가의 정성스러운 보정 작업으로 만족스러운 결과물을 제공해드렸습니다. 다음에도 더 나은 서비스로 찾아뵙겠습니다.
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <button className="flex items-center space-x-2 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50">
                      <i className="fa-brands fa-instagram"></i>
                      <span>인스타그램 팔로우</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50">
                      <i className="fa-solid fa-share"></i>
                      <span>친구에게 추천</span>
                    </button>
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
