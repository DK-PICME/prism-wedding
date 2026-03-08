/**
 * ProjectService - Firebase와의 통신 인터페이스
 * 
 * 이 인터페이스는 Firestore와의 데이터 통신을 정의합니다.
 */

export class ProjectService {
  /**
   * 프로젝트 데이터 조회
   * @param {string} projectId - 프로젝트 ID
   * @returns {Promise<ProjectData>} 프로젝트 정보
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
