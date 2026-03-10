/**
 * PriceConfigService - 가격 설정 및 계산 서비스
 * 
 * Firebase Remote Config에서 가격 정보를 로드하고,
 * 주문 가격 계산을 담당합니다.
 * 
 * Remote Config 패치 실패 시 로컬 기본값 사용.
 */

import { getRemoteConfig, fetchAndActivate, getValue } from 'firebase/remote-config';
import app from '../config/firebase.js';

// ── 로컬 기본값 (Remote Config 패치 실패 시 사용) ──
export const DEFAULT_PRICE_CONFIG = {
  base_unit_price: 100000,          // 장당 100,000원
  urgent_option_price: 50000,       // 긴급 +50,000원
  additional_revision_price: 30000, // 추가 수정 +30,000원
  vat_rate: 0.1,                    // VAT 10%
};

// ── Remote Config 키 ──
export const REMOTE_CONFIG_KEYS = {
  BASE_UNIT_PRICE: 'base_unit_price',
  URGENT_OPTION_PRICE: 'urgent_option_price',
  ADDITIONAL_REVISION_PRICE: 'additional_revision_price',
  VAT_RATE: 'vat_rate',
};

class PriceConfigService {
  constructor() {
    this.remoteConfig = null;
    this.currentConfig = DEFAULT_PRICE_CONFIG;
    this.initialized = false;
  }

  /**
   * Remote Config 초기화 및 로드
   */
  async initialize() {
    if (this.initialized) return this.currentConfig;

    try {
      this.remoteConfig = getRemoteConfig(app);
      
      // 개발 환경에서는 캐시 설정을 짧게
      this.remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1시간
      
      // 기본값 설정
      this.remoteConfig.defaultConfig = DEFAULT_PRICE_CONFIG;

      // Remote Config 패치 및 활성화
      await fetchAndActivate(this.remoteConfig);
      
      // 값 로드
      this.currentConfig = {
        base_unit_price: getValue(this.remoteConfig, REMOTE_CONFIG_KEYS.BASE_UNIT_PRICE).asNumber(),
        urgent_option_price: getValue(this.remoteConfig, REMOTE_CONFIG_KEYS.URGENT_OPTION_PRICE).asNumber(),
        additional_revision_price: getValue(this.remoteConfig, REMOTE_CONFIG_KEYS.ADDITIONAL_REVISION_PRICE).asNumber(),
        vat_rate: getValue(this.remoteConfig, REMOTE_CONFIG_KEYS.VAT_RATE).asNumber(),
        _version: getValue(this.remoteConfig, '_version').asString(),
      };

      console.log('[PriceConfig] Remote Config 로드 성공:', this.currentConfig);
      this.initialized = true;
      return this.currentConfig;
    } catch (error) {
      console.warn('[PriceConfig] Remote Config 패치 실패, 로컬 기본값 사용:', error);
      this.currentConfig = DEFAULT_PRICE_CONFIG;
      this.initialized = true;
      return this.currentConfig;
    }
  }

  /**
   * 현재 가격 설정 조회
   */
  getConfig() {
    return this.currentConfig;
  }

  /**
   * 주문 가격 계산
   * 
   * @param {number} photoCount - 사진 개수
   * @param {string} correctionOption - 보정 옵션 ('basic' | 'urgent')
   * @returns {Object} 가격 계산 결과
   *   {
   *     basePrice: number,
   *     optionCost: number,
   *     discount: number,
   *     vatAmount: number,
   *     totalAmount: number,
   *     priceSnapshot: {
   *       remoteConfigVersion: string,
   *       baseUnitPrice: number,
   *       urgentOptionPrice: number,
   *       additionalRevisionPrice: number,
   *       vatRate: number,
   *     }
   *   }
   */
  calculateOrderPrice(photoCount, correctionOption = 'basic') {
    const config = this.currentConfig ?? DEFAULT_PRICE_CONFIG;

    // 기본 가격 계산
    const basePrice = photoCount * config.base_unit_price;
    
    // 보정 옵션 비용
    const optionCost = correctionOption === 'urgent' ? config.urgent_option_price : 0;
    
    // 소계
    const subtotal = basePrice + optionCost;
    
    // 부가세
    const vatAmount = Math.round(subtotal * config.vat_rate);
    
    // 총액
    const totalAmount = subtotal + vatAmount;

    return {
      basePrice,
      optionCost,
      discount: 0, // 향후 프로모션 코드 지원 시 확장
      vatAmount,
      totalAmount,
      
      // 주문 문서에 저장될 스냅샷 (과거 주문 가격 보존)
      priceSnapshot: {
        remoteConfigVersion: config._version ?? 'local-default',
        baseUnitPrice: config.base_unit_price,
        urgentOptionPrice: config.urgent_option_price,
        additionalRevisionPrice: config.additional_revision_price,
        vatRate: config.vat_rate,
      },
    };
  }

  /**
   * 가격 정보 포맷팅 (UI 표시용)
   */
  formatPrice(amount) {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}

// 싱글톤 인스턴스
export const priceConfigService = new PriceConfigService();

export default priceConfigService;
