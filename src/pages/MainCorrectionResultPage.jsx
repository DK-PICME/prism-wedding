import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

/**
 * ImageComparison - 이미지 비포/애프터 비교
 */
function ImageComparison({ photoNumber, filename, request }) {
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
            <div className="aspect-[4/3] bg-neutral-400 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">원본 이미지</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-neutral-600 mb-2">AFTER</div>
            <div className="aspect-[4/3] bg-neutral-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">보정 완료 이미지</span>
            </div>
          </div>
        </div>

        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
          <div className="text-sm text-neutral-600 mb-2">요청사항</div>
          <div className="text-neutral-900">{request}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * MainCorrectionResultPage - 본보정 결과 확인 페이지
 */
export function MainCorrectionResultPage() {
  const [isSatisfied, setIsSatisfied] = useState(null);
  const [canDownload, setCanDownload] = useState(false);

  const photos = [
    {
      number: 1,
      filename: 'portrait_001.jpg',
      request: '얼굴톤 자연스럽게, 피부 잡티 제거, 전체적인 밝기 조정',
    },
    {
      number: 2,
      filename: 'portrait_002.jpg',
      request: '배경 흐림 효과, 인물 선명도 향상, 색감 보정',
    },
    {
      number: 3,
      filename: 'portrait_003.jpg',
      request: '전체적인 노출 조정, 그림자 부분 밝게, 하이라이트 조정',
    },
  ];

  const handleSatisfied = () => {
    setIsSatisfied(true);
    setCanDownload(true);
  };

  const handleRevisionRequest = () => {
    setIsSatisfied(false);
    alert('재수정 요청이 접수되었습니다.');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header status="결과 도착" currentStep={4} />

      <main id="main" className="bg-neutral-50 flex-1">
        <div className="max-w-screen-xl mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            {/* 페이지 제목 */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-900 rounded-full mb-6">
                <i className="fa-solid fa-check text-white text-3xl"></i>
              </div>
              <h1 className="text-3xl text-neutral-900 mb-4">본보정 결과가 도착했어요</h1>
              <p className="text-lg text-neutral-600">전문가가 작업한 본보정 결과를 확인해보세요.</p>
            </div>

            {/* 이미지 비교 */}
            <div className="space-y-8 mb-8">
              {photos.map((photo) => (
                <ImageComparison
                  key={photo.number}
                  photoNumber={photo.number}
                  filename={photo.filename}
                  request={photo.request}
                />
              ))}
            </div>

            {/* 만족도 및 다운로드 */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-8">
              <div className="text-center">
                <h3 className="text-lg text-neutral-900 mb-6">결과가 만족스러우신가요?</h3>

                <div className="flex items-center justify-center space-x-4 mb-8">
                  <button
                    onClick={handleSatisfied}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                      isSatisfied === true
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-900 text-white hover:bg-neutral-800'
                    }`}
                  >
                    <i className="fa-solid fa-thumbs-up"></i>
                    <span>만족해요</span>
                  </button>
                  <button
                    onClick={handleRevisionRequest}
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
                  className={`flex items-center justify-center space-x-2 w-full px-6 py-4 rounded-lg transition-colors ${
                    canDownload
                      ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                      : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  <i className="fa-solid fa-download"></i>
                  <span>{canDownload ? '다운로드' : '다운로드 (만족 확인 후 활성화)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
