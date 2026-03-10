import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { nanoid } from 'nanoid';

export class PhotoService {
  /**
   * 사진 문서 생성 (업로드 시작 시)
   * UPLOADING 상태로 Firestore에 생성
   */
  async createPhotoDocument(userId, folderId, fileName, fileSize, fileExt) {
    try {
      const photoId = nanoid();
      const now = serverTimestamp();

      const photoData = {
        id: photoId,
        userId,
        projectId: folderId,  // projectId로 저장 (ProjectServiceApi의 쿼리와 일치)

        // ── 파일 정보 ──
        fileName,
        originalFileName: fileName,  // 원본 파일명 메타 정보
        fileSize,
        fileExt: fileExt.toLowerCase(),
        fileMd5: null, // 나중에 업로드 후 계산

        // ── 상태 ──
        status: 'UPLOADING',

        // ── 주문 연계 ──
        isLocked: false,
        lockedByOrder: null,
        lockExpiry: null,
        usedInOrders: [],

        // ── 업로드 단계 ──
        uploadStartTime: now,
        uploadEndTime: null,
        uploadProgress: 0,
        uploadError: null,
        uploadAttempt: 0,

        // ── 처리 단계 ──
        processStartTime: null,
        processEndTime: null,
        processingError: null,
        processingAttempt: 0,

        // ── 생성된 파일 URL ──
        uploadedUrl: null,
        storagePath: null,  // 저장될 스토리지 경로
        thumbnailUrl: null,
        previewUrl: null,
        webpUrl: null,
        internalBackupUrl: null,

        // ── 이미지 메타데이터 ──
        metadata: null,

        // ── 자동 정리 ──
        autoDeleteScheduledAt: null,

        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, 'photos'), photoData);
      return {
        photoId,
        docId: docRef.id,
        ...photoData,
      };
    } catch (error) {
      console.error('❌ 사진 문서 생성 실패:', error);
      throw new Error(`사진 문서 생성 실패: ${error.message}`);
    }
  }

  /**
   * 사진 업로드 진행률 업데이트
   */
  async updateUploadProgress(photoDocId, progress) {
    try {
      const photoRef = doc(db, 'photos', photoDocId);
      await updateDoc(photoRef, {
        uploadProgress: Math.min(Math.max(progress, 0), 100),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('❌ 진행률 업데이트 실패:', error);
    }
  }

  /**
   * 사진 업로드 성공 처리
   * 상태를 READY로 변경하고 스토리지 경로 저장
   */
  async markUploadCompleted(photoDocId, uploadedUrl, storagePath, fileMd5) {
    try {
      const photoRef = doc(db, 'photos', photoDocId);
      // MVP: Cloud Function 없이 바로 READY로 설정
      // Cloud Function 배포 후에는 UPLOAD_COMPLETED로 변경하고 CF가 READY로 전환
      await updateDoc(photoRef, {
        status: 'READY',
        uploadedUrl,
        storagePath,  // 스토리지 경로 저장
        fileMd5: fileMd5 || null,
        uploadEndTime: serverTimestamp(),
        uploadProgress: 100,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('❌ 업로드 완료 처리 실패:', error);
      throw error;
    }
  }

  /**
   * 사진 업로드 실패 처리
   */
  async markUploadFailed(photoDocId, errorMessage) {
    try {
      const photoRef = doc(db, 'photos', photoDocId);
      await updateDoc(photoRef, {
        status: 'UPLOAD_FAILED',
        uploadError: errorMessage,
        uploadEndTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('❌ 실패 처리 실패:', error);
    }
  }

  /**
   * 특정 폴더의 사진 목록 조회
   */
  async getPhotosByFolder(userId, folderId) {
    try {
      const q = query(
        collection(db, 'photos'),
        where('userId', '==', userId),
        where('projectId', '==', folderId)  // projectId로 쿼리
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('❌ 사진 조회 실패:', error);
      throw new Error(`사진 조회 실패: ${error.message}`);
    }
  }

  /**
   * 사진 삭제
   */
  async deletePhoto(photoDocId) {
    try {
      const photoRef = doc(db, 'photos', photoDocId);
      await deleteDoc(photoRef);
    } catch (error) {
      console.error('❌ 사진 삭제 실패:', error);
      throw new Error(`사진 삭제 실패: ${error.message}`);
    }
  }

  /**
   * 상태별 사진 카운트 조회
   */
  async getPhotoStats(userId, folderId) {
    try {
      const photos = await this.getPhotosByFolder(userId, folderId);

      const stats = {
        total: photos.length,
        ready: photos.filter((p) => p.status === 'READY').length,
        uploading: photos.filter((p) => p.status === 'UPLOADING').length,
        processing: photos.filter((p) => p.status === 'PROCESSING').length,
        failed: photos.filter((p) => p.status === 'UPLOAD_FAILED').length,
        totalSize: photos.reduce((sum, p) => sum + (p.fileSize || 0), 0),
      };

      return stats;
    } catch (error) {
      console.error('❌ 통계 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 상태 문자열을 한글로 변환
   */
  getStatusLabel(status) {
    const labels = {
      UPLOADING: '업로드 중',
      UPLOAD_COMPLETED: '처리 중',
      PROCESSING: '처리 중',
      READY: '준비완료',
      UPLOAD_FAILED: '업로드 실패',
      READONLY: '잠금',
    };
    return labels[status] || status;
  }

  /**
   * 상태별 색상
   */
  getStatusColor(status) {
    const colors = {
      UPLOADING: 'bg-blue-100 text-blue-800',
      UPLOAD_COMPLETED: 'bg-purple-100 text-purple-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      READY: 'bg-green-100 text-green-800',
      UPLOAD_FAILED: 'bg-red-100 text-red-800',
      READONLY: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
}

export default new PhotoService();
