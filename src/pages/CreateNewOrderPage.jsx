import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';
import { useAuth } from '../contexts/AuthContext';
import ProjectServiceApi from '../services/ProjectServiceApi.js';
import priceConfigService from '../services/PriceConfigService.js';
import analyticsService from '../services/AnalyticsService.js';
import { ORDER_STATUS } from '../constants/OrderStatus.ts';
import { Timestamp, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase.js';

/**
 * CreateNewOrderPage - 새 주문 생성 페이지
 * 
 * 선택된 사진 목록 → 주문 정보 입력 → 가격 계산 → Order 문서 생성
 * 
 * 데이터 흐름:
 * PhotoManagementPage (선택된 사진) 
 *   → CreateNewOrderPage (주문 정보 입력)
 *   → OrderDetailsPage (복제 상태 모니터링)
 *   → PaymentPage (결제)
 */
export const CreateNewOrderPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const projectService = ProjectServiceApi;

  // ─── 상태 관리 ─────────────────────────────────────────
  
  // 선택된 사진 (sessionStorage 또는 Router state에서 복원)
  const [selectedPhotoIds, setSelectedPhotoIds] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  
  // 주문 정보 폼
  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [correctionPurpose, setCorrectionPurpose] = useState('invitation'); // invitation | table | personal | other
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

        // 1. 선택된 사진 복원 (sessionStorage 또는 Router state)
        const storedPhotos = sessionStorage.getItem('selectedPhotoIds');
        if (storedPhotos) {
          const ids = JSON.parse(storedPhotos);
          setSelectedPhotoIds(ids);
          sessionStorage.removeItem('selectedPhotoIds'); // 일회용이므로 제거
        } else {
          // Router state에서 복원 시도
          const state = window.history.state?.usr?.selectedPhotoIds;
          if (state) {
            setSelectedPhotoIds(state);
          }
        }

        // 2. Remote Config 로드
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
  }, [currentUser, navigate]);

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

    setIsSubmitting(true);
    setError(null);

    try {
      // Order 문서 생성
      const orderData = {
        userId: currentUser.uid,
        photoIds: selectedPhotoIds,

        // 주문 정보
        brideName: brideName.trim(),
        groomName: groomName.trim(),
        correctionPurpose,
        notes: notes.trim(),
        correctionOption,

        // 가격 정보 (현재 Remote Config 스냅샷)
        priceSnapshot: priceBreakdown.priceSnapshot,
        photoCount: selectedPhotoIds.length,
        basePrice: priceBreakdown.basePrice,
        optionCost: priceBreakdown.optionCost,
        discount: priceBreakdown.discount,
        vatAmount: priceBreakdown.vatAmount,
        totalAmount: priceBreakdown.totalAmount,

        // 상태
        status: ORDER_STATUS.READY_TO_PAY, // READY_TO_PAY → PAID → CORRECTING → DELIVERY_DONE or CANCELLED

        // 타임아웃
        paymentDeadline: new Timestamp(
          Math.floor(Date.now() / 1000) + 3600, // 1시간 후
          0
        ),

        // 타임스탬프
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Firestore 저장
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      const orderId = docRef.id;

      console.log('[CreateNewOrderPage] 주문 생성 성공:', orderId);

      // 분석 추적
      analyticsService.track('order_created', {
        orderId,
        photoCount: selectedPhotoIds.length,
        totalAmount: priceBreakdown.totalAmount,
        correctionOption,
      });

      // OrderDetailsPage로 이동
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
            <div className="inline-block w-12 h-12 border-4 border-neutral-300 border-t-blue-600 rounded-full animate-spin"></div>
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
      
      <main className="flex-1 pt-[73px] pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* 페이지 제목 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900">새 주문 생성</h1>
            <p className="text-neutral-600 mt-2">주문 정보를 입력하고 가격을 확인하세요</p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateOrder} className="space-y-8">
            {/* 섹션 1: 선택된 사진 정보 */}
            <section className="bg-white p-6 rounded-lg border border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">📸 선택된 사진</h2>
              <div className="flex items-center justify-between">
                <p className="text-neutral-600">
                  총 <span className="font-bold text-blue-600">{selectedPhotoIds.length}장</span>의 사진이 선택되었습니다
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/photo-management')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  변경
                </button>
              </div>
            </section>

            {/* 섹션 2: 주문 정보 */}
            <section className="bg-white p-6 rounded-lg border border-neutral-200 space-y-4">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">📋 주문 정보</h2>

              {/* 신부/신랑 이름 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    신부 이름 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    placeholder="예: 김영희"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.brideName ? 'border-red-300' : 'border-neutral-300'
                    }`}
                  />
                  {validationErrors.brideName && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.brideName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    신랑 이름 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    placeholder="예: 이민준"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.groomName ? 'border-red-300' : 'border-neutral-300'
                    }`}
                  />
                  {validationErrors.groomName && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.groomName}</p>
                  )}
                </div>
              </div>

              {/* 보정 목적 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  보정 목적 <span className="text-red-600">*</span>
                </label>
                <select
                  value={correctionPurpose}
                  onChange={(e) => setCorrectionPurpose(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.shootingType ? 'border-red-300' : 'border-neutral-300'
                  }`}
                >
                  <option value="invitation">모바일 청첩장</option>
                  <option value="table">포토 테이블</option>
                  <option value="personal">소장용</option>
                  <option value="other">기타</option>
                </select>
                {validationErrors.shootingType && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.shootingType}</p>
                )}
              </div>

              {/* 요청사항 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  특별 요청사항
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="예: 실외 촬영을 선호합니다"
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </section>

            {/* 섹션 3: 보정 옵션 및 가격 계산 */}
            <section className="bg-white p-6 rounded-lg border border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">💰 가격 계산</h2>

              {/* 보정 옵션 */}
              <div className="mb-6">
                <p className="text-sm font-medium text-neutral-700 mb-3">보정 옵션</p>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="correction"
                      value="basic"
                      checked={correctionOption === 'basic'}
                      onChange={(e) => setCorrectionOption(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-2 text-neutral-700">기본 보정</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="correction"
                      value="urgent"
                      checked={correctionOption === 'urgent'}
                      onChange={(e) => setCorrectionOption(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-2 text-neutral-700">긴급 보정 (+{priceConfig && priceConfigService.formatPrice(priceConfig.urgent_option_price)})</span>
                  </label>
                </div>
              </div>

              {/* 가격 상세 */}
              {priceBreakdown && (
                <div className="bg-neutral-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">장당 단가</span>
                    <span className="font-medium">{priceConfigService.formatPrice(priceConfig.base_unit_price)} × {selectedPhotoIds.length}장</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">기본 가격</span>
                    <span className="font-medium">{priceConfigService.formatPrice(priceBreakdown.basePrice)}</span>
                  </div>
                  {priceBreakdown.optionCost > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>긴급 보정 추가금</span>
                      <span className="font-medium">+{priceConfigService.formatPrice(priceBreakdown.optionCost)}</span>
                    </div>
                  )}
                  <div className="border-t border-neutral-200 pt-2 mt-2 flex justify-between">
                    <span className="text-neutral-600">부가세 (10%)</span>
                    <span className="font-medium">{priceConfigService.formatPrice(priceBreakdown.vatAmount)}</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-2 flex justify-between bg-blue-50 p-2 rounded">
                    <span className="font-semibold text-neutral-900">총액</span>
                    <span className="font-bold text-lg text-blue-600">{priceConfigService.formatPrice(priceBreakdown.totalAmount)}</span>
                  </div>
                </div>
              )}
            </section>

            {/* 버튼 */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/photo-management')}
                className="flex-1 px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition font-medium"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !priceBreakdown}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                {isSubmitting ? '생성 중...' : '주문 생성'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <PrismFooter />
    </div>
  );
};
