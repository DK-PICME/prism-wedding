import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

/**
 * StepItem - 진행 상태 아이템
 */
function StepItem({ number, title, description, status, isLocked }) {
  const statusMap = {
    '대기중': { bgClass: 'bg-neutral-100', textClass: 'text-neutral-800' },
    '진행중': { bgClass: 'bg-neutral-900', textClass: 'text-white' },
    '완료': { bgClass: 'bg-green-600', textClass: 'text-white' },
    '잠김': { bgClass: 'bg-neutral-100', textClass: 'text-neutral-500' },
  };

  const style = statusMap[status] || statusMap['대기중'];

  return (
    <div className={`flex items-center justify-between py-4 border-b border-neutral-100 ${isLocked ? 'opacity-50' : ''}`}>
      <div className="flex items-center space-x-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isLocked ? 'bg-neutral-200' : 'bg-neutral-300'
          }`}
        >
          <span className={`text-sm ${isLocked ? 'text-neutral-400' : 'text-neutral-600'}`}>{number}</span>
        </div>
        <div>
          <h3 className={`${isLocked ? 'text-neutral-500' : 'text-neutral-900'}`}>{title}</h3>
          <p className={`text-sm ${isLocked ? 'text-neutral-400' : 'text-neutral-600'}`}>{description}</p>
        </div>
      </div>
      <span className={`px-3 py-1 ${style.bgClass} ${style.textClass} text-sm rounded-full`}>{status}</span>
    </div>
  );
}

/**
 * CurrentStatusPage - 고유 URL 진입 및 현재 상태 확인 페이지 (STEP 4)
 */
export function CurrentStatusPage() {
  const [steps] = useState([
    {
      number: 1,
      title: '샘플 접수',
      description: '샘플 사진 업로드 대기 중',
      status: '대기중',
      isLocked: false,
    },
    {
      number: 2,
      title: '샘플 결과 확인',
      description: '샘플 접수 후 이용 가능',
      status: '잠김',
      isLocked: true,
    },
    {
      number: 3,
      title: '본보정 업로드',
      description: '샘플 승인 후 이용 가능',
      status: '잠김',
      isLocked: true,
    },
    {
      number: 4,
      title: '본보정 결과 확인',
      description: '본보정 완료 후 이용 가능',
      status: '잠김',
      isLocked: true,
    },
  ]);

  const handleStartUpload = () => {
    alert('샘플 업로드 페이지로 이동합니다.');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header status="업로드 가능" currentStep={0} />

      <main id="main" className="bg-neutral-50 flex-1">
        <div className="max-w-screen-xl mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto">
            {/* 페이지 제목 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl text-neutral-900 mb-4">현재 진행 상황</h1>
              <p className="text-lg text-neutral-600">고유 URL로 접속하신 프로젝트의 현재 상태를 확인하세요.</p>
            </div>

            {/* 프로젝트 정보 */}
            <div className="bg-white rounded-lg border border-neutral-200 p-8 mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-clock text-neutral-600 text-lg"></i>
                </div>
                <div>
                  <h2 className="text-xl text-neutral-900">프로젝트 ID: #PRS-2025-001</h2>
                  <p className="text-neutral-600">생성일: 2025년 1월 15일</p>
                </div>
              </div>

              {/* 진행 상태 리스트 */}
              <div className="space-y-0">
                {steps.map((step) => (
                  <StepItem
                    key={step.number}
                    number={step.number}
                    title={step.title}
                    description={step.description}
                    status={step.status}
                    isLocked={step.isLocked}
                  />
                ))}
              </div>
            </div>

            {/* 다음 단계 안내 */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 mb-8">
              <div className="flex items-start space-x-3">
                <i className="fa-solid fa-info-circle text-neutral-600 text-lg mt-1"></i>
                <div>
                  <h3 className="text-neutral-900 mb-2">다음 단계 안내</h3>
                  <p className="text-neutral-800 mb-3">샘플 보정을 위해 사진 1장과 요청사항을 업로드해주세요.</p>
                  <ul className="text-sm text-neutral-700 space-y-1">
                    <li>• 샘플 사진은 1장만 업로드 가능합니다</li>
                    <li>• 요청사항을 상세히 작성해주시면 더 정확한 보정이 가능합니다</li>
                    <li>• 샘플 결과 확인 후 본보정 단계로 진행됩니다</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 시작 버튼 */}
            <div className="text-center">
              <button
                onClick={handleStartUpload}
                className="bg-neutral-900 text-white px-8 py-3 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <i className="fa-solid fa-upload mr-2"></i>
                샘플 업로드 시작하기
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
