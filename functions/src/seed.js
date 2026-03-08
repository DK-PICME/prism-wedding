/**
 * Firestore 테스트 데이터 시딩 스크립트
 * 
 * 실행: node functions/src/seed.js
 * (Firebase 에뮬레이터가 실행 중이어야 합니다)
 * 
 * 프로덕션 시딩: FIRESTORE_EMULATOR_HOST 환경변수 제거 후 실행
 */

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

initializeApp({ projectId: 'prism-wedding-84b5d' });
const db = getFirestore();

const now = new Date();
const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
const daysLater = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

const projects = [
  {
    id: 'proj_001',
    data: {
      clientName: '김지수',
      status: 'sample_review',
      currentStep: 1,
      uploadDate: Timestamp.fromDate(daysAgo(1)),
      dueDate: Timestamp.fromDate(daysLater(14)),
      createdAt: Timestamp.fromDate(daysAgo(1)),
      updatedAt: Timestamp.fromDate(daysAgo(0)),
    },
    samples: [
      {
        id: 'sample_001',
        fileUrl: 'https://picsum.photos/seed/before1/800/600',
        resultUrl: 'https://picsum.photos/seed/after1/800/600',
        fileName: 'sample_portrait.jpg',
        revisionRequest: '얼굴톤 자연스럽게 보정, 턱선 과하지 않게 다듬기, 자연스러운 느낌 유지',
        uploadedAt: Timestamp.fromDate(daysAgo(1)),
      },
    ],
    revisionRequests: [],
    mainPhotos: [],
  },
  {
    id: 'proj_002',
    data: {
      clientName: '박민준',
      status: 'main_review',
      currentStep: 4,
      uploadDate: Timestamp.fromDate(daysAgo(10)),
      dueDate: Timestamp.fromDate(daysLater(5)),
      createdAt: Timestamp.fromDate(daysAgo(10)),
      updatedAt: Timestamp.fromDate(daysAgo(1)),
    },
    samples: [
      {
        id: 'sample_001',
        fileUrl: 'https://picsum.photos/seed/before2/800/600',
        resultUrl: 'https://picsum.photos/seed/after2/800/600',
        fileName: 'sample_portrait.jpg',
        revisionRequest: '피부 보정, 밝기 조정',
        uploadedAt: Timestamp.fromDate(daysAgo(9)),
      },
    ],
    revisionRequests: [],
    mainPhotos: [
      {
        id: 'photo_001',
        fileUrl: 'https://picsum.photos/seed/main1a/800/600',
        resultUrl: 'https://picsum.photos/seed/main1b/800/600',
        fileName: 'portrait_001.jpg',
        revisionRequest: '얼굴톤 자연스럽게, 피부 잡티 제거, 전체적인 밝기 조정',
        uploadedAt: Timestamp.fromDate(daysAgo(5)),
      },
      {
        id: 'photo_002',
        fileUrl: 'https://picsum.photos/seed/main2a/800/600',
        resultUrl: 'https://picsum.photos/seed/main2b/800/600',
        fileName: 'portrait_002.jpg',
        revisionRequest: '배경 흐림 효과, 인물 선명도 향상, 색감 보정',
        uploadedAt: Timestamp.fromDate(daysAgo(5)),
      },
      {
        id: 'photo_003',
        fileUrl: 'https://picsum.photos/seed/main3a/800/600',
        resultUrl: 'https://picsum.photos/seed/main3b/800/600',
        fileName: 'portrait_003.jpg',
        revisionRequest: '전체적인 노출 조정, 그림자 부분 밝게, 하이라이트 조정',
        uploadedAt: Timestamp.fromDate(daysAgo(5)),
      },
    ],
  },
  {
    id: 'proj_003',
    data: {
      clientName: '이서연',
      status: 'waiting',
      currentStep: 0,
      uploadDate: null,
      dueDate: Timestamp.fromDate(daysLater(20)),
      createdAt: Timestamp.fromDate(daysAgo(0)),
      updatedAt: Timestamp.fromDate(daysAgo(0)),
    },
    samples: [],
    revisionRequests: [],
    mainPhotos: [],
  },
  {
    id: 'proj_004',
    data: {
      clientName: '최현우',
      status: 'main_progress',
      currentStep: 3,
      uploadDate: Timestamp.fromDate(daysAgo(7)),
      dueDate: Timestamp.fromDate(daysLater(3)),
      createdAt: Timestamp.fromDate(daysAgo(7)),
      updatedAt: Timestamp.fromDate(daysAgo(2)),
    },
    samples: [
      {
        id: 'sample_001',
        fileUrl: 'https://picsum.photos/seed/before4/800/600',
        resultUrl: 'https://picsum.photos/seed/after4/800/600',
        fileName: 'sample_portrait.jpg',
        revisionRequest: '자연스러운 피부 보정',
        uploadedAt: Timestamp.fromDate(daysAgo(6)),
      },
    ],
    revisionRequests: [],
    mainPhotos: [
      {
        id: 'photo_001',
        fileUrl: 'https://picsum.photos/seed/main4a/800/600',
        resultUrl: null,
        fileName: 'portrait_001.jpg',
        revisionRequest: '전체적으로 자연스러운 톤으로 보정',
        uploadedAt: Timestamp.fromDate(daysAgo(2)),
      },
    ],
  },
  {
    id: 'proj_005',
    data: {
      clientName: '정수아',
      status: 'completed',
      currentStep: 4,
      uploadDate: Timestamp.fromDate(daysAgo(20)),
      dueDate: Timestamp.fromDate(daysAgo(5)),
      completedAt: Timestamp.fromDate(daysAgo(5)),
      createdAt: Timestamp.fromDate(daysAgo(20)),
      updatedAt: Timestamp.fromDate(daysAgo(5)),
    },
    samples: [],
    revisionRequests: [],
    mainPhotos: [
      {
        id: 'photo_001',
        fileUrl: 'https://picsum.photos/seed/done1a/800/600',
        resultUrl: 'https://picsum.photos/seed/done1b/800/600',
        fileName: 'portrait_001.jpg',
        revisionRequest: '자연스러운 피부 보정',
        uploadedAt: Timestamp.fromDate(daysAgo(12)),
      },
      {
        id: 'photo_002',
        fileUrl: 'https://picsum.photos/seed/done2a/800/600',
        resultUrl: 'https://picsum.photos/seed/done2b/800/600',
        fileName: 'portrait_002.jpg',
        revisionRequest: '밝기 조정',
        uploadedAt: Timestamp.fromDate(daysAgo(12)),
      },
    ],
  },
];

async function seed() {
  console.log('시딩 시작...');

  for (const project of projects) {
    const projectRef = db.collection('projects').doc(project.id);
    await projectRef.set(project.data);
    console.log(`  프로젝트 생성: ${project.id} (${project.data.clientName})`);

    for (const sample of project.samples || []) {
      await projectRef.collection('samples').doc(sample.id).set(sample);
    }

    for (const request of project.revisionRequests || []) {
      await projectRef.collection('revisionRequests').doc(request.id).set(request);
    }

    for (const photo of project.mainPhotos || []) {
      await projectRef.collection('mainPhotos').doc(photo.id).set(photo);
    }
  }

  console.log('시딩 완료!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('시딩 실패:', err);
  process.exit(1);
});
