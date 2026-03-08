import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { LoadingSpinner, ErrorMessage } from '../components/LoadingSpinner';
import { useProjectId, useMainPhotos } from '../hooks/useProject';

/**
 * ImageComparison - 이미지 비포/애프터 비교
 */
function ImageComparison({ photoNumber, filename, request, fileUrl, resultUrl }) {
  return (
    <div className="bg-white rounded-lg border border-neutral-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg text-neutral-900">사진 {photoNumber}</h3>
          <span className="text-sm text-neutral-500">{filename}</span>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="text-sm text-neutral-600 mb-2">BEFORE</div>
            {fileUrl ? (
              <img src={fileUrl} alt="원본" className="w-full aspect-[4/3] object-cover rounded-lg" />
            ) : (
              <div className="aspect-[4/3] bg-neutral-400 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">원본 이미지</span>
              </div>
            )}
          </div>
          <div>
            <div className="text-sm text-neutral-600 mb-2">AFTER</div>
            {resultUrl ? (
              <img src={resultUrl} alt="보정 완료" className="w-full aspect-[4/3] object-cover rounded-lg" />
            ) : (
              <div className="aspect-[4/3] bg-neutral-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">보정 완료 이미지</span>
              </div>
            )}
          </div>
        </div>

        {request && (
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
            <div className="text-sm text-neutral-600 mb-2">요청사항</div>
            <div className="text-neutral-900">{request}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * MainCorrectionResultPage - 본보정 결과 확인 페이지
 */
export function MainCorrectionResultPage({ projectService }) {
  const projectId = useProjectId();
  const { photos, loading, error, reload } = useMainPhotos(projectService, projectId);
  const [isSatisfied, setIsSatisfied] = useState(null);
  const [canDownload, setCanDownload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSatisfied = async () => {
    setIsSubmitting(true);
    try {
      if (projectService?.approveMain) {
        await projectService.approveMain(projectId);
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
    alert('재수정 요청이 접수되었습니다.');
  };

  const handleDownload = () => {
    const resultUrls = photos.filter((p) => p.resultUrl).map((p) => p.resultUrl);
    if (resultUrls.length === 0) {
      alert('다운로드할 파일이 없습니다.');
      return;
    }
    resultUrls.forEach((url) => window.open(url, '_blank'));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header status="결과 도착" currentStep={4} />

      <main id="main" className="bg-neutral-50 flex-1">
        <div className="max-w-screen-xl mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-900 rounded-full mb-6">
                <i className="fa-solid fa-check text-white text-3xl"></i>
              </div>
              <h1 className="text-3xl text-neutral-900 mb-4">본보정 결과가 도착했어요</h1>
              <p className="text-lg text-neutral-600">전문가가 작업한 본보정 결과를 확인해보세요.</p>
            </div>

            {loading && <LoadingSpinner message="보정 결과를 불러오는 중..." />}
            {error && <ErrorMessage message={error.message} onRetry={reload} />}

            {!loading && !error && (
              <>
                <div className="space-y-8 mb-8">
                  {photos.length > 0 ? (
                    photos.map((photo, idx) => (
                      <ImageComparison
                        key={photo.id}
                        photoNumber={idx + 1}
                        filename={photo.fileName}
                        request={photo.revisionRequest}
                        fileUrl={photo.fileUrl}
                        resultUrl={photo.resultUrl}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-neutral-500">
                      <i className="fa-solid fa-image text-4xl mb-4"></i>
                      <p>본보정 사진이 없습니다.</p>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-8">
                  <div className="text-center">
                    <h3 className="text-lg text-neutral-900 mb-6">결과가 만족스러우신가요?</h3>

                    <div className="flex items-center justify-center space-x-4 mb-8">
                      <button
                        onClick={handleSatisfied}
                        disabled={isSubmitting || isSatisfied === true}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors disabled:cursor-not-allowed ${
                          isSatisfied === true
                            ? 'bg-green-600 text-white'
                            : 'bg-neutral-900 text-white hover:bg-neutral-800'
                        }`}
                      >
                        <i className="fa-solid fa-thumbs-up"></i>
                        <span>{isSubmitting ? '처리 중...' : '만족해요'}</span>
                      </button>
                      <button
                        onClick={handleRevisionRequest}
                        disabled={isSubmitting}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                          isSatisfied === false
                            ? 'border-2 border-neutral-900 text-neutral-900'
                            : 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <i className="fa-solid fa-edit"></i>
                        <span>재수정 요청</span>
                      </button>
                    </div>

                    <button
                      disabled={!canDownload}
                      onClick={handleDownload}
                      className={`flex items-center justify-center space-x-2 w-full px-6 py-4 rounded-lg transition-colors ${
                        canDownload
                          ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                          : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                      }`}
                    >
                      <i className="fa-solid fa-download"></i>
                      <span>{canDownload ? `다운로드 (${photos.length}장)` : '다운로드 (만족 확인 후 활성화)'}</span>
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
