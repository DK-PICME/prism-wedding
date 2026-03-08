import { PrismHeader } from '../components/PrismHeader';
import { PrismFooter } from '../components/PrismFooter';

export const SettingsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <PrismHeader activeNav="settings" />

      <main className="pt-[73px]">
        <div className="px-8 py-8">
          <div className="max-w-[1376px] mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl text-neutral-900 mb-2">설정</h1>
              <p className="text-neutral-600">계정, 알림, 다운로드 설정 등을 관리하세요</p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-1">
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                  <div className="text-center mb-6">
                    <img
                      src="https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=4782"
                      alt="User"
                      className="w-24 h-24 rounded-full border-4 border-neutral-200 mx-auto mb-4"
                    />
                    <h3 className="text-xl text-neutral-900 mb-1">웨딩 스튜디오</h3>
                    <p className="text-neutral-600 text-sm">wedding@example.com</p>
                    <button className="mt-3 px-4 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg text-sm transition-colors">
                      <i className="fa-solid fa-camera mr-2"></i>아바타 변경
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">이름</label>
                      <input type="text" defaultValue="웨딩 스튜디오" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500" />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">이메일</label>
                      <input type="email" defaultValue="wedding@example.com" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500" />
                    </div>
                    <button className="w-full px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg transition-colors">
                      프로필 저장
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-span-2 space-y-6">
                <div className="bg-white border border-neutral-200 rounded-2xl">
                  <div className="border-b border-neutral-200 p-6">
                    <h2 className="text-xl text-neutral-900">로그인 및 보안</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg text-neutral-900">연결된 계정</h3>
                          <p className="text-sm text-neutral-600">소셜 로그인 계정을 관리하세요</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-neutral-600 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs">N</span>
                            </div>
                            <div>
                              <div className="text-neutral-900">네이버</div>
                              <div className="text-sm text-neutral-600">naver_user@naver.com</div>
                            </div>
                          </div>
                          <button className="px-3 py-1 text-sm border border-neutral-300 hover:bg-neutral-50 rounded">연결 해제</button>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-neutral-400 rounded-lg flex items-center justify-center">
                              <i className="fa-solid fa-envelope text-white text-xs"></i>
                            </div>
                            <div>
                              <div className="text-neutral-900">이메일</div>
                              <div className="text-sm text-neutral-600">wedding@example.com</div>
                            </div>
                          </div>
                          <span className="px-3 py-1 text-sm bg-neutral-100 text-neutral-600 rounded">기본 계정</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg text-neutral-900 mb-3">비밀번호 변경</h3>
                      <div className="space-y-3">
                        <input type="password" placeholder="현재 비밀번호" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500" />
                        <input type="password" placeholder="새 비밀번호" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500" />
                        <input type="password" placeholder="새 비밀번호 확인" className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500" />
                        <button className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg transition-colors">
                          비밀번호 변경
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-neutral-200 rounded-2xl">
                  <div className="border-b border-neutral-200 p-6">
                    <h2 className="text-xl text-neutral-900">알림 설정</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {[
                      { title: '업로드 완료 알림', desc: '사진 업로드가 완료되면 알림을 받습니다', checked: true },
                      { title: '주문 상태 변경 알림', desc: '주문 진행 상태가 변경되면 알림을 받습니다', checked: true },
                      { title: '다운로드 준비 알림', desc: '보정된 사진 다운로드가 준비되면 알림을 받습니다', checked: true },
                      { title: '마케팅 알림', desc: '새로운 기능 및 프로모션 정보를 받습니다', checked: false },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div>
                          <div className="text-neutral-900">{item.title}</div>
                          <div className="text-sm text-neutral-600">{item.desc}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={item.checked} />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-neutral-200 rounded-2xl">
                  <div className="border-b border-neutral-200 p-6">
                    <h2 className="text-xl text-neutral-900">다운로드 설정</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">기본 다운로드 폴더</label>
                      <div className="flex gap-2">
                        <input type="text" defaultValue="/Users/studio/Downloads/PrismStudio" className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500" />
                        <button className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors">
                          <i className="fa-solid fa-folder-open"></i>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">파일명 규칙</label>
                      <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500">
                        <option>주문번호_원본파일명</option>
                        <option>날짜_주문번호_파일명</option>
                        <option>원본파일명_보정완료</option>
                        <option>사용자정의</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">압축 형식</label>
                      <div className="flex gap-4">
                        {['ZIP', 'RAR', '압축 안함'].map((format, idx) => (
                          <label key={idx} className="flex items-center gap-2">
                            <input type="radio" name="compression" defaultChecked={idx === 0} className="w-4 h-4" />
                            <span className="text-neutral-900">{format}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-neutral-200 rounded-2xl">
                  <div className="border-b border-neutral-200 p-6">
                    <h2 className="text-xl text-neutral-900">언어 및 테마</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">언어</label>
                      <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500">
                        <option>한국어</option>
                        <option>English</option>
                        <option>日本語</option>
                        <option>中文</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-neutral-700 mb-2">테마</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['라이트', '다크', '자동'].map((theme, idx) => (
                          <label key={idx} className="flex items-center gap-2 p-3 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                            <input type="radio" name="theme" defaultChecked={idx === 0} className="w-4 h-4" />
                            <span className="text-neutral-900">{theme}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
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
