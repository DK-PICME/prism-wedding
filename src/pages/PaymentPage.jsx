import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';
import { useAuth } from '../contexts/AuthContext';
import priceConfigService from '../services/PriceConfigService.js';
import analyticsService from '../services/AnalyticsService.js';
import { ORDER_STATUS } from '../constants/OrderStatus.ts';

/**
 * PaymentPage - 결제 처리 페이지
 * 
 * 주문 정보를 확인하고 결제를 진행합니다.
 * 
 * 진입 조건:
 * - status = PENDING_PAYMENT
 * - 1시간 이내 (paymentDeadline 이전)
 * 
 * 플로우:
 * OrderDetailsPage (견적 확인)
 *   → PaymentPage (결제 수행)
 *   → 완료 (Order.status = PAID)
 */
export const PaymentPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { orderId } = useParams();

  // ─── 상태 관리 ─────────────────────────────────────────
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 결제 방법 선택
  const [paymentMethod, setPaymentMethod] = useState('card'); // card | bank_transfer | mobile

  // 결제 상태
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

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

    // 주문 정보 로드
    const loadOrder = async () => {
      try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await import('firebase/firestore').then(
          ({ getDoc }) => getDoc(orderRef)
        );

        if (!orderSnap.exists()) {
          setError('주문을 찾을 수 없습니다');
          setLoading(false);
          return;
        }

        const orderData = orderSnap.data();

        // 권한 검증
        if (orderData.userId !== currentUser.uid) {
          setError('접근 권한이 없습니다');
          setLoading(false);
          return;
        }

        // 진입 조건 검증 (1시간 이내)
        const paymentDeadline = orderData.paymentDeadline.toDate
          ? orderData.paymentDeadline.toDate()
          : new Date(orderData.paymentDeadline);

        if (new Date() > paymentDeadline) {
          setError('결제 기한이 만료되었습니다. 새 주문을 생성해주세요.');
          setLoading(false);
          return;
        }

        setOrder({ id: orderId, ...orderData });
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('[PaymentPage] 주문 로드 오류:', err);
        setError(`오류 발생: ${err.message}`);
        setLoading(false);
      }
    };

    loadOrder();
    analyticsService.track('payment_page_viewed', { orderId });
  }, [currentUser, orderId, navigate]);

  // ─── 결제 처리 ─────────────────────────────────────────
  const handlePayment = async (e) => {
    e.preventDefault();

    if (!order) {
      setPaymentError('주문 정보를 불러올 수 없습니다');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // 결제 처리 시뮬레이션 (2초 대기)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 실제 환경에서는 여기서 PG 연동 (Paddle, Portone 등)을 수행합니다.
      // 예: const result = await PaymentService.processPayment(order, paymentMethod);

      // 주문 상태 업데이트
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: ORDER_STATUS.PAID,
        updatedAt: serverTimestamp(),
      });

      console.log('[PaymentPage] 결제 완료:', order.id);

      // 분석 추적
      analyticsService.track('payment_completed', {
        orderId: order.id,
        totalAmount: order.totalAmount,
        paymentMethod,
      });

      setPaymentComplete(true);
      setIsProcessing(false);
    } catch (err) {
      console.error('[PaymentPage] 결제 실패:', err);
      setPaymentError(`결제 실패: ${err.message}`);
      setIsProcessing(false);

      analyticsService.trackError('payment_failed', err.message);
    }
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
              홈으로 이동
            </button>
          </div>
        </main>
        <PrismFooter />
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <PrismHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">결제 완료!</h1>
            <p className="text-neutral-600 mb-6">
              주문이 완료되었습니다. 결제 금액은 {priceConfigService.formatPrice(order.totalAmount)}입니다.
            </p>
            <button
              onClick={() => navigate('/photo-management')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              완료
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

      <main className="flex-1 pt-[73px] pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* 페이지 제목 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900">결제</h1>
            <p className="text-neutral-600 mt-2">주문을 완료하려면 결제를 진행하세요</p>
          </div>

          {/* 에러 메시지 */}
          {paymentError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {paymentError}
            </div>
          )}

          <form onSubmit={handlePayment} className="space-y-8">
            {/* 주문 요약 */}
            <section className="bg-white p-6 rounded-lg border border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">📋 주문 요약</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">신부/신랑</span>
                  <span className="font-medium">{order.brideName} / {order.groomName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">촬영 유형</span>
                  <span className="font-medium">{order.shootingType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">촬영 장소</span>
                  <span className="font-medium">{order.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">선택된 사진</span>
                  <span className="font-medium">{order.photoIds.length}장</span>
                </div>
                <div className="border-t border-neutral-200 pt-3 flex justify-between">
                  <span className="text-neutral-600">총 결제액</span>
                  <span className="text-lg font-bold text-blue-600">
                    {priceConfigService.formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </section>

            {/* 결제 방법 선택 */}
            <section className="bg-white p-6 rounded-lg border border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">💳 결제 방법</h2>

              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-neutral-200 rounded-lg cursor-pointer hover:border-blue-400 transition"
                  style={{
                    borderColor: paymentMethod === 'card' ? '#2563eb' : '',
                    backgroundColor: paymentMethod === 'card' ? '#eff6ff' : '',
                  }}>
                  <input
                    type="radio"
                    name="payment-method"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 font-medium text-neutral-900">신용카드 / 체크카드</span>
                </label>

                <label className="flex items-center p-4 border-2 border-neutral-200 rounded-lg cursor-pointer hover:border-blue-400 transition"
                  style={{
                    borderColor: paymentMethod === 'bank_transfer' ? '#2563eb' : '',
                    backgroundColor: paymentMethod === 'bank_transfer' ? '#eff6ff' : '',
                  }}>
                  <input
                    type="radio"
                    name="payment-method"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 font-medium text-neutral-900">계좌이체</span>
                </label>

                <label className="flex items-center p-4 border-2 border-neutral-200 rounded-lg cursor-pointer hover:border-blue-400 transition"
                  style={{
                    borderColor: paymentMethod === 'mobile' ? '#2563eb' : '',
                    backgroundColor: paymentMethod === 'mobile' ? '#eff6ff' : '',
                  }}>
                  <input
                    type="radio"
                    name="payment-method"
                    value="mobile"
                    checked={paymentMethod === 'mobile'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 font-medium text-neutral-900">휴대폰 결제</span>
                </label>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
                <p>⚠️ 현재 MockPayment로 동작합니다. 실제 결제는 PG 연동 후 구현됩니다.</p>
              </div>
            </section>

            {/* 이용약관 */}
            <section className="bg-neutral-50 p-4 rounded-lg">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0"
                />
                <span className="ml-3 text-sm text-neutral-700">
                  결제 이용약관 및 개인정보 처리방침에 동의합니다
                </span>
              </label>
            </section>

            {/* 버튼 */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition font-medium"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    결제 진행 중...
                  </span>
                ) : (
                  `${priceConfigService.formatPrice(order.totalAmount)} 결제하기`
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <PrismFooter />
    </div>
  );
};
