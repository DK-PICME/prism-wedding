/**
 * Footer - 페이지 하단 정보 및 연락처
 */
export function Footer() {
  return (
    <footer id="footer" className="bg-white border-t border-neutral-200 px-6 py-8">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-neutral-800 rounded flex items-center justify-center">
              <i className="fa-solid fa-prism text-white text-xs"></i>
            </div>
            <span className="text-sm text-neutral-600">프리즘 스튜디오</span>
          </div>
          <div className="flex items-center space-x-6">
            <span className="text-sm text-neutral-500">문의: contact@prismstudio.com</span>
            <span className="text-sm text-neutral-500">카카오톡: @prismstudio</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
