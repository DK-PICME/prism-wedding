/**
 * ContactInfo - 연락처 및 문의 정보
 */
export function ContactInfo() {
  return (
    <div className="mt-8 bg-neutral-50 border border-neutral-200 rounded-lg p-6">
      <div className="flex items-start space-x-3">
        <i className="fa-solid fa-comment-dots text-neutral-600 text-lg mt-1"></i>
        <div>
          <h3 className="text-neutral-900 mb-2">궁금한 점이 있으신가요?</h3>
          <p className="text-sm text-neutral-700 mb-3">카카오톡으로 문의하시면 빠르게 답변드리겠습니다.</p>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-neutral-600">카카오톡: @prismstudio</span>
            <span className="text-sm text-neutral-400">|</span>
            <span className="text-sm text-neutral-600">이메일: contact@prismstudio.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
