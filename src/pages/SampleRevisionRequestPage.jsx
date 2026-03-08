import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { LoadingSpinner, ErrorMessage } from '../components/LoadingSpinner';
import { useProjectId, useSamples } from '../hooks/useProject';

/**
 * SampleRevisionRequestPage - 샘플 재수정 요청 페이지
 */
export function SampleRevisionRequestPage({ projectService }) {
  const projectId = useProjectId();
  const { samples, loading, error, reload } = useSamples(projectService, projectId);
  const [additionalRequest, setAdditionalRequest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const latestSample = samples[0] || null;
  const existingRequests = latestSample?.revisionRequest
    ? latestSample.revisionRequest.split(/[,\n•]/).filter(Boolean).map((r) => r.trim())
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!additionalRequest.trim()) {
      alert('수정 요청사항을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (projectService?.createRevisionRequest) {
        await projectService.createRevisionRequest(projectId, additionalRequest);
      }
      alert('재수정 요청이 완료되었습니다. 1-2일 내에 결과를 받아보실 수 있습니다.');
      setAdditionalRequest('');

      // 대기 페이지로 이동
      const params = new URLSearchParams(window.location.search);
      params.set('page', 'waiting');
      window.location.search = params.toString();
    } catch (err) {
      setSubmitError(err.message || '요청 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header status="재수정 요청" currentStep={2} />

      <main id="main" className="bg-neutral-50 flex-1">
        <div className="max-w-screen-xl mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-800 rounded-full mb-6">
                <i className="fa-solid fa-edit text-white text-3xl"></i>
              </div>
              <h1 className="text-3xl text-neutral-900 mb-4">샘플 재수정 요청</h1>
              <p className="text-lg text-neutral-600">어떤 부분을 수정하면 좋을지 구체적으로 알려주세요.</p>
            </div>

            {loading && <LoadingSpinner message="기존 요청사항을 불러오는 중..." />}
            {error && <ErrorMessage message={error.message} onRetry={reload} />}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-neutral-200 mb-8">
              <div className="p-8">
                <h2 className="text-xl text-neutral-900 mb-6">추가 요청사항</h2>

                <div className="mb-6">
                  <label className="block text-sm text-neutral-700 mb-3">수정하고 싶은 부분을 상세히 작성해주세요</label>
                  <textarea
                    rows="8"
                    value={additionalRequest}
                    onChange={(e) => setAdditionalRequest(e.target.value)}
                    placeholder="예: 얼굴톤이 너무 밝게 나왔어요. 좀 더 자연스러운 톤으로 조정해주세요.
턱선 보정이 과해 보입니다. 원본의 자연스러운 느낌을 살려주세요.
눈 보정을 추가로 해주시면 좋겠어요."
                    className="w-full p-4 border border-neutral-300 rounded-lg resize-none focus:outline-none focus:border-neutral-500 text-neutral-900"
                  />
                  <p className="text-sm text-neutral-500 mt-2">구체적인 요청사항을 작성하실수록 더 만족스러운 결과를 받으실 수 있습니다.</p>
                </div>

                {!loading && existingRequests.length > 0 && (
                  <div className="bg-neutral-50 rounded-lg p-6 mb-6">
                    <h3 className="text-neutral-900 mb-3">기존 요청사항 (참고용)</h3>
                    <ul className="space-y-2">
                      {existingRequests.map((request, idx) => (
                        <li key={idx} className="flex items-start space-x-3">
                          <i className="fa-solid fa-circle-dot text-neutral-600 text-xs mt-2"></i>
                          <span className="text-neutral-700">{request}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-700 text-sm">{submitError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-neutral-900 text-white px-8 py-4 rounded-lg hover:bg-neutral-800 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <i className="fa-solid fa-paper-plane"></i>
                    <span>{isSubmitting ? '전송 중...' : '재수정 요청하기'}</span>
                  </div>
                </button>
              </div>
            </form>

            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <i className="fa-solid fa-info-circle text-neutral-600 text-lg mt-1"></i>
                <div>
                  <h3 className="text-neutral-900 mb-2">재수정 안내</h3>
                  <p className="text-sm text-neutral-700 mb-3">
                    재수정 요청을 보내주시면 다시 '샘플 보정중' 상태로 변경되며, 수정된 결과를 확인하실 수 있습니다. 일반적으로 1-2일 내에 재수정 결과를 받아보실 수 있습니다.
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
