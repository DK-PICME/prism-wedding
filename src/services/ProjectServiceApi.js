import { ProjectService } from './ProjectService';

/**
 * ProjectServiceApi - Firebase Cloud Functions HTTP API 구현체
 *
 * 환경변수 VITE_API_BASE_URL로 API 엔드포인트를 설정합니다.
 * 미설정 시 Firebase Hosting 리라이트 규칙을 통해 /api 경로를 사용합니다.
 */
export class ProjectServiceApi extends ProjectService {
  constructor() {
    super();
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    this._pollingIntervals = new Map();
  }

  // ─── 내부 유틸 ──────────────────────────────────────────────────────────────

  async _fetch(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      const message = json.error || `HTTP ${res.status}`;
      throw new Error(message);
    }

    return json.data;
  }

  // ─── 프로젝트 조회 ──────────────────────────────────────────────────────────

  async getProject(projectId) {
    return this._fetch(`/projects/${projectId}`);
  }

  // ─── 실시간 구독 (폴링 방식) ────────────────────────────────────────────────

  /**
   * 프로젝트 상태 변경 구독
   * Firebase Realtime Database 대신 30초 폴링으로 구현
   * (Firestore onSnapshot은 Functions에서 직접 지원하지 않으므로 클라이언트 SDK 추가 시 교체 가능)
   */
  onProjectStatusChanged(projectId, callback) {
    // 초기 데이터 즉시 로드
    this.getProject(projectId)
      .then(callback)
      .catch((err) => console.error('onProjectStatusChanged initial load error:', err));

    // 30초마다 폴링
    const intervalId = setInterval(async () => {
      try {
        const project = await this.getProject(projectId);
        callback(project);
      } catch (err) {
        console.error('onProjectStatusChanged polling error:', err);
      }
    }, 30000);

    this._pollingIntervals.set(projectId, intervalId);

    // 구독 해제 함수 반환
    return () => {
      const id = this._pollingIntervals.get(projectId);
      if (id) {
        clearInterval(id);
        this._pollingIntervals.delete(projectId);
      }
    };
  }

  // ─── 샘플 ───────────────────────────────────────────────────────────────────

  async getSamples(projectId) {
    return this._fetch(`/projects/${projectId}/samples`);
  }

  /**
   * 샘플 업로드
   * @param {string} projectId
   * @param {string} fileName
   * @param {string} fileUrl - Cloud Storage 업로드 후 획득한 URL
   * @param {string} revisionRequest
   */
  async createSample(projectId, { fileName, fileUrl, revisionRequest }) {
    return this._fetch(`/projects/${projectId}/samples`, {
      method: 'POST',
      body: JSON.stringify({ fileName, fileUrl, revisionRequest }),
    });
  }

  /**
   * 샘플 결과 만족 확인 → 본보정 업로드 단계 전환
   */
  async approveSample(projectId) {
    return this._fetch(`/projects/${projectId}/sample-approve`, { method: 'POST' });
  }

  // ─── 재수정 요청 ─────────────────────────────────────────────────────────────

  async getRevisionRequests(projectId) {
    return this._fetch(`/projects/${projectId}/revision-requests`);
  }

  async createRevisionRequest(projectId, message) {
    return this._fetch(`/projects/${projectId}/revision-requests`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // ─── 본보정 사진 ─────────────────────────────────────────────────────────────

  async getMainPhotos(projectId) {
    return this._fetch(`/projects/${projectId}/main-photos`);
  }

  /**
   * 본보정 사진 업로드
   * @param {string} projectId
   * @param {Array<{fileName, fileUrl, revisionRequest}>} photos
   * @param {string} commonRequest - 공통 요청사항
   */
  async createMainPhotos(projectId, photos, commonRequest = '') {
    return this._fetch(`/projects/${projectId}/main-photos`, {
      method: 'POST',
      body: JSON.stringify({ photos, commonRequest }),
    });
  }

  /**
   * 본보정 결과 만족 확인 → 완료 단계 전환
   */
  async approveMain(projectId) {
    return this._fetch(`/projects/${projectId}/main-approve`, { method: 'POST' });
  }

  // ─── 상태 업데이트 (관리자용) ─────────────────────────────────────────────────

  async updateStatus(projectId, status, currentStep) {
    return this._fetch(`/projects/${projectId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, currentStep }),
    });
  }

  // ─── Mock 호환 메서드 (개발용) ────────────────────────────────────────────────

  generateMockData(overrides = {}) {
    const now = new Date();
    return {
      id: `proj_${Math.random().toString(36).substr(2, 9)}`,
      clientName: '테스트 고객',
      status: 'waiting',
      currentStep: 0,
      uploadDate: null,
      dueDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      ...overrides,
    };
  }
}
