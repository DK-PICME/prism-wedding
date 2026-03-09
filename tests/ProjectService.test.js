/**
 * ProjectService 테스트 케이스
 * 
 * Mock 구현으로 로직 검증
 * 나중에 실제 Firebase로 전환 시 같은 테스트로 검증 가능
 */

import { ProjectServiceMock } from '../src/services/ProjectServiceMock.js';

// 테스트 유틸리티
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`❌ 테스트 실패: ${message}`);
  }
  console.log(`✅ ${message}`);
};

const assertEqual = (actual, expected, message) => {
  if (actual !== expected) {
    throw new Error(`❌ 테스트 실패: ${message}\n期待: ${expected}\n実際: ${actual}`);
  }
  console.log(`✅ ${message}`);
};

// Test Suite
class ProjectServiceTests {
  constructor() {
    this.service = new ProjectServiceMock();
    this.userId = 'test_user_001';
  }

  async runAll() {
    console.log('\n🧪 ProjectService 테스트 시작\n');

    try {
      await this.testCreateProject();
      await this.testGetProject();
      await this.testUpdateProject();
      await this.testProjectStats();
      await this.testProjectsListener();
      await this.testPhotosListener();
      await this.testDeleteProject();
      await this.testCascadeDelete();

      console.log('\n🎉 모든 테스트 성공!\n');
    } catch (error) {
      console.error('\n❌ 테스트 실패:\n', error.message);
      console.error('\n스택 트레이스:\n', error.stack);
      process.exit(1);
    }
  }

  async testCreateProject() {
    console.log('\n─────────────────────────────────────');
    console.log('테스트 1: 프로젝트 생성');
    console.log('─────────────────────────────────────');

    const result = await this.service.createProject(this.userId, {
      name: '테스트 프로젝트',
      description: '테스트 설명',
    });

    assert(result.success === true, '프로젝트 생성 성공');
    assert(result.projectId, '프로젝트 ID 생성됨');
    assertEqual(result.message, '프로젝트가 생성되었습니다.', '메시지 확인');

    this.testProjectId = result.projectId;
  }

  async testGetProject() {
    console.log('\n─────────────────────────────────────');
    console.log('테스트 2: 프로젝트 조회');
    console.log('─────────────────────────────────────');

    const project = await this.service.getProject(this.testProjectId, this.userId);

    assert(project !== null, '프로젝트 조회됨');
    assertEqual(project.id, this.testProjectId, '프로젝트 ID 일치');
    assertEqual(project.name, '테스트 프로젝트', '프로젝트 이름 일치');
    assertEqual(project.userId, this.userId, '사용자 ID 일치');
  }

  async testUpdateProject() {
    console.log('\n─────────────────────────────────────');
    console.log('테스트 3: 프로젝트 수정');
    console.log('─────────────────────────────────────');

    const result = await this.service.updateProject(
      this.testProjectId,
      this.userId,
      {
        name: '수정된 프로젝트',
        description: '수정된 설명',
      }
    );

    assert(result.success === true, '프로젝트 수정 성공');

    // 수정 확인
    const updated = await this.service.getProject(this.testProjectId, this.userId);
    assertEqual(updated.name, '수정된 프로젝트', '프로젝트 이름 수정됨');
    assertEqual(updated.description, '수정된 설명', '프로젝트 설명 수정됨');
  }

  async testProjectStats() {
    console.log('\n─────────────────────────────────────');
    console.log('테스트 4: 프로젝트 통계 업데이트');
    console.log('─────────────────────────────────────');

    const result = await this.service.updateProjectStats(this.testProjectId, {
      photoCount: 10,
      totalSize: 50 * 1024 * 1024, // 50MB
    });

    assert(result.success === true, '통계 업데이트 성공');

    // 통계 확인
    const project = await this.service.getProject(this.testProjectId, this.userId);
    assertEqual(project.photoCount, 10, '사진 개수 업데이트됨');
    assertEqual(project.totalSize, 50 * 1024 * 1024, '총 크기 업데이트됨');
  }

  async testProjectsListener() {
    console.log('\n─────────────────────────────────────');
    console.log('테스트 5: 프로젝트 리스너');
    console.log('─────────────────────────────────────');

    return new Promise((resolve) => {
      let callCount = 0;

      const unsubscribe = this.service.onProjectsChanged(this.userId, (projects) => {
        callCount++;
        console.log(`리스너 콜백 ${callCount}번: ${projects.length}개 프로젝트 수신`);

        if (callCount === 1) {
          // 첫 번째 콜백: 기존 데이터
          assert(projects.length > 0, '기존 프로젝트 수신됨');
          assert(
            projects.some(p => p.id === this.testProjectId),
            '생성한 프로젝트 포함됨'
          );

          // 두 번째 콜백을 기다리기 위해 새 프로젝트 생성
          setTimeout(async () => {
            await this.service.createProject(this.userId, {
              name: '리스너 테스트 프로젝트',
            });
          }, 100);
        } else if (callCount === 2) {
          // 두 번째 콜백: 새로 생성된 데이터
          assert(
            projects.some(p => p.name === '리스너 테스트 프로젝트'),
            '새 프로젝트 감지됨'
          );

          // 구독 해제
          unsubscribe();
          resolve();
        }
      });
    });
  }

  async testPhotosListener() {
    console.log('\n─────────────────────────────────────');
    console.log('테스트 6: 사진 리스너');
    console.log('─────────────────────────────────────');

    return new Promise((resolve) => {
      const unsubscribe = this.service.onPhotosChanged('proj_001', (photos) => {
        console.log(`사진 리스너: ${photos.length}개 사진 수신`);
        assert(photos.length > 0, '사진이 수신됨');

        // 첫 번째 사진이 올바른 상태인지 확인
        const firstPhoto = photos[0];
        assert(firstPhoto.projectId === 'proj_001', '프로젝트 ID 일치');
        assert(firstPhoto.status, '상태 필드 존재');
      });

      // 비동기 완료 후 구독 해제
      setTimeout(() => {
        unsubscribe();
        resolve();
      }, 100);
    });
  }

  async testDeleteProject() {
    console.log('\n─────────────────────────────────────');
    console.log('테스트 7: 프로젝트 삭제');
    console.log('─────────────────────────────────────');

    // 삭제할 프로젝트 생성
    const created = await this.service.createProject(this.userId, {
      name: '삭제할 프로젝트',
    });

    const projectId = created.projectId;

    // 삭제
    const result = await this.service.deleteProject(projectId, this.userId);
    assert(result.success === true, '프로젝트 삭제 성공');

    // 삭제 확인
    const deleted = await this.service.getProject(projectId, this.userId);
    assert(deleted === null, '프로젝트가 삭제됨');
  }

  async testCascadeDelete() {
    console.log('\n─────────────────────────────────────');
    console.log('테스트 8: Cascade 삭제 (프로젝트 + 사진)');
    console.log('─────────────────────────────────────');

    // proj_003 삭제 (사진 1개 포함)
    const result = await this.service.deleteProject('proj_003', 'user_001');

    assert(result.success === true, '프로젝트 삭제 성공');
    assert(result.deletedPhotoCount > 0, '하위 사진도 삭제됨');
    assertEqual(result.deletedPhotoCount, 1, '정확히 1개 사진 삭제됨');

    // 프로젝트 삭제 확인
    const deleted = await this.service.getProject('proj_003', 'user_001');
    assert(deleted === null, '프로젝트가 삭제됨');
  }
}

// 테스트 실행
const tests = new ProjectServiceTests();
tests.runAll().catch(error => {
  console.error('테스트 실행 실패:', error);
  process.exit(1);
});
