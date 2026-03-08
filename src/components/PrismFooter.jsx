export const PrismFooter = () => {
  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="max-w-[1376px] mx-auto px-8">
        <div className="grid grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-neutral-700 to-neutral-500 rounded-lg">
                <i className="fa-solid fa-gem text-white text-sm"></i>
              </div>
              <span className="text-lg">Prism Studio</span>
            </div>
            <p className="text-neutral-400 text-sm">AI 기반 사진 보정 서비스로 완벽한 결과물을 만들어보세요.</p>
          </div>

          <div>
            <h4 className="text-white mb-3">서비스</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">AI 보정</a></li>
              <li><a href="#" className="hover:text-white transition-colors">배치 처리</a></li>
              <li><a href="#" className="hover:text-white transition-colors">품질 관리</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white mb-3">지원</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">도움말</a></li>
              <li><a href="#" className="hover:text-white transition-colors">문의하기</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API 문서</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white mb-3">회사</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">소개</a></li>
              <li><a href="#" className="hover:text-white transition-colors">이용약관</a></li>
              <li><a href="#" className="hover:text-white transition-colors">개인정보처리방침</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-8 mt-8 text-center text-neutral-400 text-sm">
          <p>&copy; 2025 Prism Studio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
