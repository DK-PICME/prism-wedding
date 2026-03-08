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
}
