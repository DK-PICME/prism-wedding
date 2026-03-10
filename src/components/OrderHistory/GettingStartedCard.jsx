import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function GettingStartedCard() {
  const navigate = useNavigate();

  const handleSampleRevision = () => {
    navigate('/sample-revision-request');
  };

  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 mt-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-white border border-neutral-200 rounded-xl flex-shrink-0">
            <i className="fa-solid fa-lightbulb text-neutral-600 text-xl"></i>
          </div>
          <div>
            <h3 className="text-lg text-neutral-900 mb-1">샘플 보정 요청</h3>
            <p className="text-sm text-neutral-600">샘플보정으로 프리즘 스튜디오의 보정 서비스 결과물을 확인해보세요.</p>
          </div>
        </div>
        <button 
          onClick={handleSampleRevision}
          className="px-6 py-2 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-900 rounded-lg transition-colors whitespace-nowrap"
        >
          샘플 보정 요청
        </button>
      </div>
    </div>
  );
}
