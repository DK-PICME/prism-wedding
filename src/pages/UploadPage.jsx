import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useProjectId } from '../hooks/useProject';

/**
 * FileUpload - 파일 업로드 영역
 */
function FileUpload({ onFileSelect, selectedFile }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl text-neutral-900 mb-4">사진 업로드</h2>
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
          dragActive ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-300 hover:border-neutral-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="w-16 h-16 bg-neutral-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
          <i className="fa-solid fa-image text-white text-2xl"></i>
        </div>
        <div className="space-y-2">
          <p className="text-lg text-neutral-900">사진을 선택하거나 드래그해주세요</p>
          <p className="text-sm text-neutral-600">JPG, PNG 파일만 가능 (1장만 업로드 가능)</p>
          <p className="text-sm text-neutral-500">최대 10MB</p>
        </div>
        {selectedFile && (
          <p className="text-sm text-green-600 mt-3">✓ 선택됨: {selectedFile.name}</p>
        )}
        <label className="mt-4 inline-block px-6 py-2 bg-neutral-100 text-neutral-800 rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer">
          <i className="fa-solid fa-plus mr-2"></i>
          파일 선택
          <input type="file" hidden accept="image/jpeg,image/png" onChange={handleChange} />
        </label>
      </div>
    </div>
  );
}

/**
 * UploadPage - 샘플 업로드 페이지 (STEP 1)
 */
export function UploadPage({ projectService }) {
  const projectId = useProjectId();
  const [selectedFile, setSelectedFile] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('사진을 선택해주세요.');
      return;
    }
    if (!requestMessage.trim()) {
      alert('요청사항을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 실제 파일 업로드는 Cloud Storage Signed URL을 통해 처리해야 하지만,
      // 현재는 파일명을 URL로 사용하는 방식으로 구현 (추후 Storage 연동 시 교체)
      const fileUrl = URL.createObjectURL(selectedFile);

      if (projectService?.createSample) {
        await projectService.createSample(projectId, {
          fileName: selectedFile.name,
          fileUrl,
          revisionRequest: requestMessage,
        });
      }

      alert('샘플 보정 요청이 완료되었습니다!');
      setSelectedFile(null);
      setRequestMessage('');

      // 대기 페이지로 이동
      const params = new URLSearchParams(window.location.search);
      params.set('page', 'waiting');
      window.location.search = params.toString();
    } catch (err) {
      setSubmitError(err.message || '업로드 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header status="업로드 가능" currentStep={1} />

      <main id="main" className="bg-neutral-50 flex-1">
        <div className="max-w-screen-xl mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl text-neutral-900 mb-4">샘플 업로드</h1>
              <p className="text-lg text-neutral-600">샘플 보정을 위해 사진 1장과 요청사항을 남겨주세요.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-neutral-200 p-8 mb-8">
              <FileUpload onFileSelect={setSelectedFile} selectedFile={selectedFile} />

              <div className="mb-8">
                <h2 className="text-xl text-neutral-900 mb-4">요청사항</h2>
                <textarea
                  rows="6"
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="w-full p-4 border border-neutral-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  placeholder="어떤 보정을 원하시는지 상세히 작성해주세요.

예시:
• 얼굴톤 자연스럽게 보정
• 턱선 과하지 않게 정리
• 눈 밑 다크서클 제거
• 피부 잡티 제거"
                />
                <p className="text-sm text-neutral-500 mt-2">상세한 요청사항을 작성하시면 더 정확한 보정이 가능합니다.</p>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 mb-8">
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-info-circle text-neutral-600 text-lg mt-1"></i>
                  <div>
                    <h3 className="text-neutral-900 mb-2">샘플 보정 안내</h3>
                    <ul className="text-sm text-neutral-700 space-y-1">
                      <li>• 샘플 보정은 1장만 가능하며, 무료로 제공됩니다</li>
                      <li>• 보정 결과는 24시간 내에 확인 가능합니다</li>
                      <li>• 샘플 확인 후 본보정 진행 여부를 결정하실 수 있습니다</li>
                      <li>• 업로드 완료 시 자동으로 업로드가 마감됩니다</li>
                    </ul>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-700 text-sm">{submitError}</p>
                </div>
              )}

              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedFile}
                  className="bg-neutral-900 text-white px-8 py-3 rounded-lg hover:bg-neutral-800 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-paper-plane mr-2"></i>
                  {isSubmitting ? '전송 중...' : '샘플 보정 요청하기'}
                </button>
                <p className="text-sm text-neutral-500 mt-3">요청 완료 시 상태가 '샘플 검토중'으로 변경됩니다</p>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
