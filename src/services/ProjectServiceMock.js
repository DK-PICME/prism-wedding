import { ProjectService } from './ProjectService';

/**
 * ProjectServiceMock - 개발/테스트용 더미 구현
 * 
 * Firebase 연동 전 프론트엔드 개발을 위한 더미 데이터를 제공합니다.
 */
export class ProjectServiceMock extends ProjectService {
  constructor() {
    super();
    this.projects = new Map();
    this.listeners = new Map();
    this.orders = new Map();        // Phase 2: 주문 관리
    this.nextOrderId = 1;
    this.initializeMockData();
  }

  /**
   * 기본 더미 데이터 초기화
   */
  initializeMockData() {
    const mockProjects = [
      this.generateMockData({
        id: 'proj_001',
        status: '검토중',
        uploadStatus: '완료',
      }),
      this.generateMockData({
        id: 'proj_002',
        status: '완료',
        uploadStatus: '완료',
      }),
      this.generateMockData({
        id: 'proj_003',
        status: '대기',
        uploadStatus: '대기',
      }),
    ];

    mockProjects.forEach(project => {
      this.projects.set(project.id, project);
    });
  }

  /**
   * 프로젝트 데이터 조회
   */
  async getProject(projectId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const project = this.projects.get(projectId);
        if (project) {
          resolve(JSON.parse(JSON.stringify(project)));
        } else {
          resolve(this.generateMockData({ id: projectId }));
        }
      }, 500);
    });
  }

  /**
   * 프로젝트 상태 변경 구독
   */
  onProjectStatusChanged(projectId, callback) {
    const listenerId = `${projectId}_${Date.now()}`;
    
    if (!this.listeners.has(projectId)) {
      this.listeners.set(projectId, new Map());
    }
    
    this.listeners.get(projectId).set(listenerId, callback);

    const project = this.projects.get(projectId);
    if (project) {
      callback(JSON.parse(JSON.stringify(project)));
    }

    return () => {
      const projectListeners = this.listeners.get(projectId);
      if (projectListeners) {
        projectListeners.delete(listenerId);
      }
    };
  }

  /**
   * 테스트 데이터 생성
   */
  generateMockData(overrides = {}) {
    const now = new Date();
    const uploadDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const dueDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

    const baseData = {
      id: `proj_${Math.random().toString(36).substr(2, 9)}`,
      status: '검토중',
      uploadDate: uploadDate.toISOString(),
      dueDate: dueDate.toISOString(),
      uploadStatus: '완료',
      progressInfo: {
        createdAt: uploadDate.toISOString(),
        currentStep: 1,
      },
    };

    return { ...baseData, ...overrides };
  }

  /**
   * 샘플 목록 조회 (더미)
   */
  async getSamples(projectId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'sample_001',
            fileUrl: 'https://picsum.photos/seed/before1/800/600',
            resultUrl: 'https://picsum.photos/seed/after1/800/600',
            fileName: 'sample_portrait.jpg',
            revisionRequest: '얼굴톤 자연스럽게 보정, 턱선 과하지 않게 다듬기, 자연스러운 느낌 유지',
            uploadedAt: new Date().toISOString(),
          },
        ]);
      }, 300);
    });
  }

  /**
   * 샘플 업로드 (더미)
   */
  async createSample(projectId, { fileName, fileUrl, revisionRequest }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: `sample_${Date.now()}`, fileName, fileUrl, revisionRequest });
      }, 500);
    });
  }

  /**
   * 샘플 만족 확인 (더미)
   */
  async approveSample(projectId) {
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 300));
  }

  /**
   * 재수정 요청 목록 조회 (더미)
   */
  async getRevisionRequests(projectId) {
    return new Promise((resolve) => setTimeout(() => resolve([]), 300));
  }

  /**
   * 재수정 요청 등록 (더미)
   */
  async createRevisionRequest(projectId, message) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ id: `req_${Date.now()}`, message, status: 'pending' }), 500);
    });
  }

  /**
   * 본보정 사진 목록 조회 (더미)
   */
  async getMainPhotos(projectId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'photo_001',
            fileUrl: 'https://picsum.photos/seed/main1a/800/600',
            resultUrl: 'https://picsum.photos/seed/main1b/800/600',
            fileName: 'portrait_001.jpg',
            revisionRequest: '얼굴톤 자연스럽게, 피부 잡티 제거, 전체적인 밝기 조정',
            uploadedAt: new Date().toISOString(),
          },
          {
            id: 'photo_002',
            fileUrl: 'https://picsum.photos/seed/main2a/800/600',
            resultUrl: 'https://picsum.photos/seed/main2b/800/600',
            fileName: 'portrait_002.jpg',
            revisionRequest: '배경 흐림 효과, 인물 선명도 향상, 색감 보정',
            uploadedAt: new Date().toISOString(),
          },
          {
            id: 'photo_003',
            fileUrl: 'https://picsum.photos/seed/main3a/800/600',
            resultUrl: 'https://picsum.photos/seed/main3b/800/600',
            fileName: 'portrait_003.jpg',
            revisionRequest: '전체적인 노출 조정, 그림자 부분 밝게, 하이라이트 조정',
            uploadedAt: new Date().toISOString(),
          },
        ]);
      }, 300);
    });
  }

  /**
   * 본보정 사진 업로드 (더미)
   */
  async createMainPhotos(projectId, photos, commonRequest) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(photos.map((p, i) => ({ id: `photo_${i}`, ...p }))), 500);
    });
  }

  /**
   * 본보정 만족 확인 (더미)
   */
  async approveMain(projectId) {
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 300));
  }

  /**
   * 상태 변경 시뮬레이션 (테스트용)
   */
  updateProjectStatus(projectId, updates) {
    const project = this.projects.get(projectId);
    if (project) {
      const updated = { ...project, ...updates };
      this.projects.set(projectId, updated);

      const projectListeners = this.listeners.get(projectId);
      if (projectListeners) {
        projectListeners.forEach(callback => {
          callback(JSON.parse(JSON.stringify(updated)));
        });
      }
    }
  }

  // ─── Phase 2: 주문 관리 ───────────────────────────────────────

  /**
   * 사용자의 주문 목록 조회 (더미)
   */
  async getOrders(userId, options = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 더미 주문 데이터
        const allOrders = [
          {
            id: 'order_001',
            userId,
            name: '김민수 & 박지영 웨딩',
            projectId: '#2025-0122',
            status: 'in-progress',
            statusLabel: '진행중',
            statusIcon: 'fa-spinner',
            photos: 150,
            progress: 85,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            date: '2025-01-20',
            paymentStatus: 'completed',
            amount: 450000,
            basePrice: 3000,
            additionalCost: 0,
            weddingType: '본식 촬영',
            remarks: '자연스러운 톤으로 보정 부탁드립니다',
            timeline: [
              { date: '2025-01-18 14:30', event: '주문 생성', status: 'completed' },
              { date: '2025-01-19 09:15', event: '결제 완료', status: 'completed' },
            ]
          },
          {
            id: 'order_002',
            userId,
            name: '이준호 & 최수진 스드메',
            projectId: '#2025-0121',
            status: 'waiting',
            statusLabel: '대기',
            statusIcon: 'fa-clock',
            photos: 85,
            progress: 0,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            date: '2025-01-21',
            paymentStatus: 'waiting',
            amount: 255000,
            basePrice: 3000,
            additionalCost: 0,
            weddingType: '스드메 촬영',
            remarks: '',
            timeline: []
          },
          {
            id: 'order_003',
            userId,
            name: '정대현 & 한소희 본식',
            projectId: '#2025-0118',
            status: 'completed',
            statusLabel: '완료',
            statusIcon: 'fa-check-circle',
            photos: 200,
            progress: 100,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            date: '2025-01-18',
            paymentStatus: 'completed',
            amount: 600000,
            basePrice: 3000,
            additionalCost: 0,
            weddingType: '본식 촬영',
            remarks: '프리미엄 보정 요청',
            timeline: [
              { date: '2025-01-15 10:00', event: '주문 생성', status: 'completed' },
            ]
          },
        ];

        // 필터링
        let filtered = allOrders;

        // 상태 필터
        if (options.status) {
          filtered = filtered.filter(o => o.status === options.status);
        }

        // 기간 필터
        if (options.startDate) {
          filtered = filtered.filter(o => o.createdAt >= options.startDate);
        }
        if (options.endDate) {
          filtered = filtered.filter(o => o.createdAt <= options.endDate);
        }

        // 검색
        if (options.searchQuery) {
          const q = options.searchQuery.toLowerCase();
          filtered = filtered.filter(o => 
            o.name.toLowerCase().includes(q) || 
            o.projectId.toLowerCase().includes(q)
          );
        }

        // 페이지네이션
        const page = options.page || 1;
        const limit = options.limit || 10;
        const total = filtered.length;
        const start = (page - 1) * limit;
        const paginated = filtered.slice(start, start + limit);

        resolve({
          orders: paginated,
          total,
          page,
          limit,
          hasMore: start + limit < total,
        });
      }, 500);
    });
  }

  /**
   * 개별 주문 조회 (더미)
   */
  async getOrder(orderId, userId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = this.orders.get(orderId);
        if (order) {
          if (order.userId !== userId) {
            reject(new Error('권한이 없습니다'));
            return;
          }
          resolve(JSON.parse(JSON.stringify(order)));
        } else {
          reject(new Error(`Order not found: ${orderId}`));
        }
      }, 300);
    });
  }

  /**
   * 새 주문 생성 (더미)
   */
  async createOrder(userId, orderData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orderId = `order_${Date.now()}`;
        const projectId = `#2025-${String(this.nextOrderId).padStart(4, '0')}`;
        this.nextOrderId++;

        const order = {
          id: orderId,
          userId,
          name: `${orderData.name || '미입력'}`,
          projectId,
          status: 'waiting',
          statusLabel: '대기',
          statusIcon: 'fa-clock',
          photos: orderData.estimatedPhotos || 0,
          progress: 0,
          createdAt: new Date(),
          date: orderData.date,
          paymentStatus: 'waiting',
          amount: (orderData.basePrice * orderData.estimatedPhotos) + (orderData.additionalCost || 0),
          basePrice: orderData.basePrice,
          additionalCost: orderData.additionalCost || 0,
          weddingType: orderData.weddingType,
          remarks: orderData.remarks || '',
          timeline: [
            { date: new Date().toISOString(), event: '주문 생성', status: 'completed' }
          ]
        };

        this.orders.set(orderId, order);

        console.log('[ProjectServiceMock] Order created:', order);

        resolve({
          success: true,
          orderId,
          projectId,
          message: '주문이 생성되었습니다',
        });
      }, 500);
    });
  }

  /**
   * 주문 수정 (더미)
   */
  async updateOrder(orderId, userId, updates) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = this.orders.get(orderId);
        if (!order) {
          reject(new Error(`Order not found: ${orderId}`));
          return;
        }

        if (order.userId !== userId) {
          reject(new Error('권한이 없습니다'));
          return;
        }

        const updated = { ...order, ...updates, updatedAt: new Date() };
        this.orders.set(orderId, updated);

        console.log('[ProjectServiceMock] Order updated:', updated);

        resolve({
          success: true,
          message: '주문이 수정되었습니다',
        });
      }, 500);
    });
  }

  /**
   * 주문 삭제 (더미)
   */
  async deleteOrder(orderId, userId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = this.orders.get(orderId);
        if (!order) {
          reject(new Error(`Order not found: ${orderId}`));
          return;
        }

        if (order.userId !== userId) {
          reject(new Error('권한이 없습니다'));
          return;
        }

        this.orders.delete(orderId);

        console.log('[ProjectServiceMock] Order deleted:', orderId);

        resolve({
          success: true,
          message: '주문이 삭제되었습니다',
        });
      }, 300);
    });
  }

  /**
   * 주문 상태 업데이트 (더미)
   */
  async updateOrderStatus(orderId, status, options = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = this.orders.get(orderId);
        if (order) {
          order.status = status;
          if (options.progress !== undefined) {
            order.progress = options.progress;
          }
          if (options.updatedBy) {
            order.updatedBy = options.updatedBy;
          }

          console.log('[ProjectServiceMock] Order status updated:', { orderId, status, progress: options.progress });
        }

        resolve({
          success: true,
          message: '주문 상태가 업데이트되었습니다',
        });
      }, 300);
    });
  }

  /**
   * 결제 상태 업데이트 (더미)
   */
  async updatePaymentStatus(orderId, paymentStatus, paymentData = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = this.orders.get(orderId);
        if (order) {
          order.paymentStatus = paymentStatus;
          if (paymentData.transactionId) {
            order.transactionId = paymentData.transactionId;
          }
          if (paymentData.processedAt) {
            order.paymentProcessedAt = paymentData.processedAt;
          }

          console.log('[ProjectServiceMock] Payment status updated:', { orderId, paymentStatus, ...paymentData });
        }

        resolve({
          success: true,
          message: '결제 상태가 업데이트되었습니다',
        });
      }, 300);
    });
  }

  /**
   * 타임라인 항목 추가 (더미)
   */
  async addTimelineItem(orderId, timelineItem) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = this.orders.get(orderId);
        if (order && !order.timeline) {
          order.timeline = [];
        }

        const item = {
          id: `timeline_${Date.now()}`,
          ...timelineItem,
          date: timelineItem.date || new Date().toISOString(),
        };

        if (order) {
          order.timeline.push(item);

          console.log('[ProjectServiceMock] Timeline item added:', item);
        }

        resolve({
          success: true,
          timelineId: item.id,
          message: '타임라인이 추가되었습니다',
        });
      }, 300);
    });
  }
}
