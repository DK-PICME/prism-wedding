const { onRequest } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const express = require('express');
const cors = require('cors');

initializeApp();
const db = getFirestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ─── 유틸 ────────────────────────────────────────────────────────────────────

/**
 * Firestore Timestamp → ISO 문자열 변환 (재귀적으로 처리)
 */
function serializeDoc(data) {
  if (!data) return data;
  const result = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      result[key] = value.toDate().toISOString();
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = serializeDoc(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function sendError(res, status, message) {
  return res.status(status).json({ success: false, error: message });
}

// ─── 프로젝트 조회 ────────────────────────────────────────────────────────────

/**
 * GET /api/projects/:projectId
 * 프로젝트 기본 정보 조회
 */
app.get('/projects/:projectId', async (req, res) => {
  const { projectId } = req.params;
  try {
    const doc = await db.collection('projects').doc(projectId).get();
    if (!doc.exists) {
      return sendError(res, 404, '프로젝트를 찾을 수 없습니다.');
    }
    return res.json({ success: true, data: { id: doc.id, ...serializeDoc(doc.data()) } });
  } catch (err) {
    console.error('getProject error:', err);
    return sendError(res, 500, '서버 오류가 발생했습니다.');
  }
});

// ─── 샘플 ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/projects/:projectId/samples
 * 샘플 파일 목록 조회
 */
app.get('/projects/:projectId/samples', async (req, res) => {
  const { projectId } = req.params;
  try {
    const snapshot = await db
      .collection('projects')
      .doc(projectId)
      .collection('samples')
      .orderBy('uploadedAt', 'desc')
      .get();

    const samples = snapshot.docs.map((d) => ({ id: d.id, ...serializeDoc(d.data()) }));
    return res.json({ success: true, data: samples });
  } catch (err) {
    console.error('getSamples error:', err);
    return sendError(res, 500, '서버 오류가 발생했습니다.');
  }
});

/**
 * POST /api/projects/:projectId/samples
 * 샘플 업로드 (파일 URL + 요청사항 저장)
 * Body: { fileName, fileUrl, revisionRequest }
 */
app.post('/projects/:projectId/samples', async (req, res) => {
  const { projectId } = req.params;
  const { fileName, fileUrl, revisionRequest } = req.body;

  if (!fileName || !fileUrl) {
    return sendError(res, 400, 'fileName과 fileUrl은 필수입니다.');
  }

  try {
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists) {
      return sendError(res, 404, '프로젝트를 찾을 수 없습니다.');
    }

    const sampleData = {
      fileName,
      fileUrl,
      revisionRequest: revisionRequest || '',
      resultUrl: null,
      uploadedAt: FieldValue.serverTimestamp(),
    };

    const sampleRef = await projectRef.collection('samples').add(sampleData);

    await projectRef.update({
      status: 'sample_review',
      currentStep: 1,
      uploadDate: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      success: true,
      data: { id: sampleRef.id, ...sampleData },
    });
  } catch (err) {
    console.error('createSample error:', err);
    return sendError(res, 500, '서버 오류가 발생했습니다.');
  }
});

// ─── 재수정 요청 ──────────────────────────────────────────────────────────────

/**
 * GET /api/projects/:projectId/revision-requests
 * 재수정 요청 목록 조회
 */
app.get('/projects/:projectId/revision-requests', async (req, res) => {
  const { projectId } = req.params;
  try {
    const snapshot = await db
      .collection('projects')
      .doc(projectId)
      .collection('revisionRequests')
      .orderBy('createdAt', 'desc')
      .get();

    const requests = snapshot.docs.map((d) => ({ id: d.id, ...serializeDoc(d.data()) }));
    return res.json({ success: true, data: requests });
  } catch (err) {
    console.error('getRevisionRequests error:', err);
    return sendError(res, 500, '서버 오류가 발생했습니다.');
  }
});

/**
 * POST /api/projects/:projectId/revision-requests
 * 샘플 재수정 요청 등록
 * Body: { message }
 */
app.post('/projects/:projectId/revision-requests', async (req, res) => {
  const { projectId } = req.params;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return sendError(res, 400, '재수정 요청 내용을 입력해주세요.');
  }

  try {
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists) {
      return sendError(res, 404, '프로젝트를 찾을 수 없습니다.');
    }

    const requestData = {
      message: message.trim(),
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
    };

    const requestRef = await projectRef.collection('revisionRequests').add(requestData);

    await projectRef.update({
      status: 'sample_revision',
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      success: true,
      data: { id: requestRef.id, ...requestData },
    });
  } catch (err) {
    console.error('createRevisionRequest error:', err);
    return sendError(res, 500, '서버 오류가 발생했습니다.');
  }
});

// ─── 본보정 사진 ──────────────────────────────────────────────────────────────

/**
 * GET /api/projects/:projectId/main-photos
 * 본보정 사진 목록 조회
 */
app.get('/projects/:projectId/main-photos', async (req, res) => {
  const { projectId } = req.params;
  try {
    const snapshot = await db
      .collection('projects')
      .doc(projectId)
      .collection('mainPhotos')
      .orderBy('uploadedAt', 'asc')
      .get();

    const photos = snapshot.docs.map((d) => ({ id: d.id, ...serializeDoc(d.data()) }));
    return res.json({ success: true, data: photos });
  } catch (err) {
    console.error('getMainPhotos error:', err);
    return sendError(res, 500, '서버 오류가 발생했습니다.');
  }
});

/**
 * POST /api/projects/:projectId/main-photos
 * 본보정 사진 업로드
 * Body: { photos: [{ fileName, fileUrl, revisionRequest }], commonRequest }
 */
app.post('/projects/:projectId/main-photos', async (req, res) => {
  const { projectId } = req.params;
  const { photos, commonRequest } = req.body;

  if (!photos || !Array.isArray(photos) || photos.length === 0) {
    return sendError(res, 400, '업로드할 사진 정보가 없습니다.');
  }

  try {
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists) {
      return sendError(res, 404, '프로젝트를 찾을 수 없습니다.');
    }

    const batch = db.batch();
    const createdPhotos = [];

    for (const photo of photos) {
      if (!photo.fileName || !photo.fileUrl) {
        return sendError(res, 400, '각 사진에 fileName과 fileUrl이 필요합니다.');
      }
      const photoRef = projectRef.collection('mainPhotos').doc();
      const photoData = {
        fileName: photo.fileName,
        fileUrl: photo.fileUrl,
        revisionRequest: photo.revisionRequest || commonRequest || '',
        resultUrl: null,
        uploadedAt: FieldValue.serverTimestamp(),
      };
      batch.set(photoRef, photoData);
      createdPhotos.push({ id: photoRef.id, ...photoData });
    }

    batch.update(projectRef, {
      status: 'main_progress',
      currentStep: 3,
      commonRequest: commonRequest || '',
      updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return res.status(201).json({ success: true, data: createdPhotos });
  } catch (err) {
    console.error('createMainPhotos error:', err);
    return sendError(res, 500, '서버 오류가 발생했습니다.');
  }
});

// ─── 상태 업데이트 (관리자용) ──────────────────────────────────────────────────

/**
 * PATCH /api/projects/:projectId/status
 * 프로젝트 상태 업데이트 (관리자 전용)
 * Body: { status, currentStep }
 * 
 * 유효한 status 값:
 *   waiting → sample_review → sample_revision → main_upload
 *   → main_progress → main_review → completed
 */
const VALID_STATUSES = [
  'waiting',
  'sample_review',
  'sample_revision',
  'main_upload',
  'main_progress',
  'main_review',
  'completed',
];

app.patch('/projects/:projectId/status', async (req, res) => {
  const { projectId } = req.params;
  const { status, currentStep } = req.body;

  if (!status) {
    return sendError(res, 400, 'status 필드가 필요합니다.');
  }
  if (!VALID_STATUSES.includes(status)) {
    return sendError(res, 400, `유효하지 않은 status 값입니다. 허용값: ${VALID_STATUSES.join(', ')}`);
  }

  try {
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists) {
      return sendError(res, 404, '프로젝트를 찾을 수 없습니다.');
    }

    const updates = {
      status,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (currentStep !== undefined) {
      updates.currentStep = currentStep;
    }

    if (status === 'completed') {
      updates.completedAt = FieldValue.serverTimestamp();
    }

    await projectRef.update(updates);

    const updated = await projectRef.get();
    return res.json({ success: true, data: { id: updated.id, ...serializeDoc(updated.data()) } });
  } catch (err) {
    console.error('updateStatus error:', err);
    return sendError(res, 500, '서버 오류가 발생했습니다.');
  }
});

// ─── 샘플 만족 확인 (본보정 단계 진입) ────────────────────────────────────────

/**
 * POST /api/projects/:projectId/sample-approve
 * 샘플 결과 만족 확인 → 본보정 업로드 단계로 전환
 */
app.post('/projects/:projectId/sample-approve', async (req, res) => {
  const { projectId } = req.params;
  try {
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists) {
      return sendError(res, 404, '프로젝트를 찾을 수 없습니다.');
    }

    await projectRef.update({
      status: 'main_upload',
      currentStep: 3,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.json({ success: true, message: '샘플 승인 완료. 본보정 업로드 단계로 전환되었습니다.' });
  } catch (err) {
    console.error('sampleApprove error:', err);
    return sendError(res, 500, '서버 오류가 발생했습니다.');
  }
});

/**
 * POST /api/projects/:projectId/main-approve
 * 본보정 결과 만족 확인 → 완료 단계로 전환
 */
app.post('/projects/:projectId/main-approve', async (req, res) => {
  const { projectId } = req.params;
  try {
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists) {
      return sendError(res, 404, '프로젝트를 찾을 수 없습니다.');
    }

    await projectRef.update({
      status: 'completed',
      currentStep: 4,
      completedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.json({ success: true, message: '본보정 승인 완료. 프로젝트가 완료되었습니다.' });
  } catch (err) {
    console.error('mainApprove error:', err);
    return sendError(res, 500, '서버 오류가 발생했습니다.');
  }
});

// ─── 헬스체크 ─────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Prism Wedding API is running', timestamp: new Date().toISOString() });
});

// ─── Firebase Functions export ────────────────────────────────────────────────

exports.api = onRequest({ region: 'us-central1' }, app);
