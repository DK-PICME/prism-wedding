/**
 * 주문 상태 정의 (통일된 상수명 & 상태코드)
 * Phase 2부터 Phase 3 구조까지 포함
 * 
 * 확장성: 액자, 앨범 등 제작 발송 단계 추가 가능
 */

export const ORDER_STATUS = {
  // 결제 단계
  READY_TO_PAY: 'READY_TO_PAY',            // 10: 결제 대기 (초기 상태)
  WAITING_BANK_INPUT: 'WAITING_BANK_INPUT', // 25: 가상계좌 입금 대기
  PAID: 'PAID',                             // 30: 결제 완료

  // 작업 단계
  CORRECTING: 'CORRECTING',                 // 40: 사진 보정 중
  PRINTING: 'PRINTING',                     // 50: 인화 중
  BEFORE_DELIVERY: 'BEFORE_DELIVERY',       // 60: 배송 준비 중

  // 배송 단계
  IN_DELIVERY: 'IN_DELIVERY',               // 70: 배송 중
  DELIVERY_DONE: 'DELIVERY_DONE',           // 100: 배송 완료

  // 취소
  CANCELLED: 'CANCELLED',                   // 20: 주문 취소
} as const;

export const ORDER_STATUS_CODE = {
  READY_TO_PAY: 10,
  WAITING_BANK_INPUT: 25,
  PAID: 30,
  CORRECTING: 40,
  PRINTING: 50,
  BEFORE_DELIVERY: 60,
  IN_DELIVERY: 70,
  DELIVERY_DONE: 100,
  CANCELLED: 20,
} as const;

export const ORDER_STATUS_LABEL = {
  READY_TO_PAY: '주문생성',
  WAITING_BANK_INPUT: '입금대기',
  PAID: '결제완료',
  CORRECTING: '보정중',
  PRINTING: '인화중',
  BEFORE_DELIVERY: '배송대기',
  IN_DELIVERY: '배송중',
  DELIVERY_DONE: '배송완료',
  CANCELLED: '주문취소',
} as const;

export const ORDER_STATUS_COLOR = {
  READY_TO_PAY: 'indigo',      // 인디고
  WAITING_BANK_INPUT: 'cyan',  // 시안
  PAID: 'teal',                // 틸
  CORRECTING: 'amber',         // 앰버
  PRINTING: 'purple',          // 보라
  BEFORE_DELIVERY: 'orange',   // 오렌지
  IN_DELIVERY: 'blue',         // 파랑
  DELIVERY_DONE: 'green',      // 초록
  CANCELLED: 'red',            // 빨강
} as const;

/**
 * 상태별 허용 액션
 * Phase 2: PENDING_PAYMENT, PAID, CORRECTING(=IN_PROGRESS), COMPLETED, CANCELLED
 * Phase 3+: 모든 상태 활성화
 */
export const ORDER_STATUS_ACTIONS = {
  READY_TO_PAY: { cancel: false, delete: false, changeAddress: false },
  WAITING_BANK_INPUT: { cancel: true, delete: false, changeAddress: true },
  PAID: { cancel: true, delete: false, changeAddress: true },
  CORRECTING: { cancel: false, delete: false, changeAddress: false },
  PRINTING: { cancel: false, delete: false, changeAddress: false },
  BEFORE_DELIVERY: { cancel: false, delete: false, changeAddress: false },
  IN_DELIVERY: { cancel: false, delete: false, changeAddress: false },
  DELIVERY_DONE: { cancel: false, delete: true, changeAddress: false },
  CANCELLED: { cancel: false, delete: true, changeAddress: false },
} as const;

/**
 * 상태 흐름 (전이 가능한 다음 상태들)
 */
export const ORDER_STATUS_TRANSITIONS = {
  READY_TO_PAY: ['PAID', 'CANCELLED'],
  WAITING_BANK_INPUT: ['PAID', 'CANCELLED'],
  PAID: ['CORRECTING', 'CANCELLED'],
  CORRECTING: ['PRINTING'],
  PRINTING: ['BEFORE_DELIVERY'],
  BEFORE_DELIVERY: ['IN_DELIVERY'],
  IN_DELIVERY: ['DELIVERY_DONE'],
  DELIVERY_DONE: [],
  CANCELLED: [],
} as const;

/**
 * Phase 2 활성 상태 (현재 구현)
 * Phase 3에서 CORRECTING, PRINTING, BEFORE_DELIVERY, IN_DELIVERY 추가
 */
export const PHASE_2_STATUSES = [
  'READY_TO_PAY',
  'PAID',
  'CORRECTING',
  'DELIVERY_DONE',
  'CANCELLED',
] as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
export type Phase2OrderStatus = typeof PHASE_2_STATUSES[number];
