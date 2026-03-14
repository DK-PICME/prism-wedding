import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';
import { useAuth } from '../contexts/AuthContext';
import priceConfigService from '../services/PriceConfigService.js';
import analyticsService from '../services/AnalyticsService.js';
import { ORDER_STATUS, ORDER_STATUS_LABEL } from '../constants/OrderStatus.ts';

const CORRECTION_PURPOSE_LABEL = {
  invitation: '📱 모바일 청첩장',
  table: '🖼️ 포토 테이블',
  personal: '💾 소장용',
  other: '✏️ 기타',
};

const CORRECTION_OPTION_LABEL = {
  basic: '기본 보정',
  urgent: '긴급 보정',
};

/**
 * OrderDetailsPage - 주문 상세 및 견적서 확인 페이지
 *
 * 주문 정보와 가격 내역을 확인하고 결제 페이지로 이동합니다.
 * 타임아웃 카운트다운(1시간) 표시 포함.
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

  // 타임아웃 카운트다운
  const [remainingMs, setRemainingMs] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  // ─── 초기 로드 (Firestore 실시간 구독) ─────────────────────────────────────────
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

    const orderRef = doc(db, 'orders', orderId);
    const unsubscribe = onSnapshot(
      orderRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const orderData = snapshot.data();

          // 권한 검증
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

  // ─── 타임아웃 카운트다운 ─────────────────────────────────────────
  useEffect(() => {
    if (!order?.paymentDeadline) return;
    // 이미 결제 완료된 상태는 카운트다운 불필요
    if (order.status !== ORDER_STATUS.READY_TO_PAY) return;

    const getDeadlineMs = () => {
      const dl = order.paymentDeadline;
      return dl?.toDate ? dl.toDate().getTime() : new Date(dl).getTime();
    };

    const tick = () => {
      const remaining = getDeadlineMs() - Date.now();
      if (remaining <= 0) {
        setIsExpired(true);
        setRemainingMs(0);
      } else {
        setRemainingMs(remaining);
      }
    };

    tick(); // 즉시 1회 실행
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval); // ✅ cleanup 필수
  }, [order?.paymentDeadline, order?.status]);

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
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCountdown = (ms) => {
    if (!ms || ms <= 0) return '00:00:00';
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
  };

  const getCountdownColor = (ms) => {
    if (!ms || ms <= 0) return 'text-red-600';
    const minutes = ms / 1000 / 60;
    if (minutes > 30) return 'text-emerald-600';
    if (minutes > 10) return 'text-amber-600';
    return 'text-red-600';
  };

  // ─── 렌더링 분기 ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <PrismHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
            <p className="mt-4 text-neutral-600">주문 정보를 불러오는 중...</p>
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
              className="px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition"
            >
              사진 관리로 이동
            </button>
          </div>
        </main>
        <PrismFooter />
      </div>
    );
  }

  if (!order) return null;

  const isPaid = order.status !== ORDER_STATUS.READY_TO_PAY;
  const canPay = !isExpired && order.status === ORDER_STATUS.READY_TO_PAY;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <PrismHeader />

      <main className="flex-1 pt-[73px] pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* 페이지 제목 */}
          <div className="mb-6 pt-8">
            <h1 className="text-3xl font-bold text-neutral-900">주문 확인</h1>
            <p className="text-neutral-600 mt-2">주문 내용을 확인하고 결제를 진행하세요</p>
          </div>

          {/* 타임아웃 카운트다운 (READY_TO_PAY 상태일 때만) */}
          {order.status === ORDER_STATUS.READY_TO_PAY && (
            <div
              className={`mb-6 p-4 rounded-xl border-2 flex items-center justify-between ${
                isExpired
                  ? 'border-red-300 bg-red-50'
                  : remainingMs !== null && remainingMs / 1000 / 60 < 10
                  ? 'border-red-200 bg-red-50'
                  : remainingMs !== null && remainingMs / 1000 / 60 < 30
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-emerald-200 bg-emerald-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{isExpired ? '⏰' : '⌛'}</span>
                <div>
                  <p className="text-sm font-medium text-neutral-700">
                    {isExpired ? '결제 기한이 만료되었습니다' : '결제 기한'}
                  </p>
                  {!isExpired && order.paymentDeadline && (
                    <p className="text-xs text-neutral-500">{formatDate(order.paymentDeadline)}까지</p>
                  )}
                </div>
              </div>
              {!isExpired && remainingMs !== null && (
                <div className={`text-2xl font-mono font-bold tabular-nums ${getCountdownColor(remainingMs)}`}>
                  {formatCountdown(remainingMs)}
                </div>
              )}
              {isExpired && (
                <button
                  onClick={() => navigate('/photo-management')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
                >
                  새 주문 생성
                </button>
              )}
            </div>
          )}

          {/* 결제 완료 상태 배지 */}
          {isPaid && (
            <div className="mb-6 p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-sm font-medium text-emerald-700">
                  {ORDER_STATUS_LABEL[order.status] || order.status}
                </p>
                <p className="text-xs text-emerald-600">결제가 완료된 주문입니다</p>
              </div>
            </div>
          )}

          <div className="space-y-5">
            {/* 주문 기본 정보 */}
            <section className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
              <h2 className="text-base font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <span>📋</span> 주문 정보
              </h2>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">신부</dt>
                  <dd className="font-medium text-neutral-900">{order.brideName || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">신랑</dt>
                  <dd className="font-medium text-neutral-900">{order.groomName || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">보정 목적</dt>
                  <dd className="font-medium text-neutral-900">
                    {CORRECTION_PURPOSE_LABEL[order.correctionPurpose] || order.correctionPurpose || '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">보정 옵션</dt>
                  <dd className="font-medium text-neutral-900">
                    {CORRECTION_OPTION_LABEL[order.correctionOption] || order.correctionOption || '-'}
                    {order.correctionOption === 'urgent' && (
                      <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">긴급</span>
                    )}
                  </dd>
                </div>
                {order.location && (
                  <div className="col-span-2">
                    <dt className="text-xs text-neutral-500 mb-1">촬영 장소</dt>
                    <dd className="font-medium text-neutral-900">{order.location}</dd>
                  </div>
                )}
              </dl>

              {order.notes && (
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <p className="text-xs text-neutral-500 mb-1">특별 요청사항</p>
                  <p className="text-neutral-700 text-sm whitespace-pre-wrap">{order.notes}</p>
                </div>
              )}
            </section>

            {/* 사진 정보 */}
            <section className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
              <h2 className="text-base font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <span>📸</span> 선택된 사진
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center text-xl">
                  🖼️
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">{order.photoIds?.length ?? 0}장</p>
                  <p className="text-sm text-neutral-500">선택된 사진 수</p>
                </div>
              </div>
            </section>

            {/* 가격 정보 */}
            <section className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
              <h2 className="text-base font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <span>💰</span> 가격 내역
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>장당 단가</span>
                  <span>
                    {priceConfigService.formatPrice(order.priceSnapshot?.baseUnitPrice || 0)} × {order.photoCount}장
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">기본 가격</span>
                  <span className="font-medium">{priceConfigService.formatPrice(order.basePrice)}</span>
                </div>
                {order.optionCost > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>긴급 보정 추가금</span>
                    <span className="font-medium">+{priceConfigService.formatPrice(order.optionCost)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-500">
                  <span>부가세 (10%)</span>
                  <span>{priceConfigService.formatPrice(order.vatAmount)}</span>
                </div>
                <div className="border-t border-neutral-200 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-neutral-900">총 결제 금액</span>
                  <span className="text-2xl font-bold text-neutral-900">
                    {priceConfigService.formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </section>

            {/* 주문 메타데이터 */}
            <section className="bg-neutral-50 p-4 rounded-xl text-xs text-neutral-500 space-y-1.5">
              <div>
                주문 ID: <span className="font-mono text-neutral-700 select-all">{order.id}</span>
              </div>
              <div>주문 생성: {formatDate(order.createdAt)}</div>
              {order.paymentDeadline && (
                <div>
                  결제 기한: {formatDate(order.paymentDeadline)}
                  {isExpired && (
                    <span className="text-red-500 font-semibold ml-2">⚠ 만료됨</span>
                  )}
                </div>
              )}
            </section>

            {/* 액션 버튼 */}
            <div className="flex gap-3 pb-4">
              <button
                onClick={() => navigate('/photo-management')}
                className="flex-1 px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-100 transition font-medium"
              >
                돌아가기
              </button>

              {canPay && (
                <button
                  onClick={handlePayment}
                  className="flex-1 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition font-medium"
                >
                  결제하기 →
                </button>
              )}

              {isExpired && (
                <button
                  onClick={() => navigate('/photo-management')}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
                >
                  새 주문 생성
                </button>
              )}

              {isPaid && (
                <button
                  onClick={() => navigate('/orders')}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-medium"
                >
                  내 주문 목록
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <PrismFooter />
    </div>
  );
};
