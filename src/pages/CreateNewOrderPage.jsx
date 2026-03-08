import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';

export const CreateNewOrderPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <PrismHeader activeNav="order-list" />

      <main className="pt-[73px]">
        <div className="px-8 py-8">
          <div className="max-w-[1376px] mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl text-neutral-900 mb-2">새 주문 생성</h1>
              <p className="text-neutral-600">새로운 보정 프로젝트를 생성하고 관리하세요</p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-6">
                  <h2 className="text-xl text-neutral-900 mb-6">기본 정보</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">신부명 & 신랑명</label>
                      <input type="text" placeholder="예: 김민수 & 박지영" className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                    </div>

                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">웨딩 종류</label>
                      <select className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900">
                        <option>본식 촬영</option>
                        <option>스튜디오 촬영</option>
                        <option>스드메 촬영</option>
                        <option>야외 촬영</option>
                        <option>셀프 웨딩</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-neutral-700 mb-2">촬영 날짜</label>
                        <input type="date" className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                      </div>
                      <div>
                        <label className="block text-sm text-neutral-700 mb-2">예상 사진 수</label>
                        <input type="number" placeholder="예: 150" className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">특별 요청사항</label>
                      <textarea rows="4" placeholder="예: 보정 스타일, 색감 톤, 특별한 요청사항 등" className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"></textarea>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                  <h2 className="text-xl text-neutral-900 mb-6">견적 정보</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">기본 가격 (장당)</label>
                      <div className="flex gap-2">
                        <input type="number" placeholder="₩" className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                        <span className="px-4 py-3 text-neutral-600">/ 장</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">추가 비용</label>
                      <input type="number" placeholder="₩ 0" className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                    </div>

                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-neutral-600">기본 가격</span>
                        <span className="text-neutral-900">₩0</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-neutral-600">추가 비용</span>
                        <span className="text-neutral-900">₩0</span>
                      </div>
                      <div className="border-t border-neutral-200 pt-2 mt-2 flex justify-between">
                        <span className="text-neutral-900 font-semibold">총액</span>
                        <span className="text-lg text-neutral-900 font-semibold">₩0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 sticky top-24">
                  <h2 className="text-lg text-neutral-900 mb-4">요약</h2>

                  <div className="space-y-4 mb-6 pb-6 border-b border-neutral-200">
                    <div>
                      <div className="text-xs text-neutral-600 mb-1">신부명 & 신랑명</div>
                      <div className="text-neutral-900 font-medium">미입력</div>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-600 mb-1">웨딩 종류</div>
                      <div className="text-neutral-900 font-medium">미선택</div>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-600 mb-1">촬영 날짜</div>
                      <div className="text-neutral-900 font-medium">미선택</div>
                    </div>
                  </div>

                  <div className="bg-neutral-50 p-4 rounded-lg mb-6">
                    <div className="text-xs text-neutral-600 mb-1">예상 총액</div>
                    <div className="text-2xl text-neutral-900 font-semibold">₩0</div>
                  </div>

                  <button className="w-full px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors font-medium mb-2">
                    주문 생성
                  </button>
                  <a href="?page=order-list" className="block w-full px-6 py-3 border border-neutral-300 hover:bg-neutral-50 text-neutral-900 rounded-lg transition-colors text-center cursor-pointer">
                    취소
                  </a>
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
