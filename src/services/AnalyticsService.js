/**
 * AnalyticsService - 통합 분석 추적 서비스
 * Google Analytics 4, Smartlook, Segment 연동
 */

export class AnalyticsService {
  constructor() {
    this.initialized = false;
  }

  /**
   * 분석 서비스 초기화
   * GA4, Smartlook, Segment 모두 초기화
   */
  init() {
    if (this.initialized) return;

    // 1️⃣ Smartlook 초기화
    this.initSmartlook();

    // 2️⃣ Google Analytics 4 초기화
    this.initGA4();

    // 3️⃣ Segment 초기화 (향후 사용)
    // this.initSegment();

    this.initialized = true;
    console.log('[Analytics] 분석 서비스 초기화 완료');
  }

  /**
   * Smartlook 초기화
   * 세션 녹화, 히트맵, 클릭플로우 추적
   */
  initSmartlook() {
    const SMARTLOOK_KEY = import.meta.env.VITE_SMARTLOOK_KEY;
    
    if (!SMARTLOOK_KEY) {
      console.warn('[Smartlook] VITE_SMARTLOOK_KEY 환경변수가 설정되지 않았습니다');
      return;
    }

    // Smartlook 스크립트 동적 로드
    if (window.smartlook) {
      window.smartlook('init', SMARTLOOK_KEY, {
        recordConsole: true,
        recordNetwork: true,
      });
      console.log('[Smartlook] 초기화 완료');
    } else {
      // 스크립트가 아직 로드되지 않았으면 나중에 재시도
      const script = document.createElement('script');
      script.src = 'https://www.smartlook.com/records/recorder.js';
      script.onload = () => {
        if (window.smartlook) {
          window.smartlook('init', SMARTLOOK_KEY, {
            recordConsole: true,
            recordNetwork: true,
          });
          console.log('[Smartlook] 스크립트 로드 후 초기화 완료');
        }
      };
      document.head.appendChild(script);
    }
  }

  /**
   * Google Analytics 4 초기화
   */
  initGA4() {
    const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;
    
    if (!GA4_MEASUREMENT_ID) {
      console.warn('[GA4] VITE_GA4_MEASUREMENT_ID 환경변수가 설정되지 않았습니다');
      return;
    }

    // GA4 스크립트 동적 로드
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA4_MEASUREMENT_ID, {
      anonymize_ip: true,
    });

    console.log('[GA4] 초기화 완료');
  }

  /**
   * Segment 초기화 (향후 사용)
   */
  initSegment() {
    const SEGMENT_WRITE_KEY = import.meta.env.VITE_SEGMENT_WRITE_KEY;
    
    if (!SEGMENT_WRITE_KEY) {
      console.warn('[Segment] VITE_SEGMENT_WRITE_KEY 환경변수가 설정되지 않았습니다');
      return;
    }

    // Segment 스크립트 동적 로드
    const script = document.createElement('script');
    script.innerHTML = `
      !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(e,t){var n=document.createElement("script");n.type="text/javascript";n.async=!0;n.src="https://cdn.segment.com/analytics.js/v1/"+e+"/analytics.min.js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(n,a);analytics._loadOptions=t};analytics._writeKey="${SEGMENT_WRITE_KEY}";analytics.SNIPPET_VERSION="4.13.1";analytics.load("${SEGMENT_WRITE_KEY}");analytics.page();}}();
    `;
    document.head.appendChild(script);

    console.log('[Segment] 초기화 완료');
  }

  /**
   * 사용자 식별 (로그인 후)
   * @param {string} userId - 사용자 ID
   * @param {object} userProps - 사용자 속성 (이메일, 이름 등)
   */
  identifyUser(userId, userProps = {}) {
    // GA4
    if (window.gtag) {
      window.gtag('config', { 'user_id': userId });
    }

    // Smartlook
    if (window.smartlook) {
      window.smartlook('identify', userId, userProps);
    }

    // Segment
    if (window.analytics) {
      window.analytics.identify(userId, userProps);
    }

    console.log(`[Analytics] 사용자 식별: ${userId}`);
  }

  /**
   * 이벤트 추적 (핵심 액션)
   * @param {string} eventName - 이벤트명
   * @param {object} properties - 이벤트 속성
   */
  track(eventName, properties = {}) {
    // GA4
    if (window.gtag) {
      window.gtag('event', eventName, properties);
    }

    // Smartlook
    if (window.smartlook) {
      window.smartlook('event', eventName, properties);
    }

    // Segment
    if (window.analytics) {
      window.analytics.track(eventName, properties);
    }

    console.log(`[Analytics] 이벤트 추적: ${eventName}`, properties);
  }

  /**
   * 페이지뷰 추적
   * @param {string} pageName - 페이지명
   * @param {object} properties - 추가 속성
   */
  pageview(pageName, properties = {}) {
    // GA4
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        'page_title': pageName,
        ...properties,
      });
    }

    // Smartlook
    if (window.smartlook) {
      window.smartlook('event', 'page_view', { page: pageName });
    }

    // Segment
    if (window.analytics) {
      window.analytics.page(pageName, properties);
    }

    console.log(`[Analytics] 페이지뷰: ${pageName}`);
  }

  /**
   * UTM 파라미터 추출 & 저장
   * @returns {object} UTM 파라미터 객체
   */
  captureUTMParams() {
    const params = new URLSearchParams(window.location.search);
    const utm = {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_content: params.get('utm_content'),
      utm_term: params.get('utm_term'),
    };

    // null 값 제거
    const filteredUTM = Object.fromEntries(
      Object.entries(utm).filter(([, v]) => v !== null)
    );

    if (Object.keys(filteredUTM).length > 0) {
      localStorage.setItem('utm_params', JSON.stringify(filteredUTM));
      console.log('[Analytics] UTM 파라미터 저장:', filteredUTM);
    }

    return filteredUTM;
  }

  /**
   * 저장된 UTM 파라미터 조회
   * @returns {object} UTM 파라미터 객체
   */
  getUTMParams() {
    const utm = localStorage.getItem('utm_params');
    return utm ? JSON.parse(utm) : {};
  }

  /**
   * 회원가입 이벤트
   * @param {string} method - 가입 방법 (email, google, naver 등)
   * @param {string} source - 유입 출처
   */
  trackSignUp(method, source = null) {
    this.track('sign_up', {
      method,
      source: source || this.getUTMParams().utm_source || 'direct',
      ...this.getUTMParams(),
    });
  }

  /**
   * 로그인 이벤트
   * @param {string} method - 로그인 방법 (email, google, naver 등)
   */
  trackLogin(method) {
    this.track('login', {
      method,
      ...this.getUTMParams(),
    });
  }

  /**
   * 이메일 인증 완료 이벤트
   */
  trackEmailVerified() {
    this.track('email_verified', {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 주문 생성 이벤트
   * @param {string} orderId - 주문 ID
   * @param {number} amount - 주문 금액
   * @param {array} items - 주문 항목
   */
  trackOrderCreated(orderId, amount, items = []) {
    this.track('order_created', {
      order_id: orderId,
      value: amount,
      currency: 'KRW',
      items: items.length,
      ...this.getUTMParams(),
    });
  }

  /**
   * 결제 완료 이벤트
   * @param {string} orderId - 주문 ID
   * @param {number} amount - 결제 금액
   * @param {array} items - 결제 항목
   */
  trackPurchase(orderId, amount, items = []) {
    this.track('purchase', {
      order_id: orderId,
      value: amount,
      currency: 'KRW',
      items: items.length,
      ...this.getUTMParams(),
    });
  }

  /**
   * 사진 업로드 이벤트
   * @param {number} photoCount - 업로드한 사진 개수
   */
  trackPhotoUpload(photoCount) {
    this.track('photo_uploaded', {
      photo_count: photoCount,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 본보정 시작 이벤트
   */
  trackMainCorrectionStarted() {
    this.track('main_correction_started', {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 수정 요청 이벤트
   */
  trackRevisionRequested() {
    this.track('revision_requested', {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 다운로드 완료 이벤트
   */
  trackDownloadCompleted() {
    this.track('download_completed', {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 기능 사용 이벤트
   * @param {string} featureName - 기능명
   * @param {object} metadata - 추가 메타데이터
   */
  trackFeatureUsage(featureName, metadata = {}) {
    this.track(`feature_used_${featureName}`, {
      feature: featureName,
      ...metadata,
    });
  }

  /**
   * 오류 추적
   * @param {string} errorName - 오류명
   * @param {string} message - 오류 메시지
   * @param {string} severity - 심각도 (low, medium, high)
   */
  trackError(errorName, message, severity = 'medium') {
    this.track('error_occurred', {
      error_name: errorName,
      error_message: message,
      severity,
      timestamp: new Date().toISOString(),
    });
  }
}

// 싱글톤 인스턴스
export const analyticsService = new AnalyticsService();

// 기본 export (default)
export default analyticsService;
