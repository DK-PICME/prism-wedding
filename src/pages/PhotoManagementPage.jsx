import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';

export const PhotoManagementPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <PrismHeader activeNav="photo-management" />

      <main className="pt-[73px]">
        <div className="px-8 py-8">
          <div className="max-w-[1376px] mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl text-neutral-900 mb-2">김민수 & 박지영 웨딩</h1>
                <p className="text-neutral-600">주문번호: ORD-2025-0122-4782</p>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors text-sm">
                  <i className="fa-solid fa-upload"></i>
                  사진 추가
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors text-sm">
                  <i className="fa-solid fa-filter"></i>
                  필터
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: '총 사진', count: 150, icon: 'fa-images' },
                { label: '업로드 완료', count: 128, icon: 'fa-check-circle' },
                { label: '업로드 중', count: 22, icon: 'fa-spinner' },
                { label: '실패', count: 0, icon: 'fa-circle-xmark' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white border border-neutral-200 rounded-xl p-4">
                  <div className="text-2xl text-neutral-900 mb-1">{stat.count}</div>
                  <div className="text-sm text-neutral-600">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl text-neutral-900">사진 목록</h2>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-neutral-900 text-white transition-colors">
                    <i className="fa-solid fa-grid-2"></i>
                    그리드
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors">
                    <i className="fa-solid fa-list"></i>
                    목록
                  </button>
                </div>
              </div>

              <div className="border-2 border-dashed border-neutral-300 rounded-xl p-12 text-center mb-6 hover:border-neutral-400 transition-colors">
                <div className="flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mx-auto mb-4">
                  <i className="fa-solid fa-cloud-arrow-up text-neutral-500 text-2xl"></i>
                </div>
                <h3 className="text-lg text-neutral-900 mb-2">사진을 드래그해서 업로드하세요</h3>
                <p className="text-neutral-600 mb-4">JPG, PNG 파일을 지원합니다 (최대 10MB)</p>
                <button className="px-6 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors">
                  파일 선택
                </button>
              </div>

              <div className="grid grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div key={idx} className="relative group cursor-pointer">
                    <div className="aspect-square bg-neutral-200 rounded-lg overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-neutral-300 to-neutral-400 flex items-center justify-center">
                        <span className="text-neutral-600 text-sm">IMG_{String(idx + 1).padStart(3, '0')}.jpg</span>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all"></div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button className="p-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors">
                        <i className="fa-solid fa-eye text-xs"></i>
                      </button>
                      <button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-neutral-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      선택됨
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <PrismFooter />
    </div>
  );
};
