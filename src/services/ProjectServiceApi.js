import { ProjectService } from './ProjectService.js';
import { db } from '../config/firebase.js';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { nanoid } from 'nanoid';

/**
 * ProjectServiceApi - Firebase Firestore 연동
 * 
 * Project + Photo 데이터를 Firebase Firestore에서 관리합니다.
 * Real-time 리스너 지원 (onSnapshot)
 */
export class ProjectServiceApi extends ProjectService {
  /**
   * 프로젝트 목록 구독 (실시간 리스너)
   */
  onProjectsChanged(userId, callback) {
    try {
      const q = query(
        collection(db, 'projects'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const projects = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          callback(projects);
        },
        (error) => {
          console.error('❌ 프로젝트 리스너 에러:', error);
        }
      );

      console.log('✅ 프로젝트 실시간 리스너 등록');
      return unsubscribe;
    } catch (error) {
      console.error('❌ 프로젝트 리스너 설정 실패:', error);
      throw error;
    }
  }

  /**
   * 프로젝트 생성
   */
  async createProject(userId, projectData) {
    try {
      const projectRef = await addDoc(collection(db, 'projects'), {
        userId,
        name: projectData.name,
        description: projectData.description || '',
        photoCount: 0,
        totalSize: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log(`✅ 프로젝트 생성: ${projectRef.id}`);

      return {
        success: true,
        projectId: projectRef.id,
        message: '프로젝트가 생성되었습니다.',
      };
    } catch (error) {
      console.error('❌ 프로젝트 생성 실패:', error);
      throw new Error(`프로젝트 생성 실패: ${error.message}`);
    }
  }

  /**
   * 프로젝트 조회
   */
  async getProject(projectId, userId) {
    try {
      const projectRef = doc(db, 'projects', projectId);
      const docSnap = await getDocs(query(collection(db, 'projects'), where('id', '==', projectId)));

      if (docSnap.empty) {
        return null;
      }

      const projectDoc = docSnap.docs[0];
      const project = projectDoc.data();

      // 권한 검증
      if (project.userId !== userId) {
        throw new Error('접근 권한이 없습니다.');
      }

      return {
        id: projectDoc.id,
        ...project,
      };
    } catch (error) {
      console.error('❌ 프로젝트 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 프로젝트 수정
   */
  async updateProject(projectId, userId, updates) {
    try {
      // 권한 검증
      const projectRef = doc(db, 'projects', projectId);
      const docSnap = await getDocs(query(
        collection(db, 'projects'),
        where('__name__', '==', projectId)
      ));

      if (docSnap.empty) {
        throw new Error('프로젝트를 찾을 수 없습니다.');
      }

      const project = docSnap.docs[0].data();
      if (project.userId !== userId) {
        throw new Error('접근 권한이 없습니다.');
      }

      // 수정 가능한 필드만 업데이트
      const updateData = {
        updatedAt: serverTimestamp(),
      };

      if (updates.name) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;

      await updateDoc(projectRef, updateData);

      console.log(`✅ 프로젝트 수정: ${projectId}`);

      return {
        success: true,
        message: '프로젝트가 수정되었습니다.',
      };
    } catch (error) {
      console.error('❌ 프로젝트 수정 실패:', error);
      throw error;
    }
  }

  /**
   * 프로젝트 삭제 (하위 Photo도 삭제 - Cascade)
   */
  async deleteProject(projectId, userId) {
    try {
      const batch = writeBatch(db);

      // 프로젝트 조회 및 권한 검증
      const projectRef = doc(db, 'projects', projectId);
      const docSnap = await getDocs(query(
        collection(db, 'projects'),
        where('__name__', '==', projectId)
      ));

      if (docSnap.empty) {
        throw new Error('프로젝트를 찾을 수 없습니다.');
      }

      const project = docSnap.docs[0].data();
      if (project.userId !== userId) {
        throw new Error('접근 권한이 없습니다.');
      }

      // 하위 사진 삭제
      const photosQuery = query(
        collection(db, 'photos'),
        where('projectId', '==', projectId)
      );
      const photosSnap = await getDocs(photosQuery);

      photosSnap.docs.forEach(photoDoc => {
        batch.delete(photoDoc.ref);
      });

      // 프로젝트 삭제
      batch.delete(projectRef);

      await batch.commit();

      console.log(`✅ 프로젝트 삭제: ${projectId} (사진 ${photosSnap.size}개 삭제됨)`);

      return {
        success: true,
        message: '프로젝트가 삭제되었습니다.',
        deletedPhotoCount: photosSnap.size,
      };
    } catch (error) {
      console.error('❌ 프로젝트 삭제 실패:', error);
      throw error;
    }
  }

  /**
   * 프로젝트 통계 업데이트
   */
  async updateProjectStats(projectId, stats) {
    try {
      const projectRef = doc(db, 'projects', projectId);

      await updateDoc(projectRef, {
        photoCount: stats.photoCount || 0,
        totalSize: stats.totalSize || 0,
        updatedAt: serverTimestamp(),
      });

      console.log(`✅ 프로젝트 통계 업데이트: ${projectId}`);

      return {
        success: true,
        message: '프로젝트 통계가 업데이트되었습니다.',
      };
    } catch (error) {
      console.error('❌ 프로젝트 통계 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 사진 목록 구독 (실시간 리스너)
   */
  onPhotosChanged(projectId, userId, callback) {
    try {
      // Firestore Rules를 만족하기 위해 userId 필터 추가 필수
      const q = query(
        collection(db, 'photos'),
        where('projectId', '==', projectId),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const photos = snapshot.docs.map(doc => ({
            docId: doc.id,  // 명시적으로 Firestore docId 저장
            id: doc.id,     // 호환성 유지
            ...doc.data(),
          }));
          callback(photos);
        },
        (error) => {
          console.error('❌ 사진 리스너 에러:', error);
        }
      );

      console.log('✅ 사진 실시간 리스너 등록');
      return unsubscribe;
    } catch (error) {
      console.error('❌ 사진 리스너 설정 실패:', error);
      throw error;
    }
  }

  /**
   * 테스트 데이터 생성 (기존 메서드 호환성)
   */
  generateMockData(overrides = {}) {
    const now = new Date();
    return {
      id: overrides.id || `proj_${nanoid()}`,
      userId: overrides.userId || 'user_001',
      name: overrides.name || '프로젝트',
      description: overrides.description || '',
      photoCount: overrides.photoCount || 0,
      totalSize: overrides.totalSize || 0,
      createdAt: overrides.createdAt || now,
      updatedAt: overrides.updatedAt || now,
    };
  }

  // ─── Order 메서드들 (기존 구현 호환성) ─────────────────────────────────────────

  async getOrders(userId, options = {}) {
    // 기존 Order 조회 로직 (선택적)
    return {
      orders: [],
      total: 0,
      page: options.page || 1,
      limit: options.limit || 10,
      hasMore: false,
    };
  }

  async getOrder(orderId, userId) {
    return null;
  }

  async createOrder(userId, orderData) {
    return {
      success: true,
      orderId: `order_${nanoid()}`,
      projectId: 'proj_001',
      message: '주문이 생성되었습니다.',
    };
  }

  async updateOrder(orderId, userId, updates) {
    return {
      success: true,
      message: '주문이 수정되었습니다.',
    };
  }

  async deleteOrder(orderId, userId) {
    return {
      success: true,
      message: '주문이 삭제되었습니다.',
    };
  }

  async updateOrderStatus(orderId, status, options = {}) {
    return {
      success: true,
      message: '주문 상태가 업데이트되었습니다.',
    };
  }

  async updatePaymentStatus(orderId, paymentStatus, paymentData = {}) {
    return {
      success: true,
      message: '결제 상태가 업데이트되었습니다.',
    };
  }

  async addTimelineItem(orderId, timelineItem) {
    return {
      success: true,
      timelineId: `timeline_${nanoid()}`,
      message: '타임라인이 추가되었습니다.',
    };
  }
}

export default new ProjectServiceApi();
