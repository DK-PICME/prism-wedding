import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';

export const OrderListPage = () => {
  const orders = [
    {
      id: 1,
      name: '김민수 & 박지영 웨딩',
      projectId: '#2025-0122',
      status: 'in-progress',
      statusLabel: '진행중',
      statusIcon: 'fa-spinner',
      photos: 150,
      progress: 85,
      date: '2025-01-20',
      paymentStatus: 'completed',
      amount: '₩450,000',
    },
    {
      id: 2,
      name: '이준호 & 최수진 스드메',
      projectId: '#2025-0121',
      status: 'waiting',
      statusLabel: '대기',
      statusIcon: 'fa-clock',
      photos: 85,
      progress: 0,
      date: '2025-01-21',
      paymentStatus: 'waiting',
      amount: '₩255,000',
    },
    {
      id: 3,
      name: '정대현 & 한소희 본식',
      projectId: '#2025-0118',
      status: 'completed',
      statusLabel: '완료',
      statusIcon: 'fa-check-circle',
      photos: 200,
      progress: 100,
      date: '2025-01-18',
      paymentStatus: 'completed',
      amount: '₩600,000',
    },
    {
      id: 4,
      name: '강태양 & 윤서연 야외촬영',
      projectId: '#2025-0115',
      status: 'in-progress',
      statusLabel: '진행중',
      statusIcon: 'fa-spinner',
      photos: 120,
      progress: 45,
      date: '2025-01-15',
      paymentStatus: 'completed',
      amount: '₩360,000',
    },
    {
      id: 5,
      name: '오성민 & 배유진 셀프웨딩',
      projectId: '#2025-0112',
      status: 'completed',
      statusLabel: '완료',
      statusIcon: 'fa-check-circle',
      photos: 95,
      progress: 100,
      date: '2025-01-12',
      paymentStatus: 'completed',
      amount: '₩285,000',
    },
  ];

  const stats = [
    { label: '대기중', count: 8, photos: '340장', icon: 'fa-clock' },
    { label: '진행중', count: 12, photos: '580장', icon: 'fa-spinner' },
    { label: '완료', count: 45, photos: '2,150장', icon: 'fa-check-circle' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PrismHeader activeNav="order-list" />

      <main className="pt-[73px]">
        <div className="px-8 py-8">
          <div className="max-w-[1376px] mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl text-neutral-900 mb-2">주문 내역</h1>
                <p className="text-neutral-600">보정 주문 프로젝트를 관리하고 진행 상태를 확인하세요</p>
              </div>

              <button className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 rounded-xl transition-colors">
                <i className="fa-solid fa-plus"></i>
                새 주문 생성
              </button>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"></i>
                    <input
                      type="text"
                      placeholder="주문명, 프로젝트명 검색..."
                      className="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select className="px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white text-neutral-700">
                    <option>전체 상태</option>
                    <option>대기</option>
                    <option>진행중</option>
                    <option>완료</option>
                  </select>

                  <select className="px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white text-neutral-700">
                    <option>전체 기간</option>
                    <option>최근 7일</option>
                    <option>최근 30일</option>
                    <option>최근 90일</option>
                  </select>

                  <button className="px-4 py-3 border border-neutral-300 hover:bg-neutral-50 rounded-xl transition-colors">
                    <i className="fa-solid fa-filter text-neutral-600"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white border border-neutral-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-neutral-600">{stat.label}</span>
                    <div className="flex items-center justify-center w-10 h-10 bg-neutral-100 rounded-lg">
                      <i className={`fa-solid ${stat.icon} text-neutral-600`}></i>
                    </div>
                  </div>
                  <div className="text-3xl text-neutral-900 mb-1">{stat.count}</div>
                  <div className="text-sm text-neutral-500">총 {stat.photos}</div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200">
                      <th className="text-left px-6 py-4 text-sm text-neutral-600">주문명</th>
                      <th className="text-left px-6 py-4 text-sm text-neutral-600">상태</th>
                      <th className="text-left px-6 py-4 text-sm text-neutral-600">사진 수</th>
                      <th className="text-left px-6 py-4 text-sm text-neutral-600">생성일</th>
                      <th className="text-left px-6 py-4 text-sm text-neutral-600">결제 상태</th>
                      <th className="text-left px-6 py-4 text-sm text-neutral-600">금액</th>
                      <th className="text-right px-6 py-4 text-sm text-neutral-600">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-neutral-900">{order.name}</div>
                          <div className="text-sm text-neutral-500">프로젝트 {order.projectId}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 text-neutral-700 rounded-lg text-sm">
                            <i className={`fa-solid ${order.statusIcon}`}></i>
                            {order.statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-neutral-900">{order.photos}장</div>
                          <div className="text-sm text-neutral-500">{order.progress}% 완료</div>
                        </td>
                        <td className="px-6 py-4 text-neutral-600">{order.date}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 text-neutral-700 rounded-lg text-sm">
                            <i className={`fa-solid ${order.paymentStatus === 'completed' ? 'fa-check' : 'fa-clock'}`}></i>
                            {order.paymentStatus === 'completed' ? '결제완료' : '대기중'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-neutral-900">{order.amount}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
                              <i className="fa-solid fa-eye"></i>
                            </button>
                            <button className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
                              <i className="fa-solid fa-ellipsis-vertical"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200">
                <div className="text-sm text-neutral-600">
                  총 <span className="text-neutral-900">65</span>개 주문 중 <span className="text-neutral-900">1-5</span> 표시
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-3 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    <i className="fa-solid fa-chevron-left text-neutral-600"></i>
                  </button>
                  <button className="px-4 py-2 bg-neutral-900 text-white rounded-lg">1</button>
                  <button className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors">2</button>
                  <button className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors">3</button>
                  <button className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors">4</button>
                  <span className="px-2 text-neutral-600">...</span>
                  <button className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors">13</button>
                  <button className="px-3 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors">
                    <i className="fa-solid fa-chevron-right text-neutral-600"></i>
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
