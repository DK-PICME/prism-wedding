/**
 * ProjectService - Firebase와의 통신 인터페이스
 * 
 * 이 인터페이스는 Firestore와의 데이터 통신을 정의합니다.
 * 실제 구현은 project-service-firebase.js에서 담당하며,
 * 개발 중에는 project-service-mock.js를 사용할 수 있습니다.
 */

class ProjectService {
  /**
   * 프로젝트 데이터 조회
   * @param {string} projectId - 프로젝트 ID
   * @returns {Promise<ProjectData>} 프로젝트 정보
   * 
   * @typedef {Object} ProjectData
   * @property {string} id - 프로젝트 ID
   * @property {string} status - 진행 상태 (검토중, 완료, 대기 등)
   * @property {Date} uploadDate - 업로드 날짜
   * @property {Date} dueDate - 예상 납기일
   * @property {string} uploadStatus - 업로드 상태 (완료, 대기 등)
   * @property {Object} progressInfo - 진행 정보
   * @property {Date} progressInfo.createdAt - 생성 날짜
   * @property {string} progressInfo.currentStep - 현재 단계
   */
  async getProject(projectId) {
    throw new Error('getProject method must be implemented');
  }

  /**
   * 프로젝트 상태 변경 구독 (실시간 업데이트)
   * @param {string} projectId - 프로젝트 ID
   * @param {Function} callback - 데이터 변경 시 호출되는 콜백 함수
   * @returns {Function} 구독 해제 함수
   */
  onProjectStatusChanged(projectId, callback) {
    throw new Error('onProjectStatusChanged method must be implemented');
  }

  /**
   * 테스트 데이터 생성 (개발용)
   * @param {Object} overrides - 기본값을 덮어쓸 데이터
   * @returns {ProjectData}
   */
  generateMockData(overrides = {}) {
    throw new Error('generateMockData method must be implemented');
  }
}

// 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectService;
}
