import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { LoadingSpinner, ErrorMessage } from '../components/LoadingSpinner';
import { useProjectId, useSamples } from '../hooks/useProject';

/**
 * ResultPage - 샘플 보정 결과 확인 페이지 (STEP 2)
 */
export function ResultPage({ projectService }) {
  const projectId = useProjectId();
  const { samples, loading, error, reload } = useSamples(projectService, projectId);
  const [isSatisfied, setIsSatisfied] = useState(null);
  const [canDownload, setCanDownload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sample = samples[0] || null;

  const handleSatisfied = async () => {
    setIsSubmitting(true);
    try {
      if (projectService?.approveSample) {
        await projectService.approveSample(projectId);
      }
      setIsSatisfied(true);
      setCanDownload(true);
    } catch (err) {
      alert('처리 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevisionRequest = () => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', 'sample-revision-request');
    window.location.search = params.toString();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header status="결과 도착" currentStep={2} />

      <main id="main" className="bg-neutral-50 flex-1">
        <div className="max-w-screen-xl mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-800 rounded-full mb-6">
                <i className="fa-solid fa-check text-white text-3xl"></i>
              </div>
              <h1 className="text-3xl text-neutral-900 mb-4">샘플 보정 결과가 도착했어요</h1>
              <p className="text-lg text-neutral-600">요청하신 보정이 완료되었습니다. 결과를 확인해주세요.</p>
            </div>

            {loading && <LoadingSpinner message="샘플 정보를 불러오는 중..." />}
            {error && <ErrorMessage message={error.message} onRetry={reload} />}

            {!loading && !error && (
              <>
                <div className="bg-white rounded-lg border border-neutral-200 mb-8">
                  <div className="p-8 border-b border-neutral-200">
                    <h2 className="text-xl text-neutral-900 mb-6">비포 / 애프터 비교</h2>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-sm text-neutral-500 mb-3">BEFORE</h3>
                        {sample?.fileUrl ? (
                          <img
                            src={sample.fileUrl}
                            alt="원본"
                            className="w-full aspect-square object-cover rounded-lg"
                          />
                        ) : (
                          <div className="aspect-square bg-neutral-400 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">원본 이미지</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm text-neutral-500 mb-3">AFTER</h3>
                        {sample?.resultUrl ? (
                          <img
                            src={sample.resultUrl}
                            alt="보정 결과"
                            className="w-full aspect-square object-cover rounded-lg"
                          />
                        ) : (
                          <div className="aspect-square bg-neutral-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">보정 결과 이미지</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {sample?.revisionRequest && (
                    <div className="p-8">
                      <h3 className="text-lg text-neutral-900 mb-4">요청사항 요약</h3>
                      <div className="bg-neutral-50 rounded-lg p-6">
                        <ul className="space-y-2">
                          {sample.revisionRequest.split(/[,\n•]/).filter(Boolean).map((req, idx) => (
                            <li key={idx} className="flex items-start space-x-3">
                              <i className="fa-solid fa-circle-dot text-neutral-600 text-xs mt-2"></i>
                              <span className="text-neutral-700">{req.trim()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg border border-neutral-200 p-8 mb-8">
                  <h2 className="text-xl text-neutral-900 mb-6">결과에 만족하시나요?</h2>
                  <div className="flex items-center space-x-4 mb-6">
                    <button
                      onClick={handleSatisfied}
                      disabled={isSubmitting || isSatisfied === true}
                      className={`flex-1 px-8 py-4 rounded-lg transition-colors disabled:cursor-not-allowed ${
                        isSatisfied === true
                          ? 'bg-green-600 text-white'
                          : 'bg-neutral-900 text-white hover:bg-neutral-800'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <i className="fa-solid fa-thumbs-up"></i>
                        <span>{isSubmitting ? '처리 중...' : '만족해요'}</span>
                      </div>
                    </button>
                    <button
                      onClick={handleRevisionRequest}
                      disabled={isSubmitting}
                      className={`flex-1 px-8 py-4 rounded-lg transition-colors ${
                        isSatisfied === false
                          ? 'bg-neutral-100 border-2 border-neutral-900 text-neutral-900'
                          : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <i className="fa-solid fa-edit"></i>
                        <span>재수정 요청</span>
                      </div>
                    </button>
                  </div>

                  <div className="border-t border-neutral-200 pt-6">
                    <button
                      disabled={!canDownload || !sample?.resultUrl}
                      onClick={() => sample?.resultUrl && window.open(sample.resultUrl, '_blank')}
                      className={`w-full px-8 py-4 rounded-lg transition-colors ${
                        canDownload && sample?.resultUrl
                          ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                          : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <i className="fa-solid fa-download"></i>
                        <span>{canDownload ? '다운로드' : '다운로드 (만족 확인 후 가능)'}</span>
                      </div>
                    </button>
                    <p className="text-sm text-neutral-500 text-center mt-3">
                      '만족해요' 버튼을 클릭하시면 다운로드가 가능하며, 본보정 단계로 진행하실 수 있습니다.
                    </p>
                  </div>
                </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <i className="fa-solid fa-info-circle text-neutral-600 text-lg mt-1"></i>
                    <div>
                      <h3 className="text-neutral-900 mb-2">다음 단계 안내</h3>
                      <p className="text-sm text-neutral-700 mb-3">
                        샘플 결과에 만족하시면 본보정 단계로 진행하실 수 있습니다.
                      </p>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-neutral-600">문의: contact@prismstudio.com</span>
                        <span className="text-sm text-neutral-400">|</span>
                        <span className="text-sm text-neutral-600">카카오톡: @prismstudio</span>
                      </div>
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
