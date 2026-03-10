/**
 * ProjectService - Firebase와의 통신 인터페이스
 * 
 * 이 인터페이스는 Firestore와의 데이터 통신을 정의합니다.
 * Phase 2: Project + Photo 관리
 */

export class ProjectService {
  // ─── Project CRUD (Phase 2) ─────────────────────────────────────────

  /**
   * 사용자의 프로젝트 목록 조회 (실시간 리스너)
   * @param {string} userId - 사용자 ID
   * @param {Function} callback - 데이터 변경 시 호출되는 콜백
   * @returns {Function} 구독 해제 함수
   */
  onProjectsChanged(userId, callback) {
    throw new Error('onProjectsChanged method must be implemented');
  }

  /**
   * 프로젝트 생성
   * @param {string} userId - 사용자 ID
   * @param {Object} projectData
   *   - name: string (프로젝트명, required)
   *   - description: string (설명, optional)
   * @returns {Promise<Object>}
   *   { success: boolean, projectId: string, message: string }
   */
  async createProject(userId, projectData) {
    throw new Error('createProject must be implemented');
  }

  /**
   * 프로젝트 조회
   * @param {string} projectId - 프로젝트 ID
   * @param {string} userId - 사용자 ID (권한 검증용)
   * @returns {Promise<Object>}
   *   { id, userId, name, description, photoCount, totalSize, createdAt, updatedAt }
   */
  async getProject(projectId, userId) {
    throw new Error('getProject must be implemented');
  }

  /**
   * 프로젝트 수정
   * @param {string} projectId - 프로젝트 ID
   * @param {string} userId - 사용자 ID (권한 검증용)
   * @param {Object} updates - 수정할 필드 (name, description)
   * @returns {Promise<Object>}
   *   { success: boolean, message: string }
   */
  async updateProject(projectId, userId, updates) {
    throw new Error('updateProject must be implemented');
  }

  /**
   * 프로젝트 삭제 (하위 Photo도 삭제 - Cascade)
   * @param {string} projectId - 프로젝트 ID
   * @param {string} userId - 사용자 ID (권한 검증용)
   * @returns {Promise<Object>}
   *   { success: boolean, message: string, deletedPhotoCount: number }
   */
  async deleteProject(projectId, userId) {
    throw new Error('deleteProject must be implemented');
  }

  /**
   * 프로젝트 통계 업데이트 (캐시)
   * @param {string} projectId - 프로젝트 ID
   * @param {Object} stats
   *   - photoCount: number
   *   - totalSize: number
   * @returns {Promise<Object>}
   *   { success: boolean, message: string }
   */
  async updateProjectStats(projectId, stats) {
    throw new Error('updateProjectStats must be implemented');
  }

  // ─── Photo 관리 (Phase 2) ─────────────────────────────────────────

  /**
   * 프로젝트의 사진 목록 조회 (실시간 리스너)
   * @param {string} projectId - 프로젝트 ID
   * @param {Function} callback - 데이터 변경 시 호출되는 콜백
   * @returns {Function} 구독 해제 함수
   */
  onPhotosChanged(projectId, userId, callback) {
    throw new Error('onPhotosChanged method must be implemented');
  }

  /**
   * 테스트 데이터 생성 (개발용)
   * @param {Object} overrides - 기본값을 덮어쓸 데이터
   * @returns {ProjectData}
   */
  generateMockData(overrides = {}) {
    throw new Error('generateMockData method must be implemented');
  }

  // ─── 주문 관리 (Phase 2) ─────────────────────────────────────────

  /**
   * 사용자의 주문 목록 조회
   *
   * @param {string} userId - 현재 사용자 ID
   * @param {Object} options
   *   - status?: 'waiting' | 'in-progress' | 'completed' (상태 필터)
   *   - startDate?: Date (시작 날짜)
   *   - endDate?: Date (종료 날짜)
   *   - searchQuery?: string (주문명/프로젝트ID 검색)
   *   - page?: number (페이지 번호, 기본값 1)
   *   - limit?: number (페이지당 개수, 기본값 10)
   *
   * @returns {Promise<Object>}
   *   {
   *     orders: Array<Order>,
   *     total: number,
   *     page: number,
   *     limit: number,
   *     hasMore: boolean
   *   }
   */
  async getOrders(userId, options = {}) {
    throw new Error('getOrders must be implemented');
  }

  /**
   * 개별 주문 조회
   *
   * @param {string} orderId - 주문 ID
   * @param {string} userId - 현재 사용자 ID (권한 검증용)
   *
   * @returns {Promise<Order>}
   *   {
   *     id: string,
   *     userId: string,
   *     name: string,
   *     projectId: string,
   *     status: string,
   *     photos: number,
   *     progress: number,
   *     createdAt: Timestamp,
   *     date: string,
   *     paymentStatus: string,
   *     amount: number,
   *     basePrice: number,
   *     additionalCost: number,
   *     weddingType: string,
   *     remarks: string,
   *     timeline: Array
   *   }
   */
  async getOrder(orderId, userId) {
    throw new Error('getOrder must be implemented');
  }

  /**
   * 새 주문 생성
   *
   * @param {string} userId - 현재 사용자 ID
   * @param {Object} orderData
   *   - name: string (주문명)
   *   - weddingType: string (웨딩 종류)
   *   - date: string (촬영 날짜)
   *   - estimatedPhotos: number (예상 사진 수)
   *   - remarks: string (특별 요청사항)
   *   - basePrice: number (장당 기본 가격)
   *   - additionalCost: number (추가 비용)
   *
   * @returns {Promise<Object>}
   *   {
   *     success: boolean,
   *     orderId: string,
   *     projectId: string,
   *     message: string
   *   }
   */
  async createOrder(userId, orderData) {
    throw new Error('createOrder must be implemented');
  }

  /**
   * 주문 수정
   *
   * @param {string} orderId - 주문 ID
   * @param {string} userId - 현재 사용자 ID (권한 검증용)
   * @param {Object} updates - 수정할 필드 (부분 업데이트)
   *
   * @returns {Promise<Object>}
   *   {
   *     success: boolean,
   *     message: string
   *   }
   */
  async updateOrder(orderId, userId, updates) {
    throw new Error('updateOrder must be implemented');
  }

  /**
   * 주문 삭제
   *
   * @param {string} orderId - 주문 ID
   * @param {string} userId - 현재 사용자 ID (권한 검증용)
   *
   * @returns {Promise<Object>}
   *   {
   *     success: boolean,
   *     message: string
   *   }
   */
  async deleteOrder(orderId, userId) {
    throw new Error('deleteOrder must be implemented');
  }

  /**
   * 주문 상태 업데이트
   *
   * @param {string} orderId - 주문 ID
   * @param {string} status - 새로운 상태 ('waiting' | 'in-progress' | 'completed')
   * @param {Object} options
   *   - progress?: number (진행률, 0-100)
   *   - updatedBy?: string (업데이트한 사용자 ID)
   *
   * @returns {Promise<Object>}
   *   { success: boolean, message: string }
   */
  async updateOrderStatus(orderId, status, options = {}) {
    throw new Error('updateOrderStatus must be implemented');
  }

  /**
   * 결제 상태 업데이트
   *
   * @param {string} orderId - 주문 ID
   * @param {string} paymentStatus - 결제 상태 ('waiting' | 'completed' | 'failed' | 'refunded')
   * @param {Object} paymentData
   *   - transactionId?: string (거래 ID)
   *   - amount?: number (결제 금액)
   *   - method?: string (결제 방법)
   *   - processedAt?: string (처리 시간)
   *
   * @returns {Promise<Object>}
   *   { success: boolean, message: string }
   */
  async updatePaymentStatus(orderId, paymentStatus, paymentData = {}) {
    throw new Error('updatePaymentStatus must be implemented');
  }

  /**
   * 타임라인 항목 추가
   *
   * @param {string} orderId - 주문 ID
   * @param {Object} timelineItem
   *   - event: string (이벤트명)
   *   - status: string ('pending' | 'in-progress' | 'completed')
   *   - date?: string (발생 날짜, 미제공 시 현재 시간)
   *
   * @returns {Promise<Object>}
   *   { success: boolean, timelineId: string, message: string }
   */
  async addTimelineItem(orderId, timelineItem) {
    throw new Error('addTimelineItem must be implemented');
  }
}
