import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

/**
 * PhotoUploadItem - 개별 사진 업로드 항목
 */
function PhotoUploadItem({ number, filename, initialRequest = '' }) {
  const [request, setRequest] = useState(initialRequest);

  return (
    <div className="border border-neutral-200 rounded-lg p-6">
      <div className="flex items-start space-x-4">
        <div className="w-24 h-24 bg-neutral-300 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-sm text-white">사진 {number}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-900">{filename}</span>
            <button className="text-neutral-400 hover:text-neutral-600">
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
          <label className="block text-sm text-neutral-700 mb-2">이 사진만의 요청사항</label>
          <textarea
            rows="3"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="예: 배경을 더 밝게 해주세요"
            className="w-full p-3 border border-neutral-300 rounded-lg resize-none focus:outline-none focus:border-neutral-500 text-neutral-900"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * MainCorrectionUploadPage - 본보정 업로드 페이지
 */
export function MainCorrectionUploadPage() {
  const [commonRequest, setCommonRequest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const photos = [
    { number: 1, filename: 'portrait_001.jpg', request: '' },
    { number: 2, filename: 'portrait_002.jpg', request: '' },
    { number: 3, filename: 'portrait_003.jpg', request: '' },
  ];

  const handleUploadFiles = () => {
    alert('파일 선택 대화창이 열립니다.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      alert('본보정 접수가 완료되었습니다! 3-5일 내에 결과를 받아보실 수 있습니다.');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header status="업로드 가능" currentStep={3} />

      <main id="main" className="bg-neutral-50 flex-1">
        <div className="max-w-screen-xl mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            {/* 페이지 제목 */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-800 rounded-full mb-6">
                <i className="fa-solid fa-upload text-white text-3xl"></i>
              </div>
              <h1 className="text-3xl text-neutral-900 mb-4">본보정 업로드</h1>
              <p className="text-lg text-neutral-600">본보정할 사진들을 업로드하고 요청사항을 남겨주세요.</p>
            </div>

            {/* 업로드 폼 */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-neutral-200 mb-8">
              <div className="p-8">
                {/* 공통 요청사항 */}
                <h2 className="text-xl text-neutral-900 mb-6">공통 요청사항</h2>

                <div className="mb-8">
                  <label className="block text-sm text-neutral-700 mb-3">모든 사진에 공통으로 적용할 요청사항</label>
                  <textarea
                    rows="4"
                    value={commonRequest}
                    onChange={(e) => setCommonRequest(e.target.value)}
                    placeholder="예: 전체적으로 자연스러운 톤으로 보정해주세요.
피부 질감은 유지하면서 잡티만 제거해주세요."
                    className="w-full p-4 border border-neutral-300 rounded-lg resize-none focus:outline-none focus:border-neutral-500 text-neutral-900"
                  />
                </div>

                {/* 사진 업로드 섹션 */}
                <div className="border-t border-neutral-200 pt-8">
                  <h3 className="text-lg text-neutral-900 mb-6">사진 업로드</h3>

                  {/* 드래그 앤 드롭 영역 */}
                  <div
                    onClick={handleUploadFiles}
                    className="border-2 border-dashed border-neutral-300 rounded-lg p-8 mb-6 text-center hover:border-neutral-400 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-cloud-upload-alt text-4xl text-neutral-400 mb-4"></i>
                    <p className="text-lg text-neutral-600 mb-2">사진을 드래그하거나 클릭해서 업로드하세요</p>
                    <p className="text-sm text-neutral-500">JPG, PNG 파일 / 최대 10MB</p>
                  </div>

                  {/* 사진 업로드 항목들 */}
                  <div className="space-y-6 mb-8">
                    {photos.map((photo) => (
                      <PhotoUploadItem
                        key={photo.number}
                        number={photo.number}
                        filename={photo.filename}
                        initialRequest={photo.request}
                      />
                    ))}
                  </div>

                  {/* 제출 버튼 */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-neutral-900 text-white px-8 py-4 rounded-lg hover:bg-neutral-800 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <i className="fa-solid fa-check"></i>
                      <span>{isSubmitting ? '접수 중...' : '본보정 접수하기'}</span>
                    </div>
                  </button>
                </div>
              </div>
            </form>

            {/* 안내 박스 */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <i className="fa-solid fa-info-circle text-neutral-600 text-lg mt-1"></i>
                <div>
                  <h3 className="text-neutral-900 mb-2">본보정 안내</h3>
                  <p className="text-sm text-neutral-700 mb-3">
                    본보정 접수 후에는 추가 사진 업로드가 불가능합니다. 모든 사진과 요청사항을 확인한 후 접수해주세요. 일반적으로 3-5일 내에 보정 결과를 받아보실 수 있습니다.
                  </p>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-neutral-600">문의: contact@prismstudio.com</span>
                    <span className="text-sm text-neutral-400">|</span>
                    <span className="text-sm text-neutral-600">카카오톡: @prismstudio</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
