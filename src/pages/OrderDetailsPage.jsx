import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';
import { useAuth } from '../contexts/AuthContext';
import priceConfigService from '../services/PriceConfigService.js';
import analyticsService from '../services/AnalyticsService.js';

/**
 * OrderDetailsPage - 주문 상세 및 견적서 확인 페이지
 *
 * 주문 정보와 가격 내역을 확인하고 결제 페이지로 이동합니다.
 * 사진 복제는 결제 완료 후 백그라운드에서 자동 처리됩니다 (Phase 3).
 *
 * 플로우:
 * CreateNewOrderPage → OrderDetailsPage (견적 확인) → PaymentPage
 */
export const OrderDetailsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { orderId } = useParams();

  // ─── 상태 관리 ─────────────────────────────────────────
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── 초기 로드 ─────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!orderId) {
      setError('주문 ID가 없습니다');
      setLoading(false);
      return;
    }

    // Firestore 실시간 구독 (onSnapshot)
    const orderRef = doc(db, 'orders', orderId);
    const unsubscribe = onSnapshot(
      orderRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const orderData = snapshot.data();
          
          // 권한 검증 (본인 주문만 볼 수 있음)
          if (orderData.userId !== currentUser.uid) {
            setError('접근 권한이 없습니다');
            setLoading(false);
            return;
          }

          setOrder({ id: orderId, ...orderData });
          setError(null);
        } else {
          setError('주문을 찾을 수 없습니다');
        }
        setLoading(false);
      },
      (err) => {
        console.error('[OrderDetailsPage] 구독 오류:', err);
        setError(`오류 발생: ${err.message}`);
        setLoading(false);
      }
    );

    analyticsService.track('order_details_viewed', { orderId });

    return () => unsubscribe();
  }, [currentUser, orderId, navigate]);

  // ─── 결제 진행 ─────────────────────────────────────────
  const handlePayment = () => {
    analyticsService.track('payment_initiated', {
      orderId,
      totalAmount: order.totalAmount,
    });

    navigate(`/orders/${orderId}/payment`);
  };

  // ─── 렌더링 유틸리티 ─────────────────────────────────────────

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('ko-KR');
  };

  // ─── 렌더링 ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <PrismHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-neutral-300 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-neutral-600">로딩 중...</p>
          </div>
        </main>
        <PrismFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <PrismHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">오류 발생</h1>
            <p className="text-neutral-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/photo-management')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              사진 관리로 이동
            </button>
          </div>
        </main>
        <PrismFooter />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <PrismHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">주문을 찾을 수 없습니다</h1>
            <p className="text-neutral-600 mb-6">주문 정보를 조회할 수 없습니다.</p>
            <button
              onClick={() => navigate('/photo-management')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              사진 관리로 이동
            </button>
          </div>
        </main>
        <PrismFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <PrismHeader />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* 페이지 제목 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900">주문 확인</h1>
            <p className="text-neutral-600 mt-2">주문 내용을 확인하고 결제를 진행하세요</p>
          </div>

          {/* 주문 기본 정보 */}
          <section className="bg-white p-6 rounded-lg border border-neutral-200 mb-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">📋 주문 정보</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-600">신부 이름</p>
                <p className="text-lg font-medium text-neutral-900">{order.brideName}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">신랑 이름</p>
                <p className="text-lg font-medium text-neutral-900">{order.groomName}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">촬영 유형</p>
                <p className="text-lg font-medium text-neutral-900">
                  {order.shootingType === 'wedding' && '웨딩 촬영'}
                  {order.shootingType === 'snap' && '스냅 촬영'}
                  {order.shootingType === 'photobook' && '포토북'}
                  {order.shootingType === 'other' && '기타'}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">촬영 장소</p>
                <p className="text-lg font-medium text-neutral-900">{order.location}</p>
              </div>
            </div>

            {order.notes && (
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <p className="text-sm text-neutral-600">요청사항</p>
                <p className="text-neutral-900">{order.notes}</p>
              </div>
            )}
          </section>

          {/* 사진 정보 */}
          <section className="bg-white p-6 rounded-lg border border-neutral-200 mb-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">📸 선택된 사진</h2>
            <p className="text-neutral-600">
              총 <span className="font-bold text-blue-600">{order.photoIds.length}장</span>의 사진이 선택되었습니다
            </p>
          </section>

          {/* 가격 정보 */}
          <section className="bg-white p-6 rounded-lg border border-neutral-200 mb-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">💰 가격 정보</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">장당 단가</span>
                <span>{priceConfigService.formatPrice(order.priceSnapshot?.baseUnitPrice || 0)} × {order.photoCount}장</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">기본 가격</span>
                <span className="font-medium">{priceConfigService.formatPrice(order.basePrice)}</span>
              </div>
              {order.optionCost > 0 && (
                <div className="flex justify-between text-blue-600">
                  <span>긴급 보정 추가금</span>
                  <span className="font-medium">+{priceConfigService.formatPrice(order.optionCost)}</span>
                </div>
              )}
              <div className="border-t border-neutral-200 pt-2 mt-2 flex justify-between">
                <span className="text-neutral-600">부가세 (10%)</span>
                <span className="font-medium">{priceConfigService.formatPrice(order.vatAmount)}</span>
              </div>
              <div className="border-t border-neutral-200 pt-2 mt-2 flex justify-between bg-blue-50 p-2 rounded">
                <span className="font-semibold text-neutral-900">총액</span>
                <span className="font-bold text-lg text-blue-600">{priceConfigService.formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </section>

          {/* 주문 메타데이터 */}
          <section className="bg-neutral-50 p-4 rounded-lg text-sm text-neutral-600 space-y-1 mb-8">
            <div>주문 ID: <span className="font-mono text-neutral-700">{order.id}</span></div>
            <div>주문 생성: {formatDate(order.createdAt)}</div>
            <div>마지막 업데이트: {formatDate(order.updatedAt)}</div>
            {order.paymentDeadline && (
              <div>
                결제 기한: {formatDate(order.paymentDeadline)}
                {new Date(order.paymentDeadline.toDate ? order.paymentDeadline.toDate() : order.paymentDeadline) < new Date() && (
                  <span className="text-red-600 font-semibold ml-2">기한 만료</span>
                )}
              </div>
            )}
          </section>

          {/* 액션 버튼 */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/photo-management')}
              className="flex-1 px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition font-medium"
            >
              돌아가기
            </button>
            <button
              onClick={handlePayment}
              className="flex-1 px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition font-medium"
            >
              결제하기
            </button>
          </div>
        </div>
      </main>

      <PrismFooter />
    </div>
  );
};
