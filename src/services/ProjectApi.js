/**
 * Project API Service
 * Cloud Functions의 /api/projects/** 엔드포인트 호출
 */

import apiClient from './ApiClient.js';

class ProjectApiService {
  /**
   * 프로젝트 기본 정보 조회
   */
  static async getProject(projectId) {
    try {
      const response = await apiClient.get(`/projects/${projectId}`);
      return response.data;
    } catch (err) {
      console.error('Failed to get project:', err);
      throw err;
    }
  }

  /**
   * 샘플 파일 목록 조회
   */
  static async getSamples(projectId) {
    try {
      const response = await apiClient.get(`/projects/${projectId}/samples`);
      return response.data;
    } catch (err) {
      console.error('Failed to get samples:', err);
      throw err;
    }
  }

  /**
   * 샘플 업로드
   */
  static async uploadSample(projectId, { fileName, fileUrl, revisionRequest }) {
    try {
      const response = await apiClient.post(`/projects/${projectId}/samples`, {
        fileName,
        fileUrl,
        revisionRequest,
      });
      return response.data;
    } catch (err) {
      console.error('Failed to upload sample:', err);
      throw err;
    }
  }

  /**
   * 샘플 수정 요청
   */
  static async requestRevision(projectId, sampleId, revisionRequest) {
    try {
      const response = await apiClient.put(
        `/projects/${projectId}/samples/${sampleId}`,
        { revisionRequest }
      );
      return response.data;
    } catch (err) {
      console.error('Failed to request revision:', err);
      throw err;
    }
  }

  /**
   * 프로젝트 상태 업데이트
   */
  static async updateProjectStatus(projectId, status) {
    try {
      const response = await apiClient.patch(`/projects/${projectId}`, { status });
      return response.data;
    } catch (err) {
      console.error('Failed to update project status:', err);
      throw err;
    }
  }
}

export default ProjectApiService;
