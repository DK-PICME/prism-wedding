import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';
import OrderHistoryMain from '../components/OrderHistoryMain';
import { useAuth } from '../contexts/AuthContext';
import analyticsService from '../services/AnalyticsService.js';

export const OrderListPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleCreateOrder = () => {
    navigate('/orders/new');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PrismHeader activeNav="order-list" />

      {loading ? (
        <main className="flex-1 pt-[73px] pb-8">
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mb-4"></div>
              <p className="text-neutral-600">주문 내역 로드 중...</p>
            </div>
          </div>
        </main>
      ) : error ? (
        <main className="flex-1 pt-[73px] pb-8">
          <div className="px-8 py-8">
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
          </div>
        </main>
      ) : (
        <div className="pt-[73px]">
          <OrderHistoryMain onCreateOrder={handleCreateOrder} />
        </div>
      )}

      <PrismFooter />
    </div>
  );
};
