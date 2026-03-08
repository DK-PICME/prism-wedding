/**
 * LoadingSpinner - 데이터 로딩 중 표시
 */
export function LoadingSpinner({ message = '불러오는 중...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-10 h-10 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mb-4"></div>
      <p className="text-neutral-500 text-sm">{message}</p>
    </div>
  );
}

/**
 * ErrorMessage - 에러 표시
 */
export function ErrorMessage({ message = '데이터를 불러올 수 없습니다.', onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <i className="fa-solid fa-exclamation-circle text-red-500 text-3xl mb-3"></i>
      <p className="text-red-700 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
