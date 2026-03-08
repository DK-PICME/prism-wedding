import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';

export const OrderDetailsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <PrismHeader activeNav="order-details" />

      <main className="pt-[73px]">
        <div className="px-8 py-8">
          <div className="max-w-[1376px] mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <button className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg">
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <div>
                <h1 className="text-3xl text-neutral-900">김민수 & 박지영 웨딩</h1>
                <p className="text-neutral-600">주문번호: ORD-2025-0122-4782</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              {[
                { label: '주문 상태', value: '진행중', icon: 'fa-spinner', color: 'text-blue-600' },
                { label: '결제 상태', value: '결제완료', icon: 'fa-check', color: 'text-green-600' },
                { label: '총 사진', value: '150장', icon: 'fa-images', color: 'text-purple-600' },
              ].map((item, idx) => (
                <div key={idx} className="bg-white border border-neutral-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-neutral-600">{item.label}</span>
                    <div className={`text-xl ${item.color}`}>
                      <i className={`fa-solid ${item.icon}`}></i>
                    </div>
                  </div>
                  <div className="text-2xl text-neutral-900">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <h2 className="text-lg text-neutral-900 mb-4">주문 정보</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">웨딩 유형</span>
                    <span className="text-neutral-900 font-medium">본식 촬영</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">촬영 날짜</span>
                    <span className="text-neutral-900 font-medium">2025-01-20</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">생성일</span>
                    <span className="text-neutral-900 font-medium">2025-01-18</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">보정 진행률</span>
                    <span className="text-neutral-900 font-medium">85%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <h2 className="text-lg text-neutral-900 mb-4">결제 정보</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">기본 요금</span>
                    <span className="text-neutral-900 font-medium">₩300,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">추가 요금</span>
                    <span className="text-neutral-900 font-medium">₩150,000</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-900 font-semibold">총액</span>
                      <span className="text-lg text-neutral-900 font-semibold">₩450,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
              <h2 className="text-lg text-neutral-900 mb-4">타임라인</h2>
              <div className="space-y-4">
                {[
                  { date: '2025-01-18 14:30', event: '주문 생성', status: 'completed' },
                  { date: '2025-01-19 09:15', event: '사진 업로드 시작', status: 'completed' },
                  { date: '2025-01-20 16:45', event: '사진 업로드 완료', status: 'completed' },
                  { date: '2025-01-21 10:00', event: 'AI 보정 진행중', status: 'in-progress' },
                  { date: '-', event: '보정 완료 및 다운로드 준비', status: 'pending' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${item.status === 'completed' ? 'bg-green-600' : item.status === 'in-progress' ? 'bg-blue-600' : 'bg-neutral-300'}`}></div>
                      {idx !== 4 && <div className="w-0.5 h-12 bg-neutral-200 mt-2"></div>}
                    </div>
                    <div className="pb-4">
                      <div className="text-sm text-neutral-600">{item.date}</div>
                      <div className="text-neutral-900 font-medium">{item.event}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <PrismFooter />
    </div>
  );
};
