import React from 'react';

export default function FeatureCards() {
  const features = [
    {
      id: 'quick-order',
      icon: 'fa-rocket',
      title: '빠른 주문 생성',
      description: '사진을 업로드하고 간단한 정보만 입력하면 주문이 완료됩니다.'
    },
    {
      id: 'realtime-status',
      icon: 'fa-clock',
      title: '실시간 진행 상황',
      description: '주문의 모든 단계를 실시간으로 확인하고 알림을 받을 수 있습니다.'
    },
    {
      id: 'expert-support',
      icon: 'fa-headset',
      title: '전문가 지원',
      description: '궁금한 점이 있으시면 언제든지 고객 지원팀에 문의하세요.'
    }
  ];

  const handleLearnMore = (featureId) => {
    // TODO: Implement learn more logic for each feature
  };

  const handleContact = () => {
    // TODO: Navigate to contact page
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {features.map(feature => (
        <div key={feature.id} className="bg-white border border-neutral-200 rounded-2xl p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-neutral-100 rounded-xl mb-4">
            <i className={`fa-solid ${feature.icon} text-neutral-600 text-2xl`}></i>
          </div>
          <h3 className="text-lg text-neutral-900 mb-2">{feature.title}</h3>
          <p className="text-sm text-neutral-600 mb-4">{feature.description}</p>
          <button 
            onClick={() => feature.id === 'expert-support' ? handleContact() : handleLearnMore(feature.id)}
            className="text-sm text-neutral-900 hover:underline"
          >
            {feature.id === 'expert-support' ? '문의하기' : '자세히 보기'} →
          </button>
        </div>
      ))}
    </div>
  );
}
