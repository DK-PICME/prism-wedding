import { PaymentService } from './PaymentService';

/**
 * PaymentServiceMock - 더미 결제 서비스 (테스트/개발용)
 *
 * 실제 결제 게이트웨이 호출 없이 항상 성공하는 더미 구현
 * 나중에 실제 구현체(포트원, 토스페이먼츠 등)로 교체 가능
 */
export class PaymentServiceMock extends PaymentService {
  constructor() {
    super();
    // 더미 거래 저장소 (메모리)
    this.transactions = new Map();
    this.nextTransactionId = 1001;
  }

  /**
   * 더미 거래 ID 생성
   * @private
   */
  _generateTransactionId() {
    const id = `TXN_${this.nextTransactionId}`;
    this.nextTransactionId++;
    return id;
  }

  /**
   * 결제 처리 (더미)
   * 항상 성공을 반환
   */
  async processPayment(paymentInfo) {
    try {
      // 입력 검증
      if (!paymentInfo.orderId || !paymentInfo.amount) {
        return {
          success: false,
          transactionId: null,
          message: '필수 정보가 부족합니다',
          errorCode: 'INVALID_INPUT',
          errorMessage: 'orderId와 amount는 필수입니다',
        };
      }

      // 결제 방법별 검증
      const validation = await this.validatePaymentMethod({
        method: paymentInfo.method,
        cardInfo: paymentInfo.cardInfo,
        bankInfo: paymentInfo.bankInfo,
        mobileInfo: paymentInfo.mobileInfo,
      });

      if (!validation.valid) {
        return {
          success: false,
          transactionId: null,
          message: '결제 정보가 올바르지 않습니다',
          errorCode: 'INVALID_PAYMENT_METHOD',
          errorMessage: validation.errors.join(', '),
        };
      }

      // 거래 ID 생성
      const transactionId = this._generateTransactionId();

      // 더미 거래 데이터 저장
      const transaction = {
        transactionId,
        orderId: paymentInfo.orderId,
        userId: paymentInfo.userId,
        amount: paymentInfo.amount,
        method: paymentInfo.method,
        status: 'completed', // 항상 성공
        processedAt: new Date().toISOString(),
        receiptId: `RCP_${transactionId}`,
      };

      this.transactions.set(transactionId, transaction);

      console.log('[PaymentServiceMock] Payment processed:', transaction);

      return {
        success: true,
        transactionId,
        message: '결제가 성공적으로 완료되었습니다',
      };
    } catch (error) {
      console.error('[PaymentServiceMock] Payment processing error:', error);
      return {
        success: false,
        transactionId: null,
        message: '결제 처리 중 오류가 발생했습니다',
        errorCode: 'PAYMENT_ERROR',
        errorMessage: error.message,
      };
    }
  }

  /**
   * 결제 상태 조회 (더미)
   */
  async getPaymentStatus(transactionId) {
    const transaction = this.transactions.get(transactionId);

    if (!transaction) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    return {
      transactionId: transaction.transactionId,
      orderId: transaction.orderId,
      status: transaction.status,
      amount: transaction.amount,
      method: transaction.method,
      processedAt: transaction.processedAt,
      message: '거래 조회 완료',
    };
  }

  /**
   * 결제 취소 (더미)
   */
  async cancelPayment(transactionId, reason = '') {
    const transaction = this.transactions.get(transactionId);

    if (!transaction) {
      return {
        success: false,
        message: `Transaction not found: ${transactionId}`,
      };
    }

    // 환불 거래 생성
    const refundTransactionId = `RFD_${transactionId}`;
    const refundTransaction = {
      transactionId: refundTransactionId,
      originalTransactionId: transactionId,
      orderId: transaction.orderId,
      userId: transaction.userId,
      amount: transaction.amount,
      status: 'refunded',
      reason,
      processedAt: new Date().toISOString(),
    };

    this.transactions.set(refundTransactionId, refundTransaction);

    // 원래 거래 상태 업데이트
    transaction.status = 'cancelled';
    transaction.refundTransactionId = refundTransactionId;

    console.log('[PaymentServiceMock] Payment cancelled:', refundTransaction);

    return {
      success: true,
      originalTransactionId: transactionId,
      refundTransactionId,
      refundAmount: transaction.amount,
      message: '결제가 취소되었습니다',
    };
  }

  /**
   * 결제 방법 유효성 검사 (더미)
   */
  async validatePaymentMethod(paymentMethod) {
    const errors = [];

    // 결제 방법 검증
    if (!['card', 'bank', 'mobile'].includes(paymentMethod.method)) {
      errors.push('유효하지 않은 결제 방법입니다');
      return { valid: false, errors };
    }

    // 신용카드
    if (paymentMethod.method === 'card') {
      const card = paymentMethod.cardInfo || {};

      if (!card.cardNumber || card.cardNumber.length < 16) {
        errors.push('유효하지 않은 카드번호입니다');
      }
      if (!card.expiryDate || !card.expiryDate.match(/^\d{2}\/\d{2}$/)) {
        errors.push('유효기간 형식이 올바르지 않습니다 (MM/YY)');
      }
      if (!card.cvc || card.cvc.length < 3) {
        errors.push('유효하지 않은 CVC입니다');
      }
      if (!card.cardholderName) {
        errors.push('카드주인명을 입력해주세요');
      }
    }

    // 계좌이체
    if (paymentMethod.method === 'bank') {
      const bank = paymentMethod.bankInfo || {};

      if (!bank.bankCode) {
        errors.push('은행을 선택해주세요');
      }
      if (!bank.accountNumber) {
        errors.push('계좌번호를 입력해주세요');
      }
    }

    // 휴대폰
    if (paymentMethod.method === 'mobile') {
      const mobile = paymentMethod.mobileInfo || {};

      if (!mobile.phoneNumber || !mobile.phoneNumber.match(/^\d{10,11}$/)) {
        errors.push('유효한 휴대폰 번호를 입력해주세요');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 결제 수수료 계산 (더미)
   * 실제 구현에서는 결제 방법/금액별로 다른 수수료 적용
   */
  async calculateFee(amount, method) {
    // 더미: 모든 결제 방법에 2% 수수료 적용
    const feeRate = 0.02;
    const fee = Math.ceil(amount * feeRate);
    const total = amount + fee;

    return {
      amount,
      fee,
      total,
    };
  }

  /**
   * 영수증 생성 (더미)
   */
  async generateReceipt(transactionId) {
    const transaction = this.transactions.get(transactionId);

    if (!transaction) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    return {
      receiptId: transaction.receiptId,
      orderId: transaction.orderId,
      amount: transaction.amount,
      method: transaction.method,
      processedAt: transaction.processedAt,
      receiptUrl: `https://example.com/receipts/${transaction.receiptId}.pdf`,
    };
  }

  /**
   * 웹훅 처리 (더미)
   * 실제로는 결제 게이트웨이에서 호출하지만, 더미에서는 테스트용
   */
  async handleWebhook(webhookData) {
    console.log('[PaymentServiceMock] Webhook received:', webhookData);

    // 더미: 항상 성공
    return { acknowledged: true };
  }

  /**
   * 테스트 헬퍼: 모든 거래 조회
   * @private (테스트용)
   */
  _getAllTransactions() {
    return Array.from(this.transactions.values());
  }

  /**
   * 테스트 헬퍼: 거래 초기화
   * @private (테스트용)
   */
  _resetTransactions() {
    this.transactions.clear();
    this.nextTransactionId = 1001;
  }
}
