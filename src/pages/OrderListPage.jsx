import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';
import { useAuth } from '../contexts/AuthContext';
import priceConfigService from '../services/PriceConfigService.js';
import analyticsService from '../services/AnalyticsService.js';
import { ORDER_STATUS, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '../constants/OrderStatus.ts';

export const OrderListPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // 주문 로드 (ProtectedRoute에서 인증 보장됨)
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    
    try {
      // Firestore에서 사용자의 모든 주문 실시간 구독
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const ordersList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          
          setOrders(ordersList);
          setError(null);
          setLoading(false);
          
          analyticsService.track('order_list_viewed', {
            orderCount: ordersList.length,
          });
        },
        (err) => {
          console.error('[OrderListPage] 주문 로드 오류:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('[OrderListPage] 오류:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [currentUser, navigate]);

  // 필터링된 주문 목록
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.brideName?.toLowerCase().includes(searchText.toLowerCase()) ||
      order.groomName?.toLowerCase().includes(searchText.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // 상태별 통계
  const stats = [
    { 
      label: '대기중', 
      count: orders.filter(o => o.status === ORDER_STATUS.READY_TO_PAY).length,
      icon: 'fa-clock' 
    },
    { 
      label: '진행중', 
      count: orders.filter(o => [ORDER_STATUS.PAID, ORDER_STATUS.CORRECTING].includes(o.status)).length,
      icon: 'fa-spinner' 
    },
    { 
      label: '완료', 
      count: orders.filter(o => o.status === ORDER_STATUS.DELIVERY_DONE).length,
      icon: 'fa-check-circle' 
    },
  ];

  // 상태 라벨
  const getStatusLabel = (status) => {
    const labelMap = {
      [ORDER_STATUS.READY_TO_PAY]: { label: ORDER_STATUS_LABEL.READY_TO_PAY, icon: 'fa-clock' },
      [ORDER_STATUS.WAITING_BANK_INPUT]: { label: ORDER_STATUS_LABEL.WAITING_BANK_INPUT, icon: 'fa-piggy-bank' },
      [ORDER_STATUS.PAID]: { label: ORDER_STATUS_LABEL.PAID, icon: 'fa-credit-card' },
      [ORDER_STATUS.CORRECTING]: { label: ORDER_STATUS_LABEL.CORRECTING, icon: 'fa-wand-magic-sparkles' },
      [ORDER_STATUS.PRINTING]: { label: ORDER_STATUS_LABEL.PRINTING, icon: 'fa-print' },
      [ORDER_STATUS.BEFORE_DELIVERY]: { label: ORDER_STATUS_LABEL.BEFORE_DELIVERY, icon: 'fa-box' },
      [ORDER_STATUS.IN_DELIVERY]: { label: ORDER_STATUS_LABEL.IN_DELIVERY, icon: 'fa-truck' },
      [ORDER_STATUS.DELIVERY_DONE]: { label: ORDER_STATUS_LABEL.DELIVERY_DONE, icon: 'fa-check-circle' },
      [ORDER_STATUS.CANCELLED]: { label: ORDER_STATUS_LABEL.CANCELLED, icon: 'fa-times' },
    };
    return labelMap[status] || { label: status, icon: 'fa-question' };
  };

  // 날짜 포맷
  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PrismHeader activeNav="order-list" />

      <main className="flex-1 pt-[73px] pb-8">
        <div className="px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mb-4"></div>
              <p className="text-neutral-600">주문 내역 로드 중...</p>
            </div>
          </div>
        ) : error ? (
          <div className="max-w-[1376px] mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-700">오류 발생: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                다시 시도
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-[1376px] mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900 mb-1">주문 내역</h1>
                  <div className="flex items-center gap-3">
                    <p className="text-neutral-600">
                      보정 주문 프로젝트를 관리하고 진행 상태를 확인하세요 💍
                    </p>
                    {stats.find(s => s.label === '대기중')?.count > 0 && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 text-sm font-medium rounded-full">
                        <i className="fa-solid fa-hourglass-end"></i>
                        결제 대기: {stats.find(s => s.label === '대기중')?.count}건
                      </span>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/orders/new')}
                  className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 rounded-xl transition-colors cursor-pointer font-medium shadow-lg hover:shadow-xl"
                >
                  <i className="fa-solid fa-plus"></i>
                  새 주문 시작
                </button>
              </div>

              {/* 결제 대기 배너 */}
              {stats.find(s => s.label === '대기중')?.count > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <i className="fa-solid fa-bell text-orange-600 text-xl"></i>
                      <div>
                        <p className="font-semibold text-orange-900">
                          결제 대기 중인 주문이 있습니다
                        </p>
                        <p className="text-sm text-orange-700">
                          1시간 이내에 결제를 완료해야 주문이 보존됩니다
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setFilterStatus(ORDER_STATUS.READY_TO_PAY)}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      결제하기
                    </button>
                  </div>
                </div>
              )}

              {/* 검색 및 필터 */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                      <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"></i>
                      <input
                        type="text"
                        placeholder="신부/신랑 이름, 주문 ID 검색..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      />
                  </div>
                </div>

                {/* 상태 필터는 제거됨 - PhotoManagementPage로 이동 */}
              </div>

              {/* 통계 카드 */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {stats.map((stat, idx) => (
                  <div key={idx} className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-neutral-600">{stat.label}</span>
                      <div className="flex items-center justify-center w-10 h-10 bg-neutral-100 rounded-lg">
                        <i className={`fa-solid ${stat.icon} text-neutral-600`}></i>
                      </div>
                    </div>
                    <div className="text-3xl text-neutral-900">{stat.count}</div>
                  </div>
                ))}
              </div>

              {/* 주문 테이블 */}
              {filteredOrders.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-neutral-600 text-lg">주문 내역이 없습니다</p>
                  <button
                    onClick={() => navigate('/orders/new')}
                    className="mt-4 px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
                  >
                    첫 주문 생성하기
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-200">
                          <th className="text-left px-6 py-4 text-sm text-neutral-600">신부/신랑</th>
                          <th className="text-left px-6 py-4 text-sm text-neutral-600">상태</th>
                          <th className="text-left px-6 py-4 text-sm text-neutral-600">사진 수</th>
                          <th className="text-left px-6 py-4 text-sm text-neutral-600">금액</th>
                          <th className="text-left px-6 py-4 text-sm text-neutral-600">생성일</th>
                          <th className="text-right px-6 py-4 text-sm text-neutral-600">작업</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => {
                          const statusInfo = getStatusLabel(order.status);
                          return (
                            <tr key={order.id} className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors">
                              <td className="px-6 py-4">
                                <div className="text-neutral-900 font-medium">{order.brideName} & {order.groomName}</div>
                                <div className="text-sm text-neutral-500">ID: {order.id.slice(0, 8)}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium ${
                                  order.status === ORDER_STATUS.READY_TO_PAY ? 'bg-indigo-50 text-indigo-700' :
                                  order.status === ORDER_STATUS.WAITING_BANK_INPUT ? 'bg-cyan-50 text-cyan-700' :
                                  order.status === ORDER_STATUS.PAID ? 'bg-teal-50 text-teal-700' :
                                  order.status === ORDER_STATUS.CORRECTING ? 'bg-amber-50 text-amber-700' :
                                  order.status === ORDER_STATUS.PRINTING ? 'bg-purple-50 text-purple-700' :
                                  order.status === ORDER_STATUS.BEFORE_DELIVERY ? 'bg-orange-50 text-orange-700' :
                                  order.status === ORDER_STATUS.IN_DELIVERY ? 'bg-blue-50 text-blue-700' :
                                  order.status === ORDER_STATUS.DELIVERY_DONE ? 'bg-green-50 text-green-700' :
                                  'bg-red-50 text-red-700'
                                }`}>
                                  <i className={`fa-solid ${statusInfo.icon}`}></i>
                                  {statusInfo.label}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-neutral-900 font-medium">{order.photoCount}장</div>
                              </td>
                              <td className="px-6 py-4 text-neutral-900 font-medium">
                                {priceConfigService.formatPrice(order.totalAmount)}
                              </td>
                              <td className="px-6 py-4 text-neutral-600">{formatDate(order.createdAt)}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => navigate(`/orders/${order.id}`)}
                                    className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                                    title="주문 상세 보기"
                                  >
                                    <i className="fa-solid fa-eye"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
        )}
        </div>
      </main>

      <PrismFooter />
    </div>
  );
};
