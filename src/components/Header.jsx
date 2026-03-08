import { getStatusBadgeStyle } from '../utils/helpers';

/**
 * Header - 상단 네비게이션 및 진행 상태 표시
 */
export function Header({ status = '진행중', currentStep = 1 }) {

  return (
    <header id="header" className="bg-white border-b border-neutral-200 px-6 py-4">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-neutral-800 rounded flex items-center justify-center">
              <i className="fa-solid fa-prism text-white text-sm"></i>
            </div>
            <span className="text-xl text-neutral-900">프리즘 스튜디오</span>
          </div>
          <div className="flex items-center space-x-2">
            <span data-field="headerStatus" className="px-3 py-1 bg-neutral-100 text-neutral-800 text-sm rounded-full">
              {status}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            {/* Step 1 */}
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-neutral-900' : 'bg-neutral-200'
              }`}>
                <span className={`text-xs ${currentStep >= 1 ? 'text-white' : 'text-neutral-400'}`}>
                  1
                </span>
              </div>
              <span className={`text-sm ${currentStep >= 1 ? 'text-neutral-900' : 'text-neutral-400'}`}>
                샘플 접수
              </span>
            </div>
            <div className="w-12 h-px bg-neutral-300"></div>

            {/* Step 2 */}
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-neutral-900' : 'bg-neutral-200'
              }`}>
                <span className={`text-xs ${currentStep >= 2 ? 'text-white' : 'text-neutral-400'}`}>
                  2
                </span>
              </div>
              <span className={`text-sm ${currentStep >= 2 ? 'text-neutral-900' : 'text-neutral-400'}`}>
                샘플 결과 확인
              </span>
            </div>
            <div className="w-12 h-px bg-neutral-200"></div>

            {/* Step 3 */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-neutral-200 rounded-full flex items-center justify-center">
                <span className="text-xs text-neutral-400">3</span>
              </div>
              <span className="text-sm text-neutral-400">본보정 업로드</span>
            </div>
            <div className="w-12 h-px bg-neutral-200"></div>

            {/* Step 4 */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-neutral-200 rounded-full flex items-center justify-center">
                <span className="text-xs text-neutral-400">4</span>
              </div>
              <span className="text-sm text-neutral-400">본보정 결과 확인</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
