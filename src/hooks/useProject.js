import { useState, useEffect } from 'react';

/**
 * useProject - 프로젝트 데이터를 관리하는 커스텀 훅
 */
export function useProject(projectService, projectId) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectId || !projectService) return;

    const loadProject = async () => {
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
    };

    loadProject();
  }, [projectId, projectService]);

  return { project, loading, error };
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
