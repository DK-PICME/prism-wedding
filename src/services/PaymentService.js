/**
 * PaymentService - 결제 처리 인터페이스
 *
 * 결제 관련 모든 기능을 정의하는 추상 클래스
 * 실제 구현체는 PaymentServiceImpl, PaymentServiceMock 등으로 구현
 */
export class PaymentService {
  /**
   * 결제 처리 (실제 결제 게이트웨이 호출)
   *
   * @param {Object} paymentInfo
   *   - orderId: string (Firestore Order doc ID)
   *   - userId: string (현재 사용자 ID)
   *   - amount: number (결제 금액, 원 단위)
   *   - method: string ('card' | 'bank' | 'mobile')
   *   - cardInfo?: Object (method === 'card'일 때만)
   *       - cardNumber: string (16자리, 마스킹됨)
   *       - expiryDate: string (MM/YY)
   *       - cvc: string (3-4자리)
   *       - cardholderName: string
   *   - bankInfo?: Object (method === 'bank'일 때만)
   *       - bankCode: string
   *       - accountNumber: string
   *   - mobileInfo?: Object (method === 'mobile'일 때만)
   *       - phoneNumber: string
   *
   * @returns {Promise<Object>}
   *   {
   *     success: boolean,
   *     transactionId: string,  // 거래 고유 ID (성공 시만)
   *     message: string,        // 성공/실패 메시지
   *     errorCode?: string,     // 실패 시 에러 코드
   *     errorMessage?: string   // 실패 시 상세 메시지
   *   }
   *
   * @throws {Error}
   */
  async processPayment(paymentInfo) {
    throw new Error('processPayment must be implemented');
  }

  /**
   * 결제 상태 조회
   *
   * @param {string} transactionId - 거래 고유 ID
   *
   * @returns {Promise<Object>}
   *   {
   *     transactionId: string,
   *     orderId: string,
   *     status: 'pending' | 'completed' | 'failed' | 'cancelled',
   *     amount: number,
   *     method: string,
   *     processedAt: string (ISO 8601),
   *     message: string
   *   }
   */
  async getPaymentStatus(transactionId) {
    throw new Error('getPaymentStatus must be implemented');
  }

  /**
   * 결제 취소 (환불)
   *
   * @param {string} transactionId - 거래 고유 ID
   * @param {string} reason - 취소 사유 (선택)
   *
   * @returns {Promise<Object>}
   *   {
   *     success: boolean,
   *     originalTransactionId: string,
   *     refundTransactionId: string,
   *     refundAmount: number,
   *     message: string
   *   }
   */
  async cancelPayment(transactionId, reason = '') {
    throw new Error('cancelPayment must be implemented');
  }

  /**
   * 결제 방법 유효성 검사
   *
   * @param {Object} paymentMethod
   *   - method: string
   *   - cardInfo?: Object (신용카드 정보)
   *   - bankInfo?: Object (계좌 정보)
   *   - mobileInfo?: Object (휴대폰 정보)
   *
   * @returns {Promise<Object>}
   *   {
   *     valid: boolean,
   *     errors: Array<string> (유효하지 않은 필드 목록)
   *   }
   */
  async validatePaymentMethod(paymentMethod) {
    throw new Error('validatePaymentMethod must be implemented');
  }

  /**
   * 결제 수수료 계산
   *
   * @param {number} amount - 결제 금액
   * @param {string} method - 결제 방법
   *
   * @returns {Promise<Object>}
   *   {
   *     amount: number,       // 원래 금액
   *     fee: number,         // 수수료
   *     total: number        // 최종 금액
   *   }
   */
  async calculateFee(amount, method) {
    throw new Error('calculateFee must be implemented');
  }

  /**
   * 영수증 생성
   *
   * @param {string} transactionId - 거래 고유 ID
   *
   * @returns {Promise<Object>}
   *   {
   *     receiptId: string,
   *     orderId: string,
   *     amount: number,
   *     method: string,
   *     processedAt: string,
   *     receiptUrl: string (PDF URL)
   *   }
   */
  async generateReceipt(transactionId) {
    throw new Error('generateReceipt must be implemented');
  }

  /**
   * 결제 웹훅 핸들러 (결제 게이트웨이에서 호출)
   * 이 메서드는 백엔드 Cloud Function에서 호출되어야 함
   *
   * @param {Object} webhookData
   *   - transactionId: string
   *   - orderId: string
   *   - status: string
   *   - amount: number
   *   - timestamp: string
   *
   * @returns {Promise<Object>}
   *   { acknowledged: boolean }
   */
  async handleWebhook(webhookData) {
    throw new Error('handleWebhook must be implemented');
  }
}
