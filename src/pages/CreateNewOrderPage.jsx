import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';
import { useAuth } from '../contexts/AuthContext';
import priceConfigService from '../services/PriceConfigService.js';
import analyticsService from '../services/AnalyticsService.js';
import { ORDER_STATUS } from '../constants/OrderStatus.ts';
import { Timestamp, collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';

const CORRECTION_PURPOSE_OPTIONS = [
  { value: 'invitation', label: '📱 모바일 청첩장', desc: '청첩장에 사용할 사진 보정' },
  { value: 'table', label: '🖼️ 포토 테이블', desc: '포토 테이블·전시용 사진 보정' },
  { value: 'personal', label: '💾 소장용', desc: '개인 소장·앨범용 사진 보정' },
  { value: 'other', label: '✏️ 기타', desc: '기타 목적' },
];

/**
 * CreateNewOrderPage - 새 주문 생성 페이지
 *
 * 선택된 사진 목록 → 주문 정보 입력 → 가격 계산 → Order 문서 생성
 *
 * 데이터 흐름:
 * PhotoManagementPage (선택된 사진)
 *   → CreateNewOrderPage (주문 정보 입력)
 *   → OrderDetailsPage (견적 확인)
 *   → PaymentPage (결제)
 */
export const CreateNewOrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  // ─── 상태 관리 ─────────────────────────────────────────

  // 선택된 사진 (sessionStorage 또는 Router state에서 복원)
  const [selectedPhotoIds, setSelectedPhotoIds] = useState([]);
  // 사진들의 folderId 추론 (첫 번째 사진의 폴더)
  const [folderId, setFolderId] = useState(null);

  // 주문 정보 폼
  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [correctionPurpose, setCorrectionPurpose] = useState('invitation'); // invitation | table | personal | other
  const [location_, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [correctionOption, setCorrectionOption] = useState('basic'); // basic | urgent

  // 가격 계산
  const [priceConfig, setPriceConfig] = useState(null);
  const [priceBreakdown, setPriceBreakdown] = useState(null);

  // UI 상태
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // ─── 초기 로드 ─────────────────────────────────────────
  useEffect(() => {
    const initPage = async () => {
      try {
        if (!currentUser) {
          navigate('/login');
          return;
        }

        // 1. 선택된 사진 복원 (Router state → sessionStorage 순서)
        let ids = [];
        if (location.state?.selectedPhotoIds?.length > 0) {
          ids = location.state.selectedPhotoIds;
        } else {
          const stored = sessionStorage.getItem('selectedPhotoIds');
          if (stored) {
            ids = JSON.parse(stored);
          }
        }
        sessionStorage.removeItem('selectedPhotoIds'); // 일회용이므로 제거
        setSelectedPhotoIds(ids);

        // 2. 첫 번째 사진에서 folderId 파악
        if (ids.length > 0) {
          try {
            const photoRef = doc(db, 'photos', ids[0]);
            const photoSnap = await getDoc(photoRef);
            if (photoSnap.exists()) {
              setFolderId(photoSnap.data().folderId || null);
            }
          } catch (e) {
            console.warn('[CreateNewOrderPage] folderId 로드 실패:', e);
          }
        }

        // 3. Remote Config 로드
        const config = await priceConfigService.initialize();
        setPriceConfig(config);

        setLoading(false);
        analyticsService.track('create_order_page_viewed');
      } catch (err) {
        console.error('[CreateNewOrderPage] 초기화 오류:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    initPage();
  }, [currentUser, navigate, location.state]);

  // ─── 가격 계산 (반응형) ─────────────────────────────────────────
  useEffect(() => {
    if (priceConfig && selectedPhotoIds.length > 0) {
      const breakdown = priceConfigService.calculateOrderPrice(
        selectedPhotoIds.length,
        correctionOption
      );
      setPriceBreakdown(breakdown);
    } else {
      setPriceBreakdown(null);
    }
  }, [selectedPhotoIds, correctionOption, priceConfig]);

  // ─── 폼 검증 ─────────────────────────────────────────
  const validateForm = () => {
    const errors = {};

    if (!brideName.trim()) errors.brideName = '신부 이름을 입력해주세요';
    if (!groomName.trim()) errors.groomName = '신랑 이름을 입력해주세요';
    if (!correctionPurpose) errors.correctionPurpose = '보정 목적을 선택해주세요';
    if (selectedPhotoIds.length === 0) errors.photos = '사진을 1개 이상 선택해주세요';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── 주문 생성 ─────────────────────────────────────────
  const handleCreateOrder = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('입력 양식을 확인해주세요');
      return;
    }

    if (!priceBreakdown) {
      setError('가격 계산이 완료되지 않았습니다');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const orderData = {
        userId: currentUser.uid,
        folderId: folderId || null,
        photoIds: selectedPhotoIds,

        // 주문 정보
        brideName: brideName.trim(),
        groomName: groomName.trim(),
        correctionPurpose,          // 보정 목적 (invitation | table | personal | other)
        location: location_.trim(),
        notes: notes.trim(),
        correctionOption,           // 보정 옵션 (basic | urgent)

        // 가격 정보 (주문 시점 Remote Config 스냅샷)
        priceSnapshot: priceBreakdown.priceSnapshot,
        photoCount: selectedPhotoIds.length,
        basePrice: priceBreakdown.basePrice,
        optionCost: priceBreakdown.optionCost,
        discount: priceBreakdown.discount,
        vatAmount: priceBreakdown.vatAmount,
        totalAmount: priceBreakdown.totalAmount,

        // 상태
        status: ORDER_STATUS.READY_TO_PAY,

        // 타임아웃 (1시간)
        paymentDeadline: new Timestamp(
          Math.floor(Date.now() / 1000) + 3600,
          0
        ),

        // 타임스탬프
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      const orderId = docRef.id;

      console.log('[CreateNewOrderPage] 주문 생성 성공:', orderId);

      analyticsService.track('order_created', {
        orderId,
        photoCount: selectedPhotoIds.length,
        totalAmount: priceBreakdown.totalAmount,
        correctionOption,
        correctionPurpose,
      });

      navigate(`/orders/${orderId}`, {
        state: { newOrder: true },
      });
    } catch (err) {
      console.error('[CreateNewOrderPage] 주문 생성 실패:', err);
      setError(`주문 생성 실패: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  // ─── 렌더링 ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <PrismHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
            <p className="mt-4 text-neutral-600">로딩 중...</p>
          </div>
        </main>
        <PrismFooter />
      </div>
    );
  }

  if (selectedPhotoIds.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <PrismHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">📸</div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">사진을 선택해주세요</h1>
            <p className="text-neutral-600 mb-6">
              사진 관리에서 READY 상태의 사진을 선택한 후 주문을 생성할 수 있습니다.
            </p>
            <button
              onClick={() => navigate('/photo-management')}
              className="px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition"
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

      <main className="flex-1 pt-[73px] pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* 페이지 제목 */}
          <div className="mb-8 pt-8">
            <h1 className="text-3xl font-bold text-neutral-900">새 주문 생성</h1>
            <p className="text-neutral-600 mt-2">주문 정보를 입력하고 가격을 확인하세요</p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-4">✕</button>
            </div>
          )}

          <form onSubmit={handleCreateOrder} className="space-y-6">
            {/* 섹션 1: 선택된 사진 정보 */}
            <section className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">📸 선택된 사진</h2>
              <div className="flex items-center justify-between">
                <p className="text-neutral-600">
                  총{' '}
                  <span className="font-bold text-neutral-900 text-lg">
                    {selectedPhotoIds.length}장
                  </span>
                  의 사진이 선택되었습니다
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/photo-management')}
                  className="text-sm text-neutral-500 underline hover:text-neutral-700"
                >
                  변경
                </button>
              </div>
            </section>

            {/* 섹션 2: 주문 정보 */}
            <section className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-5">
              <h2 className="text-lg font-semibold text-neutral-900">📋 주문 정보</h2>

              {/* 신부/신랑 이름 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    신부 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    placeholder="예: 김영희"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 transition ${
                      validationErrors.brideName ? 'border-red-400 bg-red-50' : 'border-neutral-300'
                    }`}
                  />
                  {validationErrors.brideName && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.brideName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    신랑 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    placeholder="예: 이민준"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 transition ${
                      validationErrors.groomName ? 'border-red-400 bg-red-50' : 'border-neutral-300'
                    }`}
                  />
                  {validationErrors.groomName && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.groomName}</p>
                  )}
                </div>
              </div>

              {/* 보정 목적 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  보정 목적 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CORRECTION_PURPOSE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex flex-col p-3 border-2 rounded-lg cursor-pointer transition ${
                        correctionPurpose === opt.value
                          ? 'border-neutral-900 bg-neutral-50'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="correctionPurpose"
                        value={opt.value}
                        checked={correctionPurpose === opt.value}
                        onChange={(e) => setCorrectionPurpose(e.target.value)}
                        className="sr-only"
                      />
                      <span className="font-medium text-sm text-neutral-900">{opt.label}</span>
                      <span className="text-xs text-neutral-400 mt-0.5">{opt.desc}</span>
                    </label>
                  ))}
                </div>
                {validationErrors.correctionPurpose && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.correctionPurpose}</p>
                )}
              </div>

              {/* 촬영 장소 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  촬영 장소
                </label>
                <input
                  type="text"
                  value={location_}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="예: 서울 강남구 웨딩홀"
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
                />
              </div>

              {/* 요청사항 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  특별 요청사항
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="보정 시 특별히 요청하실 사항을 입력해주세요"
                  rows={3}
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 transition resize-none"
                />
              </div>
            </section>

            {/* 섹션 3: 보정 옵션 및 가격 계산 */}
            <section className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 mb-5">💰 보정 옵션 &amp; 가격</h2>

              {/* 보정 옵션 */}
              <div className="mb-6 space-y-3">
                <label
                  className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition ${
                    correctionOption === 'basic'
                      ? 'border-neutral-900 bg-neutral-50'
                      : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="correction"
                    value="basic"
                    checked={correctionOption === 'basic'}
                    onChange={(e) => setCorrectionOption(e.target.value)}
                    className="w-4 h-4 mt-0.5 accent-neutral-900"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-neutral-900">기본 보정</div>
                    <div className="text-sm text-neutral-500 mt-0.5">
                      색감 보정, 밝기/대비 조정 (일반 납기)
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition ${
                    correctionOption === 'urgent'
                      ? 'border-neutral-900 bg-neutral-50'
                      : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="correction"
                    value="urgent"
                    checked={correctionOption === 'urgent'}
                    onChange={(e) => setCorrectionOption(e.target.value)}
                    className="w-4 h-4 mt-0.5 accent-neutral-900"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-neutral-900">
                      긴급 보정{' '}
                      <span className="text-sm font-normal text-neutral-500">
                        (+{priceConfig ? priceConfigService.formatPrice(priceConfig.urgent_option_price) : '50,000원'})
                      </span>
                    </div>
                    <div className="text-sm text-neutral-500 mt-0.5">
                      같은 품질, 빠른 납기 (24시간 내 완료)
                    </div>
                  </div>
                </label>
              </div>

              {/* 가격 상세 */}
              {priceBreakdown ? (
                <div className="bg-neutral-50 p-4 rounded-xl space-y-2.5 text-sm">
                  <div className="flex justify-between text-neutral-600">
                    <span>장당 단가</span>
                    <span>
                      {priceConfig ? priceConfigService.formatPrice(priceConfig.base_unit_price) : '-'} × {selectedPhotoIds.length}장
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">기본 가격</span>
                    <span className="font-medium">{priceConfigService.formatPrice(priceBreakdown.basePrice)}</span>
                  </div>
                  {priceBreakdown.optionCost > 0 && (
                    <div className="flex justify-between text-amber-700">
                      <span>긴급 보정 추가금</span>
                      <span className="font-medium">+{priceConfigService.formatPrice(priceBreakdown.optionCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-500">
                    <span>부가세 (10%)</span>
                    <span>{priceConfigService.formatPrice(priceBreakdown.vatAmount)}</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-3 flex justify-between items-center">
                    <span className="font-semibold text-neutral-900">총 결제 금액</span>
                    <span className="text-xl font-bold text-neutral-900">
                      {priceConfigService.formatPrice(priceBreakdown.totalAmount)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-neutral-100 p-4 rounded-xl text-center text-neutral-400 text-sm">
                  가격 계산 중...
                </div>
              )}
            </section>

            {/* 버튼 */}
            <div className="flex gap-3 pb-4">
              <button
                type="button"
                onClick={() => navigate('/photo-management')}
                className="flex-1 px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-100 transition font-medium"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !priceBreakdown}
                className="flex-1 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    생성 중...
                  </span>
                ) : (
                  '주문 생성'
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
