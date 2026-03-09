import { useState, useEffect, useRef } from 'react';
import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';
import { useAuth } from '../contexts/AuthContext';
import PhotoService from '../services/PhotoService';
import StorageService from '../services/StorageService';
import analyticsService from '../services/AnalyticsService';

export const PhotoManagementPage = () => {
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // 상태 관리
  const [folderId] = useState('default-folder'); // 나중에 폴더 선택 기능 추가 가능
  const [photos, setPhotos] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    ready: 0,
    uploading: 0,
    processing: 0,
    failed: 0,
    totalSize: 0,
  });
  const [loading, setLoading] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState({}); // {photoDocId: progress}
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [error, setError] = useState(null);

  // 초기 로드
  useEffect(() => {
    if (currentUser) {
      loadPhotos();
      analyticsService.track('photo_management_viewed');
    }
  }, [currentUser]);

  /**
   * 사진 목록 로드
   */
  const loadPhotos = async () => {
    try {
      setLoading(true);
      setError(null);

      const photos = await PhotoService.getPhotosByFolder(currentUser.uid, folderId);
      const photoStats = await PhotoService.getPhotoStats(currentUser.uid, folderId);

      setPhotos(photos);
      setStats(photoStats);
    } catch (err) {
      console.error('❌ 사진 로드 실패:', err);
      setError(err.message);
      analyticsService.trackError('photo_load_failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 드래그 오버 처리
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.add('border-neutral-500', 'bg-neutral-50');
  };

  /**
   * 드래그 리브 처리
   */
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove('border-neutral-500', 'bg-neutral-50');
  };

  /**
   * 드래그 드롭 처리
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove('border-neutral-500', 'bg-neutral-50');

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  /**
   * 파일 입력 처리
   */
  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  /**
   * 파일 선택 처리 (드래그/입력 공통)
   */
  const handleFileSelect = async (files) => {
    try {
      setError(null);

      for (const file of files) {
        await uploadPhotoFile(file);
      }

      // 업로드 완료 후 목록 새로고침
      setTimeout(() => {
        loadPhotos();
      }, 1000);
    } catch (err) {
      console.error('❌ 파일 선택 처리 실패:', err);
      setError(err.message);
      analyticsService.trackError('photo_upload_failed', err.message);
    }
  };

  /**
   * 개별 사진 파일 업로드
   */
  const uploadPhotoFile = async (file) => {
    try {
      // 1. Firestore에 사진 문서 생성 (UPLOADING 상태)
      const photoDoc = await PhotoService.createPhotoDocument(
        currentUser.uid,
        folderId,
        file.name,
        file.size,
        file.name.split('.').pop()
      );

      setUploadingFiles((prev) => ({
        ...prev,
        [photoDoc.docId]: 0,
      }));

      analyticsService.track('photo_upload_started', {
        fileName: file.name,
        fileSize: file.size,
      });

      // 2. Cloud Storage에 파일 업로드
      const uploadResult = await StorageService.uploadPhoto(
        file,
        currentUser.uid,
        (progress) => {
          setUploadingFiles((prev) => ({
            ...prev,
            [photoDoc.docId]: progress,
          }));

          // 진행률 Firestore 업데이트 (선택사항: 너무 자주 업데이트하면 비용 증가)
          if (progress % 20 === 0) {
            PhotoService.updateUploadProgress(photoDoc.docId, progress);
          }
        }
      );

      // 3. 업로드 완료 처리
      await PhotoService.markUploadCompleted(
        photoDoc.docId,
        uploadResult.url
      );

      // 4. 업로드 상태 제거
      setUploadingFiles((prev) => {
        const newState = { ...prev };
        delete newState[photoDoc.docId];
        return newState;
      });

      analyticsService.track('photo_upload_completed', {
        fileName: file.name,
        fileSize: file.size,
      });

      console.log(`✅ 사진 업로드 완료: ${file.name}`);
    } catch (err) {
      console.error(`❌ 사진 업로드 실패: ${file.name}`, err);

      // 실패 처리 (이미 생성된 경우)
      if (uploadingFiles[file.name]) {
        // TODO: photoDocId로 실패 표시
      }

      analyticsService.trackError('photo_upload_error', err.message);
      throw err;
    }
  };

  /**
   * 사진 삭제
   */
  const handleDeletePhoto = async (photoId, photoDocId) => {
    try {
      const confirmed = window.confirm('이 사진을 삭제하시겠습니까?');
      if (!confirmed) return;

      setLoading(true);
      await PhotoService.deletePhoto(photoDocId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoDocId));

      analyticsService.track('photo_deleted', {
        photoId: photoDocId,
      });

      console.log(`✅ 사진 삭제 완료: ${photoDocId}`);
    } catch (err) {
      console.error('❌ 사진 삭제 실패:', err);
      setError(err.message);
      analyticsService.trackError('photo_delete_failed', err.message);
    } finally {
      setLoading(false);
    }
  };

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

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-neutral-600">로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PrismHeader activeNav="photo-management" />

      <main className="pt-[73px]">
        <div className="px-8 py-8">
          <div className="max-w-[1376px] mx-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl text-neutral-900 mb-2">사진 관리</h1>
                <p className="text-neutral-600">웨딩 사진들을 보관하고 관리하세요</p>
              </div>

              <div className="flex items-center gap-4">
                <a
                  href="/create-new-order"
                  className="flex items-center gap-2 px-4 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors text-sm cursor-pointer"
                >
                  <i className="fa-solid fa-plus"></i>
                  새 주문 만들기
                </a>
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <i className="fa-solid fa-circle-exclamation mr-2"></i>
                {error}
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            )}

            {/* 통계 카드 */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              {[
                { label: '총 사진', count: stats.total, icon: 'fa-images', color: 'neutral' },
                { label: '준비완료', count: stats.ready, icon: 'fa-check-circle', color: 'green' },
                { label: '업로드 중', count: stats.uploading, icon: 'fa-spinner', color: 'blue' },
                { label: '처리 중', count: stats.processing, icon: 'fa-cog', color: 'purple' },
                { label: '실패', count: stats.failed, icon: 'fa-circle-xmark', color: 'red' },
              ].map((stat, idx) => {
                const colorClasses = {
                  neutral: 'bg-neutral-50 text-neutral-900',
                  green: 'bg-green-50 text-green-700',
                  blue: 'bg-blue-50 text-blue-700',
                  purple: 'bg-purple-50 text-purple-700',
                  red: 'bg-red-50 text-red-700',
                };
                return (
                  <div key={idx} className={`border border-neutral-200 rounded-xl p-4 ${colorClasses[stat.color]}`}>
                    <div className="flex items-center gap-3">
                      <i className={`fa-solid ${stat.icon} text-xl`}></i>
                      <div>
                        <div className="text-2xl font-bold">{stat.count}</div>
                        <div className="text-xs opacity-75">{stat.label}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 사진 목록 */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
              {/* 도구모음 */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl text-neutral-900">사진 목록</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'border border-neutral-300 bg-neutral-900 text-white'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <i className="fa-solid fa-grip"></i>
                    그리드
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'border border-neutral-300 bg-neutral-900 text-white'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <i className="fa-solid fa-list"></i>
                    목록
                  </button>
                </div>
              </div>

              {/* 드래그 드롭 영역 */}
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="border-2 border-dashed border-neutral-300 rounded-xl p-12 text-center mb-6 hover:border-neutral-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mx-auto mb-4">
                  <i className="fa-solid fa-cloud-arrow-up text-neutral-500 text-2xl"></i>
                </div>
                <h3 className="text-lg text-neutral-900 mb-2">사진을 드래그해서 업로드하세요</h3>
                <p className="text-neutral-600 mb-4">JPG, PNG, WebP 파일을 지원합니다 (최대 10MB)</p>
                <button className="px-6 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors">
                  파일 선택
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              {/* 로딩 상태 */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <i className="fa-solid fa-spinner text-2xl text-neutral-400 mb-2 animate-spin"></i>
                    <p className="text-neutral-600">사진을 로드 중입니다...</p>
                  </div>
                </div>
              )}

              {/* 사진 없음 상태 */}
              {!loading && photos.length === 0 && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <i className="fa-solid fa-image text-4xl text-neutral-300 mb-2"></i>
                    <p className="text-neutral-600">아직 업로드된 사진이 없습니다.</p>
                  </div>
                </div>
              )}

              {/* 그리드 뷰 */}
              {!loading && photos.length > 0 && viewMode === 'grid' && (
                <div className="grid grid-cols-6 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <div className="aspect-square bg-neutral-200 rounded-lg overflow-hidden">
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
                        {uploadingFiles[photo.id] !== undefined && (
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg">
                            <div className="text-center">
                              <div className="text-white text-sm font-bold mb-1">{Math.round(uploadingFiles[photo.id])}%</div>
                              <i className="fa-solid fa-spinner text-white text-lg animate-spin"></i>
                            </div>
                          </div>
                        )}

                        {/* 호버 액션 */}
                        {photo.status === 'READY' && !uploadingFiles[photo.id] && (
                          <>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all"></div>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <button
                                onClick={() => handleDeletePhoto(photo.id, photo.id)}
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
                  ))}
                </div>
              )}

              {/* 목록 뷰 */}
              {!loading && photos.length > 0 && viewMode === 'list' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-neutral-200">
                      <tr>
                        <th className="text-left py-3 px-4 text-neutral-700 font-medium">파일명</th>
                        <th className="text-left py-3 px-4 text-neutral-700 font-medium">크기</th>
                        <th className="text-left py-3 px-4 text-neutral-700 font-medium">상태</th>
                        <th className="text-left py-3 px-4 text-neutral-700 font-medium">업로드</th>
                        <th className="text-left py-3 px-4 text-neutral-700 font-medium">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {photos.map((photo) => (
                        <tr key={photo.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="py-3 px-4 text-neutral-900 truncate">{photo.fileName}</td>
                          <td className="py-3 px-4 text-neutral-600">{formatFileSize(photo.fileSize)}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${PhotoService.getStatusColor(photo.status)}`}>
                              {PhotoService.getStatusLabel(photo.status)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {uploadingFiles[photo.id] !== undefined ? (
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-neutral-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 transition-all"
                                    style={{ width: `${uploadingFiles[photo.id]}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-neutral-600">{Math.round(uploadingFiles[photo.id])}%</span>
                              </div>
                            ) : (
                              <span className="text-neutral-500">완료</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {photo.status === 'READY' && !uploadingFiles[photo.id] && (
                              <button
                                onClick={() => handleDeletePhoto(photo.id, photo.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="삭제"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <PrismFooter />
    </div>
  );
};
