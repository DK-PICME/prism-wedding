/**
 * URL 파라미터 추출
 */
export function getUrlParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

/**
 * ISO 문자열을 한국식 날짜 형식으로 변환
 */
export function formatDateKorean(dateString) {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * ISO 문자열을 시간까지 포함한 한국식 형식으로 변환
 */
export function formatDateTimeKorean(dateString) {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const dateStr = date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const timeStr = date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${dateStr} ${timeStr}`;
}

/**
 * 상태 배지 클래스 결정
 */
export function getStatusBadgeStyle(status) {
  const statusMap = {
    '검토중': {
      bgClass: 'bg-neutral-900',
      textClass: 'text-white',
      icon: 'fa-hourglass-half',
    },
    '완료': {
      bgClass: 'bg-green-600',
      textClass: 'text-white',
      icon: 'fa-check-circle',
    },
    '대기': {
      bgClass: 'bg-neutral-200',
      textClass: 'text-neutral-600',
      icon: 'fa-clock',
    },
    '오류': {
      bgClass: 'bg-red-600',
      textClass: 'text-white',
      icon: 'fa-exclamation-circle',
    },
  };

  return statusMap[status] || statusMap['대기'];
}

/**
 * 진행률 계산
 */
export function calculateProgress(currentStep) {
  return Math.min(100, (currentStep / 4) * 100);
}

/**
 * 프로젝트 status 값을 한국어 표시 텍스트로 변환
 */
export function statusToLabel(status) {
  const map = {
    waiting: '대기중',
    sample_review: '샘플 검토중',
    sample_revision: '샘플 재수정중',
    main_upload: '본보정 업로드 가능',
    main_progress: '본보정 진행중',
    main_review: '본보정 결과 확인',
    completed: '완료',
  };
  return map[status] || status;
}

/**
 * 프로젝트 status → currentStep 매핑
 */
export function statusToStep(status) {
  const map = {
    waiting: 0,
    sample_review: 1,
    sample_revision: 1,
    main_upload: 2,
    main_progress: 3,
    main_review: 4,
    completed: 4,
  };
  return map[status] ?? 0;
}
