import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';

export const InquiryPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <PrismHeader activeNav="order-list" />

      <main className="pt-[73px]">
        <div className="px-8 py-8">
          <div className="max-w-[1376px] mx-auto">
            <h1 className="text-3xl text-neutral-900 mb-2">문의</h1>
            <p className="text-neutral-600 mb-8">Prism Studio에 관한 문의사항이 있으신가요? 언제든지 문의해주세요</p>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-neutral-100 rounded-lg mb-4">
                  <i className="fa-solid fa-envelope text-neutral-600 text-lg"></i>
                </div>
                <h3 className="text-lg text-neutral-900 mb-2">이메일</h3>
                <p className="text-sm text-neutral-600 mb-4">support@prismstudio.com</p>
                <p className="text-xs text-neutral-500">24시간 내 답변</p>
              </div>

              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-neutral-100 rounded-lg mb-4">
                  <i className="fa-solid fa-phone text-neutral-600 text-lg"></i>
                </div>
                <h3 className="text-lg text-neutral-900 mb-2">전화</h3>
                <p className="text-sm text-neutral-600 mb-4">02-XXXX-XXXX</p>
                <p className="text-xs text-neutral-500">월-금 09:00~18:00</p>
              </div>

              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-neutral-100 rounded-lg mb-4">
                  <i className="fa-solid fa-message text-neutral-600 text-lg"></i>
                </div>
                <h3 className="text-lg text-neutral-900 mb-2">카카오톡</h3>
                <p className="text-sm text-neutral-600 mb-4">@prismstudio</p>
                <p className="text-xs text-neutral-500">즉시 답변</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                  <h2 className="text-lg text-neutral-900 mb-4">자주 묻는 질문 (FAQ)</h2>
                  <div className="space-y-3">
                    {[
                      { q: '사진 보정에 걸리는 시간은?', a: '보정 일수는 선택한 옵션에 따라 다릅니다' },
                      { q: '환불 정책은 무엇인가요?', a: '사진 다운로드 전까지 전액 환불 가능합니다' },
                      { q: '최대 사진 수는?', a: '제한 없이 모든 사진을 처리할 수 있습니다' },
                      { q: '파일 형식은 무엇인가요?', a: 'JPG, PNG, TIFF 등 대부분의 형식 지원' },
                    ].map((item, idx) => (
                      <details key={idx} className="border border-neutral-200 rounded-lg p-4 cursor-pointer hover:bg-neutral-50">
                        <summary className="text-neutral-900 font-medium flex items-center justify-between">
                          {item.q}
                          <i className="fa-solid fa-chevron-down text-neutral-400"></i>
                        </summary>
                        <p className="text-sm text-neutral-600 mt-3">{item.a}</p>
                      </details>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                  <h2 className="text-lg text-neutral-900 mb-4">문의하기</h2>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">이름</label>
                      <input type="text" placeholder="성명" className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                    </div>

                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">이메일</label>
                      <input type="email" placeholder="wedding@example.com" className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                    </div>

                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">문의 분류</label>
                      <select className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900">
                        <option>일반 문의</option>
                        <option>기술 지원</option>
                        <option>결제 관련</option>
                        <option>기타</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">내용</label>
                      <textarea rows="6" placeholder="문의 내용을 입력해주세요" className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"></textarea>
                    </div>

                    <button type="submit" className="w-full px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors font-medium">
                      문의 전송
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PrismFooter />
    </div>
  );
};
