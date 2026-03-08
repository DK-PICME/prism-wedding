import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';

export const NotificationCenterPage = () => {
  const notifications = [
    { id: 1, type: 'upload', title: '사진 업로드가 완료되었습니다', desc: 'IMG_wedding_015.jpg 외 3개 파일이 성공적으로 업로드되었습니다.', time: '2분 전', read: true },
    { id: 2, type: 'order', title: '새로운 주문이 생성되었습니다', desc: 'ORD-2025-0123 주문이 생성되었습니다. 김민수 & 박지영 웨딩', time: '15분 전', read: false },
    { id: 3, type: 'download', title: '보정 완료 - 다운로드 준비됨', desc: '김민수 & 박지영 웨딩의 150장 사진이 보정 완료되었습니다.', time: '1시간 전', read: false },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PrismHeader activeNav="photo-management" />

      <main className="pt-[73px]">
        <div className="px-8 py-8">
          <div className="max-w-[1376px] mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl text-neutral-900 mb-2">알림 센터</h1>
                <p className="text-neutral-600">업로드, 주문, 다운로드 관련 알림을 확인하고 관리하세요</p>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors text-sm">
                  <i className="fa-solid fa-check-double"></i>
                  모두 읽음
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors text-sm">
                  <i className="fa-solid fa-trash"></i>
                  전체 삭제
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-neutral-200 rounded-xl p-4">
                <div className="text-2xl text-neutral-900 mb-1">12</div>
                <div className="text-sm text-neutral-600">읽지 않음</div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4">
                <div className="text-2xl text-neutral-900 mb-1">5</div>
                <div className="text-sm text-neutral-600">업로드 알림</div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4">
                <div className="text-2xl text-neutral-900 mb-1">3</div>
                <div className="text-sm text-neutral-600">주문 알림</div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4">
                <div className="text-2xl text-neutral-900 mb-1">4</div>
                <div className="text-sm text-neutral-600">다운로드 알림</div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl">
              <div className="border-b border-neutral-200 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl text-neutral-900">업로드 알림</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-600">5개</span>
                    <button className="p-1 hover:bg-neutral-100 rounded">
                      <i className="fa-solid fa-chevron-down text-neutral-400"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`flex items-start gap-4 p-4 border border-neutral-200 rounded-lg ${notif.read ? 'bg-white' : 'bg-neutral-50'}`}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white ${notif.type === 'upload' ? 'bg-neutral-600' : notif.type === 'order' ? 'bg-blue-600' : 'bg-green-600'}`}>
                      <i className={`fa-solid ${notif.type === 'upload' ? 'fa-check' : notif.type === 'order' ? 'fa-shopping-cart' : 'fa-download'}`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="text-neutral-900 mb-1">{notif.title}</div>
                      <div className="text-sm text-neutral-600 mb-2">{notif.desc}</div>
                      <div className="text-xs text-neutral-500">{notif.time}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 text-xs bg-neutral-100 hover:bg-neutral-200 rounded">보기</button>
                      <button className="p-1 hover:bg-neutral-200 rounded">
                        <i className="fa-solid fa-times text-neutral-400 text-xs"></i>
                      </button>
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
