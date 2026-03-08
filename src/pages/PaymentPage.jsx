import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';

export const PaymentPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <PrismHeader activeNav="order-list" />

      <main className="pt-[73px]">
        <div className="px-8 py-8">
          <div className="max-w-[1376px] mx-auto">
            <h1 className="text-3xl text-neutral-900 mb-2">결제</h1>
            <p className="text-neutral-600 mb-8">안전한 결제로 주문을 완료하세요</p>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-6">
                  <h2 className="text-lg text-neutral-900 mb-4">주문 정보</h2>
                  <div className="space-y-3 pb-4 border-b border-neutral-200">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">주문명</span>
                      <span className="text-neutral-900">김민수 & 박지영 웨딩</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">주문번호</span>
                      <span className="text-neutral-900">ORD-2025-0122-4782</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">촬영 날짜</span>
                      <span className="text-neutral-900">2025-01-20</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-6">
                  <h2 className="text-lg text-neutral-900 mb-4">결제 방법</h2>
                  <div className="space-y-3">
                    {[
                      { id: 'card', label: '신용카드', icon: 'fa-credit-card' },
                      { id: 'bank', label: '계좌이체', icon: 'fa-bank' },
                      { id: 'mobile', label: '휴대폰 결제', icon: 'fa-mobile' },
                    ].map((method) => (
                      <label key={method.id} className="flex items-center p-4 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
                        <input type="radio" name="payment" defaultChecked={method.id === 'card'} className="w-4 h-4" />
                        <i className={`fa-solid ${method.icon} ml-3 mr-3 text-neutral-600`}></i>
                        <span className="text-neutral-900">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                  <h2 className="text-lg text-neutral-900 mb-4">신용카드 정보</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">카드번호</label>
                      <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-neutral-700 mb-2">유효기간</label>
                        <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                      </div>
                      <div>
                        <label className="block text-sm text-neutral-700 mb-2">CVC</label>
                        <input type="text" placeholder="000" className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                      </div>
                      <div>
                        <label className="block text-sm text-neutral-700 mb-2">카드주인명</label>
                        <input type="text" placeholder="이름" className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 sticky top-24">
                  <h2 className="text-lg text-neutral-900 mb-4">결제 요약</h2>
                  <div className="space-y-3 pb-4 border-b border-neutral-200 mb-4">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">기본 요금</span>
                      <span className="text-neutral-900">₩300,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">추가 요금</span>
                      <span className="text-neutral-900">₩150,000</span>
                    </div>
                  </div>

                  <div className="bg-neutral-50 p-4 rounded-lg mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-900 font-semibold">총 결제금액</span>
                      <div>
                        <div className="text-2xl text-neutral-900 font-semibold">₩450,000</div>
                      </div>
                    </div>
                  </div>

                  <label className="flex items-start gap-2 mb-6 p-3 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                    <input type="checkbox" className="w-4 h-4 mt-0.5" defaultChecked />
                    <span className="text-sm text-neutral-600">결제 약관에 동의합니다</span>
                  </label>

                  <button className="w-full px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors font-medium mb-2">
                    ₩450,000 결제
                  </button>
                  <button className="w-full px-6 py-3 border border-neutral-300 hover:bg-neutral-50 text-neutral-900 rounded-lg transition-colors">
                    취소
                  </button>
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
