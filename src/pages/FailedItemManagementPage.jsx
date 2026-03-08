import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';

export const FailedItemManagementPage = () => {
  const failedItems = [
    { id: 1, file: 'IMG_001.jpg', status: 'failed', reason: '파일 손상', uploadDate: '2025-01-20 14:30' },
    { id: 2, file: 'IMG_002.jpg', status: 'failed', reason: '파일 크기 초과', uploadDate: '2025-01-20 14:31' },
    { id: 3, file: 'IMG_003.jpg', status: 'failed', reason: '지원하지 않는 형식', uploadDate: '2025-01-20 14:32' },
    { id: 4, file: 'IMG_004.jpg', status: 'failed', reason: 'UTF-8 불가', uploadDate: '2025-01-20 14:33' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PrismHeader activeNav="order-list" />

      <main className="pt-[73px]">
        <div className="px-8 py-8">
          <div className="max-w-[1376px] mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl text-neutral-900 mb-2">실패 항목 관리</h1>
                <p className="text-neutral-600">업로드에 실패한 항목들을 관리하고 재시도하세요</p>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors text-sm">
                  <i className="fa-solid fa-redo"></i>
                  선택 항목 재시도
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors text-sm">
                  <i className="fa-solid fa-trash"></i>
                  삭제
                </button>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"></i>
                    <input
                      type="text"
                      placeholder="파일명 검색..."
                      className="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <select className="px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white text-neutral-700">
                  <option>모든 사유</option>
                  <option>파일 손상</option>
                  <option>파일 크기 초과</option>
                  <option>지원하지 않는 형식</option>
                  <option>UTF-8 불가</option>
                </select>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200">
                      <th className="text-left px-6 py-4">
                        <input type="checkbox" className="w-4 h-4" />
                      </th>
                      <th className="text-left px-6 py-4 text-sm text-neutral-600">파일명</th>
                      <th className="text-left px-6 py-4 text-sm text-neutral-600">상태</th>
                      <th className="text-left px-6 py-4 text-sm text-neutral-600">실패 사유</th>
                      <th className="text-left px-6 py-4 text-sm text-neutral-600">업로드 시간</th>
                      <th className="text-right px-6 py-4 text-sm text-neutral-600">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failedItems.map((item) => (
                      <tr key={item.id} className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors">
                        <td className="px-6 py-4">
                          <input type="checkbox" className="w-4 h-4" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-neutral-900 font-medium">{item.file}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm">
                            <i className="fa-solid fa-circle-xmark"></i>
                            실패
                          </span>
                        </td>
                        <td className="px-6 py-4 text-neutral-600">{item.reason}</td>
                        <td className="px-6 py-4 text-neutral-600 text-sm">{item.uploadDate}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button className="px-3 py-1 text-sm bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors">
                              <i className="fa-solid fa-redo mr-1"></i>
                              재시도
                            </button>
                            <button className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200">
                <div className="text-sm text-neutral-600">
                  총 <span className="text-neutral-900">4</span>개 실패 항목
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-3 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    <i className="fa-solid fa-chevron-left text-neutral-600"></i>
                  </button>
                  <button className="px-4 py-2 bg-neutral-900 text-white rounded-lg">1</button>
                  <button className="px-3 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors">
                    <i className="fa-solid fa-chevron-right text-neutral-600"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex gap-4">
                <i className="fa-solid fa-lightbulb text-blue-600 text-lg mt-0.5"></i>
                <div>
                  <h3 className="text-neutral-900 font-medium mb-2">업로드 실패 원인</h3>
                  <ul className="text-sm text-neutral-600 space-y-1">
                    <li>• 파일이 손상되었거나 열 수 없는 경우</li>
                    <li>• 파일 크기가 허용된 용량(10MB)을 초과한 경우</li>
                    <li>• JPG, PNG 등 지원하지 않는 형식의 경우</li>
                    <li>• 파일명에 UTF-8 인코딩 불가능한 문자가 포함된 경우</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PrismFooter />
    </div>
  );
};
