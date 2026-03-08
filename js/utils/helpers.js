/**
 * 유틸리티 함수들
 */

/**
 * URL 파라미터 추출
 * @param {string} param - 파라미터 이름
 * @returns {string|null} 파라미터 값 또는 null
 */
function getUrlParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

/**
 * ISO 문자열을 한국식 날짜 형식으로 변환
 * @param {string|Date} dateString - ISO 날짜 문자열 또는 Date 객체
 * @returns {string} 한국식 날짜 (예: 2025년 01월 23일)
 */
function formatDateKorean(dateString) {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * ISO 문자열을 시간까지 포함한 한국식 형식으로 변환
 * @param {string|Date} dateString - ISO 날짜 문자열
 * @returns {string} 한국식 날짜시간 (예: 2025년 01월 22일 16:30)
 */
function formatDateTimeKorean(dateString) {
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
 * @param {string} status - 상태값
 * @returns {Object} {bgClass, textClass, icon}
 */
function getStatusBadgeStyle(status) {
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
 * @param {number} currentStep - 현재 단계 (1-4)
 * @returns {number} 진행률 (0-100)
 */
function calculateProgress(currentStep) {
  return Math.min(100, (currentStep / 4) * 100);
}

/**
 * DOM 요소 업데이트
 * @param {string} selector - CSS 셀렉터
 * @param {string} content - 업데이트할 내용
 * @param {string} type - 업데이트 타입 ('text', 'html', 'attr' 등)
 * @param {string} attrName - type이 'attr'일 때 속성 이름
 */
function updateElement(selector, content, type = 'text', attrName = null) {
  const element = document.querySelector(selector);
  if (element) {
    if (type === 'text') {
      element.textContent = content;
    } else if (type === 'html') {
      element.innerHTML = content;
    } else if (type === 'attr') {
      element.setAttribute(attrName, content);
    } else if (type === 'class') {
      element.className = content;
    }
  }
}

/**
 * 에러 핸들링 및 사용자 메시지 표시
 * @param {string} message - 사용자에게 보여줄 메시지
 * @param {Error} error - 에러 객체 (콘솔 로깅용)
 */
function showError(message, error = null) {
  if (error) {
    console.error('Error:', error);
  }
  alert(message);
}

/**
 * 로딩 상태 토글
 * @param {boolean} isLoading - 로딩 중 여부
 * @param {string} selector - 로딩 표시 요소 셀렉터
 */
function setLoading(isLoading, selector = '#loading') {
  const element = document.querySelector(selector);
  if (element) {
    element.style.display = isLoading ? 'block' : 'none';
  }
}

// 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getUrlParam,
    formatDateKorean,
    formatDateTimeKorean,
    getStatusBadgeStyle,
    calculateProgress,
    updateElement,
    showError,
    setLoading,
  };
}
