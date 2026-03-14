import { ProjectService } from './ProjectService.js';
import { nanoid } from 'nanoid';

/**
 * ProjectServiceMock - 개발/테스트용 더미 구현
 * 
 * Firebase 없이 로컬 메모리에서 Project + Photo 데이터를 관리합니다.
 * PhotoManagementPage 개발/테스트에 사용됩니다.
 */
export class ProjectServiceMock extends ProjectService {
  constructor() {
    super();
    this.projects = new Map();        // projectId -> Project
    this.photos = new Map();           // photoId -> Photo
    this.listeners = new Map();        // listenerId -> { type, callback }
    this.listenerCounter = 0;
    this.initializeMockData();
  }

  /**
   * 더미 데이터 초기화
   */
  initializeMockData() {
    // Project 1: "2025년 3월 웨딩"
    const proj1 = this.generateMockProject({
      id: 'proj_001',
      name: '2025년 3월 웨딩',
      description: '신부 김민수 & 신랑 박지영',
    });
    this.projects.set('proj_001', proj1);

    // Project 1의 사진들
    const photos1 = [
      this.generateMockPhoto({
        id: 'photo_001',
        projectId: 'proj_001',
        fileName: 'wedding_001.jpg',
        status: 'READY',
      }),
      this.generateMockPhoto({
        id: 'photo_002',
        projectId: 'proj_001',
        fileName: 'wedding_002.jpg',
        status: 'READY',
      }),
      this.generateMockPhoto({
        id: 'photo_003',
        projectId: 'proj_001',
        fileName: 'wedding_003.jpg',
        status: 'UPLOADING',
        uploadProgress: 45,
      }),
      this.generateMockPhoto({
        id: 'photo_004',
        projectId: 'proj_001',
        fileName: 'wedding_004.jpg',
        status: 'PROCESSING',
      }),
      this.generateMockPhoto({
        id: 'photo_005',
        projectId: 'proj_001',
        fileName: 'wedding_005.jpg',
        status: 'UPLOAD_FAILED',
      }),
    ];

    photos1.forEach(photo => {
      this.photos.set(photo.id, photo);
    });

    proj1.photoCount = photos1.length;
    proj1.totalSize = photos1.reduce((sum, p) => sum + (p.fileSize || 0), 0);

    // Project 2: "2025년 2월 스냅"
    const proj2 = this.generateMockProject({
      id: 'proj_002',
      name: '2025년 2월 스냅',
      description: '서울 한강공원',
    });
    this.projects.set('proj_002', proj2);

    // Project 2의 사진들 (비어있음)
    proj2.photoCount = 0;
    proj2.totalSize = 0;

    // Project 3: "2025년 1월 전 스튜디오"
    const proj3 = this.generateMockProject({
      id: 'proj_003',
      name: '2025년 1월 전 스튜디오',
      description: '강남역 스튜디오',
    });
    this.projects.set('proj_003', proj3);

    const photos3 = [
      this.generateMockPhoto({
        id: 'photo_006',
        projectId: 'proj_003',
        fileName: 'studio_001.jpg',
        status: 'READY',
      }),
    ];

    photos3.forEach(photo => {
      this.photos.set(photo.id, photo);
    });

    proj3.photoCount = photos3.length;
    proj3.totalSize = photos3.reduce((sum, p) => sum + (p.fileSize || 0), 0);

    console.log('✅ Mock 데이터 초기화 완료:', {
      projects: this.projects.size,
      photos: this.photos.size,
    });
  }

  /**
   * 더미 Project 생성
   */
  generateMockProject(overrides = {}) {
    const now = new Date();
    return {
      id: overrides.id || `proj_${nanoid()}`,
      userId: overrides.userId || 'user_001',
      name: overrides.name || '프로젝트',
      description: overrides.description || '',
      photoCount: overrides.photoCount || 0,
      totalSize: overrides.totalSize || 0,
      createdAt: overrides.createdAt || now,
      updatedAt: overrides.updatedAt || now,
    };
  }

  /**
   * 더미 Photo 생성
   */
  generateMockPhoto(overrides = {}) {
    const now = new Date();
    return {
      id: overrides.id || `photo_${nanoid()}`,
      userId: overrides.userId || 'user_001',
      projectId: overrides.projectId || 'proj_001',
      fileName: overrides.fileName || 'photo.jpg',
      fileSize: overrides.fileSize || 2.5 * 1024 * 1024, // 2.5MB
      fileExt: overrides.fileExt || 'jpg',
      fileMd5: overrides.fileMd5 || null,
      status: overrides.status || 'READY',
      usedInOrders: overrides.usedInOrders || [],
      uploadProgress: overrides.uploadProgress || 0,
      uploadError: overrides.uploadError || null,
      uploadAttempt: overrides.uploadAttempt || 0,
      processingError: overrides.processingError || null,
      processingAttempt: overrides.processingAttempt || 0,
      uploadedUrl: overrides.uploadedUrl || 'https://via.placeholder.com/500?text=wedding',
      thumbnailUrl: overrides.thumbnailUrl || 'https://via.placeholder.com/100?text=wedding',
      previewUrl: overrides.previewUrl || 'https://via.placeholder.com/500?text=wedding',
      webpUrl: overrides.webpUrl || null,
      internalBackupUrl: overrides.internalBackupUrl || null,
      metadata: overrides.metadata || {
        width: 4000,
        height: 3000,
        format: 'jpeg',
        colorspace: 'RGB',
        hasAlpha: false,
      },
      createdAt: overrides.createdAt || now,
      updatedAt: overrides.updatedAt || now,
    };
  }

  /**
   * 프로젝트 목록 구독 (실시간 리스너)
   */
  onProjectsChanged(userId, callback) {
    const listenerId = ++this.listenerCounter;

    // 즉시 현재 데이터 전달
    const userProjects = Array.from(this.projects.values()).filter(p => p.userId === userId);
    callback(userProjects);

    // 리스너 등록
    this.listeners.set(`projects_${listenerId}`, {
      type: 'projects',
      userId,
      callback,
    });

    // 구독 해제 함수 반환
    return () => {
      this.listeners.delete(`projects_${listenerId}`);
      console.log(`✅ 프로젝트 리스너 해제: ${listenerId}`);
    };
  }

  /**
   * 프로젝트 생성
   */
  async createProject(userId, projectData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const projectId = `proj_${nanoid()}`;
          const newProject = this.generateMockProject({
            id: projectId,
            userId,
            name: projectData.name,
            description: projectData.description || '',
            photoCount: 0,
            totalSize: 0,
          });

          this.projects.set(projectId, newProject);

          // 리스너에 알림
          this._notifyProjectListeners(userId);

          console.log(`✅ 프로젝트 생성: ${projectId} (${projectData.name})`);

          resolve({
            success: true,
            projectId,
            message: '프로젝트가 생성되었습니다.',
          });
        } catch (error) {
          console.error('❌ 프로젝트 생성 실패:', error);
          resolve({
            success: false,
            message: error.message,
          });
        }
      }, 500); // 네트워크 지연 시뮬레이션
    });
  }

  /**
   * 프로젝트 조회
   */
  async getProject(projectId, userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const project = this.projects.get(projectId);

        if (!project) {
          resolve(null);
          return;
        }

        if (project.userId !== userId) {
          throw new Error('접근 권한이 없습니다.');
        }

        resolve(project);
      }, 300);
    });
  }

  /**
   * 프로젝트 수정
   */
  async updateProject(projectId, userId, updates) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const project = this.projects.get(projectId);

          if (!project) {
            throw new Error('프로젝트를 찾을 수 없습니다.');
          }

          if (project.userId !== userId) {
            throw new Error('접근 권한이 없습니다.');
          }

          // 수정 가능한 필드
          if (updates.name) project.name = updates.name;
          if (updates.description !== undefined) project.description = updates.description;
          project.updatedAt = new Date();

          // 리스너에 알림
          this._notifyProjectListeners(userId);

          console.log(`✅ 프로젝트 수정: ${projectId}`);

          resolve({
            success: true,
            message: '프로젝트가 수정되었습니다.',
          });
        } catch (error) {
          console.error('❌ 프로젝트 수정 실패:', error);
          resolve({
            success: false,
            message: error.message,
          });
        }
      }, 300);
    });
  }

  /**
   * 프로젝트 삭제 (하위 Photo도 삭제)
   */
  async deleteProject(projectId, userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const project = this.projects.get(projectId);

          if (!project) {
            throw new Error('프로젝트를 찾을 수 없습니다.');
          }

          if (project.userId !== userId) {
            throw new Error('접근 권한이 없습니다.');
          }

          // 하위 사진 삭제
          const photosInProject = Array.from(this.photos.values()).filter(
            p => p.projectId === projectId
          );

          photosInProject.forEach(photo => {
            this.photos.delete(photo.id);
          });

          // 프로젝트 삭제
          this.projects.delete(projectId);

          // 리스너에 알림
          this._notifyProjectListeners(userId);

          console.log(`✅ 프로젝트 삭제: ${projectId} (사진 ${photosInProject.length}개 삭제됨)`);

          resolve({
            success: true,
            message: '프로젝트가 삭제되었습니다.',
            deletedPhotoCount: photosInProject.length,
          });
        } catch (error) {
          console.error('❌ 프로젝트 삭제 실패:', error);
          resolve({
            success: false,
            message: error.message,
            deletedPhotoCount: 0,
          });
        }
      }, 300);
    });
  }

  /**
   * 프로젝트 통계 업데이트
   */
  async updateProjectStats(projectId, stats) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const project = this.projects.get(projectId);

          if (!project) {
            throw new Error('프로젝트를 찾을 수 없습니다.');
          }

          project.photoCount = stats.photoCount || 0;
          project.totalSize = stats.totalSize || 0;
          project.updatedAt = new Date();

          resolve({
            success: true,
            message: '프로젝트 통계가 업데이트되었습니다.',
          });
        } catch (error) {
          resolve({
            success: false,
            message: error.message,
          });
        }
      }, 200);
    });
  }

  /**
   * 사진 목록 구독 (실시간 리스너)
   */
  onPhotosChanged(projectId, userId, callback) {
    const listenerId = ++this.listenerCounter;

    // 즉시 현재 데이터 전달
    const projectPhotos = Array.from(this.photos.values()).filter(
      p => p.projectId === projectId && p.userId === userId
    );
    callback(projectPhotos);

    // 리스너 등록
    this.listeners.set(`photos_${listenerId}`, {
      type: 'photos',
      projectId,
      userId,
      callback,
    });

    // 구독 해제 함수 반환
    return () => {
      this.listeners.delete(`photos_${listenerId}`);
      console.log(`✅ 사진 리스너 해제: ${listenerId}`);
    };
  }

  /**
   * 프로젝트 리스너 알림
   */
  _notifyProjectListeners(userId) {
    const userProjects = Array.from(this.projects.values()).filter(p => p.userId === userId);

    this.listeners.forEach((listener) => {
      if (listener.type === 'projects' && listener.userId === userId) {
        try {
          listener.callback(userProjects);
        } catch (error) {
          console.error('❌ 리스너 콜백 실패:', error);
        }
      }
    });
  }

  /**
   * 사진 리스너 알림
   */
  _notifyPhotoListeners(projectId) {
    const projectPhotos = Array.from(this.photos.values()).filter(
      p => p.projectId === projectId
    );

    this.listeners.forEach((listener) => {
      if (listener.type === 'photos' && listener.projectId === projectId) {
        try {
          listener.callback(projectPhotos);
        } catch (error) {
          console.error('❌ 리스너 콜백 실패:', error);
        }
      }
    });
  }

  /**
   * 테스트 데이터 생성 (기존 메서드 호환성)
   */
  generateMockData(overrides = {}) {
    return this.generateMockProject(overrides);
  }

  // ─── Order 메서드들 (Mock 구현) ─────────────────────────────────────────

  async getOrders(userId, options = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          orders: [],
          total: 0,
          page: options.page || 1,
          limit: options.limit || 10,
          hasMore: false,
        });
      }, 300);
    });
  }

  async getOrder(orderId, userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 300);
    });
  }

  async createOrder(userId, orderData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          orderId: `order_${nanoid()}`,
          projectId: 'proj_001',
          message: '주문이 생성되었습니다.',
        });
      }, 300);
    });
  }

  async updateOrder(orderId, userId, updates) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: '주문이 수정되었습니다.',
        });
      }, 300);
    });
  }

  async deleteOrder(orderId, userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: '주문이 삭제되었습니다.',
        });
      }, 300);
    });
  }

  async updateOrderStatus(orderId, status, options = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: '주문 상태가 업데이트되었습니다.',
        });
      }, 300);
    });
  }

  async updatePaymentStatus(orderId, paymentStatus, paymentData = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: '결제 상태가 업데이트되었습니다.',
        });
      }, 300);
    });
  }

  async addTimelineItem(orderId, timelineItem) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          timelineId: `timeline_${nanoid()}`,
          message: '타임라인이 추가되었습니다.',
        });
      }, 300);
    });
  }
}

export default new ProjectServiceMock();
