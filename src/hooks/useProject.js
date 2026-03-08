import { useState, useEffect, useCallback } from 'react';
import { getUrlParam } from '../utils/helpers';

/**
 * useProjectId - URL 파라미터에서 projectId 추출
 * 기본값: 'proj_001' (개발용)
 */
export function useProjectId(defaultId = 'proj_001') {
  const [projectId] = useState(() => getUrlParam('projectId') || defaultId);
  return projectId;
}

/**
 * useProject - 프로젝트 데이터를 1회 로드하는 커스텀 훅
 */
export function useProject(projectService, projectId) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!projectId || !projectService) return;
    try {
      setLoading(true);
      const data = await projectService.getProject(projectId);
      setProject(data);
      setError(null);
    } catch (err) {
      setError(err);
      console.error('Error loading project:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, projectService]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { project, loading, error, reload };
}

/**
 * useProjectRealtimeUpdate - 프로젝트 실시간 업데이트 구독 훅
 */
export function useProjectRealtimeUpdate(projectService, projectId) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectId || !projectService) return;

    setLoading(true);

    const unsubscribe = projectService.onProjectStatusChanged(projectId, (updatedProject) => {
      setProject(updatedProject);
      setLoading(false);
      setError(null);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [projectId, projectService]);

  return { project, loading, error };
}

/**
 * useSamples - 샘플 데이터 로드 훅
 */
export function useSamples(projectService, projectId) {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!projectId || !projectService?.getSamples) return;
    try {
      setLoading(true);
      const data = await projectService.getSamples(projectId);
      setSamples(data || []);
      setError(null);
    } catch (err) {
      setError(err);
      console.error('Error loading samples:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, projectService]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { samples, loading, error, reload };
}

/**
 * useMainPhotos - 본보정 사진 데이터 로드 훅
 */
export function useMainPhotos(projectService, projectId) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!projectId || !projectService?.getMainPhotos) return;
    try {
      setLoading(true);
      const data = await projectService.getMainPhotos(projectId);
      setPhotos(data || []);
      setError(null);
    } catch (err) {
      setError(err);
      console.error('Error loading main photos:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, projectService]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { photos, loading, error, reload };
}

/**
 * useRevisionRequests - 재수정 요청 목록 로드 훅
 */
export function useRevisionRequests(projectService, projectId) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!projectId || !projectService?.getRevisionRequests) return;
    try {
      setLoading(true);
      const data = await projectService.getRevisionRequests(projectId);
      setRequests(data || []);
      setError(null);
    } catch (err) {
      setError(err);
      console.error('Error loading revision requests:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, projectService]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { requests, loading, error, reload };
}
