/**
 * StatusMessage - 상태에 따른 메인 메시지 표시
 */
export function StatusMessage({ status, isLoading }) {
  const messageMap = {
    '검토중': {
      title: '샘플 보정 가능 여부를 확인 중이에요',
      description: '업로드하신 샘플을 검토하고 있습니다. 잠시만 기다려주세요.',
      icon: 'fa-hourglass-half',
    },
    '완료': {
      title: '샘플 검토가 완료되었어요',
      description: '보정 결과를 확인하러 가볼까요?',
      icon: 'fa-check-circle',
    },
    '대기': {
      title: '검토 준비 중이에요',
      description: '샘플 검토를 곧 시작하겠습니다.',
      icon: 'fa-clock',
    },
    '오류': {
      title: '문제가 발생했습니다',
      description: '카카오톡으로 문의해주세요.',
      icon: 'fa-exclamation-circle',
    },
  };

  const message = messageMap[status] || messageMap['검토중'];

  if (isLoading) {
    return (
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-800 rounded-full mb-6">
          <i className="fa-solid fa-spinner text-white text-3xl loading-spinner"></i>
        </div>
        <h1 className="text-3xl text-neutral-900 mb-4">데이터를 불러오는 중이에요</h1>
        <p className="text-lg text-neutral-600">잠시만 기다려주세요.</p>
      </div>
    );
  }

  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-800 rounded-full mb-6">
        <i className={`fa-solid ${message.icon} text-white text-3xl`}></i>
      </div>
      <h1 data-field="mainTitle" className="text-3xl text-neutral-900 mb-4">
        {message.title}
      </h1>
      <p data-field="mainDescription" className="text-lg text-neutral-600">
        {message.description}
      </p>
    </div>
  );
}
