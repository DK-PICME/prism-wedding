/**
 * ProjectServiceMock - 개발/테스트용 더미 구현
 * 
 * Firebase 연동 전 프론트엔드 개발을 위한 더미 데이터를 제공합니다.
 * 실제 Firebase 연동 시 project-service-firebase.js로 교체하면 됩니다.
 */

class ProjectServiceMock extends ProjectService {
  constructor() {
    super();
    // 더미 데이터 저장소
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
   * @param {string} projectId
   * @returns {Promise<ProjectData>}
   */
  async getProject(projectId) {
    // 네트워크 지연 시뮬레이션 (500ms)
    return new Promise((resolve) => {
      setTimeout(() => {
        const project = this.projects.get(projectId);
        if (project) {
          resolve(JSON.parse(JSON.stringify(project))); // 깊은 복사
        } else {
          resolve(this.generateMockData({ id: projectId }));
        }
      }, 500);
    });
  }

  /**
   * 프로젝트 상태 변경 구독
   * @param {string} projectId
   * @param {Function} callback
   * @returns {Function} 구독 해제 함수
   */
  onProjectStatusChanged(projectId, callback) {
    const listenerId = `${projectId}_${Date.now()}`;
    
    if (!this.listeners.has(projectId)) {
      this.listeners.set(projectId, new Map());
    }
    
    this.listeners.get(projectId).set(listenerId, callback);

    // 초기 데이터 전달
    const project = this.projects.get(projectId);
    if (project) {
      callback(JSON.parse(JSON.stringify(project)));
    }

    // 구독 해제 함수 반환
    return () => {
      const projectListeners = this.listeners.get(projectId);
      if (projectListeners) {
        projectListeners.delete(listenerId);
      }
    };
  }

  /**
   * 테스트 데이터 생성
   * @param {Object} overrides
   * @returns {ProjectData}
   */
  generateMockData(overrides = {}) {
    const now = new Date();
    const uploadDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1일 전
    const dueDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15일 후

    const baseData = {
      id: `proj_${Math.random().toString(36).substr(2, 9)}`,
      status: '검토중',
      uploadDate: uploadDate.toISOString(),
      dueDate: dueDate.toISOString(),
      uploadStatus: '완료',
      progressInfo: {
        createdAt: uploadDate.toISOString(),
        currentStep: 1,
        estimatedDueDate: dueDate.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
      },
    };

    return { ...baseData, ...overrides };
  }

  /**
   * 상태 변경 시뮬레이션 (테스트용)
   * @param {string} projectId
   * @param {Object} updates
   */
  updateProjectStatus(projectId, updates) {
    const project = this.projects.get(projectId);
    if (project) {
      const updated = { ...project, ...updates };
      this.projects.set(projectId, updated);

      // 모든 리스너에 알림
      const projectListeners = this.listeners.get(projectId);
      if (projectListeners) {
        projectListeners.forEach(callback => {
          callback(JSON.parse(JSON.stringify(updated)));
        });
      }
    }
  }
}

// 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectServiceMock;
}
