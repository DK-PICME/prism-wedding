import { db } from '../config/firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

/**
 * Cloud Storage 업로드 서비스
 * Firebase Cloud Storage에 파일을 업로드하고 진행률을 반환
 */
export class StorageService {
  constructor() {
    this.storage = getStorage();
  }

  /**
   * 파일을 Cloud Storage에 업로드
   * @param {File} file - 업로드할 파일
   * @param {string} userId - 사용자 ID
   * @param {string} projectId - 프로젝트 ID
   * @param {string} photoId - 사진 ID (nanoid)
   * @param {Function} onProgress - 진행률 콜백 (0-100)
   * @returns {Promise<{url: string, path: string, originalFileName: string, metadata: object}>}
   */
  async uploadPhoto(file, userId, projectId, photoId, onProgress = () => {}) {
    try {
      // 파일 확장자 추출
      const fileExt = file.name.split('.').pop().toLowerCase();

      // 지원되는 형식 확인
      const supportedFormats = ['jpg', 'jpeg', 'png', 'webp'];
      if (!supportedFormats.includes(fileExt)) {
        throw new Error(`지원하지 않는 형식: ${fileExt}`);
      }

      // 파일 크기 확인 (10MB)
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_SIZE) {
        throw new Error(`파일이 너무 큽니다. 최대 10MB까지 가능합니다. (현재: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      }

      // 업로드 경로: user-uploads/{userId}/{projectId}/{photoId}.{ext}
      const filename = `${photoId}.${fileExt}`;
      const storagePath = `user-uploads/${userId}/${projectId}/${filename}`;

      const fileRef = ref(this.storage, storagePath);

      // 진행률 추적과 함께 업로드 시작
      const uploadTask = uploadBytesResumable(fileRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // 진행률 업데이트
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => {
            // 업로드 실패
            console.error('❌ 업로드 실패:', error);
            reject(new Error(`업로드 실패: ${error.message}`));
          },
          async () => {
            // 업로드 완료
            try {
              const downloadUrl = await getDownloadURL(fileRef);

              // 이미지 메타데이터 추출
              const img = new Image();
              const metadata = await new Promise((imgResolve, imgReject) => {
                img.onload = () => {
                  imgResolve({
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    format: fileExt,
                    colorspace: 'RGB', // 실제로는 이미지 분석 필요
                    hasAlpha: fileExt === 'png',
                  });
                };
                img.onerror = () => {
                  imgReject(new Error('이미지 로드 실패'));
                };
                img.src = downloadUrl;
              });

              resolve({
                url: downloadUrl,
                path: storagePath,
                originalFileName: file.name,  // 원본 파일명 반환 (메타로 저장)
                metadata,
              });
            } catch (error) {
              console.error('❌ 다운로드 URL 조회 실패:', error);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('❌ 업로드 준비 실패:', error);
      throw error;
    }
  }

  /**
   * 파일 URL에서 메타데이터 추출
   */
  async extractImageMetadata(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.naturalWidth,
            height: img.naturalHeight,
            format: file.type.split('/')[1] || 'unknown',
            colorspace: 'RGB',
            hasAlpha: file.type === 'image/png',
          });
        };
        img.onerror = () => {
          reject(new Error('이미지 분석 실패'));
        };
        img.src = event.target.result;
      };

      reader.onerror = () => {
        reject(new Error('파일 읽기 실패'));
      };

      reader.readAsDataURL(file);
    });
  }
}

export default new StorageService();
