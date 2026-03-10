import { useNavigate } from 'react-router-dom';
import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';

export const ServiceIntroPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col">
      <PrismHeader activeNav="service-intro" />

      <main className="flex-1 pt-[73px]">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-neutral-900 via-neutral-800 to-blue-900 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex items-center">
            <div className="text-white max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                완벽한 순간을<br />
                <span className="text-blue-400">AI로 완성하세요</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-200">
                전문 웨딩 포토그래퍼가 선택한 AI 보정 서비스
              </p>
              <button
                onClick={() => navigate('/photo-management')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                무료 체험 시작하기
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-neutral-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">왜 Prism Studio인가요?</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">AI 기술과 전문가의 노하우가 만나 완벽한 결과물을 만들어냅니다</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <i className="fa-solid fa-wand-magic-sparkles text-3xl text-blue-600 dark:text-blue-400"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI 보정</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">최첨단 AI 기술로 자연스럽고 빠른 보정을 제공합니다. 피부톤, 조명, 색감을 완벽하게 조정합니다.</p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                  <i className="fa-solid fa-layer-group text-3xl text-green-600 dark:text-green-400"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">배치 처리</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">수백 장의 사진을 일관된 스타일로 한 번에 처리합니다. 시간을 절약하고 품질을 보장합니다.</p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                  <i className="fa-solid fa-award text-3xl text-purple-600 dark:text-purple-400"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">품질 보장</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">전문가의 최종 검수를 거쳐 완벽한 결과물을 제공합니다. 100% 만족도를 보장합니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-gray-50 dark:bg-neutral-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">합리적인 가격</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">필요에 맞는 플랜을 선택하세요</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">베이직</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">₩50,000</span>
                  <span className="text-gray-600 dark:text-gray-400">/100장</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <i className="fa-solid fa-check text-green-500"></i>
                    <span className="text-gray-600 dark:text-gray-400">AI 자동 보정</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <i className="fa-solid fa-check text-green-500"></i>
                    <span className="text-gray-600 dark:text-gray-400">24시간 내 완성</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <i className="fa-solid fa-check text-green-500"></i>
                    <span className="text-gray-600 dark:text-gray-400">고화질 다운로드</span>
                  </li>
                </ul>
                <button className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-900 dark:text-white py-3 rounded-lg font-semibold transition-colors">
                  선택하기
                </button>
              </div>

              <div className="bg-blue-600 text-white rounded-2xl p-8 transform scale-105 shadow-xl">
                <div className="text-center mb-4">
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">인기</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">프로</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">₩120,000</span>
                  <span className="text-blue-200">/300장</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <i className="fa-solid fa-check text-green-300"></i>
                    <span>AI + 전문가 보정</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <i className="fa-solid fa-check text-green-300"></i>
                    <span>12시간 내 완성</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <i className="fa-solid fa-check text-green-300"></i>
                    <span>무제한 수정</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <i className="fa-solid fa-check text-green-300"></i>
                    <span>전용 매니저</span>
                  </li>
                </ul>
                <button className="w-full bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                  선택하기
                </button>
              </div>

              <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">엔터프라이즈</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">맞춤</span>
                  <span className="text-gray-600 dark:text-gray-400">견적</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <i className="fa-solid fa-check text-green-500"></i>
                    <span className="text-gray-600 dark:text-gray-400">무제한 보정</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <i className="fa-solid fa-check text-green-500"></i>
                    <span className="text-gray-600 dark:text-gray-400">API 연동</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <i className="fa-solid fa-check text-green-500"></i>
                    <span className="text-gray-600 dark:text-gray-400">전담팀 배정</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <i className="fa-solid fa-check text-green-500"></i>
                    <span className="text-gray-600 dark:text-gray-400">24/7 지원</span>
                  </li>
                </ul>
                <button className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-900 dark:text-white py-3 rounded-lg font-semibold transition-colors">
                  문의하기
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              지금 시작하고 완벽한 결과를 경험하세요
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              첫 10장은 무료로 체험해보세요. 만족하지 않으면 100% 환불해드립니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/photo-management')}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg"
              >
                무료 체험 시작
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all">
                상담 예약하기
              </button>
            </div>
          </div>
        </section>
      </main>

      <PrismFooter />
    </div>
  );
};
