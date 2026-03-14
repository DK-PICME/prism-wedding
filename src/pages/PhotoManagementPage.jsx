import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrismHeader } from '../components/PrismHeader';
import { useAuth } from '../contexts/AuthContext';
import ProjectServiceApi from '../services/ProjectServiceApi.js';
import PhotoService from '../services/PhotoService.js';
import StorageService from '../services/StorageService.js';
import analyticsService from '../services/AnalyticsService.js';

/**
 * PhotoManagementPage - 사진 관리 페이지
 * 
 * Project 기반 섹션 UI:
 * - 각 Project는 접을 수 있는 섹션
 * - 섹션 헤더: 프로젝트명 + 생성날짜 + 접기/펴기 + 수정/삭제
 * - 사진 그리드 또는 업로드 유도 UI
 * - 사진 선택 체크박스 (READY + !isLocked만)
 * - 하단: 선택 카운트 + 주문 생성 버튼
 */
export const PhotoManagementPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  const projectService = ProjectServiceApi; // Firebase 실제 연동

  // ─── 상태 관리 ─────────────────────────────────────────
  const [projects, setProjects] = useState([]);
  const [photosByProject, setPhotosByProject] = useState({}); // {projectId: [photos]}
  const [expandedProjects, setExpandedProjects] = useState({}); // {projectId: boolean}
  const [selectedPhotoIds, setSelectedPhotoIds] = useState(new Set());
  const [uploadingFiles, setUploadingFiles] = useState({}); // {photoId: progress}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [searchText, setSearchText] = useState(''); // 파일 검색

  // 사진 리스너 구독 관리 (projectId → unsubscribe 함수)
  const photoUnsubscribesRef = useRef({});

  // ─── 초기 로드 ─────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;

    analyticsService.track('photo_management_viewed');
    setLoading(true);
    setError(null);

    // 프로젝트 실시간 리스너 등록
    const unsubProjects = projectService.onProjectsChanged(
      currentUser.uid,
      (newProjects) => {
        setProjects(newProjects);
        setLoading(false);

        // 새 프로젝트 ID 집합
        const newIds = new Set(newProjects.map(p => p.id));

        // 사라진 프로젝트 리스너 해제
        Object.keys(photoUnsubscribesRef.current).forEach(id => {
          if (!newIds.has(id)) {
            photoUnsubscribesRef.current[id]();
            delete photoUnsubscribesRef.current[id];
          }
        });

        // 새 프로젝트에만 리스너 등록 (중복 방지)
        newProjects.forEach(project => {
          if (!photoUnsubscribesRef.current[project.id]) {
            photoUnsubscribesRef.current[project.id] = projectService.onPhotosChanged(
              project.id,
              currentUser.uid,
              (photos) => {
                setPhotosByProject(prev => ({ ...prev, [project.id]: photos }));
              }
            );
          }
        });

        // 기본적으로 모든 프로젝트 펼치기 (새 프로젝트만)
        setExpandedProjects(prev => {
          const next = { ...prev };
          newProjects.forEach(p => {
            if (!(p.id in next)) next[p.id] = true;
          });
          return next;
        });
      }
    );

    // cleanup: 언마운트 시 모든 리스너 해제
    return () => {
      unsubProjects();
      Object.values(photoUnsubscribesRef.current).forEach(unsub => unsub());
      photoUnsubscribesRef.current = {};
    };
  }, [currentUser]);

  // ─── 프로젝트 관리 ─────────────────────────────────────────

  /**
   * 새 프로젝트 생성
   */
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      setError('프로젝트명을 입력해주세요.');
      return;
    }

    try {
      setError(null);
      const result = await projectService.createProject(currentUser.uid, {
        name: newProjectName,
      });

      if (result.success) {
        setNewProjectName('');
        setShowNewProjectDialog(false);
        analyticsService.track('project_created', { name: newProjectName });
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('❌ 프로젝트 생성 실패:', err);
      setError(err.message);
      analyticsService.trackError('project_creation_failed', err.message);
    }
  };

  /**
   * 프로젝트 삭제
   */
  const handleDeleteProject = async (projectId) => {
    const confirmed = window.confirm(
      '이 프로젝트와 모든 사진이 삭제됩니다. 계속하시겠습니까?'
    );
    if (!confirmed) return;

    try {
      setError(null);
      const result = await projectService.deleteProject(projectId, currentUser.uid);

      if (result.success) {
        analyticsService.track('project_deleted', {
          projectId,
          deletedPhotos: result.deletedPhotoCount,
        });
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('❌ 프로젝트 삭제 실패:', err);
      setError(err.message);
    }
  };

  /**
   * 프로젝트 섹션 토글 (접기/펴기)
   */
  const toggleProjectSection = (projectId) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  // ─── 사진 관리 ─────────────────────────────────────────

  /**
   * 파일 선택 처리
   */
  const handleFileSelect = async (files, projectId) => {
    try {
      setError(null);

      for (const file of files) {
        await uploadPhotoFile(file, projectId);
      }
    } catch (err) {
      console.error('❌ 파일 선택 처리 실패:', err);
      setError(err.message);
      analyticsService.trackError('photo_upload_failed', err.message);
    }
  };

  /**
   * 개별 사진 파일 업로드
   */
  const uploadPhotoFile = async (file, projectId) => {
    try {
      // 1. Firestore에 사진 문서 생성
      const photoDoc = await PhotoService.createPhotoDocument(
        currentUser.uid,
        projectId,
        file.name,
        file.size,
        file.name.split('.').pop()
      );

      // Firestore docId를 key로 사용 - PhotoCard의 uploadingFiles[photo.id]와 일치
      const photoKey = photoDoc.docId;
      setUploadingFiles((prev) => ({ ...prev, [photoKey]: 0 }));

      analyticsService.track('photo_upload_started', {
        fileName: file.name,
        fileSize: file.size,
      });

      // 2. Cloud Storage에 파일 업로드
      const uploadResult = await StorageService.uploadPhoto(
        file,
        currentUser.uid,
        projectId,
        photoDoc.photoId,
        (progress) => {
          setUploadingFiles((prev) => ({ ...prev, [photoKey]: progress }));
          if (progress % 20 === 0) {
            PhotoService.updateUploadProgress(photoDoc.docId, progress);
          }
        }
      );

      // 3. 업로드 완료 처리 (originalFileName과 storagePath도 함께 저장)
      await PhotoService.markUploadCompleted(
        photoDoc.docId,
        uploadResult.url,
        uploadResult.path
      );

      setUploadingFiles((prev) => {
        const newState = { ...prev };
        delete newState[photoKey];
        return newState;
      });

      analyticsService.track('photo_upload_completed', {
        fileName: file.name,
      });

      console.log(`✅ 사진 업로드 완료: ${file.name}`);
    } catch (err) {
      console.error(`❌ 사진 업로드 실패: ${file.name}`, err);
      analyticsService.trackError('photo_upload_error', err.message);
      throw err;
    }
  };

  /**
   * 사진 선택 토글
   */
  const togglePhotoSelection = (photoId, status) => {
    // READY 상태만 선택 가능
    if (status !== 'READY') {
      return;
    }

    const newSelected = new Set(selectedPhotoIds);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotoIds(newSelected);

    analyticsService.track('photo_selected', {
      photoId,
      totalSelected: newSelected.size,
    });
  };

  /**
   * 프로젝트 내 사진 전체 선택/해제
   */
  const handleToggleSelectAll = (projectId) => {
    const projectPhotos = photosByProject[projectId] || [];
    const selectablePhotos = projectPhotos.filter(p => p.status === 'READY');
    
    if (selectablePhotos.length === 0) return;

    const allSelected = selectablePhotos.every(p => selectedPhotoIds.has(p.id));
    
    const newSelected = new Set(selectedPhotoIds);
    
    if (allSelected) {
      // 전체 해제
      selectablePhotos.forEach(p => newSelected.delete(p.id));
      analyticsService.track('photos_deselected_all', { projectId, count: selectablePhotos.length });
    } else {
      // 전체 선택
      selectablePhotos.forEach(p => newSelected.add(p.id));
      analyticsService.track('photos_selected_all', { projectId, count: selectablePhotos.length });
    }
    
    setSelectedPhotoIds(newSelected);
  };

  /**
   * 사진 삭제
   */
  const handleDeletePhoto = async (photoId, docId) => {
    const confirmed = window.confirm('이 사진을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      setLoading(true);
      await PhotoService.deletePhoto(docId);
      setSelectedPhotoIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(photoId);
        return newSet;
      });

      analyticsService.track('photo_deleted', { photoId: docId });
      console.log(`✅ 사진 삭제 완료: ${docId}`);
    } catch (err) {
      console.error('❌ 사진 삭제 실패:', err);
      setError(err.message);
      analyticsService.trackError('photo_delete_failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 주문 생성 진행
   */
  const handleCreateOrder = () => {
    if (selectedPhotoIds.size === 0) {
      setError('최소 1개 이상의 사진을 선택해주세요.');
      return;
    }

    analyticsService.track('order_creation_started', {
      photoCount: selectedPhotoIds.size,
    });

    // 선택된 사진 ID를 sessionStorage에 저장 (새로고침 대비)
    const selectedIds = Array.from(selectedPhotoIds);
    sessionStorage.setItem('selectedPhotoIds', JSON.stringify(selectedIds));

    // CreateNewOrderPage로 이동 (선택된 사진 정보 전달)
    navigate('/orders/new', {
      state: {
        selectedPhotoIds: selectedIds,
      },
    });
  };

  // ─── 유틸리티 함수 ─────────────────────────────────────────

  /**
   * 바이트를 MB로 변환
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  };

  /**
   * 날짜 포맷
   */
  const formatDate = (date) => {
    if (!date) return '';
    if (typeof date === 'object' && date.toDate) {
      date = date.toDate();
    }
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).format(date);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-neutral-600">로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  const projectsWithPhotos = projects.map((project) => ({
    ...project,
    photos: photosByProject[project.id] || [],
  }));

  // 검색 필터링: 모든 프로젝트의 사진을 검색
  const filteredProjectsWithPhotos = projectsWithPhotos.map((project) => ({
    ...project,
    photos: project.photos.filter((photo) =>
      (photo.fileName || '').toLowerCase().includes(searchText.toLowerCase())
    ),
  })).filter((project) => project.photos.length > 0 || searchText === ''); // 검색 중이 아니면 모든 프로젝트 표시

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <PrismHeader activeNav="photo-management" />

      <main className="pt-[73px] pb-[89px] flex-1">
        <div className="px-8 py-8">
          <div className="max-w-[1376px] mx-auto">
            {/* 페이지 헤더 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">사진 관리</h1>
              <p className="text-neutral-600">웨딩 사진들을 프로젝트별로 보관하고 관리하세요</p>
            </div>

            {/* 파일 검색 */}
            <div className="mb-8">
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400"></i>
                <input
                  type="text"
                  placeholder="파일 이름으로 검색..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex justify-between items-center">
                <div>
                  <i className="fa-solid fa-circle-exclamation mr-2"></i>
                  {error}
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            )}

            {/* 로딩 상태 */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <i className="fa-solid fa-spinner text-3xl text-neutral-400 mb-4 animate-spin"></i>
                  <p className="text-neutral-600">프로젝트를 로드 중입니다...</p>
                </div>
              </div>
            )}

            {/* 프로젝트 리스트 */}
            {!loading && (
              <>
                {projectsWithPhotos.length === 0 ? (
                  <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
                    <i className="fa-solid fa-inbox text-4xl text-neutral-300 mb-4"></i>
                    <p className="text-neutral-600 mb-6">아직 프로젝트가 없습니다.</p>
                    <button
                      onClick={() => setShowNewProjectDialog(true)}
                      className="px-6 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors"
                    >
                      새 프로젝트 생성
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredProjectsWithPhotos.map((project) => (
                      <ProjectSection
                        key={project.id}
                        project={project}
                        photos={project.photos}
                        isExpanded={expandedProjects[project.id] || false}
                        onToggle={() => toggleProjectSection(project.id)}
                        onDelete={() => handleDeleteProject(project.id)}
                        onFileSelect={(files) => handleFileSelect(files, project.id)}
                        selectedPhotoIds={selectedPhotoIds}
                        uploadingFiles={uploadingFiles}
                        onPhotoSelect={(photoId, status) =>
                          togglePhotoSelection(photoId, status)
                        }
                        onPhotoDelete={(photoId, docId) =>
                          handleDeletePhoto(photoId, docId)
                        }
                        formatFileSize={formatFileSize}
                        onToggleSelectAll={handleToggleSelectAll}
                      />
                    ))}

                    {/* 새 프로젝트 추가 */}
                    <button
                      onClick={() => setShowNewProjectDialog(true)}
                      className="w-full p-6 border-2 border-dashed border-neutral-300 rounded-2xl text-neutral-600 hover:text-neutral-900 hover:border-neutral-400 transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-plus"></i>
                      새 프로젝트 추가
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* 새 프로젝트 다이얼로그 */}
      {showNewProjectDialog && (
        <NewProjectDialog
          projectName={newProjectName}
          onNameChange={setNewProjectName}
          onCreate={handleCreateProject}
          onClose={() => {
            setShowNewProjectDialog(false);
            setNewProjectName('');
          }}
        />
      )}

      {/* 하단 액션 바 (고정) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-8 py-4 z-40">
        <div className="max-w-[1376px] mx-auto flex items-center justify-between">
          <div className="text-sm text-neutral-600">
            선택됨: <span className="font-bold text-neutral-900">{selectedPhotoIds.size}</span>개
          </div>
          <button
            onClick={handleCreateOrder}
            disabled={selectedPhotoIds.size === 0}
            className={`px-6 py-2 rounded-lg transition-colors ${
              selectedPhotoIds.size > 0
                ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            주문 생성
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 프로젝트 섹션 컴포넌트
 */
const ProjectSection = ({
  project,
  photos,
  isExpanded,
  onToggle,
  onDelete,
  onFileSelect,
  selectedPhotoIds,
  uploadingFiles,
  onPhotoSelect,
  onPhotoDelete,
  formatFileSize,
  onToggleSelectAll,
}) => {
  const fileInputRef = useRef(null);
  
  // 선택 가능한 사진 계산 (READY)
  const selectablePhotos = photos.filter(p => p.status === 'READY');
  const allSelected = selectablePhotos.length > 0 && selectablePhotos.every(p => selectedPhotoIds.has(p.id));

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
      {/* 섹션 헤더 */}
      <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onToggle}
            className="text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <i className={`fa-solid fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
          </button>
          <div>
            <h3 className="font-semibold text-neutral-900">{project.name}</h3>
            <p className="text-xs text-neutral-500">
              {new Date(project.createdAt?.seconds ? project.createdAt.seconds * 1000 : project.createdAt).toLocaleDateString('ko-KR')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectablePhotos.length > 0 && (
            <button
              onClick={() => onToggleSelectAll(project.id)}
              className={`p-2 rounded-lg transition-colors ${
                allSelected
                  ? 'text-neutral-900 bg-neutral-200'
                  : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'
              }`}
              title={allSelected ? '전체 해제' : '전체 선택'}
            >
              <i className={`fa-solid ${allSelected ? 'fa-check-square' : 'fa-square'}`}></i>
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            title="삭제"
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>

      {/* 섹션 바디 (접혀있으면 숨김) */}
      {isExpanded && (
        <div 
          className="p-6"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.add('bg-blue-50');
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('bg-blue-50');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('bg-blue-50');
            const files = Array.from(e.dataTransfer?.files || []);
            if (files.length > 0) {
              onFileSelect(files);
            }
          }}
        >
          {photos.length === 0 ? (
            // 비어있을 때 업로드 유도
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                const files = Array.from(e.dataTransfer?.files || []);
                if (files.length > 0) {
                  onFileSelect(files);
                }
              }}
              className="border-2 border-dashed border-neutral-300 rounded-xl p-12 text-center hover:border-neutral-400 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mx-auto mb-4">
                <i className="fa-solid fa-cloud-arrow-up text-neutral-500 text-2xl"></i>
              </div>
              <h4 className="text-lg font-medium text-neutral-900 mb-2">사진을 드래그해서 업로드하세요</h4>
              <p className="text-neutral-600 mb-4">JPG, PNG, WebP 파일을 지원합니다 (최대 10MB)</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-6 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors"
              >
                파일 선택
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) {
                    onFileSelect(files);
                  }
                }}
                className="hidden"
              />
            </div>
          ) : (
            // 사진 그리드
            <>
              <div className="grid grid-cols-6 gap-4">
                {photos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    isSelected={selectedPhotoIds.has(photo.id)}
                    uploadProgress={uploadingFiles[photo.id]}
                    onSelect={onPhotoSelect}
                    onDelete={onPhotoDelete}
                    formatFileSize={formatFileSize}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 사진 카드 컴포넌트
 */
const PhotoCard = ({
  photo,
  isSelected,
  uploadProgress,
  onSelect,
  onDelete,
  formatFileSize,
}) => {
  const canSelect = photo.status === 'READY';

  return (
    <div className="relative group">
      <div className="aspect-square bg-neutral-200 rounded-lg overflow-hidden relative">
        {/* 사진 이미지 */}
        {photo.uploadedUrl ? (
          <img
            src={photo.uploadedUrl}
            alt={photo.fileName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-300 to-neutral-400 flex items-center justify-center">
            <span className="text-neutral-600 text-xs text-center px-2">{photo.fileName}</span>
          </div>
        )}

        {/* 상태 배지 */}
        <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${PhotoService.getStatusColor(photo.status)}`}>
          {PhotoService.getStatusLabel(photo.status)}
        </div>

        {/* 진행률 */}
        {uploadProgress !== undefined && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="text-white text-sm font-bold mb-1">{Math.round(uploadProgress)}%</div>
              <i className="fa-solid fa-spinner text-white text-lg animate-spin"></i>
            </div>
          </div>
        )}

        {/* 체크박스 & 호버 액션 */}
        {canSelect && uploadProgress === undefined && (
          <>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all pointer-events-none"></div>

            <div className="absolute top-2 right-2 z-10 cursor-pointer">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect(photo.id, photo.status);
                }}
                className="w-5 h-5 cursor-pointer"
              />
            </div>

            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onDelete(photo.id, photo.docId)}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                title="삭제"
              >
                <i className="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          </>
        )}
      </div>

      {/* 파일 정보 */}
      <div className="mt-2 text-xs text-neutral-600 truncate" title={photo.fileName}>
        {photo.fileName}
      </div>
      <div className="text-xs text-neutral-500">{formatFileSize(photo.fileSize)}</div>
    </div>
  );
};

/**
 * 새 프로젝트 다이얼로그
 */
const NewProjectDialog = ({ projectName, onNameChange, onCreate, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">새 프로젝트</h2>

        <input
          type="text"
          value={projectName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="프로젝트명을 입력하세요"
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          onKeyPress={(e) => {
            if (e.key === 'Enter') onCreate();
          }}
        />

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onCreate}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            생성
          </button>
        </div>
      </div>
    </div>
  );
};
